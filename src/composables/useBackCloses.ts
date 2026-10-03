import { onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'

type Level = { onPop: () => void }

// Open panels, innermost last: the system back answers only to the top one.
const levels: Level[] = []
// Back steps the app took itself (a panel closed by its button), not the person's.
const ownPops: Array<() => void> = []

const onPopState = () => {
  const own = ownPops.shift()
  if (own) return own()
  levels.at(-1)?.onPop()
}

/** Back closes an open side panel; `mayClose` can keep it open (unsaved changes). */
export function useBackCloses(
  open: () => boolean,
  onClose: () => void,
  mayClose: () => boolean | Promise<boolean> = () => true,
) {
  const router = useRouter()

  let level: Level | null = null
  let openedAt = ''
  // One step to take once the panel's entry is gone (a link inside it); a newer one replaces it.
  let afterClose: (() => void) | null = null

  const runAfterClose = () => {
    const step = afterClose
    afterClose = null
    step?.()
  }

  const leave = () => {
    if (!level) return
    levels.splice(levels.indexOf(level), 1)
    level = null
    if (!levels.length) window.removeEventListener('popstate', onPopState)
  }

  const onPop = async () => {
    if (await mayClose()) {
      leave()
      onClose()
      return
    }
    // The back already used the panel's entry: put it back, so the next back still closes the panel.
    history.pushState(history.state, '')
  }

  /** Closes the panel, then runs `step` once its history entry is gone (right away when there is none). */
  const closeThen = (step: () => void) => {
    afterClose = step
    if (open()) onClose()
    else runAfterClose()
  }

  watch(open, (isOpen) => {
    if (isOpen) {
      openedAt = router.currentRoute.value.fullPath
      history.pushState(history.state, '')
      if (!levels.length) window.addEventListener('popstate', onPopState)
      level = { onPop }
      levels.push(level)
      return
    }
    const unchanged = router.currentRoute.value.fullPath === openedAt
    const wasOpen = level !== null
    leave()
    if (!(wasOpen && unchanged)) return runAfterClose()
    // Closed by its button: step back over its entry, and take that step as the app's, not the person's.
    if (!levels.length) window.addEventListener('popstate', onPopState)
    ownPops.push(() => {
      if (!levels.length) window.removeEventListener('popstate', onPopState)
      runAfterClose()
    })
    history.back()
  })

  // A link inside the panel went to another page: the panel just closes, the history is the router's again.
  watch(
    () => router.currentRoute.value.path,
    (path, before) => {
      if (!level || path === before) return
      leave()
      onClose()
    },
  )

  onBeforeUnmount(() => {
    leave()
  })

  return { closeThen }
}
