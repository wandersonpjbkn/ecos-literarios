<template>
  <div class="admin-section">
    <div class="admin-section__header">
      <div>
        <h2 class="admin-section__title">Livros</h2>
        <p class="admin-section__desc">
          Gerencie os livros do catálogo. Crie, edite ou remova títulos e suas informações.
        </p>
      </div>
      <button class="action-btn" @click="openCreate">+ Novo livro</button>
    </div>

    <div class="book-segmentation">
      <!-- Filters -->
      <div class="books-filters">
        <MultiSelect
          label="Segmento"
          :multiple="false"
          :searchable="false"
          :options="[
            { value: 'all', label: 'Todos' },
            { value: 'missing', label: 'Dados incompletos' },
            { value: 'complete', label: 'Dados completos' },
            { value: 'missing-isbn', label: 'ISBN ausente' },
          ]"
          :selected="segmentFilter"
          @toggle="(v) => (segmentFilter = v as SegmentFilter)"
        />
      </div>

      <!-- Search -->
      <div class="books-search">
        <BaseIcon name="search" class="books-search__icon" />
        <input
          v-model="searchQuery"
          type="text"
          class="books-search__input"
          placeholder="Buscar por título ou autor…"
          autocomplete="off"
        />
        <span v-if="searchQuery" class="books-search__count"> {{ filteredBooks.length }} de {{ books.length }} </span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="admin-state">
      <div class="spinner" aria-hidden="true" />
      <p>Carregando livros…</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="admin-state admin-state--error">
      <BaseIcon name="error" aria-hidden="true" />
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchBooks">Tentar novamente</button>
    </div>

    <!-- Empty -->
    <p v-else-if="books.length === 0" class="admin-empty">Nenhum livro cadastrado.</p>

    <!-- List -->
    <div v-else class="books-list">
      <div class="books-row books-row--header">
        <span>Título</span>
        <span>Autor</span>
        <span>Categoria</span>
        <span>Mídia</span>
        <span>Ações</span>
      </div>

      <!-- Content -->
      <div class="books-row--content">
        <div v-for="book in paginatedBooks" :key="book._id" class="books-row">
          <span class="books-row__title" @click="openEdit(book)">{{ book.titulo }}</span>
          <span class="books-row__field">{{ resolveName(book.autor) }}</span>
          <span class="books-row__field">{{ resolveName(book.categoria) }}</span>
          <span class="books-row__field">{{ resolveName(book.midia) }}</span>
          <div class="books-row__actions">
            <button
              class="row-action row-action--edit"
              type="button"
              :aria-label="`Editar ${book.titulo}`"
              @click="openEdit(book)"
            >
              <BaseIcon name="pencil" aria-hidden="true" />
            </button>
            <button
              class="row-action row-action--delete"
              type="button"
              :aria-label="`Remover ${book.titulo}`"
              @click="confirmDelete(book)"
            >
              <BaseIcon name="trash" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <!-- No results -->
      <p v-if="filteredBooks.length === 0 && searchQuery" class="admin-empty">
        Nenhum resultado para "{{ searchQuery }}".
      </p>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="books-pagination">
        <button class="page-btn" :disabled="currentPage <= 1" @click="currentPage--">
          <BaseIcon name="arrow-left" />
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
          <BaseIcon name="arrow-right" />
        </button>
      </div>
    </div>

    <!-- Book form drawer -->
    <BookFormDrawer :book="editingBook" :is-open="isDrawerOpen" @close="closeDrawer" @saved="onBookSaved" />

    <!-- Delete confirmation -->
    <ConfirmModal
      v-model="deleteModal.open"
      title="Remover livro"
      :description="deleteModal.description"
      confirm-label="Remover"
      :danger="true"
      :loading="isDeleting"
      @confirm="handleDelete"
      @cancel="deleteModal.open = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, reactive, watch, onMounted } from 'vue'

import { buildHeaders } from '@/composables/useApi'
import MultiSelect from '@/components/MultiSelect.vue'
import BookFormDrawer from '@/components/admin/BookFormDrawer.vue'
import ConfirmModal from '@/components/admin/ConfirmModal.vue'

const API_BASE = import.meta.env.VITE_API_URL as string
const PAGE_SIZE = 20

interface AdminBook {
  _id: string
  titulo: string
  autor: string | { _id: string; nome: string }
  midia: string | { _id: string; nome: string }
  categoria: string | { _id: string; nome: string }
  subgeneros: Array<string | { _id: string; nome: string }>
  quem_nome: string
  porque: string
  isbn?: string
}

type SegmentFilter = 'all' | 'missing' | 'complete' | 'missing-isbn'

const books = ref<AdminBook[]>([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const segmentFilter = ref<SegmentFilter>('all')
const currentPage = ref(1)

const isDrawerOpen = ref(false)
const editingBook = ref<AdminBook | null>(null)
const isDeleting = ref(false)

const deleteModal = reactive({
  open: false,
  description: '',
  targetId: '',
})

const resolveName = (field: string | { nome: string }): string => (typeof field === 'string' ? field : field.nome)

const isMissingField = (value?: string | null) => !value || !value.trim()

const hasMissingData = (book: AdminBook) => {
  const autorNome = resolveName(book.autor)
  const categoriaNome = resolveName(book.categoria)
  const midiaNome = resolveName(book.midia)

  return (
    isMissingField(book.titulo) ||
    isMissingField(autorNome) ||
    isMissingField(categoriaNome) ||
    isMissingField(midiaNome) ||
    isMissingField(book.porque) ||
    isMissingField(book.isbn) ||
    book.subgeneros.length === 0
  )
}

const filteredBooks = computed(() => {
  const base = books.value.filter((book) => {
    if (segmentFilter.value === 'missing') return hasMissingData(book)
    if (segmentFilter.value === 'complete') return !hasMissingData(book)
    if (segmentFilter.value === 'missing-isbn') return isMissingField(book.isbn)
    return true
  })

  if (!searchQuery.value.trim()) return base

  const q = searchQuery.value.toLowerCase()
  return base.filter((b) => b.titulo.toLowerCase().includes(q) || resolveName(b.autor).toLowerCase().includes(q))
})

const totalPages = computed(() => Math.ceil(filteredBooks.value.length / PAGE_SIZE))

const paginatedBooks = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredBooks.value.slice(start, start + PAGE_SIZE)
})

// Reset page when search changes
const resetPage = () => {
  currentPage.value = 1
}

const fetchBooks = async () => {
  loading.value = true
  error.value = ''

  try {
    const res = await fetch(`${API_BASE}/books`, { headers: buildHeaders() })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    books.value = await res.json()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erro ao carregar livros.'
    console.error('[AdminBooks]', e)
  } finally {
    loading.value = false
  }
}

// ── Drawer ────────────────────────────────────────────────────────
const openCreate = () => {
  editingBook.value = null
  isDrawerOpen.value = true
}

const openEdit = (book: AdminBook) => {
  editingBook.value = book
  isDrawerOpen.value = true
}

const closeDrawer = () => {
  isDrawerOpen.value = false
  editingBook.value = null
}

const onBookSaved = () => {
  fetchBooks()
}

// ── Delete ────────────────────────────────────────────────────────
const confirmDelete = (book: AdminBook) => {
  deleteModal.open = true
  deleteModal.description = `Remover "${book.titulo}"? Esta ação não pode ser desfeita.`
  deleteModal.targetId = book._id
}

const handleDelete = async () => {
  isDeleting.value = true

  try {
    const res = await fetch(`${API_BASE}/books/${deleteModal.targetId}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
      throw new Error(body.error ?? `HTTP ${res.status}`)
    }

    books.value = books.value.filter((b) => b._id !== deleteModal.targetId)
    deleteModal.open = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erro ao remover livro.'
    deleteModal.open = false
  } finally {
    isDeleting.value = false
  }
}

// Reset pagination on search change
watch([searchQuery, segmentFilter], resetPage)

onMounted(fetchBooks)
</script>

<style lang="scss" scoped>
.admin-section {
  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  &__title {
    margin: 0 0 0.25rem;
    font-family: var(--font-family-display);
    font-size: 1.4rem;
    font-weight: 400;
    color: var(--color-text-default);
  }

  &__desc {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-text-subtle);
    max-width: 65ch;
    line-height: 1.5;
  }
}

.action-btn {
  border: none;
  border-radius: var(--border-radius-sm);
  min-height: 40px;
  padding: 0.5rem 0.9rem;
  font-family: var(--font-family-body);
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  background: var(--color-action-default);
  color: #fff;
  flex-shrink: 0;
  transition: opacity var(--motion-transition-default);

  &:hover {
    opacity: 0.85;
  }
}

// ── Search ────────────────────────────────────────────────────────
.book-segmentation {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.books-filters {
  flex: 25%;
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

// ── States ────────────────────────────────────────────────────────
.admin-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 24px;
  text-align: center;
  color: var(--color-text-subtle);

  svg {
    width: 36px;
    height: 36px;
  }

  &--error {
    color: var(--color-action-default);
  }
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-border-default);
  border-top-color: var(--color-action-default);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.retry-btn {
  border: none;
  padding: 8px 16px;
  min-height: 40px;
  border-radius: var(--border-radius-sm);
  background: var(--color-action-default);
  color: #fff;
  font-family: var(--font-family-body);
  font-size: 0.9rem;
  cursor: pointer;
  &:hover {
    opacity: 0.85;
  }
}

.admin-empty {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-subtle);
  border: 1px dashed var(--color-border-default);
  border-radius: var(--border-radius-default);
}

// ── Book list ─────────────────────────────────────────────────────
.books-list {
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  overflow: auto;
  overflow-x: auto;
}

.books-row {
  display: grid;
  grid-template-columns: minmax(180px, 2.5fr) minmax(120px, 1.5fr) minmax(100px, 1fr) minmax(80px, 0.8fr) 0.5fr;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
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
  }

  &__field {
    color: var(--color-text-subtle);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__actions {
    display: flex;
    gap: 2px;
    justify-content: flex-end;
  }
}

.row-action {
  width: 32px;
  height: 32px;
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

  &--edit:hover {
    background: var(--color-action-background-subtle);
    color: var(--color-action-default);
  }

  &--delete:hover {
    background: rgba(192, 57, 43, 0.08);
    color: #c0392b;
  }
}

// ── Pagination ────────────────────────────────────────────────────
.books-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--color-border-default);
}

.page-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-sm);
  background: var(--color-surface-default);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-default);
  transition: background var(--motion-transition-default);

  &:hover:not(:disabled) {
    background: var(--color-background-subtle);
  }
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  svg {
    width: 14px;
    height: 14px;
  }
}

.page-info {
  font-size: 0.82rem;
  color: var(--color-text-subtle);
}

@media (max-width: 767px) {
  .admin-section {
    padding: 1rem;

    &__header {
      flex-direction: column;
      align-items: stretch;
    }
  }

  .books-row {
    grid-template-columns: 1fr auto;

    &--header {
      display: none;
    }

    &__field {
      display: none;
    }
  }
}
</style>
