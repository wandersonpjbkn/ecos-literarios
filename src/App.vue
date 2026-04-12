<template>
  <Head>
    <bodyAttrs :class="[useRoute().meta.pageClass, `page-${useRoute().name as string}`]" />
  </Head>
  <div class="app-wrapper">
    <header class="site-header">
      <nav class="header-inner">
        <RouterLink to="/" class="brand">
          <span class="brand-icon">📚</span>
        </RouterLink>

        <div class="header-content">
          <!-- content -->
        </div>

        <div class="header-actions">
          <button
            class="config-btn"
            type="button"
            :aria-expanded="menuSidebar?.isOpen"
            aria-label="Configurações"
            @click="toggleMenu"
          >
            <BaseIcon name="filter" class="config-btn__icon" aria-hidden="true" />
          </button>
        </div>
      </nav>
    </header>

    <main ref="content" class="site-main">
      <!-- user -->
      <div class="site-user">
        <div class="site-user--content">
          <RouterLink to="/" class="brand">
            <span class="brand-icon">📚</span>
            <div class="brand-text">
              <span class="brand-name">Ecos Literários</span>
              <span class="brand-sub">
                {{ isMobile ? 'Catálogo do clube' : 'Catálogo de livros do clube' }}
              </span>
            </div>
          </RouterLink>
          <div class="site-user--actions">
            <UserButton />
            <button
              v-if="isMobile"
              class="config-btn"
              type="button"
              :aria-expanded="menuSidebar?.isOpen"
              aria-label="Configurações"
              @click="toggleMenu"
            >
              <BaseIcon name="filter" class="config-btn__icon" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <!-- content -->
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <SideBar ref="menuSidebar" title="Preferências" :enter="isMobile ? 'right' : 'left'">
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
import { defineAsyncComponent, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { Head } from '@unhead/vue/components'
import { useMediaQuery } from '@vueuse/core'

import { useApi, useTheme, useUtils, useAuth } from '@/composables'
import UserButton from '@/components/UserButton.vue'
import BaseIcon from './components/BaseIcon.vue'

const BackTop = defineAsyncComponent(() => import('@/components/BackTop.vue'))
const MultiSelect = defineAsyncComponent(() => import('@/components/MultiSelect.vue'))
const SideBar = defineAsyncComponent(() => import('@/components/SideBar.vue'))

const route = useRoute()
const { themes, activeTheme, select } = useTheme()
const { restoreSession, watchSession } = useAuth()

const isMobile = useMediaQuery('(max-width: 767px)')

useHead({
  htmlAttrs: { lang: 'pt-BR' },
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const content = ref<HTMLElement | null>(null)
const menuSidebar = ref<InstanceType<typeof SideBar> | null>(null)

const themesOptions = themes.map((t) => ({
  value: t.value,
  label: `${t.emoji} ${t.label}`,
}))

const toggleMenu = () => menuSidebar.value?.toggle()

const forceRefresh = () => {
  useApi().fetchBooks(true)
  menuSidebar.value?.close()
  useUtils().sendGtmEvent({
    event: 'force_refresh',
    force_refresh_origin: route.fullPath,
  })
}

let stopWatchSession: (() => void) | null = null

onMounted(() => {
  restoreSession()
  stopWatchSession = watchSession()
})

onUnmounted(() => stopWatchSession?.())

watch(route, async () => {
  await nextTick()
  setTimeout(() => {
    if (content.value) content.value.scrollTo({ top: 0, behavior: 'smooth' })
  }, 350)
})
</script>

<style lang="scss" scoped>
.ml-2 {
  margin-left: 0.5rem;
}

.app-wrapper {
  display: grid;
  height: 100dvh;

  grid-template-rows: 1fr;
  grid-template-columns: auto 1fr;
  overflow: hidden;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
}

.site {
  &-header {
    position: relative;
    z-index: 60;

    width: fit-content;
    background: var(--color-header-bg, var(--color-text-default));
    border-bottom: 1px solid rgba(var(--color-surface-default-rgb), 0.08);

    @media (max-width: 767px) {
      display: none;
    }
  }

  &-main {
    width: auto;
    overflow-y: auto;
  }

  &-user {
    height: 4rem;
    background-color: var(--color-surface-default);
    border-bottom: 1px solid var(--color-border-default);

    transform: width var(--motion-transition-default);

    &--content {
      position: relative;
      margin: 0 auto;

      display: flex;
      max-width: 1200px;
      padding: 1rem;

      align-items: center;
      justify-content: space-between;
    }

    &--actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }
}

.header {
  &-inner,
  &-content,
  &-actions {
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  &-inner {
    height: 100%;
    padding: 2rem 1.5rem;
    gap: 4rem;
  }

  &-content {
    gap: 2rem;
  }

  &-actions {
    margin-top: auto;
  }
}

// ── Brand ─────────────────────────────────────────────────────────
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
    font-size: 1.25rem;
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
      weight: 500;
    }
    color: var(--color-text-default);
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

// ── Botão de configurações ────────────────────────────────────────
.config-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: none;
  border: 1px solid var(--color-action-text-subtle);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: opacity var(--motion-transition-default);

  &.is-expand {
    :deep(svg) {
      transform: rotate(-90deg);
    }
  }

  &:hover {
    opacity: 0.75;
  }

  &[aria-expanded='true'] {
    background: rgba(var(--color-surface-default-rgb), 0.08);
  }

  &__icon {
    width: 16px;
    height: 16px;
    color: var(--color-action-text-subtle);
  }
}

// ── Menu painel (SideBar body) ────────────────────────────────────
.menu-painel {
  display: grid;
  grid-template-rows: 1fr 1fr;
  row-gap: 2rem;

  &-card {
    p {
      margin-bottom: 0.15rem;
      font-size: 1rem;
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
