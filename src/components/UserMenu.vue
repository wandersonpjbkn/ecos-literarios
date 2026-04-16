<template>
  <div ref="wrapRef" class="user-btn-wrap">
    <!-- guest -->
    <RouterLink v-if="!store.isLoggedIn" :to="{ name: 'auth-login' }" class="user-btn">
      <BaseIcon name="user" aria-hidden="true" />
    </RouterLink>

    <!-- logged in -->
    <button
      v-else
      :class="['user-btn user-btn--auth', { 'is-logged': store.isLoggedIn }]"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      @click="isOpen = !isOpen"
    >
      <UserAvatar :alt="store.user!.name" />
    </button>

    <!-- Dropdown do usuário logado -->
    <Transition name="dropdown">
      <div v-if="isOpen && store.isLoggedIn" class="user-dropdown" role="menu">
        <div class="user-dropdown__header">
          <UserAvatar :alt="store.user!.name" class="user-dropdown__avatar" />
          <div class="user-dropdown__info">
            <span class="user-dropdown__name">{{ store.user!.name }}</span>
            <span class="user-dropdown__role">{{ roleLabel }}</span>
          </div>
        </div>

        <div class="user-dropdown__divider" />

        <RouterLink :to="{ name: 'profile-books' }" class="user-dropdown__item" role="menuitem" @click="isOpen = false">
          <BaseIcon name="user" aria-hidden="true" />
          <span>Meu perfil</span>
        </RouterLink>

        <RouterLink
          v-if="store.isAdmin"
          :to="{ name: 'admin-books' }"
          class="user-dropdown__item"
          role="menuitem"
          @click="isOpen = false"
        >
          <BaseIcon name="filter" aria-hidden="true" />
          <span>Painel admin</span>
        </RouterLink>

        <button class="user-dropdown__item user-dropdown__item--danger" role="menuitem" @click="handleLogout">
          <BaseIcon name="times" aria-hidden="true" />
          <span>Sair</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { onClickOutside } from '@vueuse/core'

import { useAuth } from '@/composables'
import UserAvatar from '@/components/UserAvatar.vue'

const { store, logout } = useAuth()
const router = useRouter()

const wrapRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

onClickOutside(wrapRef, () => {
  isOpen.value = false
})

const roleLabel = computed(() => {
  const map = { admin: 'Administrador', editor: 'Editor', viewer: 'Membro' }
  return map[store.user?.role ?? 'viewer']
})

const handleLogout = async () => {
  isOpen.value = false
  await logout()
  router.push('/')
}
</script>

<style lang="scss" scoped>
.user-btn-wrap {
  position: relative;
}

// ── Botão base ────────────────────────────────────────────────────
.user-btn {
  --icon-size: 65%;
  --btn-size: 2.5rem;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: var(--btn-size);
  height: var(--btn-size);
  // background: var(--color-action-default);
  background: none;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  text-decoration: none;
  transition: background-color var(--motion-transition-default);
  color: var(--color-action-default);

  &:hover {
    background-color: rgba(#000, 0.05);
  }

  :deep(.base-icon) {
    width: var(--icon-size);
    height: var(--icon-size);
  }

  :deep(.avatar) {
    width: var(--btn-size);
    height: var(--btn-size);
  }

  &.is-logged {
    border: none !important;
  }

  @media (max-width: 767px) {
    --icon-size: 60%;
    --btn-size: 2rem;
  }
}

// ── Dropdown ──────────────────────────────────────────────────────
.user-dropdown {
  position: absolute;
  top: calc(100% + 0.7rem);
  right: 0;
  z-index: 200;

  min-width: 200px;
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  box-shadow: var(--shadow-lg);
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
  }

  &__avatar {
    width: 2.25rem !important;
    height: 2.25rem !important;

    .avatar-initials {
      font-size: 0.78rem !important;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__name {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text-default);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__role {
    font-size: 0.72rem;
    color: var(--color-text-subtle);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__divider {
    height: 1px;
    background: var(--color-border-default);
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    min-height: 44px;
    padding: 10px 16px;
    background: none;
    border: none;
    text-decoration: none;
    font-family: var(--font-family-body);
    font-size: 0.9rem;
    color: var(--color-text-default);
    cursor: pointer;
    transition: background var(--motion-transition-default);
    text-align: left;

    svg {
      width: 14px;
      height: 14px;
      color: var(--color-text-subtle);
      flex-shrink: 0;
    }

    &:hover {
      background: var(--color-background-subtle);
    }

    &--danger {
      color: var(--color-text-default);

      &:hover {
        background: var(--color-background-subtle);
        color: #c0392b;

        svg {
          color: #c0392b;
        }
      }
    }
  }
}

// ── Dropdown transition ───────────────────────────────────────────
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--motion-transition-default);
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
