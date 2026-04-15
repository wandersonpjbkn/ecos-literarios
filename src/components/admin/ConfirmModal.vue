<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="modal-overlay"
        role="dialog"
        :aria-modal="true"
        :aria-labelledby="titleId"
        @click.self="emit('cancel')"
      >
        <div class="modal-card">
          <div class="modal-header">
            <h2 :id="titleId" class="modal-title">{{ title }}</h2>
          </div>

          <div class="modal-body">
            <p class="modal-desc">{{ description }}</p>
            <slot />
          </div>

          <div class="modal-footer">
            <button class="modal-btn modal-btn--cancel" @click="emit('cancel')">Cancelar</button>
            <button
              class="modal-btn modal-btn--confirm"
              :class="{ 'is-danger': danger }"
              :disabled="loading"
              @click="emit('confirm')"
            >
              <span v-if="!loading">{{ confirmLabel }}</span>
              <span v-else class="loading-dots"><span /><span /><span /></span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    description?: string
    confirmLabel?: string
    danger?: boolean
    loading?: boolean
  }>(),
  {
    description: '',
    confirmLabel: 'Confirmar',
    danger: false,
    loading: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const titleId = computed(() => `modal-title-${Math.random().toString(36).slice(2)}`)
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-card {
  width: 100%;
  max-width: 420px;
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.modal-header {
  padding: 1.25rem 1.5rem 0;
}

.modal-title {
  margin: 0;
  font-family: var(--font-family-display);
  font-size: 1.15rem;
  font-weight: 400;
  color: var(--color-text-default);
}

.modal-body {
  padding: 0.75rem 1.5rem 1.25rem;
}

.modal-desc {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-text-subtle);
  line-height: 1.55;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border-default);
  background: var(--color-background-subtle);
}

.modal-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  min-width: 88px;
  padding: 8px 18px;
  border-radius: var(--border-radius-sm);
  border: none;
  font-family: var(--font-family-body);
  font-size: 0.9rem;
  cursor: pointer;
  transition:
    opacity var(--motion-transition-default),
    background var(--motion-transition-default);

  &--cancel {
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    color: var(--color-text-default);

    &:hover {
      background: var(--color-background-subtle);
    }
  }

  &--confirm {
    background: var(--color-action-default);
    color: var(--color-surface-default);
    font-weight: 500;

    &:hover:not(:disabled) {
      opacity: 0.85;
    }

    &.is-danger {
      background: #c0392b;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

// Loading dots
.loading-dots {
  display: inline-flex;
  gap: 4px;
  align-items: center;

  span {
    width: 5px;
    height: 5px;
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
    transform: translateY(-4px);
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 0.75rem;
  }

  .modal-header {
    padding: 1rem 1.1rem 0;
  }

  .modal-body {
    padding: 0.65rem 1.1rem 1rem;
  }

  .modal-footer {
    flex-direction: column-reverse;
    gap: 0.5rem;
    padding: 0.85rem 1.1rem;
  }

  .modal-btn {
    width: 100%;
    min-height: 44px;
  }
}

// Transition
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--motion-transition-default);

  .modal-card {
    transition: transform var(--motion-transition-default);
  }
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal-card {
    transform: scale(0.95) translateY(8px);
  }
}
</style>
