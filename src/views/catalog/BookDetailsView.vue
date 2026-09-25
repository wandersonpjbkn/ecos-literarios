<template>
  <div class="book-page" data-page="book">
    <PageStatus
      :loading="booksStore.loading && !book"
      :error="!book && !booksStore.books.length ? booksStore.error : null"
      :on-retry="retry"
      loading-text="Carregando livro…"
      error-hint="Se não voltar, avise no grupo."
    />

    <div v-if="!booksStore.loading && booksStore.books.length && !book" class="book-page__missing">
      <h1 class="book-page__missing-title">Não achamos esse livro</h1>
      <p>Ele pode ter saído do catálogo, ou o link chegou incompleto.</p>
      <AppButton variant="primary" :to="lastCatalog">Voltar ao catálogo</AppButton>
    </div>

    <template v-if="book">
      <RouterLink :to="lastCatalog" class="book-page__back">
        <BaseIcon name="arrow-left" aria-hidden="true" />
        Voltar ao catálogo
      </RouterLink>

      <div class="book-page__layout">
        <header class="book-page__head">
          <div class="book-page__badges">
            <FilterChip v-if="book.midia" :label="book.midia" :to="catalogLink('midia', book.midia)" />
            <FilterChip v-if="book.categoria" :label="genre" :to="catalogLink('categoria', book.categoria)" />
          </div>
          <h1 class="book-page__title">{{ book.titulo }}</h1>
          <RouterLink v-if="book.autor" :to="catalogLink('autor', book.autor)" class="book-page__author">
            {{ book.autor }}
          </RouterLink>
          <p v-if="book.quem" class="book-page__mention">
            mencionado por
            <RouterLink :to="catalogLink('quem', book.quem)" class="book-page__person">{{ book.quem }}</RouterLink>
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
            :person="book.quem"
            :is-author="isOwner"
            :can-write="canWrite"
            :from-conversation="book.origem === 'conversa'"
            :ask-link="askPerson"
            @write="openEditor(book.id)"
          />

          <div>
            <BookFixLine
              :book="book"
              :can-edit="canEdit"
              :can-write="canWrite"
              :ask-link="ask"
              @edit="openEditor(book.id)"
            />
            <p v-if="editError" class="book-page__edit-error" role="status">{{ editError }}</p>
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

          <section v-if="book.subgenerosArr.length" class="book-page__tags" aria-labelledby="tags-title">
            <h2 id="tags-title" class="book-page__section-title">Subgêneros</h2>
            <div class="book-page__chips">
              <FilterChip
                v-for="tag in book.subgenerosArr"
                :key="tag"
                :label="tag"
                :to="catalogLink('subgeneros', tag)"
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

      <BookFormDrawer
        :book="editingBook"
        :is-open="isEditing"
        :scope="authStore.isAdmin && !isOwner ? 'admin' : 'member'"
        @close="closeEditor"
        @saved="onSaved"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, useId, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppButton from '@/components/AppButton.vue'
import BookCard from '@/components/BookCard.vue'
import BookFacts from '@/components/BookFacts.vue'
import BookFixLine from '@/components/BookFixLine.vue'
import CoverBlock from '@/components/CoverBlock.vue'
import FilterChip from '@/components/FilterChip.vue'
import PageStatus from '@/components/PageStatus.vue'
import QuoteBlock from '@/components/QuoteBlock.vue'
import ReadingActions from '@/components/ReadingActions.vue'
import ShareButton from '@/components/ShareButton.vue'
import WhereToFind from '@/components/WhereToFind.vue'
import BookFormDrawer from '@/components/admin/BookFormDrawer.vue'
import {
  askGroupLink,
  useApi,
  useBookEditor,
  useCanWrite,
  useFilters,
  useLastCatalog,
  usePageMeta,
} from '@/composables'
import { useAuthStore, useBooksStore } from '@/stores'
import type { Book } from '@/types'

const RELATED_COUNT = 6
const SYNOPSIS_COLLAPSE_CHARS = 420

const route = useRoute()
const router = useRouter()
const booksStore = useBooksStore()
const authStore = useAuthStore()
const canWrite = useCanWrite()
const {
  editingBook,
  isOpen: isEditing,
  error: editError,
  open: openEditor,
  close: closeEditor,
  onSaved,
} = useBookEditor()
const lastCatalog = useLastCatalog()
const { catalogLink } = useFilters()

onMounted(() => useApi().fetchBooks())
const retry = () => useApi().fetchBooks(true)

const book = computed((): Book | undefined => booksStore.books.find((b) => String(b.id) === String(route.params.id)))
const bookPath = computed(() =>
  book.value ? router.resolve({ name: 'catalog-book-details', params: { id: book.value.id } }).path : '',
)
const genre = computed(() => book.value?.categoria.replace(/-/g, ' ') ?? '')

// The API only lets the person who mentioned the book (after linking the name) or an admin edit it.
const isOwner = computed(() => !!book.value?.quem_user_id && book.value.quem_user_id === authStore.user?._id)
const canEdit = computed(() => isOwner.value || authStore.isAdmin)

const ask = (message: string) => askGroupLink(message, bookPath.value)
const askPerson = computed(() => ask(`${book.value?.quem}, o que você acha de "${book.value?.titulo}"?`))

const synopsisId = useId()
const synopsisOpen = ref(false)
const synopsisIsLong = computed(() => (book.value?.synopsis?.length ?? 0) > SYNOPSIS_COLLAPSE_CHARS)
watch(book, () => (synopsisOpen.value = !synopsisIsLong.value), { immediate: true })

const sameGenre = computed(() => booksStore.books.filter((b) => b.categoria === book.value?.categoria))
const genreTotal = computed(() => sameGenre.value.length)
const related = computed(() => sameGenre.value.filter((b) => b.id !== book.value?.id).slice(0, RELATED_COUNT))

usePageMeta(
  computed(() => ({
    title: book.value?.titulo ?? 'Livro',
    description: book.value
      ? `${book.value.titulo} · ${book.value.autor}${book.value.quem ? ` · mencionado por ${book.value.quem}` : ''}`
      : '',
    type: 'article' as const,
  })),
)
</script>

<style lang="scss" scoped>
.book-page {
  max-width: 1120px;
  margin: 0 auto;
  padding: var(--space-4) var(--space-4) var(--space-14);

  @media (min-width: 768px) {
    padding: var(--space-6) var(--space-8) var(--space-24);
  }

  &__back {
    display: inline-flex;
    min-height: var(--touch-min);
    align-items: center;
    gap: var(--space-2);

    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-action-default);
    text-decoration: none;
    border-radius: var(--radius-md);

    :deep(.base-icon) {
      width: 16px;
      height: 16px;
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: 2px;
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
    @media (min-width: 900px) {
      grid-template-columns: 280px minmax(0, 1fr);
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
  }

  &__title {
    margin-top: var(--space-3);
    font-size: 1.875rem;
    line-height: 1.17;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--color-text-default);
    overflow-wrap: anywhere;

    @media (min-width: 900px) {
      font-size: 2.375rem;
      line-height: 1.1;
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
      text-underline-offset: 3px;
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: 2px;
    }
  }

  // A link, so it takes the action colour like the person below (one colour means "this clicks").
  &__author {
    font-size: 1.125rem;
    color: var(--color-action-default);
  }

  &__mention {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-size: 0.9375rem;
    color: var(--color-text-subtle);
  }

  &__person {
    font-weight: 600;
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
    width: min(180px, 50%);
    margin: 0 auto;

    @media (min-width: 900px) {
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

  &__edit-error {
    font-size: 0.875rem;
    color: var(--color-text-default);
  }

  &__section-title {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--color-text-default);
  }

  &__synopsis {
    margin-top: var(--space-2);
    font-size: 1rem;
    line-height: 1.5;
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

  &__missing {
    display: flex;
    max-width: 380px;
    margin: var(--space-14) auto 0;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    text-align: center;
    color: var(--color-text-secondary);
  }

  &__missing-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-default);
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
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--color-text-default);
  }

  &__all {
    display: inline-flex;
    min-height: var(--touch-min);
    align-items: center;
    gap: var(--space-1);

    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-action-default);
    text-decoration: none;

    :deep(.base-icon) {
      width: 14px;
      height: 14px;
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: 2px;
      border-radius: var(--radius-sm);
    }
  }

  &__grid {
    display: grid;
    margin-top: var(--space-4);
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-5) var(--space-3);

    @media (min-width: 768px) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    @media (min-width: 1100px) {
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: var(--space-8) var(--space-5);
    }
  }
}
</style>
