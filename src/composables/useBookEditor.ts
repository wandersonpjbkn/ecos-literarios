import { ref } from 'vue'
import { toApiError } from '@/composables/apiError'

import { buildHeaders, useApi } from '@/composables/useApi'
import { useErrorReporter } from '@/composables/useErrorReporter'
import { API_BASE } from '@/data/config'
import type { BookForEdit } from '@/types'

/** Loads a book with its editable fields and drives BookFormDrawer (member or admin scope). */
export function useBookEditor() {
  const editingBook = ref<BookForEdit | null>(null)
  const isOpen = ref(false)
  const loadingId = ref<string | null>(null)
  const error = ref('')

  const open = async (bookId: string) => {
    if (loadingId.value !== null) return
    loadingId.value = bookId
    error.value = ''
    try {
      const res = await fetch(`${API_BASE}/books/${bookId}`, { headers: buildHeaders() })
      if (!res.ok) throw await toApiError(res, 'Não deu pra abrir este livro pra editar. Tente de novo.')
      editingBook.value = (await res.json()) as BookForEdit
      isOpen.value = true
    } catch (err) {
      error.value = 'Não deu pra abrir este livro pra editar. Tente de novo.'
      useErrorReporter().captureException(err, { context: 'useBookEditor.open' })
    } finally {
      loadingId.value = null
    }
  }

  const close = () => {
    isOpen.value = false
    editingBook.value = null
  }

  const onSaved = () => useApi().fetchBooks(true)

  return { editingBook, isOpen, loadingId, error, open, close, onSaved }
}
