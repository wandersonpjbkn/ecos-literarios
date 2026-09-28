<template>
  <div class="area-section">
    <SectionHeader title="Autores e gêneros">
      As listas que aparecem nos livros: autores, formatos, gêneros e subgêneros.
    </SectionHeader>

    <div class="entity-tabs" role="tablist" aria-label="Listas" @keydown="onTabKeydown">
      <button
        v-for="tab in tabs"
        :id="`tab-${tab.key}`"
        :key="tab.key"
        type="button"
        class="entity-tabs__btn"
        :class="{ 'is-active': activeTab === tab.key }"
        role="tab"
        :aria-selected="activeTab === tab.key"
        :aria-controls="`panel-${tab.key}`"
        :tabindex="activeTab === tab.key ? 0 : -1"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <Transition name="tab-fade" mode="out-in">
      <EntityTab
        v-if="currentTab"
        :id="`panel-${currentTab.key}`"
        :key="currentTab.key"
        role="tabpanel"
        :aria-labelledby="`tab-${currentTab.key}`"
        :resource="currentTab.resource"
        :title="currentTab.label"
        :singular="currentTab.singular"
        :description="currentTab.description"
      />
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import SectionHeader from '@/components/ui/SectionHeader.vue'
import EntityTab from '@/components/admin/EntityTab.vue'
import type { TabConfig } from '@/types'

const tabs: TabConfig[] = [
  {
    key: 'autores',
    label: 'Autores',
    singular: 'autor',
    resource: 'autores',
    description: 'Os nomes de autor que um livro pode ter.',
  },
  {
    key: 'midias',
    label: 'Formatos',
    singular: 'formato',
    resource: 'midias',
    description: 'Livro, mangá, HQ e os outros formatos do acervo.',
  },
  {
    key: 'categorias',
    label: 'Gêneros',
    singular: 'gênero',
    resource: 'categorias',
    description: 'Os gêneros do catálogo (Suspense, Fantasia…).',
  },
  {
    key: 'subgeneros',
    label: 'Subgêneros',
    singular: 'subgênero',
    resource: 'subgeneros',
    description: 'Os subgêneros que um livro pode ter.',
  },
]

// The tab lives in the URL (?lista=): reload and Back keep it, and changing tab starts its list from the top.
const route = useRoute()
const router = useRouter()
const activeTab = computed({
  get: () => tabs.find((t) => t.key === route.query.lista)?.key ?? tabs[0]!.key,
  set: (key: string) => router.replace({ query: { ...route.query, lista: key } }),
})
const currentTab = computed(() => tabs.find((t) => t.key === activeTab.value))

// Tab pattern: arrows move between tabs, Home and End jump to the ends; Tab itself goes into the list.
const onTabKeydown = async (event: KeyboardEvent) => {
  const index = tabs.findIndex((t) => t.key === activeTab.value)
  const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }[event.key]
  if (next === undefined) return
  event.preventDefault()
  const key = tabs[(next + tabs.length) % tabs.length]!.key
  // The tab changes through the URL; focus waits for the navigation, or it lands on the old tab.
  await router.replace({ query: { ...route.query, lista: key } })
  await nextTick()
  document.getElementById(`tab-${key}`)?.focus()
}
</script>

<style lang="scss" scoped>
.entity-tabs {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  // Inset line, not a border: the active tab's underline covers it even when the strip scrolls (phone).
  box-shadow: inset 0 -1px 0 var(--color-border-default);

  // Tabs switch the list, so they are not pills: the pill is a filter (FilterChip.md).
  &__btn {
    min-height: var(--touch-cta);
    padding: 0 var(--space-4);
    border: none;
    border-bottom: 2px solid transparent;
    background: none;
    font-family: var(--font-family-body);
    font-size: var(--font-size-ui);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition:
      color var(--motion-transition-default),
      border-color var(--motion-transition-default);

    &:hover {
      color: var(--color-text-default);
      border-bottom-color: var(--color-border-strong);
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: var(--focus-offset-inset);
    }

    &.is-active {
      border-bottom-color: var(--color-action-default);
      color: var(--color-action-default-hover);
      font-weight: var(--font-weight-semibold);
    }
  }
}

.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity var(--motion-transition-default);
}
.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
}

@media (max-width: $bp-phone-max) {
  .entity-tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    &__btn {
      flex-shrink: 0;
      white-space: nowrap;
    }
  }
}
</style>
