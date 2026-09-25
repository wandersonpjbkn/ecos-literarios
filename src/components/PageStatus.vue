<template>
  <!-- Loading -->
  <BaseSpinner v-if="loading" :aria-label="loadingText">
    {{ loadingText }}
  </BaseSpinner>

  <!-- Error -->
  <div v-else-if="error" class="state-screen state-error" role="alert">
    <BaseIcon name="error" aria-hidden="true" />
    <p>{{ friendlyError }}</p>
    <AppButton v-if="onRetry" class="retry-btn" @click="onRetry">Tentar de novo</AppButton>
    <p v-if="errorHint" class="error-hint">{{ errorHint }}</p>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import AppButton from '@/components/AppButton.vue'

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
  if (/network|fetch|failed to fetch/i.test(raw)) return 'Não deu pra abrir o catálogo. Confira sua internet.'
  if (/http 4\d\d/i.test(raw)) return 'Não deu pra abrir o catálogo.'
  if (/http 5\d\d/i.test(raw)) return 'A plataforma está fora do ar agora. Tente daqui a pouco.'
  if (/timeout/i.test(raw)) return 'Demorou demais pra responder. Confira sua internet.'
  return 'Não deu pra abrir o catálogo.'
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

.error-hint {
  max-width: 440px;
  font-size: 0.82rem;
  color: var(--color-text-subtle);
}
</style>
