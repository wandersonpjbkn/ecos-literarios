<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="emit('cancel')">
        <div
          ref="card"
          class="modal-card"
          role="alertdialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="description ? descId : undefined"
        >
          <div class="modal-header">
            <h2 :id="titleId" class="modal-title">{{ title }}</h2>
          </div>

          <div class="modal-body">
            <p v-if="description" :id="descId" class="modal-desc">{{ description }}</p>
            <slot />
            <AppNotice v-if="error" class="modal-error" :text="error" />
          </div>

          <div class="modal-footer">
            <AppButton ref="cancelButton" class="modal-btn" :disabled="loading" @click="emit('cancel')">
              Cancelar
            </AppButton>
            <AppButton
              :variant="destructive ? 'danger' : 'primary'"
              class="modal-btn"
              :disabled="loading"
              @click="emit('confirm')"
            >
              {{ loading ? busyLabel : confirmLabel }}
            </AppButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { ref, useId } from 'vue'

import { useDialogFocus } from '@/composables/useDialogFocus'

import AppButton from '@/components/ui/AppButton.vue'
import AppNotice from '@/components/ui/AppNotice.vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    description?: string
    confirmLabel?: string
    // Shown in the confirm button while the request travels ("Removendo…").
    busyLabel?: string
    // A failed confirmation stays in the dialog, where the person acted; confirming again retries it.
    error?: string
    loading?: boolean
    // Where focus goes when the button that opened the dialog is gone (the removed row).
    returnFocus?: () => HTMLElement | null | undefined
    // No way back: the action takes the danger weight and the dialog has no blue button at all.
    destructive?: boolean
  }>(),
  {
    description: '',
    confirmLabel: 'Confirmar',
    busyLabel: 'Salvando…',
    error: '',
    loading: false,
    returnFocus: undefined,
    destructive: false,
  },
)

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const titleId = useId()
const descId = useId()
const card = ref<HTMLElement | null>(null)
const cancelButton = ref<{ $el: HTMLElement } | null>(null)

// Focus starts on "Cancelar": most of these dialogs remove or change something for good.
useDialogFocus({
  open: () => props.modelValue,
  panel: card,
  initial: () => cancelButton.value?.$el,
  onClose: () => {
    if (!props.loading) emit('cancel')
  },
  fallback: () => props.returnFocus?.(),
})
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--layer-modal);
  background: rgba(var(--color-text-default-rgb), 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.modal-card {
  width: 100%;
  max-width: var(--dialog-max);
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.modal-header {
  padding: var(--space-5) var(--space-6) 0;
}

.modal-title {
  margin: 0;
  font-size: var(--font-size-section);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-default);
}

.modal-body {
  padding: var(--space-3) var(--space-6) var(--space-5);
}

.modal-desc {
  margin: 0;
  font-size: var(--font-size-ui);
  color: var(--color-text-secondary);
  line-height: var(--line-height-text);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border-default);
  background: var(--color-background-subtle);
}

.modal-btn {
  min-width: var(--button-min);
}

.modal-error {
  margin: var(--space-3) 0 0;
}

@media (max-width: $bp-small-max) {
  .modal-overlay {
    padding: var(--space-3);
  }

  .modal-header {
    padding: var(--space-4) var(--space-4) 0;
  }

  .modal-body {
    padding: var(--space-3) var(--space-4);
  }

  .modal-footer {
    flex-direction: column-reverse;
    padding: var(--space-3) var(--space-4);
  }

  .modal-btn {
    width: 100%;
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
