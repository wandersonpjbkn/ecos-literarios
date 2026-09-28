<template>
  <div class="page catalog-page" data-page="catalog">
    <div class="catalog-body">
      <!-- States take only the place of the list (Estados): the header search stays usable -->
      <CatalogSkeleton v-if="booksStore.loading && !booksStore.books.length" />
      <PageStatus
        v-else-if="booksStore.error && !booksStore.books.length"
        :error="booksStore.error"
        :on-retry="retry"
      />
      <template v-else>
        <AppNotice
          v-if="banner"
          class="catalog-banner"
          live="status"
          :text="banner"
          :retry="!!booksStore.error"
          @retry="retry"
        />

        <div class="catalog-bar">
          <header class="catalog-bar__head">
            <h1 class="catalog-bar__title">Catálogo</h1>
            <LiveStatus :text="announced" />
            <p v-if="booksStore.books.length" class="catalog-bar__summary">
              <span class="catalog-bar__count">{{ summary.count }}</span
              >{{ summary.rest }}
            </p>
          </header>

          <!-- With nothing in the collection there is nothing to filter, sort or count: only the empty state speaks. -->
          <template v-if="booksStore.books.length">
            <AppButton
              class="catalog-bar__filter"
              variant="outline"
              size="md"
              :aria-expanded="drawerOpen"
              aria-haspopup="dialog"
              @click="drawerOpen = true"
            >
              <BaseIcon name="filter" aria-hidden="true" />
              Filtrar
            </AppButton>

            <!-- Applied filters take the place of the quick chips, next to the result -->
            <div v-if="showApplied" class="catalog-bar__chips chip-strip">
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
            <div v-else-if="quickGenres.length" class="catalog-bar__chips chip-strip">
              <FilterChip
                v-for="genre in quickGenres"
                :key="genre"
                :label="genre"
                :count="quickCounts[genre]"
                :to="hrefToggling('categoria', genre)"
              />
            </div>

            <AppSelect v-model="sortOrder" class="catalog-bar__sort" label="Ordenar" :options="sortOptions" />
          </template>
        </div>

        <BooksGrid v-model="sortedBooks" class="catalog-grid" :eco="showEco ? eco : null">
          <template #empty>
            <EmptyState v-if="searchTerm" :title="`Nada com &quot;${searchTerm}&quot;`" :text="searchWhere">
              <AppButton @click="search = ''">Apagar a busca</AppButton>
              <AppButton v-if="hasFilters" @click="clearAll">Limpar os filtros</AppButton>
              <AppButton v-if="canAddBooks && addTarget" :to="addTarget" :disabled="!canWrite">
                Adicionar esse livro
              </AppButton>
            </EmptyState>
            <EmptyState
              v-else-if="!booksStore.books.length"
              title="Nenhum livro no catálogo ainda"
              text="Os livros que o clube adicionar aparecem aqui."
            >
              <AppButton v-if="canAddBooks && addTarget" :to="addTarget" :disabled="!canWrite">
                Adicionar um livro
              </AppButton>
            </EmptyState>
            <EmptyState v-else title="Nenhum livro com esses filtros" :text="describeSelection(selected)">
              <AppButton @click="clearAll">Limpar os filtros</AppButton>
            </EmptyState>
          </template>
        </BooksGrid>

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
import { useMediaQuery, useOnline } from '@vueuse/core'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { joinWords } from '@/data/words'
import type { FilterKey } from '@/types'

import { useBooksStore, useCacheStore, usePermissionsStore, usePreferencesStore } from '@/stores'

import {
  describeSelection,
  rememberCatalog,
  useAddTarget,
  useApi,
  useBreakpoints,
  useCanWrite,
  useEcoOfTheWeek,
  useFilters,
  useBookSort,
  usePageMeta,
} from '@/composables'

import BooksGrid from '@/components/catalog/BooksGrid.vue'
import CatalogShelves from '@/components/catalog/CatalogShelves.vue'
import CatalogSkeleton from '@/components/catalog/CatalogSkeleton.vue'
import FilterDrawer from '@/components/catalog/FilterDrawer.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppNotice from '@/components/ui/AppNotice.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FilterChip from '@/components/ui/FilterChip.vue'
import LiveStatus from '@/components/ui/LiveStatus.vue'
import PageStatus from '@/components/ui/PageStatus.vue'

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

const route = useRoute()

const preferences = usePreferencesStore()

const booksStore = useBooksStore()

const permissions = usePermissionsStore()

usePageMeta({
  title: 'Catálogo',
  description: 'Os livros, mangás e HQs mencionados no Clube Ecos Literários.',
})

const { search, optionCounts, selected, hasFilters, hrefToggling, clearAll, filtered, hiddenByPreference } =
  useFilters()
const { sortOrder, sortedBooks, sortOptions } = useBookSort(filtered)

const online = useOnline()

const eco = useEcoOfTheWeek()

const addTarget = useAddTarget()
const canWrite = useCanWrite()
const isPhone = useMediaQuery(useBreakpoints.isPhone)

const drawerOpen = ref(false)

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
  if (!online.value) return 'Você está sem internet. Os livros continuam visíveis, mas não é possível adicionar.'
  if (booksStore.error)
    return `A plataforma está fora do ar agora. Você está vendo ${savedWhen.value}: os livros continuam visíveis, mas não é possível adicionar.`
  return ''
})

// The eco and the shelves belong to the whole catalog; next to a filtered list they would be out of context.
const isDefaultView = computed(() => !hasFilters.value && !search.value.trim())

// Empty states (COPY.md): say where the search looked; only people who can create books are offered to add one.
const searchTerm = computed(() => search.value.trim())
const searchWhere = computed(() =>
  hasFilters.value
    ? 'Procuramos no título, no autor e no que as pessoas escreveram, dentro dos filtros escolhidos.'
    : 'Procuramos no título, no autor e no que as pessoas escreveram sobre cada livro.',
)

// The API's matrix decides who may add a book (front mirrors backend), not the role.
const canAddBooks = computed(() => permissions.can('books', 'create'))

// Catalog.mobile has no eco. Decided here rather than hidden by CSS, because the eco takes a book's slot.
const showEco = computed(() => isDefaultView.value && !isPhone.value)

// A format picked by the link overrides the preference, so its chip only shows when the preference is in force.
const preferenceChips = computed(() => (selected.value.midia.length ? [] : preferences.hiddenMidias))

const showApplied = computed(() => hasFilters.value || preferenceChips.value.length > 0)

// A chip counts what its click will show: with a search on, the search's result; a zero chip is left out (slice 8d).
const quickCounts = computed<Record<string, number>>(() => {
  if (!searchTerm.value) return optionCounts.value.categoria
  const counts: Record<string, number> = {}
  for (const book of filtered.value) if (book.categoria) counts[book.categoria] = (counts[book.categoria] ?? 0) + 1
  return counts
})

const quickGenres = computed(() =>
  Object.entries(quickCounts.value)
    .filter(([, n]) => n > 0)
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
  const noun = total === 1 ? 'livro' : 'livros'
  const count = narrowed ? `${filtered.value.length} de ${total} ${noun}` : `${total} ${noun}`

  const hidden = hiddenByPreference.value
  if (!hidden.length) return { count, rest: '' }

  const parts = hidden.map(({ midia, count: n }) => `${n} ${formatName(midia, n)}`)
  const onlyOne = hidden.length === 1 && hidden[0]!.count === 1
  return { count, rest: ` · ${joinWords(parts)} ${onlyOne ? 'está' : 'estão'} fora por sua escolha` }
})

// What a screen reader hears after a search or a filter: the count, or the empty result by name.
const announced = computed(() =>
  searchTerm.value && !filtered.value.length ? `Nada com "${searchTerm.value}"` : summary.value.count,
)

const retry = () => useApi().fetchBooks(true)

const formatName = (midia: string, count: number) => {
  const [singular, plural] = FORMAT_NAMES[midia] ?? [midia, midia]
  return count === 1 ? singular : plural
}

onMounted(() => useApi().fetchBooks())

watch(() => route.fullPath, rememberCatalog, { immediate: true })
</script>

<style lang="scss" scoped>
.catalog-body {
  margin: 0 auto;
  max-width: var(--page-max);
  padding: var(--space-5) var(--space-4) var(--space-10);
}

// The look comes from AppNotice; here only its place above the bar.
.catalog-banner {
  margin: var(--space-4) 0 0;
}

// Phones give the bar no top margin of its own; without this the banner touches "Filtrar".
.catalog-banner + .catalog-bar {
  margin-top: var(--space-4);

  @media (min-width: $bp-tablet-min) {
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

  @media (min-width: $bp-tablet-min) {
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
    font-size: var(--font-size-title);
    font-weight: var(--font-weight-bold);
    letter-spacing: var(--letter-spacing-title);

    @media (max-width: $bp-phone-max) {
      @include visually-hidden;
    }
  }

  &__summary {
    font-size: var(--font-size-ui);
    color: var(--color-text-subtle);
  }

  // Phone (Catalog.mobile): with no title on screen, the count leads the row.
  &__count {
    @media (max-width: $bp-phone-max) {
      font-weight: var(--font-weight-bold);
      color: var(--color-text-default);
    }
  }

  &__filter {
    grid-area: filter;
    justify-self: start;
  }

  &__chips {
    grid-area: chips;
  }

  // On phones the sort lives inside the filter sheet (Catalog.mobile shows only the quick chips).
  &__sort {
    grid-area: sort;

    @media (max-width: $bp-phone-max) {
      display: none;
    }
  }
}

.catalog-grid {
  margin-top: var(--space-6);
}
</style>
