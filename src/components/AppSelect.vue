<template>
  <div ref="root" class="app-select" @focusout="onFocusOut">
    <span :id="`${id}-label`" class="visually-hidden">{{ label }}</span>

    <BasePill
      ref="trigger"
      as="button"
      type="button"
      tone="neutral"
      class="app-select__trigger"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-labelledby="`${id}-label ${id}-value`"
      @click="isOpen ? close() : open()"
      @keydown="onTriggerKeydown"
    >
      <span :id="`${id}-value`">{{ current?.label }}</span>
      <BaseIcon name="chevron" class="app-select__chevron" :class="{ 'is-open': isOpen }" aria-hidden="true" />
    </BasePill>

    <ul
      v-if="isOpen"
      ref="list"
      role="listbox"
      tabindex="-1"
      class="app-select__list"
      :aria-labelledby="`${id}-label`"
      :aria-activedescendant="`${id}-option-${activeIndex}`"
      @keydown="onListKeydown"
    >
      <li
        v-for="(option, index) in options"
        :id="`${id}-option-${index}`"
        :key="option.value"
        role="option"
        class="app-select__option"
        :class="{ 'is-active': index === activeIndex }"
        :aria-selected="option.value === model"
        @click="choose(option.value)"
        @mouseenter="activeIndex = index"
      >
        <BaseIcon
          name="check"
          class="app-select__check"
          :class="{ 'is-on': option.value === model }"
          aria-hidden="true"
        />
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup generic="T extends string">
import { computed, nextTick, ref, useId } from 'vue'

import BasePill from '@/components/BasePill.vue'

const props = defineProps<{
  options: { label: string; value: T }[]
  label: string
}>()

const model = defineModel<T>({ required: true })

const id = useId()
const root = ref<HTMLElement | null>(null)
const trigger = ref<InstanceType<typeof BasePill> | null>(null)
const list = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const activeIndex = ref(0)

const current = computed(() => props.options.find((option) => option.value === model.value))

const triggerElement = () => (trigger.value?.$el as HTMLElement | undefined) ?? null

const open = async () => {
  activeIndex.value = Math.max(
    0,
    props.options.findIndex((option) => option.value === model.value),
  )
  isOpen.value = true
  await nextTick()
  list.value?.focus()
}

const close = (refocus = false) => {
  isOpen.value = false
  if (refocus) triggerElement()?.focus()
}

const choose = (value: T) => {
  model.value = value
  close(true)
}

const move = async (index: number) => {
  activeIndex.value = Math.min(props.options.length - 1, Math.max(0, index))
  await nextTick()
  list.value?.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' })
}

const onTriggerKeydown = (event: KeyboardEvent) => {
  if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
    event.preventDefault()
    open()
  }
}

const onListKeydown = (event: KeyboardEvent) => {
  const option = props.options[activeIndex.value]
  if (event.key === 'ArrowDown') move(activeIndex.value + 1)
  else if (event.key === 'ArrowUp') move(activeIndex.value - 1)
  else if (event.key === 'Home') move(0)
  else if (event.key === 'End') move(props.options.length - 1)
  else if ((event.key === 'Enter' || event.key === ' ') && option) choose(option.value)
  else if (event.key === 'Escape') {
    // Only the list closes; a drawer or page listening on the document must not react.
    event.stopPropagation()
    close(true)
  } else if (event.key === 'Tab') close()
  else if (event.key.length === 1) {
    // Type-ahead: jump to the next option starting with the typed letter.
    const letter = event.key.toLowerCase()
    const next = props.options.findIndex((o, i) => i > activeIndex.value && o.label.toLowerCase().startsWith(letter))
    const first = props.options.findIndex((o) => o.label.toLowerCase().startsWith(letter))
    if (next >= 0 || first >= 0) move(next >= 0 ? next : first)
    return
  } else return
  event.preventDefault()
}

const onFocusOut = (event: FocusEvent) => {
  if (!root.value?.contains(event.relatedTarget as Node | null)) close()
}
</script>

<style lang="scss" scoped>
.app-select {
  position: relative;
  display: inline-flex;

  &__trigger {
    gap: var(--space-3);
  }

  &__chevron {
    color: var(--color-text-subtle);
    transition: transform var(--motion-transition-default);

    &.is-open {
      transform: rotate(180deg);
    }
  }

  &__list {
    position: absolute;
    top: calc(100% + var(--space-1));
    right: 0;
    z-index: 30;

    min-width: 100%;
    padding: var(--space-1);
    list-style: none;

    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    outline: none;

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: calc(var(--space-1) / 2);
    }
  }

  &__option {
    display: flex;
    min-height: var(--touch-min);
    padding: 0 var(--space-3);

    align-items: center;
    gap: var(--space-3);

    font-size: 0.9375rem;
    white-space: nowrap;
    border-radius: var(--radius-md);
    cursor: pointer;

    &.is-active {
      background: var(--color-background-subtle);
    }

    &[aria-selected='true'] {
      font-weight: 600;
      color: var(--color-action-default-hover);
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
}
</style>
