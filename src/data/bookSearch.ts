import { authorLine } from '@/data/authors'
import type { Book, Suggestion } from '@/types'

import { useUtils } from '@/composables/useUtils'

const { normalizeText } = useUtils()

const SUGGESTION_MIN_LENGTH = 2
const SUGGESTION_LIMIT = 8

export const matchesSearch = (book: Book, search: string): boolean => {
  const query = normalizeText(search.trim())
  return !query || [book.titulo, ...book.authors, book.porque].some((field) => normalizeText(field).includes(query))
}

export const titleSuggestions = (books: Book[], search: string): Suggestion[] => {
  const query = normalizeText(search.trim())
  if (query.length < SUGGESTION_MIN_LENGTH) return []
  return books
    .filter((book) => normalizeText(book.titulo).includes(query))
    .slice(0, SUGGESTION_LIMIT)
    .map((book) => ({ id: book.id, main: book.titulo, sub: authorLine(book.authors) }))
}
