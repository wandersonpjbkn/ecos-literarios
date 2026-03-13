<template>
  <div class="result-count" aria-live="polite" aria-atomic="true">
    <template v-if="showFiltered">
      <strong>{{ filtered }}</strong> de
    </template>
    {{ total }} {{ label }}
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    total: number
    filtered?: number
    activeFilters?: number
    label?: string
  }>(),
  {
    filtered: undefined,
    activeFilters: 0,
    label: 'títulos',
  },
)

const showFiltered = computed(() => {
  return props.activeFilters > 0 && typeof props.filtered === 'number'
})
</script>

<style lang="scss" scoped>
.result-count {
  flex-shrink: 0;
  font-size: 0.9rem;
  color: var(--color-text-subtle);
  white-space: nowrap;

  strong {
    color: var(--color-action-default);
  }
}

@media (max-width: 767px) {
  .result-count {
    order: -1;
    width: 100%;
  }
}
</style>
