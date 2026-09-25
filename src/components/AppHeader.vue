<template>
  <header class="app-header">
    <div class="app-header__inner">
      <BrandLogo class="app-header__brand" />

      <SearchBar
        ref="search"
        v-model="model"
        class="app-header__search"
        :suggestions="suggestions"
        :total="useBooksStore().size"
        :filtered="filteredCount"
        :placeholder="isPhone ? 'Título, autor ou quem mencionou' : 'Buscar por título, autor ou quem mencionou'"
        @select="(suggestion: Suggestion) => (model = suggestion.main)"
      />

      <AppButton :to="{ name: addTarget }" class="app-header__add" variant="primary" :disabled="!canWrite">
        <BaseIcon name="plus" aria-hidden="true" />
        Adicionar um livro
      </AppButton>

      <UserMenu class="app-header__user" />
    </div>
  </header>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'

import { useBooksStore } from '@/stores'
import { useAddTarget, useBreakpoints, useCanWrite, useCatalogSearch } from '@/composables'
import AppButton from '@/components/AppButton.vue'
import BrandLogo from '@/components/BrandLogo.vue'
import SearchBar from '@/components/SearchBar.vue'
import UserMenu from '@/components/UserMenu.vue'
import type { Suggestion } from '@/types'

const isPhone = useMediaQuery(useBreakpoints.isTablet)
const addTarget = useAddTarget()
const { model, suggestions, filteredCount } = useCatalogSearch()
const canWrite = useCanWrite()

const route = useRoute()
const router = useRouter()
const search = ref<InstanceType<typeof SearchBar> | null>(null)

// Navegacao: desktop opens with the search focused; only on app open, so returning from a book keeps focus.
onMounted(async () => {
  await router.isReady()
  if (route.name === 'catalog-books' && !isPhone.value) search.value?.focus()
})
</script>

<style lang="scss" scoped>
.app-header {
  position: relative;
  z-index: 50;

  background-color: var(--color-surface-default);
  border-bottom: 1px solid var(--color-border-default);

  // Phone (Catalog.mobile): brand and account on top, search below.
  &__inner {
    display: grid;
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-3) var(--space-4);

    grid-template-columns: 1fr auto;
    grid-template-areas:
      'brand user'
      'search search';
    align-items: center;
    gap: var(--space-3);

    // Desktop (Main): search on the left, primary action on the right; brand and account live in the rail.
    @media (min-width: 768px) {
      grid-template-columns: minmax(0, 540px) 1fr auto;
      grid-template-areas: 'search . add';
      gap: var(--space-4);
    }
  }

  &__brand {
    grid-area: brand;

    @media (min-width: 768px) {
      display: none;
    }
  }

  &__search {
    grid-area: search;
  }

  // On desktop the account sits at the rail foot, away from "Adicionar um livro".
  &__user {
    grid-area: user;

    @media (min-width: 768px) {
      display: none;
    }
  }

  &__add {
    grid-area: add;

    @media (max-width: 767px) {
      display: none;
    }
  }
}
</style>
