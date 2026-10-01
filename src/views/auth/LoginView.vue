<template>
  <div class="login-page">
    <div class="login-card">
      <!-- After sending, the introduction leaves: only the message and its ways out stay (slice 8d). -->
      <header v-if="step === 'form'" class="login-head">
        <h1 class="login-head__title">Entrar</h1>
        <p class="login-head__text">Coloque seu e-mail e nós enviamos um link para você entrar. Não é preciso senha.</p>
      </header>

      <div v-if="step === 'form'" class="login-form">
        <AppField
          id="email"
          v-model="email"
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          autocomplete="email"
          :error="errorMsg"
          :disabled="loading"
          @keydown.enter="submit"
        />

        <!-- Enabled with the field empty: a click says what is missing, a disabled button would say nothing. -->
        <AppButton class="submit-btn" variant="primary" :disabled="loading" @click="submit">
          {{ loading ? 'Enviando…' : 'Enviar o link' }}
        </AppButton>
      </div>

      <!-- Confirmação -->
      <div v-else class="login-sent">
        <AppNotice v-if="errorMsg" :text="errorMsg" />
        <EmptyState ref="sentMessage" title="Enviamos o link" title-tag="h1">
          <template #text
            >Foi para <strong>{{ email }}</strong
            >. Abra seu e-mail e toque no link para entrar.</template
          >
          <!-- Waiting is text, not a grey button: a disabled button looks broken, the text says when. -->
          <p v-if="resendCooldown > 0" class="resend-wait" aria-live="polite">
            Você pode pedir outro link em {{ resendCooldown === 1 ? '1 segundo' : `${resendCooldown} segundos` }}
          </p>
          <AppButton v-else class="resend-btn" @click="submit">Enviar outro link</AppButton>
          <AppButton variant="ghost" @click="retypeEmail">Usar outro e-mail</AppButton>
          <SupportLink pill :email="email.trim()" />
        </EmptyState>
      </div>

      <!-- Voltar -->
      <AppButton :to="lastCatalog" variant="ghost" size="md" class="back-link">
        <BaseIcon name="arrow-left" aria-hidden="true" />
        Voltar ao catálogo
      </AppButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref, onBeforeUnmount, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores'

import { useAuth } from '@/composables/useAuth'
import { useLastCatalog } from '@/composables/useLastCatalog'
import { rememberEmail } from '@/composables/useLastEmail'
import { usePageMeta } from '@/composables/usePageMeta'
import { rememberReturn, takeReturn } from '@/composables/useReturnPath'

import AppButton from '@/components/ui/AppButton.vue'
import AppField from '@/components/ui/AppField.vue'
import AppNotice from '@/components/ui/AppNotice.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import SupportLink from '@/components/ui/SupportLink.vue'

const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()

usePageMeta({ title: 'Entrar', description: 'Entre no Ecos Literários com um link no seu e-mail.' })

const { sendMagicLink } = useAuth()

const lastCatalog = useLastCatalog()

const email = ref('')
const loading = ref(false)
const errorMsg = ref('')
const step = ref<'form' | 'sent'>('form')
const sentMessage = ref<InstanceType<typeof EmptyState> | null>(null)

const resendCooldown = ref(0)

let cooldown: ReturnType<typeof setInterval> | undefined

// Back to the field, still filled, for whoever typed the address wrong.
const retypeEmail = async () => {
  errorMsg.value = ''
  step.value = 'form'
  await nextTick()
  document.querySelector<HTMLInputElement>('#email')?.focus()
}

const submit = async () => {
  errorMsg.value = ''

  if (!email.value.trim()) {
    errorMsg.value = 'Escreva o seu e-mail.'
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value.trim())) {
    errorMsg.value = 'Digite um e-mail válido.'
    return
  }

  loading.value = true
  rememberReturn(route.query.voltar)

  try {
    await sendMagicLink(email.value.trim())
    rememberEmail(email.value.trim())
    step.value = 'sent'
    // The form that had the focus is gone: the news takes it, so a screen reader hears it.
    nextTick(() => sentMessage.value?.focus())
    startCooldown()
  } catch (err) {
    const tooSoon = (err as { tooSoon?: boolean }).tooSoon === true
    errorMsg.value = tooSoon
      ? 'Você já pediu um link agora há pouco. Espere um minuto e peça de novo.'
      : 'Não foi possível enviar o link. Tente de novo.'
  } finally {
    loading.value = false
  }
}

const startCooldown = () => {
  clearInterval(cooldown)
  resendCooldown.value = 60
  cooldown = setInterval(() => {
    resendCooldown.value -= 1
    if (resendCooldown.value <= 0) clearInterval(cooldown)
  }, 1000)
}

onMounted(() => {
  if (authStore.isLoggedIn) {
    rememberReturn(route.query.voltar)
    router.replace(takeReturn())
  }
  document.getElementById('email')?.focus()
})

onBeforeUnmount(() => clearInterval(cooldown))
</script>

<style lang="scss" scoped>
.submit-btn {
  width: 100%;
}

.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  // The auth frame gives the whole height under its bar: the form sits in the middle of it.
  min-height: 100%;
  padding: var(--space-8) var(--space-4);
  background: var(--color-background-default);
}

.login-card {
  width: 100%;
  max-width: var(--message-max);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.login-head {
  &__title {
    margin: 0;
    font-size: var(--font-size-title);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-default);
  }

  &__text {
    margin: var(--space-1) 0 0;
    font-size: var(--font-size-body);
    color: var(--color-text-secondary);
  }
}

.resend-wait {
  margin: 0;
  font-size: var(--font-size-ui);
  color: var(--color-text-subtle);
}

.back-link {
  align-self: center;
}
</style>
