<template>
  <div class="profile-section">
    <SectionHeader title="Meus livros">
      Os livros que você mencionou, ligados ao seu nome. Dá pra corrigir título, autor, gênero, mídia, subgêneros,
      sinopse e o que você escreveu.
    </SectionHeader>

    <!-- loading -->
    <BaseSpinner v-if="loading">
      <p>Carregando livros…</p>
    </BaseSpinner>

    <!-- error -->
    <p v-else-if="fetchError" class="feedback feedback--error">{{ fetchError }}</p>

    <!-- content -->
    <template v-else>
      <!-- data -->
      <div class="status-grid">
        <article class="status-card">
          <p class="status-card__label">Livros vinculados</p>
          <p class="status-card__value">{{ myBooks.length }}</p>
        </article>
        <article class="status-card">
          <p class="status-card__label">Com sinopse</p>
          <p class="status-card__value">{{ withSynopsis }}</p>
        </article>
        <article class="status-card">
          <p class="status-card__label">Com capa</p>
          <p class="status-card__value">{{ withCover }}</p>
        </article>
      </div>

      <!-- Search -->
      <div class="book-segmentation">
        <SearchBar
          v-if="myBooks.length !== 0"
          v-model="searchQuery"
          class="books-search"
          :suggestions="searchSuggestions"
          :total="myBooks.length"
          :filtered="filteredBooks.length"
          @select="onSelectSuggestion"
        />
      </div>

      <!-- empty -->
      <EmptyState
        v-if="myBooks.length === 0"
        title="Nenhum livro com o seu nome ainda"
        text="Aqui aparecem os livros que você mencionou no grupo, depois que você vincula a sua conta ao nome que aparece neles."
      >
        <AppButton :to="{ name: 'profile-claim' }">Vincular meu nome</AppButton>
      </EmptyState>

      <!-- list -->
      <div v-else class="books-list">
        <div class="books-row books-row--header" aria-hidden="true">
          <span>Título</span>
          <span class="hide-mobile">Autor</span>
          <span class="hide-mobile">Categoria</span>
          <span class="books-row__actions-col">Editar</span>
        </div>

        <!-- content -->
        <div class="books-row--content">
          <div v-for="book in paginatedBooks" :key="book.id" class="books-row">
            <span
              class="books-row__title"
              role="button"
              tabindex="0"
              @click="openEdit(book)"
              @keydown.enter="openEdit(book)"
            >
              {{ book.titulo }}
            </span>
            <span class="books-row__field hide-mobile">{{ book.autor }}</span>
            <span class="books-row__field hide-mobile">{{ book.categoria }}</span>
            <div class="books-row__actions books-row__actions-col">
              <button
                class="row-action"
                type="button"
                :aria-label="`Editar ${book.titulo}`"
                :disabled="editingLoadingId !== null"
                @click="openEdit(book)"
              >
                <span v-if="editingLoadingId === book.id" class="spinner spinner--sm" aria-hidden="true" />
                <BaseIcon v-else name="pencil" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <!-- No results -->
        <EmptyState
          v-if="filteredBooks.length === 0 && searchQuery"
          :title="`Nada com &quot;${searchQuery}&quot;`"
          text="Procuramos no título e no autor dos seus livros."
        >
          <AppButton @click="searchQuery = ''">Apagar a busca</AppButton>
        </EmptyState>

        <!-- Pagination -->
        <PaginationNav ref="paginationNav" :items="filteredBooks" />
      </div>
    </template>

    <!-- Book form drawer -->
    <BookFormDrawer
      :book="editingBook"
      :is-open="isDrawerOpen"
      scope="member"
      @close="editor.close"
      @saved="editor.onSaved"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'

import { useAuthStore, useBooksStore } from '@/stores'
import { useApi, useBookEditor } from '@/composables'
import SectionHeader from '@/components/admin/SectionHeader.vue'
import AppButton from '@/components/AppButton.vue'
import EmptyState from '@/components/EmptyState.vue'
import SearchBar from '@/components/SearchBar.vue'
import PaginationNav from '@/components/PaginationNav.vue'
import BookFormDrawer from '@/components/admin/BookFormDrawer.vue'
import type { Book, Suggestion } from '@/types'

const authStore = useAuthStore()
const booksStore = useBooksStore()

const paginationNav = ref<InstanceType<typeof PaginationNav> | null>(null)

const searchQuery = ref('')
const loading = computed(() => booksStore.loading)
const editor = useBookEditor()
const { editingBook, isOpen: isDrawerOpen, loadingId: editingLoadingId, error: fetchError } = editor

const myBooks = computed(() => booksStore.books.filter((b) => b.quem_user_id === authStore.user?._id))

const filteredBooks = computed(() => {
  if (!searchQuery.value.trim()) return myBooks.value

  const q = searchQuery.value.toLowerCase()
  return myBooks.value.filter(
    (b) => b.titulo.toLowerCase().includes(q) || resolveName(b.autor).toLowerCase().includes(q),
  )
})

const paginatedBooks = computed(() => {
  return (paginationNav.value?.paginatedItems ?? []) as Book[]
})

const withSynopsis = computed(() => myBooks.value.filter((b) => !!b.synopsis).length)
const withCover = computed(() => myBooks.value.filter((b) => !!b.cover_url).length)

const resolveName = (field: string | { nome: string }): string => (typeof field === 'string' ? field : field.nome)

const openEdit = (book: Book) => editor.open(book.id)

// ── Autocomplete ──────────────────────────────────────────────────
const searchSuggestions = computed(() => {
  if (!searchQuery.value.trim() || searchQuery.value.length < 2) return []

  const q = searchQuery.value.toLowerCase()

  return filteredBooks.value
    .filter((b) => b.titulo?.toLowerCase().includes(q))
    .map((b) => ({ id: b.id, main: b.titulo, sub: b.autor }))
    .slice(0, 8)
})

const onSelectSuggestion = (suggestion: Suggestion) => {
  searchQuery.value = suggestion.main
}

onMounted(() => {
  if (booksStore.books.length === 0) useApi().fetchBooks()
})
</script>

<style lang="scss" scoped>
// ── Search ────────────────────────────────────────────────────────
.book-segmentation {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

// ── Loading state ─────────────────────────────────────────────────
.profile-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
  text-align: center;
  color: var(--color-text-subtle);
}

// ── Status cards ──────────────────────────────────────────────────
.status-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;

    .status-card:last-child {
      grid-column: 1 / -1;
    }
  }
}

.status-card {
  padding: 0.9rem;
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  background: var(--color-surface-default);

  &__label {
    margin: 0;
    font-size: 0.78rem;
    color: var(--color-text-subtle);
  }

  &__value {
    margin-top: 0.25rem;
    display: block;
    font-size: 1.1rem;
    color: var(--color-text-default);
    font-weight: 600;

    @media (max-width: 767px) {
      font-size: 0.95rem;
    }
  }
}

// ── Empty state ───────────────────────────────────────────────────

// ── Books list ────────────────────────────────────────────────────
.books-list {
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  overflow: auto;
  overflow-x: auto;
}

.books-row {
  display: grid;
  grid-template-columns: minmax(160px, 2fr) minmax(120px, 1.5fr) minmax(100px, 1fr) 60px;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border-default);
  font-size: 0.875rem;
  align-items: center;
  transition: background var(--motion-transition-default);

  &:last-child {
    border-bottom: none;
  }

  &:not(.books-row--header):hover {
    background: var(--color-background-subtle);
  }

  &--header {
    background: var(--color-background-subtle);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    padding: 0.6rem 1rem;
  }

  &--content {
    overflow-y: auto;
    max-height: 400px;
  }

  &__title {
    color: var(--color-text-default);
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    transition: color var(--motion-transition-default);

    &:hover {
      color: var(--color-action-default);
    }
  }

  &__field {
    color: var(--color-text-subtle);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
  }

  &__actions-col {
    text-align: right;
  }
}

.row-action {
  width: 34px;
  height: 34px;
  border: none;
  background: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-subtle);
  flex-shrink: 0;
  transition:
    background var(--motion-transition-default),
    color var(--motion-transition-default);

  &:hover:not(:disabled) {
    background: var(--color-action-background-subtle);
    color: var(--color-action-default);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

// ── Feedback ──────────────────────────────────────────────────────
.feedback {
  margin: 0.75rem 0 0;
  font-size: 0.88rem;

  &--error {
    color: #c0392b;
  }
}

// ── Responsive ────────────────────────────────────────────────────
.hide-mobile {
  @media (max-width: 600px) {
    display: none;
  }
}

@media (max-width: 600px) {
  .books-row {
    grid-template-columns: 1fr 44px;

    &--header {
      display: none;
    }

    &__title {
      white-space: normal;
      word-break: break-word;
    }
  }
}
</style>
