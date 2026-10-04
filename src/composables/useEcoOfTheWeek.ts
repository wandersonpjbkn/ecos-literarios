import { computed } from 'vue'

import type { Book } from '@/types'

import { useBooksStore } from '@/stores'

export const isoWeekKey = (date: Date) => {
  const day = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const weekday = day.getUTCDay() || 7
  day.setUTCDate(day.getUTCDate() + 4 - weekday)
  const yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((day.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
  return `${day.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

const hashOf = (text: string) => [...text].reduce((h, char) => (h * 31 + char.charCodeAt(0)) >>> 0, 7)

export function useEcoOfTheWeek(now: () => Date = () => new Date()) {
  return computed((): Book | null => {
    const pool = useBooksStore()
      .books.filter((book) => book.porque?.trim())
      .sort((a, b) => a.id.localeCompare(b.id))
    if (!pool.length) return null
    return pool[hashOf(isoWeekKey(now())) % pool.length] ?? null
  })
}
