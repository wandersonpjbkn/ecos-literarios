<template>
  <RouterLink :to="{ name: 'catalog-book-details', params: { id: book.id } }" class="book-card" :aria-label="label">
    <CoverBlock :title="book.titulo" :genre="book.categoria" :format="book.midia" :cover-url="book.cover_url" />

    <p class="book-card__author">{{ book.autor }}</p>
    <p v-if="book.quem" class="book-card__mention">mencionado por {{ book.quem }}</p>
  </RouterLink>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import CoverBlock from '@/components/CoverBlock.vue'
import type { Book } from '@/types'

const props = defineProps<{
  book: Book
}>()

const label = computed(() =>
  [props.book.titulo, props.book.autor, props.book.quem && `mencionado por ${props.book.quem}`]
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
    margin-top: var(--space-2);
    overflow: hidden;

    font-size: 0.875rem;
    line-height: 1.35;
    color: var(--color-text-secondary);

    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__mention {
    font-size: 0.8125rem;
    color: var(--color-text-subtle);
  }
}
</style>
