<template>
  <div ref="root" class="theme-switcher">
    <button
      class="theme-trigger"
      :aria-label="`Tema atual: ${current?.label}. Alterar tema`"
      aria-haspopup="listbox"
      :aria-expanded="open"
      @click="toggle"
      @keydown.escape="close"
    >
      <span class="theme-trigger-emoji" aria-hidden="true">{{ current?.emoji }}</span>
      <span class="theme-trigger-label">{{ current?.label }}</span>
      <BaseIcon name="chevron" :class="['theme-trigger-chevron', { open }]" aria-hidden="true" />
    </button>

    <Transition name="dropdown">
      <ul
        v-if="open"
        tabindex="0"
        class="theme-list"
        role="listbox"
        :aria-label="`Selecionar tema`"
        pe="close"
        @keydown.arrow-up.prevent="focusPrev"
        @keydown.arrow-down.prevent="focusNext"
      >
        <li
          v-for="theme in themes"
          :key="theme.id"
          class="theme-item"
          role="option"
          :aria-selected="theme.id === activeTheme"
          :class="{ active: theme.id === activeTheme }"
          tabindex="0"
          @click="select(theme.id)"
          @keydown.enter="select(theme.id)"
          @keydown.space.prevent="select(theme.id)"
        >
          <span class="theme-item-emoji" aria-hidden="true">{{ theme.emoji }}</span>
          <span class="theme-item-label">{{ theme.label }}</span>
          <BaseIcon v-if="theme.id === activeTheme" name="check" class="theme-item-check" aria-hidden="true" />
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

import { sendGtmEvent } from '@/utils/gtm'

const themes = [
  { id: 'ecos', label: 'Ecos', emoji: '📚' },
  { id: 'olive-garden', label: 'Olive', emoji: '🫒' },
  { id: 'sunny-beach', label: 'Sunny', emoji: '🏖️' },
  { id: 'gothic-glam', label: 'Gothic', emoji: '🖤' },
  { id: 'purple-haze', label: 'Purple', emoji: '🔮' },
]

const STORAGE_KEY = 'ecos-theme'
const DEFAULT_THEME = 'ecos'

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const activeTheme = ref<string>(DEFAULT_THEME)

const current = computed(() => themes.find((t) => t.id === activeTheme.value) || themes[0])

const applyTheme = (id: string) => {
  const el = document.documentElement

  el.setAttribute('data-theme', id)
  activeTheme.value = id
}

const select = (id: string) => {
  applyTheme(id)
  localStorage.setItem(STORAGE_KEY, id)

  sendGtmEvent({
    event: 'theme_change',
    theme: id,
    theme_label: themes.find((t) => t.id === id)?.label ?? id,
  })

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

const onClickOutside = (e: MouseEvent) => {
  if (root.value && !root.value.contains(e.target as Node)) {
    close()
  }
}

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME
  const valid = themes.some((t) => t.id === saved) ? saved : DEFAULT_THEME

  applyTheme(valid)

  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<style lang="scss" scoped>
.theme-switcher {
  position: relative;
}

.theme-trigger {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 10px 5px 8px;
  border-radius: var(--border-radius-sm);
  border: 1px solid rgba(var(--color-surface-default-rgb), 0.15);
  background: rgba(var(--color-surface-default-rgb), 0.07);
  color: rgba(var(--color-surface-default-rgb), 0.75);
  cursor: pointer;
  transition: all var(--motion-transition-default);
  min-height: 32px;
  white-space: nowrap;

  &:hover {
    background: rgba(var(--color-surface-default-rgb), 0.13);
    color: var(--color-surface-default);
    border-color: rgba(var(--color-surface-default-rgb), 0.25);
  }

  &-emoji {
    font-size: 0.95rem;
    line-height: 1;
  }

  &-label {
    font-size: 0.82rem;
    font-weight: 500;
    letter-spacing: 0.01em;

    @media (max-width: 480px) {
      display: none;
    }
  }

  &-chevron {
    opacity: 0.6;
    transition: transform var(--motion-transition-default);

    &.open {
      transform: rotate(180deg);
    }
  }
}

.theme-list {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 200;
  min-width: 200px;
  padding: 4px;
  margin: 0;
  list-style: none;
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  box-shadow: var(--shadow-lg);
}

.theme-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: background var(--motion-transition-default);
  outline: none;

  &:hover,
  &:focus {
    background: var(--color-background-default);
  }

  &.active {
    background: var(--color-action-background-subtle);
    color: var(--color-action-default);
  }

  &-emoji {
    font-size: 1.05rem;
    line-height: 1;
    flex-shrink: 0;
  }

  &-label {
    flex: 1;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-default);

    .active & {
      color: var(--color-action-default);
    }
  }

  &-check {
    flex-shrink: 0;
    color: var(--color-action-default);
  }
}

// ── Animação de abertura ──────────────────────────────────────────────
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity var(--motion-transition-default),
    transform var(--motion-transition-default);
  transform-origin: top right;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}
</style>
