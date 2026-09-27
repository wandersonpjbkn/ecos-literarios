<template>
  <dl class="facts">
    <div class="facts__item">
      <dt>Publicado em</dt>
      <dd :class="{ 'is-missing': !book.published_year }">{{ book.published_year || 'não sabemos' }}</dd>
    </div>
    <div class="facts__item">
      <dt>Páginas</dt>
      <dd :class="{ 'is-missing': !book.page_count }">{{ book.page_count || 'ninguém anotou' }}</dd>
    </div>
    <div v-if="book.categoria" class="facts__item">
      <dt>Gênero</dt>
      <dd>
        <RouterLink :to="catalogLink('categoria', book.categoria)" class="facts__link">{{ genre }}</RouterLink>
      </dd>
    </div>
    <div v-if="book.midia" class="facts__item">
      <dt>Formato</dt>
      <dd>
        <RouterLink :to="catalogLink('midia', book.midia)" class="facts__link">{{ book.midia }}</RouterLink>
      </dd>
    </div>
  </dl>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useFilters } from '@/composables'
import type { Book } from '@/types'

const props = defineProps<{
  book: Book
}>()

const { catalogLink } = useFilters()

const genre = computed(() => props.book.categoria.replace(/-/g, ' '))
</script>

<style lang="scss" scoped>
.facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);

  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);

  @media (min-width: $bp-tablet-min) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  &__item {
    min-width: 0;

    dt {
      font-size: var(--font-size-caption);
      color: var(--color-text-subtle);
    }

    // Same height for text and link values, so the four stay on one line.
    dd {
      display: flex;
      min-height: var(--touch-min);
      margin: 0;
      align-items: center;
      font-size: var(--font-size-body);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-default);

      &.is-missing {
        font-weight: var(--font-weight-regular);
        color: var(--color-text-secondary);
      }
    }
  }

  &__link {
    display: inline-flex;
    min-height: var(--touch-min);
    align-items: center;
    color: var(--color-action-default);
    text-decoration: underline;
    text-underline-offset: var(--underline-offset);

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: var(--focus-offset);
      border-radius: var(--radius-sm);
    }
  }
}
</style>
