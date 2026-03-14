import { computed, ref, type Ref } from 'vue'

import type { Book, BookSortOrder } from '@/types'

const normalizeText = (value?: string) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

export function useBookSort(source: Ref<Book[]>, initialOrder: BookSortOrder = 'asc') {
  const sortOrder = ref<BookSortOrder>(initialOrder)

  const sortedBooks = computed<Book[]>(() => {
    return [...source.value].sort((a, b) => {
      const titleA = normalizeText(a.titulo)
      const titleB = normalizeText(b.titulo)

      const result = titleA.localeCompare(titleB, 'pt-BR')
      return sortOrder.value === 'asc' ? result : -result
    })
  })

  const toggleSortOrder = () => {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  }

  const setSortOrder = (value: BookSortOrder) => {
    sortOrder.value = value
  }

  return {
    sortOrder,
    sortedBooks,
    toggleSortOrder,
    setSortOrder,
  }
}
