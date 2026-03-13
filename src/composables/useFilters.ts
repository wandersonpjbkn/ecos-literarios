import { ref, computed } from 'vue'

import { useBooksStore } from '@/stores'

export function useFilters() {
  const search = ref('')
  const selectedMidia = ref<string[]>([])
  const selectedCategoria = ref<string[]>([])
  const selectedSubgeneros = ref<string[]>([])
  const selectedQuem = ref<string[]>([])

  // ── Opções derivadas dos dados ────────────────
  const optionsMidia = computed(() => {
    return [
      ...new Set(
        useBooksStore()
          .books.map((b) => b.midia)
          .filter(Boolean),
      ),
    ].sort()
  })
  const optionsCategoria = computed(() => {
    return [
      ...new Set(
        useBooksStore()
          .books.map((b) => b.categoria)
          .filter(Boolean),
      ),
    ].sort()
  })
  const optionsSubgeneros = computed(() => {
    const all = useBooksStore().books.flatMap((b) => b.subgenerosArr || [])
    return [...new Set(all)].sort()
  })
  const optionsQuem = computed(() => {
    return [
      ...new Set(
        useBooksStore()
          .books.map((b) => b.quem)
          .filter(Boolean),
      ),
    ].sort()
  })

  // ── Filtro aplicado ───────────────────────────
  const filtered = computed(() => {
    let list = useBooksStore().books

    if (search.value.trim()) {
      const q = search.value.toLowerCase()
      list = list.filter((b) => b.titulo?.toLowerCase().includes(q) || b.autor?.toLowerCase().includes(q))
    }

    if (selectedMidia.value.length) list = list.filter((b) => selectedMidia.value.includes(b.midia))

    if (selectedCategoria.value.length) list = list.filter((b) => selectedCategoria.value.includes(b.categoria))

    if (selectedSubgeneros.value.length)
      list = list.filter((b) => selectedSubgeneros.value.every((sg) => b.subgenerosArr?.includes(sg)))
    if (selectedQuem.value.length) list = list.filter((b) => selectedQuem.value.includes(b.quem))

    return list
  })

  const activeFilterCount = computed(
    () =>
      (search.value.trim() ? 1 : 0) +
      selectedMidia.value.length +
      selectedCategoria.value.length +
      selectedSubgeneros.value.length +
      selectedQuem.value.length,
  )

  function clearAll() {
    search.value = ''
    selectedMidia.value = []
    selectedCategoria.value = []
    selectedSubgeneros.value = []
    selectedQuem.value = []
  }

  // Autocomplete para busca
  const searchSuggestions = computed(() => {
    if (!search.value.trim() || search.value.length < 2) return []

    const q = search.value.toLowerCase()

    return useBooksStore()
      .books.filter((b) => b.titulo?.toLowerCase().includes(q))
      .map((b) => ({ id: b.id, titulo: b.titulo, autor: b.autor }))
      .slice(0, 8)
  })

  return {
    search,
    selectedMidia,
    selectedCategoria,
    selectedSubgeneros,
    selectedQuem,
    optionsMidia,
    optionsCategoria,
    optionsSubgeneros,
    optionsQuem,
    filtered,
    activeFilterCount,
    clearAll,
    searchSuggestions,
  }
}
