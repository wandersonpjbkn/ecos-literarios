<template>
  <Teleport to="body">
    <Transition name="app-drawer">
      <div
        v-if="open"
        v-bind="$attrs"
        class="app-drawer"
        :class="{ 'app-drawer--wide': wide, 'app-drawer--no-rail': !hasRail }"
      >
        <div class="app-drawer__veil" aria-hidden="true" @click="emit('close')" />

        <section
          ref="panel"
          class="app-drawer__panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :style="drag.style.value"
        >
          <!-- Phone: the handle and the header drag the sheet down to close it, as on any bottom sheet. -->
          <div
            class="app-drawer__grip"
            @pointerdown="drag.handlers.onPointerdown"
            @pointermove="drag.handlers.onPointermove"
            @pointerup="drag.handlers.onPointerup"
            @pointercancel="drag.handlers.onPointercancel"
          >
            <div class="app-drawer__handle" aria-hidden="true" />

            <div class="app-drawer__header">
              <h2 :id="titleId" class="app-drawer__title">{{ title }}</h2>
              <!-- The secondary weight, not a borderless grey: that is how a disabled button looks (8e). -->
              <AppButton ref="closeButton" size="md" class="app-drawer__close" @click="emit('close')">
                <BaseIcon name="times" aria-hidden="true" />
                Fechar
              </AppButton>
            </div>
          </div>

          <div class="app-drawer__body">
            <slot />
          </div>

          <div v-if="$slots.footer" class="app-drawer__footer">
            <slot name="footer" />
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { computed, inject, onBeforeUnmount, ref, useId, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'

import AppButton from '@/components/ui/AppButton.vue'

import { FRAME_HAS_RAIL } from '@/layouts/frame'
import { useBackCloses } from '@/composables/useBackCloses'
import { useBreakpoints } from '@/composables/useBreakpoints'
import { useSheetDrag } from '@/composables/useSheetDrag'
import { useDialogFocus } from '@/composables/useDialogFocus'

// A Teleport root takes no attrs: class and the rest go to the drawer itself.
defineOptions({ inheritAttrs: false })

// The FilterDrawer's frame for any side panel: beside the rail on desktop, a sheet from the bottom on phones.
const props = defineProps<{
  open: boolean
  title: string
  // Earlier checks and aria-labelledby elsewhere look for this id (#filter-drawer-title).
  titleId?: string
  // The book form: two columns of fields instead of one list.
  wide?: boolean
  // Selector of the first field to focus; without it focus starts on "Fechar".
  initialFocus?: string
  // Where focus goes when the button that opened the panel is gone (the book removed from its row).
  returnFocus?: () => HTMLElement | null | undefined
}>()

const emit = defineEmits<{ close: [] }>()

const generatedId = useId()
const titleId = computed(() => props.titleId ?? generatedId)
// The frame says whether a rail sits beside the drawer; outside any frame there is none.
const hasRail = inject(FRAME_HAS_RAIL, false)
const panel = ref<HTMLElement | null>(null)
const closeButton = ref<{ $el: HTMLElement } | null>(null)
// Only the phone's bottom sheet drags; the desktop side panel does not.
const isPhone = useMediaQuery(useBreakpoints.isPhone)
const drag = useSheetDrag(panel, () => isPhone.value, () => emit('close'))
watch(() => props.open, (isOpen) => isOpen && drag.reset())

const { closeThen } = useBackCloses(
  () => props.open,
  () => emit('close'),
)
// A link inside the panel navigates only after the panel's own history entry is gone (AreaLayout).
defineExpose({ closeThen })

// The page under an open panel does not scroll; the lock goes with the panel, even when it unmounts open.
const lockScroll = (locked: boolean) => (document.body.style.overflow = locked ? 'hidden' : '')
watch(() => props.open, lockScroll, { immediate: true })
onBeforeUnmount(() => lockScroll(false))

useDialogFocus({
  open: () => props.open,
  panel,
  initial: () =>
    (props.initialFocus ? panel.value?.querySelector<HTMLElement>(props.initialFocus) : null) ?? closeButton.value?.$el,
  onClose: () => emit('close'),
  fallback: () => props.returnFocus?.(),
})
</script>

<style lang="scss" scoped>
.app-drawer {
  position: fixed;
  inset: 0;
  z-index: var(--layer-drawer);

  &__veil {
    position: absolute;
    inset: 0;
    background: rgba(var(--color-text-default-rgb), 0.4);
  }

  &__panel {
    position: absolute;
    inset: auto 0 0;
    display: flex;
    max-height: calc(100dvh - var(--space-14));
    flex-direction: column;
    background: var(--color-surface-default);
    border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;

    // A short drag that does not close slides the sheet back into place.
    @media (max-width: $bp-phone-max) and (prefers-reduced-motion: no-preference) {
      transition: transform var(--motion-transition-default);
    }

    @media (min-width: $bp-tablet-min) {
      inset: 0 auto 0 var(--rail-width);
      width: var(--drawer-width);
      max-height: none;
      border-right: 1px solid var(--color-border-default);
      border-radius: 0;

      .app-drawer--no-rail & {
        left: 0;
      }

      .app-drawer--wide & {
        width: min(var(--text-column), calc(100vw - var(--rail-width)));
      }
    }
  }

  // The browser must not take the gesture as a scroll or a pull-to-refresh.
  &__grip {
    @media (max-width: $bp-phone-max) {
      touch-action: none;
    }
  }

  &__handle {
    width: var(--space-10);
    height: var(--space-1);
    margin: var(--space-3) auto 0;
    border-radius: var(--radius-pill);
    background: var(--color-border-strong);

    @media (min-width: $bp-tablet-min) {
      display: none;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-6);
    border-bottom: 1px solid var(--color-border-default);
  }

  &__title {
    margin: 0;
    font-size: var(--font-size-section);
    font-weight: var(--font-weight-bold);
  }

  &__close {
    flex-shrink: 0;
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-4) var(--space-6);
  }

  &__footer {
    padding: var(--space-4) var(--space-6);
    padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom));
    border-top: 1px solid var(--color-border-default);
  }
}

.app-drawer-enter-active,
.app-drawer-leave-active {
  transition: opacity var(--motion-transition-default);

  .app-drawer__panel {
    transition: transform var(--motion-transition-default);
  }
}

.app-drawer-enter-from,
.app-drawer-leave-to {
  opacity: 0;

  .app-drawer__panel {
    transform: translateY(24px);

    @media (min-width: $bp-tablet-min) {
      transform: translateX(-24px);
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-drawer-enter-active,
  .app-drawer-leave-active,
  .app-drawer-enter-active .app-drawer__panel,
  .app-drawer-leave-active .app-drawer__panel {
    transition: none;
  }
}
</style>
