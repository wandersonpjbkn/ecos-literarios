<template>
  <!-- overlay -->
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="isOpen" class="drawer-overlay" aria-hidden="true" @click="close" />
    </Transition>

    <Transition name="drawer-right">
      <aside
        v-if="isOpen"
        ref="drawerRef"
        class="book-form-drawer"
        role="dialog"
        :aria-label="isEditMode ? `Editar ${form.titulo}` : 'Novo livro'"
      >
        <!-- header -->
        <div class="drawer-header">
          <h2 class="drawer-header__title">
            {{ isEditMode ? 'Editar livro' : 'Novo livro' }}
          </h2>
          <button class="drawer-close" type="button" aria-label="Fechar" @click="close">
            <BaseIcon name="times" aria-hidden="true" />
          </button>
        </div>

        <!-- body -->
        <div class="drawer-body">
          <form class="book-form" @submit.prevent="handleSubmit">
            <!-- basic data -->
            <section class="form-section">
              <h3 class="form-section__title">Dados principais</h3>
              <div class="form-grid">
                <!-- title -->
                <div class="form-field form-field--full">
                  <label for="bf-titulo" class="form-field__label">Título *</label>
                  <input
                    id="bf-titulo"
                    ref="firstInputRef"
                    v-model.trim="form.titulo"
                    type="text"
                    class="form-field__input"
                    :disabled="isSaving"
                    autocomplete="off"
                  />
                </div>

                <!-- isbn — admin only -->
                <div v-if="!isMemberScope" class="form-field">
                  <label for="bf-isbn" class="form-field__label">ISBN</label>
                  <input
                    id="bf-isbn"
                    v-model.trim="form.isbn"
                    type="text"
                    class="form-field__input"
                    placeholder="978-…"
                    :disabled="isSaving"
                    autocomplete="off"
                    maxlength="17"
                  />
                </div>

                <!-- ano — admin only -->
                <div v-if="!isMemberScope" class="form-field">
                  <label for="bf-year" class="form-field__label">Ano de publicação</label>
                  <input
                    id="bf-year"
                    v-model.trim="form.published_year"
                    type="number"
                    class="form-field__input"
                    :disabled="isSaving"
                    autocomplete="off"
                    min="0"
                    step="1"
                  />
                </div>

                <!-- páginas — admin only -->
                <div v-if="!isMemberScope" class="form-field">
                  <label for="bf-pages" class="form-field__label">Qtd. de páginas</label>
                  <input
                    id="bf-pages"
                    v-model.trim="form.page_count"
                    type="number"
                    class="form-field__input"
                    :disabled="isSaving"
                    autocomplete="off"
                    min="0"
                    step="1"
                  />
                </div>

                <!-- mencionado — admin only -->
                <div v-if="!isMemberScope" class="form-field">
                  <label for="bf-quem" class="form-field__label">Mencionado por *</label>
                  <input
                    id="bf-quem"
                    v-model.trim="form.quem_nome"
                    type="text"
                    class="form-field__input"
                    placeholder="Nome de quem indicou"
                    :disabled="isSaving"
                    autocomplete="off"
                  />
                </div>
              </div>
            </section>

            <!-- ── Classificação ────────────────────────────────── -->
            <section class="form-section">
              <h3 class="form-section__title">Classificação</h3>
              <div class="form-grid">
                <!-- autor -->
                <div class="form-field">
                  <label class="form-field__label">Autor *</label>
                  <MultiSelect
                    label="Selecionar autor"
                    :options="autorOptions"
                    :selected="form.autor"
                    :multiple="false"
                    :searchable="true"
                    @toggle="(v) => (form.autor = v)"
                  />
                </div>

                <!-- midia -->
                <div class="form-field">
                  <label class="form-field__label">Mídia *</label>
                  <MultiSelect
                    label="Selecionar mídia"
                    :options="midiaOptions"
                    :selected="form.midia"
                    :multiple="false"
                    :searchable="false"
                    @toggle="(v) => (form.midia = v)"
                  />
                </div>

                <!-- categoria -->
                <div class="form-field">
                  <label class="form-field__label">Categoria *</label>
                  <MultiSelect
                    label="Selecionar categoria"
                    :options="categoriaOptions"
                    :selected="form.categoria"
                    :multiple="false"
                    :searchable="false"
                    @toggle="(v) => (form.categoria = v)"
                  />
                </div>

                <!-- subgêneros -->
                <div class="form-field">
                  <label class="form-field__label">Sub-gêneros</label>
                  <MultiSelect
                    label="Selecionar sub-gêneros"
                    :options="subgeneroOptions"
                    :selected="form.subgeneros"
                    :multiple="true"
                    :searchable="true"
                    @toggle="handleSubgeneroToggle"
                    @clear="form.subgeneros = []"
                  />
                </div>
              </div>
            </section>

            <!-- ── Contexto ──────────────────────────────────────── -->
            <section class="form-section">
              <h3 class="form-section__title">Contexto</h3>
              <div class="form-grid">
                <div class="form-field form-field--full">
                  <label for="bf-porque" class="form-field__label">Por que foi indicado</label>
                  <textarea
                    id="bf-porque"
                    v-model.trim="form.porque"
                    class="form-field__textarea"
                    rows="3"
                    :disabled="isSaving"
                  />
                </div>
              </div>
            </section>

            <!-- ── Sinopse / Enriquecimento ──────────────────────── -->
            <section class="form-section">
              <h3 class="form-section__title">{{ isMemberScope ? 'Sinopse' : 'Enriquecimento' }}</h3>

              <!-- Enrichment actions — admin only -->
              <template v-if="!isMemberScope">
                <p>
                  Enriquecer as informações do livro - como capa, sinopse, nº páginas, etc. - com dados do
                  <a href="https://books.google.com/" target="_blank" rel="noopener noreferrer">Google Books</a> ou
                  <a href="https://openlibrary.org" target="_blank" rel="noopener noreferrer">Open Library</a>
                </p>

                <BookEnrichmentPanel
                  :book-id="book?._id ?? null"
                  :disabled="isSaving"
                  @applied="handleEnrichmentApplied"
                />
              </template>

              <div class="form-grid enrichment-fields">
                <!-- cover_url — admin only -->
                <div v-if="!isMemberScope" class="form-field form-field--full">
                  <label for="bf-cover" class="form-field__label">URL da capa</label>
                  <input
                    id="bf-cover"
                    v-model.trim="form.cover_url"
                    type="url"
                    class="form-field__input"
                    placeholder="https://…"
                    :disabled="isSaving"
                    autocomplete="off"
                  />
                </div>

                <!-- google_books_id — admin only -->
                <div v-if="!isMemberScope" class="form-field form-field--full">
                  <label for="bf-google-id" class="form-field__label">Google Books ID</label>
                  <input
                    id="bf-google-id"
                    v-model.trim="form.google_books_id"
                    type="text"
                    class="form-field__input"
                    :disabled="isSaving"
                    autocomplete="off"
                  />
                </div>

                <!-- synopsis — visible for both scopes -->
                <div class="form-field form-field--full">
                  <label for="bf-synopsis" class="form-field__label">
                    Sinopse{{ isMemberScope ? ' (opcional)' : '' }}
                  </label>
                  <textarea
                    id="bf-synopsis"
                    v-model.trim="form.synopsis"
                    class="form-field__textarea"
                    rows="4"
                    :disabled="isSaving"
                  />
                </div>
              </div>
            </section>
          </form>
        </div>

        <div class="drawer-footer">
          <p v-if="error" class="panel-feedback panel-feedback--error">{{ error }}</p>
          <p v-if="success" class="panel-feedback panel-feedback--success">{{ success }}</p>

          <div class="drawer-footer__actions">
            <button type="button" class="panel-btn panel-btn--secondary" :disabled="isSaving" @click="close">
              Cancelar
            </button>
            <button
              type="button"
              class="panel-btn panel-btn--primary"
              :disabled="isSaving || !isValid"
              @click="handleSubmit"
            >
              {{ isSaving ? 'Salvando…' : isEditMode ? 'Salvar alterações' : 'Criar livro' }}
            </button>
          </div>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'

import { buildHeaders } from '@/composables/useApi'
import { useEntityCrud } from '@/composables/useEntityCrud'
import MultiSelect from '@/components/MultiSelect.vue'
import BookEnrichmentPanel from '@/components/admin/BookEnrichmentPanel.vue'

const API_BASE = import.meta.env.VITE_API_URL as string

interface BookPayload {
  _id: string
  titulo: string
  autor: string | { _id: string; nome: string }
  midia: string | { _id: string; nome: string }
  categoria: string | { _id: string; nome: string }
  subgeneros: Array<string | { _id: string; nome: string }>
  quem_nome: string
  porque: string
  isbn?: string
  cover_url?: string
  synopsis?: string
  google_books_id?: string | number
  page_count?: number
  published_year?: number
}

const props = defineProps<{
  book: BookPayload | null
  isOpen: boolean
  scope?: 'admin' | 'member'
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const drawerRef = ref<HTMLElement | null>(null)
const firstInputRef = ref<HTMLInputElement | null>(null)
const isSaving = ref(false)
const error = ref('')
const success = ref('')

const form = reactive({
  titulo: '',
  autor: '',
  midia: '',
  categoria: '',
  subgeneros: [] as string[],
  quem_nome: '',
  porque: '',
  isbn: '',
  cover_url: '',
  synopsis: '',
  google_books_id: '',
  page_count: '',
  published_year: '',
})

const isMemberScope = computed(() => props.scope === 'member')
const isEditMode = computed(() => !!props.book)

const isValid = computed(
  () =>
    form.titulo.length >= 1 &&
    form.autor.length > 0 &&
    form.midia.length > 0 &&
    form.categoria.length > 0 &&
    (isMemberScope.value || form.quem_nome.length >= 1),
)

// ── Support entity options ────────────────────────────────────────
const autores = useEntityCrud({ resource: 'autores' })
const midias = useEntityCrud({ resource: 'midias' })
const categorias = useEntityCrud({ resource: 'categorias' })
const subgeneros = useEntityCrud({ resource: 'subgeneros' })

const toOptions = (items: Array<{ _id: string; nome: string }>) => items.map((i) => ({ label: i.nome, value: i._id }))

const autorOptions = computed(() => toOptions(autores.items.value))
const midiaOptions = computed(() => toOptions(midias.items.value))
const categoriaOptions = computed(() => toOptions(categorias.items.value))
const subgeneroOptions = computed(() => toOptions(subgeneros.items.value))

const handleSubgeneroToggle = (value: string) => {
  const idx = form.subgeneros.indexOf(value)
  if (idx === -1) form.subgeneros.push(value)
  else form.subgeneros.splice(idx, 1)
}

// ── Form population ───────────────────────────────────────────────
const extractId = (field: string | { _id: string }): string => (typeof field === 'string' ? field : field._id)

const resetForm = (): void => {
  form.titulo = ''
  form.autor = ''
  form.midia = ''
  form.categoria = ''
  form.subgeneros = []
  form.quem_nome = ''
  form.porque = ''
  form.isbn = ''
  form.cover_url = ''
  form.synopsis = ''
  form.google_books_id = ''
  form.page_count = ''
  form.published_year = ''
}

const populateForm = (book: BookPayload): void => {
  form.titulo = book.titulo
  form.autor = extractId(book.autor)
  form.midia = extractId(book.midia)
  form.categoria = extractId(book.categoria)
  form.subgeneros = book.subgeneros.map(extractId)
  form.quem_nome = book.quem_nome
  form.porque = book.porque ?? ''
  form.isbn = book.isbn ?? ''
  form.cover_url = book.cover_url ?? ''
  form.synopsis = book.synopsis ?? ''
  form.google_books_id = book.google_books_id ? String(book.google_books_id) : ''
  form.page_count = book.page_count ? String(book.page_count) : ''
  form.published_year = book.published_year ? String(book.published_year) : ''
}

watch(
  () => props.isOpen,
  async (open) => {
    if (!open) return

    error.value = ''
    success.value = ''

    if (props.book) populateForm(props.book)
    else resetForm()

    document.body.style.overflow = 'hidden'
    await nextTick()
    firstInputRef.value?.focus()
  },
)

const close = (): void => {
  document.body.style.overflow = ''
  emit('close')
}

// ── Submit ────────────────────────────────────────────────────────
const handleSubmit = async () => {
  if (!isValid.value) return
  if (isMemberScope.value && !props.book) return

  isSaving.value = true
  error.value = ''
  success.value = ''

  try {
    let url: string
    let method: string
    let payload: Record<string, unknown>

    if (isMemberScope.value) {
      url = `${API_BASE}/users/me/books/${props.book!._id}`
      method = 'PATCH'
      payload = {
        titulo: form.titulo,
        autor: form.autor,
        midia: form.midia,
        categoria: form.categoria,
        subgeneros: form.subgeneros,
        porque: form.porque,
      }
      if (form.synopsis) payload.synopsis = form.synopsis
    } else {
      url = isEditMode.value ? `${API_BASE}/books/${props.book!._id}` : `${API_BASE}/books`
      method = isEditMode.value ? 'PATCH' : 'POST'
      payload = {
        titulo: form.titulo,
        autor: form.autor,
        midia: form.midia,
        categoria: form.categoria,
        subgeneros: form.subgeneros,
        quem_nome: form.quem_nome,
        porque: form.porque,
      }
      if (form.isbn) payload.isbn = form.isbn
      if (form.cover_url) payload.cover_url = form.cover_url
      if (form.synopsis) payload.synopsis = form.synopsis
      if (form.google_books_id) payload.google_books_id = form.google_books_id
      const pageCount = Number(form.page_count)
      const publishedYear = Number(form.published_year)
      if (Number.isFinite(pageCount) && pageCount > 0) payload.page_count = pageCount
      if (Number.isFinite(publishedYear) && publishedYear > 0) payload.published_year = publishedYear
    }

    const res = await fetch(url, {
      method,
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
      throw new Error(body.error ?? `HTTP ${res.status}`)
    }

    success.value = isEditMode.value ? 'Livro atualizado.' : 'Livro criado.'
    emit('saved')

    if (!isEditMode.value) {
      setTimeout(() => close(), 800)
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erro ao salvar.'
  } finally {
    isSaving.value = false
  }
}

const handleEnrichmentApplied = (): void => {
  success.value = 'Enriquecimento aplicado ao livro.'
  emit('saved')
}

onMounted(() => {
  autores.fetchAll()
  midias.fetchAll()
  categorias.fetchAll()
  subgeneros.fetchAll()
})
</script>

<style lang="scss" scoped>
@use '@/assets/scss/components/admin-shared';

.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 500;
}

.book-form-drawer {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 510;
  display: flex;
  flex-direction: column;
  width: min(980px, 96dvw);
  height: 100dvh;
  background: var(--color-surface-default);
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.16);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border-default);
  flex-shrink: 0;

  &__title {
    margin: 0;
    font-family: var(--font-family-display);
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--color-text-default);
  }
}

.drawer-close {
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-subtle);
  flex-shrink: 0;
  transition: background var(--motion-transition-default);

  &:hover {
    background: var(--color-background-subtle);
    color: var(--color-text-default);
  }
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
}

.book-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-section {
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  padding: 0.9rem;
  background: var(--color-surface-raised);

  &__title {
    margin: 0 0 0.75rem;
    font-size: 0.86rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text-subtle);
  }
}

.enrichment-fields {
  margin-top: 0.75rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  &__label {
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--color-text-default);
  }

  &__input,
  &__textarea {
    width: 100%;
    padding: 0 0.75rem;
    border: 1.5px solid var(--color-border-default);
    border-radius: var(--border-radius-sm);
    background: var(--color-surface-default);
    font-family: var(--font-family-body);
    font-size: 0.9rem;
    color: var(--color-text-default);
    outline: none;
    transition:
      border-color var(--motion-transition-default),
      box-shadow var(--motion-transition-default);

    &:focus {
      border-color: var(--color-action-default);
      box-shadow: 0 0 0 3px var(--color-action-background-subtle);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__input {
    min-height: 40px;
  }

  &__textarea {
    padding: 0.6rem 0.75rem;
    resize: vertical;
    min-height: 80px;
    line-height: 1.5;
  }

  &--full {
    grid-column: 1 / -1;
  }
}

.drawer-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--color-border-default);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
}

// ── Transitions ────────────────────────────────────────────────────
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.22s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.drawer-right-enter-active,
.drawer-right-leave-active {
  transition: transform 0.25s ease;
}
.drawer-right-enter-from,
.drawer-right-leave-to {
  transform: translateX(100%);
}

@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}

@media (max-width: 767px) {
  .book-form-drawer {
    width: 100%;
  }

  .drawer-header {
    padding: 0.85rem 1rem;
  }

  .drawer-body {
    padding: 1rem;
  }

  .form-section {
    padding: 0.85rem;
  }

  .drawer-footer {
    padding: 0.85rem 1rem;

    &__actions {
      flex-direction: column-reverse;

      .panel-btn {
        width: 100%;
        min-height: 44px;
      }
    }
  }
}
</style>
