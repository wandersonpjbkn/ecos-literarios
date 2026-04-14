<template>
  <div class="profile-section">
    <!-- Header -->
    <div class="profile-section__header">
      <div>
        <h2 class="profile-section__title">Vínculos</h2>
        <p class="profile-section__desc">
          Associe seu usuário às menções do catálogo. Um vínculo ativo conecta seus livros indicados ao seu perfil.
        </p>
      </div>
    </div>

    <!-- Status cards -->
    <div class="status-grid">
      <article class="status-card">
        <p class="status-card__label">Status</p>
        <p class="status-card__value">
          <template v-if="loadingStatus">—</template>
          <template v-else-if="claimStatus?.has_claim">Vinculado</template>
          <template v-else>Sem vínculo</template>
        </p>
      </article>

      <article class="status-card">
        <p class="status-card__label">Nome vinculado</p>
        <p class="status-card__value">
          <template v-if="loadingStatus">—</template>
          <template v-else-if="claimStatus?.claim_name">{{ claimStatus.claim_name }}</template>
          <template v-else>—</template>
        </p>
      </article>

      <article class="status-card">
        <p class="status-card__label">Livros vinculados</p>
        <p class="status-card__value">
          <template v-if="loadingStatus">—</template>
          <template v-else>{{ claimStatus?.claimed_books ?? 0 }}</template>
        </p>
      </article>
    </div>

    <div v-if="loadingStatus" class="profile-state">
      <div class="spinner" aria-hidden="true" />
      <p>Carregando status…</p>
    </div>

    <template v-else>
      <!-- Painel de ação -->
      <section class="claim-panel">
        <header class="claim-panel__header">
          <h3>Gerenciar vínculo</h3>
        </header>

        <!-- Warning de claims múltiplos -->
        <p v-if="claimStatus?.warning" class="feedback feedback--warning">
          {{ claimStatus.warning }}
        </p>

        <form class="claim-form" @submit.prevent="submitClaim">
          <div class="field">
            <label for="quemNome" class="field__label">Nome em menções</label>
            <p class="field__hint">Digite exatamente como aparece nos registros do catálogo.</p>
            <input
              id="quemNome"
              v-model.trim="quemNome"
              type="text"
              class="field__input"
              placeholder="Ex.: Wanderson"
              :disabled="isSubmitting || hasActiveClaim"
              autocomplete="off"
            />
          </div>

          <div class="claim-actions">
            <button type="submit" class="action-btn" :disabled="isSubmitting || !isValid || hasActiveClaim">
              <span v-if="isSubmitting">Vinculando…</span>
              <span v-else>Vincular nome</span>
            </button>

            <button
              type="button"
              class="action-btn action-btn--danger"
              :disabled="isUnclaiming || !hasActiveClaim"
              @click="unclaim"
            >
              <span v-if="isUnclaiming">Desvinculando…</span>
              <span v-else>Desvincular</span>
            </button>
          </div>
        </form>

        <p v-if="error" class="feedback feedback--error">{{ error }}</p>
        <p v-if="successMessage" class="feedback feedback--success">{{ successMessage }}</p>
      </section>

      <!-- Regras -->
      <section class="rules-panel">
        <header class="rules-panel__header">
          <h3>Regras do vínculo</h3>
        </header>
        <ul class="rules-list">
          <li>Você só pode ter <strong>um vínculo ativo por vez</strong>.</li>
          <li>Você pode <strong>desvincular</strong> a qualquer momento e refazer com outro nome.</li>
          <li>Um nome já vinculado por outra conta <strong>não pode ser reivindicado novamente</strong>.</li>
        </ul>
      </section>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { claimRegister, getMyClaimStatus, unclaimRegister, type MyClaimStatus } from '@/composables/useApi'
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

const isValid = computed(() => quemNome.value.trim().length >= 2)
const hasActiveClaim = computed(() => claimStatus.value?.has_claim === true)

const loadStatus = async () => {
  loadingStatus.value = true
  error.value = ''

  try {
    claimStatus.value = await getMyClaimStatus()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Não foi possível carregar seu vínculo atual.'
  } finally {
    loadingStatus.value = false
  }
}

const submitClaim = async () => {
  if (!isValid.value || hasActiveClaim.value) return

  isSubmitting.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const result = await claimRegister(quemNome.value)

    if (result.name_synced && result.claim_name && authStore.user) {
      authStore.user = { ...authStore.user, name: result.claim_name }
    }

    if (typeof result.updated_books === 'number' && typeof result.matched_books === 'number') {
      successMessage.value = `Pronto! ${result.updated_books} livro(s) vinculados de ${result.matched_books} menção(ões) encontradas.`
    } else {
      successMessage.value = result.message ?? 'Vínculo realizado com sucesso.'
    }

    await loadStatus()
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
    successMessage.value = result.message ?? 'Vínculo removido com sucesso.'
    await loadStatus()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Não foi possível desvincular o vínculo atual.'
  } finally {
    isUnclaiming.value = false
  }
}

onMounted(loadStatus)
</script>

<style lang="scss" scoped>
// ── Section shell — delegated to ProfileLayout :deep(.profile-section) ──
.profile-section {
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

// ── Status cards — mesmo padrão do AdminEnrichment ────────────────
.status-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
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
  }
}

// ── Loading state ─────────────────────────────────────────────────
.profile-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
  text-align: center;
  color: var(--color-text-subtle);
}

.spinner {
  width: 34px;
  height: 34px;
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

// ── Panels — mesmo padrão do execution-panel do AdminEnrichment ───
.claim-panel,
.rules-panel {
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  background: var(--color-surface-default);
  padding: 1rem;
}

.claim-panel {
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

.rules-panel {
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

.rules-list {
  margin: 0;
  padding-left: 1.1rem;
  color: var(--color-text-subtle);
  font-size: 0.9rem;
  display: grid;
  gap: 0.4rem;
  line-height: 1.5;
}

// ── Form ──────────────────────────────────────────────────────────
.claim-form {
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
  }
}

.claim-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
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

  &--danger {
    background: var(--color-background-subtle);
    color: var(--color-text-default);
    border: 1px solid var(--color-border-default);

    &:hover:not(:disabled) {
      background: #5c2b2b;
      border-color: #5c2b2b;
      color: #fff;
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

  &--warning {
    color: var(--color-text-subtle);
    background: var(--color-background-subtle);
    border: 1px solid var(--color-border-default);
    border-radius: var(--border-radius-sm);
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
    margin-bottom: 0.75rem;
  }
}

// ── Responsive ────────────────────────────────────────────────────
@media (max-width: 767px) {
  .status-grid {
    grid-template-columns: 1fr 1fr;
  }

  .status-grid .status-card:last-child {
    grid-column: 1 / -1;
  }

  .field__input {
    max-width: 100%;
  }
}
</style>
