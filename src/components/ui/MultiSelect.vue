<template>
  <div
    ref="wrapRef"
    class="ms-root"
    :class="{
      'is-open': isOpen,
      'has-value': hasValue,
      'is-single': !multiple,
    }"
    @focusout="onFocusOut"
  >
    <button
      ref="controlRef"
      type="button"
      class="ms-control"
      aria-haspopup="listbox"
      role="combobox"
      :aria-expanded="isOpen"
      :aria-controls="isOpen && !searchable ? `${id}-list` : undefined"
      :aria-activedescendant="isOpen && !searchable && activeIdx >= 0 ? `${id}-opt-${activeIdx}` : undefined"
      :aria-labelledby="labelledby"
      @click="toggleOpen"
      @keydown.down.prevent="openOrMove(1)"
      @keydown.up.prevent="openOrMove(-1)"
      @keydown.enter.prevent="isOpen && activeIdx >= 0 ? selectActive() : toggleOpen()"
      @keydown.escape="onEscape"
    >
      <span class="ms-label">
        <template v-if="!multiple && selectedOption">
          {{ selectedOption.label }}
        </template>
        <template v-else>
          {{ label }}
        </template>
      </span>

      <AppBadge v-if="multiple && selectedCount > 0">{{ selectedCount }}</AppBadge>

      <BaseIcon name="chevron" class="ms-chevron" aria-hidden="true" />
    </button>

    <Transition name="ms-dropdown">
      <div v-if="isOpen" class="ms-dropdown" @keydown.escape.stop="closeToControl">
        <div v-if="searchable" class="ms-search-wrap">
          <BaseIcon name="search" class="ms-search-icon" />
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            class="ms-search"
            placeholder="Buscar…"
            autocomplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="true"
            :aria-label="`Buscar em ${label.toLowerCase()}`"
            :aria-controls="`${id}-list`"
            :aria-activedescendant="activeIdx >= 0 ? `${id}-opt-${activeIdx}` : undefined"
            @keydown.down.prevent="moveActive(1)"
            @keydown.up.prevent="moveActive(-1)"
            @keydown.enter.prevent="selectActive"
          />
          <button
            v-if="query"
            type="button"
            class="ms-clear-query"
            aria-label="Apagar a busca"
            @mousedown.prevent
            @click.stop="query = ''"
          >
            <BaseIcon name="times" aria-hidden="true" />
          </button>
        </div>

        <ul :id="`${id}-list`" class="ms-list" role="listbox" :aria-multiselectable="multiple || undefined">
          <li
            v-for="(opt, i) in normalizedOptions"
            :id="`${id}-opt-${i}`"
            :key="opt.value"
            class="ms-option"
            :class="{
              'is-selected': isSelected(opt.value),
              'is-active': i === activeIdx,
            }"
            role="option"
            :aria-selected="isSelected(opt.value)"
            @mousedown.prevent="handleSelect(opt.value)"
            @mousemove="activeIdx = i"
          >
            <BaseIcon name="check" class="ms-check" :class="{ 'is-on': isSelected(opt.value) }" aria-hidden="true" />

            <span class="ms-opt-label">{{ opt.label }}</span>
          </li>

          <li v-if="normalizedOptions.length === 0" class="ms-empty">Nenhuma opção encontrada</li>
        </ul>

        <div v-if="multiple && selected.length > 0" class="ms-footer">
          <button type="button" class="ms-clear-all" @mousedown.prevent @click.stop="emit('clear')">Limpar</button>
          <span class="ms-footer-count">{{ selected.length }} selecionado{{ selected.length > 1 ? 's' : '' }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core'
import { computed, nextTick, ref, useId, watch } from 'vue'

import type { OptionMultiSelect } from '@/types'

import AppBadge from '@/components/ui/AppBadge.vue'

// Never a real option value: the option list is built from ids and names.
const CREATE = '\u0000create'

const props = withDefaults(
  defineProps<{
    label: string
    options: OptionMultiSelect[]
    selected: string | string[]
    multiple?: boolean
    searchable?: boolean
    // Id of the visible label outside the control (a form field's label), so the button is named by it.
    labelledby?: string
    // Offers the typed text as a last option ("Outro nome: Joana"); choosing it emits `create` instead of `toggle`.
    createLabel?: (typed: string) => string
  }>(),
  {
    createLabel: undefined,
    multiple: true,
    searchable: true,
    labelledby: undefined,
  },
)

const emit = defineEmits<{
  toggle: [value: string]
  clear: []
  create: [typed: string]
}>()

const id = useId()

const wrapRef = ref<HTMLDivElement | null>(null)
const controlRef = ref<HTMLButtonElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const isOpen = ref(false)

const query = ref('')
const activeIdx = ref(-1)

const multiple = computed(() => props.multiple !== false)
const searchable = computed(() => props.searchable !== false)

const normalizedOptions = computed(() => {
  const base = props.options.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : { label: opt.label, value: opt.value },
  )

  if (!searchable.value || !query.value.trim()) return base

  const q = query.value.toLowerCase()
  const found = base.filter((opt) => opt.label.toLowerCase().includes(q))
  const typed = query.value.trim()
  if (!props.createLabel || base.some((opt) => opt.label.toLowerCase() === typed.toLowerCase())) return found
  return [...found, { label: props.createLabel(typed), value: CREATE }]
})

const hasValue = computed(() => {
  if (multiple.value) return Array.isArray(props.selected) && props.selected.length > 0
  return typeof props.selected === 'string' && props.selected !== ''
})

const selectedCount = computed(() => {
  return Array.isArray(props.selected) ? props.selected.length : 0
})

const selectedOption = computed(() => {
  if (multiple.value || typeof props.selected !== 'string') return null
  // From every option, not the filtered ones: typing in the search must not blank the chosen label.
  return (
    props.options
      .map((opt) => (typeof opt === 'string' ? { label: opt, value: opt } : opt))
      .find((opt) => opt.value === props.selected) ?? null
  )
})

// Esc closes an open list here; with the list closed it reaches the drawer and closes that.
const onEscape = (event: KeyboardEvent) => {
  if (!isOpen.value) return
  event.stopPropagation()
  closeToControl()
}

const isSelected = (value: string): boolean => {
  if (multiple.value) {
    return Array.isArray(props.selected) && props.selected.includes(value)
  }

  return props.selected === value
}

const handleSelect = (value: string) => {
  if (value === CREATE) {
    emit('create', query.value.trim())
    closeToControl()
    return
  }
  emit('toggle', value)

  if (!multiple.value) closeToControl()
}

// With a search box, typing right after opening filters: the focus goes to the box.
const openAt = (active: number) => {
  isOpen.value = true
  activeIdx.value = active
  if (searchable.value) nextTick(() => inputRef.value?.focus())
}

const toggleOpen = () => {
  if (isOpen.value) close()
  else openAt(-1)
}

const close = () => {
  isOpen.value = false
  query.value = ''
  activeIdx.value = -1
}

// Closing removes the search box: without this the focus inside it would drop to the page.
const closeToControl = () => {
  close()
  controlRef.value?.focus()
}

// Without a search box the button itself takes the arrows: first press opens, the next ones move.
const openOrMove = (dir: number) => {
  if (!isOpen.value) {
    openAt(0)
    return
  }
  moveActive(dir)
}

const moveActive = (dir: number) => {
  const max = normalizedOptions.value.length - 1
  activeIdx.value = Math.max(0, Math.min(max, activeIdx.value + dir))
}

const selectActive = () => {
  const opt = normalizedOptions.value[activeIdx.value]
  if (activeIdx.value >= 0 && opt) handleSelect(opt.value)
}

watch(normalizedOptions, () => {
  activeIdx.value = -1
})

// Tab walks through the open list (search, clear, "Limpar") and closes it only when the focus leaves the select.
const onFocusOut = (event: FocusEvent) => {
  if (isOpen.value && !wrapRef.value?.contains(event.relatedTarget as Node | null)) close()
}

onClickOutside(wrapRef, close)
</script>

<style lang="scss" scoped>
/* ── Wrap ────────────────────────────────────── */
.ms-root {
  position: relative;
}

/* ── Control ─────────────────────────────────── */
.ms-control {
  display: flex;
  width: 100%;
  min-height: var(--touch-min);
  font-family: var(--font-family-body);
  font-size: var(--font-size-body);
  color: var(--color-text-default);
  text-align: left;
  padding: 0 var(--space-3);
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);

  cursor: pointer;
  transition: all var(--motion-transition-default);
  user-select: none;
  gap: var(--space-2);
  align-items: center;

  // The same field as AppField: white with or without a value, a paler border on hover and while open.
  &:hover,
  .is-open & {
    border-color: var(--color-action-border-subtle);
  }

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: var(--focus-offset);
  }
}

.ms-label {
  flex: 1;

  font-size: var(--font-size-body);
  font-family: var(--font-family-body);
  color: var(--color-text-subtle);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .has-value & {
    color: var(--color-text-default);
  }
}

.ms-clear-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-1);
  min-width: var(--control-box);
  min-height: var(--control-box);
  border: none;
  background: none;
  border-radius: 50%;
  cursor: pointer;
  color: var(--color-text-subtle);
  flex-shrink: 0;
  transition:
    color var(--motion-transition-default),
    background var(--motion-transition-default);

  &:hover {
    color: var(--color-text-default);
    background: rgba(var(--color-text-default-rgb), 0.08);
  }

  svg {
    width: var(--mark);
    height: var(--mark);
  }
}

.ms-chevron {
  color: var(--color-text-subtle);

  flex-shrink: 0;
  transition: transform var(--motion-transition-default);

  .is-open & {
    transform: rotate(180deg);
    color: var(--color-action-default);
  }
}

/* ── Dropdown ────────────────────────────────── */
.ms-dropdown {
  position: absolute;
  top: calc(100% + var(--space-1));
  left: 0;
  right: 0;
  z-index: var(--layer-drawer-popover);

  display: flex;
  min-width: min(var(--popover-min), 100vw - var(--space-8));
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);

  overflow: hidden;
  flex-direction: column;
}

.ms-search-wrap {
  display: flex;
  min-height: var(--touch-min);
  padding: 0 var(--space-3);
  border-bottom: 1px solid var(--color-border-default);

  color: var(--color-text-subtle);

  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.ms-search {
  flex: 1;

  border: none;
  outline: none;
  background: none;

  font-family: var(--font-family-body);
  font-size: var(--font-size-body);
  color: var(--color-text-default);

  &::placeholder {
    color: var(--color-text-subtle);
  }

  &-icon {
    width: var(--icon-sm);
    height: var(--icon-sm);

    flex-shrink: 0;
  }
}

.ms-clear-query {
  display: flex;
  padding: var(--space-1);
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  border: none;
  background: none;
  border-radius: var(--radius-sm);

  align-items: center;
  cursor: pointer;
  justify-content: center;

  color: var(--color-text-subtle);

  &:hover {
    color: var(--color-text-default);
    background: var(--color-background-subtle);
  }
}

/* ── Options list ────────────────────────────── */
.ms-list {
  list-style: none;
  overflow-y: auto;
  max-height: var(--popover-max-h);
  padding: var(--space-1) 0;
}

.ms-option {
  display: flex;
  min-height: var(--touch-min);
  padding: var(--space-3);

  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  transition: background var(--motion-transition-default);

  &:hover,
  &.is-active {
    background: var(--color-background-subtle);
  }

  // Same as AppSelect and ComboSelect: a tick and the action ink, no fill.
  &.is-selected .ms-opt-label {
    font-weight: var(--font-weight-semibold);
    color: var(--color-action-default-hover);
  }
}

.ms-check {
  width: var(--icon-sm);
  height: var(--icon-sm);
  flex-shrink: 0;
  color: var(--color-action-default);
  visibility: hidden;

  &.is-on {
    visibility: visible;
  }
}

.ms-opt-label {
  font-size: var(--font-size-body);
  color: var(--color-text-default);
  line-height: var(--line-height-ui);
  transition: color var(--motion-transition-default);
}

.ms-empty {
  padding: var(--space-5) var(--space-3);
  font-size: var(--font-size-ui);
  color: var(--color-text-subtle);
  text-align: center;
}

/* ── Footer (somente multi) ──────────────────── */
.ms-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: var(--touch-min);
  padding: var(--space-2) var(--space-3);
  border-top: 1px solid var(--color-border-default);
  background: var(--color-background-subtle);
  flex-shrink: 0;
}

.ms-clear-all {
  padding: var(--space-2) var(--space-3);
  min-height: var(--touch-min);
  border: none;
  border-radius: var(--radius-sm);
  background: none;

  font-family: var(--font-family-body);
  font-size: var(--font-size-body);
  color: var(--color-action-default);

  cursor: pointer;
  transition: background var(--motion-transition-default);

  &:hover {
    background: var(--color-action-background-subtle);
  }
}

.ms-footer-count {
  font-size: var(--font-size-meta);
  color: var(--color-text-subtle);
}

/* ── Transition ──────────────────────────────── */
.ms-dropdown-enter-active,
.ms-dropdown-leave-active {
  transition: all var(--motion-transition-default);
}
.ms-dropdown-enter-from,
.ms-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
