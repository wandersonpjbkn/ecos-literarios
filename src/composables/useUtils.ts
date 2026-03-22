import DOMPurify from 'dompurify'

const normalizeText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .trim()

const slugify = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove pontuação (pontos, apóstrofos…)
    .trim()
    .replace(/\s+/g, '-') // espaços → hífens
    .replace(/-{2,}/g, '-') // colapsa hífens duplos

const sanitizeText = (content: string): string => DOMPurify.sanitize(content)

function sendGtmEvent(payload: Record<string, unknown>) {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(payload)
}

export function useUtils() {
  return { normalizeText, slugify, sanitizeText, sendGtmEvent }
}
