<template>
  <p class="fix-line">
    <template v-if="canEdit">
      <AppButton size="md" :disabled="!canWrite" @click="emit('edit')">
        <BaseIcon name="pencil" aria-hidden="true" />
        Editar
      </AppButton>
      <span v-if="missing.length" class="fix-line__gap">{{ gap }}</span>
    </template>
    <AppButton v-else variant="ghost" size="md" class="app-button--ask" :href="askLink(question)">
      <BaseIcon name="whatsapp" aria-hidden="true" />
      {{ askLabel }}
    </AppButton>
  </p>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import type { Book } from '@/types'

import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps<{
  book: Book
  // Who may edit the book (API): its owner, or whoever may edit any book. The same "Editar" as Meus livros.
  canEdit: boolean
  canWrite: boolean
  askLink: (message: string) => string
}>()

const emit = defineEmits<{ edit: [] }>()

// A missing field stays in the file saying what is missing: that is how someone notices and completes it.
const missing = computed(() =>
  [!props.book.published_year && 'o ano', !props.book.page_count && 'o número de páginas'].filter(Boolean),
)

// "Falta o ano" / "Faltam o ano e o número de páginas": the screen and the message say it the same way.
const lack = computed(() => `${missing.value.length > 1 ? 'Faltam' : 'Falta'} ${missing.value.join(' e ')}`)
const gap = computed(() => `${lack.value}.`)

// Readers who cannot edit report it on WhatsApp; the label does not promise an edit.
const askLabel = computed(() =>
  missing.value.length ? `Pedir para completar ${missing.value.join(' e ')}` : 'Avisar sobre um erro',
)

const question = computed(() =>
  missing.value.length
    ? `${lack.value} em "${props.book.titulo}".`
    : `Achei algo para corrigir em "${props.book.titulo}".`,
)
</script>

<style lang="scss" scoped>
.fix-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: var(--space-3);

  // A question, not a label: it may wrap on phones instead of running off the screen.
  .app-button--ask {
    margin-left: calc(-1 * var(--space-2));
    max-width: 100%;
    flex-shrink: 1;
    white-space: normal;
    text-align: left;
  }

  &__gap {
    font-size: var(--font-size-ui);
    color: var(--color-text-secondary);
  }
}
</style>
