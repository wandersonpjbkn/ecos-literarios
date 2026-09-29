import { useEventListener } from '@vueuse/core'

import { useApi } from '@/composables/useApi'

// A tab left open comes back to the list the others changed meanwhile; sooner than this, the copy is fresh enough.
const RECHECK_AFTER_MS = 10 * 60 * 1000

/** The catalog checked against the API on every visit and when the tab comes back; started once in App.vue. */
export function startCatalogSync(): () => void {
  const { fetchBooks } = useApi()
  let checkedAt = 0

  const check = () => {
    checkedAt = Date.now()
    fetchBooks()
  }

  // The second copy an earlier version kept, with its 7-day expiry; nothing reads it now.
  try {
    localStorage.removeItem('cache')
  } catch {
    // Storage blocked: there is no old copy either.
  }

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
