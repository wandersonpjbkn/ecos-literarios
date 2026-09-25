<template>
  <BasePill
    :as="to ? RouterLink : 'button'"
    :to="to"
    :type="to ? undefined : 'button'"
    :tone="selected ? 'soft' : 'quiet'"
    class="filter-chip"
    :class="{ 'is-selected': selected }"
    :aria-label="removable ? `Tirar o filtro ${label}` : undefined"
  >
    <span>{{ label }}</span>
    <span v-if="count !== undefined" class="filter-chip__count">{{ count }}</span>
    <BaseIcon v-if="removable" name="times" class="filter-chip__remove" aria-hidden="true" />
  </BasePill>
</template>

<script lang="ts" setup>
import { RouterLink, type RouteLocationRaw } from 'vue-router'

import BasePill from '@/components/BasePill.vue'

defineProps<{
  label: string
  to?: RouteLocationRaw
  count?: number
  selected?: boolean
  removable?: boolean
}>()
</script>

<style lang="scss" scoped>
.filter-chip {
  &__count {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-subtle);
  }
}
</style>
