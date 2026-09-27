import { onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'

/** Back closes an open side panel; closing drops the entry opening added, unless the URL changed meanwhile. */
export function useBackCloses(open: () => boolean, onClose: () => void) {
  const router = useRouter()
  let armed = false
  let openedAt = ''
  // One step to take once the panel's entry is gone (a link inside it); a newer one replaces it.
  let afterClose: (() => void) | null = null

  const runAfterClose = () => {
    const step = afterClose
    afterClose = null
    step?.()
  }

  const onPop = () => {
    if (!armed) return
    armed = false
    onClose()
  }

  const disarm = () => {
    armed = false
    window.removeEventListener('popstate', onPop)
  }

  watch(open, (isOpen) => {
    if (isOpen) {
      openedAt = router.currentRoute.value.fullPath
      history.pushState(history.state, '')
      armed = true
      window.addEventListener('popstate', onPop)
      return
    }
    const unchanged = router.currentRoute.value.fullPath === openedAt
    const wasArmed = armed
    disarm()
    if (!(wasArmed && unchanged)) return runAfterClose()
    window.addEventListener('popstate', runAfterClose, { once: true })
    history.back()
  })

  // A link inside the panel went to another page: the panel just closes, the history is the router's again.
  watch(
    () => router.currentRoute.value.path,
    (path, before) => {
      if (!armed || path === before) return
      disarm()
      onClose()
    },
  )

  onBeforeUnmount(() => {
    disarm()
    window.removeEventListener('popstate', runAfterClose)
  })

  /** Closes the panel, then runs `step` once its history entry is gone (right away when there is none). */
  const closeThen = (step: () => void) => {
    afterClose = step
    if (open()) onClose()
    else runAfterClose()
  }

  return { closeThen }
}
