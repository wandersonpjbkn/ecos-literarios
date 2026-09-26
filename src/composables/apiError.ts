/** Failed API call: the message is for the screen; status and endpoint go to the error reporter as tags. */
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

// "PATCH /users/:id/role": ids folded so every call to the same route groups together.
const endpointOf = (url: string, method: string) => {
  let path = url
  try {
    path = new URL(url).pathname
  } catch {
    // Relative or empty URL: kept as it came.
  }
  return `${method} ${path.replace(/[a-f\d]{24}/gi, ':id')}`
}

/** The API's own message when it sends one, otherwise the screen's fallback; never a bare "HTTP 500". */
export const toApiError = async (res: Response, fallback: string, method = 'GET'): Promise<ApiError> => {
  const body = (await res.json().catch(() => ({}))) as { error?: string }
  return new ApiError(body.error ?? fallback, res.status, endpointOf(res.url, method))
}
