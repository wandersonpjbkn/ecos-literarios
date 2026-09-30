import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue'

type Options = {
  open: () => boolean
  panel: Ref<HTMLElement | null>
  // Where focus starts inside the dialog.
  initial: () => HTMLElement | null | undefined
  onClose: () => void
  // Where focus goes back when the element that opened the dialog is gone (a removed row).
  fallback?: () => HTMLElement | null | undefined
}

const FOCUSABLE = 'button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])'

// Open dialogs, oldest first: only the last one opened answers the keyboard (a confirmation over the edit form).
const stack: symbol[] = []

/** Modal focus: moves in on open, Tab stays inside, Esc closes, and focus returns to what opened it. */
export function useDialogFocus({ open, panel, initial, onClose, fallback }: Options) {
  const token = Symbol('dialog')

  let opener: HTMLElement | null = null
  let active = false

  const leaveStack = () => {
    const at = stack.indexOf(token)
    if (at !== -1) stack.splice(at, 1)
  }

  const onKeydown = (event: KeyboardEvent) => {
    if (stack[stack.length - 1] !== token) return
    // A control inside that already handled the key (preventDefault) keeps it: Esc closes that list, not the dialog.
    if (event.defaultPrevented) return
    if (event.key === 'Escape') return onClose()
    if (event.key !== 'Tab' || !panel.value) return

    const focusable = [...panel.value.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (el) => !el.hasAttribute('disabled') && el.getClientRects().length > 0,
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!panel.value.contains(document.activeElement)) {
      event.preventDefault()
      first?.focus()
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
      // eslint-disable-next-line sonarjs/no-duplicated-branches -- outside the panel and past the last both wrap to the first
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  watch(
    open,
    async (isOpen) => {
      if (isOpen) {
        active = true
        stack.push(token)
        opener = document.activeElement as HTMLElement | null
        document.addEventListener('keydown', onKeydown)
        await nextTick()
        initial()?.focus()
      } else if (active) {
        active = false
        leaveStack()
        document.removeEventListener('keydown', onKeydown)
        await nextTick()
        const target = opener?.isConnected ? opener : fallback?.()
        target?.focus()
        opener = null
      }
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    leaveStack()
    document.removeEventListener('keydown', onKeydown)
  })
}
