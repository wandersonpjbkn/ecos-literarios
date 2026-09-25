import { computed, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useUtils } from '@/composables/useUtils'

import type { Book, BookSortOrder } from '@/types'

const DEFAULT_ORDER: BookSortOrder = 'recentes'

const SORT_OPTIONS: { label: string; value: BookSortOrder }[] = [
  { label: 'Mais recentes', value: 'recentes' },
  { label: 'Título (A–Z)', value: 'titulo' },
  { label: 'Por quem mencionou', value: 'pessoa' },
  { label: 'Por gênero', value: 'genero' },
]

const SORT_FIELD: Record<Exclude<BookSortOrder, 'recentes'>, (book: Book) => string> = {
  titulo: () => '',
  pessoa: (book) => book.quem,
  genero: (book) => book.categoria,
}

// Cached catalogs may lack `added_at`; the API already sends newest first, so a tie keeps that order.
const byNewest = (a: Book, b: Book) => (a.added_at && b.added_at ? b.added_at.localeCompare(a.added_at) : 0)

export function useBookSort(source: Ref<Book[]>) {
  const route = useRoute()
  const router = useRouter()
  const { normalizeText } = useUtils()

  const sortOrder = computed({
    get: (): BookSortOrder => {
      const order = route.query.ordem as BookSortOrder
      return SORT_OPTIONS.some((option) => option.value === order) ? order : DEFAULT_ORDER
    },
    set: (order: BookSortOrder) => router.replace({ query: { ...route.query, ordem: order } }),
  })

  const compare = (a: string, b: string) => normalizeText(a).localeCompare(normalizeText(b), 'pt-BR')

  const sortedBooks = computed<Book[]>(() => {
    const order = sortOrder.value
    if (order === 'recentes') return [...source.value].sort(byNewest)
    const field = SORT_FIELD[order]
    return [...source.value].sort((a, b) => compare(field(a), field(b)) || compare(a.titulo, b.titulo))
  })

  return {
    sortOrder,
    sortOptions: SORT_OPTIONS,
    sortedBooks,
  }
}
