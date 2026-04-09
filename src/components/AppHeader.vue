<template>
  <header class="app-header">
    <div class="app-header__inner">
      <!-- Branding (mobile only — desktop usa AppSidebar) -->
      <RouterLink v-if="isMobile" to="/" class="app-header__brand" aria-label="Ecos Literários — início">
        <span class="app-header__brand-icon">📚</span>
      </RouterLink>

      <!-- Search bar -->
      <div class="app-header__search">
        <SearchBar v-model="searchModel" :suggestions="suggestions" @select="onSelectSuggestion" />
      </div>

      <!-- Botão de filtros -->
      <button
        v-if="showFiltersButton"
        class="app-header__filters-btn"
        :class="{ 'app-header__filters-btn--active': activeFilterCount > 0 }"
        type="button"
        :aria-label="`Abrir filtros${activeFilterCount > 0 ? ` (${activeFilterCount} ativos)` : ''}`"
        @click="emit('openFilters')"
      >
        <BaseIcon name="funil" class="app-header__filters-icon" aria-hidden="true" />
        <span v-if="activeFilterCount > 0" class="app-header__filters-badge" aria-hidden="true">
          {{ activeFilterCount }}
        </span>
      </button>

      <!-- Usuário (desktop — mobile usa BottomNav) -->
      <UserButton v-if="!isMobile" />
    </div>

    <!-- Active filters inline (abaixo da search bar) -->
    <Transition name="af-bar">
      <div v-if="hasActiveFilters" class="app-header__active-filters">
        <span class="app-header__af-label">Filtros:</span>

        <div class="app-header__af-tags">
          <TransitionGroup name="af-tag" tag="div" class="app-header__af-tags-inner">
            <template v-for="(values, key) in activeFilters" :key="key">
              <button
                v-for="value in values"
                :key="`${key}-${value}`"
                class="app-header__af-tag"
                type="button"
                @click="emit('removeFilter', key as string, value)"
              >
                <span class="app-header__af-tag-group">{{ labelMap[key as keyof typeof labelMap] }}</span>
                <span class="app-header__af-tag-value">{{ value }}</span>
                <BaseIcon name="times" class="app-header__af-tag-icon" aria-hidden="true" />
              </button>
            </template>
          </TransitionGroup>
        </div>

        <button class="app-header__af-clear" type="button" @click="emit('clearFilters')">Limpar tudo</button>
      </div>
    </Transition>
  </header>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import SearchBar from '@/components/SearchBar.vue'
import UserButton from '@/components/UserButton.vue'
import type { Options, Suggestion, Book } from '@/types'

const props = withDefaults(
  defineProps<{
    search?: string
    suggestions?: Suggestion[]
    activeFilters?: Options
    activeFilterCount?: number
    showFiltersButton?: boolean
  }>(),
  {
    search: '',
    suggestions: () => [],
    activeFilters: () => ({ midia: [], categoria: [], subgeneros: [], quem: [] }),
    activeFilterCount: 0,
    showFiltersButton: false,
  },
)

const emit = defineEmits<{
  'update:search': [value: string]
  select: [book: Book]
  openFilters: []
  removeFilter: [key: string, value: string]
  clearFilters: []
}>()

const isMobile = useMediaQuery('(max-width: 767px)')

const searchModel = computed({
  get: () => props.search,
  set: (val) => emit('update:search', val),
})

const hasActiveFilters = computed(() => Object.values(props.activeFilters).some((arr) => arr.length > 0))

const onSelectSuggestion = (book: Book) => {
  emit('select', book)
}

const labelMap = {
  midia: 'Mídia',
  categoria: 'Categoria',
  subgeneros: 'Sub-gênero',
  quem: 'Quem mencionou',
}
</script>

<style lang="scss" scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 90;
  flex-shrink: 0;

  background: var(--color-surface-default);
  border-bottom: 1px solid var(--color-border-default);

  &__inner {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 64px;
    padding: 0 1rem;
  }

  // ── Branding mobile ──────────────────────────
  &__brand {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    text-decoration: none;
    transition: opacity var(--motion-transition-default);

    &:hover {
      opacity: 0.8;
    }
  }

  &__brand-icon {
    font-size: 1.4rem;
    line-height: 1;
  }

  // ── Search ───────────────────────────────────
  &__search {
    flex: 1;
    min-width: 0;
  }

  // ── Botão de filtros ─────────────────────────
  &__filters-btn {
    position: relative;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    border: 1.5px solid var(--color-border-default);
    border-radius: var(--border-radius-default);
    background: none;
    cursor: pointer;
    color: var(--color-text-subtle);
    transition: all var(--motion-transition-default);

    &:hover {
      border-color: var(--color-action-default);
      color: var(--color-action-default);
    }

    &--active {
      border-color: var(--color-action-default);
      background: var(--color-action-background-subtle);
      color: var(--color-action-default);
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: 2px;
    }
  }

  &__filters-icon {
    width: 18px;
    height: 18px;
    color: inherit;
  }

  &__filters-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--color-action-default);
    color: var(--color-surface-default);
    font-size: 0.65rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  // ── Active filters ───────────────────────────
  &__active-filters {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 1rem 10px;
    border-top: 1px solid var(--color-border-default);
  }

  &__af-label {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--color-text-subtle);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    flex-shrink: 0;
  }

  &__af-tags {
    flex: 1;
    min-width: 0;
  }

  &__af-tags-inner {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__af-tag {
    $pad: 0.35rem 0.65rem;

    display: inline-flex;
    align-items: stretch;
    border: none;
    border-radius: 20px;
    overflow: hidden;
    cursor: pointer;
    font-family: var(--font-family-body);
    font-size: 0.82rem;
    padding: 0;
    background: none;
    min-height: 30px;
    transition: opacity var(--motion-transition-default);

    &:hover {
      opacity: 0.8;
    }

    &-group {
      display: flex;
      align-items: center;
      padding: #{$pad};
      background: var(--color-action-default);
      color: var(--color-surface-default);
      font-weight: 600;
      white-space: nowrap;
    }

    &-value {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: #{$pad};
      background: var(--color-action-background-subtle);
      color: var(--color-action-default);
      font-weight: 500;
      white-space: nowrap;
    }

    &-icon {
      display: block;
      padding: 0 6px 0 0;
      background: var(--color-action-background-subtle);
      color: var(--color-action-text-subtle);
      height: 100%;
      box-sizing: content-box;
      align-self: stretch;
    }
  }

  &__af-clear {
    padding: 0.35rem 0.85rem;
    border: 1px solid var(--color-border-strong);
    border-radius: 20px;
    background: none;
    min-height: 30px;

    font: {
      family: var(--font-family-body);
      size: 0.82rem;
    }
    color: var(--color-text-subtle);
    transition: all var(--motion-transition-default);
    flex-shrink: 0;
    cursor: pointer;

    &:hover {
      border-color: var(--color-action-default);
      color: var(--color-action-default);
    }
  }
}

// ── Transições active filters ─────────────────
.af-bar-enter-active,
.af-bar-leave-active {
  transition: all var(--motion-transition-default);
}
.af-bar-enter-from,
.af-bar-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.af-tag-enter-active,
.af-tag-leave-active {
  transition: all var(--motion-transition-default);
}
.af-tag-enter-from,
.af-tag-leave-to {
  opacity: 0;
  transform: scale(0.85);
}
</style>
