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
  canEdit: boolean
  canWrite: boolean
  askLink: (message: string) => string
}>()

const emit = defineEmits<{ edit: [] }>()

const missing = computed(() =>
  [!props.book.published_year && 'o ano', !props.book.page_count && 'o número de páginas'].filter(Boolean),
)

const lack = computed(() => `${missing.value.length > 1 ? 'Faltam' : 'Falta'} ${missing.value.join(' e ')}`)
const gap = computed(() => `${lack.value}.`)

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
