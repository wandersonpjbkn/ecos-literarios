<template>
  <nav class="app-sidebar" aria-label="Principal">
    <ul class="app-sidebar__list">
      <li v-for="item in items" :key="item.label">
        <RouterLink
          :to="item.to"
          class="app-sidebar__item"
          :class="{ 'is-active': item.active }"
          :aria-current="item.active ? 'page' : undefined"
        >
          <BaseIcon :name="item.icon" class="app-sidebar__icon" aria-hidden="true" />
          <span class="app-sidebar__label">{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/stores'

const route = useRoute()
const { isEditor } = storeToRefs(useAuthStore())

// "Adicionar" keeps the pre-redesign targets until the add panel exists.
const addTarget = computed(() => (isEditor.value ? 'admin-books' : 'profile-books'))

const items = computed(() => [
  { label: 'Catálogo', icon: 'home', to: { name: 'catalog-books' }, active: route.name === 'catalog-books' },
  { label: 'Meus livros', icon: 'book', to: { name: 'profile-books' }, active: route.name === 'profile-books' },
  {
    label: 'Adicionar',
    icon: 'plus',
    to: { name: addTarget.value },
    active: addTarget.value === 'admin-books' && route.name === 'admin-books',
  },
])
</script>

<style lang="scss" scoped>
.app-sidebar {
  position: relative;
  z-index: 60;

  background: var(--color-surface-default);
  border-top: 1px solid var(--color-border-default);
  padding-bottom: env(safe-area-inset-bottom);

  &__list {
    display: flex;
    list-style: none;

    li {
      flex: 1;
    }
  }

  &__item {
    display: flex;
    min-height: 58px;
    padding: var(--space-2) var(--space-1);

    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-1);

    color: var(--color-text-subtle);
    text-decoration: none;
    border-radius: var(--radius-lg);
    transition:
      background-color var(--motion-transition-default),
      color var(--motion-transition-default);

    &:hover {
      color: var(--color-action-default);
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--space-1));
    }

    &.is-active {
      color: var(--color-action-default);

      .app-sidebar__label {
        font-weight: 600;
      }
    }
  }

  &__icon {
    width: 22px;
    height: 22px;
  }

  &__label {
    font-size: 0.8125rem;
    line-height: 1.2;
    text-align: center;
  }

  @media (min-width: 768px) {
    width: var(--rail-width);
    padding: var(--space-6) var(--space-2);

    border-top: none;
    border-right: 1px solid var(--color-border-default);

    &__list {
      flex-direction: column;
      gap: var(--space-2);
    }

    &__item {
      min-height: 66px;

      &:hover {
        background: var(--color-background-subtle);
      }

      &.is-active {
        background: var(--color-action-background-subtle);
      }
    }
  }
}
</style>
