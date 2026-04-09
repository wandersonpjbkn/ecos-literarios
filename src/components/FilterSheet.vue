<template>
  <!-- Overlay -->
  <Transition name="fs-overlay">
    <div v-if="isOpen" class="filter-sheet-overlay" aria-hidden="true" @click="close" />
  </Transition>

  <!-- Sheet -->
  <Transition name="fs-sheet">
    <div
      v-if="isOpen"
      ref="sheetRef"
      class="filter-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Filtros"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <!-- Handle para arrastar -->
      <div class="filter-sheet__handle" aria-hidden="true" />

      <!-- Header -->
      <div class="filter-sheet__header">
        <span class="filter-sheet__title">Filtros</span>
        <button class="filter-sheet__close" type="button" aria-label="Fechar filtros" @click="close">
          <BaseIcon name="times" aria-hidden="true" />
        </button>
      </div>

      <!-- Conteúdo: FilterPanel sem o toggle mobile (já temos o handle) -->
      <div class="filter-sheet__body">
        <FilterPanel
          :options="options"
          :selected="selected"
          :active-count="activeCount"
          :opened="true"
          @toggle="(key, val) => emit('toggle', key, val)"
          @clear="emit('clear')"
        />
      </div>

      <!-- Footer -->
      <div class="filter-sheet__footer">
        <button class="filter-sheet__btn filter-sheet__btn--secondary" type="button" @click="emit('clear')">
          Limpar
        </button>
        <button class="filter-sheet__btn filter-sheet__btn--primary" type="button" @click="close">
          Ver resultados
        </button>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import FilterPanel from '@/components/FilterPanel.vue'
import type { Options } from '@/types'

const props = defineProps<{
  modelValue: boolean
  options: Options
  selected: Options
  activeCount: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  toggle: [key: string, value: string]
  clear: []
}>()

const sheetRef = ref<HTMLElement | null>(null)

// ── Controle de abertura ──────────────────────
const isOpen = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val
    if (val) lockBody()
    else unlockBody()
  },
)

const close = () => {
  emit('update:modelValue', false)
}

// ── Scroll lock ───────────────────────────────
const lockBody = () => {
  document.body.style.overflow = 'hidden'
}

const unlockBody = () => {
  document.body.style.overflow = ''
}

onBeforeUnmount(() => unlockBody())

// ── Gesto de arrastar para fechar ─────────────
let touchStartY = 0
let touchCurrentY = 0
const SWIPE_THRESHOLD = 80 // px para considerar "fechou"

const onTouchStart = (e: TouchEvent) => {
  touchStartY = e.touches[0]?.clientY ?? 0
  touchCurrentY = touchStartY
  if (sheetRef.value) {
    sheetRef.value.style.transition = 'none'
  }
}

const onTouchMove = (e: TouchEvent) => {
  touchCurrentY = e.touches[0]?.clientY ?? touchStartY
  const delta = touchCurrentY - touchStartY
  if (delta > 0 && sheetRef.value) {
    // Só permite arrastar para baixo
    sheetRef.value.style.transform = `translateY(${delta}px)`
  }
}

const onTouchEnd = () => {
  if (sheetRef.value) {
    sheetRef.value.style.transition = ''
    sheetRef.value.style.transform = ''
  }

  const delta = touchCurrentY - touchStartY
  if (delta > SWIPE_THRESHOLD) {
    close()
  }
}
</script>

<style lang="scss" scoped>
// ── Overlay ───────────────────────────────────
.filter-sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.4);
}

// ── Sheet ─────────────────────────────────────
.filter-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 201;

  display: flex;
  flex-direction: column;
  max-height: 88dvh;

  background: var(--color-surface-default);
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
  box-shadow: var(--shadow-xl);

  // Safe area para iPhone X+
  padding-bottom: env(safe-area-inset-bottom);

  // Para o gesto de arrastar
  will-change: transform;

  &__handle {
    width: 36px;
    height: 4px;
    border-radius: 2px;
    background: var(--color-border-strong);
    margin: 12px auto 4px;
    flex-shrink: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px 12px;
    flex-shrink: 0;
    border-bottom: 1px solid var(--color-border-default);
  }

  &__title {
    font: {
      family: var(--font-family-display);
      size: 1rem;
      weight: 400;
    }
    color: var(--color-text-default);
  }

  &__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: none;
    border-radius: 50%;
    cursor: pointer;
    color: var(--color-text-subtle);
    transition: background var(--motion-transition-default);

    &:hover {
      background: var(--color-background-subtle);
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: 2px;
    }
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;

    // Remove o estilo de card do FilterPanel (já estamos dentro do sheet)
    :deep(.filter-panel) {
      width: 100%;
    }

    :deep(.filter-toggle) {
      // Esconde o toggle interno do FilterPanel (o sheet já tem seu handle)
      display: none;
    }

    :deep(.panel-body) {
      border: none;
      border-radius: 0;
    }

    :deep(.filter-sections) {
      max-height: none;
    }
  }

  &__footer {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 10px;
    padding: 12px 16px;
    border-top: 1px solid var(--color-border-default);
    flex-shrink: 0;
    background: var(--color-surface-default);
  }

  &__btn {
    min-height: 48px;
    border: none;
    border-radius: var(--border-radius-sm);
    font: {
      family: var(--font-family-body);
      size: 1rem;
    }
    cursor: pointer;
    transition: opacity var(--motion-transition-default);

    &:hover {
      opacity: 0.85;
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: 2px;
    }

    &--primary {
      background: var(--color-action-default);
      color: var(--color-surface-default);

      &:hover {
        background: var(--color-action-default-hover);
        opacity: 1;
      }
    }

    &--secondary {
      background: var(--color-background-subtle);
      color: var(--color-text-default);
      border: 1px solid var(--color-border-default);
    }
  }
}

// ── Transições ────────────────────────────────
.fs-overlay-enter-active,
.fs-overlay-leave-active {
  transition: opacity 0.25s ease;
}
.fs-overlay-enter-from,
.fs-overlay-leave-to {
  opacity: 0;
}

.fs-sheet-enter-active,
.fs-sheet-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.fs-sheet-enter-from,
.fs-sheet-leave-to {
  transform: translateY(100%);
}
</style>
