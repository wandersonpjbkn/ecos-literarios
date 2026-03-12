export function sendGtmEvent(payload: Record<string, any>) {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(payload)
}
