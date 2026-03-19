<template>
  <div
    ref="wrapRef"
    class="ms-root"
    :class="{
      'is-open': isOpen,
      'has-value': hasValue,
      'is-single': !multiple,
    }"
  >
    <div class="ms-control" @click="toggleOpen">
      <span class="ms-label">
        <template v-if="!multiple && selectedOption">
          {{ selectedOption.label }}
        </template>
        <template v-else>
          {{ label }}
        </template>
      </span>

      <span v-if="multiple && selectedCount > 0" class="ms-count">
        {{ selectedCount }}
      </span>

      <BaseIcon name="chevron" class="ms-chevron" />
    </div>

    <Transition name="ms-dropdown">
      <div v-if="isOpen" class="ms-dropdown">
        <div v-if="searchable" class="ms-search-wrap">
          <BaseIcon name="search" class="ms-search-icon" />
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            class="ms-search"
            :placeholder="`Buscar ${label.toLowerCase()}…`"
            autocomplete="off"
            @keydown.escape="close"
            @keydown.tab="close"
            @keydown.down.prevent="moveActive(1)"
            @keydown.up.prevent="moveActive(-1)"
            @keydown.enter.prevent="selectActive"
          />
          <button v-if="query" class="ms-clear-query" @click.stop="query = ''">
            <BaseIcon name="times" />
          </button>
        </div>

        <ul class="ms-list" role="listbox">
          <li
            v-for="(opt, i) in normalizedOptions"
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
            <span v-if="multiple" class="ms-checkbox" :class="{ 'is-checked': isSelected(opt.value) }">
              <BaseIcon v-if="isSelected(opt.value)" name="checkbox" />
            </span>

            <span class="ms-opt-label">{{ opt.label }}</span>
          </li>

          <li v-if="normalizedOptions.length === 0" class="ms-empty">Nenhuma opção encontrada</li>
        </ul>

        <div v-if="multiple && selected.length > 0" class="ms-footer">
          <button class="ms-clear-all" @click.stop="emit('clear')">Limpar</button>
          <span class="ms-footer-count">{{ selected.length }} selecionado{{ selected.length > 1 ? 's' : '' }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'

type OptionValue = string

type Option =
  | string
  | {
      label: string
      value: string
    }

const props = withDefaults(
  defineProps<{
    label: string
    options: Option[]
    selected: string | string[]
    multiple?: boolean
    searchable?: boolean
  }>(),
  {
    multiple: true,
    searchable: true,
  },
)

const emit = defineEmits<{
  toggle: [value: string]
  clear: []
}>()

const wrapRef = ref<HTMLDivElement | null>(null)
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
  return base.filter((opt) => opt.label.toLowerCase().includes(q))
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
  return normalizedOptions.value.find((opt) => opt.value === props.selected) ?? null
})

const isSelected = (value: OptionValue): boolean => {
  if (multiple.value) {
    return Array.isArray(props.selected) && props.selected.includes(value)
  }

  return props.selected === value
}

const handleSelect = (value: string) => {
  emit('toggle', value)

  if (!multiple.value) close()
}

const toggleOpen = () => {
  if (isOpen.value) {
    close()
  } else {
    isOpen.value = true
    activeIdx.value = -1
  }
}

const close = () => {
  isOpen.value = false
  query.value = ''
  activeIdx.value = -1
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
  min-height: 44px;
  padding: 0 12px;
  background: var(--color-surface-default);
  border: 1.5px solid var(--color-border-default);
  border-radius: var(--border-radius-default);

  cursor: pointer;
  transition: all var(--motion-transition-default);
  user-select: none;
  gap: 6px;
  align-items: center;

  .is-open & {
    border-color: var(--color-action-default);
    box-shadow: 0 0 0 3px var(--color-action-background-subtle);
  }

  .has-value & {
    border-color: var(--color-action-text-subtle);
    background: var(--color-action-background-subtle);
  }
}

.ms-label {
  flex: 1;

  font-size: 1rem;
  font-family: var(--font-family-body);
  color: var(--color-text-subtle);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .has-value:not(.is-single) & {
    color: var(--color-action-default);
    font-weight: 500;
  }

  .has-value.is-single & {
    color: var(--color-text-default);
    font-weight: 500;
  }
}

.ms-count {
  display: flex;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-action-default);

  color: white;
  font-size: 0.75rem;
  font-weight: 700;

  flex-shrink: 0;
  align-items: center;
  justify-content: center;
}

.ms-clear-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  min-width: 20px;
  min-height: 20px;
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
    width: 10px;
    height: 10px;
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
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 300;

  display: flex;
  min-width: min(240px, 100vw - 32px);
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  box-shadow: var(--shadow-lg);

  overflow: hidden;
  flex-direction: column;
}

.ms-search-wrap {
  display: flex;
  min-height: 44px;
  padding: 0 12px;
  border-bottom: 1px solid var(--color-border-default);

  color: var(--color-text-subtle);

  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.ms-search {
  flex: 1;

  border: none;
  outline: none;
  background: none;

  font: {
    family: var(--font-family-body);
    size: 1rem;
  }
  color: var(--color-text-default);

  &::placeholder {
    color: var(--color-text-subtle);
  }

  &-icon {
    $size: 1rem;

    width: $size;
    height: $size;

    flex-shrink: 0;
  }
}

.ms-clear-query {
  display: flex;
  padding: 4px;
  min-width: 36px;
  min-height: 36px;
  border: none;
  background: none;
  border-radius: var(--border-radius-sm);

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
  max-height: 260px;
  padding: 4px 0;
}

.ms-option {
  display: flex;
  min-height: 44px;
  padding: 10px 12px;

  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background var(--motion-transition-default);

  &:hover,
  &.is-active {
    background: var(--color-background-subtle);
  }

  &.is-selected {
    background: var(--color-action-background-subtle);

    .is-single & {
      .ms-opt-label {
        color: var(--color-action-default);
        font-weight: 500;
      }
    }
  }
}

.ms-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--color-border-strong);
  border-radius: 3px;
  background: var(--color-surface-default);
  flex-shrink: 0;
  transition: all var(--motion-transition-default);

  &.is-checked {
    background: var(--color-action-default);
    border-color: var(--color-action-default);
    color: white;
  }
}

.ms-opt-label {
  font-size: 1rem;
  color: var(--color-text-default);
  line-height: 1.3;
  transition: color var(--motion-transition-default);
}

.ms-empty {
  padding: 20px 12px;
  font-size: 0.95rem;
  color: var(--color-text-subtle);
  text-align: center;
}

/* ── Footer (somente multi) ──────────────────── */
.ms-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 8px 12px;
  border-top: 1px solid var(--color-border-default);
  background: var(--color-background-subtle);
  flex-shrink: 0;
}

.ms-clear-all {
  padding: 6px 10px;
  min-height: 36px;
  border: none;
  border-radius: 3px;
  background: none;

  font: {
    family: var(--font-family-body);
    size: 1rem;
  }
  color: var(--color-action-default);

  cursor: pointer;
  transition: background var(--motion-transition-default);

  &:hover {
    background: var(--color-action-background-subtle);
  }
}

.ms-footer-count {
  font-size: 0.875rem;
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
