<template>
  <div class="entity-tab panel-box">
    <div class="entity-tab__header">
      <p v-if="description" class="entity-tab__desc">{{ description }}</p>
      <AppButton v-if="canCreate && !isFormOpen" size="md" :disabled="crud.loading.value" @click="isFormOpen = true">
        Adicionar {{ singular }}
      </AppButton>
    </div>

    <form v-if="isFormOpen" class="entity-form" @submit.prevent="handleCreate">
      <AppField
        :id="`new-${resource}`"
        v-model="newName"
        trim
        class="entity-form__field"
        :label="`Nome do ${singular}`"
        :disabled="isCreating"
        :maxlength="60"
        autocomplete="off"
      />
      <div class="entity-form__actions">
        <AppButton size="md" :disabled="isCreating" @click="closeForm">Cancelar</AppButton>
        <AppButton type="submit" variant="primary" size="md" :disabled="isCreating || !newName.trim()">
          {{ isCreating ? 'Adicionando…' : 'Adicionar' }}
        </AppButton>
      </div>
    </form>

    <AppNotice v-if="actionError" class="entity-notice" :text="actionError" />

    <BaseSpinner v-if="crud.loading.value" class="entity-state">
      <p>Carregando {{ title.toLowerCase() }}…</p>
    </BaseSpinner>

    <AppNotice
      v-else-if="crud.error.value"
      class="entity-notice"
      :text="crud.error.value"
      retry
      @retry="crud.fetchAll()"
    />

    <EmptyState
      v-else-if="crud.items.value.length === 0"
      :title="`Nenhum ${singular} ainda`"
      :text="`Os ${title.toLowerCase()} adicionados aqui viram opção na ficha dos livros.`"
    >
      <AppButton v-if="canCreate && !isFormOpen" variant="primary" @click="isFormOpen = true">
        Adicionar {{ singular }}
      </AppButton>
    </EmptyState>

    <template v-else>
      <SearchBar
        v-if="crud.items.value.length >= 6"
        v-model="searchQuery"
        class="entity-search"
        :placeholder="`Buscar em ${title.toLowerCase()}`"
        :suggestions="[]"
        :total="crud.items.value.length"
        :filtered="filteredItems.length"
      />

      <EmptyState
        v-if="filteredItems.length === 0 && searchQuery"
        :title="`Nada com &quot;${searchQuery}&quot;`"
        :text="`Procuramos no nome de cada ${singular}.`"
      >
        <AppButton @click="searchQuery = ''">Apagar a busca</AppButton>
      </EmptyState>

      <ul v-else ref="list" class="entity-items" :aria-label="title">
        <li v-for="item in pageItems" :key="item._id" class="entity-row panel-row" tabindex="-1" data-list-item>
          <form v-if="editingId === item._id" class="entity-row__edit-form" @submit.prevent="handleUpdate">
            <AppField
              :id="`edit-${item._id}`"
              v-model="editingName"
              trim
              hide-label
              class="entity-row__edit-field"
              :label="`Novo nome de ${item.nome}`"
              :disabled="isUpdating"
              :maxlength="60"
              autocomplete="off"
              @keydown.escape="cancelEdit"
            />
            <AppButton
              type="submit"
              variant="primary"
              size="md"
              :disabled="isUpdating || !editingName.trim() || editingName.trim() === item.nome"
            >
              Salvar<span class="visually-hidden">{{ ' ' }}o novo nome de {{ item.nome }}</span>
            </AppButton>
            <AppButton size="md" :disabled="isUpdating" @click="cancelEdit">Cancelar</AppButton>
          </form>

          <template v-else>
            <span class="entity-row__name">{{ item.nome }}</span>
            <div class="entity-row__actions">
              <AppButton v-if="canEdit" size="md" :disabled="!!editingId" @click="startEdit(item)">
                <BaseIcon name="pencil" aria-hidden="true" />
                Editar<span class="visually-hidden">{{ ' ' }}{{ item.nome }}</span>
              </AppButton>
              <AppButton v-if="canDelete" size="md" :disabled="!!editingId" @click="confirmDelete(item)">
                <BaseIcon name="trash" aria-hidden="true" />
                Remover<span class="visually-hidden">{{ ' ' }}{{ item.nome }}</span>
              </AppButton>
            </div>
          </template>
        </li>
      </ul>

      <ListFooter
        v-if="filteredItems.length"
        :shown="pageItems.length"
        :total="filteredItems.length"
        :next-batch="nextBatch"
        @more="more(list)"
      />
    </template>

    <ConfirmModal
      v-model="deleteModal.open"
      :title="deleteModal.title"
      :description="removeHint"
      confirm-label="Remover"
      busy-label="Removendo…"
      :error="deleteModal.error"
      :loading="isDeleting"
      :return-focus="() => list?.querySelector<HTMLElement>('[data-list-item]')"
      @confirm="handleDelete"
      @cancel="deleteModal.open = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { errorText } from '@/composables/apiError'
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, reactive } from 'vue'

import { useApi, useEntityCrud, useErrorReporter, useToast } from '@/composables'
import { counted } from '@/data/words'
import { useLoadMore } from '@/composables/useLoadMore'
import { useBooksStore, usePermissionsStore } from '@/stores'
import AppButton from '@/components/AppButton.vue'
import AppField from '@/components/AppField.vue'
import EmptyState from '@/components/EmptyState.vue'
import SearchBar from '@/components/SearchBar.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import AppNotice from '@/components/AppNotice.vue'
import ListFooter from '@/components/ListFooter.vue'
import type { SupportEntity, TabConfig } from '@/types'

const props = defineProps<{
  resource: TabConfig['resource']
  title: string
  singular: string
  description?: string
}>()

const crud = useEntityCrud({ resource: props.resource })
const toast = useToast()
const permissions = usePermissionsStore()

// The server decides; this only hides what it would refuse for this level (users/me).
const canCreate = computed(() => permissions.can(props.resource, 'create'))
const canEdit = computed(() => permissions.can(props.resource, 'update'))
const canDelete = computed(() => permissions.can(props.resource, 'delete'))

const list = ref<HTMLElement | null>(null)
const isFormOpen = ref(false)
const isCreating = ref(false)
const isUpdating = ref(false)
const isDeleting = ref(false)
const editingId = ref<string | null>(null)
const editingName = ref('')
const newName = ref('')
const searchQuery = ref('')
// Stays until the next action: an error that vanishes on a timer can be missed.
const actionError = ref('')

const deleteModal = reactive({ open: false, title: '', error: '', targetId: '', usage: 0 })

// The API refuses to remove an author, format or genre in use; a subgenre it removes without that check.
const removeHint = computed(() => {
  if (props.resource !== 'subgeneros') return `Só dá pra remover se nenhum livro usar este ${props.singular}.`
  // A subgenre is only a tag: removing it is allowed, but the person hears how many books lose it (dono).
  if (!deleteModal.usage) return 'Nenhum livro usa este subgênero. Não dá pra desfazer.'
  return `Está em ${counted(deleteModal.usage, 'livro', 'livros')}, que perdem este subgênero. Não dá pra desfazer.`
})

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return crud.items.value
  const q = searchQuery.value.toLowerCase()
  return crud.items.value.filter((item) => item.nome.toLowerCase().includes(q))
})

const { visible: pageItems, nextBatch, more, reset } = useLoadMore(filteredItems, { name: `painel-${props.resource}` })
// The search is not in the URL, so a new term starts the list from the top here.
watch(searchQuery, () => reset())

const focusField = async (id: string) => {
  await nextTick()
  document.getElementById(id)?.focus()
}

watch(isFormOpen, (open) => {
  if (open) focusField(`new-${props.resource}`)
})

const closeForm = () => {
  isFormOpen.value = false
  newName.value = ''
}

const onDocumentClick = (e: MouseEvent) => {
  if (!editingId.value) return
  const target = e.target as HTMLElement
  if (target.closest('.entity-row__edit-form')) return
  cancelEdit()
}

let clickOutsideTimer: ReturnType<typeof setTimeout> | null = null

watch(editingId, (id) => {
  document.removeEventListener('click', onDocumentClick)
  if (clickOutsideTimer) clearTimeout(clickOutsideTimer)

  if (id) {
    clickOutsideTimer = setTimeout(() => {
      document.addEventListener('click', onDocumentClick)
    }, 0)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  if (clickOutsideTimer) clearTimeout(clickOutsideTimer)
})

const handleCreate = async () => {
  const name = newName.value.trim()
  if (!name) return
  isCreating.value = true
  actionError.value = ''

  try {
    const created = await crud.create(name)
    newName.value = ''
    toast.show(`"${created.nome}" adicionado.`)
  } catch (e) {
    actionError.value = errorText(e, `Não deu pra adicionar o ${props.singular}. Tente de novo.`)
    useErrorReporter().captureException(e, { context: 'EntityTab.createItem' })
  } finally {
    isCreating.value = false
  }
}

const startEdit = (item: SupportEntity) => {
  actionError.value = ''
  editingId.value = item._id
  editingName.value = item.nome
  focusField(`edit-${item._id}`)
}

const cancelEdit = () => {
  editingId.value = null
  editingName.value = ''
}

const handleUpdate = async () => {
  const name = editingName.value.trim()
  if (!editingId.value || !name) return
  isUpdating.value = true
  actionError.value = ''

  try {
    const updated = await crud.update(editingId.value, name)
    toast.show(`Renomeado para "${updated.nome}".`)
    cancelEdit()
  } catch (e) {
    actionError.value = errorText(e, `Não deu pra renomear o ${props.singular}. Tente de novo.`)
    useErrorReporter().captureException(e, { context: 'EntityTab.updateItem' })
  } finally {
    isUpdating.value = false
  }
}

const booksUsing = async (name: string) => {
  const store = useBooksStore()
  if (!store.books.length) await useApi().fetchBooks()
  return store.books.filter((book) => (book.subgenerosArr ?? []).includes(name.toLowerCase())).length
}

const confirmDelete = async (item: SupportEntity) => {
  actionError.value = ''
  deleteModal.usage = props.resource === 'subgeneros' ? await booksUsing(item.nome) : 0
  deleteModal.title = `Remover "${item.nome}"?`
  deleteModal.error = ''
  deleteModal.targetId = item._id
  deleteModal.open = true
}

// A refused removal (in use) stays in the dialog, where the admin acted.
const handleDelete = async () => {
  const removed = crud.items.value.find((item) => item._id === deleteModal.targetId)
  isDeleting.value = true
  deleteModal.error = ''

  try {
    await crud.remove(deleteModal.targetId)
    deleteModal.open = false
    toast.show(`"${removed?.nome}" removido.`)
  } catch (e) {
    deleteModal.error = errorText(e, `Não deu pra remover o ${props.singular}. Tente de novo.`)
    useErrorReporter().captureException(e, { context: 'EntityTab.deleteItem' })
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => crud.fetchAll())
</script>

<style lang="scss" scoped>
.entity-tab {
  overflow: hidden;

  &__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3) var(--space-4);
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--color-border-default);
  }

  &__desc {
    margin: 0;
    font-size: var(--font-size-ui);
    color: var(--color-text-secondary);
  }
}

.entity-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--space-3);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border-default);
  background: var(--color-background-subtle);

  &__field {
    flex: 1 1 var(--field-basis);
  }

  &__actions {
    display: flex;
    gap: var(--space-2);
  }
}

.entity-notice {
  margin: var(--space-4);
}

// SearchBar is width: 100%; with side margins that overflows the card, so here the width is the block's own.
.entity-tab .entity-search {
  width: auto;
  margin: var(--space-3) var(--space-4);
}

.entity-items {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--color-border-default);
}

.entity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  min-height: var(--row-min);
  padding-block: var(--space-1);

  &__name {
    font-size: var(--font-size-ui);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-default);
  }

  &__actions,
  &__edit-form {
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  &__edit-form {
    flex: 1;
  }

  &__edit-field {
    flex: 1;
  }

  // Phone: the name takes its line and the two worded actions sit under it, instead of squeezing it.
  @media (max-width: $bp-phone-max) {
    flex-wrap: wrap;
    padding-block: var(--space-2);

    &__name {
      flex: 1 1 100%;
    }

    &__actions {
      margin-left: auto;
    }
  }
}

@media (max-width: $bp-phone-max) {
  .entity-tab__header,
  .entity-form,
  .entity-row {
    padding-inline: var(--space-4);
  }

  .entity-tab .entity-search,
  .entity-notice {
    margin-inline: var(--space-4);
  }
}
</style>
