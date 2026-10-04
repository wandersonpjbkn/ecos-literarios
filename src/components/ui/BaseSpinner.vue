<template>
  <div
    v-bind="$attrs"
    class="base-spinner"
    :class="{ 'base-spinner--inline': inline }"
    role="status"
    :aria-label="label"
  >
    <div class="base-spinner--icon" aria-hidden="true" />
    <slot>
      <p>{{ label }}</p>
    </slot>
  </div>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{ inline?: boolean; label?: string }>(), { inline: false, label: 'Carregando…' })
</script>

<style lang="scss" scoped>
.base-spinner {
  display: flex;
  padding: var(--space-14) var(--space-6);

  text-align: center;
  color: var(--color-text-subtle);

  flex-direction: column;
  align-items: center;
  gap: var(--space-3);

  &--icon {
    width: var(--spinner);
    height: var(--spinner);
    border: 3px solid var(--color-border-default);
    border-top-color: var(--color-action-default);
    border-radius: 50%;
    animation: spin var(--motion-spin) linear infinite;
  }

  &--inline {
    flex-direction: row;
    padding: 0;
    font-size: var(--font-size-ui);
    color: var(--color-text-secondary);

    p {
      margin: 0;
    }

    .base-spinner--icon {
      width: var(--icon-sm);
      height: var(--icon-sm);
      border-width: 2px;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
