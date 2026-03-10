import CATEGORY_COLORS from '@/data/categoryColors.json'

export function useCategoryColors() {
  const categoryClass = (cat: keyof typeof CATEGORY_COLORS) => {
    return `var(--category-color-${CATEGORY_COLORS[cat]})`
  }

  const midiaClass = (midia: string) => {
    if (midia === 'Mangá') return 'badge-manga'
    if (midia === 'HQ') return 'badge-hq'
    return 'badge-livro'
  }

  return {
    categoryClass,
    midiaClass,
  }
}
