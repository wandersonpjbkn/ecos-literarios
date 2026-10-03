<template>
  <div class="area-section">
    <SectionHeader title="Livros">
      <span v-if="books.length">{{ summary }}</span>
      <span v-else>Os livros do acervo: adicione, corrija ou remova.</span>
      <template v-if="canCreate && books.length" #actions>
        <AppButton variant="primary" @click="openCreate()">Adicionar um livro</AppButton>
      </template>
    </SectionHeader>

    <AppNotice v-if="loadError" :text="loadError" retry @retry="fetchBooks()" />

    <BaseSpinner v-if="loading">
      <p>Carregando livros…</p>
    </BaseSpinner>

    <EmptyState
      v-else-if="!loadError && books.length === 0"
      title="Nenhum livro no acervo ainda"
      text="Os livros que o clube adicionar aparecem aqui."
    >
      <AppButton v-if="canCreate" variant="primary" @click="openCreate()">Adicionar um livro</AppButton>
    </EmptyState>

    <template v-else-if="books.length">
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
        <AppButton v-if="canCreate" @click="openCreate(searchQuery)">Adicionar esse livro</AppButton>
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
          :key="book._id"
          class="books-table__row panel-row"
          role="row"
          tabindex="-1"
          data-list-item
        >
          <span role="cell" class="books-table__title">{{ book.titulo }}</span>
          <span role="cell" class="books-table__field" data-label="Autor">{{
            authorLine(authorsOf(book)) || 'sem autor'
          }}</span>
          <span role="cell" class="books-table__field" data-label="Gênero">{{
            resolveName(book.categoria) || 'sem gênero'
          }}</span>
          <span role="cell" class="books-table__field" data-label="Formato">{{
            resolveName(book.midia) || 'sem formato'
          }}</span>
          <span role="cell" class="books-table__field" data-label="Quem mencionou">{{
            personName(book) || 'ninguém'
          }}</span>
          <span role="cell" class="books-table__missing" data-label="Faltando">{{ missingLabel(book) }}</span>
          <span role="cell" class="books-table__actions">
            <AppButton v-if="permissions.canEditBook(book.quem_user_id?._id)" size="md" @click="openEdit(book)">
              <BaseIcon name="pencil" aria-hidden="true" />
              {{ bookForm.loadingId.value === book._id ? 'Abrindo…' : 'Editar'
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
import { personName } from '@/data/person'
import { joinWords } from '@/data/words'
import type { Suggestion, SegmentFilter, AdminBook } from '@/types'

import { usePermissionsStore } from '@/stores'

import { useBookForm, useErrorReporter } from '@/composables'
import { errorText } from '@/composables/apiError'
import { getPanelBooks } from '@/composables/useApi'
import { useLoadMore } from '@/composables/useLoadMore'
import { useSegments, type SegmentOption } from '@/composables/useSegments'

import AppButton from '@/components/ui/AppButton.vue'
import AppNotice from '@/components/ui/AppNotice.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FilterChip from '@/components/ui/FilterChip.vue'
import ListFooter from '@/components/ui/ListFooter.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'

const permissions = usePermissionsStore()
const bookForm = useBookForm()

const table = ref<HTMLElement | null>(null)
const books = ref<AdminBook[]>([])
const loading = ref(false)
const loadError = ref('')
const searchQuery = ref('')

const canCreate = computed(() => permissions.can('books', 'create'))

const summary = computed(() => {
  const missing = segmentCounts.value.missing
  const total = `${books.value.length} no acervo`
  return missing ? `${total} · ${missing} com algo faltando` : `${total} · todos completos`
})

const filteredBooks = computed(() => {
  if (!searchQuery.value.trim()) return segmentBooks.value
  const q = searchQuery.value.toLowerCase()
  return segmentBooks.value.filter(
    (b) => b.titulo.toLowerCase().includes(q) || authorsOf(b).some((name) => name.toLowerCase().includes(q)),
  )
})

const { visible: pageItems, nextBatch, more, reset } = useLoadMore(filteredBooks, { name: 'painel-livros' })

const searchWhere = computed(() =>
  segment.value.value === 'all'
    ? 'Procuramos no título e no autor de cada livro.'
    : `Procuramos no título e no autor, só entre os livros em "${segment.value.label}".`,
)

const searchSuggestions = computed(() => {
  if (!searchQuery.value.trim() || searchQuery.value.length < 2) return []

  const q = searchQuery.value.toLowerCase()

  return filteredBooks.value
    .filter((b) => b.titulo?.toLowerCase().includes(q))
    .map((b) => {
      return {
        id: b._id,
        main: b.titulo,
        sub: authorLine(authorsOf(b)),
      }
    })
    .slice(0, 8)
})

const resolveName = (field: string | { nome: string } | undefined): string =>
  !field ? '' : typeof field === 'string' ? field : field.nome
const authorsOf = (book: AdminBook) => book.authors.map(resolveName)

const isMissingField = (value?: string | null) => !value || !value.trim()

const FIELDS: { label: string; missing: (book: AdminBook) => boolean }[] = [
  { label: 'capa', missing: (b) => isMissingField(b.cover_url) },
  { label: 'ISBN', missing: (b) => isMissingField(b.isbn) },
  { label: 'sinopse', missing: (b) => isMissingField(b.synopsis) },
  { label: 'páginas', missing: (b) => !b.page_count },
  { label: 'ano', missing: (b) => !b.published_year },
  { label: 'comentário', missing: (b) => isMissingField(b.porque) },
  { label: 'subgêneros', missing: (b) => b.subgeneros.length === 0 },
  { label: 'autor', missing: (b) => !authorsOf(b).some((name) => !isMissingField(name)) },
  { label: 'gênero', missing: (b) => isMissingField(resolveName(b.categoria)) },
  { label: 'formato', missing: (b) => isMissingField(resolveName(b.midia)) },
  { label: 'título', missing: (b) => isMissingField(b.titulo) },
]

const missingFields = (book: AdminBook) => FIELDS.filter((field) => field.missing(book)).map((field) => field.label)

const hasMissingData = (book: AdminBook) => missingFields(book).length > 0

const SEGMENTS: SegmentOption<SegmentFilter, AdminBook>[] = [
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

const missingLabel = (book: AdminBook) => {
  const fields = missingFields(book)
  if (fields.length === 0) return 'nada'
  if (fields.length <= 2) return joinWords(fields)
  return `${fields.slice(0, 2).join(', ')} e mais ${fields.length - 2}`
}

const fetchBooks = async (quiet = false) => {
  if (!quiet) loading.value = true
  loadError.value = ''

  try {
    books.value = await getPanelBooks()
  } catch (e) {
    loadError.value = errorText(e, 'Não foi possível carregar os livros. Tente de novo.')
    useErrorReporter().captureException(e, { context: 'AdminBooks.fetchBooks' })
    console.error('[AdminBooks]', e)
  } finally {
    loading.value = false
  }
}

const onSelectSuggestion = (suggestion: Suggestion) => {
  searchQuery.value = suggestion.main
}

const firstRow = () => table.value?.querySelector<HTMLElement>('[data-list-item]')
const openCreate = (title = '') => bookForm.openAdd({ title, fallback: firstRow })
const openEdit = (book: AdminBook) => bookForm.openEdit(book._id, { fallback: firstRow })

watch(bookForm.lastChange, (change) => {
  if (change?.kind === 'removed') books.value = books.value.filter((b) => b._id !== change.id)
  else if (change) fetchBooks(true)
})

watch(searchQuery, () => reset())

onMounted(() => fetchBooks())
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
