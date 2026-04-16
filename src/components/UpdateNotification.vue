<template>
  <Transition name="update-banner">
    <div v-if="isVisible" class="update-banner" role="status" aria-live="polite">
      <span class="update-banner__text">Nova versão disponível</span>
      <button class="update-banner__btn" type="button" @click="reload">
        <span v-if="!isMobile">Recarregar</span>
        <BaseIcon name="reload" class="update-banner__icon" aria-hidden="true" />
      </button>
      <button class="update-banner__dismiss" type="button" aria-label="Dispensar" @click="isVisible = false">
        <BaseIcon name="times" aria-hidden="true" />
      </button>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useMediaQuery } from '@vueuse/core'

import { useBreakpoints } from '@/composables'

const isVisible = ref(false)

const isMobile = useMediaQuery(useBreakpoints.isMobile)

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

  background: var(--color-header-bg, var(--color-text-default));
  color: var(--color-surface-default);
  border-radius: var(--border-radius-default);
  box-shadow: var(--shadow-xl);

  :deep(.base-icon) {
    width: var(--icn-size);
    height: var(--icn-size);
  }

  &__btn,
  &__dismiss {
    display: inline-flex;
    padding: 6px 12px;
    width: fit-content;
    min-width: 34px;
    min-height: 34px;
    border: none;
    border-radius: var(--border-radius-sm);
    background: rgba(#fff, 0.15);

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
      background: rgba(#fff, 0.25);
      color: var(--color-surface-default);
    }
  }

  &__text {
    flex: 1;
    font-size: 0.9rem;

    @media (max-width: 767px) {
      font-size: 0.8rem;
    }
  }

  &__btn {
    gap: 6px;

    font-family: var(--font-family-body);
    font-size: 0.875rem;
    font-weight: 500;

    white-space: nowrap;
  }

  @media (max-width: 767px) {
    --icn-size: 0.9rem;

    bottom: 4rem;

    &__text {
      font-size: 0.8rem;
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
