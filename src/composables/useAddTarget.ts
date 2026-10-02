import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useRoute } from 'vue-router'

import { useAuthStore, usePermissionsStore } from '@/stores'

/** Where "Adicionar" leads: the screen the person is on, with the form open (App.vue); null for a Visitante (slice 8a). */
export function useAddTarget() {
  const route = useRoute()
  const auth = useAuthStore()
  const permissions = usePermissionsStore()
  return computed<RouteLocationRaw | null>(() => {
    const here = { path: route.path, query: { ...route.query, adicionar: '1' } }
    // Signed out is almost always someone from the club on a new device: the login comes back to this screen.
    if (!auth.isLoggedIn) {
      const back = new URLSearchParams({ ...(route.query as Record<string, string>), adicionar: '1' })
      return { name: 'auth-login', query: { voltar: `${route.path}?${back}` } }
    }
    // Until users/me answers, the level stands in for the matrix, so an Editor is not turned away on a slow start.
    const mayCreate = permissions.mine ? permissions.can('books', 'create') : auth.isEditor
    return mayCreate ? here : null
  })
}
