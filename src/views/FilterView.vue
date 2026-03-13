<template>
  <div class="page filter-page" data-page="filter">
    <!-- Intro -->
    <section class="filter-intro">
      <div class="intro-inner">
        <RouterLink to="/" class="back-link">
          <BaseIcon name="arrow-left" />
          Catálogo
        </RouterLink>
        <div class="intro-meta">
          <span class="intro-type-label">{{ config.label }}</span>
          <h1 class="intro-title">{{ filterValue }}</h1>
          <p class="intro-desc">{{ config.desc(filterValue) }}</p>
        </div>
      </div>
    </section>

    <!-- Loading -->
    <div v-if="useBooksStore().loading" class="state-screen">
      <div class="spinner"></div>
      <p>Carregando catálogo…</p>
    </div>

    <!-- Error -->
    <div v-else-if="useBooksStore().error" class="state-screen state-error">
      <BaseIcon name="error" />
      <p>{{ useBooksStore().error }}</p>
    </div>

    <!-- Content -->
    <div v-else class="filter-body">
      <!-- Search + count -->
      <div class="search-row">
        <SearchBar v-model="search" :suggestions="searchSuggestions" @select="onSelectSuggestion" />
        <ResultCount :total="useBooksStore().size" :filtered="filtered.length" :active-filters="activeFilterCount" />
      </div>

      <!-- Layout: sidebar + grid -->
      <div class="filter-layout">
        <!-- Sidebar com FilterPanel -->
        <FilterPanel
          :options="panelOptions"
          :selected="panelSelected"
          :active-count="activeFilterCount"
          :opened="false"
          @toggle="handleToggle"
          @clear="clearSecondary"
        />

        <!-- Grid -->
        <div class="grid-area">
          <TransitionGroup v-if="filtered.length > 0" name="grid" tag="div" class="books-grid">
            <BookCard v-for="book in filtered" :key="book.id" :book="book" />
          </TransitionGroup>

          <div v-else class="empty-state">
            <BaseIcon name="book" />
            <p>Nenhum título encontrado com estes filtros.</p>
            <button class="retry-btn" @click="clearSecondary">Limpar filtros</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useBooksStore } from '@/stores'
import { useSheets } from '@/composables'

import SearchBar from '@/components/SearchBar.vue'
import ResultCount from '@/components/ResultCount.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import BookCard from '@/components/BookCard.vue'

import type { Book, Options } from '@/types'

// ── Configuração por tipo de rota ─────────────
type FilterType = 'midia' | 'categoria' | 'autor' | 'mencao'

const filterConfigs: Record<
  FilterType,
  {
    label: string
    bookField: keyof Book
    desc: (v: string) => string
  }
> = {
  midia: {
    label: 'Mídia',
    bookField: 'midia',
    desc: (v) => `Todos os títulos em formato ${v} indicados no clube.`,
  },
  categoria: {
    label: 'Categoria',
    bookField: 'categoria',
    desc: (v) => `Todos os títulos na categoria ${v} indicados no clube.`,
  },
  autor: {
    label: 'Autor/a',
    bookField: 'autor',
    desc: (v) => `Todos os títulos de ${v} indicados no clube.`,
  },
  mencao: {
    label: 'Mencionado por',
    bookField: 'quem',
    desc: (v) => `Todos os títulos indicados por ${v}.`,
  },
}

const route = useRoute()

const filterType = computed(() => route.name as FilterType)
const filterValue = computed(() => decodeURIComponent(route.params.id as string))
const config = computed(() => filterConfigs[filterType.value] ?? filterConfigs.categoria)

const fixedKey = computed(() => (filterType.value === 'mencao' ? 'quem' : filterType.value))

onMounted(() => useSheets().fetchBooks())

// ── Estado dos filtros secundários ───────────
const search = ref('')
const selectedMidia = ref<string[]>([])
const selectedCategoria = ref<string[]>([])
const selectedSubgeneros = ref<string[]>([])
const selectedQuem = ref<string[]>([])

watch(filterType, () => {
  search.value = ''
  selectedMidia.value = []
  selectedCategoria.value = []
  selectedSubgeneros.value = []
  selectedQuem.value = []
})

const baseFiltered = computed(() => {
  const field = config.value.bookField
  return useBooksStore().books.filter((b) => String(b[field]) === filterValue.value)
})

const optionsMidia = computed(() =>
  fixedKey.value === 'midia' ? [] : [...new Set(baseFiltered.value.map((b) => b.midia).filter(Boolean))].sort(),
)
const optionsCategoria = computed(() =>
  fixedKey.value === 'categoria' ? [] : [...new Set(baseFiltered.value.map((b) => b.categoria).filter(Boolean))].sort(),
)
const optionsSubgeneros = computed(() => [...new Set(baseFiltered.value.flatMap((b) => b.subgenerosArr || []))].sort())
const optionsQuem = computed(() =>
  fixedKey.value === 'quem' ? [] : [...new Set(baseFiltered.value.map((b) => b.quem).filter(Boolean))].sort(),
)

const panelOptions = computed(
  (): Options => ({
    midia: optionsMidia.value,
    categoria: optionsCategoria.value,
    subgeneros: optionsSubgeneros.value,
    quem: optionsQuem.value,
  }),
)
const panelSelected = computed(
  (): Options => ({
    midia: selectedMidia.value,
    categoria: selectedCategoria.value,
    subgeneros: selectedSubgeneros.value,
    quem: selectedQuem.value,
  }),
)

const filtered = computed(() => {
  let list = baseFiltered.value

  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter((b) => b.titulo?.toLowerCase().includes(q) || b.autor?.toLowerCase().includes(q))
  }
  if (selectedMidia.value.length) list = list.filter((b) => selectedMidia.value.includes(b.midia))
  if (selectedCategoria.value.length) list = list.filter((b) => selectedCategoria.value.includes(b.categoria))
  if (selectedSubgeneros.value.length)
    list = list.filter((b) => selectedSubgeneros.value.every((sg) => b.subgenerosArr?.includes(sg)))
  if (selectedQuem.value.length) list = list.filter((b) => selectedQuem.value.includes(b.quem))

  return list
})

const activeFilterCount = computed(
  () =>
    (search.value.trim() ? 1 : 0) +
    selectedMidia.value.length +
    selectedCategoria.value.length +
    selectedSubgeneros.value.length +
    selectedQuem.value.length,
)

const handleToggle = (key: string, value: string) => {
  const map: Record<string, { value: string[] }> = {
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

const clearSecondary = () => {
  search.value = ''
  selectedMidia.value = []
  selectedCategoria.value = []
  selectedSubgeneros.value = []
  selectedQuem.value = []
}

const searchSuggestions = computed(() => {
  if (!search.value.trim() || search.value.length < 2) return []
  const q = search.value.toLowerCase()
  return baseFiltered.value
    .filter((b) => b.titulo?.toLowerCase().includes(q))
    .map((b) => ({ id: b.id, titulo: b.titulo, autor: b.autor }))
    .slice(0, 8)
})

const onSelectSuggestion = (book: Book) => {
  search.value = book.titulo
}
</script>

<style lang="scss" scoped>
/* ── Intro ───────────────────────────────────── */
.filter-intro {
  background: var(--color-header-bg);
  border-bottom: 1px solid rgba(var(--color-surface-default-rgb), 0.08);
  padding: 20px 24px;

  @media (max-width: 767px) {
    padding: 16px;
  }
}

.intro-inner {
  margin: 0 auto;
  max-width: 1200px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(var(--color-surface-default-rgb), 0.5);
  font-size: 0.875rem;
  white-space: nowrap;
  padding-top: 6px;
  min-height: 44px;
  transition: color var(--motion-transition-default);
  text-decoration: none;
  flex-shrink: 0;

  &:hover {
    color: var(--color-surface-default);
  }
}

.intro-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.intro-type-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-action-text-subtle);
}

.intro-title {
  font-family: var(--font-family-display);
  font-size: clamp(1.1rem, 3vw, 1.5rem);
  font-weight: 700;
  color: var(--color-surface-default);
  line-height: 1.2;
}

.intro-desc {
  font-size: 0.875rem;
  color: rgba(var(--color-surface-default-rgb), 0.5);
  margin-top: 2px;
}

/* ── Body ────────────────────────────────────── */
.filter-body {
  margin: 0 auto;
  max-width: 1200px;
  padding: 20px 16px 48px;
}

/* ── States ──────────────────────────────────── */
.state-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 24px;
  color: var(--color-text-subtle);
  text-align: center;
}
.state-error {
  color: var(--color-action-default);
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

.retry-btn {
  background: var(--color-action-default);
  color: var(--color-surface-default);
  border: none;
  padding: 10px 20px;
  border-radius: var(--border-radius-sm);
  font-family: var(--font-family-body);
  font-size: 1rem;
  cursor: pointer;
  min-height: 44px;
  transition: opacity var(--motion-transition-default);

  &:hover {
    opacity: 0.85;
    background: var(--color-action-default-hover);
  }
}

/* ── Search row ──────────────────────────────── */
.search-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

/* ── Layout sidebar + grid ───────────────────── */
.filter-layout {
  display: flex;
  gap: 28px;
  align-items: flex-start;
}

.grid-area {
  flex: 1;
  min-width: 0;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
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

/* Grid transitions */
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

/* ── Responsive ──────────────────────────────── */
@media (max-width: 767px) {
  .intro-inner {
    flex-direction: column;
    gap: 10px;
  }
  .back-link {
    padding-top: 0;
  }
  .filter-layout {
    flex-direction: column;
  }
  .search-row {
    flex-wrap: wrap;
  }
  .books-grid {
    grid-template-columns: 1fr;
  }
}
</style>
