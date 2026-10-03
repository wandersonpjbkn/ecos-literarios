import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useRoute } from 'vue-router'

import { useAuthStore, usePermissionsStore } from '@/stores'

export function useAddTarget() {
  const route = useRoute()
  const auth = useAuthStore()
  const permissions = usePermissionsStore()
  return computed<RouteLocationRaw | null>(() => {
    const here = { path: route.path, query: { ...route.query, adicionar: '1' } }
    if (!auth.isLoggedIn) {
      const back = new URLSearchParams({ ...(route.query as Record<string, string>), adicionar: '1' })
      return { name: 'auth-login', query: { voltar: `${route.path}?${back}` } }
    }
    const mayCreate = permissions.mine ? permissions.can('books', 'create') : auth.isEditor
    return mayCreate ? here : null
  })
}
