<template>
  <AppDrawer :open="open" title="Filtrar" title-id="filter-drawer-title" class="filter-drawer" @close="close">
    <div ref="panel" class="filter-drawer__body">
      <!-- Phone only: the page hides the sort (see BooksView) -->
      <fieldset v-if="isPhone" class="filter-drawer__group">
        <legend class="filter-drawer__legend">Ordenar</legend>
        <CheckRow
          v-for="option in sortOptions"
          :key="option.value"
          class="filter-drawer__row"
          type="radio"
          name="filter-drawer-order"
          :label="option.label"
          :checked="sortOrder === option.value"
          @change="changeOrder(option.value)"
        />
      </fieldset>

      <template v-for="group in GROUPS" :key="group.title">
        <fieldset v-if="group.key && group.searchable" class="filter-drawer__group">
          <legend class="filter-drawer__legend">{{ group.title }}</legend>
          <ComboSelect
            :model-value="selected[group.key]"
            :options="sortedOptions(group.key)"
            :counts="optionCounts[group.key]"
            :label="group.title"
            :noun="group.title.toLowerCase()"
            :placeholder="`Escolher ${group.title.toLowerCase()}`"
            @update:model-value="(values: string[]) => change({ ...selected, [group.key!]: values })"
          />
        </fieldset>

        <fieldset v-else-if="group.key" class="filter-drawer__group" :data-group="group.key">
          <legend class="filter-drawer__legend">{{ group.title }}</legend>

          <CheckRow
            v-for="value in visibleOptions(group)"
            :key="value"
            class="filter-drawer__row"
            :label="value"
            :count="optionCounts[group.key][value]"
            :checked="selected[group.key].includes(value)"
            @change="toggle(group.key, value)"
          />

          <button v-if="hiddenOptions(group) > 0" type="button" class="filter-drawer__more" @click="showAll(group.key)">
            {{ moreLabel(group) }}
          </button>
        </fieldset>

        <fieldset v-else class="filter-drawer__group">
          <legend class="filter-drawer__legend">{{ group.title }}</legend>
          <p class="filter-drawer__hint">Desmarque o que você não lê. {{ keptWhere }}</p>

          <CheckRow
            v-for="format in formats"
            :key="format"
            class="filter-drawer__row"
            :label="format"
            :count="optionCounts.midia[format]"
            :checked="!hiddenFormats.includes(format)"
            @change="preferences.toggleFormat(format)"
          />
        </fieldset>
      </template>
    </div>

    <template #footer>
      <p v-if="!filtered.length" class="filter-drawer__none">Nenhum livro com esses filtros.</p>
      <div class="filter-drawer__footer">
        <AppButton class="filter-drawer__clear" @click="change(emptySelection())">Limpar os filtros</AppButton>
        <AppButton class="filter-drawer__apply" variant="primary" @click="close">{{ resultLabel }}</AppButton>
      </div>
      <LiveStatus :text="resultSentence" />
    </template>
  </AppDrawer>
</template>

<script lang="ts" setup>
import { useMediaQuery } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, nextTick, ref, watch } from 'vue'

import type { BookSortOrder, FilterKey, Options } from '@/types'

import { useAuthStore, usePreferencesStore } from '@/stores'

import { useBreakpoints, useFilters } from '@/composables'

import AppButton from '@/components/ui/AppButton.vue'
import AppDrawer from '@/components/ui/AppDrawer.vue'
import CheckRow from '@/components/ui/CheckRow.vue'
import ComboSelect from '@/components/ui/ComboSelect.vue'
import LiveStatus from '@/components/ui/LiveStatus.vue'

type Group = {
  title: string
  key?: Exclude<FilterKey, 'midia' | 'autor'>
  more?: [string, string, 'o' | 'a']
  // Long lists (100+ subgenres) become a combobox: browsable, and typing narrows by word start.
  searchable?: boolean
}

// [plural, singular, article]: "Mostrar as outras 8 pessoas" / "Mostrar o outro gênero".
const GROUPS: Group[] = [
  { title: 'Gênero', key: 'categoria', more: ['gêneros', 'gênero', 'o'] },
  { title: 'Subgênero', key: 'subgeneros', searchable: true },
  { title: 'Tamanho', key: 'tamanho' },
  { title: 'O que você quer ver' },
  { title: 'Quem mencionou', key: 'quem', more: ['pessoas', 'pessoa', 'a'] },
]

const COLLAPSED_OPTIONS = 6

const props = defineProps<{
  open: boolean
  sortOrder: BookSortOrder
  sortOptions: { label: string; value: BookSortOrder }[]
}>()

const emit = defineEmits<{
  close: []
}>()

const preferences = usePreferencesStore()
const { hiddenFormats } = storeToRefs(preferences)
const auth = useAuthStore()

const { emptySelection, options, optionCounts, selected, withToggled, apply, filtered } = useFilters()

const isPhone = useMediaQuery(useBreakpoints.isPhone)

const expanded = ref<FilterKey[]>([])

const panel = ref<HTMLElement | null>(null)

const keptWhere = computed(() =>
  auth.isLoggedIn ? 'A escolha fica guardada na sua conta.' : 'A escolha fica guardada neste aparelho.',
)

const formats = computed(() => sortedOptions('midia'))

// With nothing left the button cannot promise books: it closes, and the line above it says why.
const resultLabel = computed(() => {
  const n = filtered.value.length
  if (n === 0) return 'Fechar'
  return n === 1 ? 'Ver 1 livro' : `Ver ${n} livros`
})
const resultSentence = computed(() => {
  const n = filtered.value.length
  if (n === 0) return 'Nenhum livro com esses filtros.'
  return n === 1 ? '1 livro' : `${n} livros`
})

const byCount = (key: FilterKey) => (a: string, b: string) =>
  (optionCounts.value[key][b] ?? 0) - (optionCounts.value[key][a] ?? 0) || a.localeCompare(b, 'pt-BR')

const sortedOptions = (key: FilterKey) =>
  key === 'tamanho' ? options.value[key] : [...options.value[key]].sort(byCount(key))

// A checked option is never hidden behind "Mostrar os outros".
const visibleOptions = (group: Group) => {
  const all = sortedOptions(group.key!)
  if (!group.more) return all
  if (expanded.value.includes(group.key!)) return all
  const head = all.slice(0, COLLAPSED_OPTIONS)
  return [...head, ...all.filter((value) => !head.includes(value) && selected.value[group.key!].includes(value))]
}

const hiddenOptions = (group: Group) => sortedOptions(group.key!).length - visibleOptions(group).length

const moreLabel = (group: Group) => {
  const [plural, singular, article] = group.more!
  const n = hiddenOptions(group)
  return n === 1
    ? `Mostrar ${article} outr${article} ${singular}`
    : `Mostrar ${article}s outr${article}s ${n} ${plural}`
}

// Live (no "apply" step): every change replaces the entry opening added (useBackCloses), so one Back undoes the visit.
const change = (selection: Options, ordem?: BookSortOrder) => apply(selection, ordem, true)

const toggle = (key: FilterKey, value: string) => change(withToggled(key, value))

const changeOrder = (order: BookSortOrder) => change(selected.value, order)

const close = () => emit('close')

// The "show more" button disappears once clicked; focus goes to the first revealed option instead of the page.
const showAll = async (key: FilterKey) => {
  expanded.value.push(key)
  await nextTick()
  panel.value?.querySelectorAll<HTMLInputElement>(`[data-group="${key}"] input`)[COLLAPSED_OPTIONS]?.focus()
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) expanded.value = []
  },
)
</script>

<style lang="scss" scoped>
// The frame (veil, side panel or bottom sheet, "Fechar", focus, Back) is AppDrawer's; this is only what is inside.
.filter-drawer {
  &__body {
    margin: 0 calc(-1 * var(--space-6));
    padding: 0 var(--space-6);
  }

  &__group {
    padding: var(--space-5) 0;
    border: none;

    & + & {
      border-top: 1px solid var(--color-border-default);
    }
  }

  // Floated so the legend leaves the fieldset border instead of sitting on it.
  &__legend {
    float: left;
    width: 100%;
    padding: 0;
    margin-bottom: var(--space-2);
    font-size: var(--font-size-ui);
    font-weight: var(--font-weight-bold);
  }

  &__hint {
    clear: both;
    margin-bottom: var(--space-2);
    font-size: var(--font-size-caption);
    color: var(--color-text-subtle);
  }

  // The legend floats: a row must start below it.
  &__row {
    clear: both;
  }

  &__more {
    min-height: var(--touch-min);
    padding: 0;

    font-family: var(--font-family-body);
    font-size: var(--font-size-ui);
    font-weight: var(--font-weight-semibold);
    color: var(--color-action-default);

    background: none;
    border: none;
    cursor: pointer;

    &:hover {
      color: var(--color-action-default-hover);
    }
  }

  &__none {
    margin: 0 0 var(--space-3);
    font-size: var(--font-size-meta);
    color: var(--color-text-secondary);
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
  }

  button:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: var(--space-1);
  }
}
</style>
