<template>
  <div class="empty-state">
    <component :is="titleTag" ref="titleEl" class="empty-state__title" tabindex="-1">{{ title }}</component>
    <p v-if="text || $slots.text" class="empty-state__text">
      <slot name="text">{{ text }}</slot>
    </p>
    <div v-if="$slots.default" class="empty-state__actions">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

withDefaults(
  defineProps<{
    title: string
    text?: string
    titleTag?: 'p' | 'h1'
  }>(),
  { text: undefined, titleTag: 'p' },
)

const titleEl = ref<HTMLElement | null>(null)
defineExpose({ focus: () => titleEl.value?.focus() })
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  max-width: var(--message-max);
  margin: 0 auto;
  padding: var(--space-14) var(--space-4);
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  text-align: center;

  &__title {
    margin: 0;
    font-family: var(--font-family-body);
    font-size: var(--font-size-section);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-default);
    overflow-wrap: anywhere;

    &:focus {
      outline: none;
    }
  }

  &__text {
    font-size: var(--font-size-ui);
    line-height: var(--line-height-text);
    color: var(--color-text-secondary);
    overflow-wrap: anywhere;

    strong {
      color: var(--color-text-default);
    }
  }

  &__actions {
    display: flex;
    margin-top: var(--space-3);
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-3);
  }
}
</style>
