<template>
  <div ref="wrapRef" class="search-wrap">
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
        @keydown.down.prevent="moveSuggestion(1)"
        @keydown.up.prevent="moveSuggestion(-1)"
        @keydown.enter.prevent="selectCurrent"
        @keydown.escape="close"
        @keydown.tab="close"
      />
      <button v-if="model" class="clear-search" aria-label="Limpar" @click="cleanAll">
        <BaseIcon name="times" />
      </button>
    </div>

    <!-- Autocomplete dropdown -->
    <Transition name="dropdown">
      <ul v-if="showSuggestions" class="suggestions" role="listbox" aria-label="Sugestões de busca">
        <li
          v-for="(s, i) in suggestions"
          :key="s.id"
          class="suggestion"
          :class="{ 'is-active': i === activeIdx }"
          role="option"
          :aria-selected="i === activeIdx"
          @mousedown.prevent="selectSuggestion(s)"
        >
          <span class="sug-titulo" v-html="useUtils().sanitizeText(highlight(s.titulo))" />
          <span class="sug-autor">{{ s.autor }}</span>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { onClickOutside } from '@vueuse/core'

import { useUtils } from '@/composables'

import type { Suggestion } from '@/types'

const model = defineModel<string>()

const props = defineProps<{
  suggestions: Suggestion[]
}>()
const emit = defineEmits(['update:modelValue', 'select'])

const wrapRef = ref<HTMLDivElement | null>(null)
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

const moveSuggestion = (dir: number) => {
  const max = props.suggestions.length - 1
  activeIdx.value = Math.max(-1, Math.min(max, activeIdx.value + dir))
}

const selectCurrent = () => {
  if (activeIdx.value >= 0 && props.suggestions[activeIdx.value]) {
    selectSuggestion(props.suggestions[activeIdx.value] as Suggestion)
  }
}

const selectSuggestion = (s: Suggestion) => {
  emit('update:modelValue', s.titulo)
  emit('select', s)
  close()
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

onClickOutside(wrapRef, () => close())
</script>

<style lang="scss" scoped>
.search {
  &-wrap {
    position: relative;

    width: 100%;
    min-width: 0;
  }

  &-box {
    display: flex;
    background: var(--color-surface-default);
    border: 1.5px solid var(--color-border-default);
    border-radius: var(--border-radius-default);
    padding: 0 14px;
    min-height: 44px;

    align-items: center;
    gap: 10px;
    transition: all var(--motion-transition-default);

    &.is-focused {
      border-color: var(--color-action-default);
      box-shadow: 0 0 0 3px var(--color-action-background-subtle);
    }
  }

  &-icon {
    color: var(--color-text-subtle);
    flex-shrink: 0;
  }

  &-input {
    height: 44px;
    background: none;
    border: none;
    outline: none;

    font: {
      family: var(--font-family-body);
      size: 1rem;
    }
    color: var(--color-text-default);

    flex: 1;

    &::placeholder {
      color: var(--color-text-subtle);
    }
  }
}

.clear-search {
  display: flex;
  background: none;
  border: none;
  padding: 4px;
  border-radius: 3px;
  min-width: 36px;
  min-height: 36px;
  color: var(--color-text-subtle);

  transition: color var(--motion-transition-default);
  cursor: pointer;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--color-text-default);
  }
}

/* Dropdown */
.suggestions {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 200;

  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  box-shadow: var(--shadow-lg);
  list-style: none;

  overflow: hidden;
}

.suggestion {
  display: flex;
  min-height: 44px;
  padding: 10px 16px;

  cursor: pointer;
  transition: background var(--motion-transition-default);
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;

  &:hover,
  &.is-active {
    background: var(--color-background-subtle);
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding: 10px 12px;
  }
}

.sug {
  &-titulo {
    font-size: 1rem;
    color: var(--color-text-default);
    font-weight: 500;

    :deep(mark) {
      background: var(--color-action-background-subtle);
      color: var(--color-action-default);
      border-radius: 2px;
    }
  }

  &-autor {
    font-size: 0.875rem;
    color: var(--color-text-subtle);
    flex-shrink: 0;
  }
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--motion-transition-default);
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
