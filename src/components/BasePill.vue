<template>
  <component :is="as" class="pill" :class="[`pill--${tone}`, `pill--${size}`]">
    <slot />
  </component>
</template>

<script lang="ts" setup>
import type { Component } from 'vue'

export type PillTone = 'primary' | 'neutral' | 'quiet' | 'soft' | 'outline' | 'ghost'

withDefaults(
  defineProps<{
    // Tag or component to render (button, a, RouterLink, span); the pill only owns the shape and states.
    as?: string | Component
    tone?: PillTone
    // md = controls and chips (touch-min), lg = actions (touch-cta).
    size?: 'md' | 'lg'
  }>(),
  { as: 'span', tone: 'neutral', size: 'md' },
)
</script>

<style lang="scss" scoped>
// One pill for buttons, chips and select triggers, so no browser gives a control a look of its own.
.pill {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);

  font-family: var(--font-family-body);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-ui);
  text-decoration: none;
  white-space: nowrap;

  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition:
    background-color var(--motion-transition-default),
    border-color var(--motion-transition-default),
    color var(--motion-transition-default);

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: var(--space-1);
  }

  &:disabled,
  &[aria-disabled='true'] {
    color: var(--color-text-subtle);
    background: var(--color-background-subtle);
    border-color: var(--color-border-default);
    cursor: not-allowed;
  }

  :deep(.base-icon) {
    width: var(--icon-sm);
    height: var(--icon-sm);
  }

  &--md {
    min-height: var(--touch-min);
    padding: 0 var(--space-4);
    font-size: var(--font-size-ui);
  }

  &--lg {
    min-height: var(--touch-cta);
    padding: 0 var(--space-5);
    font-size: var(--font-size-body);
  }

  &--primary:not(:disabled) {
    color: var(--color-on-action);
    background: var(--color-action-default);

    &:hover {
      background: var(--color-action-default-hover);
    }
  }

  &--neutral:not(:disabled) {
    color: var(--color-text-secondary);
    background: var(--color-surface-default);
    border-color: var(--color-border-strong);

    &:hover {
      color: var(--color-text-default);
      border-color: var(--color-action-border-subtle);
    }
  }

  &--quiet:not(:disabled) {
    color: var(--color-text-default);
    background: var(--color-surface-default);
    border-color: var(--color-border-default);

    &:hover {
      border-color: var(--color-action-border-subtle);
    }
  }

  &--soft:not(:disabled) {
    color: var(--color-action-default-hover);
    background: var(--color-action-background-subtle);
    border-color: var(--color-action-border-subtle);

    &:hover {
      border-color: var(--color-action-default);
    }
  }

  // "De ação, contornado" (Button.md): action-soft is a selected chip's fill, never a button's.
  &--outline:not(:disabled) {
    color: var(--color-action-default);
    background: var(--color-surface-default);
    border-color: var(--color-action-border-subtle);

    &:hover {
      color: var(--color-action-default-hover);
      border-color: var(--color-action-default);
    }
  }

  &--ghost:not(:disabled) {
    padding-inline: var(--space-2);
    color: var(--color-action-default);
    background: none;

    &:hover {
      color: var(--color-action-default-hover);
    }
  }
}
</style>
