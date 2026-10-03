const normalizeText = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .trim()
}

const slugify = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
}

function sendGtmEvent(payload: Record<string, unknown>) {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(payload)
}

export function useUtils() {
  return { normalizeText, slugify, sendGtmEvent }
}
