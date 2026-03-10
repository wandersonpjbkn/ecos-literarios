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
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

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
    nextTick(() => inputRef.value?.focus())
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
.ms-control {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 12px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--transition);
  user-select: none;

  .is-open & {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  .has-value & {
    border-color: var(--accent-muted);
    background: var(--accent-soft);
  }
}

.ms-label {
  flex: 1;
  font-size: 0.875rem;
  font-family: var(--font-body);
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .has-value & {
    color: var(--accent);
    font-weight: 500;
  }
}

.ms-count {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  font-size: 0.68rem;
  font-weight: 700;
  flex-shrink: 0;
}

.ms-chevron {
  color: var(--muted);
  flex-shrink: 0;
  transition: transform var(--transition);

  .is-open & {
    transform: rotate(180deg);
    color: var(--accent);
  }
}

.ms-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  min-width: 220px;
  z-index: 300;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
}

.ms-search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  color: var(--muted);
  flex-shrink: 0;
}

.ms-search {
  flex: 1;
  border: none;
  outline: none;
  background: none;
  font-family: var(--font-body);
  font-size: 0.875rem;
  color: var(--ink);

  &::placeholder {
    color: var(--muted);
  }

  &-icon {
    $size: 13px;

    width: $size;
    height: $size;
  }
}

.ms-clear-query {
  display: flex;
  align-items: center;
  padding: 2px;
  border: none;
  background: none;
  border-radius: 3px;
  cursor: pointer;
  color: var(--muted);

  &:hover {
    color: var(--ink);
  }
}

.ms-list {
  list-style: none;
  overflow-y: auto;
  max-height: 220px;
  padding: 4px 0;
}

.ms-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background var(--transition);

  &:hover,
  &.is-active {
    background: var(--bg-subtle);
  }
  &.is-selected {
    background: var(--accent-soft);
  }
}

.ms-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--border-strong);
  border-radius: 3px;
  background: var(--surface);
  flex-shrink: 0;
  transition: all var(--transition);

  &.is-checked {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
  }
}

.ms-opt-label {
  font-size: 0.875rem;
  color: var(--ink);
  line-height: 1.3;
}

.ms-empty {
  padding: 16px 12px;
  font-size: 0.82rem;
  color: var(--muted);
  text-align: center;
}

.ms-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-top: 1px solid var(--border);
  background: var(--bg-subtle);
  flex-shrink: 0;
}

.ms-clear-all {
  padding: 2px 4px;
  border: none;
  border-radius: 3px;
  background: none;
  font-family: var(--font-body);
  font-size: 0.78rem;
  color: var(--accent);
  cursor: pointer;
  transition: background var(--transition);

  &:hover {
    background: var(--accent-soft);
  }
}

.ms-footer-count {
  font-size: 0.75rem;
  color: var(--muted);
}

.ms-dropdown-enter-active,
.ms-dropdown-leave-active {
  transition: all 150ms ease;
}
.ms-dropdown-enter-from,
.ms-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
