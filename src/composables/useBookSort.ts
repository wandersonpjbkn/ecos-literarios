import { computed, type Ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useFiltersStore } from '@/stores'
import { useUtils } from '@/composables/useUtils'

import type { Book, BookSortOrder } from '@/types'

export function useBookSort(source: Ref<Book[]>) {
  const filtersStore = useFiltersStore()
  const { sortOrder } = storeToRefs(filtersStore)

  const sortOptions: { label: string; value: BookSortOrder }[] = [
    { label: 'Mais recentes', value: 'new' },
    { label: 'Mais antigos', value: 'old' },
    { label: 'A → Z', value: 'asc' },
    { label: 'Z → A', value: 'desc' },
  ]

  const sortedBooks = computed<Book[]>(() => {
    if (sortOrder.value === 'old') return [...source.value].reverse()
    if (sortOrder.value === 'new') return [...source.value]

    return [...source.value].sort((a, b) => {
      const titleA = useUtils().normalizeText(a.titulo)
      const titleB = useUtils().normalizeText(b.titulo)
      const result = titleA.localeCompare(titleB, 'pt-BR')
      return sortOrder.value === 'asc' ? result : -result
    })
  })

  return {
    sortOrder,
    sortOptions,
    sortedBooks,
  }
}
