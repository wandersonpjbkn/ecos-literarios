<template>
  <Transition name="fp-slide">
    <aside v-if="isVisible" class="filter-panel" :class="{ 'filter-panel--contextual': contextual }">
      <div class="panel-body">
        <!-- Header -->
        <div class="panel-header">
          <span class="panel-title">Filtros</span>
          <div class="panel-header__actions">
            <button v-if="activeCount > 0" class="clear-btn" @click="emit('clear')">Limpar tudo</button>
            <button
              v-if="contextual"
              class="panel-close"
              type="button"
              aria-label="Fechar filtros"
              @click="emit('update:show', false)"
            >
              <BaseIcon name="times" aria-hidden="true" />
            </button>
          </div>
        </div>

        <!-- Active tags -->
        <TransitionGroup
          v-if="activeCount > 0 && activeTags.length > 0"
          name="tag"
          tag="div"
          class="active-tags"
          aria-label="Filtros ativos"
        >
          <span
            v-for="tag in activeTags"
            :key="tag.key + tag.value"
            class="active-tag"
            role="button"
            tabindex="0"
            @click="removeTag(tag)"
            @keydown.enter="removeTag(tag)"
          >
            {{ tag.value }}
            <BaseIcon name="times" aria-hidden="true" />
          </span>
        </TransitionGroup>

        <div class="filter-sections">
          <FilterSection
            v-if="options.midia.length > 0"
            title="Mídia"
            :options="options.midia"
            :selected="selected.midia"
            :default-open="false"
            @toggle="(val) => emit('toggle', 'midia', val)"
          />
          <FilterSection
            v-if="options.categoria.length > 0"
            title="Categoria"
            :options="options.categoria"
            :selected="selected.categoria"
            :default-open="false"
            @toggle="(val) => emit('toggle', 'categoria', val)"
          />
          <FilterSection
            v-if="options.subgeneros.length > 0"
            title="Sub-gêneros"
            :options="options.subgeneros"
            :selected="selected.subgeneros"
            :default-open="false"
            @toggle="(val) => emit('toggle', 'subgeneros', val)"
          />
          <FilterSection
            v-if="options.quem.length > 0"
            title="Quem mencionou"
            :options="options.quem"
            :selected="selected.quem"
            :default-open="false"
            @toggle="(val) => emit('toggle', 'quem', val)"
          />
        </div>
      </div>
    </aside>
  </Transition>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { Options } from '@/types'
import FilterSection from '@/components/FilterSection.vue'

const props = withDefaults(
  defineProps<{
    options: Options
    selected: Options
    activeCount: number
    // Novo: controla visibilidade externamente (modo contextual desktop)
    // undefined = sempre visível (comportamento legado FilterView)
    show?: boolean
    // Novo: ativa animação lateral + botão fechar
    contextual?: boolean
    // Legado: mantido para não quebrar FilterView.vue
    opened?: boolean
  }>(),
  {
    show: undefined,
    contextual: false,
    opened: true,
  },
)

const emit = defineEmits<{
  toggle: [key: string, value: string]
  clear: []
  'update:show': [value: boolean]
}>()

const isVisible = computed(() => {
  if (props.show !== undefined) return props.show
  return true
})

const activeTags = computed(() => {
  const tags: { key: string; value: string }[] = []
  const map: [string, string[]][] = [
    ['midia', props.selected.midia],
    ['categoria', props.selected.categoria],
    ['subgeneros', props.selected.subgeneros],
    ['quem', props.selected.quem],
  ]
  for (const [key, arr] of map) {
    for (const value of arr) tags.push({ key, value })
  }
  return tags
})

const removeTag = ({ key, value }: { key: string; value: string }) => {
  emit('toggle', key, value)
}
</script>

<style lang="scss" scoped>
.filter-panel {
  width: 260px;
  flex-shrink: 0;

  &--contextual {
    width: 240px;
    border-right: 1px solid var(--color-border-default);

    .panel-body {
      border: none;
      border-radius: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .filter-sections {
      flex: 1;
      max-height: none;
      overflow-y: auto;
    }
  }
}

.panel {
  &-body {
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--border-radius-default);
    overflow: hidden;
  }

  &-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 12px;
    border-bottom: 1px solid var(--color-border-default);
    gap: 8px;

    &__actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  &-title {
    font: {
      family: var(--font-family-display);
      size: 1rem;
      weight: 400;
    }
    color: var(--color-text-default);
    flex: 1;
  }

  &-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: none;
    background: none;
    border-radius: var(--border-radius-sm);
    cursor: pointer;
    color: var(--color-text-subtle);
    transition: background var(--motion-transition-default);

    &:hover {
      background: var(--color-background-subtle);
      color: var(--color-text-default);
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: 2px;
    }
  }
}

.clear-btn {
  background: none;
  border: none;
  font-family: var(--font-family-body);
  font-size: 0.78rem;
  color: var(--color-action-default);
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
  white-space: nowrap;
  transition: background var(--motion-transition-default);

  &:hover {
    background: var(--color-action-background-subtle);
  }
}

.active-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--color-border-default);
}

.active-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--color-action-default);
  color: var(--color-surface-default);
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 100px;
  cursor: pointer;
  transition: opacity var(--motion-transition-default);
  min-height: 36px;

  &:hover {
    opacity: 0.75;
  }

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }
}

.filter-sections {
  overflow-y: auto;
  max-height: calc(100dvh - 280px);
}

// ── Transição slide lateral (modo contextual) ─
.fp-slide-enter-active,
.fp-slide-leave-active {
  transition:
    opacity var(--motion-transition-default),
    transform var(--motion-transition-default);
}
.fp-slide-enter-from,
.fp-slide-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

// ── Tag transition ─────────────────────────────
.tag-enter-active,
.tag-leave-active {
  transition: all var(--motion-transition-default);
}
.tag-enter-from,
.tag-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

@media (max-width: 767px) {
  .filter-panel {
    width: 100%;
  }
}
</style>
