<template>
  <div class="search-wrap">
    <div class="search-box" :class="{ 'is-focused': focused }">
      <svg
        class="search-icon"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        ref="inputRef"
        type="text"
        :value="model"
        placeholder="Buscar por título ou autor…"
        autocomplete="off"
        spellcheck="false"
        class="search-input"
        @input="onInput"
        @focus="focused = true"
        @blur="handleBlur"
        @keydown.down.prevent="moveSuggestion(1)"
        @keydown.up.prevent="moveSuggestion(-1)"
        @keydown.enter.prevent="selectCurrent"
        @keydown.escape="close"
      />
      <button v-if="model" class="clear-search" aria-label="Limpar" @click="cleanAll">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <!-- Autocomplete dropdown -->
    <Transition name="dropdown">
      <ul v-if="showSuggestions" class="suggestions" role="listbox">
        <li
          v-for="(s, i) in suggestions"
          :key="s.id"
          class="suggestion"
          :class="{ 'is-active': i === activeIdx }"
          role="option"
          @mousedown.prevent="selectSuggestion(s)"
        >
          <span class="sug-titulo" v-html="highlight(s.titulo)" />
          <span class="sug-autor">{{ s.autor }}</span>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

import type { Suggestion } from '@/types'

const model = defineModel<string>()

const props = defineProps<{
  suggestions: Suggestion[]
}>()
const emit = defineEmits(['update:modelValue', 'select'])

const inputRef = ref<HTMLInputElement | null>(null)
const focused = ref(false)
const activeIdx = ref(-1)

const showSuggestions = computed(
  () => focused.value && props.suggestions.length > 0 && model.value && model.value?.length >= 2,
)

const onInput = (e: Event) => {
  activeIdx.value = -1
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
const handleBlur = () => {
  setTimeout(() => {
    focused.value = false
  }, 150)
}
const moveSuggestion = (dir: number) => {
  const max = props.suggestions.length - 1
  activeIdx.value = Math.max(-1, Math.min(max, activeIdx.value + dir))
}
const selectCurrent = () => {
  if (activeIdx.value >= 0 && props.suggestions[activeIdx.value]) {
    selectSuggestion(props.suggestions[activeIdx.value as number] as Suggestion)
  }
}
const selectSuggestion = (s: Suggestion) => {
  emit('update:modelValue', s.titulo)
  emit('select', s)
  focused.value = false
}
const close = () => {
  focused.value = false
  activeIdx.value = -1
}
const highlight = (text: string) => {
  if (!model.value) return text

  const q = model.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  return text.replace(new RegExp(`(${q})`, 'gi'), '<mark>$1</mark>')
}
const cleanAll = () => {
  emit('update:modelValue', '')
  inputRef.value?.focus()
}
</script>

<style scoped>
.search-wrap {
  position: relative;
  width: 100%;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--paper);
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  padding: 0 14px;
  transition: all var(--transition);
}
.search-box.is-focused {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(181, 69, 27, 0.12);
  background: white;
}

.search-icon {
  color: var(--muted);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  height: 48px;
  background: none;
  border: none;
  outline: none;
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--ink);
}
.search-input::placeholder {
  color: var(--muted);
}

.clear-search {
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 3px;
  transition: color var(--transition);
}
.clear-search:hover {
  color: var(--ink);
}

/* Dropdown */
.suggestions {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  list-style: none;
  z-index: 200;
  overflow: hidden;
}

.suggestion {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background var(--transition);
}
.suggestion:hover,
.suggestion.is-active {
  background: var(--paper-warm);
}

.sug-titulo {
  font-size: 0.9rem;
  color: var(--ink);
  font-weight: 500;
}
.sug-titulo :deep(mark) {
  background: rgba(181, 69, 27, 0.15);
  color: var(--accent);
  border-radius: 2px;
}

.sug-autor {
  font-size: 0.78rem;
  color: var(--muted);
  flex-shrink: 0;
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 150ms ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
