import { nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'

// After the route transition (App.vue's "fade", out-in) the new screen is in place.
const SETTLE_MS = 400

/** A new path focuses the screen's heading; a query change (filter, "Ver mais") keeps the focus in place. */
export function useRouteFocus() {
  const route = useRoute()
  watch(
    () => route.path,
    async () => {
      await nextTick()
      setTimeout(() => {
        // Someone typing (the header search moves to the catalog as they type) keeps the cursor in the field.
        const active = document.activeElement
        if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return
        // Areas keep the area's name in their bar: the section's own title is the one that changed.
        const heading = document.querySelector<HTMLElement>('.panel-main h2, .app-main h1, .panel-main h1, main h1')
        const target = heading ?? document.querySelector<HTMLElement>('main')
        if (!target) return
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
        target.focus({ preventScroll: true })
      }, SETTLE_MS)
    },
  )
}
