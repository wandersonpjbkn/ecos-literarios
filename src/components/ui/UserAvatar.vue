<template>
  <div class="avatar" :title="alt" aria-hidden="true">{{ initial }}</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  alt: string
}>()

const initial = computed(() => props.alt?.trim().charAt(0).toUpperCase() || '?')
</script>

<style lang="scss" scoped>
.avatar {
  display: inline-flex;
  width: var(--avatar-lg);
  height: var(--avatar-lg);
  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  font-size: var(--font-size-meta);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-ui);
  color: var(--color-text-secondary);

  background: var(--color-background-subtle);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-pill);
}
</style>
