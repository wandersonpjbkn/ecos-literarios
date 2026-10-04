import { nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'

const SETTLE_MS = 400

export function useRouteFocus() {
  const route = useRoute()
  watch(
    () => route.path,
    async () => {
      await nextTick()
      setTimeout(() => {
        const active = document.activeElement
        if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return
        const heading = document.querySelector<HTMLElement>('.panel-main h2, .app-main h1, .panel-main h1, main h1')
        const target = heading ?? document.querySelector<HTMLElement>('main')
        if (!target) return
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
        target.focus({ preventScroll: true })
      }, SETTLE_MS)
    },
  )
}
