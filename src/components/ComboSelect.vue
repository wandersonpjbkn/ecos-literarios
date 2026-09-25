<template>
  <div ref="root" class="combo" @focusout="onFocusOut">
    <ul v-if="model.length" class="combo__chosen" :aria-label="`Escolhidos em ${label.toLowerCase()}`">
      <li v-for="value in model" :key="value">
        <button type="button" class="combo__chip" :aria-label="`Tirar ${value}`" @click="removeChosen(value)">
          {{ value }}
          <BaseIcon name="times" aria-hidden="true" />
        </button>
      </li>
    </ul>

    <div class="combo__field">
      <BaseIcon name="search" class="combo__icon" aria-hidden="true" />
      <input
        :id="`${id}-input`"
        ref="input"
        v-model="query"
        type="text"
        role="combobox"
        class="combo__input"
        autocomplete="off"
        :placeholder="placeholder"
        :aria-label="label"
        :aria-expanded="isOpen"
        :aria-controls="`${id}-list`"
        :aria-activedescendant="activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined"
        aria-autocomplete="list"
        @focus="isOpen = true"
        @click="isOpen = true"
        @input="onInput"
        @keydown="onKeydown"
      />
      <BaseIcon name="chevron" class="combo__chevron" :class="{ 'is-open': isOpen }" aria-hidden="true" />
    </div>

    <ul
      v-if="isOpen"
      :id="`${id}-list`"
      ref="list"
      class="combo__list"
      role="listbox"
      aria-multiselectable="true"
      :aria-label="label"
    >
      <li
        v-for="(value, index) in matches"
        :id="`${id}-option-${index}`"
        :key="value"
        role="option"
        class="combo__option"
        :class="{ 'is-active': index === activeIndex }"
        :aria-selected="model.includes(value)"
        @mousedown.prevent="toggle(value)"
        @mouseenter="activeIndex = index"
      >
        <BaseIcon name="check" class="combo__check" :class="{ 'is-on': model.includes(value) }" aria-hidden="true" />
        <span class="combo__label">{{ value }}</span>
        <span class="combo__count">{{ counts[value] }}</span>
      </li>
      <li v-if="!matches.length" class="combo__empty" role="presentation">
        Nenhum {{ noun }} começa com "{{ query }}".
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, useId } from 'vue'

import { useUtils } from '@/composables'

const props = defineProps<{
  options: string[]
  counts: Record<string, number>
  label: string
  noun: string
  placeholder?: string
}>()

const model = defineModel<string[]>({ required: true })

const id = useId()
const { normalizeText } = useUtils()

const root = ref<HTMLElement | null>(null)
const list = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const query = ref('')
const isOpen = ref(false)
const activeIndex = ref(-1)

const words = (value: string) => normalizeText(value).split('-')

// Word-start match: "ro" finds "romântico", not "horror".
const matches = computed(() => {
  const q = normalizeText(query.value)
  if (!q) return props.options
  const starts = props.options.filter((value) => normalizeText(value).startsWith(q))
  const wordStarts = props.options.filter(
    (value) => !starts.includes(value) && words(value).some((word) => word.startsWith(q)),
  )
  return [...starts, ...wordStarts]
})

const toggle = (value: string) => {
  model.value = model.value.includes(value) ? model.value.filter((v) => v !== value) : [...model.value, value]
}

// The removed chip takes its focus with it; send it back to the field instead of the page.
const removeChosen = (value: string) => {
  toggle(value)
  input.value?.focus()
}

const onInput = () => {
  isOpen.value = true
  activeIndex.value = matches.value.length ? 0 : -1
}

const scrollActiveIntoView = async () => {
  await nextTick()
  list.value?.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' })
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    isOpen.value = true
    const step = event.key === 'ArrowDown' ? 1 : -1
    const last = matches.value.length - 1
    activeIndex.value = Math.min(last, Math.max(0, activeIndex.value + step))
    scrollActiveIntoView()
  } else if (event.key === 'Enter' && isOpen.value && activeIndex.value >= 0) {
    event.preventDefault()
    const value = matches.value[activeIndex.value]
    if (value) toggle(value)
  } else if (event.key === 'Escape' && isOpen.value) {
    // Closes only the list; the drawer listening on the document must not close too.
    event.stopPropagation()
    isOpen.value = false
    activeIndex.value = -1
  }
}

const onFocusOut = (event: FocusEvent) => {
  if (!root.value?.contains(event.relatedTarget as Node | null)) isOpen.value = false
}
</script>

<style lang="scss" scoped>
.combo {
  position: relative;
  clear: both;

  &__chosen {
    display: flex;
    margin-bottom: var(--space-2);
    flex-wrap: wrap;
    gap: var(--space-2);
    list-style: none;
  }

  &__chip {
    display: inline-flex;
    min-height: var(--touch-min);
    padding: 0 var(--space-3) 0 var(--space-4);

    align-items: center;
    gap: var(--space-2);

    font: {
      family: var(--font-family-body);
      size: 0.9375rem;
      weight: 600;
    }
    color: var(--color-action-default-hover);

    background: var(--color-action-background-subtle);
    border: 1px solid var(--color-action-text-subtle);
    border-radius: var(--radius-pill);
    cursor: pointer;

    :deep(.base-icon) {
      width: 14px;
      height: 14px;
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: var(--space-1);
    }
  }

  &__field {
    display: flex;
    min-height: var(--touch-min);
    padding: 0 var(--space-3);

    align-items: center;
    gap: var(--space-2);

    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-lg);

    &:focus-within {
      border-color: var(--color-border-focus);
    }
  }

  &__icon,
  &__chevron {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    color: var(--color-text-subtle);
  }

  &__chevron {
    transition: transform var(--motion-transition-default);

    &.is-open {
      transform: rotate(180deg);
    }
  }

  &__input {
    flex: 1;
    min-width: 0;
    min-height: var(--touch-min);

    font: {
      family: var(--font-family-body);
      size: 1rem;
    }
    color: var(--color-text-default);

    background: none;
    border: none;
    outline: none;
  }

  // Bounded so the whole list can be browsed without pushing the drawer to thousands of pixels.
  &__list {
    max-height: calc(6 * var(--touch-min));
    margin-top: var(--space-1);
    overflow-y: auto;
    list-style: none;

    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
  }

  &__option {
    display: flex;
    min-height: var(--touch-min);
    padding: 0 var(--space-3);

    align-items: center;
    gap: var(--space-3);

    cursor: pointer;

    &.is-active {
      background: var(--color-background-subtle);
    }
  }

  &__check {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    color: var(--color-action-default);
    visibility: hidden;

    &.is-on {
      visibility: visible;
    }
  }

  &__label {
    flex: 1;
    font-size: 0.9375rem;
  }

  &__count {
    font-size: 0.875rem;
    color: var(--color-text-subtle);
  }

  &__empty {
    padding: var(--space-3);
    font-size: 0.875rem;
    color: var(--color-text-subtle);
  }
}
</style>
