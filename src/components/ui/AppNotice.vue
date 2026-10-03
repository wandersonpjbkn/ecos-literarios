<template>
  <div class="app-notice" :role="live">
    <p class="app-notice__text">{{ text }}</p>
    <AppButton v-if="retry" size="md" @click="$emit('retry')">Tentar de novo</AppButton>
  </div>
</template>

<script lang="ts" setup>
import AppButton from '@/components/ui/AppButton.vue'

withDefaults(
  defineProps<{
    text: string
    retry?: boolean
    live?: 'alert' | 'status'
  }>(),
  { live: 'alert' },
)

defineEmits<{ retry: [] }>()
</script>

<style lang="scss" scoped>
.app-notice {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--alert-line);
  border-radius: var(--radius-lg);
  background: var(--alert-bg);
  color: var(--alert-ink);

  &__text {
    margin: 0;
    font-size: var(--font-size-ui);
  }
}
</style>
