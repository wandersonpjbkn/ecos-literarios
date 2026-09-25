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
// Drawn over a transparent native input: the browser keeps the semantics but no longer paints the box.
.app-check {
  position: relative;
  display: inline-flex;
  width: 20px;
  height: 20px;
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
    width: 14px;
    height: 14px;
    color: var(--color-surface-default);
    visibility: hidden;
  }

  &__input:hover + &__mark {
    border-color: var(--color-action-default);
  }

  &__input:checked + &__mark {
    background: var(--color-action-default);
    border-color: var(--color-action-default);
  }

  &__input:checked + &__mark &__tick {
    visibility: visible;
  }

  // Radio: a white dot inside the filled circle.
  &--radio &__input:checked + &__mark::after {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: var(--radius-pill);
    background: var(--color-surface-default);
  }

  &__input:focus-visible + &__mark {
    outline: 2px solid var(--color-border-focus);
    outline-offset: calc(var(--space-1) / 2);
  }
}
</style>
