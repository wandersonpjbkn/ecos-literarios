<template>
  <div class="area-section">
    <SectionHeader title="Permissões"> O que cada nível pode fazer. Nada muda até você salvar. </SectionHeader>

    <AppNotice v-if="error" :text="error" retry @retry="fetchPermissions()" />

    <BaseSpinner v-if="loading">
      <p>Carregando permissões…</p>
    </BaseSpinner>

    <div v-else-if="permissions.length" class="permissions-grid">
      <section
        v-for="role in ROLES"
        :key="role"
        class="role-card panel-box"
        :class="{ 'is-editing': editingRole === role }"
        :aria-labelledby="`role-${role}`"
        :data-role="role"
      >
        <header class="role-card__header">
          <h3 :id="`role-${role}`" class="role-card__title">{{ roleLabel(role) }}</h3>

          <div class="role-card__actions">
            <AppButton
              v-if="editingRole !== role"
              size="md"
              data-edit
              :disabled="editingRole !== null"
              @click="startEditing(role)"
            >
              Editar<span class="visually-hidden">{{ ' ' }}{{ roleLabel(role) }}</span>
            </AppButton>
            <template v-else>
              <AppButton size="md" @click="cancelEditing">Cancelar</AppButton>
              <AppButton variant="primary" size="md" :disabled="!hasPendingChanges" @click="openConfirm">
                Salvar
              </AppButton>
            </template>
          </div>
        </header>

        <div class="role-card__body">
          <div v-for="resource in shownResources" :key="resource" class="resource-row panel-row">
            <template v-if="editingRole === role">
              <fieldset class="resource-row__edit">
                <legend class="resource-row__name">{{ resourceLabel(resource) }}</legend>
                <div class="resource-row__checks">
                  <CheckRow
                    v-for="action in actionsOf(resource)"
                    :key="action"
                    class="action-check"
                    :label="actionLabel(action)"
                    :checked="hasActionDraft(role, resource, action)"
                    :disabled="action === 'read' && readLocked(resource)"
                    @change="toggleDraft(resource, action)"
                  />
                </div>
                <p v-if="readLocked(resource)" class="resource-row__note">Quem cria, edita ou remove também vê.</p>
              </fieldset>
            </template>
            <template v-else>
              <span class="resource-row__allowed" :class="{ 'is-none': isNone(role, resource) }">
                {{ allowedText(role, resource) }}
              </span>
            </template>
          </div>
          <p class="resource-row resource-row--fixed panel-row">
            Mudar o nível de alguém: só Administrador (não muda aqui)
          </p>
        </div>
      </section>
    </div>

    <EmptyState v-else-if="!error" title="Não foi possível ver as permissões agora">
      <AppButton @click="fetchPermissions()">Tentar de novo</AppButton>
    </EmptyState>

    <ConfirmModal
      v-model="confirm.open"
      :title="`Salvar as permissões de ${roleLabel(editingRole ?? '')}?`"
      :description="`Vale para todo mundo que é ${roleLabel(editingRole ?? '')}.`"
      confirm-label="Salvar"
      :error="confirm.error"
      :loading="confirm.loading"
      :return-focus="() => editButtonOf(savedRole)"
      @confirm="applyChanges"
      @cancel="confirm.open = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick, onMounted, reactive } from 'vue'

import { roleLabel } from '@/data/roles'
import { joinWords } from '@/data/words'
import type { Role, Resource, Action, Permission } from '@/types'

import { useAuthStore, usePermissionsStore } from '@/stores'

import { useErrorReporter, useToast } from '@/composables'
import { errorText } from '@/composables/apiError'
import { getPermissions, savePermission } from '@/composables/useApi'

import AppButton from '@/components/ui/AppButton.vue'
import AppNotice from '@/components/ui/AppNotice.vue'
import CheckRow from '@/components/ui/CheckRow.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'

const ROLES: Role[] = ['admin', 'editor', 'viewer']
const RESOURCES: Resource[] = [
  'books',
  'users',
  'autores',
  'midias',
  'categorias',
  'subgeneros',
  'claim',
  'permissions',
]
const ACTIONS: Action[] = ['create', 'read', 'update', 'delete']
const WRITES: Action[] = ['create', 'update', 'delete']

const NOUN: Partial<Record<Resource, string>> = {
  books: 'livros',
  autores: 'autores',
  midias: 'formatos',
  categorias: 'gêneros',
  subgeneros: 'subgêneros',
}
const VERB: Record<Action, string> = { create: 'adicionar', read: 'ver', update: 'editar', delete: 'remover' }
const PHRASE: Partial<Record<Resource, Partial<Record<Action, string>>>> = {
  users: { read: 'ver a lista de membros' },
  claim: { update: 'vincular a própria conta a um nome do grupo', create: 'incluir um nome novo de pessoa do clube' },
}

const auth = useAuthStore()
const permissionsStore = usePermissionsStore()

const permissions = ref<Permission[]>([])
const configurable = ref<Partial<Record<Resource, Action[]>>>({})

const loading = ref(false)
const error = ref('')

const editingRole = ref<Role | null>(null)
const draft = ref<Map<Resource, Set<Action>>>(new Map())

const savedRole = ref<Role | null>(null)

const confirm = reactive({ open: false, loading: false, error: '' })

const shownResources = computed(() => RESOURCES.filter((resource) => actionsOf(resource).length > 0))

const hasPendingChanges = computed(() => {
  if (!editingRole.value) return false

  for (const resource of shownResources.value) {
    const original = stored(editingRole.value, resource)
    const draftActions = [...(draft.value.get(resource) ?? [])]

    if (original.length !== draftActions.length) return true
    if (original.some((a) => !draftActions.includes(a))) return true
  }

  return false
})

const resourceLabel = (r: string) =>
  ({
    books: 'Livros',
    users: 'Membros',
    autores: 'Autores',
    midias: 'Formatos',
    categorias: 'Gêneros',
    subgeneros: 'Subgêneros',
    claim: 'Vínculo',
    permissions: 'Permissões',
  })[r] ?? r

const actionLabel = (a: string) => ({ create: 'Criar', read: 'Ver', update: 'Editar', delete: 'Remover' })[a] ?? a

const actionsOf = (resource: Resource) => ACTIONS.filter((action) => configurable.value[resource]?.includes(action))

const stored = (role: Role, resource: Resource) =>
  (permissions.value.find((p) => p.role === role && p.resource === resource)?.actions ?? []).filter((action) =>
    actionsOf(resource).includes(action),
  )

const matrixOf = (role: Role) =>
  Object.fromEntries(permissions.value.filter((p) => p.role === role).map((p) => [p.resource, [...p.actions]]))

const hasAction = (role: Role, resource: Resource, action: Action) => stored(role, resource).includes(action)

const hasActionDraft = (role: Role, resource: Resource, action: Action) => {
  if (editingRole.value !== role) return hasAction(role, resource, action)
  return draft.value.get(resource)?.has(action) ?? false
}

const readLocked = (resource: Resource) =>
  actionsOf(resource).includes('read') && WRITES.some((action) => draft.value.get(resource)?.has(action))

const cardOf = (role: Role | null) => document.querySelector<HTMLElement>(`[data-role="${role}"]`)
const editButtonOf = (role: Role | null) => cardOf(role)?.querySelector<HTMLElement>('[data-edit]')

const startEditing = async (role: Role) => {
  editingRole.value = role

  const newDraft = new Map<Resource, Set<Action>>()
  for (const resource of shownResources.value) newDraft.set(resource, new Set(stored(role, resource)))
  draft.value = newDraft
  await nextTick()
  cardOf(role)?.querySelector<HTMLElement>('input:not(:disabled)')?.focus()
}

const cancelEditing = async () => {
  const role = editingRole.value
  editingRole.value = null
  draft.value = new Map()
  await nextTick()
  editButtonOf(role)?.focus()
}

const toggleDraft = (resource: Resource, action: Action) => {
  const set = draft.value.get(resource)
  if (!set) return

  if (set.has(action)) {
    if (action === 'read' && readLocked(resource)) return
    set.delete(action)
  } else {
    set.add(action)
    if (WRITES.includes(action) && actionsOf(resource).includes('read')) set.add('read')
  }

  draft.value = new Map(draft.value)
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

const allowedText = (role: Role, resource: Resource) => {
  const allowed = actionsOf(resource).filter((action) => hasAction(role, resource, action))
  const noun = NOUN[resource] ?? (PHRASE[resource] ? undefined : resourceLabel(resource).toLowerCase())
  if (!allowed.length) return `Nada em ${noun ?? resourceLabel(resource).toLowerCase()}`
  if (noun) return `${capitalize(joinWords(allowed.map((action) => VERB[action])))} ${noun}`
  const phrases = PHRASE[resource] ?? {}
  return capitalize(joinWords(allowed.map((action) => phrases[action] ?? VERB[action])))
}
const isNone = (role: Role, resource: Resource) =>
  !actionsOf(resource).some((action) => hasAction(role, resource, action))

const openConfirm = () => {
  confirm.error = ''
  confirm.open = true
}

const applyChanges = async () => {
  if (!editingRole.value) return
  confirm.loading = true
  confirm.error = ''

  const role = editingRole.value
  savedRole.value = role

  const changed = shownResources.value.filter((resource) => {
    const before = stored(role, resource)
    const after = [...(draft.value.get(resource) ?? [])]
    return before.length !== after.length || before.some((action) => !after.includes(action))
  })

  try {
    await Promise.all(
      changed.map(async (resource) => {
        const newActions = [...(draft.value.get(resource) ?? [])]
        await savePermission(role, resource, newActions)
        const perm = permissions.value.find((p) => p.role === role && p.resource === resource)
        if (perm) perm.actions = newActions
      }),
    )
    if (role === auth.user?.role) permissionsStore.set(matrixOf(role))

    confirm.open = false
    editingRole.value = null
    draft.value = new Map()
    useToast().show(`Permissões de ${roleLabel(role)} salvas.`)
  } catch (e) {
    useErrorReporter().captureException(e, { context: 'AdminPermissions.applyChanges', role: editingRole.value })
    confirm.error = errorText(e, 'Não foi possível salvar as permissões. Tente de novo.')
    await fetchPermissions(true)
  } finally {
    confirm.loading = false
  }
}

const fetchPermissions = async (quiet = false) => {
  if (!quiet) loading.value = true
  error.value = ''

  try {
    const matrix = await getPermissions()
    permissions.value = matrix.permissions
    configurable.value = matrix.configurable
  } catch (e) {
    error.value = 'Não foi possível carregar as permissões. Tente de novo.'
    useErrorReporter().captureException(e, { context: 'AdminPermissions.fetchPermissions' })
    console.error('[AdminPermissions]', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchPermissions)
</script>

<style lang="scss" scoped>
.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--panel-card-min), 1fr));
  gap: var(--space-4);
}

.role-card {
  overflow: hidden;

  &.is-editing {
    border-color: var(--color-action-border-subtle);
  }

  &__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--color-border-default);
  }

  &__title {
    margin: 0;
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-default);
  }

  &__actions {
    display: flex;
    gap: var(--space-2);
  }
}

.resource-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-1) var(--space-3);
  padding-block: var(--space-3);

  &__name {
    padding: 0;
    font-size: var(--font-size-ui);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-default);
  }

  &__allowed {
    font-size: var(--font-size-ui);
    color: var(--color-text-default);

    &.is-none {
      color: var(--color-text-subtle);
    }
  }

  &--fixed {
    margin: 0;
    font-size: var(--font-size-meta);
    color: var(--color-text-subtle);
  }

  &__note {
    margin: var(--space-1) 0 0;
    font-size: var(--font-size-meta);
    color: var(--color-text-subtle);
  }

  &__edit {
    width: 100%;
    margin: 0;
    padding: 0;
    border: none;
  }

  &__checks {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 var(--space-3);
    margin-top: var(--space-1);
  }
}
</style>
