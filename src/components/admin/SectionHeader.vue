<template>
  <div class="section__header">
    <div>
      <h2 class="section__title">{{ title }}</h2>
      <p class="section__desc">
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
.section {
  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  &__title {
    margin: 0 0 0.25rem;
    font-family: var(--font-family-display);
    font-size: 1.4rem;
    font-weight: 400;
    color: var(--color-text-default);
  }

  &__desc {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-text-subtle);
    max-width: 65ch;
    line-height: 1.5;
  }

  @media (max-width: 767px) {
    &__header {
      flex-direction: column;
      align-items: stretch;
    }

    &__title {
      font-size: 1.2rem;
    }

    &__desc {
      font-size: 0.85rem;
    }
  }

  @media (max-width: 640px) {
    &__header {
      margin-bottom: 1rem;
    }
  }
}
</style>
