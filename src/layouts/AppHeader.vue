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
import { useMediaQuery } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { Suggestion } from '@/types'

import { useBooksStore } from '@/stores'

import { useAddTarget, useBreakpoints, useCanWrite, useCatalogSearch } from '@/composables'

import BrandLogo from '@/layouts/BrandLogo.vue'
import UserMenu from '@/layouts/UserMenu.vue'

import AppButton from '@/components/ui/AppButton.vue'
import SearchBar from '@/components/ui/SearchBar.vue'

const route = useRoute()

const router = useRouter()

const isPhone = useMediaQuery(useBreakpoints.isPhone)
const addTarget = useAddTarget()
const { model, suggestions, searchesMyBooks } = useCatalogSearch()

const canWrite = useCanWrite()

const search = ref<InstanceType<typeof SearchBar> | null>(null)

const placeholder = computed(() =>
  searchesMyBooks.value
    ? 'Buscar nos meus livros'
    : isPhone.value
      ? 'Título, autor ou comentário'
      : 'Buscar por título, autor ou comentário',
)

const addVariant = computed(() => (route.name === 'catalog-books' ? 'primary' : 'secondary'))

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
