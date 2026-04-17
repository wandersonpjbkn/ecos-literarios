// MultiSelect

export type OptionMultiSelect =
  | string
  | {
      label: string
      value: string
    }

// Meta
export interface PageMetaOptions {
  title: string
  description?: string
  type?: 'website' | 'article'
}

export type MaybeRefOrGetter<T> = T | (() => T) | import('vue').Ref<T>

// Books

import CategoriesColors from '@/data/categoryColors.json'

export interface Book {
  id: string
  titulo: string
  autor: string
  categoria: keyof typeof CategoriesColors
  midia: string
  quem: string
  porque: string
  subgenerosArr: string[]
  quem_user_id?: string

  cover_url?: string
  synopsis?: string
  google_books_id?: string
  isbn?: string
  page_count?: number
  published_year?: number
}

export interface Options {
  midia: string[]
  categoria: string[]
  subgeneros: string[]
  quem: string[]
}

export interface Suggestion {
  id: string
  main: string
  sub: string
}

export type FilterType = 'midia' | 'categoria' | 'autor' | 'mencao'

export type ExploreKey = 'midia' | 'categoria' | 'autor' | 'quem'

export type CategoryType = keyof typeof CategoriesColors

export type BookSortOrder = 'old' | 'new' | 'asc' | 'desc'

export interface BookPayload {
  _id: string
  titulo: string
  autor: string | { _id: string; nome: string }
  midia: string | { _id: string; nome: string }
  categoria: string | { _id: string; nome: string }
  subgeneros: Array<string | { _id: string; nome: string }>
  quem_nome: string
  porque: string
  isbn?: string
  cover_url?: string
  synopsis?: string
  google_books_id?: string | number
  page_count?: number
  published_year?: number
}

export interface SupportEntity {
  _id: string
  nome: string
  slug: string
  created_at?: string
}

export interface EntityCrudOptions {
  /** URL path segment: 'autores', 'midias', 'categorias', 'subgeneros' */
  resource: string
}

// Auth

export type UserRole = 'admin' | 'editor' | 'viewer'

export interface AuthUser {
  _id: string
  email: string
  name: string
  role: UserRole
}

// Tipos da resposta da API

export interface ApiPopulated {
  _id: string
  nome: string
  slug: string
}

export interface ApiBook {
  _id: string
  titulo: string
  autor: ApiPopulated | string
  midia: ApiPopulated | string
  categoria: ApiPopulated | string
  quem_nome: string
  quem_user_id?: { _id: string; name: string; avatar_url?: string }
  porque: string
  cover_url?: string
  synopsis?: string
  published_year?: number
  page_count?: number
  subgeneros: (ApiPopulated | string)[]
}

export interface MyClaimStatus {
  claim_name: string | null
  claimed_books: number
  has_claim: boolean
  warning?: string
}

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

// Enrichment

export type EnrichmentField = 'description' | 'coverUrl' | 'publisher' | 'isbn' | 'pageCount' | 'publishedYear'

export interface EnrichmentItem {
  field: EnrichmentField
  label: string
  preview: string
  hasValue: boolean
}

export interface EnrichmentPreview {
  sourceLabel: string
  items: EnrichmentItem[]
}

export interface EnrichmentApiResponse {
  source: 'google_books' | 'open_library'
  preview: {
    description?: string
    coverUrl?: string
    publisher?: string
    isbn?: string
    pageCount?: number
    publishedYear?: number
  }
}

// Admin

export type SegmentFilter = 'all' | 'missing' | 'complete' | 'missing-isbn'

export interface AdminBook {
  _id: string
  titulo: string
  autor: string | { _id: string; nome: string }
  midia: string | { _id: string; nome: string }
  categoria: string | { _id: string; nome: string }
  subgeneros: Array<string | { _id: string; nome: string }>
  quem_nome: string
  porque: string
  isbn?: string
  cover_url?: string
  synopsis?: string
  page_count?: number
  published_year?: number
}

export type ResultStatus = 'applied' | 'skipped' | 'failed'

export interface EnrichmentResult {
  id: string
  title: string
  status: ResultStatus
  detail?: string
}

export interface EnrichmentSummary {
  total: number
  applied: number
  skipped: number
  failed: number
}

export interface EnrichmentHistoryItem {
  book_id: string
  titulo: string
  status: ResultStatus
  source?: 'google_books' | 'open_library'
  reason?: 'manual_edit' | 'not_found' | 'missing_author'
  strategy?: string
  error?: string
  cover_url?: string
}

export interface EnrichmentRun {
  id: string
  started_at: string
  finished_at: string
  force: boolean
  initiated_by_email: string
  total: number
  applied: number
  skipped: number
  failed: number
  coverage_pct_after: number
  results: EnrichmentHistoryItem[]
}

export type Role = 'admin' | 'editor' | 'viewer'

export type Resource = 'books' | 'users' | 'autores' | 'midias' | 'categorias' | 'subgeneros' | 'permissions'

export type Action = 'create' | 'read' | 'update' | 'delete'

export interface AdminClaimHistoryEntry {
  id: string
  user_id: string
  user_email: string
  action: 'claim' | 'unclaim'
  claim_name?: string
  previous_claim_names?: string[]
  affected_books: number
  performed_at: string
}

export interface TabConfig {
  key: string
  label: string
  resource: string
  description: string
}

export interface ApiUser {
  _id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  created_at: string
  last_seen_at: string
}

export interface Permission {
  role: Role
  resource: Resource
  actions: Action[]
}

// Profile

// Mirrors BookPayload from BookFormDrawer — needed to type the edit state.
export interface BookForEdit {
  _id: string
  titulo: string
  autor: string | { _id: string; nome: string }
  midia: string | { _id: string; nome: string }
  categoria: string | { _id: string; nome: string }
  subgeneros: Array<string | { _id: string; nome: string }>
  quem_nome: string
  porque: string
  synopsis?: string
  isbn?: string
  cover_url?: string
  google_books_id?: string | number
  page_count?: number
  published_year?: number
}
