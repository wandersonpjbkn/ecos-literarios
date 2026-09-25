<template>
  <div class="page catalog-page" data-page="catalog">
    <div class="catalog-body">
      <!-- States take only the place of the list (Estados): the header search stays usable -->
      <CatalogSkeleton v-if="booksStore.loading && !booksStore.books.length" />
      <PageStatus
        v-else-if="booksStore.error && !booksStore.books.length"
        :error="booksStore.error"
        error-hint="Se não voltar, avise no grupo."
        :on-retry="retry"
      />
      <template v-else>
        <div v-if="banner" class="catalog-banner" role="status">
          <p>{{ banner }}</p>
          <AppButton v-if="booksStore.error" @click="retry">Tentar de novo</AppButton>
        </div>

        <div class="catalog-bar">
          <header class="catalog-bar__head">
            <h1 class="catalog-bar__title">Catálogo</h1>
            <p class="catalog-bar__summary">
              <span class="catalog-bar__count">{{ summary.count }}</span
              >{{ summary.rest }}
            </p>
          </header>

          <AppButton
            class="catalog-bar__filter"
            variant="soft"
            size="md"
            :aria-expanded="drawerOpen"
            aria-haspopup="dialog"
            @click="drawerOpen = true"
          >
            <BaseIcon name="filter" aria-hidden="true" />
            Filtrar
          </AppButton>

          <!-- Applied filters take the place of the quick chips, next to the result -->
          <div v-if="showApplied" class="catalog-bar__chips">
            <FilterChip
              v-for="chip in appliedChips"
              :key="`${chip.key}-${chip.value}`"
              :label="chip.label"
              :to="hrefToggling(chip.key, chip.value)"
              selected
              removable
            />
            <FilterChip
              v-for="midia in preferenceChips"
              :key="`sem-${midia}`"
              :label="`Sem ${formatName(midia, 1)}`"
              removable
              @click="preferences.toggleMidia(midia)"
            />
            <AppButton class="catalog-bar__clear" variant="ghost" size="md" @click="clearAll"
              >Limpar os filtros</AppButton
            >
          </div>
          <div v-else class="catalog-bar__chips">
            <FilterChip
              v-for="genre in quickGenres"
              :key="genre"
              :label="genre"
              :count="optionCounts.categoria[genre]"
              :to="hrefToggling('categoria', genre)"
            />
          </div>

          <AppSelect v-model="sortOrder" class="catalog-bar__sort" label="Ordenar" :options="sortOptions" />
        </div>

        <BooksGrid v-model="sortedBooks" class="catalog-grid" :eco="showEco ? eco : null" @clear="clearAll" />

        <CatalogShelves v-if="isDefaultView" />

        <FilterDrawer
          :open="drawerOpen"
          :sort-order="sortOrder"
          :sort-options="sortOptions"
          @close="drawerOpen = false"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMediaQuery, useOnline } from '@vueuse/core'

import { useBooksStore, useCacheStore, usePreferencesStore } from '@/stores'
import {
  rememberCatalog,
  useApi,
  useBreakpoints,
  useEcoOfTheWeek,
  useFilters,
  useBookSort,
  usePageMeta,
} from '@/composables'

import AppSelect from '@/components/AppSelect.vue'
import FilterChip from '@/components/FilterChip.vue'
import FilterDrawer from '@/components/FilterDrawer.vue'
import PageStatus from '@/components/PageStatus.vue'
import AppButton from '@/components/AppButton.vue'
import CatalogSkeleton from '@/components/CatalogSkeleton.vue'
import CatalogShelves from '@/components/CatalogShelves.vue'
import BooksGrid from '@/components/BooksGrid.vue'

import type { FilterKey } from '@/types'

usePageMeta({
  title: 'Catálogo de Livros',
  description: 'Os livros, mangás e HQs mencionados no Clube Ecos Literários.',
})

const QUICK_GENRES = 5

// "por" (who mentioned) and "de" (author) keep the two apart without repeating "mencionado por" per chip.
const CHIP_LABEL: Partial<Record<FilterKey, (value: string) => string>> = {
  quem: (value) => `por ${value}`,
  autor: (value) => `de ${value}`,
}

const APPLIED_ORDER: FilterKey[] = ['categoria', 'subgeneros', 'tamanho', 'midia', 'quem', 'autor']

const FORMAT_NAMES: Record<string, [string, string]> = {
  Livro: ['livro', 'livros'],
  Mangá: ['mangá', 'mangás'],
  HQ: ['HQ', 'HQs'],
}

const { search, optionCounts, selected, hasFilters, hrefToggling, clearAll, filtered, hiddenByPreference } =
  useFilters()
const { sortOrder, sortedBooks, sortOptions } = useBookSort(filtered)

onMounted(() => useApi().fetchBooks())

const route = useRoute()
watch(() => route.fullPath, rememberCatalog, { immediate: true })

const preferences = usePreferencesStore()

const booksStore = useBooksStore()
const online = useOnline()

const retry = () => useApi().fetchBooks(true)

// Which list the reader is seeing when the server is down: from today, yesterday or the day it was saved here.
const savedWhen = computed(() => {
  const saved = useCacheStore().ts
  if (!saved) return 'a última lista salva neste aparelho'
  const days = Math.floor((Date.now() - saved) / 86_400_000)
  if (days === 0) return 'a lista de hoje'
  if (days === 1) return 'a lista de ontem'
  return `a lista de ${new Date(saved).toLocaleDateString('pt-BR', { day: 'numeric', month: 'numeric' })}`
})

const banner = computed(() => {
  if (!online.value) return 'Você está sem internet. Dá pra olhar, mas não pra adicionar.'
  if (booksStore.error)
    return `A plataforma está fora do ar agora. Você está vendo ${savedWhen.value}: dá pra olhar, mas não pra adicionar.`
  return ''
})

const drawerOpen = ref(false)

const eco = useEcoOfTheWeek()

// The eco and the shelves belong to the whole catalog; next to a filtered list they would be out of context.
const isDefaultView = computed(() => !hasFilters.value && !search.value.trim())
// Catalog.mobile has no eco. Decided here rather than hidden by CSS, because the eco takes a book's slot.
const isPhone = useMediaQuery(useBreakpoints.isTablet)
const showEco = computed(() => isDefaultView.value && !isPhone.value)

const formatName = (midia: string, count: number) => {
  const [singular, plural] = FORMAT_NAMES[midia] ?? [midia, midia]
  return count === 1 ? singular : plural
}

// A format picked by the link overrides the preference, so its chip only shows when the preference is in force.
const preferenceChips = computed(() => (selected.value.midia.length ? [] : preferences.hiddenMidias))

const showApplied = computed(() => hasFilters.value || preferenceChips.value.length > 0)

const quickGenres = computed(() =>
  Object.entries(optionCounts.value.categoria)
    .sort(([a, x], [b, y]) => y - x || a.localeCompare(b, 'pt-BR'))
    .slice(0, QUICK_GENRES)
    .map(([genre]) => genre),
)

const appliedChips = computed(() =>
  APPLIED_ORDER.flatMap((key) =>
    selected.value[key].map((value) => ({
      key,
      value,
      label: CHIP_LABEL[key]?.(value) ?? value,
    })),
  ),
)

const summary = computed(() => {
  const books = useBooksStore().books
  const total = books.length
  const narrowed = hasFilters.value || !!search.value.trim() || hiddenByPreference.value.length > 0
  const count = narrowed ? `${filtered.value.length} de ${total} livros` : `${total} livros`

  const hidden = hiddenByPreference.value
  if (!hidden.length) return { count, rest: '' }

  const parts = hidden.map(({ midia, count: n }) => `${n} ${formatName(midia, n)}`)
  const onlyOne = hidden.length === 1 && hidden[0]!.count === 1
  return { count, rest: ` · ${parts.join(' e ')} ${onlyOne ? 'está' : 'estão'} fora por sua escolha` }
})
</script>

<style lang="scss" scoped>
.catalog-body {
  margin: 0 auto;
  max-width: 1200px;
  padding: var(--space-5) var(--space-4) var(--space-10);
}

.catalog-banner {
  display: flex;
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-4);

  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-3);

  font-size: 0.9375rem;
  color: var(--alert-ink);

  background: var(--alert-bg);
  border: 1px solid var(--alert-line);
  border-radius: var(--radius-lg);
}

// Phones give the bar no top margin of its own; without this the banner touches "Filtrar".
.catalog-banner + .catalog-bar {
  margin-top: var(--space-4);

  @media (min-width: 768px) {
    margin-top: var(--space-6);
  }
}

.catalog-bar {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'head filter'
    'chips chips';
  align-items: center;
  gap: var(--space-3) var(--space-2);

  @media (min-width: 768px) {
    margin-top: var(--space-6);
    grid-template-columns: auto 1fr auto;
    grid-template-areas:
      'head head head'
      'filter chips sort';
  }

  &__head {
    display: flex;
    grid-area: head;
    align-items: baseline;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-3);
  }

  // The catalog heading stays for screen readers; on phones the count carries the row (Catalog.mobile).
  &__title {
    font-size: 1.375rem;
    font-weight: 700;
    letter-spacing: -0.01em;

    @media (max-width: 767px) {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
    }
  }

  &__summary {
    font-size: 0.9375rem;
    color: var(--color-text-subtle);
  }

  // Phone (Catalog.mobile): with no title on screen, the count leads the row.
  &__count {
    @media (max-width: 767px) {
      font-weight: 700;
      color: var(--color-text-default);
    }
  }

  &__filter {
    grid-area: filter;
    justify-self: start;
  }

  &__chips {
    display: flex;
    grid-area: chips;
    min-width: 0;
    align-items: center;
    gap: var(--space-2);
    overflow-x: auto;
    scrollbar-width: none;

    @media (min-width: 768px) {
      flex-wrap: wrap;
      overflow: visible;
    }
  }

  // On phones the sort lives inside the filter sheet (Catalog.mobile shows only the quick chips).
  &__sort {
    grid-area: sort;

    @media (max-width: 767px) {
      display: none;
    }
  }
}

.catalog-grid {
  margin-top: var(--space-6);
}
</style>
