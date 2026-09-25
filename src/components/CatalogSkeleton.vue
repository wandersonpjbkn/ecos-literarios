<template>
  <div class="catalog-skeleton" aria-busy="true">
    <span class="visually-hidden" role="status">Carregando o catálogo</span>

    <div class="catalog-skeleton__bar" aria-hidden="true">
      <span class="catalog-skeleton__line catalog-skeleton__line--summary" />
      <div class="catalog-skeleton__chips">
        <span v-for="n in 5" :key="n" class="catalog-skeleton__chip" />
      </div>
    </div>

    <div class="catalog-skeleton__grid" aria-hidden="true">
      <div v-for="n in 12" :key="n" class="catalog-skeleton__card">
        <span class="catalog-skeleton__cover" />
        <span class="catalog-skeleton__line" />
        <span class="catalog-skeleton__line catalog-skeleton__line--short" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// Same shapes and grid as the catalog, so nothing jumps when the books arrive (Estados: Carregando).
.catalog-skeleton {
  &__bar {
    display: grid;
    gap: var(--space-3);

    @media (min-width: 768px) {
      margin-top: var(--space-6);
    }
  }

  &__chips {
    display: flex;
    gap: var(--space-2);
    overflow: hidden;
  }

  &__chip {
    flex-shrink: 0;
    width: 96px;
    height: var(--touch-min);
    border-radius: var(--radius-pill);
    background: var(--color-background-subtle);
  }

  &__grid {
    display: grid;
    margin-top: var(--space-6);
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--space-5) var(--space-3);

    @media (min-width: 768px) {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: calc(var(--space-5) + var(--space-2)) var(--space-5);
    }
  }

  &__card {
    display: grid;
    gap: var(--space-2);
  }

  &__cover {
    height: 206px;
    border-radius: var(--radius-md);
    background: var(--color-background-subtle);

    @media (min-width: 768px) {
      height: 212px;
    }
  }

  &__line {
    width: 80%;
    height: var(--space-3);
    border-radius: var(--radius-pill);
    background: var(--color-background-subtle);

    &--short {
      width: 55%;
    }

    &--summary {
      width: 120px;
      height: var(--space-4);
    }
  }
}
</style>
