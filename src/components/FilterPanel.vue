<template>
  <aside class="filter-panel" :class="{ 'is-open': isOpen }">
    <!-- Mobile toggle -->
    <button class="filter-toggle" aria-label="Filtros" @click="isOpen = !isOpen">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
      <span>Filtros</span>
      <span v-if="activeCount > 0" class="badge">{{ activeCount }}</span>
      <svg
        class="chevron"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <!-- Panel body -->
    <div class="panel-body">
      <!-- Clear -->
      <div class="panel-header">
        <span class="panel-title">Filtros</span>
        <button v-if="activeCount > 0" class="clear-btn" @click="emit('clear')">Limpar tudo</button>
      </div>

      <!-- Active tags -->
      <TransitionGroup v-if="activeCount > 0" name="tag" tag="div" class="active-tags">
        <span v-for="tag in activeTags" :key="tag.key + tag.value" class="active-tag" @click="removeTag(tag)">
          {{ tag.value }}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </span>
      </TransitionGroup>

      <div class="filter-sections">
        <!-- Mídia -->
        <FilterSection
          title="Mídia"
          :options="options.midia"
          :selected="selected.midia"
          collapsible
          @toggle="(val) => emit('toggle', 'midia', val)"
        />

        <!-- Categoria -->
        <FilterSection
          title="Categoria"
          :options="options.categoria"
          :selected="selected.categoria"
          @toggle="(val) => emit('toggle', 'categoria', val)"
        />

        <!-- Sub-gêneros -->
        <FilterSection
          title="Sub-gêneros"
          :options="options.subgeneros"
          :selected="selected.subgeneros"
          @toggle="(val) => emit('toggle', 'subgeneros', val)"
        />

        <!-- Quem indicou -->
        <FilterSection
          title="Quem indicou"
          :options="options.quem"
          :selected="selected.quem"
          @toggle="(val) => emit('toggle', 'quem', val)"
        />
      </div>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

import type { Options } from '@/types'

import FilterSection from '@/components/FilterSection.vue'

const props = defineProps<{
  options: Options
  selected: Options
  activeCount: number
}>()
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
  background: var(--paper);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--ink);
  cursor: pointer;
  transition: background var(--transition);

  &:hover {
    background: var(--paper-warm);
  }
}

.badge {
  background: var(--accent);
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
  transition: transform var(--transition);
}
.is-open .chevron {
  transform: rotate(180deg);
}

.panel {
  &-body {
    background: var(--paper);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }

  &-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 12px;
    border-bottom: 1px solid var(--border);
  }

  &-title {
    font: {
      family: var(--font-display);
      size: 1rem;
      weight: 600;
    }
    color: var(--ink);
  }
}

.clear-btn {
  background: none;
  border: none;
  font-family: var(--font-body);
  font-size: 0.78rem;
  color: var(--accent);
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
  transition: background var(--transition);
}
.clear-btn:hover {
  background: rgba(181, 69, 27, 0.08);
}

.active-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
}

.active-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--ink);
  color: var(--paper);
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 100px;
  cursor: pointer;
  transition: opacity var(--transition);
}
.active-tag:hover {
  opacity: 0.75;
}

.filter-sections {
  overflow-y: auto;
  max-height: calc(100vh - 280px);
}

/* Tag transition */
.tag-enter-active,
.tag-leave-active {
  transition: all 150ms ease;
}
.tag-enter-from,
.tag-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

@media (max-width: 768px) {
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
    max-height: 60vh;
  }
}
</style>
