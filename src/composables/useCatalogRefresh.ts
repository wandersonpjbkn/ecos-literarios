import { ref } from 'vue'
import { useRoute } from 'vue-router'

import { useBooksStore } from '@/stores'

import { useApi } from '@/composables/useApi'
import { useToast } from '@/composables/useToast'
import { useUtils } from '@/composables/useUtils'

export function useCatalogRefresh() {
  const route = useRoute()

  const refreshing = ref(false)
  const failed = ref(false)

  const refresh = async () => {
    if (refreshing.value) return
    if (!navigator.onLine) {
      useToast().show('Você está sem internet. Tente de novo quando a conexão voltar.')
      return
    }

    refreshing.value = true
    failed.value = false
    useUtils().sendGtmEvent({ event: 'force_refresh', force_refresh_origin: route.fullPath })
    try {
      await useApi().fetchBooks()
      failed.value = !!useBooksStore().error
      if (!failed.value) useToast().show('Catálogo atualizado.')
    } finally {
      refreshing.value = false
    }
  }

  return { refreshing, failed, refresh }
}
