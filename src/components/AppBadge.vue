<template>
  <span class="app-badge"><slot /></span>
</template>

<style lang="scss" scoped>
// A label, not a control: square corners and no border keep it from reading as a chip or a button.
.app-badge {
  display: inline-flex;
  align-items: center;
  padding: 0 var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--badge-tag-background-color);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-ui);
  color: var(--badge-tag-text-color);
  white-space: nowrap;
}
</style>
