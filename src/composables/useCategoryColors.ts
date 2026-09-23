import CATEGORY_COLORS from '@/data/categoryColors.json'

type KnownCategory = keyof typeof CATEGORY_COLORS

/**
 * Returns the CSS variable for a category's accent color.
 * Falls back to the default action color when the category is unknown or missing.
 */
const categoryColor = (cat: string | undefined): string => {
  if (!cat) return 'var(--color-action-default)'
  const key = cat as KnownCategory
  const token = CATEGORY_COLORS[key]
  return token ? `var(--category-color-${token})` : 'var(--color-action-default)'
}

/** Genre slug that picks the cover tint (`--tint-<slug>-*`); unknown or missing genre falls back to ficcao. */
const coverTint = (cat: string | undefined): string => (cat && CATEGORY_COLORS[cat as KnownCategory]) || 'ficcao'

/** Returns the CSS class for the media badge. */
const mediaBadgeClass = (midia: string): string => {
  if (midia === 'Mangá') return 'badge-manga'
  if (midia === 'HQ') return 'badge-hq'
  return 'badge-livro'
}

export function useCategoryColors() {
  return { categoryColor, coverTint, mediaBadgeClass }
}
