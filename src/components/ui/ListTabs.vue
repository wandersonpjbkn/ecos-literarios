<template>
  <div class="list-tabs">
    <div class="list-tabs__bar" role="tablist" :aria-label="label" @keydown="onKeydown">
      <button
        v-for="tab in tabs"
        :id="tabId(tab.key)"
        :key="tab.key"
        type="button"
        class="list-tabs__btn"
        :class="{ 'is-active': active === tab.key }"
        role="tab"
        :aria-selected="active === tab.key"
        :aria-controls="panelId"
        :tabindex="active === tab.key ? 0 : -1"
        @click="emit('select', tab.key)"
      >
        {{ tab.label }}
        <span v-if="tab.count !== undefined" class="list-tabs__count">{{ tab.count }}</span>
      </button>
    </div>

    <div :id="panelId" role="tabpanel" :aria-labelledby="tabId(active)">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, useId, watch } from 'vue'

export type ListTab = { key: string; label: string; count?: number }

const props = defineProps<{
  tabs: ListTab[]
  active: string
  label: string
}>()

const emit = defineEmits<{ select: [key: string] }>()

const id = useId()
const panelId = `${id}-panel`
const tabId = (key: string) => `${id}-tab-${key}`

// The parent moves `active` (often through the URL); focus waits for it, or it lands on the tab being left.
let focusWhenActive: string | null = null
watch(
  () => props.active,
  async (key) => {
    if (key !== focusWhenActive) return
    focusWhenActive = null
    await nextTick()
    document.getElementById(tabId(key))?.focus()
  },
)

// Tab pattern: arrows move between tabs, Home and End jump to the ends; Tab itself goes into the panel.
const onKeydown = (event: KeyboardEvent) => {
  const index = props.tabs.findIndex((tab) => tab.key === props.active)
  const last = props.tabs.length - 1
  const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: last }[event.key]
  if (next === undefined) return
  event.preventDefault()
  const key = props.tabs[(next + props.tabs.length) % props.tabs.length]!.key
  focusWhenActive = key
  emit('select', key)
}
</script>

<style lang="scss" scoped>
.list-tabs__bar {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  // Inset line, not a border: the active tab's underline covers it even when the strip scrolls (phone).
  box-shadow: inset 0 -1px 0 var(--color-border-default);

  @media (max-width: $bp-phone-max) {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}

// Tabs switch the list, so they are not pills: the pill is a filter (FilterChip.md).
.list-tabs__btn {
  min-height: var(--touch-cta);
  padding: 0 var(--space-4);
  border: none;
  border-bottom: 2px solid transparent;
  background: none;
  font-family: var(--font-family-body);
  font-size: var(--font-size-ui);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition:
    color var(--motion-transition-default),
    border-color var(--motion-transition-default);

  @media (max-width: $bp-phone-max) {
    flex-shrink: 0;
    white-space: nowrap;
  }

  &:hover {
    color: var(--color-text-default);
    border-bottom-color: var(--color-border-strong);
  }

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: var(--focus-offset-inset);
  }

  &.is-active {
    border-bottom-color: var(--color-action-default);
    color: var(--color-action-default-hover);
    font-weight: var(--font-weight-semibold);
  }
}

.list-tabs__count {
  margin-left: var(--space-1);
  font-weight: var(--font-weight-regular);
  color: var(--color-text-subtle);
}
</style>
