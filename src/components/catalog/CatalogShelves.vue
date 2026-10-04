<template>
  <section v-if="shelves.length" class="shelves" aria-labelledby="shelves-title">
    <h2 id="shelves-title" class="shelves__title">Prateleiras</h2>

    <ul class="shelves__list">
      <li v-for="shelf in shelves" :key="shelf.title">
        <RouterLink :to="hrefToggling(shelf.key, shelf.value)" class="shelf" :aria-current="undefined">
          <span class="shelf__stack" aria-hidden="true">
            <span
              v-for="(tint, index) in shelf.tints"
              :key="index"
              class="shelf__cover"
              :style="{ background: `var(--tint-${tint}-bg)`, borderColor: `var(--tint-${tint}-line)` }"
            />
          </span>
          <span class="shelf__name">{{ shelf.title }}</span>
          <span class="shelf__note"
            >{{ shelf.count === 1 ? '1 livro' : `${shelf.count} livros` }} · {{ shelf.note }}</span
          >
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import type { FilterKey } from '@/types'

import { usePreferencesStore } from '@/stores'

import { useCategoryColors, useFilters } from '@/composables'

const SHELVES: { title: string; key: FilterKey; value: string; note: string }[] = [
  { title: 'Menos de 200 páginas', key: 'size', value: 'Menos de 200 páginas', note: 'para ler em uma semana' },
  { title: 'Mais de 500 páginas', key: 'size', value: 'Mais de 500 páginas', note: 'para quem tem fôlego' },
  { title: 'Mangás', key: 'midia', value: 'Mangá', note: 'para curtir e acompanhar' },
  { title: 'HQs', key: 'midia', value: 'HQ', note: 'termina em uma tarde só' },
]

const STACKED_COVERS = 4

const { hiddenFormats } = storeToRefs(usePreferencesStore())

const { emptySelection, booksFor, hrefToggling } = useFilters()

const { coverTint } = useCategoryColors()

const shelves = computed(() =>
  SHELVES.filter((shelf) => !(shelf.key === 'midia' && hiddenFormats.value.includes(shelf.value)))
    .map((shelf) => {
      const books = booksFor({ ...emptySelection(), [shelf.key]: [shelf.value] })
      return {
        ...shelf,
        count: books.length,
        tints: books.slice(0, STACKED_COVERS).map((book) => coverTint(book.categoria)),
      }
    })
    .filter((shelf) => shelf.count > 0),
)
</script>

<style lang="scss" scoped>
.shelves {
  margin-top: var(--space-14);

  &__title {
    font-size: var(--font-size-section);
    font-weight: var(--font-weight-bold);
    letter-spacing: var(--letter-spacing-title);
  }

  &__list {
    display: grid;
    margin-top: var(--space-4);
    grid-template-columns: repeat(auto-fill, minmax(var(--shelf-min), 1fr));
    gap: var(--space-5);
    list-style: none;
  }
}

.shelf {
  display: flex;
  height: 100%;
  padding: var(--space-5);
  flex-direction: column;

  text-decoration: none;

  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-xl);
  transition: border-color var(--motion-transition-default);

  &:hover {
    border-color: var(--color-action-border-subtle);
  }

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: var(--space-1);
  }

  &__stack {
    display: flex;
  }

  &__cover {
    width: var(--mini-cover-w);
    height: var(--mini-cover-h);
    margin-right: calc(-1 * var(--space-3));
    border: 1px solid;
    border-radius: var(--radius-sm);
  }

  &__name {
    margin-top: var(--space-4);
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-default);
  }

  &__note {
    margin-top: var(--space-1);
    font-size: var(--font-size-meta);
    color: var(--color-text-subtle);
  }
}
</style>
