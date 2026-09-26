<template>
  <div class="empty-state">
    <p class="empty-state__title">{{ title }}</p>
    <p v-if="text" class="empty-state__text">{{ text }}</p>
    <div v-if="$slots.default" class="empty-state__actions">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  // What happened ("Nada com "kafka""); `text` says where the system looked or what the list will hold.
  title: string
  text?: string
}>()
</script>

<style lang="scss" scoped>
// EmptyState.md: no illustration, no red (an empty result is nobody's mistake), a centred 380px column.
.empty-state {
  display: flex;
  max-width: 380px;
  margin: 0 auto;
  padding: var(--space-14) var(--space-4);
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  text-align: center;

  &__title {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--color-text-default);
    overflow-wrap: anywhere;
  }

  &__text {
    font-size: 0.9375rem;
    line-height: 1.5;
    color: var(--color-text-secondary);
  }

  &__actions {
    display: flex;
    margin-top: var(--space-3);
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-3);
  }
}
</style>
