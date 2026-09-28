import { ref } from 'vue'
import { errorText } from '@/composables/apiError'

import { useErrorReporter } from '@/composables'
import { applyBookEnrichment, previewBookEnrichment } from '@/composables/useApi'
import type { BookPayload, EnrichmentField, EnrichmentItem, EnrichmentPreview, EnrichmentApiResponse } from '@/types'

const FIELD_META: ReadonlyArray<{ field: EnrichmentField; label: string }> = [
  { field: 'description', label: 'Sinopse' },
  { field: 'coverUrl', label: 'Capa' },
  { field: 'publisher', label: 'Editora' },
  { field: 'isbn', label: 'ISBN' },
  { field: 'pageCount', label: 'Páginas' },
  { field: 'publishedYear', label: 'Publicado em' },
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
      const data = await previewBookEnrichment(id)

      const sourceLabel = data.source === 'google_books' ? 'Google Books' : 'Open Library'
      const items = buildPreviewItems(data.preview)

      preview.value = { sourceLabel, items }
      selectedFields.value = items.filter((i) => i.hasValue).map((i) => i.field)
    } catch (e) {
      error.value = errorText(e, 'Não foi possível buscar os dados do livro. Tente de novo.')
      if (import.meta.env.DEV) console.error('[useBookEnrichment] fetchPreview', e)
      useErrorReporter().captureException(e, { context: 'useBookEnrichment.preview' })
    } finally {
      isLoading.value = false
    }
  }

  /** Returns the saved book, or null when nothing was applied. */
  async function applySelected(): Promise<BookPayload | null> {
    const id = bookId()
    if (!id || selectedFields.value.length === 0) return null

    isApplying.value = true
    error.value = ''

    try {
      const data = await applyBookEnrichment(id, selectedFields.value)
      await fetchPreview()
      return data.book
    } catch (e) {
      error.value = errorText(e, 'Não foi possível salvar os dados no livro. Tente de novo.')
      if (import.meta.env.DEV) console.error('[useBookEnrichment] applySelected', e)
      useErrorReporter().captureException(e, { context: 'useBookEnrichment.apply' })
      return null
    } finally {
      isApplying.value = false
    }
  }

  return { isLoading, isApplying, error, preview, selectedFields, fetchPreview, applySelected, reset }
}
