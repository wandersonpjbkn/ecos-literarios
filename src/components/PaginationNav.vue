<template>
  <div v-if="totalPages > 1" class="pagination-nav">
    <button class="page-btn" :disabled="currentPage <= 1" @click="currentPage--">
      <BaseIcon name="arrow-left" />
    </button>
    <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
    <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
      <BaseIcon name="arrow-right" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    items: unknown[]
    perPage?: number
  }>(),
  {
    perPage: 20,
  },
)

const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(props.items.length / props.perPage))

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * props.perPage
  return props.items.slice(start, start + props.perPage)
})

const resetPage = () => {
  currentPage.value = 1
}

defineExpose({ currentPage, totalPages, paginatedItems, resetPage })
</script>

<style lang="scss" scoped>
.pagination-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--color-border-default);

  @media (max-width: 767px) {
    gap: 0.75rem;
  }
}

.page-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-sm);
  background: var(--color-surface-default);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-default);
  transition: background var(--motion-transition-default);

  &:hover:not(:disabled) {
    background: var(--color-background-subtle);
  }
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  svg {
    width: 14px;
    height: 14px;
  }
}

.page-info {
  font-size: 0.82rem;
  color: var(--color-text-subtle);
}
</style>
