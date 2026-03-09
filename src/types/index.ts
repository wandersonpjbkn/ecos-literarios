import CategoriesColors from '@/data/categoryColors.json'

export interface Book {
  id: number
  titulo: string
  autor: string
  categoria: keyof typeof CategoriesColors
  midia: string
  quem: string
  porque: string
  subgenerosArr: string[]
}

export interface Options {
  midia: string[]
  categoria: string[]
  subgeneros: string[]
  quem: string[]
}

export interface Suggestion {
  id: number
  titulo: string
  autor: string
}
