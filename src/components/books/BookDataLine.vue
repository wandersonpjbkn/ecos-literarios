<template>
  <section class="data-line" aria-labelledby="data-line-title">
    <img v-if="coverUrl" :src="coverUrl" alt="" class="data-line__cover" />
    <span v-else class="data-line__cover data-line__cover--none" aria-hidden="true">
      <BaseIcon name="book" />
    </span>
    <div class="data-line__body">
      <h4 id="data-line-title" class="data-line__title">
        {{ chosen.length ? 'Capa e dados escolhidos' : 'Capa e dados' }}
        <span v-if="!chosen.length" class="data-line__optional">(opcional)</span>
      </h4>
      <p :id="textId" class="data-line__text">{{ text }}</p>
      <div class="data-line__actions">
        <template v-if="chosen.length">
          <AppButton ref="action" size="md" :aria-describedby="textId" @click="emit('search')">Trocar</AppButton>
          <AppButton variant="ghost" size="md" @click="emit('undo')">Desfazer</AppButton>
        </template>
        <!-- Disabled in place, said why by the text: nothing moves when it turns on. -->
        <AppButton
          v-else
          ref="action"
          size="md"
          :aria-disabled="!canSearch || undefined"
          :aria-describedby="textId"
          class="data-line__search"
          @click="canSearch && emit('search')"
        >
          <BaseIcon name="search" aria-hidden="true" />
          {{ state === 'L3' ? 'Buscar de novo' : 'Buscar capa e dados' }}
        </AppButton>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref, useId } from 'vue'

import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps<{
  // Title and author filled: the search needs both.
  canSearch: boolean
  editing: boolean
  hasCover: boolean
  hasSynopsis: boolean
  coverUrl?: string
  // Labels of what came from the search and waits for the save ("Capa", "Sinopse"…).
  chosen: string[]
}>()

const emit = defineEmits<{ search: []; undo: [] }>()

const textId = useId()
const action = ref<{ $el: HTMLElement } | null>(null)
const list = new Intl.ListFormat('pt-BR', { type: 'conjunction' })

const state = computed(() => {
  if (props.chosen.length) return 'L2'
  if (!props.canSearch) return 'L0'
  if (!props.editing) return 'L1'
  return props.hasCover && props.hasSynopsis ? 'L3' : 'L4'
})

const missing = computed(() => {
  if (!props.hasCover && !props.hasSynopsis) return 'Faltam a capa e a sinopse deste livro.'
  return props.hasCover ? 'Falta a sinopse deste livro.' : 'Falta a capa deste livro.'
})

const text = computed(() => {
  const brings = 'A busca traz capa, sinopse, editora, páginas e ano.'
  if (state.value === 'L0') return 'Preencha o título e o autor para buscar a capa e os dados do livro.'
  if (state.value === 'L1') return `${brings} Tudo continua editável à mão.`
  if (state.value === 'L3') return 'Este livro já tem capa e sinopse.'
  if (state.value === 'L4') return `${missing.value} ${brings}`
  // "Capa, sinopse e ISBN": only the first label keeps its capital, and an acronym keeps it everywhere.
  const fields = list.format(
    props.chosen.map((label, index) => (index && label !== 'ISBN' ? label.toLowerCase() : label)),
  )
  const verb = props.chosen.length > 1 ? 'entram' : 'entra'
  return `${fields} ${verb} no livro quando você ${props.editing ? 'salvar' : 'o adicionar'}.`
})

/** Back from the search view: focus returns to the button that opened it. */
const focus = () => action.value?.$el.focus()

defineExpose({ focus })
</script>

<style lang="scss" scoped>
.data-line {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  background: var(--color-surface-default);

  &__cover {
    flex-shrink: 0;
    width: var(--line-cover-w);
    height: var(--line-cover-h);
    border-radius: var(--radius-sm);
    object-fit: cover;
  }

  &__cover--none {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dashed var(--color-border-strong);
    color: var(--color-text-subtle);

    :deep(.base-icon) {
      width: var(--icon-sm);
      height: var(--icon-sm);
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 0;
  }

  &__title {
    margin: 0;
    font-size: var(--font-size-ui);
    font-weight: var(--font-weight-semibold);
  }

  &__optional {
    font-weight: var(--font-weight-regular);
    color: var(--color-text-subtle);
  }

  &__text {
    margin: 0;
    font-size: var(--font-size-caption);
    color: var(--color-text-secondary);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-2);
  }

  // Phone: the search is the line's one action, full width like the screen (L1).
  &__search {
    @media (max-width: $bp-phone-max) {
      flex: 1;
    }
  }
}
</style>
