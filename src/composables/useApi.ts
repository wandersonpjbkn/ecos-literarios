import { useErrorReporter } from '@/composables'
import { useBooksStore, useCacheStore } from '@/stores'
import type {
  Action,
  AdminBook,
  AdminClaimHistoryEntry,
  ApiUser,
  BookForEdit,
  BookPayload,
  EnrichmentApiResponse,
  EnrichmentField,
  SupportEntity,
  Book,
  ApiBook,
  ApiPopulated,
  MyClaimStatus,
  Permission,
  ReadingCounts,
  ReadingEntry,
  ReadingStatus,
  RegisterResponse,
  Resource,
  Role,
} from '@/types'
import { API_BASE } from '@/data/config'
import { toApiError } from '@/composables/apiError'

// ── Helpers ──
const extractNome = (field: ApiPopulated | string | undefined): string => {
  if (!field) return ''
  return typeof field === 'string' ? field : field.nome
}

// ── Normalização ApiBook → Book ──
const normalizeBook = (raw: ApiBook): Book => ({
  id: raw._id,
  titulo: raw.titulo,
  autor: extractNome(raw.autor),
  midia: extractNome(raw.midia),
  categoria: extractNome(raw.categoria) as Book['categoria'],
  quem: raw.quem_nome,
  quem_user_id: raw.quem_user_id?._id,
  porque: raw.porque ?? '',
  cover_url: raw.cover_url,
  synopsis: raw.synopsis,
  published_year: raw.published_year,
  page_count: raw.page_count,
  added_at: raw.added_at,
  isbn: raw.isbn,
  google_books_id: raw.google_books_id,
  subgenerosArr: raw.subgeneros.map((s) => (typeof s === 'string' ? s : s.nome.toLowerCase())),
})

// ── Auth helper ──
const getSupabaseToken = (): string | null => {
  try {
    const key = Object.keys(localStorage).find((k) => k.startsWith('sb-') && k.endsWith('-auth-token'))
    if (!key) return null
    const session = JSON.parse(localStorage.getItem(key) ?? '{}')
    return (session?.access_token as string) ?? null
  } catch {
    return null
  }
}

export const buildHeaders = (): HeadersInit => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  const token = getSupabaseToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

// ── Composable ──
export function useApi() {
  const fetchBooks = async (forceRefresh = false) => {
    if (!forceRefresh && useCacheStore().isCacheValid) {
      useBooksStore().books = useCacheStore().cache!
      useBooksStore().loading = false
      useBooksStore().error = null
      if (import.meta.env.DEV) console.log('📦 Usando dados do cache')
      return
    }

    if (!API_BASE) {
      useBooksStore().error = 'VITE_API_URL não configurada.'
      useBooksStore().loading = false
      useBooksStore().error = null
      return
    }

    useBooksStore().loading = true
    useBooksStore().error = null

    try {
      if (import.meta.env.DEV) console.log('[useApi] Fetching books...')

      const res = await fetch(`${API_BASE}/books`, { headers: buildHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const raw: ApiBook[] = await res.json()
      const books = raw.map(normalizeBook)

      useBooksStore().books = books
      useCacheStore().cache = books
      useCacheStore().ts = Date.now()

      if (import.meta.env.DEV) console.log('[useApi] Books loaded:', books.length)
    } catch (e: unknown) {
      if (!navigator.onLine && useBooksStore().books.length > 0) {
        if (import.meta.env.DEV) console.warn('[useApi] Offline, usando dados persistidos do Pinia')
        useBooksStore().error = null
      } else {
        const raw = e instanceof Error ? e.message : String(e)
        useBooksStore().error = raw || 'Não deu pra carregar os livros.'
        if (import.meta.env.DEV) console.error('[useApi]', e)

        useErrorReporter().captureException(e, { context: 'useApi.fetchBooks' })
      }
    } finally {
      useBooksStore().loading = false
    }
  }

  return { fetchBooks }
}

// ── Ações autenticadas ──
export const verifyAuth = async (token: string) => {
  const res = await fetch(`${API_BASE}/auth/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    // Surface the backend error so callers (and DevTools) get the real cause.
    // Its status lets the callback tell a rejected link (4xx) from a platform that is down (5xx).
    throw await toApiError(res, 'Falha na verificação do token.', 'POST')
  }

  return res.json() as Promise<{
    user: { _id: string; email: string; name: string; role: string }
  }>
}

export const claimRegister = async (quemNome: string): Promise<RegisterResponse> => {
  const res = await fetch(`${API_BASE}/users/me/claim`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ quem_nome: quemNome }),
  })

  if (!res.ok) {
    throw await toApiError(res, 'Não deu pra vincular o nome. Tente de novo.', 'POST')
  }

  return res.json() as Promise<RegisterResponse>
}

export const getMyClaimStatus = async (): Promise<MyClaimStatus> => {
  const res = await fetch(`${API_BASE}/users/me/claim`, {
    method: 'GET',
    headers: buildHeaders(),
  })

  if (!res.ok) {
    throw await toApiError(res, 'Não deu pra carregar seu vínculo. Tente de novo.', 'GET')
  }

  return res.json() as Promise<MyClaimStatus>
}

export const unclaimRegister = async (): Promise<{ message?: string }> => {
  const res = await fetch(`${API_BASE}/users/me/claim`, {
    method: 'DELETE',
    headers: buildHeaders(),
  })

  if (!res.ok) {
    throw await toApiError(res, 'Não deu pra desfazer o vínculo. Tente de novo.', 'DELETE')
  }

  return res.json() as Promise<{ message?: string }>
}

// ── "Quero ler" / "Lido" ──
const authedRequest = async <T>(path: string, init: RequestInit, fallback: string): Promise<T> => {
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers: buildHeaders() })
  if (!res.ok) throw await toApiError(res, fallback, init.method)
  return (res.status === 204 ? null : res.json()) as Promise<T>
}

export const getMyReading = () =>
  authedRequest<ReadingEntry[]>('/users/me/reading', { method: 'GET' }, 'Não deu pra abrir sua lista. Tente de novo.')

export const saveReading = (bookId: string, status: ReadingStatus) =>
  authedRequest<ReadingEntry>(
    `/users/me/reading/${bookId}`,
    { method: 'PUT', body: JSON.stringify({ status }) },
    'Não deu pra salvar na sua lista. Tente de novo.',
  )

export const removeReading = (bookId: string) =>
  authedRequest<null>(
    `/users/me/reading/${bookId}`,
    { method: 'DELETE' },
    'Não deu pra tirar da sua lista. Tente de novo.',
  )

export const getReadingCounts = (bookId: string) =>
  authedRequest<ReadingCounts>(`/books/${bookId}/reading`, { method: 'GET' }, 'Não deu pra carregar essa contagem.')

// ── Conta: formatos escondidos e permissões do próprio nível ──
export const getMe = () =>
  authedRequest<{ user: { hidden_midias?: string[] }; permissions: Partial<Record<Resource, Action[]>> }>(
    '/users/me',
    { method: 'GET' },
    'Não deu pra carregar sua conta.',
  )

export const saveMyName = (name: string) =>
  authedRequest<{ name: string }>(
    '/users/me',
    { method: 'PATCH', body: JSON.stringify({ name }) },
    'Não deu pra salvar o nome. Tente de novo.',
  )

export const saveMyFormats = (hiddenMidias: string[]) =>
  authedRequest<{ hidden_midias?: string[] }>(
    '/users/me',
    { method: 'PATCH', body: JSON.stringify({ hidden_midias: hiddenMidias }) },
    'Não deu pra salvar seus formatos.',
  )

// ── Painel: permissões ──
export const getPermissions = () =>
  authedRequest<{ permissions: Permission[]; configurable: Partial<Record<Resource, Action[]>> }>(
    '/permissions',
    { method: 'GET' },
    'Não deu pra carregar as permissões. Tente de novo.',
  )

export const savePermission = (role: Role, resource: Resource, actions: Action[]) =>
  authedRequest<Permission>(
    `/permissions/${role}/${resource}`,
    { method: 'PUT', body: JSON.stringify({ actions }) },
    'Não deu pra salvar as permissões. Tente de novo.',
  )

// ── Painel: livros, membros, histórico, capas ──
export const getPanelBooks = () =>
  authedRequest<AdminBook[]>('/books', { method: 'GET' }, 'Não deu pra carregar os livros. Tente de novo.')

export const getBookForEdit = (id: string) =>
  authedRequest<BookForEdit>(`/books/${id}`, { method: 'GET' }, 'Não deu pra abrir este livro pra editar. Tente de novo.')

// The owner's own route for someone who cannot update every book; the panel route otherwise (the API decides).
export const saveBook = (payload: Record<string, unknown>, target: { id?: string; asOwner?: boolean }) =>
  authedRequest<BookPayload>(
    target.asOwner ? `/users/me/books/${target.id}` : target.id ? `/books/${target.id}` : '/books',
    { method: target.id ? 'PATCH' : 'POST', body: JSON.stringify(payload) },
    'Não deu pra salvar. Tente de novo.',
  )

export const removeBook = (id: string) =>
  authedRequest<null>(`/books/${id}`, { method: 'DELETE' }, 'Não deu pra remover o livro. Tente de novo.')

export const getMembers = () =>
  authedRequest<ApiUser[]>('/users', { method: 'GET' }, 'Não deu pra carregar os membros. Tente de novo.')

export const setMemberRole = (id: string, role: Role) =>
  authedRequest<ApiUser>(
    `/users/${id}/role`,
    { method: 'PATCH', body: JSON.stringify({ role }) },
    'Não deu pra mudar o nível. Tente de novo.',
  )

export const getClaimHistory = (limit: number) =>
  authedRequest<{ total: number; history: AdminClaimHistoryEntry[] }>(
    `/admin/users/claims/history?limit=${limit}`,
    { method: 'GET' },
    'Não deu pra carregar o histórico. Tente de novo.',
  )

export type EnrichmentStatus = {
  total: number
  with_cover: number
  without_cover: number
  coverage_pct: number
  last_enriched_at: string | null
}

export const getEnrichmentStatus = () =>
  authedRequest<EnrichmentStatus>(
    '/admin/books/enrich/status',
    { method: 'GET' },
    'Não deu pra carregar o que já foi feito. Tente de novo.',
  )

export const getEnrichmentHistory = (limit: number) =>
  authedRequest<{ history?: Array<Record<string, unknown>> }>(
    `/admin/books/enrich/history?limit=${limit}`,
    { method: 'GET' },
    'Não deu pra carregar o que já foi feito. Tente de novo.',
  )

export const runEnrichment = (force: boolean) =>
  authedRequest<Record<string, unknown>>(
    '/admin/books/enrich',
    { method: 'POST', body: JSON.stringify({ force }) },
    'Não deu pra buscar os dados. Tente de novo.',
  )

export const previewBookEnrichment = (id: string) =>
  authedRequest<EnrichmentApiResponse>(
    `/books/${id}/enrich`,
    { method: 'POST' },
    'Não deu pra buscar os dados do livro. Tente de novo.',
  )

export const applyBookEnrichment = (id: string, fields: EnrichmentField[]) =>
  authedRequest<{ book: BookPayload }>(
    `/books/${id}/enrich/apply`,
    { method: 'POST', body: JSON.stringify({ fields }) },
    'Não deu pra salvar os dados no livro. Tente de novo.',
  )

// ── Painel: autores, formatos, gêneros, subgêneros ──
export const listEntities = (resource: string) =>
  authedRequest<SupportEntity[]>(`/${resource}`, { method: 'GET' }, 'Não deu pra carregar a lista. Tente de novo.')

export const createEntity = (resource: string, nome: string) =>
  authedRequest<SupportEntity>(
    `/${resource}`,
    { method: 'POST', body: JSON.stringify({ nome }) },
    'Não deu pra criar. Tente de novo.',
  )

export const updateEntity = (resource: string, id: string, nome: string) =>
  authedRequest<SupportEntity>(
    `/${resource}/${id}`,
    { method: 'PATCH', body: JSON.stringify({ nome }) },
    'Não deu pra salvar. Tente de novo.',
  )

export const removeEntity = (resource: string, id: string) =>
  authedRequest<null>(`/${resource}/${id}`, { method: 'DELETE' }, 'Não deu pra remover. Tente de novo.')

