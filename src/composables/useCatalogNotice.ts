import { useOnline } from '@vueuse/core'
import { computed } from 'vue'

import { useBooksStore } from '@/stores'

export function useCatalogNotice() {
  const booksStore = useBooksStore()
  const online = useOnline()

  const savedWhen = computed(() => {
    const saved = booksStore.savedAt
    if (!saved) return 'a última lista salva neste aparelho'
    const days = Math.floor((Date.now() - saved) / 86_400_000)
    if (days === 0) return 'a lista de hoje'
    if (days === 1) return 'a lista de ontem'
    return `a lista de ${new Date(saved).toLocaleDateString('pt-BR', { day: 'numeric', month: 'numeric' })}`
  })

  return computed(() => {
    if (!online.value) return 'Você está sem internet. Os livros continuam visíveis, mas não é possível adicionar.'
    if (booksStore.error)
      return `A plataforma está fora do ar agora. Você está vendo ${savedWhen.value}: os livros continuam visíveis, mas não é possível adicionar.`
    return ''
  })
}
