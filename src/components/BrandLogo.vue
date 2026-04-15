<template>
  <RouterLink :to="{ name: 'catalog-books' }" class="brand">
    <span class="brand-icon">📚</span>
    <div class="brand-text">
      <span class="brand-name">Ecos Literários</span>
      <span class="brand-sub">
        {{ isTablet ? 'Catálogo do clube' : 'Catálogo de livros do clube' }}
      </span>
    </div>
  </RouterLink>
</template>

<script lang="ts" setup>
import { useMediaQuery } from '@vueuse/core'

import { useBreakpoints } from '@/composables'

const isTablet = useMediaQuery(useBreakpoints.isTablet)
</script>

<style lang="scss" scoped>
.brand {
  display: flex;
  color: var(--color-action-text-subtle);
  align-items: center;
  gap: 12px;
  transition: opacity var(--motion-transition-default);

  &:hover {
    opacity: 0.85;
  }

  &-icon {
    font-size: 1.25rem;
    line-height: 1;
  }

  &-text {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }

  &-name {
    font: {
      family: var(--font-family-display);
      size: 1.1rem;
      weight: 500;
    }
    color: var(--color-action-default);
  }

  &-sub {
    font: {
      size: 0.7rem;
      weight: 500;
    }
    color: var(--color-text-subtle);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
}
</style>
