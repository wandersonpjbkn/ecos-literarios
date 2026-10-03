const KEY = 'auth-return-to'

const isInternal = (path: unknown): path is string =>
  typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\')

export const rememberReturn = (path: unknown) => {
  try {
    if (isInternal(path)) localStorage.setItem(KEY, path)
    else localStorage.removeItem(KEY)
  } catch {}
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
