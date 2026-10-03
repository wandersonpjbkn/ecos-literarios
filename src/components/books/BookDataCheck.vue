<template>
  <div class="data-check">
    <section class="data-check__book">
      <BookCandidateSummary :candidate="candidate" size="check" />
      <template v-if="candidate.synopsis">
        <h3 class="data-check__section">Sinopse</h3>
        <!-- Whole: a synopsis from another book of the same series only shows when read. -->
        <p class="data-check__synopsis">{{ candidate.synopsis }}</p>
      </template>
    </section>

    <section class="data-check__fields" aria-labelledby="data-check-fields">
      <h3 id="data-check-fields" class="data-check__section">O que entra no livro</h3>
      <ul class="data-check__list">
        <li v-for="row in rows" :key="row.field">
          <CheckRow
            :label="row.label"
            :detail="row.detail"
            :checked="modelValue.includes(row.field)"
            @change="toggle(row.field)"
          />
        </li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import type { BookCandidate } from '@/types'

import BookCandidateSummary from '@/components/books/BookCandidateSummary.vue'
import CheckRow from '@/components/ui/CheckRow.vue'

export type DataField = 'cover_url' | 'synopsis' | 'publisher' | 'published_year' | 'page_count' | 'isbn'

const props = defineProps<{
  candidate: BookCandidate
  // What the book already has, as the form holds it ('' when empty).
  current: Record<DataField, string>
  modelValue: DataField[]
}>()

const emit = defineEmits<{ 'update:modelValue': [fields: DataField[]] }>()

// The order of COPY.md; the noun completes "O livro ainda não tem …".
const FIELDS: { field: DataField; label: string; noun: string }[] = [
  { field: 'cover_url', label: 'Capa', noun: 'capa' },
  { field: 'synopsis', label: 'Sinopse', noun: 'sinopse' },
  { field: 'publisher', label: 'Editora', noun: 'editora' },
  { field: 'published_year', label: 'Ano', noun: 'ano' },
  { field: 'page_count', label: 'Páginas', noun: 'número de páginas' },
  { field: 'isbn', label: 'ISBN', noun: 'ISBN' },
]

/** What a field is worth on screen: a cover or a synopsis is too long to quote, so it is named. */
const shown = (field: DataField, value: string, isNew: boolean) => {
  if (field === 'cover_url') return isNew ? 'outra capa' : 'uma capa'
  if (field === 'synopsis') return isNew ? 'outra sinopse' : 'uma sinopse'
  if (field === 'page_count') return `${value} páginas`
  return value
}

const found = (field: DataField) => {
  const value = props.candidate[field]
  return value === undefined || value === null ? '' : String(value)
}

// A field the search brings nothing new to (empty there, or the same value) has no row.
const rows = computed(() =>
  FIELDS.filter(({ field }) => found(field) && found(field) !== props.current[field]).map(({ field, label, noun }) => {
    const now = props.current[field]
    const detail = now
      ? `O livro já tem ${shown(field, now, false)}. A busca traz ${shown(field, found(field), true)}.`
      : `O livro ainda não tem ${noun}.`
    return { field, label, detail }
  }),
)

const toggle = (field: DataField) =>
  emit(
    'update:modelValue',
    props.modelValue.includes(field) ? props.modelValue.filter((one) => one !== field) : [...props.modelValue, field],
  )
</script>

<style lang="scss" scoped>
.data-check {
  display: grid;
  gap: var(--space-6);

  @media (min-width: $bp-tablet-min) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: var(--space-8);
  }

  &__section {
    margin: var(--space-4) 0 var(--space-2);
    font-size: var(--font-size-ui);
    font-weight: var(--font-weight-bold);

    .data-check__fields > & {
      margin-top: 0;
    }
  }

  &__synopsis {
    margin: 0;
    color: var(--color-text-secondary);
    white-space: pre-line;
  }

  &__list {
    margin: 0;
    padding: 0;
    list-style: none;

    li + li {
      border-top: 1px solid var(--color-border-default);
    }
  }
}
</style>
