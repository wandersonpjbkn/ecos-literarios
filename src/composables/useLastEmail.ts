// localStorage, not sessionStorage: the link opens in a new tab. Kept for 1 h, the link's lifetime.
const KEY = 'magic-link-email'
const TTL_MS = 60 * 60 * 1000

export const rememberEmail = (email: string) => {
  try {
    localStorage.setItem(KEY, JSON.stringify({ email, at: Date.now() }))
  } catch {
    // Storage blocked: the expired-link screen falls back to "Pedir outro link".
  }
}

export const forgetEmail = () => {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Nothing to forget.
  }
}

export const recallEmail = (): string | null => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null') as { email?: string; at?: number } | null
    if (saved?.email && saved.at && Date.now() - saved.at < TTL_MS) return saved.email
  } catch {
    // Unreadable value: treated as absent.
  }
  forgetEmail()
  return null
}
