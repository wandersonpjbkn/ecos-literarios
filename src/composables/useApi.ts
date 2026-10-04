import { isAuthRetryableFetchError } from '@supabase/supabase-js'

import { API_BASE } from '@/data/config'
import { personName } from '@/data/person'
import type {
  AccountStatus,
  Action,
  AdminClaimHistoryEntry,
  ApiUser,
  AuthUser,
  BookCandidate,
  BookSearchQuery,
  BookSearchSource,
  BookForEdit,
  BookPayload,
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

import { useBooksStore } from '@/stores'

import { useErrorReporter } from '@/composables'
import { toApiError } from '@/composables/apiError'
import { endSession } from '@/composables/sessionEnd'
import { supabase } from '@/composables/supabase'

// ── Helpers ──
const extractName = (field: ApiPopulated | string | undefined): string => {
  if (!field) return ''
  return typeof field === 'string' ? field : field.nome
}

// ── ApiBook → Book ──
const normalizeBook = (raw: ApiBook): Book => ({
  id: raw._id,
  titulo: raw.titulo,
  authors: raw.authors.map(extractName).filter(Boolean),
  midia: extractName(raw.midia),
  categoria: extractName(raw.categoria) as Book['categoria'],
  person: personName(raw),
  quem_nome: raw.quem_nome ?? undefined,
  quem_user_id: raw.quem_user_id?._id,
  porque: raw.porque ?? '',
  cover_url: raw.cover_url,
  synopsis: raw.synopsis,
  published_year: raw.published_year,
  page_count: raw.page_count,
  added_at: raw.added_at,
  isbn: raw.isbn,
  publisher: raw.publisher,
  subgenreNames: raw.subgeneros.map((s) => (typeof s === 'string' ? s : s.nome.toLowerCase())),
})

// ── Auth helper ──
const currentToken = async (): Promise<string | null> =>
  (await supabase.auth.getSession()).data.session?.access_token ?? null

const headersWith = (token: string | null): HeadersInit => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

const renewedToken = async (refused: string): Promise<string | null> => {
  const current = await currentToken()
  if (current && current !== refused) return current
  const { data, error } = await supabase.auth.refreshSession()
  if (isAuthRetryableFetchError(error)) return null
  return data.session?.access_token ?? null
}

const isSuspended = async (res: Response): Promise<boolean> =>
  res.status === 403 &&
  (
    (await res
      .clone()
      .json()
      .catch(() => ({}))) as { code?: string }
  ).code === 'account_suspended'

const apiFetch = async (path: string, init: RequestInit = {}): Promise<Response> => {
  const send = (token: string | null) => fetch(`${API_BASE}${path}`, { ...init, headers: headersWith(token) })
  const token = await currentToken()
  let res = await send(token)

  if (res.status === 401 && token) {
    const renewed = await renewedToken(token)
    if (!renewed) return res
    res = await send(renewed)
    if (res.status === 401) await endSession('expired')
  }
  if (await isSuspended(res)) await endSession('suspended')
  return res
}

// ── Composable ──
let inFlight: Promise<void> | null = null

const loadBooks = async () => {
  const store = useBooksStore()
  if (!API_BASE) {
    store.error = 'VITE_API_URL não configurada.'
    return
  }

  store.loading = true
  store.error = null
  try {
    const res = await apiFetch('/books', { cache: 'no-cache' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const raw: ApiBook[] = await res.json()
    store.books = raw.map(normalizeBook)
    store.savedAt = Date.now()
  } catch (e: unknown) {
    if (!navigator.onLine && store.books.length > 0) return
    const raw = e instanceof Error ? e.message : String(e)
    store.error = raw || 'Não foi possível carregar os livros.'
    if (import.meta.env.DEV) console.error('[useApi]', e)
    useErrorReporter().captureException(e, { context: 'useApi.fetchBooks' })
  } finally {
    store.loading = false
  }
}

export function useApi() {
  const fetchBooks = (): Promise<void> => {
    inFlight ??= loadBooks().finally(() => {
      inFlight = null
    })
    return inFlight
  }

  return { fetchBooks }
}

// ── Signed-in calls ──
export const verifyAuth = async (token: string) => {
  const res = await fetch(`${API_BASE}/auth/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw await toApiError(res, 'Falha na verificação do token.', 'POST')
  }

  return res.json() as Promise<{
    user: { _id: string; email: string; name: string; role: string }
  }>
}

export const claimRegister = async (name: string): Promise<RegisterResponse> => {
  const res = await apiFetch('/users/me/claim', {
    method: 'POST',
    body: JSON.stringify({ quem_nome: name }),
  })

  if (!res.ok) {
    throw await toApiError(res, 'Não foi possível vincular o nome. Tente de novo.', 'POST')
  }

  return res.json() as Promise<RegisterResponse>
}

export const getMyClaimStatus = async (): Promise<MyClaimStatus> => {
  const res = await apiFetch('/users/me/claim', { method: 'GET' })

  if (!res.ok) {
    throw await toApiError(res, 'Não foi possível carregar seu vínculo. Tente de novo.', 'GET')
  }

  return res.json() as Promise<MyClaimStatus>
}

export const unclaimRegister = async (): Promise<{ message?: string }> => {
  const res = await apiFetch('/users/me/claim', { method: 'DELETE' })

  if (!res.ok) {
    throw await toApiError(res, 'Não foi possível desfazer o vínculo. Tente de novo.', 'DELETE')
  }

  return res.json() as Promise<{ message?: string }>
}

// ── "Quero ler" / "Lido" ──
const authedRequest = async <T>(path: string, init: RequestInit, fallback: string): Promise<T> => {
  const res = await apiFetch(path, init)
  if (!res.ok) throw await toApiError(res, fallback, init.method)
  return (res.status === 204 ? null : res.json()) as Promise<T>
}

export const getMyReading = () =>
  authedRequest<ReadingEntry[]>(
    '/users/me/reading',
    { method: 'GET' },
    'Não foi possível abrir sua lista. Tente de novo.',
  )

export const saveReading = (bookId: string, status: ReadingStatus) =>
  authedRequest<ReadingEntry>(
    `/users/me/reading/${bookId}`,
    { method: 'PUT', body: JSON.stringify({ status }) },
    'Não foi possível salvar na sua lista. Tente de novo.',
  )

export const removeReading = (bookId: string) =>
  authedRequest<null>(
    `/users/me/reading/${bookId}`,
    { method: 'DELETE' },
    'Não foi possível tirar da sua lista. Tente de novo.',
  )

export const getReadingCounts = (bookId: string) =>
  authedRequest<ReadingCounts>(
    `/books/${bookId}/reading`,
    { method: 'GET' },
    'Não foi possível carregar essa contagem.',
  )

// ── Account ──
export const getMe = () =>
  authedRequest<{
    user: AuthUser & { hidden_midias?: string[] }
    permissions: Partial<Record<Resource, Action[]>>
    claim_match?: string | null
  }>('/users/me', { method: 'GET' }, 'Não foi possível carregar sua conta.')

export const saveMyName = (name: string) =>
  authedRequest<{ name: string }>(
    '/users/me',
    { method: 'PATCH', body: JSON.stringify({ name }) },
    'Não foi possível salvar o nome. Tente de novo.',
  )

export const saveMyFormats = (hiddenFormats: string[]) =>
  authedRequest<{ hidden_midias?: string[] }>(
    '/users/me',
    { method: 'PATCH', body: JSON.stringify({ hidden_midias: hiddenFormats }) },
    'Não foi possível salvar seus formatos.',
  )

// ── Panel permissions ──
export const getPermissions = () =>
  authedRequest<{ permissions: Permission[]; configurable: Partial<Record<Resource, Action[]>> }>(
    '/permissions',
    { method: 'GET' },
    'Não foi possível carregar as permissões. Tente de novo.',
  )

export const savePermission = (role: Role, resource: Resource, actions: Action[]) =>
  authedRequest<Permission>(
    `/permissions/${role}/${resource}`,
    { method: 'PUT', body: JSON.stringify({ actions }) },
    'Não foi possível salvar as permissões. Tente de novo.',
  )

// ── Panel books and members ──
export const getPeople = () =>
  authedRequest<{ user_id: string | null; name: string }[]>(
    '/books/people',
    { method: 'GET' },
    'Não foi possível carregar a lista de pessoas. Tente de novo.',
  )

export const getBookForEdit = (id: string) =>
  authedRequest<BookForEdit>(
    `/books/${id}`,
    { method: 'GET' },
    'Não foi possível abrir este livro para editar. Tente de novo.',
  )

export const saveBook = (payload: Record<string, unknown>, target: { id?: string; asOwner?: boolean }) =>
  authedRequest<BookPayload>(
    target.asOwner ? `/users/me/books/${target.id}` : target.id ? `/books/${target.id}` : '/books',
    { method: target.id ? 'PATCH' : 'POST', body: JSON.stringify(payload) },
    'Não foi possível salvar. Tente de novo.',
  )

export const removeBook = (id: string) =>
  authedRequest<null>(`/books/${id}`, { method: 'DELETE' }, 'Não foi possível remover o livro. Tente de novo.')

export const getMembers = () =>
  authedRequest<ApiUser[]>('/users', { method: 'GET' }, 'Não foi possível carregar os membros. Tente de novo.')

export const setMemberRole = (id: string, role: Role) =>
  authedRequest<ApiUser>(
    `/users/${id}/role`,
    { method: 'PATCH', body: JSON.stringify({ role }) },
    'Não foi possível mudar o nível. Tente de novo.',
  )

export const setMemberStatus = (id: string, status: AccountStatus) =>
  authedRequest<ApiUser>(
    `/users/${id}/status`,
    { method: 'PATCH', body: JSON.stringify({ status }) },
    'Não foi possível mudar o acesso. Tente de novo.',
  )

export const removeMember = (id: string) =>
  authedRequest<{ removed: string; books: number }>(
    `/users/${id}`,
    { method: 'DELETE' },
    'Não foi possível remover. Tente de novo.',
  )

export const getSubgenreUsage = (id: string) =>
  authedRequest<{ books: number }>(
    `/subgeneros/${id}/usage`,
    { method: 'GET' },
    'Não foi possível contar os livros. Tente de novo.',
  )

export const getClaimHistory = (limit: number) =>
  authedRequest<{ total: number; history: AdminClaimHistoryEntry[] }>(
    `/admin/users/claims/history?limit=${limit}`,
    { method: 'GET' },
    'Não foi possível carregar o histórico. Tente de novo.',
  )

export const searchBookCandidates = (query: BookSearchQuery) =>
  authedRequest<{ source: BookSearchSource | null; candidates: BookCandidate[] }>(
    '/books/enrich/search',
    { method: 'POST', body: JSON.stringify(query) },
    'Não foi possível buscar agora. Tente de novo.',
  )

// ── Panel lists ──
export const listEntities = (resource: string) =>
  authedRequest<SupportEntity[]>(`/${resource}`, { method: 'GET' }, 'Não foi possível carregar a lista. Tente de novo.')

export const createEntity = (resource: string, name: string) =>
  authedRequest<SupportEntity>(
    `/${resource}`,
    { method: 'POST', body: JSON.stringify({ nome: name }) },
    'Não foi possível criar. Tente de novo.',
  )

export const updateEntity = (resource: string, id: string, name: string) =>
  authedRequest<SupportEntity>(
    `/${resource}/${id}`,
    { method: 'PATCH', body: JSON.stringify({ nome: name }) },
    'Não foi possível salvar. Tente de novo.',
  )

export const removeEntity = (resource: string, id: string) =>
  authedRequest<null>(`/${resource}/${id}`, { method: 'DELETE' }, 'Não foi possível remover. Tente de novo.')
