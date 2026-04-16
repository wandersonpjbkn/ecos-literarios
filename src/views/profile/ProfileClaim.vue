<template>
  <div class="profile-section">
    <!-- Header -->
    <SectionHeader title="Vínculos">
      Associe seu usuário às menções do catálogo. Um vínculo ativo conecta seus livros indicados ao seu perfil.
    </SectionHeader>

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

    <BaseSpinner v-if="loadingStatus" class="profile-state">
      <p>Carregando status…</p>
    </BaseSpinner>

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
          <div v-if="!hasActiveClaim" class="field">
            <label class="field__label">Nome em menções</label>
            <p class="field__hint">Selecione o nome que aparece nos livros que você indicou.</p>
            <MultiSelect
              label="Selecionar nome…"
              :options="availableNames"
              :selected="quemNome"
              :multiple="false"
              :searchable="true"
              @toggle="(v) => (quemNome = v)"
            />
          </div>

          <div class="claim-actions">
            <button v-if="!hasActiveClaim" type="submit" class="action-btn" :disabled="isSubmitting || !isValid">
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

import { useAuthStore, useBooksStore } from '@/stores'
import { useApi } from '@/composables'
import { claimRegister, getMyClaimStatus, unclaimRegister, type MyClaimStatus } from '@/composables/useApi'
import MultiSelect from '@/components/MultiSelect.vue'
import SectionHeader from '@/components/admin/SectionHeader.vue'

const router = useRouter()
const authStore = useAuthStore()
const booksStore = useBooksStore()

if (!authStore.isLoggedIn) {
  router.replace('/login')
}

const quemNome = ref('')
const isSubmitting = ref(false)
const isUnclaiming = ref(false)
const loadingStatus = ref(false)
const error = ref('')
const successMessage = ref('')

const claimStatus = ref<MyClaimStatus | null>(null)

const isValid = computed(() => quemNome.value.length >= 2)
const hasActiveClaim = computed(() => claimStatus.value?.has_claim === true)

const availableNames = computed(() => {
  const unclaimed = booksStore.books
    .filter((b) => !b.quem_user_id)
    .map((b) => b.quem)
    .filter(Boolean)
  return [...new Set(unclaimed)].sort()
})

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

    quemNome.value = ''
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

onMounted(async () => {
  await loadStatus()
  if (booksStore.books.length === 0) useApi().fetchBooks()
})
</script>

<style lang="scss" scoped>
// ── Status cards ──────────────────────────────────────────────────
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
    word-break: break-word;

    @media (max-width: 767px) {
      font-size: 0.95rem;
    }
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

// ── Panels ────────────────────────────────────────────────────────
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

  .claim-actions {
    .action-btn {
      flex: 1 1 calc(50% - 0.25rem);
      min-height: 44px;
    }
  }
}

@media (max-width: 480px) {
  .claim-actions .action-btn {
    flex-basis: 100%;
  }
}
</style>
