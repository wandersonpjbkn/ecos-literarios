<template>
  <div v-bind="$attrs" class="base-spinner" role="status" aria-label="Carregando…">
    <div class="base-spinner--icon" aria-hidden="true" />
    <slot><p>Carregando…</p></slot>
  </div>
</template>

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
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
