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
              <span class="resource-row__name">{{ resourceLabel(resource) }}</span>
              <span class="resource-row__allowed" :class="{ 'is-none': allowedText(role, resource) === 'Nada' }">
                {{ allowedText(role, resource) }}
              </span>
            </template>
          </div>
        </div>
      </section>
    </div>

    <EmptyState v-else-if="!error" title="Não deu pra ver as permissões agora">
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
import { errorText } from '@/composables/apiError'
import { roleLabel } from '@/data/roles'
import { ref, computed, nextTick, onMounted, reactive } from 'vue'

import { useErrorReporter, useToast } from '@/composables'
import { getPermissions, savePermission } from '@/composables/useApi'
import SectionHeader from '@/components/SectionHeader.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import AppButton from '@/components/AppButton.vue'
import CheckRow from '@/components/CheckRow.vue'
import AppNotice from '@/components/AppNotice.vue'
import EmptyState from '@/components/EmptyState.vue'
import { joinWords } from '@/data/words'
import type { Role, Resource, Action, Permission } from '@/types'
import { useAuthStore, usePermissionsStore } from '@/stores'

const ROLES: Role[] = ['admin', 'editor', 'viewer']
const RESOURCES: Resource[] = ['books', 'users', 'autores', 'midias', 'categorias', 'subgeneros', 'permissions']
const ACTIONS: Action[] = ['create', 'read', 'update', 'delete']
const WRITES: Action[] = ['create', 'update', 'delete']

const resourceLabel = (r: string) =>
  ({
    books: 'Livros',
    users: 'Membros',
    autores: 'Autores',
    midias: 'Formatos',
    categorias: 'Gêneros',
    subgeneros: 'Subgêneros',
    permissions: 'Permissões',
  })[r] ?? r

const actionLabel = (a: string) => ({ create: 'Criar', read: 'Ver', update: 'Editar', delete: 'Remover' })[a] ?? a

const auth = useAuthStore()
const permissionsStore = usePermissionsStore()
const permissions = ref<Permission[]>([])
// What the API's routes really obey, per resource: a box outside it would change nothing, so it is not shown.
const configurable = ref<Partial<Record<Resource, Action[]>>>({})
const actionsOf = (resource: Resource) => ACTIONS.filter((action) => configurable.value[resource]?.includes(action))
const shownResources = computed(() => RESOURCES.filter((resource) => actionsOf(resource).length > 0))
const stored = (role: Role, resource: Resource) =>
  (permissions.value.find((p) => p.role === role && p.resource === resource)?.actions ?? []).filter((action) =>
    actionsOf(resource).includes(action),
  )

// The level's saved rows, in the shape users/me returns, so your own screens follow the edit now.
const matrixOf = (role: Role) =>
  Object.fromEntries(permissions.value.filter((p) => p.role === role).map((p) => [p.resource, [...p.actions]]))
const loading = ref(false)
const error = ref('')

const editingRole = ref<Role | null>(null)
const draft = ref<Map<Resource, Set<Action>>>(new Map())

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

const hasAction = (role: Role, resource: Resource, action: Action) => stored(role, resource).includes(action)

const hasActionDraft = (role: Role, resource: Resource, action: Action) => {
  if (editingRole.value !== role) return hasAction(role, resource, action)
  return draft.value.get(resource)?.has(action) ?? false
}

// Same rule as the API: creating, editing or removing brings "Ver" along, and it stays while any of them does.
const readLocked = (resource: Resource) =>
  actionsOf(resource).includes('read') && WRITES.some((action) => draft.value.get(resource)?.has(action))

// Entering and leaving edit swaps the buttons under the focus: it moves in to the first box and back to "Editar".
const cardOf = (role: Role | null) => document.querySelector<HTMLElement>(`[data-role="${role}"]`)
const editButtonOf = (role: Role | null) => cardOf(role)?.querySelector<HTMLElement>('[data-edit]')
const savedRole = ref<Role | null>(null)

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

  // Force reactivity (Set is not deeply reactive)
  draft.value = new Map(draft.value)
}

// Read mode says it in words ("Criar, ver e editar"); the boxes appear only while that level is being edited.
const allowedText = (role: Role, resource: Resource) => {
  const labels = actionsOf(resource).filter((action) => hasAction(role, resource, action)).map((action, i) =>
    i === 0 ? actionLabel(action) : actionLabel(action).toLowerCase(),
  )
  return labels.length ? joinWords(labels) : 'Nada'
}

const confirm = reactive({ open: false, loading: false, error: '' })

const openConfirm = () => {
  confirm.error = ''
  confirm.open = true
}

// A failed save stays in the dialog, where the admin acted; confirming again retries it.
const applyChanges = async () => {
  if (!editingRole.value) return
  confirm.loading = true
  confirm.error = ''

  const role = editingRole.value
  savedRole.value = role

  // Only what changed goes out: seven writes per save ran into the API's rate limit and saved half.
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
    confirm.error = errorText(e, 'Não deu pra salvar as permissões. Tente de novo.')
    // Part of it may have been saved: the screen shows what the server holds, not what was sent.
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
    error.value = 'Não deu pra carregar as permissões. Tente de novo.'
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
    font-size: var(--font-size-meta);
    color: var(--color-text-secondary);
    text-align: right;

    &.is-none {
      color: var(--color-text-subtle);
    }
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
