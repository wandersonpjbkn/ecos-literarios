// The magic link always lands on /auth/callback; this carries where the reader was, in the same browser.
const KEY = 'auth-return-to'

// Only paths inside the app: "//host", "/\\host" or a full URL would turn the login into an open redirect.
const isInternal = (path: unknown): path is string =>
  typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\')

export const rememberReturn = (path: unknown) => {
  try {
    if (isInternal(path)) localStorage.setItem(KEY, path)
    else localStorage.removeItem(KEY)
  } catch {
    // Storage blocked: the reader lands on the catalog, as before.
  }
}

export const takeReturn = (): string => {
  try {
    const path = localStorage.getItem(KEY)
    localStorage.removeItem(KEY)
    return isInternal(path) ? path : '/'
  } catch {
    return '/'
  }
}
