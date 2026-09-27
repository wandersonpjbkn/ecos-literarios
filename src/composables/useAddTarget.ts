import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

import { useAuthStore, usePermissionsStore } from '@/stores'

/** Where "Adicionar" leads: who may create books goes to the panel's list; a Membro learns why not (dono). */
export function useAddTarget() {
  const auth = useAuthStore()
  const permissions = usePermissionsStore()
  return computed<RouteLocationRaw>(() => {
    if (!auth.isLoggedIn) return { name: 'auth-login' }
    // Until users/me answers, the level stands in for the matrix, so an Editor is not turned away on a slow start.
    const mayCreate = permissions.mine ? permissions.can('books', 'create') : auth.isEditor
    return mayCreate ? { name: 'admin-books' } : { name: 'admin-forbidden', query: { motivo: 'adicionar' } }
  })
}
