import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useBooksGridStore } from '@/stores'
import type { Book } from '@/types'

export function useBooksGrid(source: Book[]) {
  const store = useBooksGridStore()

  const { visibleCount, isLoading } = storeToRefs(store)

  const visibleBooks = computed(() => source.slice(0, visibleCount.value))
  const hasMore = computed(() => visibleCount.value < source.length)

  const loadMore = () => {
    if (!hasMore.value || isLoading.value) return
    isLoading.value = true
    requestAnimationFrame(() => {
      store.increment()
      isLoading.value = false
    })
  }

  watch(
    () => source,
    () => {
      store.reset()
    },
  )

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
