<template>
  <!-- Loading -->
  <BaseSpinner v-if="loading" :aria-label="loadingText">
    {{ loadingText }}
  </BaseSpinner>

  <!-- Error: the same centred message as every other screen that has nothing to show. -->
  <EmptyState v-else-if="error" class="state-error" role="alert" title-tag="h1" :title="friendlyError">
    <AppButton v-if="onRetry" variant="primary" @click="onRetry">Tentar de novo</AppButton>
    <!-- Offline, WhatsApp would not open either. -->
    <SupportLink v-if="online" pill />
  </EmptyState>
</template>

<script lang="ts" setup>
import { useOnline } from '@vueuse/core'
import { computed } from 'vue'

import AppButton from '@/components/ui/AppButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import SupportLink from '@/components/ui/SupportLink.vue'

const props = withDefaults(
  defineProps<{
    loading?: boolean
    error?: string | null
    onRetry?: (() => void) | null
    loadingText?: string
    // What failed to open, in the sentence: "o catálogo", "o livro".
    what?: string
  }>(),
  {
    loading: false,
    error: null,
    onRetry: null,
    loadingText: 'Carregando…',
    what: 'o catálogo',
  },
)

const online = useOnline()

const friendlyError = computed(() => {
  const raw = props.error ?? ''
  // Online and still no answer means the platform is down, not the reader's connection (COPY.md).
  if (/network|fetch|failed to fetch|http 5\d\d/i.test(raw))
    return navigator.onLine ? 'A plataforma está fora do ar agora. Tente daqui a pouco.' : 'Você está sem internet.'
  return `Não foi possível abrir ${props.what}. Tente de novo.`
})
</script>
