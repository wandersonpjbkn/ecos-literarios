import { useBooksStore, useCacheStore } from '@/stores'

import type { Book } from '@/types'

// ── Configuração ──────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL as string

// ── Tipos internos da resposta da API ─────────────────────────────

interface ApiSubgenero {
  _id: string
  nome: string
  slug: string
}

interface ApiBook {
  _id: string
  titulo: string
  autor: string
  midia: string
  categoria: string
  quem_nome: string
  quem_user_id?: { name: string; avatar_url?: string }
  porque: string
  cover_url?: string
  synopsis?: string
  subgeneros: (ApiSubgenero | string)[]
}

// ── Normalização ApiBook → Book ───────────────────────────────────

/**
 * Converte o shape da API para o shape interno do app.
 * Mantém compatibilidade total com todos os composables e componentes.
 */
const normalizeBook = (raw: ApiBook): Book => ({
  id: raw._id,
  titulo: raw.titulo,
  autor: raw.autor,
  midia: raw.midia,
  categoria: raw.categoria as Book['categoria'],
  quem: raw.quem_user_id?.name ?? raw.quem_nome,
  porque: raw.porque ?? '',
  cover_url: raw.cover_url,
  synopsis: raw.synopsis,
  subgenerosArr: raw.subgeneros.map((s) => (typeof s === 'string' ? s : s.nome.toLowerCase())),
})

// ── Auth helper ───────────────────────────────────────────────────

/**
 * Lê o access_token do Supabase no localStorage.
 * O Supabase persiste a sessão com chave sb-<ref>-auth-token.
 * Viewers não autenticados ainda conseguem GET /books se a permissão estiver aberta.
 */
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

const buildHeaders = (): HeadersInit => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  const token = getSupabaseToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

// ── Composable ────────────────────────────────────────────────────

export function useApi() {
  /**
   * Busca todos os livros da ecos-api.
   * Interface idêntica ao useSheets().fetchBooks() —
   * nenhuma view ou componente precisa ser alterado além da importação.
   */
  const fetchBooks = async (forceRefresh = false) => {
    console.log(
      '%c force-refresh ',
      'background:purple;color:#fff',
      `forceRefresh: ${forceRefresh}`,
      `isCacheValid: ${useCacheStore().isCacheValid}`,
    )

    // Cache do Pinia ainda válido
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

      const res = await fetch(`${API_BASE}/books`, {
        headers: buildHeaders(),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const raw: ApiBook[] = await res.json()
      const books = raw.map(normalizeBook)

      // Atualiza store + cache do Pinia (persiste offline — mesmo comportamento do useSheets)
      useBooksStore().books = books
      useCacheStore().cache = books
      useCacheStore().ts = Date.now()

      if (import.meta.env.DEV) console.log('[useApi] Books loaded:', books.length)
    } catch (e: unknown) {
      // Offline com dados persistidos no Pinia — silencia o erro
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

// ── Ações autenticadas (uso futuro: edição de indicações) ─────────

/**
 * Atualiza campos de um livro.
 * Requer usuário autenticado com permissão de update.
 */
export const updateBook = async (
  id: string,
  fields: Partial<Pick<Book, 'titulo' | 'autor' | 'categoria' | 'midia' | 'porque'>>,
): Promise<Book> => {
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

/**
 * Verifica o JWT do Supabase na API e retorna o usuário autenticado.
 * Deve ser chamado logo após o login no Supabase.
 */
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
