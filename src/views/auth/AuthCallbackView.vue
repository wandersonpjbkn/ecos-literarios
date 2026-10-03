<template>
  <div class="callback-page">
    <div class="callback-card">
      <BaseSpinner v-if="status === 'loading'">
        <p class="callback-loading">Entrando…</p>
      </BaseSpinner>

      <EmptyState
        v-else-if="status === 'platform'"
        ref="message"
        title-tag="h1"
        title="A plataforma está fora do ar agora."
        text="Seu link funcionou; quem não respondeu foi a plataforma. Enquanto isso, você pode olhar os livros."
      >
        <AppButton variant="primary" @click="enter">Tentar de novo</AppButton>
        <AppButton @click="continueWithoutAccount">Continuar sem entrar</AppButton>
        <SupportLink pill :email="lastEmail" />
      </EmptyState>

      <EmptyState v-else-if="status === 'suspended'" ref="message" title-tag="h1" title="Esta conta está suspensa.">
        <SupportLink pill :email="lastEmail" />
      </EmptyState>

      <EmptyState v-else-if="status === 'resent'" ref="message" title-tag="h1" title="Enviamos outro link">
        <template #text
          >Foi para <strong>{{ resentTo }}</strong
          >. Abra seu e-mail e toque no link para entrar.</template
        >
        <AppButton variant="ghost" :to="{ name: 'auth-login' }">Usar outro e-mail</AppButton>
        <SupportLink pill :email="lastEmail" />
      </EmptyState>

      <EmptyState v-else ref="message" title-tag="h1" title="Não foi possível entrar com esse link.">
        <template #text>
          Ele pode ter vencido.<template v-if="lastEmail">
            O link foi pedido para <strong>{{ lastEmail }}</strong
            >.</template
          >
        </template>
        <template v-if="lastEmail">
          <AppButton variant="primary" :disabled="sending" @click="resend">Enviar outro link</AppButton>
          <AppButton :to="{ name: 'auth-login' }">Usar outro e-mail</AppButton>
        </template>
        <AppButton v-else :to="{ name: 'auth-login' }" variant="primary">Pedir outro link</AppButton>
        <SupportLink pill :email="lastEmail" />
      </EmptyState>
      <AppNotice v-if="status === 'link' && resendError" :text="resendError" />

      <AppButton
        v-if="status === 'link' || status === 'resent' || status === 'suspended'"
        :to="lastCatalog"
        variant="ghost"
        size="md"
        class="back-link"
      >
        <BaseIcon name="arrow-left" aria-hidden="true" />
        Voltar ao catálogo
      </AppButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useErrorReporter } from '@/composables'
import { CallbackError, useAuth } from '@/composables/useAuth'
import { useLastCatalog } from '@/composables/useLastCatalog'
import { forgetEmail, recallEmail } from '@/composables/useLastEmail'
import { usePageMeta } from '@/composables/usePageMeta'
import { takeReturn } from '@/composables/useReturnPath'

import AppButton from '@/components/ui/AppButton.vue'
import AppNotice from '@/components/ui/AppNotice.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import SupportLink from '@/components/ui/SupportLink.vue'

const TITLES = {
  loading: 'Entrando',
  link: 'Não foi possível entrar',
  platform: 'A plataforma está fora do ar',
  suspended: 'Conta suspensa',
  resent: 'Enviamos outro link',
} as const

const router = useRouter()
const lastCatalog = useLastCatalog()

const { handleCallback, sendMagicLink } = useAuth()

const status = ref<'loading' | 'link' | 'platform' | 'resent' | 'suspended'>('loading')

const lastEmail = ref(recallEmail())
const resentTo = ref('')
const message = ref<InstanceType<typeof EmptyState> | null>(null)
const sending = ref(false)
const resendError = ref('')

usePageMeta(() => ({ title: TITLES[status.value], description: 'Entrada no Ecos Literários pelo link do e-mail.' }))

const resend = async () => {
  if (!lastEmail.value) return
  sending.value = true
  resendError.value = ''
  try {
    await sendMagicLink(lastEmail.value)
    resentTo.value = lastEmail.value
    forgetEmail()
    status.value = 'resent'
    await nextTick()
    message.value?.focus()
  } catch (err) {
    const tooSoon = (err as { tooSoon?: boolean }).tooSoon === true
    resendError.value = tooSoon
      ? 'Você já pediu um link agora há pouco. Espere um minuto e peça de novo.'
      : 'Não foi possível enviar agora. Tente de novo daqui a pouco.'
    if (!tooSoon) useErrorReporter().captureException(err, { context: 'AuthCallback.resend' })
  } finally {
    sending.value = false
  }
}

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
    await nextTick()
    message.value?.focus()
  }
}

const continueWithoutAccount = () => router.replace(takeReturn())

onMounted(enter)
</script>

<style lang="scss" scoped>
.callback-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  background: var(--color-background-default);
}

.callback-card {
  display: flex;
  max-width: var(--message-max);
  flex-direction: column;
  align-items: stretch;
}

.back-link {
  align-self: center;
  margin-top: var(--space-6);
}

.callback-loading {
  margin: 0;
  font-size: var(--font-size-body);
  color: var(--color-text-subtle);
}
</style>
