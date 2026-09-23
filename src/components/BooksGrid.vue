<template>
  <div class="books-grid-wrap">
    <TransitionGroup v-if="books.length > 0" name="grid" tag="div" class="books-grid">
      <BookCard v-for="book in visibleBooks" :key="book.id" :book="book" />
    </TransitionGroup>

    <div v-else class="empty-state">
      <p>{{ emptyMessage }}</p>
      <button class="retry-btn" type="button" @click="emit('clear')">Limpar os filtros</button>
    </div>

    <ListFooter
      v-if="books.length > 0"
      :shown="visibleBooks.length"
      :total="books.length"
      :next-batch="nextBatch"
      @more="loadMore"
    />
  </div>
</template>

<script lang="ts" setup>
import BookCard from '@/components/BookCard.vue'
import ListFooter from '@/components/ListFooter.vue'
import { useBooksGrid } from '@/composables'
import type { Book } from '@/types'

const books = defineModel<Book[]>({ required: true })

withDefaults(
  defineProps<{
    emptyMessage?: string
  }>(),
  {
    emptyMessage: 'Nenhum livro com esses filtros',
  },
)

const emit = defineEmits<{
  clear: []
}>()

const { visibleBooks, nextBatch, loadMore } = useBooksGrid(books)
</script>

<style lang="scss" scoped>
.books-grid-wrap {
  position: relative;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-5) var(--space-3);

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: calc(var(--space-5) + var(--space-2)) var(--space-5);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  max-width: 380px;
  margin: 0 auto;
  padding: var(--space-14) var(--space-6);
  color: var(--color-text-default);
  text-align: center;
  font-size: 1rem;
}

.retry-btn {
  border: none;
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-lg);
  min-height: var(--touch-cta);
  font-family: var(--font-family-body);
  font-size: 1rem;
  cursor: pointer;
  background: var(--color-action-default);
  color: var(--color-surface-default);
  transition: opacity var(--motion-transition-default);

  &:hover {
    opacity: 0.85;
    background: var(--color-action-default-hover);
  }
  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: var(--space-1);
  }
}

.grid-enter-active {
  transition:
    opacity var(--motion-transition-default),
    transform var(--motion-transition-default);
}
.grid-enter-from {
  opacity: 0;
  transform: scale(0.96);
}
// Leaving cards stay in flow: taking them out collapses the list for a frame and clamps the scroll to 0.
.grid-leave-active {
  transition: opacity var(--motion-transition-default);
}
.grid-leave-to {
  opacity: 0;
}
.grid-move {
  transition: transform var(--motion-transition-default);
}
</style>
