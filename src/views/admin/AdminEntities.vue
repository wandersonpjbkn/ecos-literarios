<template>
  <div class="area-section">
    <SectionHeader title="Autores e gêneros">
      As listas que aparecem nos livros: autores, formatos, gêneros e subgêneros.
    </SectionHeader>

    <ListTabs :tabs="tabs" :active="activeTab" label="Listas" @select="(key) => (activeTab = key)">
      <Transition name="tab-fade" mode="out-in">
        <EntityTab
          v-if="currentTab"
          :key="currentTab.key"
          :resource="currentTab.resource"
          :title="currentTab.label"
          :singular="currentTab.singular"
          :description="currentTab.description"
        />
      </Transition>
    </ListTabs>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { TabConfig } from '@/types'

import EntityTab from '@/components/admin/EntityTab.vue'
import ListTabs from '@/components/ui/ListTabs.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'

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

const route = useRoute()
const router = useRouter()
const activeTab = computed({
  get: () => tabs.find((t) => t.key === route.query.lista)?.key ?? tabs[0]!.key,
  set: (key: string) => router.replace({ query: { ...route.query, lista: key } }),
})
const currentTab = computed(() => tabs.find((t) => t.key === activeTab.value))
</script>

<style lang="scss" scoped>
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity var(--motion-transition-default);
}
.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
}
</style>
