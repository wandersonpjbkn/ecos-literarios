<template>
  <div class="callback-page">
    <div class="callback-card">
      <template v-if="status === 'loading'">
        <div class="spinner" aria-hidden="true" />
        <p class="callback-msg">Verificando acesso…</p>
      </template>

      <template v-else-if="status === 'error'">
        <BaseIcon name="error" class="callback-error-icon" aria-hidden="true" />
        <p class="callback-msg callback-msg--error">{{ errorMsg }}</p>
        <RouterLink :to="{ name: 'auth-login' }" class="callback-btn">Tentar novamente</RouterLink>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useAuth } from '@/composables/useAuth'

const { handleCallback } = useAuth()
const router = useRouter()

const status = ref<'loading' | 'error'>('loading')
const errorMsg = ref('')

onMounted(async () => {
  try {
    await handleCallback()
    // Redireciona para a home após login bem-sucedido
    router.replace('/')
  } catch (err) {
    status.value = 'error'
    errorMsg.value =
      err instanceof Error ? err.message : 'Não foi possível verificar o acesso. O link pode ter expirado.'
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
}

.callback-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  padding: 2rem;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-border-default);
  border-top-color: var(--color-action-default);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

.callback-btn {
  margin-top: 0.5rem;
  padding: 10px 20px;
  min-height: 44px;
  border: none;
  border-radius: var(--border-radius-sm);
  background: var(--color-action-default);
  color: var(--color-surface-default);
  text-decoration: none;
  font-size: 1rem;
  font-family: var(--font-family-body);
  display: inline-flex;
  align-items: center;
  transition: opacity var(--motion-transition-default);

  &:hover {
    opacity: 0.85;
  }
}
</style>
