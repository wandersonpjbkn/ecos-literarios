<template>
  <section v-if="shelves.length" class="shelves" aria-labelledby="shelves-title">
    <h2 id="shelves-title" class="shelves__title">Prateleiras</h2>

    <ul class="shelves__list">
      <li v-for="shelf in shelves" :key="shelf.title">
        <RouterLink :to="hrefToggling(shelf.key, shelf.value)" class="shelf">
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
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { usePreferencesStore } from '@/stores'
import { useCategoryColors, useFilters } from '@/composables'
import type { FilterKey } from '@/types'

const SHELVES: { title: string; key: FilterKey; value: string; note: string }[] = [
  { title: 'Menos de 200 páginas', key: 'tamanho', value: 'Menos de 200 páginas', note: 'dá pra ler numa semana' },
  { title: 'Mais de 500 páginas', key: 'tamanho', value: 'Mais de 500 páginas', note: 'pra quem tem fôlego' },
  { title: 'Mangás', key: 'midia', value: 'Mangá', note: 'todos que o grupo mencionou' },
  { title: 'HQs', key: 'midia', value: 'HQ', note: 'leitura de uma sentada' },
]

const STACKED_COVERS = 4

const { emptySelection, booksFor, hrefToggling } = useFilters()
const { hiddenMidias } = storeToRefs(usePreferencesStore())
const { coverTint } = useCategoryColors()

// A format the reader chose to hide gets no shelf, and an empty shelf is not shown.
const shelves = computed(() =>
  SHELVES.filter((shelf) => !(shelf.key === 'midia' && hiddenMidias.value.includes(shelf.value)))
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
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  &__list {
    display: grid;
    margin-top: var(--space-4);
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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
    border-color: var(--color-action-text-subtle);
  }

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: var(--space-1);
  }

  &__stack {
    display: flex;
  }

  &__cover {
    width: 44px;
    height: 64px;
    margin-right: calc(-1 * var(--space-3));
    border: 1px solid;
    border-radius: var(--radius-sm);
  }

  &__name {
    margin-top: var(--space-4);
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-default);
  }

  &__note {
    margin-top: var(--space-1);
    font-size: 0.875rem;
    color: var(--color-text-subtle);
  }
}
</style>
