import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import type { AuthUser } from '@/types'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const user = ref<AuthUser | null>(null)
    const token = ref<string | null>(null)

    const isLoggedIn = computed(() => !!user.value && !!token.value)
    const isAdmin = computed(() => user.value?.role === 'admin')
    const isEditor = computed(() => user.value?.role === 'editor' || isAdmin.value)

    const setSession = (authUser: AuthUser, accessToken: string) => {
      user.value = authUser
      token.value = accessToken
    }

    const refreshUser = (current: AuthUser) => {
      if (user.value) user.value = current
    }

    const clearSession = () => {
      user.value = null
      token.value = null
    }

    return {
      user,
      token,
      isLoggedIn,
      isAdmin,
      isEditor,
      setSession,
      refreshUser,
      clearSession,
    }
  },
  {
    persist: {
      storage: localStorage,
    },
  },
)
