<template>
  <div class="empty-state">
    <component :is="titleTag" ref="titleEl" class="empty-state__title" tabindex="-1">{{ title }}</component>
    <p v-if="text || $slots.text" class="empty-state__text"><slot name="text">{{ text }}</slot></p>
    <div v-if="$slots.default" class="empty-state__actions">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

withDefaults(
  defineProps<{
    // What happened ("Nada com "kafka""); `text` says where the system looked or what the list will hold.
    title: string
    text?: string
    // h1 when the empty state is the whole page (the 404), so the page still has its heading.
    titleTag?: 'p' | 'h1'
  }>(),
  { text: undefined, titleTag: 'p' },
)

// A message that replaces what the person acted on takes the focus, so a screen reader reads it (AuthCallback).
const titleEl = ref<HTMLElement | null>(null)
defineExpose({ focus: () => titleEl.value?.focus() })
</script>

<style lang="scss" scoped>
// EmptyState.md: no illustration, no red (an empty result is nobody's mistake), a centred 380px column.
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
