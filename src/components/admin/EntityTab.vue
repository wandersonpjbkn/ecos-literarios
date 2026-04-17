<template>
  <div class="entity-tab">
    <!-- Header -->
    <div class="entity-tab__header">
      <div>
        <h3 class="entity-tab__title">{{ title }}</h3>
        <p v-if="description" class="entity-tab__desc">{{ description }}</p>
      </div>
      <button class="entity-tab__add-btn" :disabled="crud.loading.value" @click="isFormOpen = !isFormOpen">
        {{ isFormOpen ? 'Cancelar' : '+ Adicionar' }}
      </button>
    </div>

    <!-- Inline create form -->
    <Transition name="slide">
      <form v-if="isFormOpen" class="entity-form" @submit.prevent="handleCreate">
        <input
          ref="inputRef"
          v-model.trim="newName"
          type="text"
          class="entity-form__input"
          :placeholder="`Nome do(a) ${title.toLowerCase()}…`"
          :disabled="isCreating"
          maxlength="80"
          autocomplete="off"
        />
        <button type="submit" class="entity-form__submit" :disabled="isCreating || newName.length < 2">
          {{ isCreating ? 'Criando…' : 'Criar' }}
        </button>
      </form>
    </Transition>

    <!-- Feedback -->
    <Transition name="fade">
      <p v-if="feedback" class="entity-feedback" :class="`entity-feedback--${feedbackType}`">
        {{ feedback }}
      </p>
    </Transition>

    <!-- Loading -->
    <BaseSpinner v-if="crud.loading.value" class="entity-state">Carregando…</BaseSpinner>

    <!-- Error -->
    <div v-else-if="crud.error.value" class="entity-state entity-state--error">
      <BaseIcon name="error" aria-hidden="true" />
      <p>{{ crud.error.value }}</p>
      <button class="entity-retry" @click="crud.fetchAll()">Tentar novamente</button>
    </div>

    <!-- Empty -->
    <p v-else-if="crud.items.value.length === 0" class="entity-empty">Nenhum item cadastrado.</p>

    <!-- List -->
    <template v-else>
      <!-- Search (6+ items) -->
      <div v-if="crud.items.value.length >= 6" class="entity-search">
        <BaseIcon name="search" class="entity-search__icon" />
        <input
          v-model="searchQuery"
          type="text"
          class="entity-search__input"
          placeholder="Filtrar…"
          autocomplete="off"
        />
      </div>

      <!-- Items -->
      <TransitionGroup name="entity-item" tag="div" class="entity-items">
        <div class="entity-row--content">
          <div v-for="item in paginatedEntities" :key="item._id" class="entity-row">
            <!-- Edit mode -->
            <template v-if="editingId === item._id">
              <form class="entity-row__edit-form" @submit.prevent="handleUpdate">
                <input
                  ref="editInputRef"
                  v-model.trim="editingName"
                  type="text"
                  class="entity-row__edit-input"
                  :disabled="isUpdating"
                  maxlength="80"
                  autocomplete="off"
                  @keydown.escape="cancelEdit"
                />
                <button
                  type="submit"
                  class="entity-row__action entity-row__action--save"
                  :disabled="isUpdating || editingName.length < 2 || editingName === item.nome"
                  :aria-label="`Salvar ${editingName}`"
                >
                  <BaseIcon name="check" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  class="entity-row__action entity-row__action--cancel"
                  :disabled="isUpdating"
                  aria-label="Cancelar edição"
                  @click="cancelEdit"
                >
                  <BaseIcon name="times" aria-hidden="true" />
                </button>
              </form>
            </template>

            <!-- Display mode -->
            <template v-else>
              <div class="entity-row__info">
                <span class="entity-row__name" @click="startEdit(item)">{{ item.nome }}</span>
                <span class="entity-row__slug">{{ item.slug }}</span>
              </div>
              <div class="entity-row__actions">
                <button
                  class="entity-row__action entity-row__action--edit"
                  type="button"
                  :aria-label="`Editar ${item.nome}`"
                  :disabled="!!editingId"
                  @click="startEdit(item)"
                >
                  <BaseIcon name="pencil" aria-hidden="true" />
                </button>
                <button
                  class="entity-row__action entity-row__action--delete"
                  type="button"
                  :aria-label="`Remover ${item.nome}`"
                  :disabled="deletingId === item._id || !!editingId"
                  @click="confirmDelete(item)"
                >
                  <BaseIcon name="trash" aria-hidden="true" />
                </button>
              </div>
            </template>
          </div>
        </div>
      </TransitionGroup>

      <p v-if="filteredItems.length === 0 && searchQuery" class="entity-empty">
        Nenhum resultado para "{{ searchQuery }}".
      </p>

      <!-- Pagination -->
      <PaginationNav ref="paginationNav" :items="filteredItems" />
    </template>

    <!-- Delete confirmation -->
    <ConfirmModal
      v-model="deleteModal.open"
      title="Remover item"
      :description="deleteModal.description"
      confirm-label="Remover"
      :danger="true"
      :loading="!!deletingId"
      @confirm="handleDelete"
      @cancel="deleteModal.open = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, reactive } from 'vue'

import { useEntityCrud } from '@/composables/useEntityCrud'
import ConfirmModal from '@/components/admin/ConfirmModal.vue'
import PaginationNav from '@/components/PaginationNav.vue'
import type { SupportEntity } from '@/types'

const props = defineProps<{
  resource: string
  title: string
  description?: string
}>()

const crud = useEntityCrud({ resource: props.resource })

const inputRef = ref<HTMLInputElement | null>(null)
const editInputRef = ref<HTMLInputElement | null>(null)
const paginationNav = ref<InstanceType<typeof PaginationNav> | null>(null)
const isFormOpen = ref(false)
const isCreating = ref(false)
const isUpdating = ref(false)
const editingId = ref<string | null>(null)
const editingName = ref('')
const deletingId = ref<string | null>(null)
const newName = ref('')
const searchQuery = ref('')
const feedback = ref('')
const feedbackType = ref<'success' | 'error'>('success')

const deleteModal = reactive({
  open: false,
  description: '',
  targetId: '',
})

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return crud.items.value
  const q = searchQuery.value.toLowerCase()
  return crud.items.value.filter((item) => item.nome.toLowerCase().includes(q))
})

const paginatedEntities = computed(() => {
  return (paginationNav.value?.paginatedItems ?? []) as SupportEntity[]
})

watch(isFormOpen, async (open) => {
  if (open) {
    await nextTick()
    inputRef.value?.focus()
  }
})

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

const showFeedback = (message: string, type: 'success' | 'error') => {
  feedback.value = message
  feedbackType.value = type
  setTimeout(() => {
    feedback.value = ''
  }, 4000)
}

const handleCreate = async () => {
  if (newName.value.length < 2) return
  isCreating.value = true

  try {
    const created = await crud.create(newName.value)
    newName.value = ''
    showFeedback(`"${created.nome}" criado com sucesso.`, 'success')
  } catch (e) {
    showFeedback(e instanceof Error ? e.message : 'Erro ao criar item.', 'error')
  } finally {
    isCreating.value = false
  }
}

const startEdit = async (item: SupportEntity) => {
  editingId.value = item._id
  editingName.value = item.nome
  await nextTick()
  const el = Array.isArray(editInputRef.value) ? editInputRef.value[0] : editInputRef.value
  el?.focus()
}

const cancelEdit = () => {
  editingId.value = null
  editingName.value = ''
}

const handleUpdate = async () => {
  if (!editingId.value || editingName.value.length < 2) return
  isUpdating.value = true

  try {
    const updated = await crud.update(editingId.value, editingName.value)
    showFeedback(`Renomeado para "${updated.nome}".`, 'success')
    cancelEdit()
  } catch (e) {
    showFeedback(e instanceof Error ? e.message : 'Erro ao atualizar item.', 'error')
  } finally {
    isUpdating.value = false
  }
}

const confirmDelete = (item: SupportEntity) => {
  deleteModal.open = true
  deleteModal.description = `Remover "${item.nome}"? Itens em uso por livros existentes não podem ser removidos.`
  deleteModal.targetId = item._id
}

const handleDelete = async () => {
  const id = deleteModal.targetId
  deletingId.value = id

  try {
    await crud.remove(id)
    deleteModal.open = false
    showFeedback('Item removido.', 'success')
  } catch (e) {
    deleteModal.open = false
    showFeedback(e instanceof Error ? e.message : 'Erro ao remover item.', 'error')
  } finally {
    deletingId.value = null
  }
}

onMounted(() => crud.fetchAll())
</script>

<style lang="scss" scoped>
.entity-tab {
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  background: var(--color-surface-default);
  overflow: hidden;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--color-border-default);
    background: var(--color-background-subtle);
  }

  &__title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-default);
  }

  &__desc {
    margin: 0.25rem 0 0;
    font-size: 0.82rem;
    color: var(--color-text-subtle);
    line-height: 1.4;
  }

  &__add-btn {
    border: none;
    border-radius: var(--border-radius-sm);
    min-height: 36px;
    padding: 0 0.75rem;
    font-family: var(--font-family-body);
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    background: var(--color-action-default);
    color: #fff;
    flex-shrink: 0;
    transition: opacity var(--motion-transition-default);

    &:hover:not(:disabled) {
      opacity: 0.85;
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.entity-form {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid var(--color-border-default);
  background: var(--color-action-background-subtle);

  &__input {
    flex: 1;
    min-height: 40px;
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

  &__submit {
    min-height: 40px;
    padding: 0 1rem;
    border: none;
    border-radius: var(--border-radius-sm);
    background: var(--color-action-default);
    color: #fff;
    font-family: var(--font-family-body);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    flex-shrink: 0;
    transition: opacity var(--motion-transition-default);

    &:hover:not(:disabled) {
      opacity: 0.85;
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.entity-feedback {
  margin: 0;
  padding: 0.5rem 1.25rem;
  font-size: 0.82rem;
  border-bottom: 1px solid var(--color-border-default);

  &--success {
    color: #2e7d32;
    background: rgba(46, 125, 50, 0.06);
  }
  &--error {
    color: #c0392b;
    background: rgba(192, 57, 43, 0.06);
  }
}

.entity-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 2.5rem 1.5rem;
  text-align: center;
  color: var(--color-text-subtle);

  svg {
    width: 28px;
    height: 28px;
    opacity: 0.6;
  }
  p {
    margin: 0;
    font-size: 0.9rem;
  }

  &--error {
    color: var(--color-action-default);
    svg {
      opacity: 1;
    }
  }
}

.entity-retry {
  border: none;
  padding: 6px 14px;
  min-height: 36px;
  border-radius: var(--border-radius-sm);
  background: var(--color-action-default);
  color: #fff;
  font-family: var(--font-family-body);
  font-size: 0.85rem;
  cursor: pointer;
  transition: opacity var(--motion-transition-default);
  &:hover {
    opacity: 0.85;
  }
}

.entity-empty {
  margin: 0;
  padding: 2rem 1.25rem;
  text-align: center;
  font-size: 0.9rem;
  color: var(--color-text-subtle);
}

.entity-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.5rem 1.25rem;
  border-bottom: 1px solid var(--color-border-default);

  &__icon {
    width: 14px;
    height: 14px;
    color: var(--color-text-subtle);
    flex-shrink: 0;
  }

  &__input {
    flex: 1;
    border: none;
    outline: none;
    background: none;
    font-family: var(--font-family-body);
    font-size: 0.875rem;
    color: var(--color-text-default);
    min-height: 36px;
    &::placeholder {
      color: var(--color-text-subtle);
    }
  }
}

.entity-items {
  position: relative;
}

.entity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.65rem 1.25rem;
  border-bottom: 1px solid var(--color-border-default);
  transition: background var(--motion-transition-default);

  &--content {
    overflow-y: auto;
    max-height: 400px;
  }

  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: var(--color-background-subtle);
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
    flex: 1;
  }
  &__name {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--color-text-default);
    cursor: pointer;
  }
  &__slug {
    font-size: 0.72rem;
    color: var(--color-text-subtle);
    font-family: monospace;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
  }

  &__action {
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

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    &--edit:hover:not(:disabled) {
      background: var(--color-action-background-subtle);
      color: var(--color-action-default);
    }

    &--delete:hover:not(:disabled) {
      background: rgba(192, 57, 43, 0.08);
      color: #c0392b;
    }

    &--save {
      color: #2e7d32;
      &:hover:not(:disabled) {
        background: rgba(46, 125, 50, 0.08);
      }
    }

    &--cancel:hover:not(:disabled) {
      background: var(--color-background-subtle);
      color: var(--color-text-default);
    }
  }

  &__edit-form {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    flex: 1;
    min-width: 0;
  }

  &__edit-input {
    flex: 1;
    min-height: 36px;
    padding: 0 0.65rem;
    border: 1.5px solid var(--color-action-default);
    border-radius: var(--border-radius-sm);
    background: var(--color-surface-default);
    box-shadow: 0 0 0 3px var(--color-action-background-subtle);
    font-family: var(--font-family-body);
    font-size: 0.9rem;
    color: var(--color-text-default);
    outline: none;
    min-width: 0;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

// ── Transitions ───────────────────────────────────────────────────
.slide-enter-active,
.slide-leave-active {
  transition: all var(--motion-transition-default);
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.slide-enter-to,
.slide-leave-from {
  max-height: 80px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--motion-transition-default);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.entity-item-enter-active,
.entity-item-leave-active {
  transition: all var(--motion-transition-default);
}
.entity-item-enter-from,
.entity-item-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

@media (max-width: 767px) {
  .entity-tab__header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    padding: 0.85rem 1rem;
  }

  .entity-tab__add-btn {
    min-height: 44px;
  }

  .entity-form {
    flex-direction: column;
    padding: 0.75rem 1rem;

    &__submit {
      min-height: 44px;
    }
  }

  .entity-search {
    padding: 0.5rem 1rem;
  }

  .entity-row {
    padding: 0.75rem 1rem;

    &__name {
      word-break: break-word;
    }

    &__action {
      width: 36px;
      height: 36px;
    }
  }
}
</style>
