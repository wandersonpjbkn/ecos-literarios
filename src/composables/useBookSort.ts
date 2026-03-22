import { computed, ref, type Ref } from 'vue'

import type { Book, BookSortOrder } from '@/types'

const normalizeText = (value?: string) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

export function useBookSort(source: Ref<Book[]>, initialOrder: BookSortOrder = 'new') {
  const sortOrder = ref<BookSortOrder>(initialOrder)

  const sortOptions = ref<{ label: string; value: BookSortOrder }[]>([
    { label: 'Mais recentes', value: 'new' },
    { label: 'Mais antigos', value: 'old' },
    { label: 'A → Z', value: 'asc' },
    { label: 'Z → A', value: 'desc' },
  ])

  const sortedBooks = computed<Book[]>(() => {
    if (sortOrder.value === 'old') return [...source.value]

    if (sortOrder.value === 'new') return [...source.value].reverse()

    return [...source.value].sort((a, b) => {
      const titleA = normalizeText(a.titulo)
      const titleB = normalizeText(b.titulo)

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
