<template>
  <Head>
    <bodyAttrs :class="[useRoute().meta.pageClass, `page-${useRoute().name as string}`]" />
  </Head>
  <div class="app-wrapper">
    <header class="site-header">
      <nav class="header-inner">
        <div class="header-content">
          <RouterLink :to="{ name: 'catalog-books' }" class="config-btn" aria-label="Catálogo">
            <BaseIcon name="home" class="config-btn__icon" aria-hidden="true" />
          </RouterLink>
          <button
            class="config-btn"
            type="button"
            :aria-expanded="categorySidebar?.isOpen"
            aria-label="Categorias"
            @click="toggleCategories"
          >
            <BaseIcon name="menu" class="config-btn__icon" aria-hidden="true" />
          </button>
          <RouterLink
            v-if="storeAuth.isEditor"
            :to="{ name: 'admin-books' }"
            class="config-btn"
            aria-label="Cadastrar livro"
          >
            <BaseIcon name="plus" class="config-btn__icon" aria-hidden="true" />
          </RouterLink>
        </div>

        <div class="header-actions">
          <RouterLink
            v-if="storeAuth.isLoggedIn"
            :to="{ name: 'profile-account' }"
            class="config-btn"
            aria-label="Meu perfil"
          >
            <BaseIcon name="user" class="config-btn__icon" aria-hidden="true" />
          </RouterLink>

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
          <RouterLink :to="{ name: 'catalog-books' }" class="brand">
            <span class="brand-icon">📚</span>
            <div class="brand-text">
              <span class="brand-name">Ecos Literários</span>
              <span class="brand-sub">
                {{ isMobile ? 'Catálogo do clube' : 'Catálogo de livros do clube' }}
              </span>
            </div>
          </RouterLink>
          <div class="site-user--actions">
            <UserMenu />
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

    <aside id="sidebar" />

    <!-- Categories navigation sidebar -->
    <SideBar ref="categorySidebar" title="Categorias" :enter="isMobile ? 'right' : 'left'">
      <template #body>
        <nav class="category-nav" aria-label="Navegação por categoria">
          <RouterLink
            v-for="cat in categoryLinks"
            :key="cat.slug"
            :to="{ name: 'catalog-category', params: { slug: cat.slug } }"
            class="category-nav__item"
            :class="{ 'is-active': isCategoryActive(cat.slug) }"
            @click="categorySidebar?.close()"
          >
            <span class="category-nav__dot" :style="{ background: cat.color }" />
            <span class="category-nav__label">{{ cat.name }}</span>
            <span class="category-nav__count">{{ cat.count }}</span>
          </RouterLink>

          <p v-if="categoryLinks.length === 0" class="category-nav__empty">Carregando categorias…</p>
        </nav>
      </template>
    </SideBar>

    <!-- Preferences sidebar -->
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
import { defineAsyncComponent, ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { Head } from '@unhead/vue/components'
import { useMediaQuery } from '@vueuse/core'

import { useApi, useTheme, useUtils, useAuth, useCategoryColors } from '@/composables'
import { useBooksStore } from '@/stores'
import UserMenu from '@/components/UserMenu.vue'
import BaseIcon from '@/components/BaseIcon.vue'

const BackTop = defineAsyncComponent(() => import('@/components/BackTop.vue'))
const MultiSelect = defineAsyncComponent(() => import('@/components/MultiSelect.vue'))
const SideBar = defineAsyncComponent(() => import('@/components/SideBar.vue'))

const route = useRoute()
const { themes, activeTheme, select } = useTheme()
const { store: storeAuth, restoreSession, watchSession } = useAuth()
const colors = useCategoryColors()
const { slugify } = useUtils()

const isMobile = useMediaQuery('(max-width: 767px)')

useHead({
  htmlAttrs: { lang: 'pt-BR' },
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const content = ref<HTMLElement | null>(null)
const menuSidebar = ref<InstanceType<typeof SideBar> | null>(null)
const categorySidebar = ref<InstanceType<typeof SideBar> | null>(null)

const themesOptions = themes.map((t) => ({
  value: t.value,
  label: `${t.emoji} ${t.label}`,
}))

const toggleMenu = () => menuSidebar.value?.toggle()
const toggleCategories = () => categorySidebar.value?.toggle()

// ── Category links derived from loaded books ──────────────────────
const categoryLinks = computed(() => {
  const books = useBooksStore().books
  const countMap = new Map<string, number>()

  for (const book of books) {
    if (!book.categoria) continue
    countMap.set(book.categoria, (countMap.get(book.categoria) ?? 0) + 1)
  }

  return [...countMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
    .map(([name, count]) => ({
      name,
      slug: slugify(name),
      color: colors.categoryColor(name),
      count,
    }))
})

const isCategoryActive = (slug: string): boolean => route.name === 'catalog-category' && route.params.slug === slug

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

    &--content {
      position: relative;
      margin: 0 auto;

      display: flex;
      max-width: 1200px;
      padding: 0.75rem;

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
    padding: 5.25rem 1.25rem;
  }

  &-content,
  &-actions {
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
    color: var(--color-action-default);
  }

  &-sub {
    font: {
      size: 0.7rem;
      weight: 500;
    }
    color: var(--color-text-subtle);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
}

// ── Botão de configurações ────────────────────────────────────────
.config-btn {
  --icon-size: 65%;
  --btn-size: 2.5rem;

  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--btn-size);
  height: var(--btn-size);
  padding: 0;
  background: rgba($color: #fff, $alpha: 0);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: background-color var(--motion-transition-default);
  color: var(--color-surface-default);
  text-decoration: none;

  &:hover {
    background-color: rgba($color: #fff, $alpha: 0.15);
  }

  &__icon {
    width: var(--icon-size);
    height: var(--icon-size);
  }

  @media (max-width: 767px) {
    --icon-size: 50%;
    background: var(--color-action-default);
  }
}

// ── Category navigation (SideBar body) ────────────────────────────
.category-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;

  &__item {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 10px 12px;
    border-radius: var(--border-radius-default);
    text-decoration: none;
    font-size: 0.9rem;
    color: var(--color-text-default);
    transition:
      background var(--motion-transition-default),
      color var(--motion-transition-default);

    &:hover {
      background: var(--color-background-subtle);
    }

    &.is-active {
      background: var(--color-action-background-subtle);
      color: var(--color-action-default);
      font-weight: 500;
    }
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    flex-shrink: 0;
  }

  &__label {
    flex: 1;
    text-transform: capitalize;
  }

  &__count {
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    border-radius: 999px;
    background: var(--color-background-subtle);
    color: var(--color-text-subtle);
    font-size: 0.72rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;

    .is-active & {
      background: var(--color-action-default);
      color: #fff;
    }
  }

  &__empty {
    padding: 1rem;
    font-size: 0.9rem;
    color: var(--color-text-subtle);
    text-align: center;
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
