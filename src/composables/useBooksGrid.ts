import { computed, watch, type ModelRef } from 'vue'
import { storeToRefs } from 'pinia'

import { useBooksGridStore } from '@/stores'
import type { Book } from '@/types'

export function useBooksGrid(books: ModelRef<Book[]>) {
  const store = useBooksGridStore()
  const { visibleCount, isLoading } = storeToRefs(store)

  const source = computed(() => books.value)
  const visibleBooks = computed(() => source.value.slice(0, visibleCount.value))
  const hasMore = computed(() => visibleCount.value < source.value.length)

  const loadMore = () => {
    if (!hasMore.value || isLoading.value) return
    isLoading.value = true
    requestAnimationFrame(() => {
      store.increment()
      isLoading.value = false
    })
  }

  watch(source, store.reset)

  return {
    visibleBooks,
    hasMore,
    isLoading,
    pageSize: store.pageSize,
    loadMore,
    reset: store.reset,
    increment: store.increment,
  }
}
