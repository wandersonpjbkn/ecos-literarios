<template>
  <div class="book-page" data-page="book">
    <PageStatus
      :loading="booksStore.loading && !book"
      :error="!book && !booksStore.books.length ? booksStore.error : null"
      :on-retry="retry"
      loading-text="Carregando livro…"
      what="o livro"
    />

    <!-- Shown with an empty collection too: a link to a book that is not there never lands on a blank page. -->
    <EmptyState
      v-if="!booksStore.loading && !book && !(booksStore.error && !booksStore.books.length)"
      title-tag="h1"
      title="Não achamos esse livro"
      text="Ele pode ter saído do catálogo, ou o link chegou incompleto."
    >
      <AppButton variant="primary" :to="lastCatalog">Voltar ao catálogo</AppButton>
    </EmptyState>

    <template v-if="book">
      <RouterLink :to="lastList.path" class="book-page__back">
        <BaseIcon name="arrow-left" aria-hidden="true" />
        Voltar {{ lastList.label }}
      </RouterLink>

      <div class="book-page__layout">
        <header class="book-page__head">
          <div class="book-page__badges">
            <FilterChip v-if="book.midia" :label="book.midia" :to="catalogLink('midia', book.midia)" />
            <FilterChip v-if="book.categoria" :label="genre" :to="catalogLink('categoria', book.categoria)" />
          </div>
          <h1 class="book-page__title">{{ book.titulo }}</h1>
          <p v-if="book.authors.length" class="book-page__authors">
            <template v-for="(author, index) in book.authors" :key="author">
              <RouterLink :to="catalogLink('authors', author)" class="book-page__author">{{ author }}</RouterLink
              >{{ separator(index) }}
            </template>
          </p>
          <p v-if="book.person" class="book-page__mention">
            mencionado por
            <RouterLink :to="catalogLink('person', book.person)" class="book-page__person">{{
              book.person
            }}</RouterLink>
          </p>
        </header>

        <aside class="book-page__side">
          <CoverBlock
            class="book-page__cover"
            size="page"
            :title="book.titulo"
            :genre="book.categoria"
            :format="book.midia"
            :cover-url="book.cover_url"
          />
          <ReadingActions :book-id="book.id" />
          <ShareButton :title="book.titulo" :path="bookPath" />
        </aside>

        <div class="book-page__main">
          <BookFacts :book="book" />

          <QuoteBlock
            :text="book.porque"
            :person="book.person"
            :is-author="isOwner"
            :can-write="canWrite"
            :ask-link="askPerson"
            @write="openEditor(book.id, 'porque')"
          />

          <div>
            <BookFixLine
              :book="book"
              :can-edit="canEdit"
              :can-write="canWrite"
              :ask-link="report"
              @edit="openEditor(book.id)"
            />
            <AppNotice v-if="editError" :text="editError" retry @retry="openEditor(book.id, editFocus)" />
          </div>

          <section v-if="book.synopsis" class="book-page__about" aria-labelledby="about-title">
            <h2 id="about-title" class="book-page__section-title">Sobre o livro</h2>
            <p :id="synopsisId" class="book-page__synopsis" :class="{ 'is-collapsed': !synopsisOpen }">
              {{ book.synopsis }}
            </p>
            <AppButton
              v-if="synopsisIsLong"
              variant="ghost"
              size="md"
              class="book-page__more"
              :aria-expanded="synopsisOpen"
              :aria-controls="synopsisId"
              @click="synopsisOpen = !synopsisOpen"
            >
              {{ synopsisOpen ? 'Mostrar menos' : 'Ler o resto' }}
            </AppButton>
          </section>

          <section v-if="book.subgenreNames.length" class="book-page__tags" aria-labelledby="tags-title">
            <h2 id="tags-title" class="book-page__section-title">Subgêneros</h2>
            <div class="book-page__chips">
              <FilterChip
                v-for="tag in book.subgenreNames"
                :key="tag"
                :label="tag"
                :to="catalogLink('subgenres', tag)"
              />
            </div>
          </section>
        </div>

        <!-- After the file and comment in the DOM too, so reading and Tab order match the phone. -->
        <WhereToFind class="book-page__where" :book="book" />
      </div>

      <section v-if="related.length" class="related" aria-labelledby="related-title">
        <div class="related__head">
          <h2 id="related-title" class="related__title">Outros de {{ genre }}</h2>
          <RouterLink :to="catalogLink('categoria', book.categoria)" class="related__all">
            Ver os {{ genreTotal }} de {{ genre }}
            <BaseIcon name="arrow-right" aria-hidden="true" />
          </RouterLink>
        </div>
        <div class="related__grid">
          <BookCard v-for="item in related" :key="item.id" :book="item" />
        </div>
      </section>

      <p v-if="coverPage" class="cover-credit">
        <a :href="coverPage" target="_blank" rel="noopener noreferrer" class="cover-credit__link"
          >A capa deste livro veio do Google Books<span class="visually-hidden">{{ ' (abre em outra aba)' }}</span
          ><BaseIcon name="external" class="cover-credit__arrow" aria-hidden="true"
        /></a>
        <PoweredByGoogle />
      </p>

      <BookFormDrawer
        :book="editingBook"
        :is-open="isEditing"
        :focus="editFocus"
        scope="member"
        @close="closeEditor"
        @saved="onSaved"
        @removed="onRemoved"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, useId, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { authorNames } from '@/data/authors'
import { googleBooksPage } from '@/data/googleBooks'
import type { Book } from '@/types'

import { useAuthStore, useBooksStore, usePermissionsStore } from '@/stores'

import {
  askGroupLink,
  reportLink,
  useApi,
  useBookEditor,
  useCanWrite,
  useFilters,
  useLastCatalog,
  useLastList,
  usePageMeta,
} from '@/composables'

import BookCard from '@/components/books/BookCard.vue'
import BookFormDrawer from '@/components/books/BookFormDrawer.vue'
import CoverBlock from '@/components/books/CoverBlock.vue'
import BookFacts from '@/components/catalog/BookFacts.vue'
import BookFixLine from '@/components/catalog/BookFixLine.vue'
import QuoteBlock from '@/components/catalog/QuoteBlock.vue'
import ReadingActions from '@/components/catalog/ReadingActions.vue'
import ShareButton from '@/components/catalog/ShareButton.vue'
import WhereToFind from '@/components/catalog/WhereToFind.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppNotice from '@/components/ui/AppNotice.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FilterChip from '@/components/ui/FilterChip.vue'
import PageStatus from '@/components/ui/PageStatus.vue'
import PoweredByGoogle from '@/components/ui/PoweredByGoogle.vue'

const RELATED_COUNT = 6
const SYNOPSIS_COLLAPSE_CHARS = 420

const route = useRoute()
const router = useRouter()

const booksStore = useBooksStore()
const authStore = useAuthStore()

const permissions = usePermissionsStore()

const canWrite = useCanWrite()
const {
  editingBook,
  isOpen: isEditing,
  error: editError,
  open: openBookEditor,
  close: closeEditor,
  onSaved,
} = useBookEditor()

const lastCatalog = useLastCatalog()
// Back goes to the list the book was opened from: the catalog, or Meus livros.
const lastList = useLastList()
const { catalogLink } = useFilters()

const synopsisId = useId()

const editFocus = ref<'porque' | undefined>()

const synopsisOpen = ref(false)

const book = computed((): Book | undefined => booksStore.books.find((b) => String(b.id) === String(route.params.id)))

usePageMeta(
  computed(() => ({
    title: book.value?.titulo ?? 'Livro',
    description: book.value
      ? `${book.value.titulo} · ${authorNames(book.value.authors)}${book.value.person ? ` · mencionado por ${book.value.person}` : ''}`
      : '',
    type: 'article' as const,
  })),
)

const bookPath = computed(() =>
  book.value ? router.resolve({ name: 'catalog-book-details', params: { id: book.value.id } }).path : '',
)
const genre = computed(() => book.value?.categoria.replace(/-/g, ' ') ?? '')
const coverPage = computed(() => googleBooksPage(book.value?.cover_url))

const separator = (index: number) => {
  const left = (book.value?.authors.length ?? 0) - 1 - index
  if (left > 1) return ', '
  return left === 1 ? ' e ' : ''
}

// The API only lets the person who mentioned the book (after linking the name) or an admin edit it.
const isOwner = computed(() => !!book.value?.quem_user_id && book.value.quem_user_id === authStore.user?._id)

// The API's matrix, not the role (front mirrors backend): the owner, or whoever may edit any book.
const canEdit = computed(() => permissions.canEditBook(book.value?.quem_user_id))

const askPerson = computed(() => ask(`${book.value?.person}, o que você acha de "${book.value?.titulo}"?`))

const synopsisIsLong = computed(() => (book.value?.synopsis?.length ?? 0) > SYNOPSIS_COLLAPSE_CHARS)

const sameGenre = computed(() => booksStore.books.filter((b) => b.categoria === book.value?.categoria))
const genreTotal = computed(() => sameGenre.value.length)
const related = computed(() => sameGenre.value.filter((b) => b.id !== book.value?.id).slice(0, RELATED_COUNT))

const openEditor = (id: string, focus?: 'porque') => {
  editFocus.value = focus
  return openBookEditor(id)
}

const retry = () => useApi().fetchBooks()
// The book no longer exists: back to the list it was opened from, which no longer shows it.
const onRemoved = () => {
  useApi().fetchBooks()
  router.push(lastList.value.path)
}

const ask = (message: string) => askGroupLink(message, bookPath.value)
const report = (message: string) => reportLink(message, bookPath.value)

watch(book, () => (synopsisOpen.value = !synopsisIsLong.value), { immediate: true })
</script>

<style lang="scss" scoped>
.book-page {
  max-width: var(--page-max);
  margin: 0 auto;
  padding: var(--space-4) var(--space-4) var(--space-14);

  @media (min-width: $bp-tablet-min) {
    padding: var(--space-6) var(--space-8) var(--space-24);
  }

  &__back {
    display: inline-flex;
    min-height: var(--touch-min);
    align-items: center;
    gap: var(--space-2);

    font-size: var(--font-size-ui);
    font-weight: var(--font-weight-semibold);
    color: var(--color-action-default);
    text-decoration: none;
    border-radius: var(--radius-md);

    :deep(.base-icon) {
      width: var(--icon-sm);
      height: var(--icon-sm);
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: var(--focus-offset);
    }
  }

  // Phone first: head, cover and actions, then the file. Desktop (Detail.desktop): cover column on the left.
  &__layout {
    display: grid;
    margin-top: var(--space-4);
    grid-template-areas:
      'head'
      'side'
      'main'
      'where';
    gap: var(--space-6);

    // "Onde encontrar" stays under the cover on desktop and goes last on phones, after the file and comment.
    @media (min-width: $bp-wide-min) {
      grid-template-columns: var(--cover-column) minmax(0, 1fr);
      grid-template-areas:
        'side head'
        'side main'
        'where main';
      grid-template-rows: auto auto 1fr;
      column-gap: var(--space-10);
      row-gap: var(--space-6);
    }
  }

  &__head {
    grid-area: head;
    min-width: 0;
  }

  &__badges {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);

    // Phone: the same links sit in the facts right below; up here they only push the book down (8e).
    @media (max-width: $bp-phone-max) {
      display: none;
    }
  }

  &__title {
    margin-top: var(--space-3);

    @media (max-width: $bp-phone-max) {
      margin-top: 0;
    }
    font-size: var(--font-size-display-m);
    line-height: var(--line-height-display);
    font-weight: var(--font-weight-bold);
    letter-spacing: var(--letter-spacing-display);
    color: var(--color-text-default);
    overflow-wrap: anywhere;

    @media (min-width: $bp-wide-min) {
      font-size: var(--font-size-display-l);
      line-height: var(--line-height-display);
    }
  }

  &__author,
  &__person {
    display: inline-flex;
    min-height: var(--touch-min);
    align-items: center;
    text-decoration: none;
    border-radius: var(--radius-sm);

    &:hover {
      text-decoration: underline;
      text-underline-offset: var(--underline-offset);
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: var(--focus-offset);
    }
  }

  &__authors {
    font-size: var(--font-size-section);
    color: var(--color-text-subtle);
  }

  // A link, so it takes the action colour like the person below (one colour means "this clicks").
  &__author {
    font-size: var(--font-size-section);
    color: var(--color-action-default);
  }

  &__mention {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--font-size-ui);
    color: var(--color-text-subtle);
  }

  &__person {
    font-weight: var(--font-weight-semibold);
    color: var(--color-action-default);
  }

  &__side {
    grid-area: side;
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: var(--space-4);
  }

  &__cover {
    width: min(var(--cover-w-phone), 50%);
    margin: 0 auto;

    @media (min-width: $bp-wide-min) {
      width: 100%;
    }
  }

  &__where {
    grid-area: where;
    align-self: start;
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-border-default);
  }

  &__main {
    grid-area: main;
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: var(--space-6);
  }

  &__section-title {
    font-size: var(--font-size-section);
    font-weight: var(--font-weight-bold);
    letter-spacing: var(--letter-spacing-title);
    color: var(--color-text-default);
  }

  &__synopsis {
    margin-top: var(--space-2);
    font-size: var(--font-size-body);
    line-height: var(--line-height-text);
    color: var(--color-text-secondary);

    &.is-collapsed {
      display: -webkit-box;
      overflow: hidden;
      -webkit-line-clamp: 6;
      -webkit-box-orient: vertical;
    }
  }

  &__more {
    margin-top: var(--space-1);
    margin-left: calc(-1 * var(--space-2));
  }

  &__chips {
    display: flex;
    margin-top: var(--space-3);
    flex-wrap: wrap;
    gap: var(--space-2);
  }
}

.related {
  margin-top: var(--space-14);

  &__head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  &__title {
    font-size: var(--font-size-section);
    font-weight: var(--font-weight-bold);
    letter-spacing: var(--letter-spacing-title);
    color: var(--color-text-default);
  }

  &__all {
    display: inline-flex;
    min-height: var(--touch-min);
    align-items: center;
    gap: var(--space-1);

    font-size: var(--font-size-ui);
    font-weight: var(--font-weight-semibold);
    color: var(--color-action-default);
    text-decoration: none;

    :deep(.base-icon) {
      width: var(--icon-xs);
      height: var(--icon-xs);
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: var(--focus-offset);
      border-radius: var(--radius-sm);
    }
  }

  &__grid {
    display: grid;
    margin-top: var(--space-4);
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-5) var(--space-3);

    @media (min-width: $bp-tablet-min) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    @media (min-width: $bp-desktop-wide-min) {
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: var(--space-8) var(--space-5);
    }
  }
}

.cover-credit {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-10);

  font-size: var(--font-size-caption);
  color: var(--color-text-subtle);

  &__link {
    @include text-link;

    display: inline-flex;
    min-height: var(--touch-min);
    align-items: center;
    gap: var(--space-1);
  }

  &__arrow {
    width: var(--icon-xs);
    height: var(--icon-xs);
  }
}
</style>
