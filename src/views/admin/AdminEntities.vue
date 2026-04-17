<template>
  <div class="admin-section">
    <SectionHeader title="Segmentação do catálogo">
      Gerencie autores, mídias, categorias e sub-gêneros disponíveis para os livros do catálogo.
    </SectionHeader>

    <!-- Tab navigation -->
    <div class="entity-tabs" role="tablist" aria-label="Tipos de entidade">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="entity-tabs__btn"
        :class="{ 'is-active': activeTab === tab.key }"
        role="tab"
        :aria-selected="activeTab === tab.key"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Active tab content -->
    <Transition name="tab-fade" mode="out-in">
      <EntityTab
        v-if="currentTab"
        :key="currentTab.key"
        :resource="currentTab.resource"
        :title="currentTab.label"
        :description="currentTab.description"
      />
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

import SectionHeader from '@/components/admin/SectionHeader.vue'
import EntityTab from '@/components/admin/EntityTab.vue'
import type { TabConfig } from '@/types'

const tabs: TabConfig[] = [
  {
    key: 'autores',
    label: 'Autores',
    resource: 'autores',
    description: 'Nomes de autores disponíveis para associação a livros.',
  },
  {
    key: 'midias',
    label: 'Mídias',
    resource: 'midias',
    description: 'Tipos de mídia (Livro, Mangá, HQ, etc.).',
  },
  {
    key: 'categorias',
    label: 'Categorias',
    resource: 'categorias',
    description: 'Categorias principais do catálogo (Suspense, Fantasia, etc.).',
  },
  {
    key: 'subgeneros',
    label: 'Sub-gêneros',
    resource: 'subgeneros',
    description: 'Tags de sub-gênero aplicáveis a qualquer livro.',
  },
]

const activeTab = ref(tabs[0]!.key)
const currentTab = computed(() => tabs.find((t) => t.key === activeTab.value))
</script>

<style lang="scss" scoped>
// ── Tab bar ───────────────────────────────────────────────────────
.entity-tabs {
  display: flex;
  gap: 2px;
  margin-bottom: 1rem;
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  overflow: hidden;
  background: var(--color-border-default);

  &__btn {
    flex: 1;
    min-height: 44px;
    padding: 10px 16px;
    border: none;
    background: var(--color-surface-default);
    font-family: var(--font-family-body);
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--color-text-subtle);
    cursor: pointer;
    transition:
      background var(--motion-transition-default),
      color var(--motion-transition-default);

    &:hover {
      background: var(--color-background-subtle);
      color: var(--color-text-default);
    }

    &.is-active {
      background: var(--color-action-background-subtle);
      color: var(--color-action-default);
      font-weight: 600;
    }
  }
}

// ── Tab content transition ────────────────────────────────────────
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity var(--motion-transition-default);
}
.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
}

@media (max-width: 767px) {
  .entity-tabs {
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    &__btn {
      flex: 0 0 auto;
      flex-shrink: 0;
      white-space: nowrap;
      min-height: 40px;
      padding: 8px 14px;
    }
  }
}
</style>
