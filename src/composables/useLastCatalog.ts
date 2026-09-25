import { ref } from 'vue'

// Last catalog URL with filters for "Voltar ao catálogo"; sessionStorage so reloading the book keeps it.
const KEY = 'last-catalog'

const read = () => {
  try {
    return sessionStorage.getItem(KEY) ?? '/'
  } catch {
    return '/'
  }
}

const lastCatalog = ref(read())

export const rememberCatalog = (fullPath: string) => {
  lastCatalog.value = fullPath
  try {
    sessionStorage.setItem(KEY, fullPath)
  } catch {
    // Storage blocked: it still works for this visit.
  }
}

export const useLastCatalog = () => lastCatalog
