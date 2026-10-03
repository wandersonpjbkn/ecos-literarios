import { ref, shallowRef } from 'vue'

import type { BookForEdit } from '@/types'

import { errorText } from '@/composables/apiError'
import { getBookForEdit } from '@/composables/useApi'
import { useErrorReporter } from '@/composables/useErrorReporter'

type Focus = 'porque'
type ReturnFocus = () => HTMLElement | null | undefined
export type BookChange = { kind: 'saved' | 'removed'; id?: string }

const book = ref<BookForEdit | null>(null)
const title = ref('')
const focus = ref<Focus | undefined>()
const returnFocus = shallowRef<ReturnFocus | undefined>()
const isOpen = ref(false)
const loadingId = ref<string | null>(null)
const error = ref('')
const lastChange = shallowRef<BookChange | null>(null)

export function useBookForm() {
  const openAdd = ({ title: typedTitle = '', fallback }: { title?: string; fallback?: ReturnFocus } = {}) => {
    book.value = null
    title.value = typedTitle
    focus.value = undefined
    returnFocus.value = fallback
    error.value = ''
    isOpen.value = true
  }

  const openEdit = async (bookId: string, { field, fallback }: { field?: Focus; fallback?: ReturnFocus } = {}) => {
    if (loadingId.value !== null) return
    loadingId.value = bookId
    error.value = ''
    try {
      book.value = await getBookForEdit(bookId)
      title.value = ''
      focus.value = field
      returnFocus.value = fallback
      isOpen.value = true
    } catch (err) {
      error.value = errorText(err, 'Não foi possível abrir este livro para editar. Tente de novo.')
      useErrorReporter().captureException(err, { context: 'useBookForm.openEdit' })
    } finally {
      loadingId.value = null
    }
  }

  const close = () => {
    isOpen.value = false
    book.value = null
  }

  const notify = (change: BookChange) => {
    lastChange.value = change
  }

  return { book, title, focus, returnFocus, isOpen, loadingId, error, lastChange, openAdd, openEdit, close, notify }
}
