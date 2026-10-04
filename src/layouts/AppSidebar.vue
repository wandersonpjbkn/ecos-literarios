<template>
  <div class="app-sidebar">
    <nav class="app-sidebar__nav" aria-label="Principal">
      <RouterLink
        :to="{ name: 'catalog-books' }"
        class="app-sidebar__logo"
        :aria-current="undefined"
        aria-label="Ecos Literários, catálogo"
      >
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
    </nav>

    <nav class="app-sidebar__foot" aria-label="Conta">
      <SupportLink class="app-sidebar__item">
        <span class="app-sidebar__label">Ajuda</span>
      </SupportLink>
      <RouterLink v-if="auth.isEditor" :to="{ name: 'admin-books' }" class="app-sidebar__item">
        <BaseIcon name="panel" class="app-sidebar__icon" aria-hidden="true" />
        <span class="app-sidebar__label">Painel do clube</span>
      </RouterLink>
      <UserMenu class="app-sidebar__user" placement="rail" />
    </nav>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useAuthStore } from '@/stores'

import { useAddTarget, useCanWrite, useLastList } from '@/composables'

import UserMenu from '@/layouts/UserMenu.vue'

import SupportLink from '@/components/ui/SupportLink.vue'

const route = useRoute()
const auth = useAuthStore()
const addTarget = useAddTarget()
const canWrite = useCanWrite()
const lastList = useLastList()

const onBook = computed(() => route.name === 'catalog-book-details')
const fromMine = computed(() => lastList.value.path.startsWith('/perfil/livros'))

const items = computed(() => [
  {
    label: 'Catálogo',
    icon: 'home',
    to: { name: 'catalog-books' },
    active: route.name === 'catalog-books' || (onBook.value && !fromMine.value),
  },
  {
    label: 'Meus livros',
    icon: 'book',
    to: { name: 'profile-books' },
    active: route.name === 'profile-books' || (onBook.value && fromMine.value),
  },
  ...(addTarget.value
    ? [{ label: 'Adicionar', icon: 'plus', to: addTarget.value, disabled: !canWrite.value, active: false }]
    : []),
])
</script>

<style lang="scss" scoped>
.app-sidebar {
  position: relative;
  z-index: var(--layer-nav);

  background: var(--color-surface-default);
  border-top: 1px solid var(--color-border-default);
  padding-bottom: env(safe-area-inset-bottom);

  &__logo {
    display: none;

    img {
      width: var(--brand-mark);
      height: var(--brand-mark);
      border-radius: var(--radius-md);
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: var(--space-1);
      border-radius: var(--radius-md);
    }
  }

  &__foot {
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
    min-height: var(--tab-item);
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
      box-shadow: inset 0 0 0 1px var(--color-action-border-subtle);
      background: var(--color-action-background-subtle);
      color: var(--color-action-default-hover);

      .app-sidebar__label {
        font-weight: var(--font-weight-semibold);
      }
    }

    &.is-disabled {
      box-shadow: inset 0 0 0 1px var(--color-border-default);
      color: var(--color-text-subtle);
      background: var(--color-background-subtle);
      cursor: not-allowed;
    }
  }

  &__icon,
  &__item :deep(.base-icon) {
    width: var(--icon-lg);
    height: var(--icon-lg);
  }

  &__label {
    font-size: var(--font-size-caption);
    line-height: var(--line-height-ui);
    text-align: center;
  }

  @media (min-width: $bp-tablet-min) {
    width: var(--rail-width);
    padding: var(--space-5) var(--space-2);

    display: flex;
    flex-direction: column;

    &__logo {
      display: flex;
      min-width: var(--touch-min);
      min-height: var(--touch-min);
      margin-bottom: var(--space-6);
      align-items: center;
      justify-content: center;
    }

    &__nav {
      display: flex;
      flex: 1;
      flex-direction: column;
    }

    &__foot {
      display: flex;
      margin-top: auto;
      flex-direction: column;
      gap: var(--space-2);
    }

    &__user {
      display: flex;
      justify-content: center;
    }

    border-top: none;
    border-right: 1px solid var(--color-border-default);

    &__list {
      flex-direction: column;
      gap: var(--space-2);
    }

    &__item {
      min-height: var(--rail-item);

      &:hover:not(.is-disabled, .is-active) {
        background: var(--color-background-subtle);
      }
    }
  }
}
</style>
