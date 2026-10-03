import { ref } from 'vue'

import type { BookCandidate, BookSearchQuery, BookSearchSource } from '@/types'

import { ApiError, errorText } from '@/composables/apiError'
import { searchBookCandidates } from '@/composables/useApi'
import { useErrorReporter } from '@/composables/useErrorReporter'

// searching (V1) · found (V2) · none (V4) · unavailable (V5: neither source answered) · failed (any other error)
export type BookSearchStatus = 'idle' | 'searching' | 'found' | 'none' | 'unavailable' | 'failed'

/** The cover and data search: what the API found for a title and author, and in which state the view is. */
export function useBookSearch() {
  const status = ref<BookSearchStatus>('idle')
  const candidates = ref<BookCandidate[]>([])
  const source = ref<BookSearchSource | null>(null)
  const errorMessage = ref('')
  const query = ref<BookSearchQuery>({ title: '', author: '' })
  // A newer search wins: an older answer arriving late does not overwrite it.
  let ticket = 0

  const search = async (next: BookSearchQuery) => {
    ticket += 1
    const mine = ticket
    query.value = { ...next }
    status.value = 'searching'
    errorMessage.value = ''
    try {
      const found = await searchBookCandidates({ ...next, isbn: next.isbn?.trim() || undefined })
      if (mine !== ticket) return
      candidates.value = found.candidates
      source.value = found.source
      status.value = found.candidates.length ? 'found' : 'none'
    } catch (err) {
      if (mine !== ticket) return
      candidates.value = []
      if (err instanceof ApiError && err.status === 503) {
        status.value = 'unavailable'
        return
      }
      status.value = 'failed'
      errorMessage.value = errorText(err, 'Não foi possível buscar agora. Tente de novo.')
      useErrorReporter().captureException(err, { context: 'useBookSearch.search' })
    }
  }

  const reset = () => {
    ticket += 1
    status.value = 'idle'
    candidates.value = []
    source.value = null
  }

  return { status, candidates, source, errorMessage, query, search, reset }
}
