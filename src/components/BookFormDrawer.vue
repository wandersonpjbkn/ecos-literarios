<template>
  <AppDrawer
    :open="isOpen"
    :title="isEditMode ? 'Editar o livro' : 'Adicionar um livro'"
    wide
    :initial-focus="focus === 'porque' ? '#bf-porque' : '#bf-titulo'"
    class="book-form-drawer"
    @close="close"
  >
    <form class="book-form" @submit.prevent="handleSubmit">
      <section class="form-section" aria-labelledby="bf-essential">
        <h3 id="bf-essential" class="form-section__title">O essencial</h3>
        <p class="form-section__text">Só isto é preciso para o livro entrar no catálogo.</p>
        <div class="form-grid">
          <AppField
            id="bf-titulo"
            v-model="form.titulo"
            trim
            class="form-grid__full"
            label="Título"
            :disabled="isSaving"
            autocomplete="off"
          />
          <AppField label="Autor">
            <template #default="{ labelId }">
              <MultiSelect
                label="Escolher o autor"
                :labelledby="labelId"
                :options="autorOptions"
                :selected="form.autor"
                :multiple="false"
                :searchable="true"
                @toggle="(v) => (form.autor = v)"
              />
            </template>
          </AppField>
          <AppField label="Formato">
            <template #default="{ labelId }">
              <MultiSelect
                label="Escolher o formato"
                :labelledby="labelId"
                :options="midiaOptions"
                :selected="form.midia"
                :multiple="false"
                :searchable="false"
                @toggle="(v) => (form.midia = v)"
              />
            </template>
          </AppField>
          <AppField label="Gênero">
            <template #default="{ labelId }">
              <MultiSelect
                label="Escolher o gênero"
                :labelledby="labelId"
                :options="categoriaOptions"
                :selected="form.categoria"
                :multiple="false"
                :searchable="false"
                @toggle="(v) => (form.categoria = v)"
              />
            </template>
          </AppField>
          <AppField
            v-if="!isMemberScope"
            v-model="form.quem_nome"
            trim
            label="Mencionado por"
            hint="O nome de quem falou do livro no grupo."
            placeholder="Nome de quem mencionou"
            :disabled="isSaving"
            autocomplete="off"
          />
        </div>
      </section>

      <section class="form-section form-section--optional">
        <button
          type="button"
          class="form-section__toggle"
          :aria-expanded="showMore"
          aria-controls="bf-more"
          @click="showMore = !showMore"
        >
          <span>Mais sobre o livro <span class="form-section__optional">(opcional)</span></span>
          <BaseIcon name="chevron" class="form-section__chevron" :class="{ 'is-open': showMore }" aria-hidden="true" />
        </button>

        <div v-show="showMore" id="bf-more" class="form-section__more">
          <template v-if="canSearchData">
            <p class="form-section__text">
              A busca preenche capa, sinopse, páginas e ano pelo
              <a href="https://books.google.com/" target="_blank" rel="noopener noreferrer"
                >Google Books<span class="visually-hidden">{{ ' ' }}(abre em outra aba)</span></a
              >
              ou pela
              <a href="https://openlibrary.org" target="_blank" rel="noopener noreferrer"
                >Open Library<span class="visually-hidden">{{ ' ' }}(abre em outra aba)</span></a
              >. Tudo continua editável à mão.
            </p>
            <BookEnrichmentPanel :book-id="book?._id ?? null" :disabled="isSaving" @applied="handleEnrichmentApplied" />
          </template>

          <div class="form-grid">
            <AppField label="Subgêneros" class="form-grid__full">
              <template #default="{ labelId }">
                <MultiSelect
                  label="Escolher subgêneros"
                  :labelledby="labelId"
                  :options="subgeneroOptions"
                  :selected="form.subgeneros"
                  :multiple="true"
                  :searchable="true"
                  @toggle="handleSubgeneroToggle"
                  @clear="form.subgeneros = []"
                />
              </template>
            </AppField>
            <AppField
              id="bf-porque"
              v-model="form.porque"
              trim
              class="form-grid__full"
              label="Comentário"
              multiline
              :rows="3"
              :disabled="isSaving"
            />
            <AppField
              v-model="form.synopsis"
              trim
              class="form-grid__full"
              label="Sinopse"
              multiline
              :rows="4"
              :disabled="isSaving"
            />
            <AppField
              v-model="form.published_year"
              trim
              label="Ano de publicação"
              type="number"
              min="0"
              step="1"
              :disabled="isSaving"
              autocomplete="off"
            />
            <AppField
              v-model="form.page_count"
              trim
              label="Páginas"
              type="number"
              min="0"
              step="1"
              :disabled="isSaving"
              autocomplete="off"
            />
            <AppField
              v-model="form.isbn"
              trim
              label="ISBN"
              placeholder="978-…"
              :maxlength="17"
              :disabled="isSaving"
              autocomplete="off"
            />
            <AppField
              v-model="form.google_books_id"
              trim
              label="Código no Google Books"
              :disabled="isSaving"
              autocomplete="off"
            />
            <AppField
              v-model="form.cover_url"
              trim
              class="form-grid__full"
              label="Endereço da capa"
              type="url"
              placeholder="https://…"
              :disabled="isSaving"
              autocomplete="off"
            />
          </div>
        </div>
      </section>
    </form>

    <template #footer>
      <div class="drawer-footer">
        <AppNotice v-if="error" class="drawer-footer__notice" :text="error" />
        <p v-if="success" class="drawer-footer__success" role="status">{{ success }}</p>

        <div class="drawer-footer__actions">
          <AppButton size="md" :disabled="isSaving" @click="close">Cancelar</AppButton>
          <AppButton variant="primary" size="md" :disabled="isSaving || !isValid" @click="handleSubmit">
            {{ isSaving ? 'Salvando…' : isEditMode ? 'Salvar alterações' : 'Adicionar o livro' }}
          </AppButton>
        </div>
        <p v-if="missingText" class="drawer-footer__missing" aria-live="polite">{{ missingText }}</p>
      </div>
    </template>
  </AppDrawer>
</template>

<script lang="ts" setup>
import { errorText } from '@/composables/apiError'
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'

import { useEntityCrud, useErrorReporter } from '@/composables'
import { saveBook } from '@/composables/useApi'
import { joinWords } from '@/data/words'
import { usePermissionsStore } from '@/stores'
import MultiSelect from '@/components/MultiSelect.vue'
import AppButton from '@/components/AppButton.vue'
import AppDrawer from '@/components/AppDrawer.vue'
import AppField from '@/components/AppField.vue'
import AppNotice from '@/components/AppNotice.vue'
import BookEnrichmentPanel from '@/components/BookEnrichmentPanel.vue'
import type { BookPayload } from '@/types'

const props = defineProps<{
  book: BookPayload | null
  isOpen: boolean
  scope?: 'admin' | 'member'
  // A new book can start with a title, e.g. the search that found nothing.
  title?: string
  // Opened to write the comment ("Escrever o que achei"): the optional part opens with focus on it.
  focus?: 'porque'
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

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

// Scope follows the permission, not the screen: whoever may edit any book gets the panel's form everywhere.
const permissions = usePermissionsStore()
// The owner's own route unless the admin route (PATCH /books/:id) would accept this person for any book.
const isMemberScope = computed(() => props.scope === 'member' && !permissions.can('books', 'update'))
// The automatic search asks for books:update in the API; everyone else fills the same fields by hand.
const canSearchData = computed(() => permissions.can('books', 'update'))
// Open when editing a book that already has any of the optional data; closed when adding (cadastro-de-livro-essencial).
const showMore = ref(false)
const isEditMode = computed(() => !!props.book)

// Says what is missing instead of a silent grey button.
const missingText = computed(() => {
  const missing = [
    !form.titulo.trim() && 'o título',
    !form.autor && 'o autor',
    !form.midia && 'o formato',
    !form.categoria && 'o gênero',
    !isMemberScope.value && !form.quem_nome.trim() && 'quem mencionou',
  ].filter(Boolean) as string[]
  if (!missing.length) return ''
  return `${missing.length === 1 ? 'Falta' : 'Faltam'} ${joinWords(missing)}.`
})

const isValid = computed(
  () =>
    form.titulo.trim().length > 0 &&
    form.autor.length > 0 &&
    form.midia.length > 0 &&
    form.categoria.length > 0 &&
    (isMemberScope.value || form.quem_nome.length >= 1),
)

// ── Support entity options ──
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

// ── Form population ──
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

const adoptOptional = (book: BookPayload): void => {
  form.isbn = book.isbn ?? ''
  form.cover_url = book.cover_url ?? ''
  form.synopsis = book.synopsis ?? ''
  form.google_books_id = book.google_books_id ? String(book.google_books_id) : ''
  form.page_count = book.page_count ? String(book.page_count) : ''
  form.published_year = book.published_year ? String(book.published_year) : ''
}

const populateForm = (book: BookPayload): void => {
  form.titulo = book.titulo
  form.autor = extractId(book.autor)
  form.midia = extractId(book.midia)
  form.categoria = extractId(book.categoria)
  form.subgeneros = book.subgeneros.map(extractId)
  form.quem_nome = book.quem_nome
  form.porque = book.porque ?? ''
  adoptOptional(book)
}

watch(
  () => props.isOpen,
  async (open) => {
    if (!open) return

    error.value = ''
    success.value = ''

    if (props.book) populateForm(props.book)
    else {
      resetForm()
      form.titulo = props.title?.trim() ?? ''
    }
    showMore.value =
      props.focus === 'porque' ||
      (!!props.book &&
        [
          form.porque,
          form.synopsis,
          form.isbn,
          form.cover_url,
          form.google_books_id,
          form.page_count,
          form.published_year,
        ].some(Boolean)) ||
      (!!props.book && form.subgeneros.length > 0)
  },
)

let closeTimer: ReturnType<typeof setTimeout> | undefined

const close = (): void => {
  clearTimeout(closeTimer)
  emit('close')
}

onBeforeUnmount(() => clearTimeout(closeTimer))

// ── Submit ──
// The API decides what changed and what counts as a hand edit; an emptied field goes as null so it is cleared.
const optionalFields = () => {
  const fields: Record<string, string | number | null> = {
    isbn: form.isbn || null,
    cover_url: form.cover_url || null,
    synopsis: form.synopsis || null,
    google_books_id: form.google_books_id || null,
    page_count: positiveInt(form.page_count),
    published_year: positiveInt(form.published_year),
  }
  // A new book leaves out what was not filled; an edit sends everything, empty included.
  return isEditMode.value ? fields : Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== null))
}

const positiveInt = (raw: string) => {
  const value = Number(raw)
  return Number.isInteger(value) && value > 0 ? value : null
}

const handleSubmit = async () => {
  if (!isValid.value) return
  if (isMemberScope.value && !props.book) return

  isSaving.value = true
  error.value = ''
  success.value = ''

  try {
    const shared = {
      titulo: form.titulo,
      autor: form.autor,
      midia: form.midia,
      categoria: form.categoria,
      subgeneros: form.subgeneros,
      porque: form.porque,
      ...optionalFields(),
    }
    const payload = isMemberScope.value ? shared : { ...shared, quem_nome: form.quem_nome }
    await saveBook(payload, { id: props.book?._id, asOwner: isMemberScope.value })

    success.value = isEditMode.value ? 'Livro atualizado.' : 'Livro adicionado.'
    emit('saved')

    if (!isEditMode.value) {
      closeTimer = setTimeout(close, 800)
    }
  } catch (e) {
    error.value = errorText(e, 'Não deu pra salvar. Tente de novo.')
    useErrorReporter().captureException(e, { context: 'BookFormDrawer.submit' })
  } finally {
    isSaving.value = false
  }
}

// The search already saved these fields; the form shows them so the next save does not undo them.
const handleEnrichmentApplied = (book: BookPayload): void => {
  adoptOptional(book)
  success.value = 'Capa e dados salvos no livro.'
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
// The frame (veil, panel, "Fechar", focus, Back) is AppDrawer's; this is the form inside it.
.book-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.form-section {
  padding: var(--space-4);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  background: var(--color-surface-raised);

  &__title {
    margin: 0 0 var(--space-3);
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-default);
  }

  &__text {
    margin: 0 0 var(--space-3);
    font-size: var(--font-size-ui);
    color: var(--color-text-secondary);
  }

  &__toggle {
    display: flex;
    width: 100%;
    min-height: var(--touch-min);
    align-items: center;
    justify-content: space-between;
    padding: 0;
    border: none;
    background: none;
    font-family: var(--font-family-body);
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-default);
    text-align: left;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: var(--focus-offset);
    }
  }

  &__optional {
    font-weight: var(--font-weight-regular);
    color: var(--color-text-subtle);
  }

  &__chevron {
    width: var(--icon-md);
    height: var(--icon-md);
    color: var(--color-text-subtle);
    transition: transform var(--motion-transition-default);

    &.is-open {
      transform: rotate(180deg);
    }
  }

  &__more {
    margin-top: var(--space-3);
  }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);

  &__full {
    grid-column: 1 / -1;
  }
}

.drawer-footer {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  &__notice {
    margin-bottom: 0;
  }

  &__missing {
    margin: 0;
    font-size: var(--font-size-meta);
    color: var(--color-text-subtle);
    text-align: right;
  }

  &__success {
    margin: 0;
    font-size: var(--font-size-ui);
    color: var(--color-text-default);
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
  }
}

@media (max-width: $bp-phone-max) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .form-section {
    padding: var(--space-3);
  }

  .drawer-footer__actions {
    flex-direction: column-reverse;

    .app-button {
      width: 100%;
    }
  }
}
</style>
