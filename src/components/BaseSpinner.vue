<template>
  <div v-bind="$attrs">
    <div class="spinner" aria-hidden="true" />
    <slot><p>Carregando…</p></slot>
  </div>
</template>

<style lang="scss" scoped>
.spinner {
  $size: 2.25;

  width: $size;
  height: $size;
  border: 3px solid var(--color-border-default);
  border-top-color: var(--color-action-default);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
