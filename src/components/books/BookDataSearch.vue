<template>
  <div class="data-search">
    <!-- V4 says what happened first, then the query to change. -->
    <div v-if="status === 'none'" class="data-search__box" role="status">
      <p class="data-search__box-title">Nenhum livro encontrado</p>
      <p>
        Confira a grafia, tente só o título ou informe o ISBN, se tiver o livro em mãos. O livro também pode ser
        adicionado sem capa e completado depois.
      </p>
    </div>

    <!-- V2 open, V4: the query can be changed and searched again; otherwise it is summed up. -->
    <form v-if="queryOpen" ref="queryForm" class="data-search__query" @submit.prevent="searchAgain">
      <AppField v-model="draft.title" trim label="Título" autocomplete="off" />
      <AppField v-model="draft.author" trim label="Autor" autocomplete="off" />
      <AppField
        v-model="draft.isbn"
        trim
        label="ISBN (opcional)"
        hint="Fica no verso do livro, perto do código de barras."
        inputmode="numeric"
        autocomplete="off"
      />
      <AppButton
        type="submit"
        :variant="status === 'none' ? 'primary' : 'secondary'"
        :disabled="!draft.title || !draft.author"
      >
        <BaseIcon name="search" aria-hidden="true" />
        Buscar de novo
      </AppButton>
    </form>
    <div v-else class="data-search__query">
      <p class="data-search__asked">
        Buscando por <strong>{{ query.title }}</strong
        >, de {{ query.author }}
      </p>
      <AppButton variant="ghost" size="md" @click="openQuery">Mudar a busca</AppButton>
    </div>

    <template v-if="status === 'searching'">
      <BaseSpinner inline label="Buscando…" />
      <ul class="data-search__list" aria-hidden="true">
        <li v-for="n in 3" :key="n" class="data-search__ghost" />
      </ul>
    </template>

    <template v-else-if="status === 'found'">
      <div class="data-search__head">
        <p class="data-search__count" role="status">{{ countText }}</p>
        <PoweredByGoogle v-if="source === 'google_books'" />
      </div>
      <p class="data-search__help">
        {{ isPhone ? 'Toque no livro certo para conferir.' : 'Escolha o livro certo para conferir.' }}
      </p>
      <ul class="data-search__list">
        <li v-for="(candidate, index) in candidates" :key="candidate.volume_id">
          <button
            :ref="(el) => (cards[index] = el as HTMLElement)"
            type="button"
            class="data-search__card"
            @click="emit('pick', index)"
          >
            <BookCandidateSummary :candidate="candidate" />
          </button>
        </li>
      </ul>
    </template>

    <div v-else-if="status === 'unavailable'" class="data-search__box data-search__box--alert" role="alert">
      <p class="data-search__box-title">A busca de capa e dados não respondeu</p>
      <p>
        Tente de novo em alguns minutos. O que você já preencheu no livro continua guardado, e ele pode ser salvo sem a
        capa.
      </p>
      <AppButton size="md" @click="emit('search', query)">
        <BaseIcon name="search" aria-hidden="true" />
        Tentar de novo
      </AppButton>
    </div>

    <AppNotice v-else-if="status === 'failed'" :text="errorMessage" retry @retry="emit('search', query)" />
  </div>
</template>

<script lang="ts" setup>
import { useMediaQuery } from '@vueuse/core'
import { computed, nextTick, reactive, ref, watch } from 'vue'

import type { BookCandidate, BookSearchQuery, BookSearchSource } from '@/types'

import type { BookSearchStatus } from '@/composables/useBookSearch'
import { useBreakpoints } from '@/composables/useBreakpoints'

import BookCandidateSummary from '@/components/books/BookCandidateSummary.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppField from '@/components/ui/AppField.vue'
import AppNotice from '@/components/ui/AppNotice.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import PoweredByGoogle from '@/components/ui/PoweredByGoogle.vue'

const props = defineProps<{
  status: BookSearchStatus
  candidates: BookCandidate[]
  source: BookSearchSource | null
  query: BookSearchQuery
  errorMessage: string
}>()

const emit = defineEmits<{ pick: [index: number]; search: [query: BookSearchQuery] }>()

const isPhone = useMediaQuery(useBreakpoints.isPhone)

const draft = reactive({ title: '', author: '', isbn: '' })
const asked = ref(false)
const cards: HTMLElement[] = []
const queryForm = ref<HTMLFormElement | null>(null)

// Nothing found: the query is the next step, so it opens by itself.
const queryOpen = computed(() => asked.value || props.status === 'none')

const countText = computed(() =>
  props.candidates.length === 1 ? '1 livro encontrado' : `${props.candidates.length} livros encontrados`,
)

const openQuery = async () => {
  Object.assign(draft, { title: props.query.title, author: props.query.author, isbn: props.query.isbn ?? '' })
  asked.value = true
  // "Mudar a busca" gives way to the fields: focus goes to the first one, not out of the drawer.
  await nextTick()
  queryForm.value?.querySelector('input')?.focus()
}

const searchAgain = () => emit('search', { title: draft.title, author: draft.author, isbn: draft.isbn })

watch(
  () => props.status,
  (status) => {
    if (status === 'none' && !asked.value) {
      Object.assign(draft, { title: props.query.title, author: props.query.author, isbn: props.query.isbn ?? '' })
      asked.value = true
    }
  },
  { immediate: true },
)

/** Back from checking a book: focus returns to the one that was picked. */
const focusCard = (index: number) => cards[index]?.focus()

defineExpose({ focusCard })
</script>

<style lang="scss" scoped>
.data-search {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  &__query {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-4);
    border-radius: var(--radius-lg);
    background: var(--color-background-subtle);

    :deep(.app-field) {
      align-self: stretch;
    }
  }

  &__asked {
    margin: 0;
    font-size: var(--font-size-ui);
    color: var(--color-text-secondary);

    strong {
      color: var(--color-text-default);
    }
  }

  &__head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  &__count {
    margin: 0;
    font-weight: var(--font-weight-semibold);
  }

  &__help {
    margin: calc(var(--space-3) * -1) 0 0;
    font-size: var(--font-size-caption);
    color: var(--color-text-subtle);
  }

  &__list {
    display: grid;
    gap: var(--space-3);
    margin: 0;
    padding: 0;
    list-style: none;

    @media (min-width: $bp-tablet-min) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  &__ghost {
    height: var(--search-cover-h);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    background: var(--color-background-subtle);
  }

  &__card {
    display: flex;
    gap: var(--space-3);
    width: 100%;
    min-height: var(--touch-min);
    padding: var(--space-3);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    background: var(--color-surface-default);
    color: inherit;
    font-family: inherit;
    font-size: var(--font-size-ui);
    text-align: left;
    cursor: pointer;

    &:hover {
      border-color: var(--color-action-default);
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: var(--focus-offset);
    }
  }

  &__box {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
    padding: var(--space-4);
    border-radius: var(--radius-lg);
    background: var(--color-background-subtle);
    font-size: var(--font-size-ui);
    color: var(--color-text-secondary);

    p {
      margin: 0;
    }
  }

  &__box--alert {
    border: 1px solid var(--alert-line);
    background: var(--alert-bg);
    color: var(--alert-ink);
  }

  &__box-title {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-default);

    .data-search__box--alert & {
      color: var(--alert-ink);
    }
  }
}
</style>
