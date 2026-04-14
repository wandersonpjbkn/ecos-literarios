import { useBooksStore, useCacheStore } from '@/stores'

import type { Book } from '@/types'

const API_BASE = import.meta.env.VITE_API_URL as string

// ── Tipos da resposta da API ──────────────────────────────────────
interface ApiPopulated {
  _id: string
  nome: string
  slug: string
}

interface ApiBook {
  _id: string
  titulo: string
  autor: ApiPopulated | string
  midia: ApiPopulated | string
  categoria: ApiPopulated | string
  quem_nome: string
  quem_user_id?: { name: string; avatar_url?: string }
  porque: string
  cover_url?: string
  synopsis?: string
  subgeneros: (ApiPopulated | string)[]
}

// Matches GET /users/me/claim response shape exactly
export interface MyClaimStatus {
  claim_name: string | null
  claimed_books: number
  has_claim: boolean
  warning?: string
}

// Matches POST /users/me/claim response shape exactly
export interface RegisterResponse {
  message?: string
  claim_name?: string
  matched_books?: number
  updated_books?: number
  name_synced?: boolean
}

export interface ClaimHistoryEntry {
  id: string
  user_name: string
  quem_nome: string | null
  action: string
  action_label: string
  created_at?: string
}

export interface ClaimHistory {
  total: number
  history: ClaimHistoryEntry[]
}

// ── Helpers ───────────────────────────────────────────────────────

const extractNome = (field: ApiPopulated | string | undefined): string => {
  if (!field) return ''
  return typeof field === 'string' ? field : field.nome
}

// ── Normalização ApiBook → Book ───────────────────────────────────

const normalizeBook = (raw: ApiBook): Book => ({
  id: raw._id,
  titulo: raw.titulo,
  autor: extractNome(raw.autor),
  midia: extractNome(raw.midia),
  categoria: extractNome(raw.categoria) as Book['categoria'],
  quem: raw.quem_nome,
  porque: raw.porque ?? '',
  cover_url: raw.cover_url,
  synopsis: raw.synopsis,
  subgenerosArr: raw.subgeneros.map((s) => (typeof s === 'string' ? s : s.nome.toLowerCase())),
})

// ── Auth helper ───────────────────────────────────────────────────

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

// ── Composable ────────────────────────────────────────────────────

export function useApi() {
  const fetchBooks = async (forceRefresh = false) => {
    if (!forceRefresh && useCacheStore().isCacheValid) {
      useBooksStore().books = useCacheStore().cache!
      if (import.meta.env.DEV) console.log('📦 Usando dados do cache')
      return
    }

    if (!API_BASE) {
      useBooksStore().error = 'VITE_API_URL não configurada.'
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
        return
      }

      const raw = e instanceof Error ? e.message : String(e)
      useBooksStore().error = raw || 'Erro ao carregar dados'
      if (import.meta.env.DEV) console.error('[useApi]', e)
    } finally {
      useBooksStore().loading = false
    }
  }

  return { fetchBooks }
}

// ── Ações autenticadas ────────────────────────────────────────────

export const updateBook = async (id: string, fields: Partial<Pick<Book, 'titulo' | 'porque'>>): Promise<Book> => {
  const res = await fetch(`${API_BASE}/books/${id}`, {
    method: 'PATCH',
    headers: buildHeaders(),
    body: JSON.stringify(fields),
  })

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(error)
  }

  return normalizeBook(await res.json())
}

export const verifyAuth = async (token: string) => {
  const res = await fetch(`${API_BASE}/auth/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) throw new Error('Falha na verificação do token.')

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
    const { error } = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(error ?? 'Não foi possível concluir o vínculo do nome.')
  }

  return res.json() as Promise<RegisterResponse>
}

export const getMyClaimStatus = async (): Promise<MyClaimStatus> => {
  const res = await fetch(`${API_BASE}/users/me/claim`, {
    method: 'GET',
    headers: buildHeaders(),
  })

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(error ?? 'Não foi possível carregar o vínculo atual.')
  }

  return res.json() as Promise<MyClaimStatus>
}

export const unclaimRegister = async (): Promise<{ message?: string }> => {
  const res = await fetch(`${API_BASE}/users/me/claim`, {
    method: 'DELETE',
    headers: buildHeaders(),
  })

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(error ?? 'Não foi possível remover o vínculo atual.')
  }

  return res.json() as Promise<{ message?: string }>
}

export const getClaimHistory = async (): Promise<ClaimHistoryEntry[]> => {
  const res = await fetch(`${API_BASE}/admin/users/claims/history`, {
    method: 'GET',
    headers: buildHeaders(),
  })

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(error ?? 'Não foi possível carregar o histórico de vínculos.')
  }

  const raw = (await res.json()) as ClaimHistory

  return raw.history.map((entry) => ({
    ...entry,
    action_label: entry.action === 'unclaim' ? 'Desvinculou' : 'Vinculou',
  }))
}
