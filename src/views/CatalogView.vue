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
      <p class="error-hint">
        Verifique se o <code>SHEET_ID</code> está configurado em <code>useSheets.js</code> e se a planilha está
        publicada.
      </p>
    </div>

    <!-- Catalog -->
    <div v-else class="catalog-body">
      <!-- enum-->
      <section class="catalog-intro">
        <div class="intro-inner">
          <h1 class="intro-title">Catálogo de Indicações</h1>
          <p class="intro-desc">
            Use os filtros abaixo para navegar entre os livros já citados no Clube Ecos Literários.
          </p>
        </div>
      </section>

      <!-- Row 1: Search + count -->
      <div class="search-row">
        <SearchBar v-model="search" :suggestions="searchSuggestions" @select="onSelectSuggestion" />
        <div class="result-count">
          <template v-if="activeFilterCount > 0">
            <strong>{{ filtered.length }}</strong> de {{ useBooksStore().size }} títulos
          </template>
          <template v-else>{{ useBooksStore().size }} títulos</template>
        </div>
      </div>

      <!-- Row 2: Filter bar -->
      <div class="filter-bar">
        <MultiSelect
          class="multi-select"
          label="Mencionado por"
          :options="optionsQuem"
          :selected="selectedQuem"
          @toggle="(v) => handleToggle('quem', v)"
          @clear="clearKey('quem')"
        />
        <MultiSelect
          v-if="showFilters"
          class="multi-select"
          label="Mídia"
          :options="optionsMidia"
          :selected="selectedMidia"
          @toggle="(v) => handleToggle('midia', v)"
          @clear="clearKey('midia')"
        />
        <MultiSelect
          v-if="showFilters"
          class="multi-select"
          label="Categoria"
          :options="optionsCategoria"
          :selected="selectedCategoria"
          @toggle="(v) => handleToggle('categoria', v)"
          @clear="clearKey('categoria')"
        />
        <MultiSelect
          v-if="showFilters"
          class="multi-select"
          label="Sub-gêneros"
          :options="optionsSubgeneros"
          :selected="selectedSubgeneros"
          @toggle="(v) => handleToggle('subgeneros', v)"
          @clear="clearKey('subgeneros')"
        />
        <button class="show-all-btn" @click="handleClickShowAll">
          {{ showFilters ? 'Ocultar' : 'Mostrar' }} filtros
        </button>
      </div>

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

        <!-- Empty state -->
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
import { ref, onMounted, computed } from 'vue'

import { useBooksStore } from '@/stores'
import { useSheets, useFilters } from '@/composables'

import SearchBar from '@/components/SearchBar.vue'
import MultiSelect from '@/components/MultiSelect.vue'
import ActiveFilters from '@/components/ActiveFilters.vue'
import BookCard from '@/components/BookCard.vue'

import type { Book } from '@/types'

const emit = defineEmits(['top'])

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

const showFilters = ref(false)
const isMobile = computed(() => window.innerWidth < 768)

const handleClickShowAll = () => {
  showFilters.value = !showFilters.value
  emit('top')
}

onMounted(() => {
  if (!isMobile.value) showFilters.value = true
})
</script>

<style lang="scss" scoped>
.catalog {
  /* ── Intro ────────────────────────────── */
  &-intro {
    margin: 0 auto 2rem;

    background: var(--bg);
    border-bottom: 1px solid rgba(var(--surface-rgb), 0.08);
  }

  /* ── Catalog body ────────────────────────────── */
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
      family: var(--font-display);
      size: 1.25rem;
      weight: 600;
    }
    color: var(--ink);
    white-space: nowrap;
  }

  &-desc {
    font-size: 0.9rem;
    color: var(--ink-secondary);
    line-height: 1.5;
  }
}

/* ── States ──────────────────────────────────── */
.state {
  &-screen {
    display: flex;
    padding: 80px 24px;

    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;

    color: var(--muted);
    text-align: center;
  }

  &-error {
    color: var(--accent);
  }
}

.error {
  &-hint {
    max-width: 440px;

    font: {
      size: 0.82rem;
    }
    color: var(--muted);

    code {
      background: var(--bg-subtle);
      padding: 1px 5px;
      border-radius: 3px;

      font: {
        size: 0.8rem;
      }
    }
  }
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.retry-btn {
  background: var(--accent);
  border: none;
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  min-height: 44px;

  font: {
    family: var(--font-body);
    size: 1rem;
  }
  color: var(--surface);

  cursor: pointer;
  transition: opacity var(--transition);

  &:hover {
    opacity: 0.85;
    background: var(--accent-hover);
  }
}

/* ── Search row ──────────────────────────────── */
.search-row {
  margin-bottom: 12px;

  display: flex;

  align-items: center;
  gap: 12px;
}

.result-count {
  flex-shrink: 0;
  font-size: 0.9rem;
  color: var(--muted);
  white-space: nowrap;

  strong {
    color: var(--accent);
  }
}

/* ── Filter bar ──────────────────────────────── */
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
  display: none;
  height: 48px;
  background: var(--accent);
  border: none;
  padding: 0 20px;
  border-radius: var(--radius-sm);
  min-height: 44px;

  font: {
    family: var(--font-body);
    size: 1rem;
  }
  color: var(--surface);

  cursor: pointer;
  transition: opacity var(--transition);
  white-space: nowrap;

  &:hover {
    opacity: 0.85;
    background: var(--accent-hover);
  }
}

/* ── Grid ────────────────────────────────────── */
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
  color: var(--muted);
  text-align: center;
  font-size: 1rem;
}

/* Grid transitions */
.grid-enter-active {
  transition:
    opacity var(--transition),
    transform var(--transition);
}
.grid-enter-from {
  opacity: 0;
  transform: scale(0.96);
}
.grid-leave-active {
  transition: opacity var(--transition);
  position: absolute;
}
.grid-leave-to {
  opacity: 0;
}
.grid-move {
  transition: transform var(--transition);
}

/* ── Responsive ──────────────────────────────── */
@media (max-width: 768px) {
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

  .filter-bar {
    flex-wrap: wrap;
    gap: 8px;
  }

  .multi-select {
    min-width: 0;
    flex: 1 1 100%;
  }

  .show-all-btn {
    display: block;
    width: 100%;
  }

  .search-row {
    flex-wrap: wrap;
  }

  .result-count {
    order: -1;
    width: 100%;
  }

  .books-grid {
    grid-template-columns: 1fr;
  }
}
</style>
