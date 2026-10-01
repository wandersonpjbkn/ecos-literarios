import type { EmailOtpType } from '@supabase/supabase-js'

import type { UserRole } from '@/types'

import { useAuthStore } from '@/stores'

import { useErrorReporter } from '@/composables'
import { type SessionEndReason, takeEndReason } from '@/composables/sessionEnd'
import { supabase } from '@/composables/supabase'
import { verifyAuth } from '@/composables/useApi'

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
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (data.session) return data.session.access_token
    if (error?.code === 'user_banned') throw error
  }

  // 2. Token hash: verify the OTP token hash explicitly.
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') as EmailOtpType | null
  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (data.session) return data.session.access_token
    if (error?.code === 'user_banned') throw error
  }

  // 3. Implicit / pre-existing: client already parsed the hash, or a
  //    persisted session is still active (e.g. user reloaded the page).
  const { data } = await supabase.auth.getSession()
  if (data.session) return data.session.access_token

  throw new Error('Link de acesso inválido ou expirado.')
}

// On /auth/callback both App (restoreSession) and the callback sync the same fresh session: one request serves both.
let inFlightSync: { token: string; promise: Promise<void> } | null = null
// "Sair" also fires SIGNED_OUT; this keeps it from reading as a session that ended on its own.
let leaving = false

export class CallbackError extends Error {
  constructor(
    readonly reason: 'link' | 'platform' | 'suspended',
    readonly cause: unknown,
  ) {
    super(reason)
  }
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

    // Supabase's text is English and technical; the screen only needs to know the link was asked for too soon (429).
    if (error) throw Object.assign(new Error(error.message), { tooSoon: error.status === 429 })
  }

  // "platform" = valid session but the API did not answer (network or 5xx): a new link would not help.
  const handleCallback = async (): Promise<void> => {
    let accessToken: string
    try {
      accessToken = await resolveSessionFromUrl()
    } catch (err) {
      // Supabase sends the link to a suspended account too; it refuses it here, when the link is used.
      throw new CallbackError((err as { code?: string }).code === 'user_banned' ? 'suspended' : 'link', err)
    }
    try {
      await syncWithApi(accessToken)
    } catch (err) {
      const status = (err as { status?: number }).status
      throw new CallbackError(err instanceof TypeError || (status ?? 0) >= 500 ? 'platform' : 'link', err)
    }
  }

  const syncWithApi = (accessToken: string): Promise<void> => {
    if (inFlightSync?.token === accessToken) return inFlightSync.promise
    const promise = verifyAndStore(accessToken).finally(() => {
      if (inFlightSync?.promise === promise) inFlightSync = null
    })
    inFlightSync = { token: accessToken, promise }
    return promise
  }

  const verifyAndStore = async (accessToken: string): Promise<void> => {
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
    leaving = true
    try {
      await supabase.auth.signOut()
    } finally {
      leaving = false
    }
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
          context: 'useAuth.restoreSession',
        })
        store.clearSession()
      }
    }
  }

  /** onEnded: the session ended without "Sair" (renewal refused, account suspended, another tab left). */
  const watchSession = (onEnded: (reason: SessionEndReason) => void): (() => void) => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED' && session) {
        store.token = session.access_token
        if (import.meta.env.DEV) console.log('[useAuth] Token renovado automaticamente')
      }

      if (event === 'SIGNED_OUT') {
        const wasSignedIn = store.isLoggedIn
        const reason = takeEndReason()
        store.clearSession()
        useErrorReporter().setUser(null)
        if (wasSignedIn && !leaving) onEnded(reason)
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
