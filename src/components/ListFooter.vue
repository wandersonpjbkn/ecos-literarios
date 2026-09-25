<template>
  <div class="list-footer">
    <p class="list-footer__count" aria-live="polite">
      <template v-if="shown < total">Você está vendo {{ shown }} de {{ total }}</template>
      <template v-else-if="total === 1">Este é o único</template>
      <template v-else>Estes são todos os {{ total }}</template>
    </p>

    <AppButton v-if="shown < total" class="list-footer__more" @click="emit('more')">Ver mais {{ nextBatch }}</AppButton>
  </div>
</template>

<script lang="ts" setup>
import AppButton from '@/components/AppButton.vue'

defineProps<{
  shown: number
  total: number
  nextBatch: number
}>()

const emit = defineEmits<{
  more: []
}>()
</script>

<style lang="scss" scoped>
.list-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-10) 0 var(--space-6);

  &__count {
    font-size: 0.875rem;
    color: var(--color-text-subtle);
  }

  &__more {
    width: 100%;

    @media (min-width: 768px) {
      width: auto;
    }
  }
}
</style>
