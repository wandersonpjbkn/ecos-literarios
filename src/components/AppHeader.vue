<template>
  <div class="app-header">
    <div class="app-header--inner">
      <BrandLogo />
      <UserMenu />
    </div>
  </div>
</template>

<script lang="ts" setup>
import BrandLogo from '@/components/BrandLogo.vue'
import UserMenu from '@/components/UserMenu.vue'
</script>

<style lang="scss" scoped>
@use '@/assets/scss/components/config-btn';

.app-header {
  position: relative;

  height: 4rem;
  background-color: var(--color-surface-default);
  border-bottom: 1px solid var(--color-border-default);

  &--inner {
    margin: 0 auto;

    display: flex;
    max-width: 1200px;
    padding: 0.75rem 1rem;

    align-items: center;
    justify-content: space-between;
  }

  @media (max-width: 767px) {
    height: 3rem;

    &--inner {
      padding: 0.5rem 1rem;
    }
  }
}
</style>
