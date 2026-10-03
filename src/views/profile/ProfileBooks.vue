<template>
  <div class="my-books">
    <header class="my-books__head">
      <div>
        <h1 class="my-books__title">Meus livros</h1>
        <p class="my-books__subtitle">
          Os livros que você mencionou no grupo, os que adicionou aqui e os que marcou em Quero ler e Lidos.
        </p>
      </div>
      <LiveStatus :text="announced" />
    </header>

    <AppNotice v-if="editor.error.value" :text="editor.error.value" />

    <BaseSpinner v-if="loading && !myBooks.length">
      <p>Carregando seus livros…</p>
    </BaseSpinner>

    <AppNotice
      v-else-if="booksStore.error && !booksStore.books.length"
      text="Não foi possível carregar os livros. Tente de novo."
      retry
      @retry="useApi().fetchBooks()"
    />

    <ListTabs v-else :tabs="shelfTabs" :active="shelf" label="Prateleiras" @select="selectShelf">
      <p v-if="shelf === 'estante' && hasClaim === false && canClaim" class="my-books__hint">
        Faltou algum livro seu? Os livros da conversa do grupo aparecem aqui quando você vincula o seu nome.
        <RouterLink :to="claimLink" class="my-books__hint-link">Vincular meu nome</RouterLink>
      </p>

      <div class="my-books__toolbar">
        <div v-if="shelf === 'estante'" class="my-books__segments chip-strip" role="group" aria-label="Mostrar">
          <FilterChip
            v-for="option in SEGMENTS"
            :key="option.value"
            :label="option.label"
            :count="segmentCounts[option.value]"
            :selected="segment.value === option.value"
            :to="segmentLink(option.value)"
          />
        </div>
        <div class="my-books__controls">
          <AppSelect v-model="sortOrder" label="Ordenar" :options="shelfSortOptions" />
        </div>
      </div>

      <EmptyState
        v-if="!filteredBooks.length && searchQuery"
        :title="`Nada com &quot;${searchQuery}&quot;`"
        text="Procuramos no título e no autor dos seus livros."
      >
        <AppButton :to="{ query: { ...route.query, busca: undefined } }">Apagar a busca</AppButton>
      </EmptyState>

      <EmptyState
        v-else-if="shelf === 'estante' && !myBooks.length"
        title="Nenhum livro com o seu nome ainda"
        :text="emptyText"
      >
        <AppButton v-if="canClaim" variant="primary" :to="claimLink">Vincular meu nome</AppButton>
        <AppButton v-else-if="accessRequest" variant="primary" :href="accessRequest"
          ><BaseIcon name="whatsapp" aria-hidden="true" />Pedir a liberação</AppButton
        >
      </EmptyState>

      <EmptyState
        v-else-if="shelf !== 'estante' && !filteredBooks.length"
        :title="shelfEmpty.title"
        :text="shelfEmpty.text"
      >
        <AppButton :to="{ name: 'catalog-books' }">Ver o catálogo</AppButton>
      </EmptyState>

      <EmptyState v-else-if="!filteredBooks.length" :title="segment.empty.title" :text="segment.empty.text">
        <AppButton :to="segmentLink('all')">Ver todos os seus livros</AppButton>
      </EmptyState>

      <ul v-else ref="grid" class="my-books__grid book-grid">
        <li v-for="book in visibleBooks" :key="book.id" class="my-book">
          <BookCard :book="book" :hide-mention="shelf === 'estante'" data-list-item />
          <div class="my-book__foot">
            <AppButton v-if="permissions.canEditBook(book.quem_user_id)" size="md" @click="editor.openEdit(book.id)">
              <BaseIcon name="pencil" aria-hidden="true" />
              {{ editor.loadingId.value === book.id ? 'Abrindo…' : 'Editar' }}
              <span class="visually-hidden">{{ book.titulo }}</span>
            </AppButton>
          </div>
        </li>
      </ul>

      <ListFooter
        v-if="filteredBooks.length"
        :shown="visibleBooks.length"
        :total="filteredBooks.length"
        :next-batch="nextBatch"
        @more="more(grid)"
      />
    </ListTabs>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router'

import type { Book } from '@/types'

import { useAuthStore, useBooksStore, usePermissionsStore, useReadingStore } from '@/stores'

import {
  loadMyReading,
  rememberMyBooks,
  useAccessRequest,
  useApi,
  useBookForm,
  useBookSort,
  usePageMeta,
} from '@/composables'
import { getMyClaimStatus } from '@/composables/useApi'
import { useLoadMore } from '@/composables/useLoadMore'
import { useSegments, type SegmentOption } from '@/composables/useSegments'

import BookCard from '@/components/books/BookCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppNotice from '@/components/ui/AppNotice.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FilterChip from '@/components/ui/FilterChip.vue'
import ListFooter from '@/components/ui/ListFooter.vue'
import ListTabs from '@/components/ui/ListTabs.vue'
import LiveStatus from '@/components/ui/LiveStatus.vue'

type Segment = 'all' | 'no-cover' | 'no-synopsis'
type Shelf = 'estante' | 'quero-ler' | 'lidos'

const SHELVES: { value: Shelf; label: string }[] = [
  { value: 'estante', label: 'Estante' },
  { value: 'quero-ler', label: 'Quero ler' },
  { value: 'lidos', label: 'Lidos' },
]

const SHELF_EMPTY: Record<Exclude<Shelf, 'estante'>, { title: string; text: string }> = {
  'quero-ler': {
    title: 'Nenhum livro em Quero ler ainda',
    text: 'Na página de um livro, use “Guardar em Quero ler” para ele aparecer aqui.',
  },
  lidos: { title: 'Nenhum livro marcado como lido', text: 'Na página de um livro, use “Marcar como lido”.' },
}

const SEGMENTS: SegmentOption<Segment, Book>[] = [
  { value: 'all', label: 'Todos', test: () => true, empty: { title: 'Nenhum livro com o seu nome ainda' } },
  {
    value: 'no-cover',
    label: 'Sem capa',
    query: 'sem-capa',
    test: (b) => !b.cover_url,
    empty: { title: 'Todos os seus livros têm capa' },
  },
  {
    value: 'no-synopsis',
    label: 'Sem sinopse',
    query: 'sem-sinopse',
    test: (b) => !b.synopsis,
    empty: { title: 'Todos os seus livros têm sinopse' },
  },
]

const claimLink: RouteLocationRaw = { name: 'account-claim' }

const route = useRoute()
const router = useRouter()

const authStore = useAuthStore()
const booksStore = useBooksStore()
const readingStore = useReadingStore()

usePageMeta({
  title: 'Meus livros',
  description: 'Os livros que você mencionou no grupo, os que adicionou aqui e os que marcou em Quero ler e Lidos.',
})

const editor = useBookForm()

const grid = ref<HTMLElement | null>(null)

const hasClaim = ref<boolean | null>(null)

const permissions = usePermissionsStore()
const canClaim = computed(() => permissions.can('claim', 'update'))
const accessRequest = useAccessRequest()
const emptyText = computed(() => {
  if (canClaim.value)
    return 'Aqui aparecem os livros que você mencionou no grupo, depois que você vincula a sua conta ao nome que aparece neles.'
  if (accessRequest.value)
    return 'Se você é do clube, peça a liberação para vincular o seu nome e ver aqui os livros que mencionou no grupo.'
  return 'Aqui aparecem os livros mencionados por você.'
})

const searchQuery = computed(() => String(route.query.busca ?? ''))

const loading = computed(() => booksStore.loading)

const myBooks = computed(() => booksStore.books.filter((book) => book.quem_user_id === authStore.user?._id))

const withStatus = (status: 'quero_ler' | 'lido') =>
  booksStore.books.filter((book) => readingStore.statuses[book.id] === status)

const shelfItems = computed<Record<Shelf, Book[]>>(() => ({
  estante: myBooks.value,
  'quero-ler': withStatus('quero_ler'),
  lidos: withStatus('lido'),
}))

const shelfTabs = computed(() =>
  SHELVES.map((option) => ({ key: option.value, label: option.label, count: shelfItems.value[option.value].length })),
)

const shelf = computed<Shelf>(() => SHELVES.find((option) => option.value === route.query.lista)?.value ?? 'estante')

const selectShelf = (key: string) => router.replace({ query: { ...route.query, lista: key, mostrar: undefined } })

const shelfEmpty = computed(() => SHELF_EMPTY[shelf.value as Exclude<Shelf, 'estante'>])

const {
  current: segment,
  counts: segmentCounts,
  link: segmentLink,
  inCurrent: segmentBooks,
} = useSegments(SEGMENTS, myBooks)

const shelfBooks = computed(() => (shelf.value === 'estante' ? segmentBooks.value : shelfItems.value[shelf.value]))

const searched = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return shelfBooks.value
  return shelfBooks.value.filter(
    (b) => b.titulo.toLowerCase().includes(q) || b.authors.some((name) => name.toLowerCase().includes(q)),
  )
})

const { sortOrder, sortOptions, sortedBooks: filteredBooks } = useBookSort(searched)

const shelfSortOptions = computed(() =>
  shelf.value === 'estante' ? sortOptions.filter((option) => option.value !== 'pessoa') : sortOptions,
)

const { visible: visibleBooks, nextBatch, more } = useLoadMore(filteredBooks, { name: 'meus-livros' })

const announced = computed(() => {
  if (searchQuery.value && !filteredBooks.value.length) return `Nada com "${searchQuery.value}"`
  const n = filteredBooks.value.length
  const total = shelfItems.value[shelf.value].length
  const name = SHELVES.find((option) => option.value === shelf.value)!.label
  return `${name}: ${n} de ${total} ${total === 1 ? 'livro' : 'livros'}`
})

watch(
  () => route.fullPath,
  (path) => {
    if (route.name === 'profile-books') rememberMyBooks(path)
  },
  { immediate: true },
)

watch(() => authStore.user?._id, loadMyReading, { immediate: true })

onMounted(async () => {
  hasClaim.value = await getMyClaimStatus()
    .then((status) => status.has_claim)
    .catch(() => null)
})
</script>

<style lang="scss" scoped>
.my-books {
  max-width: var(--page-max);
  margin: 0 auto;
  padding: var(--space-5) var(--space-4) var(--space-10);

  @media (min-width: $bp-tablet-min) {
    padding-top: var(--space-8);
  }

  &__head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-2) var(--space-4);
    margin-bottom: var(--space-5);
  }

  &__title {
    margin: 0;
    font-size: var(--font-size-title);
    font-weight: var(--font-weight-bold);
    letter-spacing: var(--letter-spacing-title);
    color: var(--color-text-default);
  }

  &__subtitle {
    margin: var(--space-1) 0 0;
    font-size: var(--font-size-body);
    color: var(--color-text-secondary);
  }

  &__hint {
    margin: 0 0 var(--space-5);
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    background: var(--color-background-subtle);
    font-size: var(--font-size-ui);
    color: var(--color-text-secondary);
  }

  &__hint-link {
    @include text-link;

    display: inline-flex;
    min-height: var(--touch-min);
    align-items: center;
    font-weight: var(--font-weight-semibold);
  }

  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    margin-bottom: var(--space-5);
  }

  &__controls {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  &__grid {
    margin: 0;
    padding: 0;
    list-style: none;
  }
}

.my-book {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--space-2);

  &__foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1) var(--space-2);
  }
}

@media (max-width: $bp-phone-max) {
  .my-books__controls {
    width: 100%;
  }
}
</style>
