import { ref, shallowRef } from 'vue'

import type { BookForEdit } from '@/types'

import { errorText } from '@/composables/apiError'
import { getBookForEdit } from '@/composables/useApi'
import { useErrorReporter } from '@/composables/useErrorReporter'

type Focus = 'porque'
// Where focus goes when the button that opened the form is gone (a removed row): see AppDrawer.
type ReturnFocus = () => HTMLElement | null | undefined
export type BookChange = { kind: 'saved' | 'removed'; id?: string }

// One book form for the whole app, mounted in App.vue: every screen opens the same drawer.
const book = ref<BookForEdit | null>(null)
const title = ref('')
const focus = ref<Focus | undefined>()
const returnFocus = shallowRef<ReturnFocus | undefined>()
const isOpen = ref(false)
const loadingId = ref<string | null>(null)
const error = ref('')
// A new object on every save or removal, so a screen can watch it and react (reload its list, leave a removed book).
const lastChange = shallowRef<BookChange | null>(null)

/** Opens the book form to add or edit, and tells the screens what changed. */
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
