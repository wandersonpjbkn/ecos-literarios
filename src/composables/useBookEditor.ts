import { ref } from 'vue'

import type { BookForEdit } from '@/types'

import { errorText } from '@/composables/apiError'
import { getBookForEdit, useApi } from '@/composables/useApi'
import { useErrorReporter } from '@/composables/useErrorReporter'

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
      editingBook.value = await getBookForEdit(bookId)
      isOpen.value = true
    } catch (err) {
      error.value = errorText(err, 'Não foi possível abrir este livro para editar. Tente de novo.')
      useErrorReporter().captureException(err, { context: 'useBookEditor.open' })
    } finally {
      loadingId.value = null
    }
  }

  const close = () => {
    isOpen.value = false
    editingBook.value = null
  }

  const onSaved = () => useApi().fetchBooks()

  return { editingBook, isOpen, loadingId, error, open, close, onSaved }
}
