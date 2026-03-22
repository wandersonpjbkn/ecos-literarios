import { ref, computed, onMounted } from 'vue'
import { onClickOutside } from '@vueuse/core'

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

  const open = ref(false)
  const root = ref<HTMLElement | null>(null)
  const activeTheme = ref<string>(DEFAULT_THEME)

  const current = computed(() => themes.find((t) => t.value === activeTheme.value) ?? themes[0])

  onClickOutside(root, () => close())

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
    close()
  }
  const toggle = () => {
    open.value = !open.value
  }
  const close = () => {
    open.value = false
  }
  const focusNext = () => {
    const items = root.value?.querySelectorAll<HTMLElement>('.theme-item')
    if (!items) return
    const idx = [...items].findIndex((el) => el === document.activeElement)
    items[Math.min(idx + 1, items.length - 1)]?.focus()
  }
  const focusPrev = () => {
    const items = root.value?.querySelectorAll<HTMLElement>('.theme-item')
    if (!items) return
    const idx = [...items].findIndex((el) => el === document.activeElement)
    items[Math.max(idx - 1, 0)]?.focus()
  }

  onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME
    const valid = themes.some((t) => t.value === saved) ? saved : DEFAULT_THEME
    applyTheme(valid)
  })

  return {
    themes,
    open,
    root,
    current,
    activeTheme,
    select,
    toggle,
    close,
    focusNext,
    focusPrev,
  }
}
