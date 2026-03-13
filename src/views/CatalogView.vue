<template>
  <div class="page catalog-page" data-page="catalog">
    <!-- Loading / Error -->
    <div v-if="useBooksStore().loading" class="state-screen">
      <div class="spinner"></div>
      <p>Carregando catálogo…</p>
    </div>

    <div v-else-if="useBooksStore().error" class="state-screen state-error">
      <BaseIcon name="error" />
      <p>{{ useBooksStore().error }}</p>
      <button class="retry-btn" @click="useSheets().fetchBooks(true)">Tentar novamente</button>
      <p class="error-hint">Contacte o administrador do site se o erro persistir.</p>
    </div>

    <!-- Catalog -->
    <div v-else class="catalog-body">
      <section class="catalog-intro">
        <div class="intro-inner">
          <h1 class="intro-title">Catálogo de Indicações</h1>
          <p class="intro-desc">
            Use os filtros abaixo para navegar entre os livros já citados no Clube Ecos Literários.
          </p>
        </div>
      </section>

      <!-- Row 1: Search + mobile filters button + count -->
      <div class="search-row">
        <div class="search-main">
          <SearchBar v-model="search" :suggestions="searchSuggestions" @select="onSelectSuggestion" />
          <button
            v-if="isMobile"
            class="show-all-btn mobile"
            type="button"
            aria-label="Abrir filtros"
            @click="openMobileFilters"
          >
            <BaseIcon name="filter" aria-hidden="true" />
          </button>
        </div>

        <ResultCount :total="useBooksStore().size" :filtered="filtered.length" :active-filters="activeFilterCount" />
      </div>

      <!-- Desktop filters -->
      <div v-if="!isMobile" class="filter-bar">
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
      <Transition name="mobile-filters-overlay">
        <div v-if="isMobile && mobileFiltersOpen" class="mobile-filters-overlay" @click="closeMobileFilters" />
      </Transition>

      <Transition name="mobile-filters-panel">
        <aside v-if="isMobile && mobileFiltersOpen" class="mobile-filters-sidebar" aria-label="Filtros">
          <div class="mobile-filters-header">
            <h2 class="mobile-filters-title">Filtros</h2>

            <button class="mobile-filters-close" type="button" aria-label="Fechar filtros" @click="closeMobileFilters">
              <BaseIcon name="times" aria-hidden="true" />
            </button>
          </div>

          <div class="mobile-filters-body">
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
          </div>

          <div class="mobile-filters-footer">
            <button class="secondary-btn" type="button" @click="clearAll">Limpar</button>
            <button class="retry-btn" type="button" @click="closeMobileFilters">Ver resultados</button>
          </div>
        </aside>
      </Transition>

      <!-- Row 3: Active filter tags -->
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
        <TransitionGroup v-if="filtered.length > 0" name="grid" tag="div" class="books-grid">
          <BookCard v-for="book in filtered" :key="book.id" :book="book" />
        </TransitionGroup>

        <div v-else class="empty-state">
          <BaseIcon name="book" />
          <p>Nenhum título encontrado com estes filtros.</p>
          <button class="retry-btn" @click="clearAll">Limpar filtros</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import { useMediaQuery } from '@vueuse/core'

import { useBooksStore } from '@/stores'
import { useSheets, useFilters } from '@/composables'

import SearchBar from '@/components/SearchBar.vue'
import ResultCount from '@/components/ResultCount.vue'
import MultiSelect from '@/components/MultiSelect.vue'
import ActiveFilters from '@/components/ActiveFilters.vue'
import BookCard from '@/components/BookCard.vue'

import type { Book } from '@/types'

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
  activeFilterCount,
  clearAll,
  searchSuggestions,
} = useFilters()

onMounted(() => useSheets().fetchBooks())

const isMobile = useMediaQuery('(max-width: 767px)')
const mobileFiltersOpen = ref(false)

watch(isMobile, (mobile) => {
  if (!mobile) mobileFiltersOpen.value = false
})

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

const onSelectSuggestion = (book: Book) => {
  search.value = book.titulo
}

const openMobileFilters = () => {
  mobileFiltersOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeMobileFilters = () => {
  mobileFiltersOpen.value = false
  document.body.style.overflow = ''
}
</script>

<style lang="scss" scoped>
.catalog {
  &-intro {
    margin: 0 auto 2rem;
    background: var(--color-background-default);
    border-bottom: 1px solid rgba(var(--color-surface-default-rgb), 0.08);
  }

  &-body {
    margin: 0 auto;
    max-width: 1200px;
    padding: 20px 16px 48px;
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
    white-space: nowrap;
  }

  &-desc {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
  }
}

.state {
  &-screen {
    display: flex;
    padding: 80px 24px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: var(--color-text-subtle);
    text-align: center;
  }

  &-error {
    color: var(--color-action-default);
  }
}

.error {
  &-hint {
    max-width: 440px;
    font-size: 0.82rem;
    color: var(--color-text-subtle);

    code {
      background: var(--color-background-subtle);
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 0.8rem;
    }
  }
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-border-default);
  border-top-color: var(--color-action-default);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.retry-btn,
.secondary-btn {
  border: none;
  padding: 10px 20px;
  border-radius: var(--border-radius-sm);
  min-height: 44px;

  font: {
    family: var(--font-family-body);
    size: 1rem;
  }
  color: var(--color-surface-default);

  cursor: pointer;
  transition: opacity var(--motion-transition-default);
}

.retry-btn {
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

  font: {
    family: var(--font-family-body);
    size: 1rem;
  }
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
  position: relative;
  margin-top: 2rem;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 24px;
  color: var(--color-text-subtle);
  text-align: center;
  font-size: 1rem;
}

.mobile-filters {
  &-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 40;
  }

  &-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 50;

    display: flex;
    width: min(88dvw, 360px);
    height: 100dvh;
    padding-top: 4rem;
    background: var(--color-surface-default);
    box-shadow: -8px 0 24px rgba(0, 0, 0, 0.16);

    flex-direction: column;
  }

  &-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid var(--color-border-default);
  }

  &-title {
    margin: 0;
    font-size: 1rem;
    color: var(--color-text-default);
  }

  &-close {
    width: 40px;
    height: 40px;
    border: none;
    background: transparent;
    border-radius: 999px;
    font-size: 1.1rem;
    cursor: pointer;
    color: var(--color-text-default);
  }

  &-body {
    // flex: 1;
    // overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &-footer {
    margin-top: auto;

    display: grid;
    padding: 16px;
    border-top: 1px solid var(--color-border-default);
    background: var(--color-surface-default);

    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
}

.mobile-filters-overlay-enter-active,
.mobile-filters-overlay-leave-active {
  transition: opacity 0.25s ease;
}

.mobile-filters-overlay-enter-from,
.mobile-filters-overlay-leave-to {
  opacity: 0;
}

.mobile-filters-panel-enter-active,
.mobile-filters-panel-leave-active {
  transition: transform 0.25s ease;
}

.mobile-filters-panel-enter-from,
.mobile-filters-panel-leave-to {
  transform: translateX(100%);
}

.grid-enter-active {
  transition:
    opacity var(--motion-transition-default),
    transform var(--motion-transition-default);
}

.grid-enter-from {
  opacity: 0;
  transform: scale(0.96);
}

.grid-leave-active {
  transition: opacity var(--motion-transition-default);
  position: absolute;
}

.grid-leave-to {
  opacity: 0;
}

.grid-move {
  transition: transform var(--motion-transition-default);
}

@media (max-width: 767px) {
  .catalog-intro {
    margin-bottom: 1rem;
  }

  .intro-inner {
    flex-direction: column;
    gap: 4px;
  }

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

  .books-grid {
    grid-template-columns: 1fr;
  }
}
</style>
