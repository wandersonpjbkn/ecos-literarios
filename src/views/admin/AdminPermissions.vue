<template>
  <div class="admin-section">
    <!-- Header -->
    <div class="admin-section__header">
      <div>
        <h2 class="admin-section__title">Permissões</h2>
        <p class="admin-section__desc">
          Clique em "Editar" para alterar as permissões de um role. As mudanças só são salvas ao confirmar.
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="admin-state">
      <div class="spinner" aria-hidden="true" />
      <p>Carregando permissões…</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="admin-state admin-state--error">
      <BaseIcon name="error" aria-hidden="true" />
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchPermissions">Tentar novamente</button>
    </div>

    <!-- Matriz -->
    <div v-else class="permissions-grid">
      <div v-for="role in ROLES" :key="role" class="role-card" :class="{ 'is-editing': editingRole === role }">
        <!-- Card header -->
        <div class="role-card__header">
          <div>
            <span class="role-card__title">{{ roleLabel(role) }}</span>
            <span class="role-card__badge">{{ role }}</span>
          </div>

          <!-- Botão Editar / estado de edição -->
          <div class="role-card__actions">
            <template v-if="editingRole !== role">
              <button
                class="card-btn card-btn--edit"
                :disabled="editingRole !== null && editingRole !== role"
                @click="startEditing(role)"
              >
                Editar
              </button>
            </template>
            <template v-else>
              <button class="card-btn card-btn--cancel" @click="cancelEditing">Cancelar</button>
              <button class="card-btn card-btn--save" :disabled="!hasPendingChanges" @click="confirm.open = true">
                Atualizar
              </button>
            </template>
          </div>
        </div>

        <!-- Recursos × ações -->
        <div class="role-card__body">
          <div v-for="resource in RESOURCES" :key="resource" class="resource-row">
            <span class="resource-name">{{ resourceLabel(resource) }}</span>

            <div class="actions-group">
              <label
                v-for="action in ACTIONS"
                :key="action"
                class="action-check"
                :class="{
                  'is-checked': hasActionDraft(role, resource, action),
                  'is-editable': editingRole === role && !isLocked(role, resource, action),
                }"
                :title="actionLabel(action)"
              >
                <input
                  type="checkbox"
                  :checked="hasActionDraft(role, resource, action)"
                  :disabled="editingRole !== role || isLocked(role, resource, action)"
                  @change="toggleDraft(resource, action)"
                />
                <span class="action-check__box">
                  <BaseIcon v-if="hasActionDraft(role, resource, action)" name="check" />
                </span>
                <span class="action-check__label">{{ actionLabel(action) }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmação -->
    <ConfirmModal
      v-model="confirm.open"
      title="Confirmar alteração?"
      :description="`As permissões do role '${roleLabel(editingRole ?? '')}' serão atualizadas.`"
      confirm-label="Salvar alterações"
      :loading="confirm.loading"
      @confirm="applyChanges"
      @cancel="confirm.open = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, reactive } from 'vue'

import { useAuthStore } from '@/stores'
import ConfirmModal from '@/components/admin/ConfirmModal.vue'

const API_BASE = import.meta.env.VITE_API_URL as string

type Role = 'admin' | 'editor' | 'viewer'
type Resource = 'books' | 'users' | 'subgeneros' | 'permissions'
type Action = 'create' | 'read' | 'update' | 'delete'

const ROLES: Role[] = ['admin', 'editor', 'viewer']
const RESOURCES: Resource[] = ['books', 'users', 'subgeneros', 'permissions']
const ACTIONS: Action[] = ['create', 'read', 'update', 'delete']

const roleLabel = (r: string) => ({ admin: 'Administrador', editor: 'Editor', viewer: 'Membro' })[r] ?? r
const resourceLabel = (r: string) =>
  ({ books: 'Livros', users: 'Membros', subgeneros: 'Sub-gêneros', permissions: 'Permissões' })[r] ?? r
const actionLabel = (a: string) => ({ create: 'Criar', read: 'Ver', update: 'Editar', delete: 'Excluir' })[a] ?? a

interface Permission {
  role: Role
  resource: Resource
  actions: Action[]
}

const authStore = useAuthStore()
const permissions = ref<Permission[]>([])
const loading = ref(false)
const error = ref('')

// ── Estado de edição ──────────────────────────────────────────────
/** Role sendo editada (null = nenhuma) */
const editingRole = ref<Role | null>(null)

/**
 * Cópia rasa das permissões da role em edição.
 * Map: resource → Set de actions selecionadas
 */
const draft = ref<Map<Resource, Set<Action>>>(new Map())

const hasPendingChanges = computed(() => {
  if (!editingRole.value) return false

  for (const resource of RESOURCES) {
    const original =
      permissions.value.find((p) => p.role === editingRole.value && p.resource === resource)?.actions ?? []

    const draftActions = [...(draft.value.get(resource) ?? [])]

    if (original.length !== draftActions.length) return true
    if (original.some((a) => !draftActions.includes(a))) return true
  }

  return false
})

// ── Helpers de leitura ────────────────────────────────────────────
const hasAction = (role: Role, resource: Resource, action: Action) => {
  return permissions.value.find((p) => p.role === role && p.resource === resource)?.actions.includes(action) ?? false
}

const hasActionDraft = (role: Role, resource: Resource, action: Action) => {
  if (editingRole.value !== role) return hasAction(role, resource, action)
  return draft.value.get(resource)?.has(action) ?? false
}

const isLocked = (role: Role, resource: Resource, action: Action) =>
  role === 'admin' && resource === 'permissions' && action === 'read'

// ── Controle de edição ────────────────────────────────────────────
const startEditing = (role: Role) => {
  editingRole.value = role

  // Clona estado atual para o draft
  const newDraft = new Map<Resource, Set<Action>>()
  for (const resource of RESOURCES) {
    const actions = permissions.value.find((p) => p.role === role && p.resource === resource)?.actions ?? []
    newDraft.set(resource, new Set(actions))
  }
  draft.value = newDraft
}

const cancelEditing = () => {
  editingRole.value = null
  draft.value = new Map()
}

const toggleDraft = (resource: Resource, action: Action) => {
  const set = draft.value.get(resource)
  if (!set) return

  if (set.has(action)) set.delete(action)
  else set.add(action)

  // Força reatividade (Set não é deeply reactive)
  draft.value = new Map(draft.value)
}

// ── Salvar ────────────────────────────────────────────────────────
const confirm = reactive({ open: false, loading: false })

const applyChanges = async () => {
  if (!editingRole.value) return
  confirm.loading = true

  const role = editingRole.value

  try {
    // Um PUT por resource que mudou
    const promises = RESOURCES.map(async (resource) => {
      const newActions = [...(draft.value.get(resource) ?? [])]

      const res = await fetch(`${API_BASE}/permissions/${role}/${resource}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({ actions: newActions }),
      })

      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
        throw new Error(msg)
      }

      // Atualiza localmente
      const perm = permissions.value.find((p) => p.role === role && p.resource === resource)
      if (perm) perm.actions = newActions
    })

    await Promise.all(promises)

    confirm.open = false
    editingRole.value = null
    draft.value = new Map()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erro ao salvar permissões.'
    confirm.open = false
  } finally {
    confirm.loading = false
  }
}

// ── Fetch ─────────────────────────────────────────────────────────
const fetchPermissions = async () => {
  loading.value = true
  error.value = ''

  try {
    const res = await fetch(`${API_BASE}/permissions`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    permissions.value = await res.json()
  } catch (e) {
    error.value = 'Não foi possível carregar as permissões.'
    console.error('[AdminPermissions]', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchPermissions)
</script>

<style lang="scss" scoped>
.admin-section {
  padding: 2rem;

  &__header {
    margin-bottom: 2rem;
  }

  &__title {
    margin: 0 0 0.25rem;
    font-family: var(--font-family-display);
    font-size: 1.4rem;
    font-weight: 400;
    color: var(--color-text-default);
  }

  &__desc {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-text-subtle);
    line-height: 1.5;
  }
}

// ── States ────────────────────────────────────────────────────────
.admin-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 24px;
  text-align: center;
  color: var(--color-text-subtle);

  &--error {
    color: var(--color-action-default);
  }
  svg {
    width: 40px;
    height: 40px;
  }
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-border-default);
  border-top-color: var(--color-action-default);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.retry-btn {
  border: none;
  padding: 8px 16px;
  min-height: 40px;
  border-radius: var(--border-radius-sm);
  background: var(--color-action-default);
  color: var(--color-surface-default);
  font-family: var(--font-family-body);
  font-size: 0.9rem;
  cursor: pointer;
  &:hover {
    opacity: 0.85;
  }
}

// ── Grid ──────────────────────────────────────────────────────────
.permissions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
  }
}

.role-card {
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  overflow: hidden;
  transition:
    border-color var(--motion-transition-default),
    box-shadow var(--motion-transition-default);

  &.is-editing {
    border-color: var(--color-action-default);
    box-shadow: 0 0 0 3px var(--color-action-background-subtle);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--color-border-default);
    background: var(--color-background-subtle);
  }

  &__title {
    display: block;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--color-text-default);
    margin-bottom: 2px;
  }

  &__badge {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 2px 8px;
    border-radius: 999px;
    background: var(--color-action-background-subtle);
    color: var(--color-action-default);
  }

  &__actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }

  &__body {
    padding: 0.5rem 0;
  }
}

// ── Card buttons ──────────────────────────────────────────────────
.card-btn {
  height: 32px;
  padding: 0 12px;
  border-radius: var(--border-radius-sm);
  border: none;
  font-family: var(--font-family-body);
  font-size: 0.82rem;
  cursor: pointer;
  transition:
    opacity var(--motion-transition-default),
    background var(--motion-transition-default);

  &--edit {
    background: var(--color-action-background-subtle);
    color: var(--color-action-default);
    font-weight: 500;

    &:hover:not(:disabled) {
      opacity: 0.8;
    }
    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  }

  &--cancel {
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    color: var(--color-text-subtle);

    &:hover {
      background: var(--color-background-subtle);
    }
  }

  &--save {
    background: var(--color-action-default);
    color: var(--color-surface-default);
    font-weight: 500;

    &:hover:not(:disabled) {
      opacity: 0.85;
    }
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
}

// ── Resource row ──────────────────────────────────────────────────
.resource-row {
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--color-border-default);
  &:last-child {
    border-bottom: none;
  }
}

.resource-name {
  display: block;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
  margin-bottom: 0.5rem;
}

.actions-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

// ── Action checkbox ───────────────────────────────────────────────
.action-check {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  user-select: none;
  transition: background var(--motion-transition-default);

  // Só mostra cursor pointer quando editável
  cursor: default;
  &.is-editable {
    cursor: pointer;
  }
  &.is-editable:hover {
    background: var(--color-background-subtle);
  }

  &.is-checked {
    background: var(--color-action-background-subtle);
  }

  input {
    display: none;
  }

  &__box {
    width: 16px;
    height: 16px;
    border: 1.5px solid var(--color-border-default);
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all var(--motion-transition-default);
    background: var(--color-surface-default);

    svg {
      width: 10px;
      height: 10px;
    }
  }

  &.is-checked &__box {
    background: var(--color-action-default);
    border-color: var(--color-action-default);
    color: #fff;
  }

  // Checkbox desabilitado (não-editável)
  input:disabled ~ &__box {
    opacity: 0.5;
  }

  &__label {
    font-size: 0.8rem;
    color: var(--color-text-default);
  }
}

@media (max-width: 767px) {
  .admin-section {
    padding: 1rem;
  }
}
</style>
