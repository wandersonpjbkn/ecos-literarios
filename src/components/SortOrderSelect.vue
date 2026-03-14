<template>
  <select class="sort-order__select" :value="modelValue" aria-label="Ordenar títulos" @change="onChange">
    <option value="asc">A → Z</option>
    <option value="desc">Z → A</option>
  </select>
</template>

<script lang="ts" setup>
import type { BookSortOrder } from '@/types'

defineProps<{
  modelValue: BookSortOrder
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: BookSortOrder): void
}>()

const onChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value as BookSortOrder)
}
</script>

<style lang="scss" scoped>
.sort-order__select {
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  background: var(--color-surface-default);
  color: var(--color-text-default);
  font: inherit;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }
}
</style>
