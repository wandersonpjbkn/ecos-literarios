<template>
  <div class="app">
    <header :class="['site-header', { 'header-active': isScrolled }]">
      <div class="header-inner">
        <RouterLink to="/" class="brand">
          <span class="brand-icon">📚</span>
          <div class="brand-text">
            <span class="brand-name">Ecos Literários</span>
            <span class="brand-sub">Catálogo do clube</span>
          </div>
        </RouterLink>
        <nav class="header-nav">
          <RouterLink to="/" class="nav-link">Catálogo</RouterLink>
        </nav>
      </div>
    </header>

    <main
      ref="content"
      :class="[
        'site-main',
        {
          'scroll-active': isScrolled && toHideFrom.includes(route.name as string),
        },
      ]"
      @scroll="handleHeaderVisibility"
    >
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" @top="toTop" />
        </Transition>
      </RouterView>
    </main>

    <BackTop :target="content" />
  </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, ref, provide, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const BackTop = defineAsyncComponent(() => import('@/components/BackTop.vue'))

const route = useRoute()

const content = ref<HTMLElement | null>(null)
const isScrolled = ref(false)

const toHideFrom = ['catalog']
const threshold = 16 * 13 // rem

const handleHeaderVisibility = (e: Event | HTMLElement | null) => {
  if (!e) return

  const target = e instanceof HTMLElement ? e : (e.target as HTMLElement)
  const child = target.children[0] as HTMLElement

  if (toHideFrom.includes(child?.dataset?.page as string)) {
    isScrolled.value = target.scrollTop > threshold
  } else {
    isScrolled.value = true
  }
}

const toTop = () => {
  if (content.value) {
    content.value.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

provide('isScrolled', isScrolled)

watch(route, async () => {
  await nextTick()

  setTimeout(() => {
    toTop()
    handleHeaderVisibility(content.value)
  }, 350) // transition delay
})
</script>

<style lang="scss" scoped>
.app {
  position: relative;

  height: 100dvh;
  overflow: hidden;
}

.site {
  &-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;

    height: 4rem;
    background: var(--ink);
    border-bottom: 1px solid rgba(var(--surface-rgb), 0.078);
    opacity: 0;

    backdrop-filter: blur(8px);
    transform: translateY(-100%);
    pointer-events: none;
    transition: all var(--transition);

    &.header-active {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
  }

  /* ── Main ────────────────────────────────────── */
  &-main {
    position: relative;

    height: 100dvh;
    overflow-y: auto;

    transition: padding var(--transition);

    &.scroll-active {
      padding-top: 12rem;
    }
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

  color: var(--accent-muted);

  align-items: center;
  gap: 12px;
  transition: opacity var(--transition);

  align-items: center;
  gap: 12px;
  transition: opacity var(--transition);
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
      family: var(--font-display);
      size: 1.1rem;
      weight: 600;
    }
    color: var(--surface);
  }

  &-sub {
    font: {
      size: 0.7rem;
      weight: 500;
    }
    color: var(--accent-muted);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
}

.nav {
  &-link {
    padding: 6px 14px;
    border-radius: var(--radius-sm);

    font: {
      weight: 400;
      size: 0.9rem;
    }
    color: var(--muted);

    transition: all var(--transition);

    &:hover,
    &.router-link-active {
      color: var(--surface);
      background: rgba(var(--surface-rgb), 0.078);
    }
  }
}
</style>
