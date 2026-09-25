<template>
  <!-- Always in the DOM so screen readers announce each new message (a live region added late is not read). -->
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
  z-index: 200;
  transform: translateX(-50%);
  pointer-events: none;

  // Clear of the phone's bottom bar.
  @media (max-width: 767px) {
    bottom: calc(var(--space-24) + env(safe-area-inset-bottom));
  }

  &__box {
    max-width: calc(100vw - 2 * var(--space-4));
    padding: var(--space-3) var(--space-5);

    font-size: 0.9375rem;
    color: var(--color-surface-default);
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
