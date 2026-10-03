<template>
  <RouterLink :to="{ name: 'catalog-book-details', params: { id: book.id } }" class="book-card" :aria-label="label">
    <CoverBlock :title="book.titulo" :genre="book.categoria" :format="book.midia" :cover-url="book.cover_url" />

    <p class="book-card__author">
      <span class="book-card__author-name">{{ book.authors[0] }}</span>
      <span v-if="book.authors.length > 1">{{ authorMore(book.authors) }}</span>
    </p>
    <p v-if="book.person && !hideMention" class="book-card__mention">mencionado por {{ book.person }}</p>
  </RouterLink>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { authorLineSpoken, authorMore } from '@/data/authors'
import type { Book } from '@/types'

import CoverBlock from '@/components/books/CoverBlock.vue'

const props = defineProps<{
  book: Book
  hideMention?: boolean
}>()

const label = computed(() =>
  [
    props.book.titulo,
    authorLineSpoken(props.book.authors),
    !props.hideMention && props.book.person && `mencionado por ${props.book.person}`,
  ]
    .filter(Boolean)
    .join(', '),
)
</script>

<style lang="scss" scoped>
.book-card {
  display: block;
  min-width: 0;
  border-radius: var(--radius-md);
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: var(--space-1);
  }

  &__author {
    display: flex;
    gap: var(--space-1);
    margin-top: var(--space-2);

    font-size: var(--font-size-meta);
    line-height: var(--line-height-title);
    color: var(--color-text-secondary);

    white-space: nowrap;
  }

  &__author-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__mention {
    font-size: var(--font-size-caption);
    color: var(--color-text-subtle);
  }
}
</style>
