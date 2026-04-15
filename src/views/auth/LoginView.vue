<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Formulário -->
      <div v-if="step === 'form'" class="login-form">
        <div class="field">
          <label for="email" class="field-label">Email</label>
          <input
            id="email"
            ref="inputRef"
            v-model="email"
            type="email"
            class="field-input"
            :class="{ 'is-error': errorMsg }"
            placeholder="seu@email.com"
            autocomplete="email"
            :disabled="loading"
            @keydown.enter="submit"
          />
          <span v-if="errorMsg" class="field-error">{{ errorMsg }}</span>
        </div>

        <button class="submit-btn" :disabled="loading || !email.trim()" @click="submit">
          <span v-if="!loading">Enviar link de acesso</span>
          <span v-else class="loading-dots"> <span /><span /><span /> </span>
        </button>
      </div>

      <!-- Confirmação -->
      <div v-else class="login-sent">
        <div class="sent-icon">✉️</div>
        <p class="sent-title">Link enviado!</p>
        <p class="sent-desc">
          Enviamos um link de acesso para <strong>{{ email }}</strong
          >. Verifique sua caixa de entrada e clique no link para entrar.
        </p>
        <button class="resend-btn" :disabled="resendCooldown > 0" @click="submit">
          <template v-if="resendCooldown > 0">Reenviar em {{ resendCooldown }}s</template>
          <template v-else>Não recebeu? Reenviar</template>
        </button>
      </div>

      <!-- Voltar -->
      <RouterLink :to="{ name: 'catalog-books' }" class="back-link">
        <BaseIcon name="arrow-left" />
        Voltar ao catálogo
      </RouterLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useAuth } from '@/composables/useAuth'
import { useAuthStore } from '@/stores'

const { sendMagicLink } = useAuth()
const authStore = useAuthStore()
const router = useRouter()

const inputRef = ref<HTMLInputElement | null>(null)
const email = ref('')
const loading = ref(false)
const errorMsg = ref('')
const step = ref<'form' | 'sent'>('form')
const resendCooldown = ref(0)

// Se já está logado, redireciona
onMounted(() => {
  if (authStore.isLoggedIn) router.replace('/')
  inputRef.value?.focus()
})

const submit = async () => {
  errorMsg.value = ''

  if (!email.value.trim()) return

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value.trim())) {
    errorMsg.value = 'Digite um email válido.'
    return
  }

  loading.value = true

  try {
    await sendMagicLink(email.value.trim())
    step.value = 'sent'
    startCooldown()
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : 'Erro ao enviar o link. Tente novamente.'
  } finally {
    loading.value = false
  }
}

const startCooldown = () => {
  resendCooldown.value = 60
  const interval = setInterval(() => {
    resendCooldown.value -= 1
    if (resendCooldown.value <= 0) clearInterval(interval)
  }, 1000)
}
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100dvh - 4rem);
  padding: 2rem 1rem;
  background: var(--color-background-default);

  @media (max-width: 767px) {
    min-height: calc(100dvh - 6rem);
  }
}

.login-card {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

// ── Formulário ────────────────────────────────────────────────────
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &-label {
    font-size: 1rem;
    font-weight: 500;
    color: var(--color-text-default);
  }

  &-input {
    height: 48px;
    padding: 0 14px;
    background: var(--color-surface-default);
    border: 1.5px solid var(--color-border-default);
    border-radius: var(--border-radius-default);
    font-family: var(--font-family-body);
    font-size: 1rem;
    color: var(--color-text-default);
    transition:
      border-color var(--motion-transition-default),
      box-shadow var(--motion-transition-default);
    outline: none;

    &::placeholder {
      color: var(--color-text-subtle);
    }

    &:focus {
      border-color: var(--color-action-default);
      box-shadow: 0 0 0 3px var(--color-action-background-subtle);
    }

    &.is-error {
      border-color: #e53e3e;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &-error {
    font-size: 0.82rem;
    color: #e53e3e;
  }
}

.submit-btn {
  height: 48px;
  border: none;
  border-radius: var(--border-radius-default);
  background: var(--color-action-default);
  color: var(--color-surface-default);
  font-family: var(--font-family-body);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    opacity var(--motion-transition-default),
    background var(--motion-transition-default);

  &:hover:not(:disabled) {
    background: var(--color-action-default-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// ── Loading dots ──────────────────────────────────────────────────
.loading-dots {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    animation: dot-bounce 0.9s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.15s;
    }
    &:nth-child(3) {
      animation-delay: 0.3s;
    }
  }
}

@keyframes dot-bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  40% {
    transform: translateY(-5px);
    opacity: 1;
  }
}

// ── Confirmação ───────────────────────────────────────────────────
.login-sent {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
  padding: 1.5rem;
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
}

.sent-icon {
  font-size: 2rem;
  line-height: 1;
}

.sent-title {
  margin: 0;
  font-family: var(--font-family-display);
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--color-text-default);
}

.sent-desc {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-subtle);
  line-height: 1.6;

  strong {
    color: var(--color-text-default);
  }
}

.resend-btn {
  margin-top: 0.25rem;
  padding: 6px 12px;
  border: none;
  background: none;
  font-family: var(--font-family-body);
  font-size: 0.875rem;
  color: var(--color-action-default);
  cursor: pointer;
  transition: opacity var(--motion-transition-default);
  border-radius: var(--border-radius-sm);

  &:hover:not(:disabled) {
    background: var(--color-action-background-subtle);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    color: var(--color-text-subtle);
  }
}

// ── Back link ─────────────────────────────────────────────────────
.back-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--color-text-subtle);
  font-size: 0.9rem;
  text-decoration: none;
  transition: color var(--motion-transition-default);

  &:hover {
    color: var(--color-action-default);
  }
}
</style>
