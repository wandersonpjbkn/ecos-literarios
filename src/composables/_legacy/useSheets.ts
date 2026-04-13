import { useBooksStore, useCacheStore } from '@/stores'

import type { Book } from '@/types'

export const SHEET_CONFIG = {
  SHEET_ID: import.meta.env.VITE_SHEET_ID,
  GID: import.meta.env.VITE_SHEET_GID,
  HEADER_ROW: import.meta.env.VITE_SHEET_HEADER_ROW,
}

export function useSheets() {
  const fetchBooks = async (forceRefresh = false) => {
    if (!forceRefresh && useCacheStore().isCacheValid) {
      useBooksStore().books = useCacheStore().cache!
      return console.log('📦 Usando dados do cache')
    }

    useBooksStore().loading = true
    useBooksStore().error = null

    try {
      const url = `https://docs.google.com/spreadsheets/d/e/${SHEET_CONFIG.SHEET_ID}/pub?gid=${SHEET_CONFIG.GID}&single=true&output=csv`

      if (import.meta.env.DEV) console.log('Fetching books...')

      const res = await fetch(url)

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const csv = await res.text()
      const parsed = parseCSV(csv)

      useBooksStore().books = parsed
      useCacheStore().cache = parsed
      useCacheStore().ts = Date.now()

      if (import.meta.env.DEV) console.log('Books loaded:', parsed.length)
    } catch (e: unknown) {
      // Se estiver offline, usa os dados do Pinia
      if (!navigator.onLine && useBooksStore().books.length > 0) {
        if (import.meta.env.DEV) console.warn('[useSheets] Offline, usando dados persistidos do Pinia')
        useBooksStore().error = null
        return
      }

      // Caso contrário, mostra o erro
      const raw = e instanceof Error ? e.message : String(e)
      useBooksStore().error = raw || 'Erro ao carregar dados'
      if (import.meta.env.DEV) console.error('[useSheets]', e)
    } finally {
      useBooksStore().loading = false
    }
  }

  return { fetchBooks }
}

const parseCSV = (csv: string): Book[] => {
  const lines = csv.split(/\r?\n/)
  const dataStart = SHEET_CONFIG.HEADER_ROW
  const result = []

  for (let i = dataStart; i < lines.length; i++) {
    const line = lines[i] as string
    if (!line.trim()) continue

    const cols = splitCSV(line)
    if (cols.length < 8) continue

    const [, titulo, autor, midia, categoria, subgeneros, quem, porque] = cols
    if (!titulo && !autor) continue

    const tags = subgeneros
      ? subgeneros
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
      : []

    result.push({
      id: result.length + 1,
      titulo,
      autor,
      midia,
      categoria,
      subgeneros,
      subgenerosArr: tags,
      quem,
      porque: porque || '',
    })
  }

  if (import.meta.env.DEV) console.log('Parsed', result)
  return result as Book[]
}

const splitCSV = (line: string) => {
  const result = []
  let current = ''
  let insideQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      insideQuotes = !insideQuotes
      continue
    }
    if (char === ',' && !insideQuotes) {
      result.push(current.trim())
      current = ''
      continue
    }
    current += char
  }

  result.push(current.trim())
  return result
}
