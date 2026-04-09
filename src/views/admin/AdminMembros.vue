<template>
  <div class="admin-section">
    <!-- Header -->
    <div class="admin-section__header">
      <div>
        <h2 class="admin-section__title">Membros</h2>
        <p class="admin-section__desc">Gerencie os membros do clube e suas permissões de acesso.</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="admin-state">
      <div class="spinner" aria-hidden="true" />
      <p>Carregando membros…</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="admin-state admin-state--error">
      <BaseIcon name="error" aria-hidden="true" />
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchUsers">Tentar novamente</button>
    </div>

    <!-- Lista -->
    <div v-else class="members-list">
      <div
        v-for="user in users"
        :key="user._id"
        class="member-row"
        :class="{ 'is-self': user._id === authStore.user?._id }"
      >
        <UserAvatar :alt="user.name" class="member-avatar" />

        <div class="member-info">
          <span class="member-name">
            {{ user.name }}
            <span v-if="user._id === authStore.user?._id" class="member-you">você</span>
          </span>
          <span class="member-email">{{ user.email }}</span>
        </div>

        <div class="member-meta">
          <span class="member-since"> Desde {{ formatDate(user.created_at) }} </span>
        </div>

        <!-- Role select -->
        <div class="member-role">
          <select
            class="role-select"
            :value="user.role"
            :disabled="user._id === authStore.user?._id"
            :title="user._id === authStore.user?._id ? 'Você não pode alterar sua própria role' : ''"
            @change="onRoleChange(user, ($event.target as HTMLSelectElement).value)"
          >
            <option value="viewer">Membro</option>
            <option value="editor">Editor</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
      </div>

      <p v-if="users.length === 0" class="admin-empty">Nenhum membro encontrado.</p>
    </div>

    <!-- Modal de confirmação -->
    <ConfirmModal
      v-model="confirm.open"
      title="Alterar permissão"
      :description="confirm.description"
      confirm-label="Confirmar alteração"
      :loading="confirm.loading"
      @confirm="applyRoleChange"
      @cancel="cancelRoleChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue'

import { useAuthStore } from '@/stores'
import UserAvatar from '@/components/UserAvatar.vue'
import ConfirmModal from '@/components/admin/ConfirmModal.vue'

const API_BASE = import.meta.env.VITE_API_URL as string

interface ApiUser {
  _id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  created_at: string
  last_seen_at: string
}

const authStore = useAuthStore()
const users = ref<ApiUser[]>([])
const loading = ref(false)
const error = ref('')

const confirm = reactive({
  open: false,
  loading: false,
  description: '',
  userId: '',
  newRole: '' as ApiUser['role'],
  previousRole: '' as ApiUser['role'],
})

const roleLabel = (role: string) => {
  const map: Record<string, string> = { admin: 'Administrador', editor: 'Editor', viewer: 'Membro' }
  return map[role] ?? role
}

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
}

const fetchUsers = async () => {
  loading.value = true
  error.value = ''

  try {
    const res = await fetch(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    users.value = await res.json()
  } catch (e) {
    error.value = 'Não foi possível carregar os membros.'
    console.error('[AdminMembros]', e)
  } finally {
    loading.value = false
  }
}

const onRoleChange = (user: ApiUser, newRole: string) => {
  // Reverte visualmente — o select não muda até confirmação
  const el = document.querySelector(`[data-user-id="${user._id}"] select`) as HTMLSelectElement | null
  if (el) el.value = user.role

  confirm.userId = user._id
  confirm.newRole = newRole as ApiUser['role']
  confirm.previousRole = user.role
  confirm.description = `Alterar permissão de "${user.name}" de ${roleLabel(user.role)} para ${roleLabel(newRole)}?`
  confirm.open = true
}

const applyRoleChange = async () => {
  confirm.loading = true

  try {
    const res = await fetch(`${API_BASE}/users/${confirm.userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({ role: confirm.newRole }),
    })

    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
      throw new Error(msg)
    }

    // Atualiza localmente
    const idx = users.value.findIndex((u) => u._id === confirm.userId)
    if (idx !== -1) users.value[idx]!.role = confirm.newRole

    confirm.open = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erro ao alterar permissão.'
    confirm.open = false
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
.admin-section {
  padding: 2rem;
  max-width: 900px;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
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
  transition: opacity var(--motion-transition-default);

  &:hover {
    opacity: 0.85;
  }
}

// ── Lista de membros ──────────────────────────────────────────────
.members-list {
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  overflow: hidden;
}

.member-row {
  display: grid;
  grid-template-columns: 2.5rem 1fr auto auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border-default);
  transition: background var(--motion-transition-default);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--color-background-subtle);
  }

  &.is-self {
    background: var(--color-action-background-subtle);
  }
}

.member-avatar {
  width: 2.25rem !important;
  height: 2.25rem !important;
}

.member-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.member-name {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text-default);
  display: flex;
  align-items: center;
  gap: 6px;
}

.member-you {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--color-action-background-subtle);
  color: var(--color-action-default);
}

.member-email {
  font-size: 0.82rem;
  color: var(--color-text-subtle);
}

.member-meta {
  text-align: right;
}

.member-since {
  font-size: 0.78rem;
  color: var(--color-text-subtle);
}

.role-select {
  height: 36px;
  padding: 0 10px;
  border: 1.5px solid var(--color-border-default);
  border-radius: var(--border-radius-sm);
  background: var(--color-surface-default);
  font-family: var(--font-family-body);
  font-size: 0.875rem;
  color: var(--color-text-default);
  cursor: pointer;
  transition: border-color var(--motion-transition-default);

  &:focus {
    outline: none;
    border-color: var(--color-action-default);
    box-shadow: 0 0 0 3px var(--color-action-background-subtle);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.admin-empty {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-subtle);
  font-size: 0.9rem;
}

@media (max-width: 767px) {
  .admin-section {
    padding: 1rem;
  }

  .member-row {
    grid-template-columns: 2rem 1fr auto;
    grid-template-rows: auto auto;

    .member-meta {
      display: none;
    }
  }
}
</style>
