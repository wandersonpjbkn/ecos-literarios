<template>
  <nav class="app-sidebar" aria-label="Principal">
    <RouterLink :to="{ name: 'catalog-books' }" class="app-sidebar__logo" aria-label="Ecos Literários, catálogo">
      <img src="/icons/icon-192x192.png" alt="" width="38" height="38" />
    </RouterLink>

    <ul class="app-sidebar__list">
      <li v-for="item in items" :key="item.label">
        <span v-if="item.disabled" class="app-sidebar__item is-disabled" role="link" aria-disabled="true">
          <BaseIcon :name="item.icon" class="app-sidebar__icon" aria-hidden="true" />
          <span class="app-sidebar__label">{{ item.label }}</span>
        </span>
        <RouterLink
          v-else
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

    <UserMenu class="app-sidebar__user" placement="rail" />
  </nav>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useAddTarget, useCanWrite } from '@/composables'
import UserMenu from '@/components/UserMenu.vue'

const route = useRoute()
const addTarget = useAddTarget()
const canWrite = useCanWrite()

const items = computed(() => [
  { label: 'Catálogo', icon: 'home', to: { name: 'catalog-books' }, active: route.name === 'catalog-books' },
  { label: 'Meus livros', icon: 'book', to: { name: 'profile-books' }, active: route.name === 'profile-books' },
  {
    label: 'Adicionar',
    icon: 'plus',
    to: { name: addTarget.value },
    active: addTarget.value === 'admin-books' && route.name === 'admin-books',
    disabled: !canWrite.value,
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

  // Desktop only: on phones the brand sits in the header (Catalog.mobile).
  &__logo {
    display: none;

    img {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-md);
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: var(--space-1);
      border-radius: var(--radius-md);
    }
  }

  // Desktop only: on phones the account stays in the header (TabBar.md).
  &__user {
    display: none;
  }

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

    &:hover:not(.is-disabled) {
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

    // Same look as a disabled pill: "Adicionar um livro" in the header turns off with it.
    &.is-disabled {
      color: var(--color-text-subtle);
      background: var(--color-background-subtle);
      cursor: not-allowed;
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
    padding: var(--space-5) var(--space-2);

    display: flex;
    flex-direction: column;

    &__logo {
      display: flex;
      margin-bottom: var(--space-6);
      justify-content: center;
    }

    &__user {
      display: flex;
      margin-top: auto;
      justify-content: center;
    }

    border-top: none;
    border-right: 1px solid var(--color-border-default);

    &__list {
      flex-direction: column;
      gap: var(--space-2);
    }

    &__item {
      min-height: 66px;

      &:hover:not(.is-disabled) {
        background: var(--color-background-subtle);
      }

      &.is-active {
        background: var(--color-action-background-subtle);
      }
    }
  }
}
</style>
