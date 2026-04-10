<script lang="ts" setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useMediaQuery, onClickOutside } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    title: string
    enter?: 'left' | 'right'
  }>(),
  {
    enter: 'right',
  },
)

const isMobile = useMediaQuery('(max-width: 767px)')

const isOpen = ref(false)
const painelRef = ref<HTMLElement | null>(null)

const panelClass = computed(() => {
  return `mobile-filters-panel--${props.enter}`
})

const lockBody = () => {
  document.body.style.overflow = 'hidden'
}

const unlockBody = () => {
  document.body.style.overflow = ''
}

const open = () => {
  isOpen.value = true
  lockBody()
}

const close = () => {
  isOpen.value = false
  unlockBody()
}

const toggle = () => {
  if (isOpen.value) close()
  else open()
}

onClickOutside(painelRef, () => {
  setTimeout(() => {
    if (isOpen.value) close()
  }, 350)
})

watch(isMobile, (mobile) => {
  if (!mobile) {
    close()
  }
})

onBeforeUnmount(() => {
  unlockBody()
})

defineExpose({
  isOpen,
  open,
  close,
  toggle,
})
</script>

<template>
  <!-- overlay -->
  <Transition name="mobile-filters-overlay">
    <div v-if="isOpen" class="mobile-filters-overlay" aria-hidden="true" @click="close" />
  </Transition>

  <!-- panel -->
  <Transition :name="panelClass">
    <aside v-if="isOpen" ref="painelRef" :class="['mobile-filters-sidebar', enter]" :aria-label="title">
      <!-- header -->
      <div class="mobile-filters-header">
        <slot name="header" :open="open" :close="close" :toggle="toggle" :is-open="isOpen">
          <h2 class="mobile-filters-title">{{ title }}</h2>
          <button class="mobile-filters-close" type="button" aria-label="Fechar filtros" @click="close">
            <BaseIcon name="times" aria-hidden="true" />
          </button>
        </slot>
      </div>

      <!-- body -->
      <div class="mobile-filters-body">
        <slot name="body" :open="open" :close="close" :toggle="toggle" :is-open="isOpen" />
      </div>

      <!-- footer -->
      <div class="mobile-filters-footer">
        <slot name="footer" :open="open" :close="close" :toggle="toggle" :is-open="isOpen">
          <button class="btn" type="button" @click="close">Fechar</button>
        </slot>
      </div>
    </aside>
  </Transition>
</template>

<style lang="scss" scoped>
.mobile-filters {
  &-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 40;
  }

  &-sidebar {
    position: fixed;
    top: 0;
    z-index: 50;
    display: flex;
    width: min(88dvw, 360px);
    height: 100dvh;
    background: var(--color-surface-default);
    box-shadow: -8px 0 24px rgba(0, 0, 0, 0.16);
    flex-direction: column;

    &.left {
      left: 5rem;
    }
    &.right {
      right: 0rem;
    }
  }

  &-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid var(--color-border-default);
  }

  &-title {
    margin: 0;
    font-size: 1rem;
    color: var(--color-text-default);
  }

  &-close {
    width: 40px;
    height: 40px;
    border: none;
    background: transparent;
    border-radius: 999px;
    cursor: pointer;
    color: var(--color-text-default);
  }

  &-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .filter-bar-sorted {
      width: 100%;
    }
  }

  &-footer {
    margin-top: auto;
    display: grid;
    padding: 16px;
    border-top: 1px solid var(--color-border-default);
    background: var(--color-surface-default);
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
}

.btn {
  min-height: 44px;
  border: none;
  padding: 10px 20px;
  border-radius: var(--border-radius-sm);
  background: var(--color-action-default);

  font-family: var(--font-family-body);
  font-size: 1rem;
  color: var(--color-surface-default);

  transition: opacity var(--motion-transition-default);
  cursor: pointer;

  grid-column-start: 2;

  &:hover {
    opacity: 0.85;
    background: var(--color-action-default-hover);
  }
}

/* Drawer transitions */
.mobile-filters-overlay-enter-active,
.mobile-filters-overlay-leave-active {
  transition: opacity 0.25s ease;
}
.mobile-filters-overlay-enter-from,
.mobile-filters-overlay-leave-to {
  opacity: 0;
}
.mobile-filters-panel--left-enter-active,
.mobile-filters-panel--left-leave-active,
.mobile-filters-panel--right-enter-active,
.mobile-filters-panel--right-leave-active {
  transition: transform 0.25s ease;
}
.mobile-filters-panel--left-enter-from,
.mobile-filters-panel--left-leave-to {
  transform: translateX(-100%);
}
.mobile-filters-panel-right-enter-from,
.mobile-filters-panel-right-leave-to {
  transform: translateX(100%);
}
</style>
