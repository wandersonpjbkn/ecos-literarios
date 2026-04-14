import { ref } from 'vue'
import { buildHeaders } from '@/composables/useApi'

const API_BASE = import.meta.env.VITE_API_URL as string

export interface SupportEntity {
  _id: string
  nome: string
  slug: string
  created_at?: string
}

interface EntityCrudOptions {
  /** URL path segment: 'autores', 'midias', 'categorias', 'subgeneros' */
  resource: string
}

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
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      items.value = await res.json()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erro ao carregar itens.'
      if (import.meta.env.DEV) console.error(`[useEntityCrud][${resource}]`, e)
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

    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
      throw new Error(msg ?? 'Erro ao criar item.')
    }

    const created: SupportEntity = await res.json()
    items.value = [...items.value, created].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    return created
  }

  const remove = async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/${resource}/${id}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    })

    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
      throw new Error(msg ?? 'Erro ao remover item.')
    }

    items.value = items.value.filter((e) => e._id !== id)
  }

  return { items, loading, error, fetchAll, create, remove }
}
