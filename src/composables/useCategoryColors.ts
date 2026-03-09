import CATEGORY_COLORS from '@/data/categoryColors.json'

export function useCategoryColors() {
  const categoryColor = (cat: keyof typeof CATEGORY_COLORS) => {
    return CATEGORY_COLORS[cat] || '#5a5a5a'
  }

  const midiaClass = (midia: string) => {
    if (midia === 'Mangá') return 'badge-manga'
    if (midia === 'HQ') return 'badge-hq'
    return 'badge-livro'
  }

  return {
    categoryColor,
    midiaClass,
  }
}
