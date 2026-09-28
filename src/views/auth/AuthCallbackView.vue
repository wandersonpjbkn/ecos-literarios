<template>
  <div class="callback-page">
    <div class="callback-card">
      <BaseSpinner v-if="status === 'loading'">
        <p class="callback-loading">Entrando…</p>
      </BaseSpinner>

      <EmptyState
        v-else-if="status === 'platform'"
        title="A plataforma está fora do ar agora."
        text="Seu link funcionou; quem não respondeu foi a plataforma. Enquanto isso, você pode olhar os livros."
      >
        <AppButton variant="primary" @click="enter">Tentar de novo</AppButton>
        <AppButton @click="continueWithoutAccount">Continuar sem entrar</AppButton>
      </EmptyState>

      <EmptyState v-else-if="status === 'resent'" ref="resentMessage" title="Enviamos outro link">
        <template #text>Foi para <strong>{{ resentTo }}</strong>. Abra seu e-mail e toque no link para entrar.</template>
      </EmptyState>

      <EmptyState v-else title="Não foi possível entrar com esse link.">
        <!-- The address wraps in the text; a long one inside a pill would run off a phone screen. -->
        <template #text>
          Ele pode ter vencido.<template v-if="lastEmail"> O link foi pedido para <strong>{{ lastEmail }}</strong>.</template>
        </template>
        <template v-if="lastEmail">
          <AppButton variant="primary" :disabled="sending" @click="resend">Enviar outro link</AppButton>
          <AppButton :to="{ name: 'auth-login' }">Usar outro e-mail</AppButton>
        </template>
        <AppButton v-else :to="{ name: 'auth-login' }" variant="primary">Pedir outro link</AppButton>
      </EmptyState>
      <AppNotice v-if="status === 'link' && resendError" :text="resendError" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AppButton from '@/components/AppButton.vue'
import AppNotice from '@/components/AppNotice.vue'
import EmptyState from '@/components/EmptyState.vue'
import { nextTick, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useErrorReporter } from '@/composables'
import { CallbackError, useAuth } from '@/composables/useAuth'
import { forgetEmail, recallEmail } from '@/composables/useLastEmail'
import { takeReturn } from '@/composables/useReturnPath'

const { handleCallback, sendMagicLink } = useAuth()
const router = useRouter()

const status = ref<'loading' | 'link' | 'platform' | 'resent'>('loading')

// Expired link: resend to the e-mail that asked for it (same browser, within the hour) instead of retyping it.
const lastEmail = ref(recallEmail())
const resentTo = ref('')
const resentMessage = ref<InstanceType<typeof EmptyState> | null>(null)
const sending = ref(false)
const resendError = ref('')

const resend = async () => {
  if (!lastEmail.value) return
  sending.value = true
  resendError.value = ''
  try {
    await sendMagicLink(lastEmail.value)
    resentTo.value = lastEmail.value
    forgetEmail()
    status.value = 'resent'
    // The pressed button is gone; move focus to the news so it is not lost on the page.
    await nextTick()
    resentMessage.value?.focus()
  } catch (err) {
    resendError.value = 'Não foi possível enviar agora. Tente de novo daqui a pouco.'
    useErrorReporter().captureException(err, { context: 'AuthCallback.resend' })
  } finally {
    sending.value = false
  }
}

// The browser's or the API's own error ("Failed to fetch") goes to the reporter, never to the screen.
const enter = async () => {
  status.value = 'loading'
  try {
    await handleCallback()
    forgetEmail()
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
  // The auth frame gives the whole height under its bar: the message sits in the middle of it.
  min-height: 100%;
  background: var(--color-background-default);
}

.callback-card {
  display: flex;
  max-width: var(--message-max);
  flex-direction: column;
  align-items: stretch;
}

.callback-loading {
  margin: 0;
  font-size: var(--font-size-body);
  color: var(--color-text-subtle);
}
</style>
