<template>
  <div class="area-section">
    <SectionHeader title="Livros">
      <span v-if="books.length">{{ summary }}</span>
      <span v-else>Os livros do acervo: adicione, corrija ou remova.</span>
      <template v-if="canCreate && books.length" #actions>
        <AppButton variant="primary" :disabled="!canWrite" @click="openCreate()">Adicionar um livro</AppButton>
      </template>
    </SectionHeader>

    <BaseSpinner v-if="booksStore.loading && !books.length">
      <p>Carregando livros…</p>
    </BaseSpinner>

    <AppNotice
      v-else-if="booksStore.error && !books.length"
      text="Não foi possível carregar os livros. Tente de novo."
      retry
      @retry="retry"
    />

    <EmptyState
      v-else-if="books.length === 0"
      title="Nenhum livro no acervo ainda"
      text="Os livros que o clube adicionar aparecem aqui."
    >
      <AppButton v-if="canCreate" variant="primary" :disabled="!canWrite" @click="openCreate()">
        Adicionar um livro
      </AppButton>
    </EmptyState>

    <template v-else>
      <AppNotice v-if="banner" live="status" :text="banner" :retry="!!booksStore.error" @retry="retry" />

      <div class="books-toolbar">
        <div class="books-segments chip-strip" role="group" aria-label="Mostrar">
          <FilterChip
            v-for="option in SEGMENTS"
            :key="option.value"
            :label="option.label"
            :count="segmentCounts[option.value]"
            :selected="segment.value === option.value"
            :to="segmentLink(option.value)"
          />
        </div>

        <SearchBar
          v-model="searchQuery"
          class="books-search"
          placeholder="Buscar no acervo"
          :suggestions="searchSuggestions"
          :total="segmentBooks.length"
          :filtered="filteredBooks.length"
          @select="onSelectSuggestion"
        />
      </div>

      <EmptyState
        v-if="filteredBooks.length === 0 && searchQuery"
        :title="`Nada com &quot;${searchQuery}&quot;`"
        :text="searchWhere"
      >
        <AppButton @click="searchQuery = ''">Apagar a busca</AppButton>
        <AppButton v-if="canCreate" :disabled="!canWrite" @click="openCreate(searchQuery)"
          >Adicionar esse livro</AppButton
        >
      </EmptyState>

      <EmptyState v-else-if="filteredBooks.length === 0" :title="segment.empty.title" :text="segment.empty.text">
        <AppButton :to="segmentLink('all')">Ver todos os livros</AppButton>
      </EmptyState>

      <div v-else ref="table" class="books-table panel-box" role="table" aria-label="Livros do acervo">
        <div class="books-table__row books-table__row--head panel-row" role="row">
          <span role="columnheader">Título</span>
          <span role="columnheader">Autor</span>
          <span role="columnheader">Gênero</span>
          <span role="columnheader">Formato</span>
          <span role="columnheader">Quem mencionou</span>
          <span role="columnheader">Faltando</span>
          <span role="columnheader" class="visually-hidden">Ações</span>
        </div>

        <div
          v-for="book in pageItems"
          :key="book.id"
          class="books-table__row panel-row"
          role="row"
          tabindex="-1"
          data-list-item
        >
          <span role="cell" class="books-table__title">{{ book.titulo }}</span>
          <span role="cell" class="books-table__field" data-label="Autor">{{
            authorLine(book.authors) || 'sem autor'
          }}</span>
          <span role="cell" class="books-table__field" data-label="Gênero">{{ book.categoria || 'sem gênero' }}</span>
          <span role="cell" class="books-table__field" data-label="Formato">{{ book.midia || 'sem formato' }}</span>
          <span role="cell" class="books-table__field" data-label="Quem mencionou">{{ book.person || 'ninguém' }}</span>
          <span role="cell" class="books-table__missing" data-label="Faltando">{{ missingLabel(book) }}</span>
          <span role="cell" class="books-table__actions">
            <AppButton
              v-if="permissions.canEditBook(book.quem_user_id)"
              size="md"
              :disabled="!canWrite"
              @click="openEdit(book)"
            >
              <BaseIcon name="pencil" aria-hidden="true" />
              {{ bookForm.loadingId.value === book.id ? 'Abrindo…' : 'Editar'
              }}<span class="visually-hidden">{{ ' ' }}{{ book.titulo }}</span>
            </AppButton>
          </span>
        </div>
      </div>

      <ListFooter
        v-if="filteredBooks.length"
        :shown="pageItems.length"
        :total="filteredBooks.length"
        :next-batch="nextBatch"
        @more="more(table)"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'

import { authorLine } from '@/data/authors'
import { matchesSearch, titleSuggestions } from '@/data/bookSearch'
import { joinWords } from '@/data/words'
import type { Book, Suggestion, SegmentFilter } from '@/types'

import { useBooksStore, usePermissionsStore } from '@/stores'

import { useApi, useBookForm, useCanWrite, useCatalogNotice } from '@/composables'
import { useLoadMore } from '@/composables/useLoadMore'
import { useSegments, type SegmentOption } from '@/composables/useSegments'

import AppButton from '@/components/ui/AppButton.vue'
import AppNotice from '@/components/ui/AppNotice.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FilterChip from '@/components/ui/FilterChip.vue'
import ListFooter from '@/components/ui/ListFooter.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'

const booksStore = useBooksStore()
const permissions = usePermissionsStore()
const bookForm = useBookForm()
const banner = useCatalogNotice()
const canWrite = useCanWrite()

const table = ref<HTMLElement | null>(null)
const books = computed(() => booksStore.books)
const searchQuery = ref('')

const canCreate = computed(() => permissions.can('books', 'create'))

const summary = computed(() => {
  const missing = segmentCounts.value.missing
  const total = `${books.value.length} no acervo`
  return missing ? `${total} · ${missing} com algo faltando` : `${total} · todos completos`
})

const filteredBooks = computed(() => segmentBooks.value.filter((book) => matchesSearch(book, searchQuery.value)))

const { visible: pageItems, nextBatch, more, reset } = useLoadMore(filteredBooks, { name: 'painel-livros' })

const searchWhere = computed(() =>
  segment.value.value === 'all'
    ? 'Procuramos no título, no autor e no comentário de cada livro.'
    : `Procuramos no título, no autor e no comentário, só entre os livros em "${segment.value.label}".`,
)

const searchSuggestions = computed(() => titleSuggestions(filteredBooks.value, searchQuery.value))

const isMissingField = (value?: string | null) => !value || !value.trim()

const FIELDS: { label: string; missing: (book: Book) => boolean }[] = [
  { label: 'capa', missing: (b) => isMissingField(b.cover_url) },
  { label: 'ISBN', missing: (b) => isMissingField(b.isbn) },
  { label: 'sinopse', missing: (b) => isMissingField(b.synopsis) },
  { label: 'páginas', missing: (b) => !b.page_count },
  { label: 'ano', missing: (b) => !b.published_year },
  { label: 'comentário', missing: (b) => isMissingField(b.porque) },
  { label: 'subgêneros', missing: (b) => b.subgenreNames.length === 0 },
  { label: 'autor', missing: (b) => !b.authors.some((name) => !isMissingField(name)) },
  { label: 'gênero', missing: (b) => isMissingField(b.categoria) },
  { label: 'formato', missing: (b) => isMissingField(b.midia) },
  { label: 'título', missing: (b) => isMissingField(b.titulo) },
]

const missingFields = (book: Book) => FIELDS.filter((field) => field.missing(book)).map((field) => field.label)

const hasMissingData = (book: Book) => missingFields(book).length > 0

const SEGMENTS: SegmentOption<SegmentFilter, Book>[] = [
  { value: 'all', label: 'Todos', test: () => true, empty: { title: 'Nenhum livro no acervo ainda' } },
  {
    value: 'missing',
    label: 'Faltando algo',
    query: 'faltando',
    test: hasMissingData,
    empty: { title: 'Todos os livros do acervo estão com a ficha completa' },
  },
  {
    value: 'complete',
    label: 'Completos',
    query: 'completos',
    test: (b) => !hasMissingData(b),
    empty: {
      title: 'Nenhum livro completo ainda',
      text: `Um livro fica completo quando tem ${joinWords(FIELDS.map((field) => field.label))}.`,
    },
  },
  {
    value: 'missing-isbn',
    label: 'Sem ISBN',
    query: 'sem-isbn',
    test: (b) => isMissingField(b.isbn),
    empty: { title: 'Todos os livros do acervo têm ISBN' },
  },
]

const {
  current: segment,
  counts: segmentCounts,
  link: segmentLink,
  inCurrent: segmentBooks,
} = useSegments(SEGMENTS, books)

const missingLabel = (book: Book) => {
  const fields = missingFields(book)
  if (fields.length === 0) return 'nada'
  if (fields.length <= 2) return joinWords(fields)
  return `${fields.slice(0, 2).join(', ')} e mais ${fields.length - 2}`
}

const retry = () => useApi().fetchBooks()

const onSelectSuggestion = (suggestion: Suggestion) => {
  searchQuery.value = suggestion.main
}

const firstRow = () => table.value?.querySelector<HTMLElement>('[data-list-item]')
const openCreate = (title = '') => bookForm.openAdd({ title, fallback: firstRow })
const openEdit = (book: Book) => bookForm.openEdit(book.id, { fallback: firstRow })

watch(searchQuery, () => reset())

onMounted(() => useApi().fetchBooks())
</script>

<style lang="scss" scoped>
.books-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.books-search {
  flex: 0 1 var(--panel-search);
}

.books-table {
  overflow: hidden;

  &__row {
    display: grid;
    grid-template-columns:
      minmax(var(--col-xl), 2.4fr) minmax(var(--col-lg), 1.4fr) minmax(var(--col-md), 1fr) minmax(var(--col-sm), 0.8fr)
      minmax(var(--col-md), 1.1fr) minmax(var(--col-md), 1.2fr) var(--col-actions);
    align-items: center;
    gap: var(--space-3);
    min-height: var(--row-min);
    font-size: var(--font-size-meta);

    &--head {
      min-height: var(--touch-min);
      background: var(--color-background-subtle);
      font-size: var(--font-size-caption);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
    }
  }

  &__title {
    min-width: 0;
    padding: var(--space-2) 0;
    font-size: var(--font-size-ui);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-default);
  }

  &__field {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--color-text-secondary);
  }

  &__missing {
    min-width: 0;
    padding: var(--space-2) 0;
    color: var(--color-text-default);
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-1);
  }
}

@media (max-width: $bp-phone-max) {
  .books-search {
    flex: 1 1 100%;
  }

  .books-table__row {
    grid-template-columns: 1fr;
    gap: var(--space-1) var(--space-3);
    padding-block: var(--space-3);

    &--head {
      display: none;
    }
  }

  .books-table__title {
    grid-column: 1;
  }

  .books-table__actions {
    grid-row: auto;
    grid-column: 1 / -1;
    justify-self: end;
  }

  .books-table__field,
  .books-table__missing {
    grid-column: 1 / -1;
    white-space: normal;

    &::before {
      content: attr(data-label) ': ';
      color: var(--color-text-subtle);
    }
  }
}
</style>
