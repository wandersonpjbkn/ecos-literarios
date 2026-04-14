<template>
  <!-- Overlay -->
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
        <!-- Header -->
        <div class="drawer-header">
          <h2 class="drawer-header__title">
            {{ isEditMode ? 'Editar livro' : 'Novo livro' }}
          </h2>
          <button class="drawer-close" type="button" aria-label="Fechar" @click="close">
            <BaseIcon name="times" aria-hidden="true" />
          </button>
        </div>

        <!-- Body -->
        <div class="drawer-body">
          <form class="book-form" @submit.prevent="handleSubmit">
            <!-- isbn -->
            <div class="form-field">
              <label for="bf-isbn" class="form-field__label">ISBN</label>
              <input
                id="bf-isbn"
                v-model.trim="form.isbn"
                type="text"
                class="form-field__input form-field__input--narrow"
                placeholder="978-…"
                :disabled="isSaving"
                autocomplete="off"
                maxlength="17"
              />
            </div>

            <!-- titulo -->
            <div class="form-field">
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

            <!-- subgeneros -->
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

            <!-- quem_nome -->
            <div class="form-field">
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

            <!-- porque -->
            <div class="form-field">
              <label for="bf-porque" class="form-field__label">Por que foi indicado</label>
              <textarea
                id="bf-porque"
                v-model.trim="form.porque"
                class="form-field__textarea"
                rows="3"
                :disabled="isSaving"
              />
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="drawer-footer">
          <p v-if="error" class="drawer-feedback drawer-feedback--error">{{ error }}</p>
          <p v-if="success" class="drawer-feedback drawer-feedback--success">{{ success }}</p>

          <div class="drawer-footer__actions">
            <button type="button" class="drawer-btn drawer-btn--secondary" :disabled="isSaving" @click="close">
              Cancelar
            </button>
            <button
              type="button"
              class="drawer-btn drawer-btn--primary"
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
}

const props = defineProps<{
  book: BookPayload | null
  isOpen: boolean
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
})

const isEditMode = computed(() => !!props.book)

const isValid = computed(
  () =>
    form.titulo.length >= 1 &&
    form.autor.length > 0 &&
    form.midia.length > 0 &&
    form.categoria.length > 0 &&
    form.quem_nome.length >= 1,
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

// ── Populate form when book prop changes ──────────────────────────
const extractId = (field: string | { _id: string }): string => (typeof field === 'string' ? field : field._id)

watch(
  () => props.isOpen,
  async (open) => {
    if (!open) return

    error.value = ''
    success.value = ''

    if (props.book) {
      form.titulo = props.book.titulo
      form.autor = extractId(props.book.autor)
      form.midia = extractId(props.book.midia)
      form.categoria = extractId(props.book.categoria)
      form.subgeneros = props.book.subgeneros.map(extractId)
      form.quem_nome = props.book.quem_nome
      form.porque = props.book.porque ?? ''
      form.isbn = props.book.isbn ?? ''
    } else {
      form.titulo = ''
      form.autor = ''
      form.midia = ''
      form.categoria = ''
      form.subgeneros = []
      form.quem_nome = ''
      form.porque = ''
      form.isbn = ''
    }

    document.body.style.overflow = 'hidden'
    await nextTick()
    firstInputRef.value?.focus()
  },
)

const close = () => {
  document.body.style.overflow = ''
  emit('close')
}

const handleSubmit = async () => {
  if (!isValid.value) return
  isSaving.value = true
  error.value = ''
  success.value = ''

  const payload: Record<string, unknown> = {
    titulo: form.titulo,
    autor: form.autor,
    midia: form.midia,
    categoria: form.categoria,
    subgeneros: form.subgeneros,
    quem_nome: form.quem_nome,
    porque: form.porque,
  }

  if (form.isbn) payload.isbn = form.isbn

  try {
    const url = isEditMode.value ? `${API_BASE}/books/${props.book!._id}` : `${API_BASE}/books`

    const res = await fetch(url, {
      method: isEditMode.value ? 'PATCH' : 'POST',
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

onMounted(() => {
  autores.fetchAll()
  midias.fetchAll()
  categorias.fetchAll()
  subgeneros.fetchAll()
})
</script>

<style lang="scss" scoped>
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
  width: min(480px, 92dvw);
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

  &__input--narrow {
    max-width: 220px;
  }

  &__textarea {
    padding: 0.6rem 0.75rem;
    resize: vertical;
    min-height: 80px;
    line-height: 1.5;
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

.drawer-feedback {
  margin: 0;
  font-size: 0.82rem;
  padding: 0.4rem 0.65rem;
  border-radius: var(--border-radius-sm);

  &--error {
    color: #c0392b;
    background: rgba(192, 57, 43, 0.06);
  }

  &--success {
    color: #2e7d32;
    background: rgba(46, 125, 50, 0.06);
  }
}

.drawer-btn {
  min-height: 40px;
  padding: 0 1rem;
  border: none;
  border-radius: var(--border-radius-sm);
  font-family: var(--font-family-body);
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity var(--motion-transition-default);

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--primary {
    background: var(--color-action-default);
    color: #fff;

    &:hover:not(:disabled) {
      opacity: 0.85;
    }
  }

  &--secondary {
    background: var(--color-background-subtle);
    color: var(--color-text-default);
    border: 1px solid var(--color-border-default);

    &:hover:not(:disabled) {
      background: var(--color-background-default);
    }
  }
}

// ── Transitions ───────────────────────────────────────────────────
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
</style>
