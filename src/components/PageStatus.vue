<template>
  <!-- Loading -->
  <BaseSpinner v-if="loading" :aria-label="loadingText">
    {{ loadingText }}
  </BaseSpinner>

  <!-- Error -->
  <div v-else-if="error" class="state-screen state-error" role="alert">
    <BaseIcon name="error" aria-hidden="true" />
    <p>{{ friendlyError }}</p>
    <button v-if="onRetry" class="retry-btn" @click="onRetry">Tentar novamente</button>
    <p v-if="errorHint" class="error-hint">{{ errorHint }}</p>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    loading?: boolean
    error?: string | null
    onRetry?: (() => void) | null
    loadingText?: string
    errorHint?: string
  }>(),
  {
    loading: false,
    error: null,
    onRetry: null,
    loadingText: 'Carregando…',
    errorHint: '',
  },
)

const friendlyError = computed(() => {
  const raw = props.error ?? ''
  if (!raw) return 'Algo deu errado.'
  if (/network|fetch|failed to fetch/i.test(raw))
    return 'Não foi possível conectar. Verifique sua conexão e tente novamente.'
  if (/http 4\d\d/i.test(raw)) return 'O conteúdo solicitado não foi encontrado. Tente novamente mais tarde.'
  if (/http 5\d\d/i.test(raw)) return 'O servidor encontrou um problema. Tente novamente em alguns instantes.'
  if (/timeout/i.test(raw)) return 'A conexão demorou demais. Verifique sua internet e tente novamente.'
  return 'Não foi possível carregar o catálogo. Tente novamente.'
})
</script>

<style lang="scss" scoped>
.state-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 24px;
  color: var(--color-text-subtle);
  text-align: center;

  &.state-error {
    color: var(--color-action-default);
  }
}

.retry-btn {
  border: none;
  padding: 10px 20px;
  border-radius: var(--border-radius-sm);
  min-height: 44px;
  font-family: var(--font-family-body);
  font-size: 1rem;
  cursor: pointer;
  background: var(--color-action-default);
  color: var(--color-surface-default);
  transition: opacity var(--motion-transition-default);

  &:hover {
    opacity: 0.85;
    background: var(--color-action-default-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }
}

.error-hint {
  max-width: 440px;
  font-size: 0.82rem;
  color: var(--color-text-subtle);
}
</style>
