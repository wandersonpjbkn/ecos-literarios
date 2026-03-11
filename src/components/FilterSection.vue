<template>
  <div class="filter-section" :class="{ 'is-collapsed': !open }">
    <button class="section-header" :aria-expanded="open" @click="toggle">
      <span>{{ title }}</span>
      <span v-if="selected.length > 0" class="count">{{ selected.length }}</span>
      <BaseIcon name="chevron" class="chevron" />
    </button>

    <Transition name="section">
      <div v-show="open" class="section-body">
        <label v-for="opt in options" :key="opt" class="option" :class="{ 'is-checked': selected.includes(opt) }">
          <input type="checkbox" :checked="selected.includes(opt)" @change="emit('toggle', opt)" />
          <span class="checkmark">
            <BaseIcon v-if="selected.includes(opt)" name="checkbox" />
          </span>
          <span class="opt-label">{{ opt }}</span>
        </label>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    options: string[]
    selected: string[]
    collapsible?: boolean
  }>(),
  {
    collapsible: false,
  },
)
const emit = defineEmits(['toggle'])

const open = ref(props.collapsible !== undefined ? props.collapsible : true)

const toggle = () => {
  open.value = !open.value
}
</script>

<style lang="scss" scoped>
.filter {
  &-section {
    border-bottom: 1px solid var(--border);

    &:last-child {
      border-bottom: none;
    }
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  font-family: var(--font-body);
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--muted);
  cursor: pointer;
  text-align: left;
  transition: color var(--transition);

  &:hover {
    color: var(--ink);
  }
}

.count {
  font-size: 0.7rem;
  background: var(--accent);
  color: var(--surface);
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 100px;
  letter-spacing: 0;
  text-transform: none;
}

.chevron {
  margin-left: auto;
  transition: transform var(--transition);
}
.is-collapsed .chevron {
  transform: rotate(-90deg);
}

.section-body {
  padding: 4px 0 12px;
}

.option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 16px;
  cursor: pointer;
  transition: background var(--transition);
  user-select: none;

  &:hover {
    background: var(--bg-subtle);
  }
  &.is-checked {
    background: var(--accent-soft);
  }

  input {
    display: none;
  }
}

.checkmark {
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--border);
  border-radius: 3px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);
  background: var(--surface);
}
.is-checked .checkmark {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--surface);
}

.opt-label {
  font-size: 0.875rem;
  color: var(--ink);
  line-height: 1.3;
}

/* Transition */
.section-enter-active,
.section-leave-active {
  transition: all var(--transition);
  overflow: hidden;
}
.section-enter-from,
.section-leave-to {
  opacity: 0;
  max-height: 0;
}
.section-enter-to,
.section-leave-from {
  max-height: 600px;
}
</style>
