import CATEGORY_COLORS from '@/data/categoryColors.json'

type KnownCategory = keyof typeof CATEGORY_COLORS

const coverTint = (cat: string | undefined): string => (cat && CATEGORY_COLORS[cat as KnownCategory]) || 'ficcao'

export function useCategoryColors() {
  return { coverTint }
}
