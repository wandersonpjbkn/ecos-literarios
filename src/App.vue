<template>
  <div class="app">
    <!-- Sidebar vertical de ícones (desktop only) -->
    <AppSidebar @settings="toggleSettings" @indicate="openIndicate" />

    <!-- Área principal: header + conteúdo -->
    <div class="app__main-area">
      <!-- Header global com search + filtros + usuário -->
      <AppHeader
        v-model:search="search"
        :suggestions="searchSuggestions"
        :active-filters="activeFilters"
        :active-filter-count="activeFilterCount"
        :show-filters-button="showFiltersButton"
        @select="onSelectSuggestion"
        @open-filters="openFilters"
        @remove-filter="removeFilter"
        @clear-filters="clearFilters"
      />

      <!-- Layout: FilterPanel contextual (desktop) + view -->
      <div class="app__content-area">
        <!-- FilterPanel sidebar contextual — empurra o grid no desktop -->
        <FilterPanel
          v-if="!isMobile && showFiltersButton"
          :show="filtersOpen"
          :contextual="true"
          :options="filterOptions"
          :selected="activeFilters"
          :active-count="activeFilterCount"
          @update:show="filtersOpen = $event"
          @toggle="toggleFilter"
          @clear="clearFilters"
        />

        <main ref="content" class="app__view">
          <RouterView v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </main>
      </div>
    </div>

    <!-- Bottom navigation (mobile only) -->
    <BottomNav @indicate="openIndicate" />

    <!-- FilterSheet bottom sheet (mobile only) -->
    <FilterSheet
      v-if="isMobile"
      v-model="filtersOpen"
      :options="filterOptions"
      :selected="activeFilters"
      :active-count="activeFilterCount"
      @toggle="toggleFilter"
      @clear="clearFilters"
    />

    <!-- Settings sidebar (tema + cache) -->
    <SideBar ref="settingsSidebar" title="Configurações">
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
import { useMediaQuery } from '@vueuse/core'
import { useHead } from '@unhead/vue'

import { useApi, useTheme, useUtils, useAuth, useFilters } from '@/composables'

import AppSidebar from '@/components/AppSidebar.vue'
import AppHeader from '@/components/AppHeader.vue'
import BottomNav from '@/components/BottomNav.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import FilterSheet from '@/components/FilterSheet.vue'

const BackTop = defineAsyncComponent(() => import('@/components/BackTop.vue'))
const MultiSelect = defineAsyncComponent(() => import('@/components/MultiSelect.vue'))
const SideBar = defineAsyncComponent(() => import('@/components/SideBar.vue'))

// ── Rota e breakpoint ────────────────────────
const route = useRoute()
const isMobile = useMediaQuery('(max-width: 767px)')

// ── Auth ─────────────────────────────────────
const { restoreSession, watchSession } = useAuth()

// ── Tema ─────────────────────────────────────
const { themes, activeTheme, select } = useTheme()
const themesOptions = themes.map((t) => ({
  value: t.value,
  label: `${t.emoji} ${t.label}`,
}))

// ── Filtros globais ───────────────────────────
// Botão só aparece em rotas com catálogo
const FILTER_ROUTES = ['catalog']
const showFiltersButton = computed(() => FILTER_ROUTES.includes(String(route.name)))
const filtersOpen = ref(false)

const {
  search,
  selectedMidia,
  selectedCategoria,
  selectedSubgeneros,
  selectedQuem,
  optionsMidia,
  optionsCategoria,
  optionsSubgeneros,
  optionsQuem,
  activeFilterCount,
  clearAll,
  searchSuggestions,
} = useFilters()

const filterOptions = computed(() => ({
  midia: optionsMidia.value,
  categoria: optionsCategoria.value,
  subgeneros: optionsSubgeneros.value,
  quem: optionsQuem.value,
}))

const activeFilters = computed(() => ({
  midia: selectedMidia.value,
  categoria: selectedCategoria.value,
  subgeneros: selectedSubgeneros.value,
  quem: selectedQuem.value,
}))

const toggleFilter = (key: string, value: string) => {
  const map: Record<string, typeof selectedMidia> = {
    midia: selectedMidia,
    categoria: selectedCategoria,
    subgeneros: selectedSubgeneros,
    quem: selectedQuem,
  }
  const arr = map[key]
  if (!arr) return
  const idx = arr.value.indexOf(value)
  if (idx === -1) arr.value.push(value)
  else arr.value.splice(idx, 1)
}

const removeFilter = (key: string, value: string) => toggleFilter(key, value)
const clearFilters = () => clearAll()
const openFilters = () => {
  filtersOpen.value = true
}

const onSelectSuggestion = (book: { titulo: string }) => {
  search.value = book.titulo
}

// Fecha filtros ao trocar de rota
watch(route, () => {
  filtersOpen.value = false
})

// ── Settings sidebar ──────────────────────────
const settingsSidebar = ref<InstanceType<typeof SideBar> | null>(null)
const toggleSettings = () => settingsSidebar.value?.toggle()

const forceRefresh = () => {
  useApi().fetchBooks(true)
  settingsSidebar.value?.close()
  useUtils().sendGtmEvent({
    event: 'force_refresh',
    force_refresh_origin: route.fullPath,
  })
}

// ── Indicar livro ─────────────────────────────
// TODO: implementar modal ou rota de indicação
const openIndicate = () => {
  console.warn('[App] openIndicate: implementar modal de indicação')
}

// ── Scroll ao topo na troca de rota ──────────
const content = ref<HTMLElement | null>(null)

watch(route, async () => {
  await nextTick()
  setTimeout(() => {
    if (content.value) content.value.scrollTo({ top: 0, behavior: 'smooth' })
  }, 350)
})

// ── Init — restaura sessão e inicia listener de renovação de token
let stopWatchSession: (() => void) | null = null

onMounted(() => {
  restoreSession()
  stopWatchSession = watchSession()
})

onUnmounted(() => stopWatchSession?.())

useHead({
  htmlAttrs: { lang: 'pt-BR' },
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})
</script>

<style lang="scss" scoped>
.ml-2 {
  margin-left: 0.5rem;
}

// ── Shell ─────────────────────────────────────
.app {
  display: flex;
  flex-direction: row;
  height: 100dvh;
  overflow: hidden;

  @media (max-width: 767px) {
    flex-direction: column;
    // Espaço para o BottomNav fixo
    padding-bottom: calc(56px + env(safe-area-inset-bottom));
  }
}

// ── Coluna principal (header + conteúdo) ──────
.app__main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

// ── Linha de conteúdo (FilterPanel + view) ───
.app__content-area {
  flex: 1;
  display: flex;
  flex-direction: row;
  min-height: 0;
  overflow: hidden;
}

// ── RouterView ───────────────────────────────
.app__view {
  flex: 1;
  overflow-y: auto;
  min-width: 0;
}

// ── Menu painel (body do SideBar de settings) ─
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

// ── Transições de rota ────────────────────────
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--motion-transition-default);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
