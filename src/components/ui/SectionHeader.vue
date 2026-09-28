<template>
  <div class="section__header">
    <div>
      <h2 class="section__title">{{ title }}</h2>
      <p v-if="$slots.default" class="section__desc">
        <slot />
      </p>
    </div>
    <slot name="actions" />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  title: string
}>()
</script>

<style lang="scss" scoped>
// Page titles share one size across the app (catalog, Meus livros, panel, Minha conta): 1.375rem, 700.
.section {
  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  &__title {
    margin: 0 0 var(--space-1);
    font-size: var(--font-size-title);
    font-weight: var(--font-weight-bold);
    letter-spacing: var(--letter-spacing-title);
    color: var(--color-text-default);
  }

  &__desc {
    max-width: var(--measure);
    margin: 0;
    font-size: var(--font-size-ui);
    line-height: var(--line-height-text);
    color: var(--color-text-secondary);
  }

  @media (max-width: $bp-phone-max) {
    &__header {
      flex-direction: column;
      align-items: stretch;
      margin-bottom: var(--space-4);
    }
  }
}
</style>
