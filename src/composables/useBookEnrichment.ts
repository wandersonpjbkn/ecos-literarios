import { ref } from 'vue'
import { buildHeaders } from '@/composables/useApi'
import type { EnrichmentField, EnrichmentItem, EnrichmentPreview, EnrichmentApiResponse } from '@/types'
import { API_BASE } from '@/data/config'

const FIELD_META: ReadonlyArray<{ field: EnrichmentField; label: string }> = [
  { field: 'description', label: 'Sinopse' },
  { field: 'coverUrl', label: 'URL da capa' },
  { field: 'publisher', label: 'Editora' },
  { field: 'isbn', label: 'ISBN' },
  { field: 'pageCount', label: 'Qtd. páginas' },
  { field: 'publishedYear', label: 'Ano publicação' },
]

function resolvePreview(field: EnrichmentField, value: unknown): string {
  if (field === 'pageCount' || field === 'publishedYear') {
    return typeof value === 'number' && value > 0 ? String(value) : ''
  }
  return typeof value === 'string' ? value : ''
}

function resolveHasValue(field: EnrichmentField, value: unknown): boolean {
  if (field === 'pageCount' || field === 'publishedYear') {
    return typeof value === 'number' && value > 0
  }
  return typeof value === 'string' && value.length > 0
}

function buildPreviewItems(raw: EnrichmentApiResponse['preview']): EnrichmentItem[] {
  return FIELD_META.map(({ field, label }) => {
    const value = raw[field as keyof typeof raw]
    return {
      field,
      label,
      preview: resolvePreview(field, value),
      hasValue: resolveHasValue(field, value),
    }
  })
}

async function safeJson<T>(res: Response, fallback: string): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: fallback }))
    throw new Error(body.error ?? fallback)
  }
  return res.json() as Promise<T>
}

/** Accepts bookId as a getter to stay reactive without coupling to a Ref type. */
export function useBookEnrichment(bookId: () => string | undefined) {
  const isLoading = ref(false)
  const isApplying = ref(false)
  const error = ref('')
  const preview = ref<EnrichmentPreview | null>(null)
  const selectedFields = ref<EnrichmentField[]>([])

  function reset(): void {
    error.value = ''
    preview.value = null
    selectedFields.value = []
  }

  async function fetchPreview(): Promise<void> {
    const id = bookId()
    if (!id) return

    isLoading.value = true
    error.value = ''

    try {
      const res = await fetch(`${API_BASE}/books/${id}/enrich`, {
        method: 'POST',
        headers: buildHeaders(),
      })
      const data = await safeJson<EnrichmentApiResponse>(res, `HTTP ${res.status}`)

      const sourceLabel = data.source === 'google_books' ? 'Google Books' : 'Open Library'
      const items = buildPreviewItems(data.preview)

      preview.value = { sourceLabel, items }
      selectedFields.value = items.filter((i) => i.hasValue).map((i) => i.field)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erro ao buscar preview de enriquecimento.'
    } finally {
      isLoading.value = false
    }
  }

  /** Returns true on success so the caller can emit events or show feedback. */
  async function applySelected(): Promise<boolean> {
    const id = bookId()
    if (!id || selectedFields.value.length === 0) return false

    isApplying.value = true
    error.value = ''

    try {
      const res = await fetch(`${API_BASE}/books/${id}/enrich/apply`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({ fields: selectedFields.value }),
      })
      await safeJson(res, `HTTP ${res.status}`)
      await fetchPreview()
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erro ao aplicar enriquecimento.'
      return false
    } finally {
      isApplying.value = false
    }
  }

  return { isLoading, isApplying, error, preview, selectedFields, fetchPreview, applySelected, reset }
}
