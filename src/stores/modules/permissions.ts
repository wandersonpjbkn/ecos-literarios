import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { Action, Resource } from '@/types'

import { useAuthStore } from '@/stores/modules/auth'

export const usePermissionsStore = defineStore('permissions', () => {
  const mine = ref<Partial<Record<Resource, Action[]>> | null>(null)
  const failed = ref(false)
  const claimMatch = ref<string | null>(null)

  const can = (resource: Resource, action: Action) => mine.value?.[resource]?.includes(action) ?? false

  const canEditBook = (ownerUserId?: string) =>
    can('books', 'update') || (!!ownerUserId && ownerUserId === useAuthStore().user?._id)

  const set = (permissions: Partial<Record<Resource, Action[]>>, match: string | null = null) => {
    mine.value = permissions
    claimMatch.value = match
    failed.value = false
  }

  const clear = () => {
    mine.value = null
    claimMatch.value = null
    failed.value = false
  }

  const markFailed = () => {
    failed.value = true
  }

  return { mine, failed, claimMatch, can, canEditBook, set, clear, markFailed }
})
