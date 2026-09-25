<template>
  <component :is="as" class="pill" :class="[`pill--${tone}`, `pill--${size}`]">
    <slot />
  </component>
</template>

<script lang="ts" setup>
import type { Component } from 'vue'

export type PillTone = 'primary' | 'neutral' | 'quiet' | 'soft' | 'ghost'

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
  font-weight: 600;
  line-height: 1.2;
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
    width: 16px;
    height: 16px;
  }

  &--md {
    min-height: var(--touch-min);
    padding: 0 var(--space-4);
    font-size: 0.9375rem;
  }

  &--lg {
    min-height: var(--touch-cta);
    padding: 0 var(--space-5);
    font-size: 1rem;
  }

  &--primary:not(:disabled) {
    color: var(--color-surface-default);
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
      border-color: var(--color-action-text-subtle);
    }
  }

  &--quiet:not(:disabled) {
    color: var(--color-text-default);
    background: var(--color-surface-default);
    border-color: var(--color-border-default);

    &:hover {
      border-color: var(--color-action-text-subtle);
    }
  }

  &--soft:not(:disabled) {
    color: var(--color-action-default-hover);
    background: var(--color-action-background-subtle);
    border-color: var(--color-action-text-subtle);

    &:hover {
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
