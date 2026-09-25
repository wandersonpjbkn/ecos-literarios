<template>
  <Transition name="update-banner">
    <div v-if="isVisible" class="update-banner" role="status" aria-live="polite">
      <span class="update-banner__text">Tem uma versão nova da plataforma</span>
      <AppButton class="update-banner__btn" variant="primary" size="md" @click="reload">
        <BaseIcon name="reload" aria-hidden="true" />
        Atualizar
      </AppButton>
      <button class="update-banner__dismiss" type="button" aria-label="Fechar" @click="isVisible = false">
        <BaseIcon name="times" aria-hidden="true" />
      </button>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import AppButton from '@/components/AppButton.vue'
import { ref, onMounted } from 'vue'

const isVisible = ref(false)

const reload = () => window.location.reload()

onMounted(() => {
  if (!('serviceWorker' in navigator)) return

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    isVisible.value = true
  })
})
</script>

<style lang="scss" scoped>
.update-banner {
  --icn-size: 1rem;

  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;

  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  min-width: 280px;
  max-width: calc(100dvw - 2rem);

  background: var(--color-text-default);
  color: var(--color-surface-default);
  border-radius: var(--border-radius-default);
  box-shadow: var(--shadow-xl);

  :deep(.base-icon) {
    width: var(--icn-size);
    height: var(--icn-size);
  }

  &__dismiss {
    display: inline-flex;
    padding: 6px 12px;
    width: fit-content;
    min-width: var(--touch-min);
    min-height: var(--touch-min);
    border: none;
    border-radius: var(--border-radius-sm);
    background: rgba(var(--color-surface-default-rgb), 0.15);

    color: var(--color-surface-default);

    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition:
      background var(--motion-transition-default),
      color var(--motion-transition-default);

    &:hover {
      background: rgba(var(--color-surface-default-rgb), 0.25);
      color: var(--color-surface-default);
    }
  }

  &__text {
    flex: 1;
    font-size: 0.9rem;

    @media (max-width: 767px) {
      font-size: 0.8125rem;
    }
  }

  @media (max-width: 767px) {
    --icn-size: 0.9rem;

    bottom: 4rem;

    &__text {
      font-size: 0.8125rem;
    }
  }
}

.update-banner-enter-active,
.update-banner-leave-active {
  transition:
    opacity var(--motion-transition-default),
    transform var(--motion-transition-default);
}
.update-banner-enter-from,
.update-banner-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}
</style>
