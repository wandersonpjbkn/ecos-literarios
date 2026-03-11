<template>
  <div ref="wrapRef" :class="{ 'is-open': isOpen, 'has-value': selected.length > 0 }">
    <div class="ms-control" @click="toggleOpen">
      <span class="ms-label">{{ label }}</span>
      <span v-if="selected.length > 0" class="ms-count">{{ selected.length }}</span>
      <BaseIcon name="chevron" class="ms-chevron" />
    </div>

    <Transition name="ms-dropdown">
      <div v-if="isOpen" class="ms-dropdown">
        <div class="ms-search-wrap">
          <BaseIcon name="search" class="ms-search-icon" />
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            class="ms-search"
            :placeholder="`Buscar ${label.toLowerCase()}…`"
            autocomplete="off"
            @keydown.escape="close"
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
            v-for="(opt, i) in filteredOptions"
            :key="opt"
            class="ms-option"
            :class="{ 'is-selected': selected.includes(opt), 'is-active': i === activeIdx }"
            role="option"
            :aria-selected="selected.includes(opt)"
            @mousedown.prevent="emit('toggle', opt)"
            @mousemove="activeIdx = i"
          >
            <span class="ms-checkbox" :class="{ 'is-checked': selected.includes(opt) }">
              <BaseIcon v-if="selected.includes(opt)" name="checkbox" />
            </span>
            <span class="ms-opt-label">{{ opt }}</span>
          </li>
          <li v-if="filteredOptions.length === 0" class="ms-empty">Nenhuma opção encontrada</li>
        </ul>

        <div v-if="selected.length > 0" class="ms-footer">
          <button class="ms-clear-all" @click.stop="emit('clear')">Limpar</button>
          <span class="ms-footer-count">{{ selected.length }} selecionado{{ selected.length > 1 ? 's' : '' }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  label: string
  options: string[]
  selected: string[]
}>()

const emit = defineEmits<{
  toggle: [value: string]
  clear: []
}>()

const wrapRef = ref<HTMLDivElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const isOpen = ref(false)
const query = ref('')
const activeIdx = ref(-1)

const filteredOptions = computed(() => {
  if (!query.value.trim()) return props.options
  const q = query.value.toLowerCase()
  return props.options.filter((o) => o.toLowerCase().includes(q))
})

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
  const max = filteredOptions.value.length - 1
  activeIdx.value = Math.max(0, Math.min(max, activeIdx.value + dir))
}

const selectActive = () => {
  const opt = filteredOptions.value[activeIdx.value]
  if (activeIdx.value >= 0 && opt) emit('toggle', opt)
}

watch(filteredOptions, () => {
  activeIdx.value = -1
})

const onClickOutside = (e: MouseEvent) => {
  if (wrapRef.value && !wrapRef.value.contains(e.target as Node)) close()
}
onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<style lang="scss" scoped>
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

  .has-value & {
    color: var(--color-action-default);
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
  min-width: 240px;
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
}

.ms-empty {
  padding: 20px 12px;
  font-size: 0.95rem;
  color: var(--color-text-subtle);
  text-align: center;
}

/* ── Footer ──────────────────────────────────── */
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
