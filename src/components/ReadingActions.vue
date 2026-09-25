<template>
  <div class="reading" :aria-busy="pending">
    <template v-if="status === 'lido'">
      <p class="reading__state">
        <BaseIcon name="check" aria-hidden="true" />
        <span>Lido</span>
        <AppButton variant="ghost" size="md" :disabled="!canWrite || pending" @click="change(null)"
          >Desmarcar</AppButton
        >
      </p>
    </template>

    <template v-else>
      <p v-if="status === 'quero_ler'" class="reading__state">
        <BaseIcon name="check" aria-hidden="true" />
        <span>Guardado em Quero ler</span>
        <AppButton variant="ghost" size="md" :disabled="!canWrite || pending" @click="change(null)">
          Tirar da lista
        </AppButton>
      </p>
      <AppButton v-else variant="primary" :disabled="!canWrite || pending" @click="change('quero_ler')">
        Guardar em “Quero ler”
      </AppButton>
      <AppButton :disabled="!canWrite || pending" @click="change('lido')">Marcar como lido</AppButton>
    </template>

    <p v-if="error" class="reading__error" role="status">{{ error }}</p>
    <p v-if="countsLabel" class="reading__counts">{{ countsLabel }}</p>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRef } from 'vue'

import AppButton from '@/components/AppButton.vue'
import { useReading } from '@/composables'

const props = defineProps<{
  bookId: string
}>()

const { status, counts, pending, error, canWrite, change } = useReading(toRef(props, 'bookId'))

const plural = (n: number, one: string, many: string) => (n === 1 ? `1 ${one}` : `${n} ${many}`)

// Totals only, never names: who wants or read a book is private (contract of slice 5).
const countsLabel = computed(() => {
  if (!counts.value) return ''
  const { quero_ler: want, lido: read } = counts.value
  if (!want && !read) return 'Ninguém guardou nem marcou como lido ainda.'
  return [
    want && plural(want, 'pessoa quer ler', 'pessoas querem ler'),
    read && plural(read, 'pessoa já leu', 'pessoas já leram'),
  ]
    .filter(Boolean)
    .join(' · ')
})
</script>

<style lang="scss" scoped>
.reading {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  > .app-button {
    width: 100%;
  }

  // Selected state: soft action background with its line, never a filled blue (rule of every slice).
  &__state {
    display: flex;
    min-height: var(--touch-cta);
    padding: 0 var(--space-2) 0 var(--space-4);
    align-items: center;
    gap: var(--space-2);

    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-action-default-hover);

    background: var(--color-action-background-subtle);
    border: 1px solid var(--color-action-text-subtle);
    border-radius: var(--radius-lg);

    :deep(.base-icon) {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .app-button {
      margin-left: auto;
    }
  }

  &__error {
    font-size: 0.875rem;
    color: var(--color-text-default);
  }

  &__counts {
    font-size: 0.875rem;
    text-align: center;
    color: var(--color-text-subtle);
  }
}
</style>
