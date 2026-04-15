<template>
  <div class="profile-section">
    <div class="profile-section__header">
      <div>
        <h2 class="profile-section__title">Conta</h2>
        <p class="profile-section__desc">Gerencie as informações do seu perfil exibidas no clube.</p>
      </div>
    </div>

    <!-- Status cards -->
    <div class="status-grid">
      <article class="status-card">
        <p class="status-card__label">Nome atual</p>
        <p class="status-card__value">{{ authStore.user?.name ?? '—' }}</p>
      </article>

      <article class="status-card">
        <p class="status-card__label">Email</p>
        <p class="status-card__value">{{ authStore.user?.email ?? '—' }}</p>
      </article>

      <article class="status-card">
        <p class="status-card__label">Papel</p>
        <p class="status-card__value">{{ roleLabel }}</p>
      </article>
    </div>

    <!-- Painel de edição -->
    <section class="account-panel">
      <header class="account-panel__header">
        <h3>Editar nome</h3>
      </header>

      <form class="account-form" @submit.prevent="submit">
        <div class="field">
          <label for="userName" class="field__label">Nome de exibição</label>
          <p class="field__hint">Este nome aparece nas indicações de livros vinculadas ao seu perfil.</p>
          <input
            id="userName"
            v-model.trim="name"
            type="text"
            class="field__input"
            placeholder="Seu nome"
            :disabled="isSubmitting"
            autocomplete="name"
            maxlength="60"
          />
          <span class="field__counter" :class="{ 'is-limit': name.length >= 55 }"> {{ name.length }} / 60 </span>
        </div>

        <div class="account-actions">
          <button type="submit" class="action-btn" :disabled="isSubmitting || !isChanged || !isValid">
            <span v-if="isSubmitting">Salvando…</span>
            <span v-else>Salvar alterações</span>
          </button>

          <button
            v-if="isChanged"
            type="button"
            class="action-btn action-btn--secondary"
            :disabled="isSubmitting"
            @click="reset"
          >
            Cancelar
          </button>
        </div>
      </form>

      <p v-if="error" class="feedback feedback--error">{{ error }}</p>
      <p v-if="successMessage" class="feedback feedback--success">{{ successMessage }}</p>
    </section>

    <!-- Info de somente leitura -->
    <section class="readonly-panel">
      <header class="readonly-panel__header">
        <h3>Informações da conta</h3>
      </header>
      <div class="readonly-list">
        <div class="readonly-item">
          <span class="readonly-item__label">Email</span>
          <span class="readonly-item__value">{{ authStore.user?.email ?? '—' }}</span>
        </div>
        <div class="readonly-item">
          <span class="readonly-item__label">Papel</span>
          <span class="readonly-item__value">{{ roleLabel }}</span>
        </div>
        <div class="readonly-item">
          <span class="readonly-item__label">Autenticação</span>
          <span class="readonly-item__value">Link (via e-mail)</span>
        </div>
      </div>
      <p class="readonly-note">
        Email e papel não podem ser alterados por aqui. Contate um administrador se necessário.
      </p>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores'
import { buildHeaders } from '@/composables/useApi'

const router = useRouter()
const authStore = useAuthStore()

if (!authStore.isLoggedIn) {
  router.replace('/login')
}

const API_BASE = import.meta.env.VITE_API_URL as string

const name = ref(authStore.user?.name ?? '')
const isSubmitting = ref(false)
const error = ref('')
const successMessage = ref('')

const isValid = computed(() => name.value.trim().length >= 2)
const isChanged = computed(() => name.value.trim() !== authStore.user?.name)

const roleLabel = computed(() => {
  const map: Record<string, string> = {
    admin: 'Administrador',
    editor: 'Editor',
    viewer: 'Membro',
  }
  return map[authStore.user?.role ?? 'viewer'] ?? 'Membro'
})

const reset = () => {
  name.value = authStore.user?.name ?? ''
  error.value = ''
  successMessage.value = ''
}

const submit = async () => {
  if (!isValid.value || !isChanged.value) return

  isSubmitting.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: JSON.stringify({ name: name.value }),
    })

    if (!res.ok) {
      const payload = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
      throw new Error(payload.error ?? 'Não foi possível salvar o nome.')
    }

    const updated = await res.json()

    // Atualiza o store local com o novo nome
    if (authStore.user) {
      authStore.user = { ...authStore.user, name: updated.name }
    }

    name.value = updated.name
    successMessage.value = 'Nome atualizado com sucesso.'
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao salvar alterações.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style lang="scss" scoped>
// Herdado do ProfileLayout :deep(.profile-section)
.profile-section {
  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;

    @media (max-width: 767px) {
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
  }

  &__title {
    margin: 0 0 0.25rem;
    font-family: var(--font-family-display);
    font-size: 1.4rem;
    font-weight: 400;
    color: var(--color-text-default);

    @media (max-width: 767px) {
      font-size: 1.2rem;
    }
  }

  &__desc {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-text-subtle);
    max-width: 65ch;
    line-height: 1.5;

    @media (max-width: 767px) {
      font-size: 0.85rem;
    }
  }
}

// ── Status cards ──────────────────────────────────────────────────
.status-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;

  @media (max-width: 767px) {
    grid-template-columns: 1fr 1fr;

    .status-card:last-child {
      grid-column: 1 / -1;
    }
  }
}

.status-card {
  padding: 0.9rem;
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  background: var(--color-surface-default);

  &__label {
    margin: 0;
    font-size: 0.78rem;
    color: var(--color-text-subtle);
  }

  &__value {
    margin-top: 0.25rem;
    display: block;
    font-size: 1.1rem;
    color: var(--color-text-default);
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    @media (max-width: 767px) {
      font-size: 0.95rem;
      word-break: break-word;
      white-space: normal;
    }
  }
}

// ── Panels ────────────────────────────────────────────────────────
.account-panel,
.readonly-panel {
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  background: var(--color-surface-default);
  padding: 1rem;
}

.account-panel {
  margin-bottom: 1rem;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text-default);
    }
  }
}

.readonly-panel {
  &__header {
    margin-bottom: 0.75rem;

    h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text-default);
    }
  }
}

// ── Form ──────────────────────────────────────────────────────────
.account-form {
  display: grid;
  gap: 1rem;
}

.field {
  display: grid;
  gap: 0.35rem;

  &__label {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--color-text-default);
  }

  &__hint {
    margin: 0;
    font-size: 0.8rem;
    color: var(--color-text-subtle);
  }

  &__input {
    width: 100%;
    max-width: 400px;
    border: 1.5px solid var(--color-border-default);
    border-radius: var(--border-radius-sm);
    min-height: 44px;
    padding: 0 0.75rem;
    background: var(--color-surface-default);
    color: var(--color-text-default);
    font-family: var(--font-family-body);
    font-size: 1rem;
    transition:
      border-color var(--motion-transition-default),
      box-shadow var(--motion-transition-default);
    outline: none;

    &:focus {
      border-color: var(--color-action-default);
      box-shadow: 0 0 0 3px var(--color-action-background-subtle);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background: var(--color-background-subtle);
    }

    @media (max-width: 767px) {
      max-width: 100%;
    }
  }

  &__counter {
    font-size: 0.75rem;
    color: var(--color-text-subtle);
    justify-self: start;

    &.is-limit {
      color: #c0392b;
    }
  }
}

.account-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  @media (max-width: 480px) {
    .action-btn {
      flex: 1 1 100%;
      min-height: 44px;
    }
  }
}

.action-btn {
  border: none;
  border-radius: var(--border-radius-sm);
  min-height: 40px;
  padding: 0.5rem 0.9rem;
  font-family: var(--font-family-body);
  font-size: 0.88rem;
  cursor: pointer;
  background: var(--color-action-default);
  color: #fff;
  transition: opacity var(--motion-transition-default);

  &:hover:not(:disabled) {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--secondary {
    background: var(--color-background-subtle);
    color: var(--color-text-default);
    border: 1px solid var(--color-border-default);

    &:hover:not(:disabled) {
      background: var(--color-background-default);
      opacity: 1;
    }
  }
}

// ── Feedback ──────────────────────────────────────────────────────
.feedback {
  margin: 0.75rem 0 0;
  font-size: 0.88rem;

  &--error {
    color: #c0392b;
  }
  &--success {
    color: #2e7d32;
  }
}

// ── Lista somente leitura ─────────────────────────────────────────
.readonly-list {
  display: grid;
  gap: 0;
}

.readonly-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid var(--color-border-default);
  font-size: 0.9rem;

  &:last-child {
    border-bottom: none;
  }

  &__label {
    color: var(--color-text-subtle);
    flex-shrink: 0;
  }

  &__value {
    color: var(--color-text-default);
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;

    &__value {
      text-align: left;
      white-space: normal;
      word-break: break-word;
    }
  }
}

.readonly-note {
  margin: 0.75rem 0 0;
  font-size: 0.8rem;
  color: var(--color-text-subtle);
  line-height: 1.5;
}
</style>
