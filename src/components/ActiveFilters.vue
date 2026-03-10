<template>
  <Transition name="af-bar">
    <div v-if="hasActive" class="active-filters">
      <span class="af-title">Filtros:</span>

      <TransitionGroup name="af-tag" tag="div" class="af-tags">
        <template v-for="(values, key) in selected" :key="key">
          <button
            v-for="value in values"
            :key="`${key}-${value}`"
            class="af-tag"
            @click="emit('remove', key as string, value)"
          >
            <span class="af-tag-group">{{ labelMap[key as keyof typeof labelMap] }}</span>
            <span class="af-tag-value">{{ value }}</span>
            <BaseIcon name="times" />
          </button>
        </template>
      </TransitionGroup>

      <button class="af-clear-all" @click="emit('clearAll')">Limpar tudo</button>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import type { Options } from '@/types'

const props = defineProps<{
  selected: Options
}>()

const emit = defineEmits<{
  remove: [key: string, value: string]
  clearAll: []
}>()

const labelMap = {
  midia: 'Mídia',
  categoria: 'Categoria',
  subgeneros: 'Sub-gênero',
  quem: 'Quem indicou',
}

const hasActive = computed(() => Object.values(props.selected).some((arr) => arr.length > 0))
</script>

<style lang="scss" scoped>
.active-filters {
  position: sticky;
  top: 5rem;
  z-index: 5;
  margin-top: 2rem;

  display: flex;
  padding: 1rem;

  align-items: center;
  flex-wrap: wrap;
  gap: 8px;

  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.af-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.af-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}

.af-tag {
  display: inline-flex;
  align-items: center;
  gap: 0;
  border: none;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.78rem;
  padding: 0;
  background: none;
  transition: opacity var(--transition);

  &:hover {
    opacity: 0.8;
  }
}

.af-tag-group {
  padding: 3px 8px;
  background: var(--accent);
  color: white;
  font-weight: 600;
  white-space: nowrap;
}

.af-tag-value {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  background: var(--accent-light);
  color: var(--accent);
  font-weight: 500;
  white-space: nowrap;
}

.af-tag svg {
  display: block;
  padding: 0 6px 0 0;
  background: var(--accent-light);
  color: var(--accent-muted);
  height: 100%;
  box-sizing: content-box;
  align-self: stretch;
}

.af-clear-all {
  padding: 3px 10px;
  border: 1px solid var(--border-strong);
  border-radius: 20px;
  background: none;
  font-family: var(--font-body);
  font-size: 0.78rem;
  color: var(--muted);
  cursor: pointer;
  transition: all var(--transition);
  flex-shrink: 0;

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
}

/* Transitions */
.af-bar-enter-active,
.af-bar-leave-active {
  transition: all 200ms ease;
}
.af-bar-enter-from,
.af-bar-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.af-tag-enter-active,
.af-tag-leave-active {
  transition: all 150ms ease;
}
.af-tag-enter-from,
.af-tag-leave-to {
  opacity: 0;
  transform: scale(0.85);
}
</style>
