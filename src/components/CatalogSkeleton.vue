<template>
  <div class="catalog-skeleton" aria-busy="true">
    <span class="visually-hidden" role="status">Carregando o catálogo</span>

    <div class="catalog-skeleton__bar" aria-hidden="true">
      <span class="catalog-skeleton__line catalog-skeleton__line--summary" />
      <div class="catalog-skeleton__chips">
        <span v-for="n in 5" :key="n" class="catalog-skeleton__chip" />
      </div>
    </div>

    <div class="catalog-skeleton__grid book-grid" aria-hidden="true">
      <div v-for="n in 12" :key="n" class="catalog-skeleton__card">
        <span class="catalog-skeleton__cover" />
        <span class="catalog-skeleton__line" />
        <span class="catalog-skeleton__line catalog-skeleton__line--short" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// A band of light crosses each shape; with reduced motion the shapes stay still, in the base grey.
@mixin shimmer {
  background-color: var(--color-skeleton);
  background-image: var(--skeleton-gradient);
  background-size: 200% 100%;
  animation: skeleton-shimmer var(--skeleton-shimmer) ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    background-image: none;
    animation: none;
  }
}

@keyframes skeleton-shimmer {
  from {
    background-position: 100% 0;
  }

  to {
    background-position: -100% 0;
  }
}

// Same shapes and grid as the catalog, so nothing jumps when the books arrive (Estados: Carregando).
.catalog-skeleton {
  &__bar {
    display: grid;
    gap: var(--space-3);

    @media (min-width: $bp-tablet-min) {
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
    width: var(--skeleton-short);
    height: var(--touch-min);
    border-radius: var(--radius-pill);
    @include shimmer;
  }

  &__grid {
    margin-top: var(--space-6);
  }

  &__card {
    display: grid;
    gap: var(--space-2);
  }

  &__cover {
    height: var(--cover-h);
    border-radius: var(--radius-md);
    @include shimmer;

    @media (min-width: $bp-tablet-min) {
      height: var(--cover-h-lg);
    }
  }

  &__line {
    width: 80%;
    height: var(--space-3);
    border-radius: var(--radius-pill);
    @include shimmer;

    &--short {
      width: 55%;
    }

    &--summary {
      width: var(--skeleton-long);
      height: var(--space-4);
    }
  }
}
</style>
