import { computed, ref, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'

import type { ReadingCounts, ReadingStatus } from '@/types'

import { useAuthStore, useReadingStore } from '@/stores'

import { errorText } from '@/composables/apiError'
import { getMyReading, getReadingCounts, removeReading, saveReading } from '@/composables/useApi'
import { useCanWrite } from '@/composables/useCanWrite'
import { useErrorReporter } from '@/composables/useErrorReporter'

/** The reader's list, loaded once per account: the book page and the shelves of Meus livros read the same copy. */
export const loadMyReading = async (userId: string | undefined) => {
  const store = useReadingStore()
  if (!userId) return store.clear()
  if (store.loadedFor === userId) return
  try {
    store.replaceAll(userId, await getMyReading())
  } catch (err) {
    useErrorReporter().captureException(err, { context: 'useReading.load' })
  }
}

/** "Quero ler" / "Lido" for one book: the reader's own status, the totals, and the actions. */
export function useReading(bookId: Ref<string | undefined>) {
  const router = useRouter()

  const auth = useAuthStore()
  const store = useReadingStore()

  const canWrite = useCanWrite()

  const counts = ref<ReadingCounts | null>(null)
  const pending = ref(false)
  const error = ref('')

  const status = computed(() => (bookId.value ? store.statuses[bookId.value] : undefined))

  const loadCounts = async () => {
    if (!bookId.value) return
    try {
      counts.value = await getReadingCounts(bookId.value)
    } catch (err) {
      counts.value = null
      useErrorReporter().captureException(err, { context: 'useReading.loadCounts' })
    }
  }

  // Signed out: the button leads to the login and back to this book (BACKEND.md, contract of slice 5).
  const change = async (next: ReadingStatus | null) => {
    if (!bookId.value || !canWrite.value || pending.value) return
    if (!auth.isLoggedIn) {
      await router.push({ name: 'auth-login', query: { voltar: router.currentRoute.value.fullPath } })
      return
    }
    pending.value = true
    error.value = ''
    try {
      if (next) await saveReading(bookId.value, next)
      else await removeReading(bookId.value)
      store.set(bookId.value, next)
      await loadCounts()
    } catch (err) {
      error.value = errorText(err, 'Não foi possível salvar. Tente de novo.')
    } finally {
      pending.value = false
    }
  }

  watch(() => auth.user?._id, loadMyReading, { immediate: true })
  watch(bookId, loadCounts, { immediate: true })

  return { status, counts, pending, error, canWrite, change }
}
