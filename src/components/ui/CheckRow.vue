<template>
  <label class="check-row" :class="[$attrs.class, { 'is-disabled': disabled }]" :style="$attrs.style as StyleValue">
    <AppCheck v-bind="inputAttrs" :type="type" :checked="checked" :disabled="disabled" />
    <span class="check-row__text">
      <span class="check-row__label">{{ label }}</span>
      <span v-if="detail" class="check-row__detail">{{ detail }}</span>
    </span>
    <span v-if="count !== undefined" class="check-row__count">{{ count }}</span>
  </label>
</template>

<script lang="ts" setup>
import { computed, useAttrs, type StyleValue } from 'vue'

import AppCheck from '@/components/ui/AppCheck.vue'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

withDefaults(
  defineProps<{
    label: string
    checked: boolean
    type?: 'checkbox' | 'radio'
    disabled?: boolean
    detail?: string
    count?: string | number
  }>(),
  { type: 'checkbox', disabled: false, detail: undefined, count: undefined },
)

const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})
</script>

<style lang="scss" scoped>
.check-row {
  display: flex;
  min-height: var(--touch-min);
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;

  &__text {
    display: flex;
    flex: 1;
    min-width: 0;
    flex-direction: column;
  }

  &__label {
    font-size: var(--font-size-ui);
    color: var(--color-text-default);
  }

  &__detail {
    overflow: hidden;
    font-size: var(--font-size-caption);
    color: var(--color-text-subtle);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__count {
    font-size: var(--font-size-meta);
    color: var(--color-text-subtle);
  }

  &.is-disabled {
    cursor: not-allowed;

    .check-row__label {
      color: var(--color-text-subtle);
    }
  }
}
</style>
