<template>
  <RouterLink :to="{ name: 'catalog-books' }" class="brand" :aria-current="undefined">
    <img src="/icons/icon-192x192.png" alt="" class="brand__logo" width="32" height="32" />
    <span class="brand__name">Ecos Literários</span>
  </RouterLink>
</template>

<style lang="scss" scoped>
.brand {
  display: inline-flex;
  min-height: var(--touch-min);
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;

  &__logo {
    width: var(--brand-mark-sm);
    height: var(--brand-mark-sm);
    border-radius: var(--radius-sm);
  }

  &__name {
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-default);
  }

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: var(--space-1);
    border-radius: var(--radius-sm);
  }
}
</style>
