<template>
  <div class="page filter-page" data-page="filter">
    <!-- Loading / Error -->
    <PageStatus :loading="useBooksStore().loading" :error="useBooksStore().error" loading-text="Carregando catálogo…" />

    <template v-if="!useBooksStore().loading && !useBooksStore().error">
      <!-- Hero intro -->
      <section class="filter-intro accent" :style="{ '--accent': introAccent }">
        <div class="intro-shell">
          <RailCard :accent="introAccent" size="sm">
            <div class="intro-main">
              <div class="intro-meta">
                <span class="intro-type-label">{{ config.label }}</span>
              </div>
              <h1 class="intro-title">{{ canonicalValue }}</h1>
              <p class="intro-kicker">
                <template v-if="activeFilterCount > 0">
                  <strong>{{ filtered.length }}</strong> de {{ baseFiltered.length }} resultados
                </template>
                <template v-else> {{ baseFiltered.length }} resultados nesta seleção </template>
              </p>
            </div>
          </RailCard>
        </div>
      </section>

      <!-- Content -->
      <section class="filter-body">
        <!-- Search + count -->
        <section id="results" class="results-section">
          <SectionHeading
            title="Resultados"
            description="Busque por título ou autor e refine o que aparece abaixo."
            variant="inline"
          />

          <div class="search-row">
            <SearchBar v-model="search" :suggestions="searchSuggestions" @select="onSelectSuggestion" />
          </div>
        </section>

        <!-- Layout -->
        <div class="filter-layout">
          <!-- Sidebar -->
          <div id="filters">
            <!-- sort -->
            <MultiSelect
              class="filters-sorted"
              label="Ordenação"
              :multiple="false"
              :searchable="false"
              :options="sortOptions"
              :selected="sortOrder"
              @toggle="(v) => (sortOrder = v as BookSortOrder)"
            />

            <!-- panel -->
            <FilterPanel
              :options="panelOptions"
              :selected="panelSelected"
              :active-count="activeFilterCount"
              :opened="false"
              @toggle="handleToggle"
              @clear="clearSecondary"
            />
          </div>

          <!-- Grid -->
          <div class="grid-area">
            <BooksGrid
              :books="sortedBooks"
              :active-filters="{
                midia: selectedMidia,
                categoria: selectedCategoria,
                subgeneros: selectedSubgeneros,
                quem: selectedQuem,
              }"
              @clear="clearSecondary"
              @detail="openDetail"
            />
            <BookDetailDrawer :book="detailBook" @close="closeDetail" />
          </div>
        </div>
      </section>

      <!-- Explore menu -->
      <section class="filter-intro" style="--accent: var(--color-surface-default)">
        <div class="intro-shell">
          <section id="explore-menu" class="explore-menu-section">
            <SectionHeading title="Explore mais" variant="spaced">
              <template #description>
                A partir de <strong>{{ canonicalValue }}</strong
                >, navegue para outras visões do mesmo conjunto.
              </template>
            </SectionHeading>

            <div class="explore-grid">
              <article
                v-for="group in exploreGroups"
                :key="group.key"
                class="explore-card"
                :class="{ 'is-current': group.key === fixedKey }"
              >
                <div class="explore-card__header">
                  <span class="explore-card__label">{{ group.label }}</span>
                  <span class="explore-card__count">{{ group.items.length }}</span>
                </div>

                <p class="explore-card__desc">
                  <template v-if="group.key === fixedKey">Você já está nesta visualização.</template>
                  <template v-else>Abra outras páginas relacionadas por {{ group.label.toLowerCase() }}.</template>
                </p>

                <div class="explore-card__chips">
                  <template v-if="group.key === fixedKey">
                    <span class="explore-chip explore-chip--muted">{{ canonicalValue }}</span>
                  </template>

                  <template v-else-if="group.items.length">
                    <RouterLink
                      v-for="item in group.items.slice(0, 6)"
                      :key="`${group.key}-${item}`"
                      :to="routeFor(group.key, item)"
                      class="explore-chip"
                    >
                      {{ item }}
                    </RouterLink>
                  </template>

                  <template v-else>
                    <span class="explore-chip explore-chip--muted">Sem outras opções</span>
                  </template>
                </div>
              </article>
            </div>
          </section>
        </div>
      </section>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useBooksStore } from '@/stores'
import { useApi, useCategoryColors, useBookSort, usePageMeta, useUtils } from '@/composables'

import SearchBar from '@/components/SearchBar.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import MultiSelect from '@/components/MultiSelect.vue'
import PageStatus from '@/components/PageStatus.vue'
import RailCard from '@/components/RailCard.vue'
import BooksGrid from '@/components/BooksGrid.vue'
import SectionHeading from '@/components/SectionHeading.vue'
import BookDetailDrawer from '@/components/BookDetailDrawer.vue'

import type { Book, BookSortOrder, Options, FilterType, ExploreKey, CategoryType } from '@/types'

// ── Config ────────────────────────────────────────────────────────
const filterConfigs: Record<FilterType, { label: string; bookField: keyof Book; desc: (v: string) => string }> = {
  midia: { label: 'Mídia', bookField: 'midia', desc: (v) => `Todos os títulos em formato ${v} indicados no clube.` },
  categoria: {
    label: 'Categoria',
    bookField: 'categoria',
    desc: (v) => `Todos os títulos na categoria ${v} indicados no clube.`,
  },
  autor: { label: 'Autor/a', bookField: 'autor', desc: (v) => `Todos os títulos de ${v} indicados no clube.` },
  mencao: { label: 'Mencionado por', bookField: 'quem', desc: (v) => `Todos os títulos indicados por ${v}.` },
}

const route = useRoute()
const colors = useCategoryColors()

const filterType = computed(() => route.name as FilterType)
const filterValue = computed(() => decodeURIComponent(route.params?.slug as string))
const config = computed(() => filterConfigs[filterType.value] ?? filterConfigs.categoria)
const fixedKey = computed<ExploreKey>(() => (filterType.value === 'mencao' ? 'quem' : filterType.value))

// ── Valor canônico ────────────────────────────────────────────────
const canonicalValue = computed(() => {
  const field = config.value.bookField
  const target = useUtils().slugify(filterValue.value)
  const match = useBooksStore().books.find((b) => useUtils().slugify(String(b[field])) === target)
  return match ? String(match[field]) : filterValue.value
})

// ── Accent ────────────────────────────────────────────────────────
const introAccent = computed(() =>
  filterType.value === 'categoria'
    ? colors.categoryColor(canonicalValue.value as CategoryType)
    : 'var(--color-action-default)',
)

onMounted(() => useApi().fetchBooks())

// ── Filtros secundários ───────────────────────────────────────────
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

// ── Base filtrada (comparação normalizada) ────────────────────────
const baseFiltered = computed(() => {
  const field = config.value.bookField
  const target = useUtils().slugify(filterValue.value)
  return useBooksStore().books.filter((b) => useUtils().slugify(String(b[field])) === target)
})

// ── Opções dos filtros secundários ────────────────────────────────
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

// ── Filtro aplicado ───────────────────────────────────────────────
const filtered = computed(() => {
  let list = baseFiltered.value

  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter((b) => b.titulo?.toLowerCase().includes(q) || b.autor?.toLowerCase().includes(q))
  }
  if (selectedMidia.value.length) list = list.filter((b) => selectedMidia.value.includes(b.midia))
  if (selectedCategoria.value.length) list = list.filter((b) => selectedCategoria.value.includes(b.categoria))
  if (selectedSubgeneros.value.length)
    list = list.filter((b) => selectedSubgeneros.value.some((sg) => b.subgenerosArr?.includes(sg)))
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

// ── Autocomplete ──────────────────────────────────────────────────
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

// ── Explore ───────────────────────────────────────────────────────
const routeNameFor = (key: ExploreKey) => {
  switch (key) {
    case 'midia':
      return 'catalog-midia'
    case 'categoria':
      return 'catalog-category'
    case 'autor':
      return 'catalog-author'
    case 'quem':
      return 'catalog-mention'
  }
}
const routeFor = (key: ExploreKey, value: string) => ({
  name: routeNameFor(key),
  params: { slug: useUtils().slugify(value) },
})

const exploreGroups = computed(() => [
  {
    key: 'midia' as ExploreKey,
    label: 'Mídia',
    items: [...new Set(baseFiltered.value.map((b) => b.midia).filter(Boolean))].sort(),
  },
  {
    key: 'categoria' as ExploreKey,
    label: 'Categoria',
    items: [...new Set(baseFiltered.value.map((b) => b.categoria).filter(Boolean))].sort(),
  },
  {
    key: 'autor' as ExploreKey,
    label: 'Autor/a',
    items: [...new Set(baseFiltered.value.map((b) => b.autor).filter(Boolean))].sort(),
  },
  {
    key: 'quem' as ExploreKey,
    label: 'Mencionado por',
    items: [...new Set(baseFiltered.value.map((b) => b.quem).filter(Boolean))].sort(),
  },
])

// ── Detalhe ────────────────────────────────────────────────────
const detailBook = ref<Book | null>(null)
const openDetail = (book: Book) => {
  detailBook.value = book
}
const closeDetail = () => {
  detailBook.value = null
}

// ── Sort + SEO ────────────────────────────────────────────────────
const { sortOrder, sortedBooks, sortOptions } = useBookSort(filtered)

usePageMeta(
  computed(() => ({
    title: canonicalValue.value,
    description: `${baseFiltered.value.length} títulos em ${config.value.label}: ${canonicalValue.value}`,
  })),
)
</script>

<style lang="scss" scoped>
.filter-intro {
  background-color: var(--accent);
  padding: 24px;

  &.accent {
    box-shadow: inset var(--shadow-lg);
  }
}

.intro-shell,
.filter-body {
  margin: 0 auto;
}

.intro-shell {
  display: flex;
  max-width: calc(1200px - (2 * 24px));
  flex-direction: column;
  gap: 0.5rem;
}

.intro-main {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.intro-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.intro-type-label {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--color-background-subtle);
  color: var(--color-text-subtle);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.intro-title {
  margin: 0;
  font-family: var(--font-family-display);
  font-size: clamp(1.5rem, 4vw, 2.4rem);
  line-height: 1.08;
  color: var(--color-text-default);
}

.intro-kicker {
  color: var(--color-text-subtle);
  font-size: 0.9rem;

  strong {
    color: var(--color-action-default);
  }
}

.filter-body {
  padding: 40px 24px 72px;
  display: flex;
  max-width: 1200px;
  flex-direction: column;
  gap: 2rem;
}

.results-section,
.explore-menu-section {
  display: flex;
  flex-direction: column;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.5rem;
  align-items: start;
}

.filters-sorted {
  margin-bottom: 1rem;
  width: 260px;
}

.grid-area {
  min-width: 0;
}

/* Explore cards */
.explore-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.explore-card {
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;

  &.is-current {
    background: var(--color-action-background-subtle);
    border-color: rgba(var(--color-action-default-rgb), 0.2);
  }
}

.explore-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.explore-card__label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

.explore-card__count {
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-subtle);
  color: var(--color-text-default);
  font-size: 0.8rem;
  font-weight: 700;
}

.explore-card__desc {
  margin: 0;
  color: var(--color-text-subtle);
  font-size: 0.9rem;
  line-height: 1.45;
}

.explore-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
}

.explore-chip {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--color-border-default);
  background: var(--color-surface-default);
  color: var(--color-text-default);
  text-decoration: none;
  transition:
    border-color var(--motion-transition-default),
    transform var(--motion-transition-default),
    box-shadow var(--motion-transition-default);

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
    border-color: rgba(var(--color-action-default-rgb), 0.22);
  }

  &--muted {
    background: var(--color-background-subtle);
    color: var(--color-text-subtle);
  }
}

@media (max-width: 1023px) {
  .explore-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .filter-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .filter-intro {
    padding: 16px;
  }
  .explore-grid {
    grid-template-columns: 1fr;
  }
  .search-row {
    flex-wrap: wrap;
  }
  .filters-sorted {
    width: 100%;
  }
}
</style>
