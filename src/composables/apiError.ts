export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly endpoint: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const endpointOf = (url: string, method: string) => {
  let path = url
  try {
    path = new URL(url).pathname
  } catch {}
  return `${method} ${path.replace(/[a-f\d]{24}/gi, ':id')}`
}

export const toApiError = async (res: Response, fallback: string, method = 'GET'): Promise<ApiError> => {
  const body = (await res.json().catch(() => ({}))) as { error?: string }
  return new ApiError(body.error ?? fallback, res.status, endpointOf(res.url, method))
}

export const errorText = (e: unknown, fallback: string): string => (e instanceof ApiError ? e.message : fallback)
