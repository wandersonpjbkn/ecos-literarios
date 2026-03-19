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
        <nav :class="['header-nav', { open: menuSidebar?.isOpen }]">
          <button type="button" @click="toggleMenu">
            {{ menuSidebar?.isOpen ? 'Fechar' : 'Menu' }}
            <BaseIcon :name="menuSidebar?.isOpen ? 'times' : 'menu'" class="icon" />
          </button>
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

    <SideBar ref="menuSidebar" title="Configurações">
      <template #body>
        <div class="menu-painel">
          <div class="menu-painel-card">
            <p>Tema</p>
            <MultiSelect
              label="Tema"
              :multiple="false"
              :searchable="false"
              :options="themesOptions"
              :selected="activeTheme"
              @toggle="(value) => select(value)"
            />
          </div>

          <div class="menu-painel-card">
            <p>Cache</p>
            <button class="btn" type="button" @click="forceRefresh">
              Recarregar
              <BaseIcon name="reload" class="icon ml-2" />
            </button>
          </div>
        </div>
      </template>
    </SideBar>

    <BackTop :target="content" />
  </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'

import { useSheets, useTheme } from './composables'

const BackTop = defineAsyncComponent(() => import('@/components/BackTop.vue'))
const MultiSelect = defineAsyncComponent(() => import('@/components/MultiSelect.vue'))
const SideBar = defineAsyncComponent(() => import('@/components/SideBar.vue'))

const route = useRoute()
const { themes, activeTheme, select } = useTheme()

const content = ref<HTMLElement | null>(null)
const menuSidebar = ref<InstanceType<typeof SideBar> | null>(null)

const themesOptions = themes.map((t) => ({
  value: t.value,
  label: `${t.emoji}
  ${t.label}`,
}))

const toggleMenu = () => {
  menuSidebar.value?.toggle()
}

const forceRefresh = () => {
  useSheets().fetchBooks(true)
  menuSidebar.value?.close()
}

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
.ml-2 {
  margin-left: 0.5rem;
}

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
    padding: 0 1rem;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  &-nav {
    position: relative;
    right: 0;

    display: flex;
    gap: 8px;

    transition: all var(--motion-transition-default);

    &.open {
      @media (min-width: 768px) {
        right: calc(-95px + 1rem);
      }
    }

    button {
      display: flex;
      width: fit-content;
      height: 34px;
      padding: 01rem;
      background: none;
      border: 1px solid var(--color-action-text-subtle);

      font: {
        size: 0.8rem;
        weight: 400;
      }
      color: var(--color-action-text-subtle);
      letter-spacing: 0.06em;
      text-transform: uppercase;

      cursor: pointer;
      align-items: center;
      justify-content: center;
    }

    .icon {
      margin-top: 0.06rem;
      margin-left: 4px;
    }
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

.menu-painel {
  display: grid;
  grid-template-rows: 1fr 1fr;
  row-gap: 2rem;

  &-card {
    p {
      margin-bottom: 0.15rem;

      font: {
        size: 1rem;
      }
      color: var(--color-text-default);
    }
  }

  .btn {
    display: flex;
    min-height: 44px;
    border: none;
    padding: 10px 20px;
    border-radius: var(--border-radius-sm);
    background: var(--color-background-subtle);
    border: 1px solid var(--color-border-default);

    font-family: var(--font-family-body);
    font-size: 1rem;
    color: var(--color-text-default);

    align-items: center;
    justify-content: center;
    transition: opacity var(--motion-transition-default);
    cursor: pointer;
    grid-column-start: 2;

    &:hover {
      background: var(--color-background-default);
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
