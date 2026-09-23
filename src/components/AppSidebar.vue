<template>
  <aside class="app-sidebar">
    <nav class="app-sidebar--inner">
      <!-- home -->
      <RouterLink :to="{ name: 'catalog-books' }" class="btn" aria-label="Catálogo">
        <BaseIcon name="home" aria-hidden="true" />
      </RouterLink>

      <!-- categories -->
      <button
        class="btn"
        type="button"
        :aria-expanded="categoryIsOpen"
        aria-label="Categorias"
        @click="emit('toggle-categories')"
      >
        <BaseIcon name="menu" aria-hidden="true" />
      </button>

      <!-- add -->
      <RouterLink
        v-if="isLoggedIn"
        :to="{ name: isEditor ? 'admin-books' : 'profile-books' }"
        class="btn"
        aria-label="Cadastrar livro"
      >
        <BaseIcon name="plus" aria-hidden="true" />
      </RouterLink>

      <!-- profile -->
      <RouterLink v-if="isLoggedIn" :to="{ name: 'profile-account' }" class="btn" aria-label="Meu perfil">
        <BaseIcon name="user" aria-hidden="true" />
      </RouterLink>

      <!-- preferences -->
      <button
        class="btn"
        type="button"
        :aria-expanded="menuIsOpen"
        aria-label="Preferências"
        @click="emit('toggle-menu')"
      >
        <BaseIcon name="filter" aria-hidden="true" />
      </button>
    </nav>
  </aside>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/stores'

withDefaults(
  defineProps<{
    categoryIsOpen?: boolean
    menuIsOpen?: boolean
  }>(),
  {
    categoryIsOpen: false,
    menuIsOpen: false,
  },
)

const emit = defineEmits(['toggle-menu', 'toggle-categories'])

const { isEditor, isLoggedIn } = storeToRefs(useAuthStore())
</script>

<style lang="scss" scoped>
@use '@/assets/scss/components/config-btn';

.app-sidebar {
  position: relative;
  z-index: 60;

  background: var(--color-header-bg, var(--color-text-default));
  border-right: 1px solid var(--color-border-default);

  &--inner {
    display: flex;
    width: fit-content;
    height: 100%;
    padding: 5.25rem var(--space-3);

    align-items: center;
    justify-content: space-around;
    flex-direction: column;
    gap: 2rem;
  }

  @media (max-width: 767px) {
    border-right: none;
    border-top: 1px solid var(--color-border-default);

    &--inner {
      width: 100%;
      height: fit-content;
      padding: 0.5rem 1rem;

      flex-direction: row;
      gap: 1rem;
    }
  }
}
</style>
