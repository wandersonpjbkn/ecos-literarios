<template>
  <Head>
    <bodyAttrs :class="[useRoute().meta.pageClass, `page-${useRoute().name as string}`]" />
  </Head>
  <div class="app-wrapper">
    <!-- sidebar -->
    <AppSidebar
      :category-is-open="categorySidebar?.isOpen"
      :menu-is-open="menuSidebar?.isOpen"
      @toggle-categories="toggleCategories"
      @toggle-menu="toggleMenu"
    />

    <!-- header -->
    <AppHeader :menu-is-open="menuSidebar?.isOpen" @toggle-menu="toggleMenu" />

    <!-- content -->
    <main ref="content" class="app-main">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <aside id="sidebar" />

    <!-- Categories navigation sidebar -->
    <SideBar ref="categorySidebar" title="Categorias" :enter="`left:${isTablet ? '0' : '5rem'}`" :breakpoint="isTablet">
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
    <SideBar ref="menuSidebar" title="Preferências" :enter="isTablet ? 'right' : 'left:5rem'">
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
              <BaseIcon name="reload" class="icon" />
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

import { useApi, useTheme, useUtils, useAuth, useCategoryColors, useBreakpoints } from '@/composables'
import { useBooksStore } from '@/stores'
import AppHeader from '@/components/AppHeader.vue'

const AppSidebar = defineAsyncComponent(() => import('@/components/AppSidebar.vue'))
const MultiSelect = defineAsyncComponent(() => import('@/components/MultiSelect.vue'))
const SideBar = defineAsyncComponent(() => import('@/components/SideBar.vue'))
const BackTop = defineAsyncComponent(() => import('@/components/BackTop.vue'))

const route = useRoute()
const { themes, activeTheme, select } = useTheme()
const { restoreSession, watchSession } = useAuth()
const colors = useCategoryColors()
const { slugify } = useUtils()

const isTablet = useMediaQuery(useBreakpoints.isTablet)

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
.app-wrapper {
  display: grid;
  height: 100dvh;

  grid-template-rows: 4rem 1fr;
  grid-template-columns: auto 1fr;
  overflow: hidden;

  :deep(.app-sidebar) {
    grid-row: 1 / 3;
  }

  :deep(.app-header) {
    grid-column: 2 / 3;
  }

  @media (max-width: 767px) {
    grid-template-rows: 4rem 1fr auto;
    grid-template-columns: 1fr;

    :deep(.app-sidebar) {
      grid-row: 3 / 4;
    }

    :deep(.app-header) {
      grid-row: 1 / 2;
      grid-column: 1 / 2;
    }
  }
}

.app-main {
  width: auto;
  overflow-y: auto;
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

    .icon {
      margin-left: 0.5rem;
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
