<template>
  <div class="books-grid-wrap">
    <TransitionGroup v-if="books.length > 0" name="grid" tag="div" class="books-grid">
      <component :is="item.eco ? EcoCard : BookCard" v-for="item in items" :key="item.key" :book="item.book" />
    </TransitionGroup>

    <div v-else class="empty-state">
      <p>{{ emptyMessage }}</p>
      <AppButton class="retry-btn" variant="primary" @click="emit('clear')">Limpar os filtros</AppButton>
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
import { computed } from 'vue'

import AppButton from '@/components/AppButton.vue'
import BookCard from '@/components/BookCard.vue'
import EcoCard from '@/components/EcoCard.vue'
import ListFooter from '@/components/ListFooter.vue'
import { useBooksGrid } from '@/composables'
import type { Book } from '@/types'

const books = defineModel<Book[]>({ required: true })

const props = withDefaults(
  defineProps<{
    emptyMessage?: string
    // Third card (Main): takes a book's slot but stays out of the counts.
    eco?: Book | null
  }>(),
  {
    emptyMessage: 'Nenhum livro com esses filtros',
    eco: null,
  },
)

const ECO_SLOT = 2

const emit = defineEmits<{
  clear: []
}>()

const { visibleBooks, nextBatch, loadMore } = useBooksGrid(
  books,
  computed(() => (props.eco ? 1 : 0)),
)

const items = computed(() => {
  const list = visibleBooks.value.map((book) => ({ key: book.id, book, eco: false }))
  if (props.eco && list.length > ECO_SLOT) list.splice(ECO_SLOT, 0, { key: 'eco', book: props.eco, eco: true })
  return list
})
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
