import { ref } from 'vue'
import { defineStore } from 'pinia'

const PAGE_SIZE = 24

export const useBooksGridStore = defineStore('books-grid', () => {
  const visibleCount = ref(PAGE_SIZE)
  const isLoading = ref(false)

  const increment = () => {
    visibleCount.value += PAGE_SIZE
  }
  const reset = () => {
    visibleCount.value = PAGE_SIZE
  }

  return {
    visibleCount,
    isLoading,
    pageSize: PAGE_SIZE,
    increment,
    reset,
  }
})
