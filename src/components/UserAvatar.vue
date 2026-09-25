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
// Neutral circle with one initial (Main): the name, not a color, identifies the person.
.avatar {
  display: inline-flex;
  width: 40px;
  height: 40px;
  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1;
  color: var(--color-text-secondary);

  background: var(--color-background-subtle);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-pill);
}
</style>
