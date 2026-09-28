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
        :placeholder="placeholder"
        @select="(suggestion: Suggestion) => (model = suggestion.main)"
      />

      <AppButton v-if="addTarget" :to="addTarget" class="app-header__add" :variant="addVariant" :disabled="!canWrite">
        <BaseIcon name="plus" aria-hidden="true" />
        Adicionar um livro
      </AppButton>

      <UserMenu class="app-header__user" />
    </div>
  </header>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'

import { useBooksStore } from '@/stores'
import { useAddTarget, useBreakpoints, useCanWrite, useCatalogSearch } from '@/composables'
import AppButton from '@/components/ui/AppButton.vue'
import BrandLogo from '@/layouts/BrandLogo.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import UserMenu from '@/layouts/UserMenu.vue'
import type { Suggestion } from '@/types'

const isPhone = useMediaQuery(useBreakpoints.isPhone)
const addTarget = useAddTarget()
const { model, suggestions, searchesMyBooks } = useCatalogSearch()
const placeholder = computed(() =>
  searchesMyBooks.value
    ? 'Buscar nos meus livros'
    : isPhone.value
      ? 'Título, autor ou quem mencionou'
      : 'Buscar por título, autor ou quem mencionou',
)
const canWrite = useCanWrite()

const route = useRoute()
// One primary per fold: on the open book that is "Guardar em Quero ler" (Detail.desktop).
// Primary only where adding is the page's own action; elsewhere the page's primary would get a rival (Button.md).
const addVariant = computed(() => (route.name === 'catalog-books' ? 'primary' : 'secondary'))
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
  z-index: var(--layer-header);

  background-color: var(--color-surface-default);
  border-bottom: 1px solid var(--color-border-default);

  // Phone (Catalog.mobile): brand and account on top, search below.
  &__inner {
    display: grid;
    max-width: var(--page-max);
    margin: 0 auto;
    padding: var(--space-3) var(--space-4);

    grid-template-columns: 1fr auto;
    grid-template-areas:
      'brand user'
      'search search';
    align-items: center;
    gap: var(--space-3);

    // Desktop (Main): search on the left, primary action on the right; brand and account live in the rail.
    @media (min-width: $bp-tablet-min) {
      grid-template-columns: minmax(0, var(--header-search-max)) 1fr auto;
      grid-template-areas: 'search . add';
      gap: var(--space-4);
    }
  }

  &__brand {
    grid-area: brand;

    @media (min-width: $bp-tablet-min) {
      display: none;
    }
  }

  &__search {
    grid-area: search;
  }

  // On desktop the account sits at the rail foot, away from "Adicionar um livro".
  &__user {
    grid-area: user;

    @media (min-width: $bp-tablet-min) {
      display: none;
    }
  }

  &__add {
    grid-area: add;

    @media (max-width: $bp-phone-max) {
      display: none;
    }
  }
}
</style>
