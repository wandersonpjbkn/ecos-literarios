<template>
  <p class="fix-line">
    <AppButton v-if="canEdit" variant="ghost" size="md" :disabled="!canWrite" @click="emit('edit')">
      <BaseIcon name="pencil" aria-hidden="true" />
      {{ label }}
    </AppButton>
    <AppButton v-else variant="ghost" size="md" :href="askLink(question)">{{ askLabel }}</AppButton>
    <span v-if="book.origem === 'conversa'" class="fix-line__origin">Veio da conversa do grupo no WhatsApp</span>
  </p>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import AppButton from '@/components/AppButton.vue'
import type { Book } from '@/types'

const props = defineProps<{
  book: Book
  // Who may edit the book (API): the person who mentioned it, once linked, or an admin. Others ask the group.
  canEdit: boolean
  canWrite: boolean
  askLink: (message: string) => string
}>()

const emit = defineEmits<{ edit: [] }>()

// A missing field stays in the file saying what is missing: that is how someone notices and completes it.
const missing = computed(() =>
  [!props.book.published_year && 'o ano', !props.book.page_count && 'o número de páginas'].filter(Boolean),
)

const gap = computed(() =>
  missing.value.length > 1 ? `Faltam ${missing.value.join(' e ')}.` : `Falta ${missing.value[0]}.`,
)

const label = computed(() => (missing.value.length ? `${gap.value} Você sabe?` : 'Corrigir algo neste livro'))

// Readers who cannot edit are sent to WhatsApp; the label says so instead of promising an edit.
const askLabel = computed(() =>
  missing.value.length ? `${gap.value} Perguntar no grupo` : 'Avisar no grupo sobre um erro',
)

const question = computed(() =>
  missing.value.length
    ? `Alguém sabe ${missing.value.join(' e ')} de "${props.book.titulo}"?`
    : `Achei algo pra corrigir em "${props.book.titulo}".`,
)
</script>

<style lang="scss" scoped>
.fix-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: var(--space-3);

  // A question, not a label: it may wrap on phones instead of running off the screen.
  .app-button {
    margin-left: calc(-1 * var(--space-2));
    max-width: 100%;
    flex-shrink: 1;
    white-space: normal;
    text-align: left;
  }

  &__origin {
    font-size: 0.875rem;
    color: var(--color-text-subtle);
  }
}
</style>
