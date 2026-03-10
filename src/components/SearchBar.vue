<template>
  <div class="search-wrap">
    <div class="search-box" :class="{ 'is-focused': focused }">
      <BaseIcon name="search" class="search-icon" />
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
        <BaseIcon name="times" />
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

<style lang="scss" scoped>
.search {
  &-wrap {
    position: relative;

    width: 100%;
  }

  &-box {
    display: flex;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    padding: 0 14px;

    align-items: center;
    gap: 10px;
    transition: all var(--transition);

    &.is-focused {
      background: var(--surface);
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-soft);
    }
  }

  &-icon {
    color: var(--muted);

    flex-shrink: 0;
  }

  &-input {
    height: 48px;
    background: none;
    border: none;
    outline: none;

    font: {
      family: var(--font-body);
      size: 1rem;
    }
    color: var(--ink);

    flex: 1;

    &::placeholder {
      color: var(--muted);
    }
  }
}

.clear-search {
  display: flex;
  background: none;
  border: none;
  padding: 4px;
  border-radius: 3px;

  color: var(--muted);

  transition: color var(--transition);
  cursor: pointer;
  align-items: center;

  &:hover {
    color: var(--ink);
  }
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
  padding: 10px 16px;

  cursor: pointer;
  transition: background var(--transition);
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;

  &:hover,
  &.is-active {
    background: var(--bg-subtle);
  }
}

.sug {
  &-titulo {
    font-size: 1rem;
    color: var(--ink);
    font-weight: 500;

    :deep(mark) {
      background: var(--accent-soft);
      color: var(--accent);
      border-radius: 2px;
    }
  }

  &-autor {
    font-size: 0.8rem;
    color: var(--muted);
    flex-shrink: 0;
  }
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--transition);
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
