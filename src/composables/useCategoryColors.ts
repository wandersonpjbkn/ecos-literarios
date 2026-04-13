import CATEGORY_COLORS from '@/data/categoryColors.json'

export function useCategoryColors() {
  /**
   * Retorna o valor CSS var() para a cor de lombada de uma categoria.
   * Uso: :style="{ '--background': categoryColor(book.categoria) }"
   */
  const categoryColor = (cat: keyof typeof CATEGORY_COLORS): string => {
    return `var(--category-color-${CATEGORY_COLORS[cat]})`
  }

  /**
   * Retorna a classe CSS do badge de mídia.
   * Uso: :class="mediaBadgeClass(book.midia)"
   */
  const mediaBadgeClass = (midia: string): string => {
    if (midia === 'Mangá') return 'badge-manga'
    if (midia === 'HQ') return 'badge-hq'
    return 'badge-livro'
  }

  return {
    categoryColor,
    mediaBadgeClass,
  }
}
