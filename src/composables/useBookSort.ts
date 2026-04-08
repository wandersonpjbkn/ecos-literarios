import { computed, ref, type Ref } from 'vue'

import { useUtils } from '@/composables/useUtils'

import type { Book, BookSortOrder } from '@/types'

export function useBookSort(source: Ref<Book[]>, initialOrder: BookSortOrder = 'new') {
  const sortOrder = ref<BookSortOrder>(initialOrder)

  const sortOptions = ref<{ label: string; value: BookSortOrder }[]>([
    { label: 'Mais recentes', value: 'new' },
    { label: 'Mais antigos', value: 'old' },
    { label: 'A → Z', value: 'asc' },
    { label: 'Z → A', value: 'desc' },
  ])

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

  const setSortOrder = (value: BookSortOrder) => {
    sortOrder.value = value
  }

  return {
    sortOrder,
    sortOptions,
    sortedBooks,
    setSortOrder,
  }
}
