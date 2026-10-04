import { onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'

type Level = { onPop: () => void }

const levels: Level[] = []
const ownPops: Array<() => void> = []

const onPopState = () => {
  const own = ownPops.shift()
  if (own) return own()
  levels.at(-1)?.onPop()
}

export function useBackCloses(
  open: () => boolean,
  onClose: () => void,
  mayClose: () => boolean | Promise<boolean> = () => true,
) {
  const router = useRouter()

  let level: Level | null = null
  let openedAt = ''
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
    history.pushState(history.state, '')
  }

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
    if (!levels.length) window.addEventListener('popstate', onPopState)
    ownPops.push(() => {
      if (!levels.length) window.removeEventListener('popstate', onPopState)
      runAfterClose()
    })
    history.back()
  })

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
