<template>
  <div v-bind="$attrs" class="base-spinner" role="status" aria-label="Carregando…">
    <div class="base-spinner--icon" aria-hidden="true" />
    <slot><p>Carregando…</p></slot>
  </div>
</template>

<style lang="scss" scoped>
.base-spinner {
  display: flex;
  padding: 60px 24px;

  text-align: center;
  color: var(--color-text-subtle);

  flex-direction: column;
  align-items: center;
  gap: 12px;

  &--icon {
    $size: 2.25rem;

    width: $size;
    height: $size;
    border: 3px solid var(--color-border-default);
    border-top-color: var(--color-action-default);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
