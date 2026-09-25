<template>
  <div class="forbidden-page">
    <div class="forbidden-card">
      <BaseIcon name="error" class="forbidden-icon" aria-hidden="true" />
      <h1 class="forbidden-title">Sem permissão</h1>
      <p class="forbidden-desc">
        Só quem cuida da plataforma entra aqui.<br />
        Voltando para o catálogo em <strong>{{ countdown }} segundos</strong>.
      </p>
      <AppButton :to="{ name: 'catalog-books' }" variant="primary">Ir para o catálogo</AppButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import AppButton from '@/components/AppButton.vue'
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

  @media (max-width: 767px) {
    min-height: calc(100dvh - 6rem);
  }
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
</style>
