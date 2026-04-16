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

// ── Auth ──────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'editor' | 'viewer'

export interface AuthUser {
  _id: string
  email: string
  name: string
  role: UserRole
}
