import { createClient, type EmailOtpType } from '@supabase/supabase-js'

import { useAuthStore } from '@/stores'
import { useErrorReporter } from '@/composables'
import { verifyAuth } from '@/composables/useApi'
import type { UserRole } from '@/types'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
)

// ── Session resolution from URL ───────────────────────────────────

/**
 * Resolves a Supabase session from URL parameters set by an email
 * confirmation or magic link. Handles the three formats produced by
 * Supabase Auth, in priority order:
 *   1. PKCE flow        — `?code=...`
 *   2. Token hash flow  — `?token_hash=...&type=...`
 *   3. Implicit flow    — `#access_token=...` (auto-parsed at client init)
 *
 * Returns the access token of the established session, or throws if no
 * valid credentials are present.
 */
const resolveSessionFromUrl = async (): Promise<string> => {
  const url = new URL(window.location.href)

  // 1. PKCE: exchange the auth code for a session.
  const code = url.searchParams.get('code')
  if (code) {
    const { data } = await supabase.auth.exchangeCodeForSession(code)
    if (data.session) return data.session.access_token
  }

  // 2. Token hash: verify the OTP token hash explicitly.
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') as EmailOtpType | null
  if (tokenHash && type) {
    const { data } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (data.session) return data.session.access_token
  }

  // 3. Implicit / pre-existing: client already parsed the hash, or a
  //    persisted session is still active (e.g. user reloaded the page).
  const { data } = await supabase.auth.getSession()
  if (data.session) return data.session.access_token

  throw new Error('Link de acesso inválido ou expirado.')
}

// ── Composable ────────────────────────────────────────────────────

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
    const accessToken = await resolveSessionFromUrl()
    await syncWithApi(accessToken)
  }

  const syncWithApi = async (accessToken: string): Promise<void> => {
    const { user: apiUser } = await verifyAuth(accessToken)

    store.setSession(
      {
        _id: apiUser._id,
        email: apiUser.email,
        name: apiUser.name,
        role: apiUser.role as UserRole,
      },
      accessToken,
    )

    useErrorReporter().setUser(store.user)
  }

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut()
    store.clearSession()
    useErrorReporter().setUser(null)
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
      } catch (error) {
        useErrorReporter().captureException(error, {
          context: 'restoreSession.syncWithApi',
        })
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
        useErrorReporter().setUser(null)
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
