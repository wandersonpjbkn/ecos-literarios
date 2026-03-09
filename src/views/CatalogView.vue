<template>
  <div class="catalog-page">
    <!-- Hero -->
    <section class="catalog-hero">
      <div class="hero-inner">
        <h1 class="hero-title"><em>Catálogo</em> de Indicações</h1>
        <p class="hero-sub">{{ useSheets().size }} títulos indicados pelos membros do clube</p>
      </div>
    </section>

    <!-- Loading / Error -->
    <div v-if="useSheets().loading" class="state-screen">
      <div class="spinner"></div>
      <p>Carregando catálogo…</p>
    </div>

    <div v-else-if="useSheets().error" class="state-screen state-error">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p>{{ useSheets().error }}</p>
      <button class="retry-btn" @click="useSheets().fetchBooks(true)">Tentar novamente</button>
      <p class="error-hint">
        Verifique se o <code>SHEET_ID</code> está configurado em <code>useSheets.js</code> e se a planilha está
        publicada.
      </p>
    </div>

    <div v-else class="catalog-body">
      <!-- Search bar (full width) -->
      <div class="search-row">
        <SearchBar v-model="search" :suggestions="searchSuggestions" @select="onSelectSuggestion" />
        <div class="result-count">
          <template v-if="activeFilterCount > 0">
            <strong>{{ filtered.length }}</strong> de {{ useSheets().size }} títulos
          </template>
          <template v-else> {{ useSheets().size }} títulos </template>
        </div>
      </div>

      <div class="catalog-layout">
        <!-- Filters sidebar -->
        <FilterPanel
          :options="{
            midia: optionsMidia,
            categoria: optionsCategoria,
            subgeneros: optionsSubgeneros,
            quem: optionsQuem,
          }"
          :selected="{
            midia: selectedMidia,
            categoria: selectedCategoria,
            subgeneros: selectedSubgeneros,
            quem: selectedQuem,
          }"
          :active-count="activeFilterCount"
          @toggle="handleToggle"
          @clear="clearAll"
        />

        <!-- Grid -->
        <div class="grid-area">
          <TransitionGroup v-if="filtered.length > 0" name="grid" tag="div" class="books-grid">
            <BookCard v-for="book in filtered" :key="book.id" :book="book" />
          </TransitionGroup>

          <!-- Empty state -->
          <div v-else class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            <p>Nenhum título encontrado com estes filtros.</p>
            <button class="retry-btn" @click="clearAll">Limpar filtros</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'

import { useSheets, useFilters } from '@/composables'

import SearchBar from '@/components/SearchBar.vue'
import FilterPanel from '@/components/FilterPanel.vue'
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
} = useFilters(useSheets().books)

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

const onSelectSuggestion = (book: Book) => {
  search.value = book.titulo
}
</script>

<style scoped>
/* ── Hero ────────────────────────────────────── */
.catalog-hero {
  background: var(--ink);
  padding: 48px 24px 40px;
  position: relative;
  overflow: hidden;
}
.catalog-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 80% at 10% 50%, rgba(181, 69, 27, 0.18) 0%, transparent 70%);
  pointer-events: none;
}

.hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: var(--paper);
  line-height: 1.1;
  margin-bottom: 8px;
}
.hero-title em {
  font-style: italic;
  color: var(--accent-2);
}

.hero-sub {
  color: rgba(245, 240, 232, 0.55);
  font-size: 0.95rem;
}

/* ── States ──────────────────────────────────── */
.state-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 24px;
  color: var(--muted);
  text-align: center;
}

.state-error {
  color: var(--accent);
}
.error-hint {
  font-size: 0.82rem;
  color: var(--muted);
  max-width: 440px;
}
.error-hint code {
  background: var(--tag-bg);
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 0.8rem;
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
  color: white;
  border: none;
  padding: 9px 20px;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 0.875rem;
  cursor: pointer;
  transition: opacity var(--transition);
}
.retry-btn:hover {
  opacity: 0.85;
}

/* ── Catalog body ────────────────────────────── */
.catalog-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 24px 48px;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.result-count {
  font-size: 0.82rem;
  color: var(--muted);
  white-space: nowrap;
  flex-shrink: 0;
}
.result-count strong {
  color: var(--accent);
}

.catalog-layout {
  display: flex;
  gap: 28px;
  align-items: flex-start;
}

/* ── Grid ────────────────────────────────────── */
.grid-area {
  flex: 1;
  min-width: 0;
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
    opacity 200ms ease,
    transform 200ms ease;
}
.grid-enter-from {
  opacity: 0;
  transform: scale(0.96);
}
.grid-leave-active {
  transition: opacity 150ms ease;
  position: absolute;
}
.grid-leave-to {
  opacity: 0;
}
.grid-move {
  transition: transform 200ms ease;
}

@media (max-width: 768px) {
  .catalog-layout {
    flex-direction: column;
  }
  .search-row {
    flex-wrap: wrap;
  }
  .result-count {
    order: -1;
  }
}
</style>
