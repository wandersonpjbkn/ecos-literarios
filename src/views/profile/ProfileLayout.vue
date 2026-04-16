<template>
  <div class="profile-layout">
    <aside class="profile-sidebar">
      <div class="profile-sidebar__header">
        <RouterLink :to="{ name: 'catalog-books' }" class="profile-sidebar__back">
          <BaseIcon name="arrow-left" />
          <span>Catálogo</span>
        </RouterLink>
        <h1 class="profile-sidebar__title">Meu perfil</h1>
      </div>

      <nav class="profile-sidebar__nav" aria-label="Navegação do perfil">
        <RouterLink
          :to="{ name: 'profile-books' }"
          class="profile-sidebar__link"
          :class="{ 'is-active': route.name === 'profile-books' }"
        >
          <BaseIcon name="book" class="profile-sidebar__link-icon" aria-hidden="true" />
          <span>Meus livros</span>
        </RouterLink>

        <RouterLink
          :to="{ name: 'profile-claim' }"
          class="profile-sidebar__link"
          :class="{ 'is-active': route.name === 'profile-claim' }"
        >
          <BaseIcon name="link" class="profile-sidebar__link-icon" aria-hidden="true" />
          <span>Vínculos</span>
        </RouterLink>

        <RouterLink
          :to="{ name: 'profile-account' }"
          class="profile-sidebar__link"
          :class="{ 'is-active': route.name === 'profile-account' }"
        >
          <BaseIcon name="user" class="profile-sidebar__link-icon" aria-hidden="true" />
          <span>Conta</span>
        </RouterLink>
      </nav>

      <div class="profile-sidebar__footer">
        <UserAvatar :alt="authStore.user!.name" class="profile-sidebar__avatar" />
        <div class="profile-sidebar__user">
          <span class="profile-sidebar__user-name">{{ authStore.user!.name }}</span>
          <span class="profile-sidebar__user-role">{{ roleLabel }}</span>
        </div>
      </div>
    </aside>

    <main class="profile-main">
      <RouterView />
    </main>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useAuthStore } from '@/stores'
import { usePageMeta } from '@/composables'

import UserAvatar from '@/components/UserAvatar.vue'

usePageMeta({
  title: 'Meu perfil',
  description: 'Gerencie seu vínculo de menções e informações de conta no Ecos Literários',
})

const route = useRoute()
const authStore = useAuthStore()

const roleLabel = computed(() => {
  const map: Record<string, string> = {
    admin: 'Administrador',
    editor: 'Editor',
    viewer: 'Membro',
  }
  return map[authStore.user?.role ?? 'viewer'] ?? 'Membro'
})
</script>

<style lang="scss">
.page-profile {
  .app-main {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    overflow: hidden;
  }

  .app-header--inner {
    max-width: none;
  }
}
</style>

<style lang="scss" scoped>
.profile-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: calc(100dvh - 4rem);
}

.profile-sidebar {
  display: flex;
  flex-direction: column;
  background: var(--color-surface-default);
  border-right: 1px solid var(--color-border-default);
  position: sticky;
  top: 0;
  height: calc(100dvh - 4rem);
  overflow-y: auto;

  &__header {
    padding: 1.5rem 1.25rem 1rem;
    border-bottom: 1px solid var(--color-border-default);
  }

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.82rem;
    color: var(--color-text-subtle);
    text-decoration: none;
    margin-bottom: 1rem;
    transition: color var(--motion-transition-default);

    &:hover {
      color: var(--color-action-default);
    }

    svg {
      width: 14px;
      height: 14px;
    }
  }

  &__title {
    margin: 0;
    font-family: var(--font-family-display);
    font-size: 1.1rem;
    font-weight: 400;
    color: var(--color-text-default);
  }

  &__nav {
    flex: 1;
    padding: 1rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 10px 12px;
    border-radius: var(--border-radius-default);
    text-decoration: none;
    font-size: 0.9rem;
    color: var(--color-text-subtle);
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
      font-weight: 500;
    }
  }

  &__link-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 1rem 1.25rem;
    border-top: 1px solid var(--color-border-default);
  }

  &__avatar {
    width: 2rem !important;
    height: 2rem !important;
    flex-shrink: 0;
  }

  &__user {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__user-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-default);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__user-role {
    font-size: 0.7rem;
    color: var(--color-text-subtle);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
}

.profile-main {
  overflow-y: auto;
  background: var(--color-background-default);

  :deep(.profile-section) {
    margin: 0 auto;
    max-width: 1200px;
    padding: 2rem;
  }
}

@media (max-width: 1023px) {
  .profile-layout {
    grid-template-columns: 220px 1fr;
    min-height: calc(100dvh - 6rem);
  }

  .profile-main :deep(.profile-section) {
    padding: 1.5rem;
  }
}

@media (max-width: 767px) {
  .profile-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .profile-main :deep(.profile-section) {
    padding: 1rem;
  }

  .profile-sidebar {
    position: static;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--color-border-default);

    &__header {
      padding: 1rem 1rem 0.75rem;
    }

    &__back {
      margin-bottom: 0.5rem;
    }

    &__nav {
      flex-direction: row;
      padding: 0.5rem 0.75rem;
      overflow-x: auto;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    &__link {
      flex-shrink: 0;
      min-height: 40px;
    }
    &__footer {
      display: none;
    }
  }
}
</style>
