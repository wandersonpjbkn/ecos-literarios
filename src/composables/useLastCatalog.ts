import { ref } from 'vue'

// sessionStorage so reloading the book keeps them. The catalog one backs every "Voltar ao catálogo".
const CATALOG_KEY = 'last-catalog'
// The list a book was opened from (catalog or Meus livros), for the book page's way back.
const LIST_KEY = 'last-list'

type LastList = { path: string; label: string }
const CATALOG: LastList = { path: '/', label: 'ao catálogo' }

const read = <T>(key: string, fallback: T): T => {
  try {
    const raw = sessionStorage.getItem(key)
    return raw === null ? fallback : ((key === CATALOG_KEY ? raw : JSON.parse(raw)) as T)
  } catch {
    return fallback
  }
}

const store = (key: string, value: string) => {
  try {
    sessionStorage.setItem(key, value)
  } catch {
    // Storage blocked: it still works for this visit.
  }
}

const lastCatalog = ref(read(CATALOG_KEY, '/'))
const lastList = ref<LastList>(read(LIST_KEY, CATALOG))

export const rememberCatalog = (fullPath: string) => {
  lastCatalog.value = fullPath
  lastList.value = { path: fullPath, label: 'ao catálogo' }
  store(CATALOG_KEY, fullPath)
  store(LIST_KEY, JSON.stringify(lastList.value))
}

export const rememberMyBooks = (fullPath: string) => {
  lastList.value = { path: fullPath, label: 'a Meus livros' }
  store(LIST_KEY, JSON.stringify(lastList.value))
}

export const useLastCatalog = () => lastCatalog
export const useLastList = () => lastList
