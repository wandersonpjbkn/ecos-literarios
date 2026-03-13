export function sendGtmEvent(payload: Record<string, unknown>) {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(payload)
}
