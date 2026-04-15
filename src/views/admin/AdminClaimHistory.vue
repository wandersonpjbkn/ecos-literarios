<template>
  <div class="admin-section">
    <div class="admin-section__header">
      <div>
        <h2 class="admin-section__title">Histórico de vínculos</h2>
        <p class="admin-section__desc">
          Registro de todos os vínculos e desvinculamentos realizados pelos membros. Carregue sob demanda para auditar
          alterações.
        </p>
      </div>

      <button class="load-btn" :disabled="loading" @click="loadHistory">
        <span v-if="loading">Carregando…</span>
        <span v-else>{{ history.length ? 'Recarregar' : 'Carregar histórico' }}</span>
      </button>
    </div>

    <!-- Idle — ainda não carregou -->
    <div v-if="!loaded && !loading" class="admin-state admin-state--idle">
      <BaseIcon name="reload" aria-hidden="true" />
      <p>Clique em "Carregar histórico" para buscar as alterações registradas.</p>
    </div>

    <!-- Loading -->
    <BaseSpinner v-else-if="loading" class="admin-state">
      <p>Buscando histórico…</p>
    </BaseSpinner>

    <!-- Error -->
    <div v-else-if="error" class="admin-state admin-state--error">
      <BaseIcon name="error" aria-hidden="true" />
      <p>{{ error }}</p>
    </div>

    <!-- Empty -->
    <p v-else-if="history.length === 0" class="admin-empty">Nenhuma alteração registrada ainda.</p>

    <!-- Lista -->
    <div v-else class="history-list">
      <div class="history-row history-row--header">
        <span>Membro</span>
        <span>Ação</span>
        <span>Nome vinculado</span>
        <span>Livros afetados</span>
        <span>Data</span>
      </div>

      <div v-for="item in history" :key="item.id" class="history-row" :class="`is-${item.action}`">
        <span class="history-row__email">{{ item.user_email }}</span>
        <span class="history-row__action">
          <span class="action-badge" :class="`action-badge--${item.action}`">
            {{ item.action === 'claim' ? 'Vinculou' : 'Desvinculou' }}
          </span>
        </span>
        <span class="history-row__name">{{ item.claim_name ?? item.previous_claim_names?.join(', ') ?? '—' }}</span>
        <span class="history-row__books">{{ item.affected_books }}</span>
        <span class="history-row__date">{{ formatDateTime(item.performed_at) }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import { useAuthStore } from '@/stores'

const API_BASE = import.meta.env.VITE_API_URL as string

interface ClaimHistoryEntry {
  id: string
  user_id: string
  user_email: string
  action: 'claim' | 'unclaim'
  claim_name?: string
  previous_claim_names?: string[]
  affected_books: number
  performed_at: string
}

const authStore = useAuthStore()

const loading = ref(false)
const loaded = ref(false)
const error = ref('')
const history = ref<ClaimHistoryEntry[]>([])

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })

const loadHistory = async () => {
  loading.value = true
  error.value = ''

  try {
    const res = await fetch(`${API_BASE}/admin/users/claims/history?limit=50`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (!res.ok) {
      const payload = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
      throw new Error(payload.error ?? `HTTP ${res.status}`)
    }

    const payload = (await res.json()) as { total: number; history: ClaimHistoryEntry[] }
    history.value = payload.history
    loaded.value = true
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Não foi possível carregar o histórico.'
    console.error('[AdminClaimHistory]', e)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.admin-section {
  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
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
    max-width: 65ch;
    line-height: 1.5;
  }
}

.load-btn {
  border: none;
  border-radius: var(--border-radius-sm);
  min-height: 40px;
  padding: 0.5rem 0.9rem;
  font-size: 0.88rem;
  font-family: var(--font-family-body);
  cursor: pointer;
  background: var(--color-action-default);
  color: #fff;
  flex-shrink: 0;
  transition: opacity var(--motion-transition-default);

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  &:hover:not(:disabled) {
    opacity: 0.85;
  }
}

.admin-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
  text-align: center;
  color: var(--color-text-subtle);

  svg {
    width: 36px;
    height: 36px;
    opacity: 0.5;
  }

  &--error {
    color: var(--color-action-default);

    svg {
      opacity: 1;
    }
  }

  &--idle {
    border: 1px dashed var(--color-border-default);
    border-radius: var(--border-radius-default);
  }
}

.admin-empty {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-subtle);
  border: 1px dashed var(--color-border-default);
  border-radius: var(--border-radius-default);
}

// ── Tabela ────────────────────────────────────────────────────────
.history-list {
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  overflow: hidden;
  overflow-x: auto;
}

.history-row {
  display: grid;
  grid-template-columns: minmax(160px, 2fr) auto minmax(120px, 1.5fr) 100px 1fr;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border-default);
  font-size: 0.875rem;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  &--header {
    background: var(--color-background-subtle);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  &__email {
    color: var(--color-text-default);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__name {
    color: var(--color-text-default);
    font-weight: 500;
  }

  &__books {
    color: var(--color-text-subtle);
    text-align: center;
  }

  &__date {
    color: var(--color-text-subtle);
    white-space: nowrap;
  }
}

.action-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;

  &--claim {
    background: var(--badge-livro-background-color, #e9f2f5);
    color: var(--badge-livro-text-color, #18576e);
  }

  &--unclaim {
    background: var(--color-background-subtle);
    color: var(--color-text-subtle);
  }
}

@media (max-width: 767px) {
  .admin-section {
    &__header {
      flex-direction: column;
      align-items: stretch;
      margin-bottom: 1rem;
    }

    &__title {
      font-size: 1.2rem;
    }

    &__desc {
      font-size: 0.85rem;
    }
  }

  .load-btn {
    min-height: 44px;
    align-self: flex-start;
  }

  .history-list {
    overflow-x: visible;
  }

  .history-row {
    grid-template-columns: auto 1fr;
    gap: 0.5rem 0.75rem;
    padding: 0.75rem 0.9rem;

    &--header {
      display: none;
    }

    &__email {
      grid-column: 1 / -1;
      font-weight: 600;
      white-space: normal;
      word-break: break-all;
    }

    &__action {
      grid-column: 1;
    }

    &__name {
      grid-column: 2;
      text-align: right;
      word-break: break-word;
    }

    &__books,
    &__date {
      grid-column: 1 / -1;
      display: flex;
      justify-content: space-between;
      font-size: 0.78rem;

      &::before {
        color: var(--color-text-subtle);
        font-weight: 500;
      }
    }

    &__books::before {
      content: 'Livros afetados:';
    }

    &__date::before {
      content: 'Data:';
    }

    &__books {
      text-align: left;
    }
  }
}
</style>
