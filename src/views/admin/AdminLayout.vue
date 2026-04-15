<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="admin-sidebar__header">
        <RouterLink :to="{ name: 'catalog-books' }" class="admin-sidebar__back">
          <BaseIcon name="arrow-left" />
          <span>Catálogo</span>
        </RouterLink>
        <h1 class="admin-sidebar__title">Painel Admin</h1>
      </div>

      <nav class="admin-sidebar__nav" aria-label="Navegação do painel">
        <RouterLink
          :to="{ name: 'admin-books' }"
          class="admin-sidebar__link"
          :class="{ 'is-active': route.name === 'admin-books' }"
        >
          <BaseIcon name="book" class="admin-sidebar__link-icon" />
          <span>Livros</span>
          <span v-if="bookCount > 0" class="admin-sidebar__badge">{{ bookCount }}</span>
        </RouterLink>

        <RouterLink
          :to="{ name: 'admin-members' }"
          class="admin-sidebar__link"
          :class="{ 'is-active': route.name === 'admin-members' }"
        >
          <BaseIcon name="user" class="admin-sidebar__link-icon" />
          <span>Membros</span>
          <span v-if="memberCount > 0" class="admin-sidebar__badge">{{ memberCount }}</span>
        </RouterLink>

        <RouterLink
          :to="{ name: 'admin-permissions' }"
          class="admin-sidebar__link"
          :class="{ 'is-active': route.name === 'admin-permissions' }"
        >
          <BaseIcon name="filter" class="admin-sidebar__link-icon" />
          <span>Permissões</span>
        </RouterLink>

        <RouterLink
          :to="{ name: 'admin-entities' }"
          class="admin-sidebar__link"
          :class="{ 'is-active': route.name === 'admin-entities' }"
        >
          <BaseIcon name="menu" class="admin-sidebar__link-icon" />
          <span>Dados</span>
        </RouterLink>

        <RouterLink
          :to="{ name: 'admin-enrichment' }"
          class="admin-sidebar__link"
          :class="{ 'is-active': route.name === 'admin-enrichment' }"
        >
          <BaseIcon name="reload" class="admin-sidebar__link-icon" />
          <span>Enriquecimento</span>
        </RouterLink>

        <RouterLink
          :to="{ name: 'admin-claims' }"
          class="admin-sidebar__link"
          :class="{ 'is-active': route.name === 'admin-claims' }"
        >
          <BaseIcon name="link" class="admin-sidebar__link-icon" />
          <span>Vínculos</span>
        </RouterLink>
      </nav>

      <div class="admin-sidebar__footer">
        <UserAvatar :alt="authStore.user!.name" class="admin-sidebar__avatar" />
        <div class="admin-sidebar__user">
          <span class="admin-sidebar__user-name">{{ authStore.user!.name }}</span>
          <span class="admin-sidebar__user-role">Administrador</span>
        </div>
      </div>
    </aside>

    <main class="admin-main">
      <RouterView />
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { useAuthStore, useBooksStore } from '@/stores'
import { usePageMeta } from '@/composables'

import UserAvatar from '@/components/UserAvatar.vue'

usePageMeta({
  title: 'Painel Admin',
  description: 'Painel de administração do Ecos Literários',
})

const API_BASE = import.meta.env.VITE_API_URL as string

const route = useRoute()
const authStore = useAuthStore()

const memberCount = ref(0)
const bookCount = computed(() => useBooksStore().size)

onMounted(async () => {
  try {
    const res = await fetch(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    if (res.ok) {
      const users = await res.json()
      memberCount.value = users.length
    }
  } catch {
    // Badge is cosmetic — failure is silent
  }
})
</script>

<style lang="scss">
.page-admin {
  .site-main {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    overflow: hidden;
    height: 100dvh;
  }

  .site-user--content {
    max-width: none;
  }
}
</style>

<style lang="scss" scoped>
.admin-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: calc(100dvh - 4rem);
}

.admin-sidebar {
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

  &__badge {
    margin-left: auto;
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    border-radius: 999px;
    background: var(--color-background-subtle);
    color: var(--color-text-subtle);
    font-size: 0.72rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;

    .is-active & {
      background: var(--color-action-default);
      color: #fff;
    }
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

.admin-main {
  overflow-y: auto;
  background: var(--color-background-default);

  :deep(.admin-section) {
    margin: 0 auto;
    max-width: 1200px;
    padding: 2rem;
  }
}

@media (max-width: 1023px) {
  .admin-layout {
    grid-template-columns: 220px 1fr;
  }

  .admin-main :deep(.admin-section) {
    padding: 1.5rem;
  }
}

@media (max-width: 767px) {
  .admin-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .admin-main :deep(.admin-section) {
    padding: 1rem;
  }

  .admin-sidebar {
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

    &__badge {
      margin-left: 4px;
    }

    &__footer {
      display: none;
    }
  }
}
</style>
