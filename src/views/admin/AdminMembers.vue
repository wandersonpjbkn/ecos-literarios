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
      <li v-for="user in visibleUsers" :key="user._id" class="member-row panel-row" tabindex="-1" data-list-item>
        <div class="member-info">
          <span class="member-name">
            {{ user.name }}
            <AppBadge v-if="user._id === authStore.user?._id">você</AppBadge>
          </span>
          <span class="member-email">{{ user.email }}</span>
        </div>

        <span class="member-since">Desde {{ formatDate(user.created_at) }}</span>

        <div class="member-role">
          <InfoTip
            v-if="user._id === authStore.user?._id"
            class="member-role__self"
            text="Só outro Administrador muda o seu nível."
          >
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
  </div>
</template>

<script lang="ts" setup>
import { errorText } from '@/composables/apiError'
import { roleLabel } from '@/data/roles'
import { computed, ref, onMounted, reactive } from 'vue'

import { useAuthStore } from '@/stores'
import { useErrorReporter, useToast } from '@/composables'
import { getMembers, setMemberRole } from '@/composables/useApi'
import { useLoadMore } from '@/composables/useLoadMore'
import ListFooter from '@/components/ListFooter.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import AppSelect from '@/components/AppSelect.vue'
import InfoTip from '@/components/InfoTip.vue'
import AppBadge from '@/components/AppBadge.vue'
import EmptyState from '@/components/EmptyState.vue'
import AppNotice from '@/components/AppNotice.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import type { ApiUser } from '@/types'

const authStore = useAuthStore()
const users = ref<ApiUser[]>([])
const list = ref<HTMLElement | null>(null)
const { visible: visibleUsers, nextBatch, more } = useLoadMore(users, { name: 'painel-membros' })
const loading = ref(false)
const error = ref('')

// The select stays on the current level until the change is confirmed: it only shows what the server holds.
const ROLE_OPTIONS: { label: string; value: ApiUser['role'] }[] = [
  { label: roleLabel('viewer'), value: 'viewer' },
  { label: roleLabel('editor'), value: 'editor' },
  { label: roleLabel('admin'), value: 'admin' },
]

const summary = computed(() => {
  const intro = 'Quem entrou na plataforma e o que cada pessoa pode fazer.'
  const count = users.value.length
  if (!count) return intro
  return `${intro} ${count === 1 ? '1 pessoa entrou' : `${count} pessoas entraram`} até agora.`
})

const confirm = reactive({
  open: false,
  loading: false,
  title: '',
  description: '',
  error: '',
  userId: '',
  newRole: '' as ApiUser['role'],
})

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

onMounted(fetchUsers)
</script>

<style lang="scss" scoped>
.members-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.member-row {
  display: grid;
  grid-template-columns: 1fr auto minmax(var(--col-xl), auto);
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

  .member-role {
    justify-self: start;

    :deep(.info-tip__bubble) {
      right: auto;
      left: 0;
    }
  }
}
</style>
