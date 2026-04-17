<template>
  <div class="page catalog-page" data-page="catalog">
    <!-- Loading / Error -->
    <PageStatus
      :loading="useBooksStore().loading"
      :error="useBooksStore().error"
      loading-text="Carregando catálogo…"
      error-hint="Contacte o administrador do site se o erro persistir."
      :on-retry="() => useApi().fetchBooks(true)"
    />

    <!-- Catalog -->
    <div v-if="!useBooksStore().loading && !useBooksStore().error" class="catalog-body">
      <section class="catalog-intro" aria-hidden="true">
        <div class="intro-inner">
          <h1 class="intro-title">Catálogo de Livros</h1>
          <p class="intro-desc">
            Use os filtros abaixo para navegar entre os livros já citados no Clube Ecos Literários.
          </p>
        </div>
      </section>

      <!-- Search + count -->
      <div class="search-row">
        <div class="search-main">
          <SearchBar
            v-model="search"
            :suggestions="searchSuggestions"
            :total="useBooksStore().size"
            :filtered="filtered.length"
            @select="onSelectSuggestion"
          />
          <button
            v-if="isTablet"
            class="show-all-btn mobile"
            type="button"
            aria-label="Abrir filtros"
            @click="openMobileFilters"
          >
            <BaseIcon name="filter" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- Desktop filters -->
      <div v-if="!isTablet" class="filter-bar">
        <!-- sort -->
        <MultiSelect
          class="filter-bar-sorted"
          label="Ordenação"
          :multiple="false"
          :searchable="false"
          :options="sortOptions"
          :selected="sortOrder"
          @toggle="(v) => (sortOrder = v as BookSortOrder)"
        />

        <!-- filters -->
        <MultiSelect
          class="multi-select"
          label="Mídia"
          :options="optionsMidia"
          :selected="selectedMidia"
          @toggle="(v) => handleToggle('midia', v)"
          @clear="clearKey('midia')"
        />
        <MultiSelect
          class="multi-select"
          label="Categoria"
          :options="optionsCategoria"
          :selected="selectedCategoria"
          @toggle="(v) => handleToggle('categoria', v)"
          @clear="clearKey('categoria')"
        />
        <MultiSelect
          class="multi-select"
          label="Sub-gêneros"
          :options="optionsSubgeneros"
          :selected="selectedSubgeneros"
          @toggle="(v) => handleToggle('subgeneros', v)"
          @clear="clearKey('subgeneros')"
        />
        <MultiSelect
          class="multi-select"
          label="Mencionado por"
          :options="optionsQuem"
          :selected="selectedQuem"
          @toggle="(v) => handleToggle('quem', v)"
          @clear="clearKey('quem')"
        />
      </div>

      <!-- Mobile sidebar -->
      <SideBar ref="filtersSidebar" title="Filtros">
        <template #body>
          <!-- sort -->
          <MultiSelect
            class="filter-bar-sorted"
            label="Ordenação"
            :multiple="false"
            :searchable="false"
            :options="sortOptions"
            :selected="sortOrder"
            @toggle="(v) => (sortOrder = v as BookSortOrder)"
          />

          <!-- filters -->
          <MultiSelect
            class="multi-select mobile"
            label="Mídia"
            :options="optionsMidia"
            :selected="selectedMidia"
            @toggle="(v) => handleToggle('midia', v)"
            @clear="clearKey('midia')"
          />
          <MultiSelect
            class="multi-select mobile"
            label="Categoria"
            :options="optionsCategoria"
            :selected="selectedCategoria"
            @toggle="(v) => handleToggle('categoria', v)"
            @clear="clearKey('categoria')"
          />
          <MultiSelect
            class="multi-select mobile"
            label="Sub-gêneros"
            :options="optionsSubgeneros"
            :selected="selectedSubgeneros"
            @toggle="(v) => handleToggle('subgeneros', v)"
            @clear="clearKey('subgeneros')"
          />
          <MultiSelect
            class="multi-select mobile"
            label="Mencionado por"
            :options="optionsQuem"
            :selected="selectedQuem"
            @toggle="(v) => handleToggle('quem', v)"
            @clear="clearKey('quem')"
          />
        </template>
        <template #footer="{ close }">
          <button class="secondary-btn" type="button" @click="clearAll">Limpar</button>
          <button class="primary-btn" type="button" @click="close">Mostrar</button>
        </template>
      </SideBar>

      <!-- Active filter tags -->
      <ActiveFilters
        :selected="{
          midia: selectedMidia,
          categoria: selectedCategoria,
          subgeneros: selectedSubgeneros,
          quem: selectedQuem,
        }"
        @remove="handleRemove"
        @clear-all="clearAll"
      />

      <!-- Grid -->
      <div class="grid-area">
        <BooksGrid
          v-model="sortedBooks"
          :active-filters="{
            midia: selectedMidia,
            categoria: selectedCategoria,
            subgeneros: selectedSubgeneros,
            quem: selectedQuem,
          }"
          @clear="clearAll"
          @detail="openDetail"
        />
        <BookDetailDrawer :book="detailBook" @close="closeDetail" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { useMediaQuery } from '@vueuse/core'

import { useBooksStore } from '@/stores'
import { useApi, useFilters, useBookSort, usePageMeta, useBreakpoints } from '@/composables'

import SearchBar from '@/components/SearchBar.vue'
import MultiSelect from '@/components/MultiSelect.vue'
import ActiveFilters from '@/components/ActiveFilters.vue'
import PageStatus from '@/components/PageStatus.vue'
import BooksGrid from '@/components/BooksGrid.vue'
import BookDetailDrawer from '@/components/BookDetailDrawer.vue'

import type { Book, BookSortOrder, Suggestion } from '@/types'

usePageMeta({
  title: 'Catálogo de Livros',
  description: 'Explore os livros, mangás e HQs indicados pelo Clube Ecos Literários.',
})

const SideBar = defineAsyncComponent(() => import('@/components/SideBar.vue'))

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
  filtered,
  clearAll,
  searchSuggestions,
} = useFilters()
const { sortOrder, sortedBooks, sortOptions } = useBookSort(filtered)

onMounted(() => useApi().fetchBooks())

const filtersSidebar = ref<InstanceType<typeof SideBar> | null>(null)

const isTablet = useMediaQuery(useBreakpoints.isTablet)

const handleToggle = (key: string, value: string) => {
  const map = {
    midia: selectedMidia,
    categoria: selectedCategoria,
    subgeneros: selectedSubgeneros,
    quem: selectedQuem,
  }
  const arr = map[key as keyof typeof map]
  const idx = arr.value.indexOf(value)
  if (idx === -1) arr.value.push(value)
  else arr.value.splice(idx, 1)
}

const clearKey = (key: string) => {
  const map = {
    midia: selectedMidia,
    categoria: selectedCategoria,
    subgeneros: selectedSubgeneros,
    quem: selectedQuem,
  }
  map[key as keyof typeof map].value = []
}

const handleRemove = (key: string, value: string) => handleToggle(key, value)

const onSelectSuggestion = (suggestion: Suggestion) => {
  search.value = suggestion.main
}

const openMobileFilters = () => {
  filtersSidebar.value?.open()
}

const detailBook = ref<Book | null>(null)
const openDetail = (book: Book) => {
  detailBook.value = book
}
const closeDetail = () => {
  detailBook.value = null
}
</script>

<style lang="scss" scoped>
.catalog {
  &-intro {
    margin: 0 auto 2rem;

    display: none;
    background: var(--color-background-default);
    border-bottom: 1px solid rgba(var(--color-surface-default-rgb), 0.08);
  }

  &-body {
    margin: 0 auto;
    max-width: 1200px;
    padding: 20px 1rem 48px;
  }
}

.intro {
  &-inner {
    margin: 0 auto;
    max-width: 1200px;
  }

  &-title {
    margin-bottom: 0.25rem;
    font: {
      family: var(--font-family-display);
      size: 1.25rem;
      weight: 600;
    }
    color: var(--color-text-default);
  }

  &-desc {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
  }
}

.search-row {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-main {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.filter-bar {
  margin-bottom: 2rem;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.multi-select {
  position: relative;
  flex: 1;
  min-width: 140px;
}

.show-all-btn {
  background: var(--color-action-default);
  border: none;
  padding: 0 16px;
  border-radius: var(--border-radius-sm);
  min-height: 44px;
  font-family: var(--font-family-body);
  font-size: 1rem;
  color: var(--color-surface-default);
  cursor: pointer;
  transition: opacity var(--motion-transition-default);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    opacity: 0.85;
    background: var(--color-action-default-hover);
  }
}

.grid-area {
  margin-top: 2rem;
}

.primary-btn,
.secondary-btn {
  border: none;
  padding: 10px 20px;
  border-radius: var(--border-radius-sm);
  min-height: 44px;
  font-family: var(--font-family-body);
  font-size: 1rem;
  cursor: pointer;
  transition: opacity var(--motion-transition-default);
}

.primary-btn {
  background: var(--color-action-default);
  color: var(--color-surface-default);

  &:hover {
    opacity: 0.85;
    background: var(--color-action-default-hover);
  }
}

.secondary-btn {
  background: var(--color-background-subtle);
  color: var(--color-text-default);

  &:hover {
    opacity: 0.85;
  }
}

@media (max-width: 767px) {
  .intro-desc {
    font-size: 0.875rem;
  }

  .search-row {
    flex-wrap: wrap;
  }

  .search-main {
    width: 100%;
  }

  .show-all-btn.mobile {
    flex-shrink: 0;
  }
}
</style>
