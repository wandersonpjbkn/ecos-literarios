<template>
  <div class="area-section">
    <SectionHeader title="O que você quer ver">
      Desmarque o que você não lê. A escolha fica guardada na sua conta e vale em todo aparelho em que você entrar.
    </SectionHeader>

    <BaseSpinner v-if="formats.length === 0 && booksStore.loading">
      <p>Carregando os formatos…</p>
    </BaseSpinner>
    <AppNotice
      v-else-if="formats.length === 0 && booksStore.error"
      text="Não foi possível carregar os livros. Tente de novo."
      retry
      @retry="useApi().fetchBooks()"
    />
    <EmptyState v-else-if="formats.length === 0" title="Nenhum livro no catálogo ainda" />

    <fieldset v-else class="formats width-column">
      <legend class="visually-hidden">Formatos que você quer ver</legend>
      <CheckRow
        v-for="format in formats"
        :key="format.name"
        class="formats__row"
        :label="format.name"
        :count="`${format.count} no catálogo`"
        :checked="!hiddenMidias.includes(format.name)"
        @change="preferences.toggleMidia(format.name)"
      />
    </fieldset>

    <div v-if="formats.length" class="formats__result width-column">
      <p class="formats__result-text" aria-live="polite">{{ resultText }}</p>
      <AppButton size="md" :to="lastCatalog">Ver o catálogo</AppButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'

import { useBooksStore, usePreferencesStore } from '@/stores'

import { useApi, useLastCatalog } from '@/composables'

import AppButton from '@/components/ui/AppButton.vue'
import AppNotice from '@/components/ui/AppNotice.vue'
import CheckRow from '@/components/ui/CheckRow.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'

// The filter drawer's "O que você quer ver", same polarity (ticked = shown); formatsSync keeps it in the account.
const preferences = usePreferencesStore()
const { hiddenMidias } = storeToRefs(preferences)
const booksStore = useBooksStore()
const lastCatalog = useLastCatalog()

const formats = computed(() => {
  const counts = new Map<string, number>()
  for (const book of booksStore.books) counts.set(book.midia, (counts.get(book.midia) ?? 0) + 1)
  return [...counts]
    .filter(([name]) => name)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'pt-BR'))
})

const resultText = computed(() => {
  const total = booksStore.books.length
  const shown = booksStore.books.filter((book) => !hiddenMidias.value.includes(book.midia)).length
  if (shown === total)
    return total === 1 ? 'O catálogo mostra o único livro.' : `O catálogo mostra todos os ${total} livros.`
  return `O catálogo mostra ${shown} de ${total} ${total === 1 ? 'livro' : 'livros'}.`
})

// Opened straight from its address, nothing has loaded the catalog yet.
onMounted(() => {
  if (booksStore.books.length === 0) useApi().fetchBooks()
})
</script>

<style lang="scss" scoped>
.formats {
  margin: 0;
  padding: 0;
  border: none;

  &__result {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    margin-top: var(--space-4);
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    background: var(--color-background-subtle);
  }

  &__result-text {
    margin: 0;
    font-size: var(--font-size-ui);
    color: var(--color-text-default);
  }
}
</style>
