<template>
  <span class="app-badge" :class="`app-badge--${tone}`"><slot /></span>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{ tone?: 'tag' | 'alert' }>(), { tone: 'tag' })
</script>

<style lang="scss" scoped>
// A label, not a control: square corners and no border keep it from reading as a chip or a button.
.app-badge {
  display: inline-flex;
  align-items: center;
  padding: 0 var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-ui);
  white-space: nowrap;

  &--tag {
    background: var(--badge-tag-background-color);
    color: var(--badge-tag-text-color);
  }

  &--alert {
    background: var(--badge-alert-background-color);
    color: var(--badge-alert-text-color);
  }
}
</style>
