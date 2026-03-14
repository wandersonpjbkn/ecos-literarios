<template>
  <div class="app">
    <header class="site-header">
      <div class="header-inner">
        <RouterLink to="/" class="brand">
          <span class="brand-icon">📚</span>
          <div class="brand-text">
            <span class="brand-name">Ecos Literários</span>
            <span class="brand-sub">Catálogo do clube</span>
          </div>
        </RouterLink>
        <nav class="header-nav">
          <ThemeSwitcher />
        </nav>
      </div>
    </header>

    <main ref="content" class="site-main">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <BackTop :target="content" />
  </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'

import ThemeSwitcher from '@/components/ThemeSwitcher.vue'

const BackTop = defineAsyncComponent(() => import('@/components/BackTop.vue'))

const route = useRoute()
const content = ref<HTMLElement | null>(null)

watch(route, async () => {
  await nextTick()
  setTimeout(() => {
    if (content.value) {
      content.value.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, 350)
})

useHead({
  htmlAttrs: { lang: 'pt-BR' },
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})
</script>

<style lang="scss" scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
}

.site {
  &-header {
    position: relative;
    z-index: 100;
    flex-shrink: 0;
    height: 4rem;
    background: var(--color-header-bg, var(--color-text-default));
    border-bottom: 1px solid rgba(var(--color-surface-default-rgb), 0.08);
  }

  &-main {
    flex: 1;
    overflow-y: auto;
  }
}

.header {
  &-inner {
    margin: 0 auto;
    display: flex;
    max-width: 1200px;
    height: 64px;
    padding: 0 24px;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  &-nav {
    display: flex;
    gap: 8px;
  }
}

.brand {
  display: flex;

  color: var(--color-action-text-subtle);

  align-items: center;
  gap: 12px;
  transition: opacity var(--motion-transition-default);

  &:hover {
    opacity: 0.85;
  }

  &-icon {
    font-size: 1.5rem;
    line-height: 1;
  }

  &-text {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }

  &-name {
    font: {
      family: var(--font-family-display);
      size: 1.1rem;
      weight: 600;
    }
    color: var(--color-surface-default);
  }

  &-sub {
    font: {
      size: 0.7rem;
      weight: 500;
    }
    color: var(--color-action-text-subtle);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
}

.nav {
  &-link {
    padding: 6px 14px;
    border-radius: var(--border-radius-sm);

    font: {
      weight: 400;
      size: 0.9rem;
    }
    color: var(--color-text-subtle);

    transition: all var(--motion-transition-default);

    &:hover,
    &.router-link-active {
      color: var(--color-surface-default);
      background: rgba(var(--color-surface-default-rgb), 0.08);
    }
  }
}

/* Route transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--motion-transition-default);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
