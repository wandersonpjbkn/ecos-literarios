<template>
  <Teleport to="body">
    <Transition name="app-drawer">
      <div
        v-if="open"
        v-bind="$attrs"
        class="app-drawer"
        :class="{ 'app-drawer--wide': wide, 'app-drawer--no-rail': !hasRail }"
      >
        <div class="app-drawer__veil" aria-hidden="true" @click="requestClose" />

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

            <div class="app-drawer__header" :class="{ 'app-drawer__header--back': back }">
              <!-- A view inside the panel goes up one level; "Fechar" keeps its place in every view. -->
              <AppButton v-if="back" size="md" class="app-drawer__back" @click="emit('back')">
                <BaseIcon name="arrow-left" aria-hidden="true" />
                Voltar
              </AppButton>
              <h2 :id="titleId" ref="heading" class="app-drawer__title" tabindex="-1">{{ title }}</h2>
              <!-- The secondary weight, not a borderless grey: that is how a disabled button looks (8e). -->
              <AppButton ref="closeButton" size="md" class="app-drawer__close" @click="requestClose">
                <BaseIcon name="times" aria-hidden="true" />
                Fechar
              </AppButton>
            </div>
          </div>

          <div ref="body" class="app-drawer__body">
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
import { useMediaQuery } from '@vueuse/core'
import { computed, inject, onBeforeUnmount, ref, useId, watch } from 'vue'

import { useBackCloses } from '@/composables/useBackCloses'
import { useBreakpoints } from '@/composables/useBreakpoints'
import { useDialogFocus } from '@/composables/useDialogFocus'
import { useSheetDrag } from '@/composables/useSheetDrag'

import { FRAME_HAS_RAIL } from '@/layouts/frame'

import AppButton from '@/components/ui/AppButton.vue'

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
  // Asked before any way out (Fechar, outside, drag, Esc, the system back); false keeps the panel open.
  mayClose?: () => boolean | Promise<boolean>
  // A view inside the panel (the cover and data search): shows "Voltar", which emits back.
  back?: boolean
}>()

const emit = defineEmits<{ close: []; back: [] }>()

const generatedId = useId()

// The frame says whether a rail sits beside the drawer; outside any frame there is none.
const hasRail = inject(FRAME_HAS_RAIL, false)

const isPhone = useMediaQuery(useBreakpoints.isPhone)

const mayClose = () => props.mayClose?.() ?? true
const requestClose = async () => {
  if (await mayClose()) emit('close')
  // Staying: a sheet dragged down goes back up.
  else drag.reset()
}

const { closeThen } = useBackCloses(
  () => props.open,
  () => emit('close'),
  mayClose,
)

const panel = ref<HTMLElement | null>(null)

// Only the phone's bottom sheet drags; the desktop side panel does not.
const drag = useSheetDrag(panel, () => isPhone.value, requestClose)

const closeButton = ref<{ $el: HTMLElement } | null>(null)
const heading = ref<HTMLElement | null>(null)
const body = ref<HTMLElement | null>(null)

useDialogFocus({
  open: () => props.open,
  panel,
  initial: () =>
    (props.initialFocus ? panel.value?.querySelector<HTMLElement>(props.initialFocus) : null) ?? closeButton.value?.$el,
  onClose: requestClose,
  fallback: () => props.returnFocus?.(),
})

const titleId = computed(() => props.titleId ?? generatedId)

// The page under an open panel does not scroll; the lock goes with the panel, even when it unmounts open.
const lockScroll = (locked: boolean) => (document.body.style.overflow = locked ? 'hidden' : '')

watch(
  () => props.open,
  (isOpen) => isOpen && drag.reset(),
)

// A link inside the panel navigates only after the panel's own history entry is gone (AreaLayout).
defineExpose({
  closeThen,
  focusTitle: () => heading.value?.focus(),
  // A new view inside the panel starts at its top, not where the last one was scrolled.
  scrollToTop: () => body.value?.scrollTo({ top: 0 }),
})

watch(() => props.open, lockScroll, { immediate: true })
onBeforeUnmount(() => lockScroll(false))
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

    // The book form changes views inside it: a sheet of one height keeps "Fechar" in place from view to view.
    @media (max-width: $bp-phone-max) {
      .app-drawer--wide & {
        height: calc(100dvh - var(--space-14));
      }
    }

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

  // With "Voltar": on the phone, Voltar and Fechar share the first row and the title goes under them.
  &__header--back {
    display: grid;
    grid-template-areas:
      'back close'
      'title title';
    grid-template-columns: auto auto;
    justify-content: space-between;
    row-gap: var(--space-3);

    @media (min-width: $bp-tablet-min) {
      grid-template-areas: 'back title close';
      grid-template-columns: auto 1fr auto;
      column-gap: var(--space-4);
    }

    .app-drawer__back {
      grid-area: back;
    }

    .app-drawer__title {
      grid-area: title;
    }

    .app-drawer__close {
      grid-area: close;
    }
  }

  &__title {
    margin: 0;
    font-size: var(--font-size-section);
    font-weight: var(--font-weight-bold);

    &:focus {
      outline: none;
    }
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
