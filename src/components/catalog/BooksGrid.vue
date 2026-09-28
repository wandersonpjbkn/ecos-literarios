<template>
  <div class="books-grid-wrap">
    <TransitionGroup v-if="books.length > 0" ref="grid" name="grid" tag="div" class="books-grid book-grid">
      <component
        :is="item.eco ? EcoCard : BookCard"
        v-for="item in items"
        :key="item.key"
        :book="item.book"
        :data-list-item="item.eco ? undefined : ''"
      />
    </TransitionGroup>

    <!-- The page knows why the list is empty (search or filters) and says so (EmptyState.md). -->
    <slot v-else name="empty" />

    <ListFooter
      v-if="books.length > 0"
      :shown="visibleBooks.length"
      :total="books.length"
      :next-batch="nextBatch"
      @more="more(gridElement())"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

import type { Book } from '@/types'

import { useLoadMore } from '@/composables/useLoadMore'

import BookCard from '@/components/books/BookCard.vue'
import EcoCard from '@/components/catalog/EcoCard.vue'
import ListFooter from '@/components/ui/ListFooter.vue'

const ECO_SLOT = 2

const books = defineModel<Book[]>({ required: true })

const props = withDefaults(
  defineProps<{
    // Third card (Main): takes a book's slot but stays out of the counts.
    eco?: Book | null
  }>(),
  { eco: null },
)

const {
  visible: visibleBooks,
  nextBatch,
  more,
} = useLoadMore(books, { name: 'catalogo', reserved: computed(() => (props.eco ? 1 : 0)) })

const grid = ref<{ $el: HTMLElement } | null>(null)

const items = computed(() => {
  const list = visibleBooks.value.map((book) => ({ key: book.id, book, eco: false }))
  if (props.eco && list.length > ECO_SLOT) list.splice(ECO_SLOT, 0, { key: 'eco', book: props.eco, eco: true })
  return list
})

const gridElement = () => grid.value?.$el
</script>

<style lang="scss" scoped>
.books-grid-wrap {
  position: relative;
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
