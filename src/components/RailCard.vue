<template>
  <div class="rail-card" :class="`rail-card--${size}`" :style="{ '--rail-accent': accent }">
    <div class="rail-card__rail" aria-hidden="true" />
    <div class="rail-card__body">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    accent?: string
    size?: 'sm' | 'default'
  }>(),
  {
    accent: 'var(--color-action-default)',
    size: 'default',
  },
)
</script>

<style lang="scss" scoped>
.rail-card {
  display: grid;
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg);

  &--sm {
    grid-template-columns: 1rem 1fr;
    box-shadow: var(--shadow-sm);
  }

  &--default {
    grid-template-columns: 1.2rem 1fr;
  }
}

.rail-card__rail {
  background: var(--rail-accent);
}

.rail-card__body {
  .rail-card--sm & {
    padding: 1.5rem;
  }

  .rail-card--default & {
    padding: 1.75rem;
  }
}

@media (max-width: 767px) {
  .rail-card--sm {
    grid-template-columns: 0.85rem 1fr;

    .rail-card__body {
      padding: 1.125rem;
    }
  }

  .rail-card--default {
    grid-template-columns: 0.9rem 1fr;

    .rail-card__body {
      padding: 1.25rem;
    }
  }
}
</style>
