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
    defaultOpen?: boolean
  }>(),
  {
    defaultOpen: true,
  },
)

const emit = defineEmits(['toggle'])

const open = ref(props.defaultOpen)

const toggle = () => {
  open.value = !open.value
}
</script>

<style lang="scss" scoped>
.filter {
  &-section {
    border-bottom: 1px solid var(--color-border-default);

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
  font-family: var(--font-family-body);
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
  cursor: pointer;
  text-align: left;
  transition: color var(--motion-transition-default);
  min-height: 44px;

  &:hover {
    color: var(--color-text-default);
  }
}

.count {
  font-size: 0.7rem;
  background: var(--color-action-default);
  color: var(--color-surface-default);
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 100px;
  letter-spacing: 0;
  text-transform: none;
}

.chevron {
  margin-left: auto;
  transition: transform var(--motion-transition-default);
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
  transition: background var(--motion-transition-default);
  user-select: none;
  min-height: 44px;

  &:hover {
    background: var(--color-background-subtle);
  }
  &.is-checked {
    background: var(--color-action-background-subtle);
  }

  input {
    display: none;
  }
}

.checkmark {
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--color-border-default);
  border-radius: 3px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--motion-transition-default);
  background: var(--color-surface-default);
}
.is-checked .checkmark {
  background: var(--color-action-default);
  border-color: var(--color-action-default);
  color: var(--color-surface-default);
}

.opt-label {
  font-size: 0.875rem;
  color: var(--color-text-default);
  line-height: 1.3;
}

/* Transition */
.section-enter-active,
.section-leave-active {
  transition: all var(--motion-transition-default);
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
