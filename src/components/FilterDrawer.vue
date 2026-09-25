<template>
  <Teleport to="body">
    <Transition name="filter-drawer">
      <div v-if="open" class="filter-drawer">
        <div class="filter-drawer__veil" aria-hidden="true" @click="close" />

        <section
          ref="panel"
          class="filter-drawer__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-drawer-title"
        >
          <div class="filter-drawer__handle" aria-hidden="true" />

          <header class="filter-drawer__header">
            <h2 id="filter-drawer-title" class="filter-drawer__title">Filtrar</h2>
            <button ref="closeButton" type="button" class="filter-drawer__close" @click="close">
              <BaseIcon name="times" aria-hidden="true" />
              <span class="filter-drawer__close-text">Fechar</span>
            </button>
          </header>

          <div class="filter-drawer__body">
            <!-- Phone only: the page hides the sort (see BooksView) -->
            <fieldset v-if="isPhone" class="filter-drawer__group">
              <legend class="filter-drawer__legend">Ordenar</legend>
              <label v-for="option in sortOptions" :key="option.value" class="filter-drawer__row">
                <AppCheck
                  type="radio"
                  name="filter-drawer-order"
                  :checked="sortOrder === option.value"
                  @change="changeOrder(option.value)"
                />
                <span class="filter-drawer__label">{{ option.label }}</span>
              </label>
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

                <label v-for="value in visibleOptions(group)" :key="value" class="filter-drawer__row">
                  <AppCheck
                    type="checkbox"
                    :checked="selected[group.key].includes(value)"
                    @change="toggle(group.key, value)"
                  />
                  <span class="filter-drawer__label">{{ value }}</span>
                  <span class="filter-drawer__count">{{ optionCounts[group.key][value] }}</span>
                </label>

                <button
                  v-if="hiddenOptions(group) > 0"
                  type="button"
                  class="filter-drawer__more"
                  @click="showAll(group.key)"
                >
                  {{ moreLabel(group) }}
                </button>
              </fieldset>

              <fieldset v-else class="filter-drawer__group">
                <legend class="filter-drawer__legend">{{ group.title }}</legend>
                <p class="filter-drawer__hint">Desmarque o que você não lê. Fica guardado neste aparelho.</p>

                <label v-for="midia in midias" :key="midia" class="filter-drawer__row">
                  <AppCheck
                    type="checkbox"
                    :checked="!hiddenMidias.includes(midia)"
                    @change="preferences.toggleMidia(midia)"
                  />
                  <span class="filter-drawer__label">{{ midia }}</span>
                  <span class="filter-drawer__count">{{ optionCounts.midia[midia] }}</span>
                </label>
              </fieldset>
            </template>
          </div>

          <footer class="filter-drawer__footer">
            <AppButton class="filter-drawer__clear" @click="change(emptySelection())">Limpar os filtros</AppButton>
            <AppButton class="filter-drawer__apply" variant="primary" @click="close">{{ resultLabel }}</AppButton>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMediaQuery } from '@vueuse/core'

import { usePreferencesStore } from '@/stores'
import { useBreakpoints, useFilters } from '@/composables'
import AppButton from '@/components/AppButton.vue'
import AppCheck from '@/components/AppCheck.vue'
import ComboSelect from '@/components/ComboSelect.vue'
import type { BookSortOrder, FilterKey, Options } from '@/types'

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

const { emptySelection, options, optionCounts, selected, withToggled, apply, filtered } = useFilters()
const preferences = usePreferencesStore()
const { hiddenMidias } = storeToRefs(preferences)

const isPhone = useMediaQuery(useBreakpoints.isTablet)

const expanded = ref<FilterKey[]>([])

const byCount = (key: FilterKey) => (a: string, b: string) =>
  (optionCounts.value[key][b] ?? 0) - (optionCounts.value[key][a] ?? 0) || a.localeCompare(b, 'pt-BR')

const sortedOptions = (key: FilterKey) =>
  key === 'tamanho' ? options.value[key] : [...options.value[key]].sort(byCount(key))

const midias = computed(() => sortedOptions('midia'))

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

// Live (no "apply" step): first change per opening pushes, later ones replace, so one Back undoes the visit.
let changedThisOpening = false

const change = (selection: Options, ordem?: BookSortOrder) => {
  apply(selection, ordem, changedThisOpening)
  changedThisOpening = true
}

const toggle = (key: FilterKey, value: string) => change(withToggled(key, value))

const changeOrder = (order: BookSortOrder) => change(selected.value, order)

const resultLabel = computed(() =>
  filtered.value.length === 1 ? 'Ver 1 livro' : `Ver ${filtered.value.length} livros`,
)

// ── Open / close and focus ──────────────────────────────────────
const panel = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
let opener: HTMLElement | null = null

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      opener = document.activeElement as HTMLElement | null
      changedThisOpening = false
      expanded.value = []
      document.addEventListener('keydown', onKeydown)
      // Open after a Back, the next tick would replace the entry the Back returned to.
      window.addEventListener('popstate', close)
      await nextTick()
      closeButton.value?.focus()
    } else {
      document.removeEventListener('keydown', onKeydown)
      window.removeEventListener('popstate', close)
      opener?.focus()
    }
  },
)

const close = () => emit('close')

// The "show more" button disappears once clicked; focus goes to the first revealed option instead of the page.
const showAll = async (key: FilterKey) => {
  expanded.value.push(key)
  await nextTick()
  panel.value?.querySelectorAll<HTMLInputElement>(`[data-group="${key}"] input`)[COLLAPSED_OPTIONS]?.focus()
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') return close()
  if (event.key !== 'Tab' || !panel.value) return

  const focusable = [...panel.value.querySelectorAll<HTMLElement>('button, input')].filter(
    (el) => !el.hasAttribute('disabled'),
  )
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (!panel.value.contains(document.activeElement)) {
    event.preventDefault()
    first?.focus()
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('popstate', close)
})
</script>

<style lang="scss" scoped>
.filter-drawer {
  position: fixed;
  inset: 0;
  z-index: 100;

  &__veil {
    position: absolute;
    inset: 0;
    background: rgba(var(--color-text-default-rgb), 0.4);
  }

  // Phone: sheet from the bottom that leaves the top of the page visible (FilterSheet.mobile).
  &__panel {
    position: absolute;
    inset: var(--space-14) 0 0;

    display: flex;
    flex-direction: column;

    background: var(--color-surface-default);
    border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;

    @media (min-width: 768px) {
      top: 0;
      right: auto;
      left: var(--rail-width);
      width: var(--drawer-width);
      border-right: 1px solid var(--color-border-default);
      border-radius: 0;
    }
  }

  &__handle {
    width: var(--space-10);
    height: var(--space-1);
    margin: var(--space-3) auto 0;
    border-radius: var(--radius-pill);
    background: var(--color-border-strong);

    @media (min-width: 768px) {
      display: none;
    }
  }

  &__header {
    display: flex;
    padding: var(--space-4) var(--space-6);

    align-items: center;
    justify-content: space-between;

    border-bottom: 1px solid var(--color-border-default);
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 700;
  }

  &__close {
    display: inline-flex;
    min-width: var(--touch-min);
    height: var(--touch-min);
    padding: 0 var(--space-4);

    align-items: center;
    justify-content: center;
    gap: var(--space-2);

    font: {
      family: var(--font-family-body);
      size: 0.9375rem;
      weight: 600;
    }
    color: var(--color-text-default);
    background: var(--color-background-subtle);
    border: none;
    border-radius: var(--radius-pill);
    cursor: pointer;

    :deep(.base-icon) {
      width: 18px;
      height: 18px;
    }
  }

  &__body {
    flex: 1;
    overflow-y: auto;
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
    font-size: 0.9375rem;
    font-weight: 700;
  }

  &__hint {
    clear: both;
    margin-bottom: var(--space-2);
    font-size: 0.8125rem;
    color: var(--color-text-subtle);
  }

  &__row {
    clear: both;
    display: flex;
    min-height: var(--touch-min);

    align-items: center;
    gap: var(--space-3);

    cursor: pointer;
  }

  &__label {
    flex: 1;
    font-size: 0.9375rem;
  }

  &__count {
    font-size: 0.875rem;
    color: var(--color-text-subtle);
  }

  &__more {
    min-height: var(--touch-min);
    padding: 0;

    font: {
      family: var(--font-family-body);
      size: 0.9375rem;
      weight: 600;
    }
    color: var(--color-action-default);

    background: none;
    border: none;
    cursor: pointer;

    &:hover {
      color: var(--color-action-default-hover);
    }
  }

  &__footer {
    display: flex;
    padding: var(--space-4) var(--space-6);
    padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom));

    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);

    border-top: 1px solid var(--color-border-default);
  }

  button:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: var(--space-1);
  }
}

// Phone footer (FilterSheet.mobile): the result button takes the rest of the row.
@media (max-width: 767px) {
  .filter-drawer__apply {
    flex: 1;
  }
}

.filter-drawer-enter-active,
.filter-drawer-leave-active {
  transition: opacity var(--motion-transition-default);

  .filter-drawer__panel {
    transition: transform var(--motion-transition-default);
  }
}

.filter-drawer-enter-from,
.filter-drawer-leave-to {
  opacity: 0;

  .filter-drawer__panel {
    transform: translateY(24px);

    @media (min-width: 768px) {
      transform: translateX(-24px);
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .filter-drawer-enter-active,
  .filter-drawer-leave-active,
  .filter-drawer-enter-active .filter-drawer__panel,
  .filter-drawer-leave-active .filter-drawer__panel {
    transition: none;
  }
}
</style>
