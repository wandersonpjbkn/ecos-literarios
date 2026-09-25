import { computed, watch, type ModelRef, type Ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useBooksGridStore } from '@/stores'
import type { Book } from '@/types'

/** `reserved` = grid slots taken by cards that are not books (the eco), so pages still end on a full row. */
export function useBooksGrid(books: ModelRef<Book[]>, reserved: Ref<number>) {
  const store = useBooksGridStore()
  const { visibleCount } = storeToRefs(store)

  const source = computed(() => books.value)
  const visibleBooks = computed(() => source.value.slice(0, visibleCount.value - reserved.value))
  const nextBatch = computed(() => Math.min(store.pageSize, source.value.length - visibleBooks.value.length))

  watch(source, store.reset)

  return {
    visibleBooks,
    nextBatch,
    loadMore: store.increment,
  }
}
