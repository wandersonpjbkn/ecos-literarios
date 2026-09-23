import { computed, watch, type ModelRef } from 'vue'
import { storeToRefs } from 'pinia'

import { useBooksGridStore } from '@/stores'
import type { Book } from '@/types'

export function useBooksGrid(books: ModelRef<Book[]>) {
  const store = useBooksGridStore()
  const { visibleCount } = storeToRefs(store)

  const source = computed(() => books.value)
  const visibleBooks = computed(() => source.value.slice(0, visibleCount.value))
  const nextBatch = computed(() => Math.min(store.pageSize, source.value.length - visibleBooks.value.length))

  watch(source, store.reset)

  return {
    visibleBooks,
    nextBatch,
    loadMore: store.increment,
  }
}
