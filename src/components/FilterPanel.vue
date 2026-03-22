<template>
  <aside class="filter-panel" :class="{ 'is-open': isOpen }">
    <!-- Mobile toggle -->
    <button class="filter-toggle" :aria-expanded="isOpen" aria-controls="filter-panel-body" @click="isOpen = !isOpen">
      <BaseIcon name="funil" aria-hidden="true" />
      <span>Filtros</span>
      <span v-if="activeCount > 0" class="badge" aria-label="`${activeCount} filtros ativos`">{{ activeCount }}</span>
      <BaseIcon name="chevron" class="chevron" aria-hidden="true" />
    </button>

    <!-- Panel body -->
    <div id="filter-panel-body" class="panel-body">
      <!-- Clear -->
      <div class="panel-header">
        <span class="panel-title">Filtros</span>
        <button v-if="activeCount > 0" class="clear-btn" @click="emit('clear')">Limpar tudo</button>
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
        <!-- Mídia -->
        <FilterSection
          v-if="options.midia.length > 0"
          title="Mídia"
          :options="options.midia"
          :selected="selected.midia"
          :default-open="false"
          @toggle="(val) => emit('toggle', 'midia', val)"
        />

        <!-- Categoria -->
        <FilterSection
          v-if="options.categoria.length > 0"
          title="Categoria"
          :options="options.categoria"
          :selected="selected.categoria"
          :default-open="false"
          @toggle="(val) => emit('toggle', 'categoria', val)"
        />

        <!-- Sub-gêneros -->
        <FilterSection
          v-if="options.subgeneros.length > 0"
          title="Sub-gêneros"
          :options="options.subgeneros"
          :selected="selected.subgeneros"
          :default-open="false"
          @toggle="(val) => emit('toggle', 'subgeneros', val)"
        />

        <!-- Quem mencionou -->
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
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'

import type { Options } from '@/types'

import FilterSection from '@/components/FilterSection.vue'

const props = withDefaults(
  defineProps<{
    options: Options
    selected: Options
    activeCount: number
    opened?: boolean
  }>(),
  {
    opened: true,
  },
)
const emit = defineEmits(['toggle', 'clear'])

const isOpen = ref(true)

const activeTags = computed(() => {
  const tags = []
  const map = [
    ['midia', props.selected.midia],
    ['categoria', props.selected.categoria],
    ['subgeneros', props.selected.subgeneros],
    ['quem', props.selected.quem],
  ]

  for (const [key, arr] of map) {
    for (const value of arr!) tags.push({ key, value })
  }

  return tags as { key: string; value: string }[]
})

const removeTag = ({ key, value }: { key: string; value: string }) => {
  emit('toggle', key, value)
}

onMounted(() => {
  isOpen.value = props.opened
})
</script>

<style lang="scss" scoped>
.filter-panel {
  width: 260px;
  flex-shrink: 0;
}

.filter-toggle {
  display: none;
  width: 100%;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  font-family: var(--font-family-body);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-default);
  cursor: pointer;
  transition: background var(--motion-transition-default);
  min-height: 44px;

  &:hover {
    background: var(--color-background-subtle);
  }
}

.badge {
  background: var(--color-action-default);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chevron {
  margin-left: auto;
  transition: transform var(--motion-transition-default);
}
.is-open .chevron {
  transform: rotate(180deg);
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
  }

  &-title {
    font: {
      family: var(--font-family-display);
      size: 1rem;
      weight: 600;
    }
    color: var(--color-text-default);
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
  transition: background var(--motion-transition-default);
}
.clear-btn:hover {
  background: var(--color-action-background-subtle);
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

/* Tag transition */
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
  .filter-toggle {
    display: flex;
  }
  .panel-body {
    display: none;
    margin-top: 8px;
  }
  .is-open .panel-body {
    display: block;
  }
  .filter-sections {
    max-height: 60dvh;
  }
}
</style>
