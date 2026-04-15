import { ref, onMounted } from 'vue'

import { useUtils } from '@/composables'

export function useTheme() {
  const themes = [
    { value: 'ecos', label: 'Ecos', emoji: '📚' },
    { value: 'olive-garden', label: 'Olive', emoji: '🫒' },
    { value: 'sunny-beach', label: 'Sunny', emoji: '🏖️' },
    { value: 'gothic-glam', label: 'Gothic', emoji: '🖤' },
    { value: 'purple-haze', label: 'Purple', emoji: '🔮' },
    { value: 'vibrant-fiesta', label: 'Fiesta', emoji: '🎉' },
  ]

  const STORAGE_KEY = 'ecos-theme'
  const DEFAULT_THEME = 'ecos'

  const activeTheme = ref<string>(DEFAULT_THEME)

  const applyTheme = (value: string) => {
    useUtils().sendGtmEvent({
      event: 'theme_change',
      theme: value,
      theme_label: themes.find((t) => t.value === value)?.label ?? value,
    })
    document.documentElement.setAttribute('data-theme', value)
    activeTheme.value = value
  }
  const select = (value: string) => {
    applyTheme(value)
    localStorage.setItem(STORAGE_KEY, value)
  }

  onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME
    const valid = themes.some((t) => t.value === saved) ? saved : DEFAULT_THEME
    applyTheme(valid)
  })

  return {
    themes,
    activeTheme,
    select,
  }
}
