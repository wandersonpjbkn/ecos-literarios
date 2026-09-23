<template>
  <div class="list-footer">
    <p class="list-footer__count" aria-live="polite">
      <template v-if="shown < total">Você está vendo {{ shown }} de {{ total }}</template>
      <template v-else>Estes são todos os {{ total }}</template>
    </p>

    <button v-if="shown < total" class="list-footer__more" type="button" @click="emit('more')">
      Ver mais {{ nextBatch }}
    </button>
  </div>
</template>

<script lang="ts" setup>
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
    min-height: var(--touch-cta);
    padding: 0 var(--space-6);

    font: {
      family: var(--font-family-body);
      size: 0.9375rem;
      weight: 600;
    }
    color: var(--color-text-default);

    background: var(--color-surface-default);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: border-color var(--motion-transition-default);

    &:hover {
      border-color: var(--color-action-default);
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: var(--space-1);
    }

    @media (min-width: 768px) {
      width: auto;
    }
  }
}
</style>
