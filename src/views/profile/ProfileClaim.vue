<template>
  <section class="profile-page">
    <header class="profile-header">
      <h1>Meu perfil</h1>
      <p>Gerenciar vínculo de menções</p>
    </header>

    <div class="rules-card">
      <h2>Regras do vínculo</h2>
      <ul>
        <li>Você só pode ter <strong>um vínculo ativo por vez</strong>.</li>
        <li>Você pode <strong>desvincular</strong> seu vínculo atual a qualquer momento.</li>
        <li>Um nome já vinculado por outra conta <strong>não pode ser vinculado novamente</strong>.</li>
        <li v-if="authStore.isAdmin">Como administrador, você também vê o histórico recente de alterações.</li>
      </ul>
    </div>

    <div class="content-grid">
      <article class="profile-card">
        <h2>Vínculo atual</h2>

        <p v-if="loadingStatus" class="muted">Carregando status…</p>
        <p v-else-if="claimStatus?.claimed_quem_nome" class="status status--active">
          Vinculado como: <strong>{{ claimStatus.claimed_quem_nome }}</strong>
        </p>
        <p v-else class="status">Nenhum vínculo ativo no momento.</p>

        <form class="claim-form" @submit.prevent="submitClaim">
          <label for="quemNome">Nome em menções</label>
          <input
            id="quemNome"
            v-model.trim="quemNome"
            type="text"
            placeholder="Ex.: Wanderson"
            :disabled="isSubmitting || loadingStatus"
            autocomplete="off"
          />

          <div class="actions">
            <button type="submit" :disabled="isSubmitting || loadingStatus || !isValid || hasActiveClaim">
              <span v-if="isSubmitting">Vinculando…</span>
              <span v-else>Vincular nome</span>
            </button>

            <button
              type="button"
              class="btn-danger"
              :disabled="isUnclaiming || loadingStatus || !hasActiveClaim"
              @click="unclaim"
            >
              <span v-if="isUnclaiming">Desvinculando…</span>
              <span v-else>Desvincular vínculo atual</span>
            </button>
          </div>
        </form>

        <p v-if="error" class="feedback feedback--error">{{ error }}</p>
        <p v-if="successMessage" class="feedback feedback--success">{{ successMessage }}</p>
      </article>

      <article v-if="authStore.isAdmin" class="profile-card">
        <h2>Histórico (admin)</h2>
        <p class="muted">Últimas alterações de vínculo registradas no sistema.</p>

        <p v-if="loadingHistory" class="muted">Carregando histórico…</p>
        <p v-else-if="historyError" class="feedback feedback--error">{{ historyError }}</p>

        <ul v-else-if="history.length > 0" class="history-list">
          <li v-for="item in history" :key="item.id" class="history-item">
            <div>
              <strong>{{ item.user_name }}</strong>
              <span class="history-item__meta"> · {{ item.action_label }} </span>
            </div>
            <div class="history-item__detail">
              <span>{{ item.quem_nome || '—' }}</span>
              <span>{{ formatDateTime(item.created_at) }}</span>
            </div>
          </li>
        </ul>

        <p v-else class="muted">Sem alterações registradas.</p>
      </article>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  claimRegister,
  getClaimHistory,
  getMyClaimStatus,
  unclaimRegister,
  type ClaimHistoryEntry,
  type MyClaimStatus,
} from '@/composables/useApi'
import { useAuthStore } from '@/stores'

const router = useRouter()
const authStore = useAuthStore()

if (!authStore.isLoggedIn) {
  router.replace('/login')
}

const quemNome = ref(authStore.user?.name ?? '')
const isSubmitting = ref(false)
const isUnclaiming = ref(false)
const loadingStatus = ref(false)
const error = ref('')
const successMessage = ref('')

const claimStatus = ref<MyClaimStatus | null>(null)

const loadingHistory = ref(false)
const historyError = ref('')
const history = ref<ClaimHistoryEntry[]>([])

const isValid = computed(() => quemNome.value.trim().length >= 2)
const hasActiveClaim = computed(() => !!claimStatus.value?.claimed_quem_nome)

const formatDateTime = (iso?: string) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

const loadStatus = async () => {
  loadingStatus.value = true
  error.value = ''

  try {
    claimStatus.value = await getMyClaimStatus()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Não foi possível carregar seu claim atual.'
  } finally {
    loadingStatus.value = false
  }
}

const loadHistory = async () => {
  if (!authStore.isAdmin) return

  loadingHistory.value = true
  historyError.value = ''

  try {
    history.value = await getClaimHistory()
  } catch (err) {
    historyError.value = err instanceof Error ? err.message : 'Não foi possível carregar o histórico.'
  } finally {
    loadingHistory.value = false
  }
}

const submitClaim = async () => {
  if (!isValid.value || hasActiveClaim.value) return

  isSubmitting.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const result = await claimRegister(quemNome.value)

    if (typeof result.updated_count === 'number' && typeof result.matched_count === 'number') {
      successMessage.value = `Pronto! ${result.updated_count} livro(s) vinculados de ${result.matched_count} menção(ões) encontradas.`
    } else {
      successMessage.value = result.message ?? 'Vínculo realizado com sucesso.'
    }

    await loadStatus()
    await loadHistory()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Não foi possível concluir o vínculo.'
  } finally {
    isSubmitting.value = false
  }
}

const unclaim = async () => {
  if (!hasActiveClaim.value) return

  isUnclaiming.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const result = await unclaimRegister()
    successMessage.value = result.message ?? 'Claim removido com sucesso.'

    await loadStatus()
    await loadHistory()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Não foi possível desvincular o claim atual.'
  } finally {
    isUnclaiming.value = false
  }
}

onMounted(async () => {
  await loadStatus()
  await loadHistory()
})
</script>

<style lang="scss" scoped>
.profile-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.25rem 1rem 2rem;
}

.profile-header {
  margin-bottom: 1rem;

  h1 {
    margin: 0;
    font-size: 1.45rem;
    color: var(--color-text-default);
  }

  p {
    margin-top: 0.35rem;
    color: var(--color-text-subtle);
  }
}

.rules-card,
.profile-card {
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  padding: 1rem;
}

.rules-card {
  margin-bottom: 1rem;

  h2 {
    margin: 0 0 0.5rem;
    font-size: 1rem;
  }

  ul {
    margin: 0;
    padding-left: 1.1rem;
    color: var(--color-text-subtle);
    display: grid;
    gap: 0.35rem;
  }
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 980px) {
    grid-template-columns: 1.1fr 0.9fr;
  }
}

.profile-card {
  h2 {
    margin: 0;
    font-size: 1rem;
  }
}

.status {
  margin: 0.65rem 0;
  color: var(--color-text-subtle);

  &--active {
    color: var(--color-text-default);
  }
}

.claim-form {
  margin-top: 0.7rem;
  display: grid;
  gap: 0.5rem;

  label {
    font-size: 0.85rem;
    color: var(--color-text-subtle);
  }

  input {
    width: 100%;
    border: 1px solid var(--color-border-default);
    border-radius: var(--border-radius-sm);
    min-height: 2.5rem;
    padding: 0.55rem 0.7rem;
    background: var(--color-surface-default);
    color: var(--color-text-default);
    font-family: var(--font-family-body);
  }
}

.actions {
  margin-top: 0.4rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  button {
    border: none;
    border-radius: var(--border-radius-sm);
    background: var(--color-action-default);
    color: var(--color-surface-default);
    min-height: 2.5rem;
    padding: 0.6rem 0.95rem;
    cursor: pointer;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .btn-danger {
    background: #5c2b2b;
  }
}

.muted {
  color: var(--color-text-subtle);
}

.feedback {
  margin: 0.8rem 0 0;
  font-size: 0.92rem;

  &--error {
    color: #c0392b;
  }

  &--success {
    color: #2e7d32;
  }
}

.history-list {
  margin: 0.75rem 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.65rem;
}

.history-item {
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-sm);
  padding: 0.6rem 0.7rem;

  &__meta,
  &__detail {
    color: var(--color-text-subtle);
    font-size: 0.88rem;
  }

  &__detail {
    margin-top: 0.3rem;
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
  }
}
</style>
