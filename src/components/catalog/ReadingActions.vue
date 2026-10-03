<template>
  <div ref="root" class="reading" :aria-busy="pending">
    <template v-if="status === 'lido'">
      <p class="reading__state">
        <BaseIcon name="check" aria-hidden="true" />
        <RouterLink :to="shelfLink('lidos')" class="reading__link"
          >Lido<span class="visually-hidden">, ver em Meus livros</span></RouterLink
        >
        <AppButton variant="ghost" size="md" :disabled="!canWrite || pending" @click="act(null)">Desmarcar</AppButton>
      </p>
    </template>

    <template v-else>
      <p v-if="status === 'quero_ler'" class="reading__state">
        <BaseIcon name="check" aria-hidden="true" />
        <span
          >Guardado em
          <RouterLink :to="shelfLink('quero-ler')" class="reading__link"
            >Quero ler<span class="visually-hidden">, ver em Meus livros</span></RouterLink
          ></span
        >
        <AppButton variant="ghost" size="md" :disabled="!canWrite || pending" @click="act(null)">
          Tirar da lista
        </AppButton>
      </p>
      <AppButton v-else variant="primary" :disabled="!canWrite || pending" @click="act('quero_ler')">
        Guardar em “Quero ler”
      </AppButton>
      <AppButton :disabled="!canWrite || pending" @click="act('lido')">Marcar como lido</AppButton>
    </template>

    <AppNotice v-if="error" :text="error" />
    <p v-if="countsLabel" class="reading__counts">{{ countsLabel }}</p>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, toRef } from 'vue'

import type { ReadingStatus } from '@/types'

import { useReading } from '@/composables'

import AppButton from '@/components/ui/AppButton.vue'
import AppNotice from '@/components/ui/AppNotice.vue'

const props = defineProps<{
  bookId: string
}>()

const { status, counts, pending, error, canWrite, change } = useReading(toRef(props, 'bookId'))

const root = ref<HTMLElement | null>(null)

const shelfLink = (shelf: 'quero-ler' | 'lidos') => ({ name: 'profile-books', query: { lista: shelf } })

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

const act = async (next: ReadingStatus | null) => {
  await change(next)
  await nextTick()
  const here = root.value
  if (!here || here.contains(document.activeElement)) return
  here.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus()
}

const plural = (n: number, one: string, many: string) => (n === 1 ? `1 ${one}` : `${n} ${many}`)
</script>

<style lang="scss" scoped>
.reading {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  > .app-button {
    width: 100%;
  }

  &__link {
    @include text-link;
  }

  &__state {
    display: flex;
    min-height: var(--touch-cta);
    padding: 0 var(--space-2) 0 var(--space-4);
    align-items: center;
    gap: var(--space-2);

    font-size: var(--font-size-ui);
    font-weight: var(--font-weight-semibold);
    color: var(--color-action-default-hover);

    background: var(--color-action-background-subtle);
    border: 1px solid var(--color-action-border-subtle);
    border-radius: var(--radius-lg);

    :deep(.base-icon) {
      width: var(--icon-md);
      height: var(--icon-md);
      flex-shrink: 0;
    }

    .app-button {
      margin-left: auto;
    }
  }

  &__counts {
    font-size: var(--font-size-meta);
    text-align: center;
    color: var(--color-text-subtle);
  }
}
</style>
