import { toApiError } from '@/composables/apiError'
import { ref } from 'vue'

import { useErrorReporter } from '@/composables'
import { buildHeaders } from '@/composables/useApi'
import type { SupportEntity, EntityCrudOptions } from '@/types'
import { API_BASE } from '@/data/config'

/** Reusable CRUD state for flat support entities (nome + slug). */
export function useEntityCrud({ resource }: EntityCrudOptions) {
  const items = ref<SupportEntity[]>([])
  const loading = ref(false)
  const error = ref('')

  const fetchAll = async () => {
    loading.value = true
    error.value = ''
    try {
      const res = await fetch(`${API_BASE}/${resource}`, { headers: buildHeaders() })
      if (!res.ok) throw await toApiError(res, 'Não deu pra carregar a lista. Tente de novo.')
      items.value = await res.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Não deu pra carregar a lista. Tente de novo.'
      if (import.meta.env.DEV) console.error(`[useEntityCrud][${resource}]`, e)
      useErrorReporter().captureException(e, { context: 'useEntityCrud.fetchAll' })
    } finally {
      loading.value = false
    }
  }

  const create = async (nome: string): Promise<SupportEntity> => {
    const res = await fetch(`${API_BASE}/${resource}`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ nome }),
    })

    if (!res.ok) throw await toApiError(res, 'Não deu pra criar. Tente de novo.', 'POST')

    const created: SupportEntity = await res.json()
    items.value = [...items.value, created].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    return created
  }

  const update = async (id: string, nome: string): Promise<SupportEntity> => {
    const res = await fetch(`${API_BASE}/${resource}/${id}`, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: JSON.stringify({ nome }),
    })

    if (!res.ok) throw await toApiError(res, 'Não deu pra salvar. Tente de novo.', 'PATCH')

    const updated: SupportEntity = await res.json()
    items.value = items.value
      .map((e) => (e._id === id ? updated : e))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    return updated
  }

  const remove = async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/${resource}/${id}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    })

    if (!res.ok) throw await toApiError(res, 'Não deu pra remover. Tente de novo.', 'DELETE')

    items.value = items.value.filter((e) => e._id !== id)
  }

  return { items, loading, error, fetchAll, create, update, remove }
}
