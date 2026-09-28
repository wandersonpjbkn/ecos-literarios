<template>
  <p class="area-who">
    <span class="area-who__name">{{ auth.user?.name }}</span>
    <AppBadge><span class="visually-hidden">Seu nível: </span>{{ roleLabel(auth.user?.role ?? 'viewer') }}</AppBadge>
  </p>
</template>

<script lang="ts" setup>
import { roleLabel } from '@/data/roles'

import { useAuthStore } from '@/stores'

import AppBadge from '@/components/ui/AppBadge.vue'

const auth = useAuthStore()
</script>

<style lang="scss" scoped>
.area-who {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin: 0 0 var(--space-1);
  padding: 0 var(--space-3);

  &__name {
    font-size: var(--font-size-ui);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-default);
    overflow-wrap: anywhere;
  }
}
</style>
