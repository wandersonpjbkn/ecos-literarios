<template>
  <div class="callback-page">
    <div class="callback-card">
      <BaseSpinner v-if="status === 'loading'">
        <p class="callback-msg">Entrando…</p>
      </BaseSpinner>

      <template v-else-if="status === 'error'">
        <BaseIcon name="error" class="callback-error-icon" aria-hidden="true" />
        <p class="callback-msg callback-msg--error">{{ errorMsg }}</p>
        <AppButton :to="{ name: 'auth-login' }" variant="primary">Pedir outro link</AppButton>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import AppButton from '@/components/AppButton.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useAuth } from '@/composables/useAuth'
import { takeReturn } from '@/composables/useReturnPath'

const { handleCallback } = useAuth()
const router = useRouter()

const status = ref<'loading' | 'error'>('loading')
const errorMsg = ref('')

onMounted(async () => {
  try {
    await handleCallback()
    router.replace(takeReturn())
  } catch (err) {
    status.value = 'error'
    errorMsg.value = err instanceof Error ? err.message : 'Não deu pra entrar com esse link. Ele pode ter vencido.'
  }
})
</script>

<style lang="scss" scoped>
.callback-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100dvh - 4rem);
  background: var(--color-background-default);

  @media (max-width: 767px) {
    min-height: calc(100dvh - 6rem);
  }
}

.callback-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  padding: 2rem;
}

.callback-msg {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text-subtle);

  &--error {
    color: var(--color-text-default);
    max-width: 320px;
    line-height: 1.5;
  }
}

.callback-error-icon {
  width: 40px;
  height: 40px;
  color: var(--color-action-default);
}
</style>
