<template>
  <div class="forbidden-page">
    <div class="forbidden-card">
      <BaseIcon name="error" class="forbidden-icon" aria-hidden="true" />
      <h1 class="forbidden-title">Sem permissão</h1>
      <p class="forbidden-desc">
        Esta área é restrita a administradores.<br />
        Você será redirecionado em <strong>{{ countdown }}s</strong>.
      </p>
      <RouterLink to="/" class="forbidden-btn">Ir agora</RouterLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const countdown = ref(5)
let interval: ReturnType<typeof setInterval>

onMounted(() => {
  interval = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      clearInterval(interval)
      router.replace('/')
    }
  }, 1000)
})

onBeforeUnmount(() => clearInterval(interval))
</script>

<style lang="scss" scoped>
.forbidden-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100dvh - 4rem);
  background: var(--color-background-default);
  padding: 2rem 1rem;
}

.forbidden-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  max-width: 360px;
}

.forbidden-icon {
  width: 48px;
  height: 48px;
  color: var(--color-action-default);
}

.forbidden-title {
  margin: 0;
  font-family: var(--font-family-display);
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--color-text-default);
}

.forbidden-desc {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-text-subtle);
  line-height: 1.6;

  strong {
    color: var(--color-text-default);
  }
}

.forbidden-btn {
  margin-top: 0.5rem;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 10px 24px;
  border-radius: var(--border-radius-sm);
  background: var(--color-action-default);
  color: var(--color-surface-default);
  text-decoration: none;
  font-size: 1rem;
  font-family: var(--font-family-body);
  transition: opacity var(--motion-transition-default);

  &:hover {
    opacity: 0.85;
  }
}
</style>
