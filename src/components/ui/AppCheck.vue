<template>
  <span class="app-check" :class="`app-check--${type}`">
    <input v-bind="$attrs" :type="type" class="app-check__input" />
    <span class="app-check__mark" aria-hidden="true">
      <BaseIcon v-if="type === 'checkbox'" name="check" class="app-check__tick" />
    </span>
  </span>
</template>

<script lang="ts" setup>
defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    type?: 'checkbox' | 'radio'
  }>(),
  { type: 'checkbox' },
)
</script>

<style lang="scss" scoped>
.app-check {
  position: relative;
  display: inline-flex;
  width: var(--control-box);
  height: var(--control-box);
  flex-shrink: 0;

  &__input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: pointer;
  }

  &__mark {
    display: inline-flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;

    background: var(--color-surface-default);
    border: 1.5px solid var(--color-border-strong);
    border-radius: var(--radius-sm);
    transition:
      background-color var(--motion-transition-default),
      border-color var(--motion-transition-default);
  }

  &--radio &__mark {
    border-radius: var(--radius-pill);
  }

  &__tick {
    width: var(--icon-xs);
    height: var(--icon-xs);
    color: var(--color-on-action);
    visibility: hidden;
  }

  &__input:hover:not(:disabled) + &__mark {
    border-color: var(--color-action-default);
  }

  &__input:checked + &__mark {
    background: var(--color-action-default);
    border-color: var(--color-action-default);
  }

  &__input:checked + &__mark &__tick {
    visibility: visible;
  }

  &--radio &__input:checked + &__mark::after {
    content: '';
    width: var(--mark);
    height: var(--mark);
    border-radius: var(--radius-pill);
    background: var(--color-on-action);
  }

  &__input:disabled {
    cursor: not-allowed;
  }

  &__input:disabled + &__mark {
    background: var(--color-background-subtle);
    border-color: var(--color-border-default);
  }

  &__input:disabled:checked + &__mark {
    background: var(--color-text-subtle);
    border-color: var(--color-text-subtle);
  }

  &__input:focus-visible + &__mark {
    outline: 2px solid var(--color-border-focus);
    outline-offset: calc(var(--space-1) / 2);
  }
}
</style>
