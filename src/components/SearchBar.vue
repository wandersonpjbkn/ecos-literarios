<template>
  <div ref="wrapRef" class="search-wrap" role="search">
    <!-- A real label, not only the placeholder: it stays when the person types and names the field on every width. -->
    <label :for="inputId" class="visually-hidden">{{ label ?? placeholder }}</label>
    <div class="search-box">
      <button v-if="model" type="button" class="clear-search" aria-label="Apagar a busca" @click="cleanAll">
        <BaseIcon name="times" aria-hidden="true" />
      </button>
      <BaseIcon v-else name="search" class="search-icon" />

      <input
        :id="inputId"
        ref="inputRef"
        type="text"
        :value="model"
        :placeholder="placeholder"
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

      <span v-if="model" class="search__count">
        <strong>{{ filtered }}</strong
        ><span> de {{ total }}</span>
      </span>
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
          <span class="sug-main" v-html="useUtils().sanitizeText(highlight(s.main))" />
          <span class="sug-sub">{{ s.sub }}</span>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, useId } from 'vue'
import { onClickOutside } from '@vueuse/core'

import { useUtils } from '@/composables'

import type { Suggestion } from '@/types'

const model = defineModel<string>()

const props = withDefaults(
  defineProps<{
    total: number
    suggestions: Suggestion[]
    filtered?: number
    placeholder?: string
    label?: string
  }>(),
  {
    filtered: undefined,
    placeholder: 'Buscar por título ou autor…',
    label: undefined,
  },
)
const emit = defineEmits(['update:modelValue', 'select'])
const inputId = useId()

const wrapRef = ref<HTMLDivElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

defineExpose({ focus: () => inputRef.value?.focus() })
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
  emit('update:modelValue', s.main)
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
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-lg);
    padding: 0 var(--space-4);
    min-height: var(--touch-min);

    align-items: center;
    gap: var(--space-3);
    transition: all var(--motion-transition-default);

    // The same ring as AppField: a pale halo on white did not reach the 3:1 a focus indicator needs.
    &:has(.search-input:focus-visible) {
      outline: 2px solid var(--color-border-focus);
      outline-offset: var(--focus-offset-tight);
    }
  }

  &-icon {
    color: var(--color-text-subtle);
    flex-shrink: 0;
  }

  &-input {
    height: var(--touch-min);
    background: none;
    border: none;
    outline: none;

    font-family: var(--font-family-body);
    font-size: var(--font-size-body);
    color: var(--color-text-default);

    flex: 1;

    &::placeholder {
      color: var(--color-text-subtle);
    }
  }

  &__count {
    font-size: var(--font-size-caption);
    color: var(--color-text-subtle);
    flex-shrink: 0;

    // Not the action colour: the count is read, never clicked.
    strong {
      color: var(--color-text-default);
    }
  }
}

.clear-search {
  display: flex;
  background: none;
  border: none;
  padding: var(--space-1);
  border-radius: var(--radius-pill);
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  color: var(--color-text-subtle);

  transition: color var(--motion-transition-default);
  cursor: pointer;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--color-text-default);
  }

  svg {
    width: var(--icon-sm);
    height: var(--icon-sm);
  }
}

/* Dropdown */
.suggestions {
  position: absolute;
  top: calc(100% + var(--space-1));
  left: 0;
  right: 0;
  z-index: var(--layer-popover);

  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  list-style: none;

  overflow: hidden;
}

.suggestion {
  display: flex;
  min-height: var(--touch-min);
  padding: var(--space-3) var(--space-4);

  cursor: pointer;
  transition: background var(--motion-transition-default);
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);

  &:hover,
  &.is-active {
    background: var(--color-background-subtle);
  }

  @media (max-width: $bp-small-max) {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
    padding: var(--space-3);
  }
}

.sug {
  &-main {
    font-size: var(--font-size-body);
    color: var(--color-text-default);
    font-weight: var(--font-weight-regular);

    :deep(mark) {
      background: var(--color-action-background-subtle);
      color: var(--color-action-default);
      border-radius: var(--radius-sm);
    }
  }

  &-sub {
    font-size: var(--font-size-meta);
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
