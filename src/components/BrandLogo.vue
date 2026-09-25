<template>
  <RouterLink :to="{ name: 'catalog-books' }" class="brand">
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
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
  }

  &__name {
    font-size: 1.0625rem;
    font-weight: 700;
    color: var(--color-text-default);
  }

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: var(--space-1);
    border-radius: var(--radius-sm);
  }
}
</style>
