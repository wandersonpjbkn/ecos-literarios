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
  quem: 'Quem mencionou',
}

const hasActive = computed(() => Object.values(props.selected).some((arr) => arr.length > 0))
</script>

<style lang="scss" scoped>
.active-filters {
  position: sticky;
  top: 1rem;
  z-index: 5;
  margin-top: 2rem;

  display: flex;
  padding: 12px;

  align-items: center;
  flex-wrap: wrap;
  gap: 8px;

  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
}

.af-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-subtle);
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
  $pad: 0.45rem 0.75rem;

  display: inline-flex;
  align-items: stretch;
  gap: 0;
  border: none;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  font-family: var(--font-family-body);
  font-size: 0.9rem;
  padding: 0;
  background: none;
  min-height: 36px;
  transition: opacity var(--motion-transition-default);

  &:hover {
    opacity: 0.8;
  }

  &-group {
    display: flex;
    align-items: center;
    padding: #{$pad};
    background: var(--color-action-default);
    color: white;
    font-weight: 600;
    white-space: nowrap;
  }

  &-value {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: #{$pad};
    background: var(--color-action-background-subtle);
    color: var(--color-action-default);
    font-weight: 500;
    white-space: nowrap;
  }

  svg {
    display: block;
    padding: 0 8px 0 0;
    background: var(--color-action-background-subtle);
    color: var(--color-action-text-subtle);
    height: 100%;
    box-sizing: content-box;
    align-self: stretch;
  }
}

.af-clear-all {
  padding: 0.45rem 1rem;
  border: 1px solid var(--color-border-strong);
  border-radius: 20px;
  background: none;
  min-height: 36px;

  font: {
    family: var(--font-family-body);
    size: 0.9rem;
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

@media (max-width: 480px) {
  .active-filters {
    padding: 10px;
    gap: 6px;
  }

  .af-title {
    font-size: 0.78rem;
    width: 100%;
  }

  .af-tag {
    font-size: 0.82rem;
    min-height: 32px;

    &-group,
    &-value {
      padding: 0.35rem 0.6rem;
    }
  }

  .af-clear-all {
    width: 100%;
    text-align: center;
  }
}

/* Transitions */
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
