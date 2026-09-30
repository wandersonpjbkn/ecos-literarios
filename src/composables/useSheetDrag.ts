import { computed, ref, type Ref } from 'vue'

// Below this a touch is still a tap; past it the grip captures the pointer, so "Fechar" gets no click.
const START_PX = 8
// Share of the sheet's height that closes it on release.
const CLOSE_SHARE = 0.25
// A flick this fast closes it even when short.
const FLICK_PX_PER_MS = 0.5

/** Drag a bottom sheet down by its handle or header; past a quarter of its height, or flicked, it closes. */
export function useSheetDrag(panel: Ref<HTMLElement | null>, enabled: () => boolean, onClose: () => void) {
  const offset = ref(0)
  const dragging = ref(false)
  let pointer: number | null = null
  let moved = false
  let startY = 0
  let lastY = 0
  let lastT = 0
  let speed = 0

  // While the finger moves the sheet follows it at once; on release the stylesheet's transition takes it back.
  const style = computed(() =>
    offset.value
      ? { transform: `translateY(${offset.value}px)`, transition: dragging.value ? 'none' : undefined }
      : undefined,
  )

  const onPointerdown = (event: PointerEvent) => {
    if (!enabled() || event.button !== 0) return
    pointer = event.pointerId
    moved = false
    speed = 0
    startY = lastY = event.clientY
    lastT = event.timeStamp
  }

  const onPointermove = (event: PointerEvent) => {
    if (event.pointerId !== pointer) return
    const distance = event.clientY - startY
    if (!moved) {
      if (distance < START_PX) return
      moved = true
      dragging.value = true
      ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    }
    const elapsed = event.timeStamp - lastT
    if (elapsed > 0) speed = (event.clientY - lastY) / elapsed
    lastY = event.clientY
    lastT = event.timeStamp
    offset.value = Math.max(0, distance)
  }

  const release = (event: PointerEvent, cancelled: boolean) => {
    if (event.pointerId !== pointer) return
    pointer = null
    if (!moved) return
    dragging.value = false
    const height = panel.value?.offsetHeight ?? Number.POSITIVE_INFINITY
    if (!cancelled && (offset.value > height * CLOSE_SHARE || speed > FLICK_PX_PER_MS)) onClose()
    else offset.value = 0
  }

  const handlers = {
    onPointerdown,
    onPointermove,
    onPointerup: (event: PointerEvent) => release(event, false),
    onPointercancel: (event: PointerEvent) => release(event, true),
  }

  const reset = () => {
    offset.value = 0
    dragging.value = false
    pointer = null
    moved = false
  }

  return { style, handlers, reset }
}
