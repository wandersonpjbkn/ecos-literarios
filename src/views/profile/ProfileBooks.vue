<template>
  <div class="profile-section">
    <SectionHeader title="Meus livros">
      Livros do catálogo vinculados ao seu perfil. Edite título, autor, categoria, mídia, sub-gêneros, sinopse e o
      motivo da sua indicação.
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
        <div v-if="myBooks.length !== 0" class="books-search">
          <BaseIcon name="search" class="books-search__icon" />
          <input
            v-model="searchQuery"
            type="text"
            class="books-search__input"
            placeholder="Buscar por título ou autor…"
            autocomplete="off"
          />
          <span v-if="searchQuery" class="books-search__count">
            {{ filteredBooks.length }} de {{ myBooks.length }}
          </span>
        </div>
      </div>

      <!-- empty -->
      <div v-if="myBooks.length === 0" class="profile-empty">
        <BaseIcon name="book" class="profile-empty__icon" aria-hidden="true" />
        <p>Nenhum livro vinculado ao seu perfil.</p>
        <RouterLink :to="{ name: 'profile-claim' }" class="profile-empty__link">
          Ir para vínculos
          <BaseIcon name="arrow-right" aria-hidden="true" />
        </RouterLink>
      </div>

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
        <p v-if="filteredBooks.length === 0 && searchQuery" class="book-empty">
          Nenhum resultado para "{{ searchQuery }}".
        </p>

        <!-- Pagination -->
        <PaginationNav ref="paginationNav" :items="filteredBooks" />
      </div>
    </template>

    <!-- Book form drawer -->
    <BookFormDrawer :book="editingBook" :is-open="isDrawerOpen" scope="member" @close="closeDrawer" @saved="onSaved" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'

import { useAuthStore, useBooksStore } from '@/stores'
import { useApi } from '@/composables'
import { buildHeaders } from '@/composables/useApi'
import SectionHeader from '@/components/admin/SectionHeader.vue'
import PaginationNav from '@/components/PaginationNav.vue'
import BookFormDrawer from '@/components/admin/BookFormDrawer.vue'
import type { Book } from '@/types'

const API_BASE = import.meta.env.VITE_API_URL as string

// Mirrors BookPayload from BookFormDrawer — needed to type the edit state.
interface BookForEdit {
  _id: string
  titulo: string
  autor: string | { _id: string; nome: string }
  midia: string | { _id: string; nome: string }
  categoria: string | { _id: string; nome: string }
  subgeneros: Array<string | { _id: string; nome: string }>
  quem_nome: string
  porque: string
  synopsis?: string
  isbn?: string
  cover_url?: string
  google_books_id?: string | number
  page_count?: number
  published_year?: number
}

const authStore = useAuthStore()
const booksStore = useBooksStore()

const paginationNav = ref<InstanceType<typeof PaginationNav> | null>(null)

const searchQuery = ref('')
const loading = computed(() => booksStore.loading)
const fetchError = ref('')
const isDrawerOpen = ref(false)
const editingBook = ref<BookForEdit | null>(null)
const editingLoadingId = ref<string | number | null>(null)

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

const openEdit = async (book: Book) => {
  if (editingLoadingId.value !== null) return
  editingLoadingId.value = book.id
  fetchError.value = ''

  try {
    const res = await fetch(`${API_BASE}/books/${book.id}`, { headers: buildHeaders() })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    editingBook.value = (await res.json()) as BookForEdit
    isDrawerOpen.value = true
  } catch {
    fetchError.value = 'Não foi possível carregar os detalhes do livro. Tente novamente.'
  } finally {
    editingLoadingId.value = null
  }
}

const closeDrawer = () => {
  isDrawerOpen.value = false
  editingBook.value = null
}

const onSaved = () => {
  useApi().fetchBooks(true)
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
.books-search {
  flex: 75%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 0.75rem;
  min-height: 44px;
  border: 1.5px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  background: var(--color-surface-default);
  transition: border-color var(--motion-transition-default);

  &:focus-within {
    border-color: var(--color-action-default);
    box-shadow: 0 0 0 3px var(--color-action-background-subtle);
  }

  &__icon {
    width: 16px;
    height: 16px;
    color: var(--color-text-subtle);
    flex-shrink: 0;
  }

  &__input {
    flex: 1;
    border: none;
    outline: none;
    background: none;
    font-family: var(--font-family-body);
    font-size: 0.9rem;
    color: var(--color-text-default);
    min-height: 40px;
    &::placeholder {
      color: var(--color-text-subtle);
    }
  }

  &__count {
    font-size: 0.78rem;
    color: var(--color-text-subtle);
    flex-shrink: 0;
  }
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
.profile-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1.5rem;
  border: 1px dashed var(--color-border-default);
  border-radius: var(--border-radius-default);
  text-align: center;
  color: var(--color-text-subtle);
  font-size: 0.9rem;

  &__icon {
    width: 2.5rem;
    height: 2.5rem;
    opacity: 0.4;
  }

  &__link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--color-action-default);
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    transition: opacity var(--motion-transition-default);

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      opacity: 0.75;
    }
  }
}
.book-empty {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-subtle);
  border: 1px dashed var(--color-border-default);
  border-radius: var(--border-radius-default);
}

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
