<template>
  <div class="app-toast" role="status" aria-live="polite">
    <Transition name="app-toast">
      <p v-if="message" class="app-toast__box">{{ message }}</p>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { useToast } from '@/composables'

const { message } = useToast()
</script>

<style lang="scss" scoped>
.app-toast {
  position: fixed;
  bottom: calc(var(--space-6) + env(safe-area-inset-bottom));
  left: 50%;
  z-index: var(--layer-notice);
  transform: translateX(-50%);
  pointer-events: none;

  @media (max-width: $bp-phone-max) {
    bottom: var(--above-tab-bar);
  }

  &__box {
    max-width: calc(100vw - 2 * var(--space-4));
    padding: var(--space-3) var(--space-5);

    font-size: var(--font-size-ui);
    color: var(--color-on-inverse);
    background: var(--color-text-default);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
  }
}

.app-toast-enter-active,
.app-toast-leave-active {
  transition:
    opacity var(--motion-transition-default),
    transform var(--motion-transition-default);
}

.app-toast-enter-from,
.app-toast-leave-to {
  opacity: 0;
  transform: translateY(var(--space-2));
}
</style>
