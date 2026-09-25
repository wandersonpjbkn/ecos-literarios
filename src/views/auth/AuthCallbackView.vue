<template>
  <div class="callback-page">
    <div class="callback-card">
      <BaseSpinner v-if="status === 'loading'">
        <p class="callback-msg">Entrando…</p>
      </BaseSpinner>

      <template v-else-if="status === 'platform'">
        <p class="callback-title">A plataforma está fora do ar agora.</p>
        <p class="callback-msg">
          Seu link funcionou, só a plataforma que não respondeu. Dá pra olhar os livros enquanto isso.
        </p>
        <div class="callback-actions">
          <AppButton variant="primary" @click="enter">Tentar de novo</AppButton>
          <AppButton @click="continueWithoutAccount">Continuar sem entrar</AppButton>
        </div>
      </template>

      <template v-else>
        <BaseIcon name="error" class="callback-error-icon" aria-hidden="true" />
        <p class="callback-msg callback-msg--error">Não deu pra entrar com esse link. Ele pode ter vencido.</p>
        <AppButton :to="{ name: 'auth-login' }" variant="primary">Pedir outro link</AppButton>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import AppButton from '@/components/AppButton.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useErrorReporter } from '@/composables'
import { CallbackError, useAuth } from '@/composables/useAuth'
import { takeReturn } from '@/composables/useReturnPath'

const { handleCallback } = useAuth()
const router = useRouter()

const status = ref<'loading' | 'link' | 'platform'>('loading')

// The browser's or the API's own error ("Failed to fetch") goes to the reporter, never to the screen.
const enter = async () => {
  status.value = 'loading'
  try {
    await handleCallback()
    router.replace(takeReturn())
  } catch (err) {
    status.value = err instanceof CallbackError ? err.reason : 'link'
    useErrorReporter().captureException(err instanceof CallbackError ? err.cause : err, {
      context: `AuthCallback.${status.value}`,
    })
  }
}

// The saved list is shown with the "fora do ar" banner; the session stays and the app retries it on the next visit.
const continueWithoutAccount = () => router.replace(takeReturn())

onMounted(enter)
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

  max-width: 360px;
  line-height: 1.5;

  &--error {
    color: var(--color-text-default);
  }
}

.callback-error-icon {
  width: 40px;
  height: 40px;
  color: var(--color-text-subtle);
}

.callback-title {
  margin: 0;
  max-width: 360px;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-default);
}

.callback-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
}
</style>
