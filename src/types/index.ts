import CategoriesColors from '@/data/categoryColors.json'

export interface Book {
  id: string | number // string (_id do MongoDB) ou number (legado CSV)
  titulo: string
  autor: string
  categoria: keyof typeof CategoriesColors
  midia: string
  quem: string
  porque: string
  subgenerosArr: string[]

  // Campos novos — opcionais para manter compatibilidade durante a transição
  cover_url?: string
  synopsis?: string
}

export interface Options {
  midia: string[]
  categoria: string[]
  subgeneros: string[]
  quem: string[]
}

export interface Suggestion {
  id: number | string
  titulo: string
  autor: string
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
