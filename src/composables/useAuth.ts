import { createClient } from '@supabase/supabase-js'

import { useAuthStore } from '@/stores'
import { verifyAuth } from '@/composables/useApi'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
)

export function useAuth() {
  const store = useAuthStore()

  const sendMagicLink = async (email: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${import.meta.env.VITE_SITE_URL ?? window.location.origin}/auth/callback`,
      },
    })

    if (error) throw new Error(error.message)
  }

  const handleCallback = async (): Promise<void> => {
    const { data, error } = await supabase.auth.getSession()

    if (!error && data.session) {
      await syncWithApi(data.session.access_token)
      return
    }

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        unsubscribe()
        reject(new Error('Tempo esgotado. O link pode ter expirado.'))
      }, 10_000)

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event !== 'SIGNED_IN' || !session) return

        clearTimeout(timeout)
        unsubscribe()

        try {
          await syncWithApi(session.access_token)
          resolve()
        } catch (err) {
          reject(err)
        }
      })

      const unsubscribe = () => subscription.unsubscribe()
    })
  }

  const syncWithApi = async (accessToken: string): Promise<void> => {
    const { user: apiUser } = await verifyAuth(accessToken)

    store.setSession(
      {
        _id: apiUser._id,
        email: apiUser.email,
        name: apiUser.name,
        role: apiUser.role as import('@/types').UserRole,
      },
      accessToken,
    )
  }

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut()
    store.clearSession()
  }

  const restoreSession = async (): Promise<void> => {
    const { data } = await supabase.auth.getSession()
    const session = data.session

    if (!session) {
      store.clearSession()
      return
    }

    if (store.user && session.access_token !== store.token) {
      store.token = session.access_token
    }

    if (!store.user && session.access_token) {
      try {
        await syncWithApi(session.access_token)
      } catch {
        store.clearSession()
      }
    }
  }

  const watchSession = (): (() => void) => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED' && session) {
        store.token = session.access_token
        if (import.meta.env.DEV) console.log('[useAuth] Token renovado automaticamente')
      }

      if (event === 'SIGNED_OUT') {
        store.clearSession()
      }
    })

    return () => subscription.unsubscribe()
  }

  return {
    store,
    sendMagicLink,
    handleCallback,
    logout,
    restoreSession,
    watchSession,
  }
}

export { supabase }
