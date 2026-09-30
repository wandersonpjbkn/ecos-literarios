<template>
  <AppDrawer
    :open="isOpen"
    :title="isEditMode ? 'Editar o livro' : 'Adicionar um livro'"
    wide
    :initial-focus="focus === 'porque' ? '#bf-porque' : '#bf-titulo'"
    class="book-form-drawer"
    :return-focus="returnFocus"
    @close="close"
  >
    <form class="book-form" @submit.prevent="handleSubmit">
      <section class="form-section" aria-labelledby="bf-essential">
        <h3 id="bf-essential" class="form-section__title">O essencial</h3>
        <p class="form-section__text">Só isto é preciso para o livro entrar no catálogo.</p>

        <!-- A free placeholder with this account's name: linking first makes those books this person's too. -->
        <div v-if="claimOffer" class="claim-offer" role="status">
          <p class="claim-offer__text">
            O nome "{{ claimOffer }}" já está no catálogo. É você? Se for, vincule esse nome e esses livros passam a ser seus.
          </p>
          <AppNotice v-if="claimError" :text="claimError" />
          <div class="claim-offer__actions">
            <AppButton size="md" :disabled="claiming" @click="claimOfferedName">
              {{ claiming ? 'Vinculando…' : 'Vincular este nome' }}
            </AppButton>
            <AppButton variant="ghost" size="md" :disabled="claiming" @click="dismissClaimOffer">
              Não sou eu, continuar
            </AppButton>
          </div>
        </div>
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
          <AppField v-if="!isMemberScope" label="Mencionado por" hint="Quem falou do livro no grupo.">
            <template #default="{ labelId, describedBy }">
              <MultiSelect
                label="Escolher quem mencionou"
                :labelledby="labelId"
                :aria-describedby="describedBy"
                :options="personOptions"
                :selected="form.person"
                :multiple="false"
                :searchable="true"
                :create-label="canAddName ? newNameLabel : undefined"
                @toggle="(v) => (form.person = v)"
                @create="(typed) => (form.person = `${NEW_NAME}${typed}`)"
              />
            </template>
          </AppField>
          <AppNotice v-if="peopleError" class="form-grid__full" :text="peopleError" retry @retry="loadPeople" />
          <AppField
            id="bf-porque"
            v-model="form.porque"
            trim
            class="form-grid__full"
            label="Comentário"
            hint="Os comentários aparecem no eco da semana, no catálogo."
            multiline
            :rows="3"
            :disabled="isSaving"
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
              <a href="https://books.google.com/" class="form-section__link" target="_blank" rel="noopener noreferrer"
                >Google Books<span class="visually-hidden">{{ ' ' }}(abre em outra aba)</span></a
              >
              ou pela
              <a href="https://openlibrary.org" class="form-section__link" target="_blank" rel="noopener noreferrer"
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

        <!-- Apart from saving, with the book open in front of whoever decides (slice 8b). -->
        <div v-if="canRemove" class="drawer-footer__remove">
          <AppButton variant="danger" size="md" :disabled="isSaving" @click="openRemove">
            <BaseIcon name="trash" aria-hidden="true" />
            Remover este livro do acervo
          </AppButton>
        </div>
      </div>
    </template>
  </AppDrawer>

  <ConfirmModal
    v-model="removal.open"
    destructive
    :title="`Remover &quot;${book?.titulo}&quot;?`"
    description="O livro sai do catálogo e das listas de quem guardou. Não é possível desfazer."
    confirm-label="Remover o livro"
    busy-label="Removendo…"
    :error="removal.error"
    :loading="removal.loading"
    @confirm="remove"
    @cancel="removal.open = false"
  />
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

import { joinWords } from '@/data/words'
import type { BookPayload } from '@/types'

import { useAuthStore, usePermissionsStore } from '@/stores'

import { useEntityCrud, useErrorReporter, useToast } from '@/composables'
import { reloadAccount } from '@/composables/accountSync'
import { errorText } from '@/composables/apiError'
import { claimRegister, getPeople, removeBook, saveBook, useApi } from '@/composables/useApi'

import BookEnrichmentPanel from '@/components/books/BookEnrichmentPanel.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppDrawer from '@/components/ui/AppDrawer.vue'
import AppField from '@/components/ui/AppField.vue'
import AppNotice from '@/components/ui/AppNotice.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import MultiSelect from '@/components/ui/MultiSelect.vue'

const USER = 'user:'
const NAME = 'name:'
const NEW_NAME = 'new:'

const props = defineProps<{
  book: BookPayload | null
  isOpen: boolean
  scope?: 'admin' | 'member'
  // A new book can start with a title, e.g. the search that found nothing.
  title?: string
  // Opened to write the comment ("Escrever o que achei"): focus starts on it.
  focus?: 'porque'
  // Where focus goes when the button that opened the form is gone (after removing the book).
  returnFocus?: () => HTMLElement | null | undefined
}>()

const emit = defineEmits<{
  close: []
  saved: []
  removed: [id: string]
}>()

const permissions = usePermissionsStore()

const auth = useAuthStore()

const autores = useEntityCrud({ resource: 'autores' })
const midias = useEntityCrud({ resource: 'midias' })
const categorias = useEntityCrud({ resource: 'categorias' })
const subgeneros = useEntityCrud({ resource: 'subgeneros' })

const isSaving = ref(false)
const error = ref('')
const success = ref('')

const form = reactive({
  titulo: '',
  autor: '',
  midia: '',
  categoria: '',
  subgeneros: [] as string[],
  // 'user:<id>' for an account, 'name:<placeholder>' for a free placeholder, 'new:<typed>' for a new name.
  person: '',
  porque: '',
  isbn: '',
  cover_url: '',
  synopsis: '',
  google_books_id: '',
  page_count: '',
  published_year: '',
})

// Open when editing a book that already has any of the optional data; closed when adding (cadastro-de-livro-essencial).
const showMore = ref(false)

// A refused removal stays in the dialog, where the decision was made; confirming again retries it.
const removal = reactive({ open: false, loading: false, error: '' })

const people = ref<{ user_id: string | null; name: string }[]>([])
const initialPerson = ref('')
// The book's own account, which the list leaves out until it links a name (the adder, by default).
const currentAccount = ref<{ value: string; label: string } | null>(null)

const peopleError = ref('')

const claimDismissed = ref(false)
const claiming = ref(false)
const claimError = ref('')

let closeTimer: ReturnType<typeof setTimeout> | undefined

// Scope follows the permission, not the screen: whoever may edit any book (PATCH /books/:id) gets the panel's form.
const isMemberScope = computed(() => props.scope === 'member' && !permissions.can('books', 'update'))
// The automatic search asks for books:update in the API; everyone else fills the same fields by hand.
const canSearchData = computed(() => permissions.can('books', 'update'))

const isEditMode = computed(() => !!props.book)
const canRemove = computed(() => isEditMode.value && !isMemberScope.value && permissions.can('books', 'delete'))

// Says what is missing instead of a silent grey button.
const missingText = computed(() => {
  const missing = [
    !form.titulo.trim() && 'o título',
    !form.autor && 'o autor',
    !form.midia && 'o formato',
    !form.categoria && 'o gênero',
  ].filter(Boolean) as string[]
  if (!missing.length) return ''
  return `${missing.length === 1 ? 'Falta' : 'Faltam'} ${joinWords(missing)}.`
})

const isValid = computed(
  () =>
    form.titulo.trim().length > 0 &&
    form.autor.length > 0 &&
    form.midia.length > 0 &&
    form.categoria.length > 0,
)

// "Outro nome" follows the matrix (claim: create), by default only the Administrador.
const canAddName = computed(() => permissions.can('claim', 'create'))

const personOptions = computed(() => {
  const options = people.value.map((p) => ({ label: p.name, value: p.user_id ? `${USER}${p.user_id}` : `${NAME}${p.name}` }))
  const current = currentAccount.value
  if (current && !options.some((o) => o.value === current.value)) options.push(current)
  if (form.person.startsWith(NEW_NAME)) options.push({ label: `${form.person.slice(NEW_NAME.length)} (nome novo)`, value: form.person })
  return options
})

const claimOffer = computed(() =>
  !isEditMode.value && !isMemberScope.value && !claimDismissed.value ? permissions.claimMatch : null,
)

const autorOptions = computed(() => toOptions(autores.items.value))
const midiaOptions = computed(() => toOptions(midias.items.value))
const categoriaOptions = computed(() => toOptions(categorias.items.value))
const subgeneroOptions = computed(() => toOptions(subgeneros.items.value))

const openRemove = () => {
  removal.error = ''
  removal.open = true
}
const remove = async () => {
  const book = props.book
  if (!book) return
  removal.loading = true
  removal.error = ''
  try {
    await removeBook(book._id)
    removal.open = false
    useToast().show(`"${book.titulo}" removido.`)
    // The dialog hands focus back first; then the form closes and sends it to the list, not to a leaving button.
    await nextTick()
    await nextTick()
    emit('removed', book._id)
    close()
  } catch (e) {
    removal.error = errorText(e, 'Não foi possível remover o livro. Tente de novo.')
    useErrorReporter().captureException(e, { context: 'BookFormDrawer.remove' })
  } finally {
    removal.loading = false
  }
}

const newNameLabel = (typed: string) => `Outro nome: ${typed}`

const personPayload = (): Record<string, string> => {
  if (form.person.startsWith(USER)) return { quem_user_id: form.person.slice(USER.length) }
  if (form.person.startsWith(NAME)) return { quem_nome: form.person.slice(NAME.length) }
  if (form.person.startsWith(NEW_NAME)) return { quem_nome: form.person.slice(NEW_NAME.length) }
  return {}
}

const loadPeople = async () => {
  peopleError.value = ''
  try {
    people.value = await getPeople()
  } catch (e) {
    peopleError.value = errorText(e, 'Não foi possível carregar a lista de pessoas. Tente de novo.')
    useErrorReporter().captureException(e, { context: 'BookFormDrawer.people' })
  }
}

// The box leaves with the button that had focus: the next field takes it.
const focusTitle = () => nextTick(() => document.querySelector<HTMLElement>('#bf-titulo')?.focus())
const dismissClaimOffer = () => {
  claimDismissed.value = true
  focusTitle()
}

const claimOfferedName = async () => {
  const name = permissions.claimMatch
  if (!name) return
  claiming.value = true
  claimError.value = ''
  try {
    await claimRegister(name)
    useToast().show(`Pronto: "${name}" é você no catálogo.`)
    await reloadAccount()
    useApi().fetchBooks()
    loadPeople()
    focusTitle()
  } catch (e) {
    claimError.value = errorText(e, 'Não foi possível vincular o nome. Tente de novo.')
    useErrorReporter().captureException(e, { context: 'BookFormDrawer.claim' })
  } finally {
    claiming.value = false
  }
}

const toOptions = (items: Array<{ _id: string; nome: string }>) => items.map((i) => ({ label: i.nome, value: i._id }))

const handleSubgeneroToggle = (value: string) => {
  const idx = form.subgeneros.indexOf(value)
  if (idx === -1) form.subgeneros.push(value)
  else form.subgeneros.splice(idx, 1)
}

const extractId = (field: string | { _id: string }): string => (typeof field === 'string' ? field : field._id)

const resetForm = (): void => {
  form.titulo = ''
  form.autor = ''
  form.midia = ''
  form.categoria = ''
  form.subgeneros = []
  form.person = auth.user ? `${USER}${auth.user._id}` : ''
  currentAccount.value = auth.user ? { value: form.person, label: auth.user.name } : null
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
  form.person = book.quem_user_id ? `${USER}${book.quem_user_id._id}` : book.quem_nome ? `${NAME}${book.quem_nome}` : ''
  currentAccount.value = book.quem_user_id ? { value: form.person, label: book.quem_user_id.name } : null
  form.porque = book.porque ?? ''
  adoptOptional(book)
}

const close = (): void => {
  clearTimeout(closeTimer)
  emit('close')
}

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
    // Who mentioned goes only when it changed: the API keeps the book's history for real changes.
    const person = !isMemberScope.value && form.person !== initialPerson.value ? personPayload() : {}
    const payload = { ...shared, ...person }
    await saveBook(payload, { id: props.book?._id, asOwner: isMemberScope.value })

    success.value = isEditMode.value ? 'Livro atualizado.' : 'Livro adicionado.'
    emit('saved')

    if (!isEditMode.value) {
      closeTimer = setTimeout(close, 800)
    }
  } catch (e) {
    error.value = errorText(e, 'Não foi possível salvar. Tente de novo.')
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
    initialPerson.value = form.person
    claimDismissed.value = false
    claimError.value = ''
    if (!isMemberScope.value) loadPeople()
    showMore.value =
      (!!props.book &&
        [
          form.synopsis,
          form.isbn,
          form.cover_url,
          form.google_books_id,
          form.page_count,
          form.published_year,
        ].some(Boolean)) ||
      (!!props.book && form.subgeneros.length > 0)
  },
  // Opened on arrival (?adicionar=1): the form must be prepared on the first render too.
  { immediate: true },
)

onBeforeUnmount(() => clearTimeout(closeTimer))

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

  &__link {
    @include text-link;
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

// A question, not a warning: the neutral box, with both ways on.
.claim-offer {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  background: var(--color-background-subtle);

  &__text {
    margin: 0;
    font-size: var(--font-size-ui);
    color: var(--color-text-default);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
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

  // Set apart from saving by a line, so it is never the next button the hand reaches for.
  &__remove {
    display: flex;
    padding-top: var(--space-3);
    border-top: 1px solid var(--color-border-default);
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

  .drawer-footer__remove .app-button {
    width: 100%;
  }
}
</style>
