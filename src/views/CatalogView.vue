<template>
  <div class="page catalog-page" data-page="catalog">
    <!-- Hero -->
    <section class="catalog-hero" :class="{ 'hero-hidden': isScrolled }">
      <div class="hero-inner">
        <h1 class="hero-title"><span class="hero-icon">📚</span><em>Catálogo</em> de Indicações</h1>
        <p class="hero-sub">{{ useBooksStore().size }} títulos indicados pelos membros do clube</p>
      </div>
    </section>

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
      <hr class="grid-divider" />

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
import { ref, onMounted, computed, inject, type Ref } from 'vue'

import { useBooksStore } from '@/stores'
import { useSheets, useFilters } from '@/composables'

import SearchBar from '@/components/SearchBar.vue'
import MultiSelect from '@/components/MultiSelect.vue'
import ActiveFilters from '@/components/ActiveFilters.vue'
import BookCard from '@/components/BookCard.vue'

import type { Book } from '@/types'

const emit = defineEmits(['top'])

const isScrolled = inject<Ref<boolean>>('isScrolled', ref(false))

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

const handleRemove = (key: string, value: string) => {
  handleToggle(key, value)
}

const onSelectSuggestion = (book: Book) => {
  search.value = book.titulo
}

/** show all */

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
  /* ── Hero ────────────────────────────────────── */
  &-hero {
    position: relative;

    background: var(--ink);
    padding: 48px 24px 40px;
    max-height: 500px;

    overflow: hidden;
    transition: all var(--transition);

    &::before {
      content: '';

      position: absolute;
      inset: 0;

      background: radial-gradient(ellipse 60% 80% at 10% 50%, rgba(var(--accent-rgb), 0.18) 0%, transparent 70%);

      pointer-events: none;
    }

    &.hero-hidden {
      max-height: 0;
      padding-top: 0;
      padding-bottom: 0;
      pointer-events: none;
    }
  }

  /* ── Catalog body ────────────────────────────── */
  &-body {
    margin: 0 auto;

    max-width: 1200px;
    padding: 24px 24px 48px;
  }
}

.hero {
  &-inner {
    position: relative;
    margin: 0 auto;

    max-width: 1200px;
  }

  &-icon {
    font: {
      size: clamp(2rem, 5vw, 3rem);
    }
    line-height: 1;
  }

  &-title {
    margin-bottom: 8px;

    font: {
      family: var(--font-display);
      size: clamp(2rem, 5vw, 3rem);
      weight: 700;
    }
    color: var(--surface);
    line-height: 1.1;

    em {
      font: {
        style: italic;
      }
      color: var(--accent-muted);
    }
  }

  &-sub {
    font: {
      size: 0.95rem;
    }
    color: rgba(var(--surface-rgb), 0.55);
  }
}

/* ── States ──────────────────────────────────── */
.state {
  &-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 80px 24px;
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
  color: var(--surface);
  border: none;
  padding: 9px 20px;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 0.875rem;
  cursor: pointer;
  transition: opacity var(--transition);

  &:hover {
    opacity: 0.85;
    background: var(--accent-hover);
  }
}

/* ── Search row ──────────────────────────────── */
.search-row {
  margin-bottom: 1rem;

  display: flex;

  align-items: center;
  gap: 16px;
}

.result-count {
  flex-shrink: 0;

  font: {
    size: 0.82rem;
  }
  color: var(--muted);
  white-space: nowrap;

  strong {
    color: var(--accent);
  }
}

/* ── Filter bar ──────────────────────────────── */
.filter-bar {
  display: flex;
  gap: 1rem;
}

.multi-select {
  position: relative;
  flex: 1;
  min-width: 140px;
}

.show-all-btn {
  display: none;
  width: 100%;
  height: 48px;
  background: var(--accent);
  border: none;
  padding: 9px 20px;
  border-radius: var(--radius-sm);

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

.grid-divider {
  margin: 2rem 0;
  border: none;
  border-top: 1px solid var(--border);
}

/* ── Grid ────────────────────────────────────── */
.grid-area {
  position: relative;

  margin-top: 2rem;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 24px;
  color: var(--muted);
  text-align: center;
}

/* Grid transition */
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
  .filter-bar {
    flex-wrap: wrap;
  }
  .multi-select {
    min-width: 0;
    flex: 1 1 100%;
  }
  .show-all-btn {
    display: block;
  }
  .search-row {
    flex-wrap: wrap;
  }
  .result-count {
    order: -1;
  }
}
</style>
