import { ref } from 'vue'

import type { SupportEntity, EntityCrudOptions } from '@/types'

import { useErrorReporter, useUtils } from '@/composables'
import { errorText } from '@/composables/apiError'
import { createEntity, listEntities, removeEntity, updateEntity } from '@/composables/useApi'

export function useEntityCrud({ resource }: EntityCrudOptions) {
  const items = ref<SupportEntity[]>([])
  const loading = ref(false)
  const error = ref('')

  const { slugify } = useUtils()

  const fetchAll = async () => {
    loading.value = true
    error.value = ''
    try {
      items.value = await listEntities(resource)
    } catch (e) {
      error.value = errorText(e, 'Não foi possível carregar a lista. Tente de novo.')
      if (import.meta.env.DEV) console.error(`[useEntityCrud][${resource}]`, e)
      useErrorReporter().captureException(e, { context: 'useEntityCrud.fetchAll' })
    } finally {
      loading.value = false
    }
  }

  const create = async (name: string): Promise<SupportEntity> => {
    const created = await createEntity(resource, name)
    items.value = [...items.value, created].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    return created
  }

  const findOrCreate = async (name: string): Promise<SupportEntity> => {
    await fetchAll()
    return items.value.find((item) => slugify(item.nome) === slugify(name)) ?? create(name)
  }

  const update = async (id: string, name: string): Promise<SupportEntity> => {
    const updated = await updateEntity(resource, id, name)
    items.value = items.value
      .map((e) => (e._id === id ? updated : e))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    return updated
  }

  const remove = async (id: string): Promise<void> => {
    await removeEntity(resource, id)
    items.value = items.value.filter((e) => e._id !== id)
  }

  return { items, loading, error, fetchAll, create, findOrCreate, update, remove }
}
