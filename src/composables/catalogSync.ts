import { useEventListener } from '@vueuse/core'

import { useApi } from '@/composables/useApi'

const RECHECK_AFTER_MS = 10 * 60 * 1000

export function startCatalogSync(): () => void {
  const { fetchBooks } = useApi()
  let checkedAt = 0

  const check = () => {
    checkedAt = Date.now()
    fetchBooks()
  }

  try {
    localStorage.removeItem('cache')
  } catch {}

  check()
  const stopVisible = useEventListener(document, 'visibilitychange', () => {
    if (document.visibilityState === 'visible' && Date.now() - checkedAt > RECHECK_AFTER_MS) check()
  })
  const stopOnline = useEventListener(window, 'online', check)

  return () => {
    stopVisible()
    stopOnline()
  }
}
