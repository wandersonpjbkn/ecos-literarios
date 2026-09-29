<template>
  <div class="area-section">
    <SectionHeader title="Membros">{{ summary }}</SectionHeader>

    <AppNotice v-if="error" :text="error" retry @retry="fetchUsers" />

    <BaseSpinner v-if="loading">
      <p>Carregando membros…</p>
    </BaseSpinner>

    <EmptyState
      v-else-if="!error && users.length === 0"
      title="Ninguém entrou ainda"
      text="Quem entra pelo link do e-mail aparece aqui, como Visitante."
    />

    <ul v-else-if="users.length" ref="list" class="members-list panel-box">
      <li
        v-for="user in visibleUsers"
        :key="user._id"
        class="member-row panel-row"
        :class="{ 'member-row--open': openId === user._id }"
        tabindex="-1"
        data-list-item
        @keydown.escape="openId === user._id && closeAccess(user)"
      >
        <div class="member-info">
          <span class="member-name">
            {{ user.name }}
            <AppBadge v-if="isSelf(user)">você</AppBadge>
            <AppBadge v-else-if="user.status === 'suspended'" tone="alert">suspensa</AppBadge>
          </span>
          <span class="member-email">{{ user.email }}</span>
        </div>

        <span class="member-since">Desde {{ formatDate(user.created_at) }}</span>

        <div class="member-role">
          <InfoTip v-if="isSelf(user)" class="member-role__self" text="Só outro Administrador muda o seu nível.">
            <span class="visually-hidden">Seu nível: </span>{{ roleLabel(user.role) }}
          </InfoTip>
          <AppSelect
            v-else
            :model-value="user.role"
            :options="ROLE_OPTIONS"
            :label="`Nível de permissão de ${user.name}`"
            @update:model-value="onRoleChange(user, $event)"
          />
        </div>

        <AppButton
          v-if="!isSelf(user)"
          :id="`acesso-botao-${user._id}`"
          size="md"
          class="member-manage"
          :aria-expanded="openId === user._id"
          :aria-controls="`acesso-${user._id}`"
          @click="toggleAccess(user)"
        >
          Gerenciar acesso<span class="visually-hidden">{{ ' ' }}de {{ user.name }}</span>
        </AppButton>

        <div v-if="openId === user._id" :id="`acesso-${user._id}`" class="member-access">
          <AppButton size="md" @click="askAccess(user, user.status === 'suspended' ? 'reactivate' : 'suspend')">
            {{ user.status === 'suspended' ? 'Reativar a conta' : 'Suspender a conta' }}
          </AppButton>
          <!-- Apart from suspending, like removing in Autores e gêneros. -->
          <span class="member-access__remove">
            <AppButton variant="danger" size="md" @click="askAccess(user, 'remove')">
              <BaseIcon name="trash" aria-hidden="true" />
              Remover a conta
            </AppButton>
          </span>
        </div>
      </li>
    </ul>

    <ListFooter
      v-if="users.length"
      :shown="visibleUsers.length"
      :total="users.length"
      :next-batch="nextBatch"
      @more="more(list)"
    />

    <ConfirmModal
      v-model="confirm.open"
      :title="confirm.title"
      :description="confirm.description"
      :confirm-label="`Mudar para ${roleLabel(confirm.newRole)}`"
      busy-label="Mudando…"
      :error="confirm.error"
      :loading="confirm.loading"
      @confirm="applyRoleChange"
      @cancel="cancelRoleChange"
    />

    <ConfirmModal
      v-model="access.open"
      :title="accessCopy.title"
      :description="accessCopy.description"
      :confirm-label="accessCopy.confirm"
      :busy-label="accessCopy.busy"
      :destructive="access.kind === 'remove'"
      :error="access.error"
      :loading="access.loading"
      :return-focus="() => list?.querySelector<HTMLElement>('[data-list-item]')"
      @confirm="applyAccess"
      @cancel="access.open = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import { roleLabel } from '@/data/roles'
import type { AccountStatus, ApiUser } from '@/types'

import { useAuthStore } from '@/stores'

import { useErrorReporter, useToast } from '@/composables'
import { errorText } from '@/composables/apiError'
import { getMembers, removeMember, setMemberRole, setMemberStatus } from '@/composables/useApi'
import { useLoadMore } from '@/composables/useLoadMore'

import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppNotice from '@/components/ui/AppNotice.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import InfoTip from '@/components/ui/InfoTip.vue'
import ListFooter from '@/components/ui/ListFooter.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'

// The select stays on the current level until the change is confirmed: it only shows what the server holds.
const ROLE_OPTIONS: { label: string; value: ApiUser['role'] }[] = [
  { label: roleLabel('viewer'), value: 'viewer' },
  { label: roleLabel('editor'), value: 'editor' },
  { label: roleLabel('admin'), value: 'admin' },
]

type AccessKind = 'suspend' | 'reactivate' | 'remove'

const DONE: Record<AccessKind, (name: string) => string> = {
  suspend: (name) => `A conta de ${name} está suspensa.`,
  reactivate: (name) => `A conta de ${name} foi reativada.`,
  remove: (name) => `A conta de ${name} foi removida.`,
}

const authStore = useAuthStore()

const users = ref<ApiUser[]>([])

const { visible: visibleUsers, nextBatch, more } = useLoadMore(users, { name: 'painel-membros' })

const list = ref<HTMLElement | null>(null)

const loading = ref(false)
const error = ref('')

const confirm = reactive({
  open: false,
  loading: false,
  title: '',
  description: '',
  error: '',
  userId: '',
  newRole: '' as ApiUser['role'],
})

// Which row has its access actions open; one at a time, like editing in Autores e gêneros.
const openId = ref<string | null>(null)

const access = reactive({
  open: false,
  loading: false,
  error: '',
  kind: 'suspend' as AccessKind,
  userId: '',
  name: '',
})

const summary = computed(() => {
  const intro = 'Quem entrou na plataforma e o que cada pessoa pode fazer.'
  const count = users.value.length
  if (!count) return intro
  return `${intro} ${count === 1 ? '1 pessoa entrou' : `${count} pessoas entraram`} até agora.`
})

const accessCopy = computed(() => {
  const name = access.name
  if (access.kind === 'remove') {
    return {
      title: `Remover a conta de ${name}?`,
      description: `Os livros que ${name} mencionou continuam no acervo, com o nome. Se entrar de novo pelo mesmo e-mail, ${name} volta como Visitante.`,
      confirm: 'Remover a conta',
      busy: 'Removendo…',
    }
  }
  if (access.kind === 'reactivate') {
    return {
      title: `Reativar a conta de ${name}?`,
      description: `${name} volta a entrar com o mesmo nível.`,
      confirm: 'Reativar a conta',
      busy: 'Reativando…',
    }
  }
  return {
    title: `Suspender a conta de ${name}?`,
    description: `${name} não entra mais até a conta ser reativada. Os livros e a lista de leitura continuam.`,
    confirm: 'Suspender a conta',
    busy: 'Suspendendo…',
  }
})

const isSelf = (user: ApiUser) => user._id === authStore.user?._id

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
}

const fetchUsers = async () => {
  loading.value = true
  error.value = ''

  try {
    users.value = await getMembers()
  } catch (e) {
    error.value = errorText(e, 'Não foi possível carregar os membros. Tente de novo.')
    useErrorReporter().captureException(e, { context: 'AdminMembers.fetchUsers' })
    console.error('[AdminMembers]', e)
  } finally {
    loading.value = false
  }
}

const onRoleChange = (user: ApiUser, newRole: string) => {
  if (newRole === user.role) return
  confirm.userId = user._id
  confirm.newRole = newRole as ApiUser['role']
  confirm.title = `Mudar o nível de ${user.name}?`
  confirm.description = `De ${roleLabel(user.role)} para ${roleLabel(newRole)}.`
  confirm.error = ''
  confirm.open = true
}

// A refused change stays in the dialog, where the admin acted; confirming again retries it.
const applyRoleChange = async () => {
  confirm.loading = true
  confirm.error = ''

  try {
    await setMemberRole(confirm.userId, confirm.newRole)

    const idx = users.value.findIndex((u) => u._id === confirm.userId)
    if (idx !== -1) users.value[idx]!.role = confirm.newRole
    useToast().show(`O nível de ${users.value[idx]?.name} agora é ${roleLabel(confirm.newRole)}.`)

    confirm.open = false
  } catch (e) {
    confirm.error = errorText(e, 'Não foi possível mudar o nível. Tente de novo.')
    useErrorReporter().captureException(e, { context: 'AdminMembers.applyRoleChange', userId: confirm.userId })
  } finally {
    confirm.loading = false
  }
}

const cancelRoleChange = () => {
  confirm.open = false
}

const toggleAccess = (user: ApiUser) => {
  openId.value = openId.value === user._id ? null : user._id
}

const closeAccess = (user: ApiUser) => {
  openId.value = null
  nextTick(() => document.getElementById(`acesso-botao-${user._id}`)?.focus())
}

// The dialog is teleported to the body, and its Cancelar closes it before the click gets here: not a click away.
const onDocumentClick = (e: MouseEvent) => {
  if (!openId.value) return
  if ((e.target as HTMLElement).closest('.member-row--open, .modal-overlay')) return
  openId.value = null
}

const askAccess = (user: ApiUser, kind: AccessKind) => {
  Object.assign(access, { kind, userId: user._id, name: user.name, error: '', open: true })
}

// Like the level: a refused change stays in the dialog, and confirming again retries it.
const applyAccess = async () => {
  access.loading = true
  access.error = ''

  try {
    if (access.kind === 'remove') {
      await removeMember(access.userId)
      users.value = users.value.filter((u) => u._id !== access.userId)
    } else {
      const status: AccountStatus = access.kind === 'suspend' ? 'suspended' : 'active'
      const updated = await setMemberStatus(access.userId, status)
      const idx = users.value.findIndex((u) => u._id === access.userId)
      if (idx !== -1) users.value[idx]!.status = updated.status
    }
    useToast().show(DONE[access.kind](access.name))
    openId.value = null
    access.open = false
  } catch (e) {
    access.error = errorText(e, 'Não foi possível mudar o acesso. Tente de novo.')
    useErrorReporter().captureException(e, { context: 'AdminMembers.applyAccess', userId: access.userId })
  } finally {
    access.loading = false
  }
}

let clickOutsideTimer: ReturnType<typeof setTimeout> | undefined

// Closes on a click away, like editing in Autores e gêneros; the timer lets the opening click pass first.
watch(openId, (id) => {
  document.removeEventListener('click', onDocumentClick)
  clearTimeout(clickOutsideTimer)
  if (id) clickOutsideTimer = setTimeout(() => document.addEventListener('click', onDocumentClick), 0)
})

onMounted(fetchUsers)

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  clearTimeout(clickOutsideTimer)
})
</script>

<style lang="scss" scoped>
.members-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.member-row {
  display: grid;
  grid-template-columns: 1fr auto minmax(var(--col-xl), auto) auto;
  align-items: center;
  gap: var(--space-4);
  min-height: var(--row-tall);
  padding-block: var(--space-3);
}

.member-info {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--space-1);
}

.member-name {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-ui);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-default);
}

.member-email,
.member-since {
  font-size: var(--font-size-meta);
  color: var(--color-text-subtle);
  overflow-wrap: anywhere;
}

.member-access {
  display: flex;
  flex-wrap: wrap;
  grid-column: 1 / -1;
  gap: var(--space-2);

  &__remove {
    display: flex;
    flex: 1 1 100%;
    padding-top: var(--space-2);
    border-top: 1px solid var(--color-border-default);
  }
}

.member-role {
  justify-self: end;

  &__self {
    font-size: var(--font-size-ui);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-default);
  }
}

@media (max-width: $bp-phone-max) {
  .member-row {
    grid-template-columns: 1fr;
    gap: var(--space-2);
    padding-block: var(--space-4);
  }

  .member-manage {
    justify-self: start;
  }

  .member-role {
    justify-self: start;

    :deep(.info-tip__bubble) {
      right: auto;
      left: 0;
    }
  }
}
</style>
