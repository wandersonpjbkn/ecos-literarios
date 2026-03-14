<template>
  <div class="page filter-page" data-page="filter">
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

    <template v-else>
      <!-- Intro -->
      <section class="filter-intro accent" :style="{ '--accent': introAccent }">
        <div class="intro-shell">
          <div class="intro-card">
            <div class="intro-rail" aria-hidden="true"></div>

            <div class="intro-main">
              <div class="intro-meta">
                <span class="intro-type-label">{{ config.label }}</span>
              </div>

              <h1 class="intro-title">{{ filterValue }}</h1>
              <p class="intro-kicker">{{ baseFiltered.length }} resultados nesta seleção</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Content -->
      <section class="filter-body">
        <!-- Search + count -->
        <section id="results" class="results-section">
          <div class="section-heading section-heading--inline">
            <div>
              <h2 class="section-title">Resultados</h2>
              <p class="section-desc">Busque por título ou autor e refine o que aparece abaixo.</p>
            </div>
          </div>

          <div class="search-row">
            <SearchBar v-model="search" :suggestions="searchSuggestions" @select="onSelectSuggestion" />
            <ResultCount :total="baseFiltered.length" :filtered="filtered.length" :active-filters="activeFilterCount" />
          </div>
        </section>

        <!-- Layout -->
        <div class="filter-layout">
          <!-- Sidebar -->
          <div id="filters">
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
      </section>

      <!-- Explore menu -->
      <section class="filter-intro" style="--accent: var(--color-surface-default)">
        <div class="intro-shell">
          <section id="explore-menu" class="explore-menu-section">
            <div class="section-heading section-heading--spaced">
              <h2 class="section-title">Explore mais</h2>
              <p class="section-desc">
                A partir de <strong>{{ filterValue }}</strong
                >, navegue para outras visões do mesmo conjunto.
              </p>
            </div>

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
                    <span class="explore-chip explore-chip--muted">{{ filterValue }}</span>
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
import { useSheets, useCategoryColors } from '@/composables'

import SearchBar from '@/components/SearchBar.vue'
import ResultCount from '@/components/ResultCount.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import BookCard from '@/components/BookCard.vue'

import type { Book, Options, FilterType, ExploreKey, CategoryType } from '@/types'

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
const colors = useCategoryColors()

const filterType = computed(() => route.name as FilterType)
const filterValue = computed(() => decodeURIComponent(route.params.id as string))
const config = computed(() => filterConfigs[filterType.value] ?? filterConfigs.categoria)

const fixedKey = computed<ExploreKey>(() => (filterType.value === 'mencao' ? 'quem' : filterType.value))

const introAccent = computed(() => {
  if (filterType.value === 'categoria') {
    return colors.categoryColor(filterValue.value as CategoryType)
  }
  return 'var(--color-action-default)'
})

onMounted(() => useSheets().fetchBooks())

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
  if (selectedSubgeneros.value.length) {
    list = list.filter((b) => selectedSubgeneros.value.every((sg) => b.subgenerosArr?.includes(sg)))
  }
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

const routeNameFor = (key: ExploreKey): FilterType => {
  if (key === 'quem') return 'mencao'
  return key
}

const routeFor = (key: ExploreKey, value: string) => ({
  name: routeNameFor(key),
  params: { id: encodeURIComponent(value) },
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

.intro-card {
  display: grid;
  grid-template-columns: 1rem 1fr;
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.intro-rail {
  background: var(--accent);
}

.intro-main {
  padding: 1.5rem;
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

.filter-body {
  padding: 40px 24px 72px;
  display: flex;
  max-width: 1200px;
  flex-direction: column;
  gap: 2rem;
}

.section-heading {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.section-heading--spaced {
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-heading--inline {
  margin-bottom: 1rem;
}

.section-title {
  margin: 0;
  font-family: var(--font-family-display);
  font-size: 1.15rem;
  color: var(--color-text-default);
}

.section-desc {
  margin: 0;
  color: var(--color-text-subtle);
  font-size: 0.92rem;
  line-height: 1.45;
}

.explore-menu-section,
.results-section {
  display: flex;
  flex-direction: column;
}

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
}

.explore-card.is-current {
  background: var(--color-action-background-subtle);
  border-color: rgba(var(--color-action-default-rgb), 0.2);
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
}

.explore-chip:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
  border-color: rgba(var(--color-action-default-rgb), 0.22);
}

.explore-chip--muted {
  background: var(--color-background-subtle);
  color: var(--color-text-subtle);
}

.search-row {
  margin-bottom: 0;
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

.grid-area {
  min-width: 0;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

.empty-state,
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

.retry-btn {
  border: none;
  padding: 10px 20px;
  border-radius: var(--border-radius-sm);
  min-height: 44px;
  font-family: var(--font-family-body);
  font-size: 1rem;
  cursor: pointer;
  background: var(--color-action-default);
  color: var(--color-surface-default);
  transition: opacity var(--motion-transition-default);
}

.retry-btn:hover {
  opacity: 0.85;
  background: var(--color-action-default-hover);
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

@keyframes spin {
  to {
    transform: rotate(360deg);
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

  .intro-card {
    grid-template-columns: 0.85rem 1fr;
  }

  .intro-main {
    padding: 1.125rem;
  }

  .explore-grid {
    grid-template-columns: 1fr;
  }

  .search-row {
    flex-wrap: wrap;
  }

  .books-grid {
    grid-template-columns: 1fr;
  }
}
</style>
