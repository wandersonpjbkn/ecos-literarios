import { createClient } from '@supabase/supabase-js'

import { useAuthStore } from '@/stores'
import { verifyAuth } from '@/composables/useApi'

// ── Cliente Supabase (singleton) ──────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
)

export function useAuth() {
  const store = useAuthStore()

  /**
   * Envia o magic link para o email informado.
   */
  const sendMagicLink = async (email: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${import.meta.env.VITE_SITE_URL ?? window.location.origin}/auth/callback`,
      },
    })

    if (error) throw new Error(error.message)
  }

  /**
   * Chamado na AuthCallbackView após o Supabase redirecionar.
   *
   * Estratégia em duas etapas:
   * 1. Tenta getSession() imediatamente — funciona se o Supabase já processou o hash
   * 2. Se não houver sessão, aguarda o evento SIGNED_IN via onAuthStateChange
   */
  const handleCallback = async (): Promise<void> => {
    // Etapa 1 — sessão já disponível (caso mais comum)
    const { data, error } = await supabase.auth.getSession()

    if (!error && data.session) {
      await syncWithApi(data.session.access_token)
      return
    }

    // Etapa 2 — aguarda o evento SIGNED_IN (Supabase ainda processando o hash)
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

  /**
   * Sincroniza a sessão do Supabase com a ecos-api e persiste no store.
   */
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

  /**
   * Logout — limpa Supabase + store local.
   */
  const logout = async (): Promise<void> => {
    await supabase.auth.signOut()
    store.clearSession()
  }

  /**
   * Verifica se a sessão persistida ainda é válida.
   * Chamado no App.vue onMounted para restaurar estado após reload.
   */
  const restoreSession = async (): Promise<void> => {
    const { data } = await supabase.auth.getSession()
    const session = data.session

    if (!session) {
      store.clearSession()
      return
    }

    // Token renovado pelo Supabase — atualiza no store
    if (store.user && session.access_token !== store.token) {
      store.token = session.access_token
    }

    // Sessão válida mas store vazio (ex: outro tab fez login)
    if (!store.user && session.access_token) {
      try {
        await syncWithApi(session.access_token)
      } catch {
        store.clearSession()
      }
    }
  }

  return {
    store,
    sendMagicLink,
    handleCallback,
    logout,
    restoreSession,
  }
}

export { supabase }
