<template>
  <aside class="back-top">
    <BaseIcon name="arrow-left" class="back-top-icon" @click="backTop" />
  </aside>
</template>

<script lang="ts" setup>
const backTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
</script>

<style lang="scss" scoped>
.back-top {
  $size: 3rem;

  position: fixed;
  right: 2rem;
  bottom: 1rem;
  z-index: 100;

  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  width: $size;
  height: $size;

  &-icon {
    width: inherit;
    height: inherit;

    color: var(--accent);
    cursor: pointer;

    transform: rotate(90deg);
  }
}
</style>
