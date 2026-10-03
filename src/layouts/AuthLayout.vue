<template>
  <div class="auth-frame">
    <header class="auth-frame__bar">
      <BrandLogo />
    </header>
    <main id="conteudo" class="auth-frame__main" tabindex="-1">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { provide } from 'vue'

import BrandLogo from '@/layouts/BrandLogo.vue'
import { FRAME_HAS_RAIL } from '@/layouts/frame'

provide(FRAME_HAS_RAIL, false)
</script>

<style lang="scss" scoped>
.auth-frame {
  display: flex;
  height: 100%;
  flex-direction: column;
  overflow-y: auto;
  background: var(--color-background-default);

  &__bar {
    display: flex;
    align-items: center;
    padding: var(--space-3) var(--space-8);
    background: var(--color-surface-default);
    border-bottom: 1px solid var(--color-border-default);

    @media (max-width: $bp-phone-max) {
      padding: var(--space-2) var(--space-4);
    }
  }

  &__main {
    display: flex;
    flex: 1;
    flex-direction: column;

    > :deep(*) {
      flex: 1;
    }

    &:focus {
      outline: none;
    }
  }
}
</style>
