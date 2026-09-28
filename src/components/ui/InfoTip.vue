<template>
  <span ref="root" class="info-tip" @mouseenter="open = true" @mouseleave="open = false">
    <button
      type="button"
      class="info-tip__trigger"
      :aria-describedby="tipId"
      @click="open = true"
      @focus="open = true"
      @blur="open = false"
      @keydown.escape="open = false"
    >
      <slot />
    </button>
    <span :id="tipId" role="tooltip" class="info-tip__bubble" :class="{ 'is-open': open }">{{ text }}</span>
  </span>
</template>

<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core'
import { ref, useId } from 'vue'

// A tap fires mouseenter and focus before click, so click only opens: a toggle would close it at once.
defineProps<{
  text: string
}>()

const tipId = useId()
const open = ref(false)
const root = ref<HTMLElement | null>(null)

onClickOutside(root, () => (open.value = false))
</script>

<style lang="scss" scoped>
.info-tip {
  position: relative;
  display: inline-flex;

  &__trigger {
    min-height: var(--touch-min);
    padding: 0;
    border: none;
    background: none;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;
    color: inherit;
    text-decoration: underline dotted;
    text-decoration-color: var(--color-text-subtle);
    text-underline-offset: var(--underline-offset-dotted);
    cursor: help;

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: var(--focus-offset);
    }
  }

  &__bubble {
    position: absolute;
    top: calc(100% + var(--space-1));
    right: 0;
    z-index: var(--layer-float);
    width: max-content;
    max-width: var(--tip-max);
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    background: var(--color-surface-default);
    box-shadow: var(--shadow-lg);
    font-size: var(--font-size-meta);
    font-weight: var(--font-weight-regular);
    color: var(--color-text-default);
    text-align: left;
    visibility: hidden;

    &.is-open {
      visibility: visible;
    }
  }
}
</style>
