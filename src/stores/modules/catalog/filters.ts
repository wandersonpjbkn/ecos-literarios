import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { BookSortOrder } from '@/types'

export const useFiltersStore = defineStore('filters', () => {
  const search = ref('')
  const selectedMidia = ref<string[]>([])
  const selectedCategoria = ref<string[]>([])
  const selectedSubgeneros = ref<string[]>([])
  const selectedQuem = ref<string[]>([])
  const sortOrder = ref<BookSortOrder>('new')

  const clearAll = () => {
    search.value = ''
    selectedMidia.value = []
    selectedCategoria.value = []
    selectedSubgeneros.value = []
    selectedQuem.value = []
  }

  return {
    search,
    selectedMidia,
    selectedCategoria,
    selectedSubgeneros,
    selectedQuem,
    sortOrder,
    clearAll,
  }
})
