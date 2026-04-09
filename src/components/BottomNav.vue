<template>
  <nav v-if="isMobile" class="bottom-nav" aria-label="Navegação principal">
    <RouterLink
      to="/"
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': route.path === '/' }"
      aria-label="Catálogo"
    >
      <BaseIcon name="book" class="bottom-nav__icon" aria-hidden="true" />
      <span class="bottom-nav__label">Catálogo</span>
    </RouterLink>

    <RouterLink
      to="/filtros"
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': route.path === '/filtros' }"
      aria-label="Buscar"
    >
      <BaseIcon name="search" class="bottom-nav__icon" aria-hidden="true" />
      <span class="bottom-nav__label">Buscar</span>
    </RouterLink>

    <!-- Indicar — só para logados -->
    <button
      v-if="store.isLoggedIn"
      class="bottom-nav__item"
      type="button"
      aria-label="Indicar livro"
      @click="emit('indicate')"
    >
      <BaseIcon name="arrow-right" class="bottom-nav__icon" aria-hidden="true" />
      <span class="bottom-nav__label">Indicar</span>
    </button>

    <!-- Conta: vai para /login se deslogado, ou abre dropdown se logado -->
    <RouterLink
      v-if="!store.isLoggedIn"
      to="/login"
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': route.path === '/login' }"
      aria-label="Entrar"
    >
      <BaseIcon name="user" class="bottom-nav__icon" aria-hidden="true" />
      <span class="bottom-nav__label">Entrar</span>
    </RouterLink>

    <button
      v-else
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': isAccountOpen }"
      type="button"
      aria-label="Minha conta"
      :aria-expanded="isAccountOpen"
      @click="toggleAccount"
    >
      <UserAvatar v-if="store.user" :alt="store.user.name" class="bottom-nav__avatar" />
      <span class="bottom-nav__label">Conta</span>
    </button>

    <!-- Dropdown de conta (aparece acima do bottom nav) -->
    <Transition name="account-sheet">
      <div v-if="isAccountOpen" class="bottom-nav__account-sheet" role="dialog" aria-label="Opções de conta">
        <div class="bottom-nav__account-header">
          <UserAvatar :alt="store.user!.name" class="bottom-nav__account-avatar" />
          <div class="bottom-nav__account-info">
            <span class="bottom-nav__account-name">{{ store.user!.name }}</span>
            <span class="bottom-nav__account-role">{{ roleLabel }}</span>
          </div>
        </div>

        <div class="bottom-nav__account-divider" />

        <RouterLink v-if="store.isAdmin" to="/admin" class="bottom-nav__account-item" @click="closeAccount">
          <BaseIcon name="filter" aria-hidden="true" />
          <span>Painel admin</span>
        </RouterLink>

        <button class="bottom-nav__account-item bottom-nav__account-item--danger" type="button" @click="handleLogout">
          <BaseIcon name="times" aria-hidden="true" />
          <span>Sair</span>
        </button>
      </div>
    </Transition>

    <!-- Overlay para fechar o dropdown de conta -->
    <Transition name="overlay-fade">
      <div v-if="isAccountOpen" class="bottom-nav__overlay" aria-hidden="true" @click="closeAccount" />
    </Transition>
  </nav>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import { useAuth } from '@/composables/useAuth'
import UserAvatar from '@/components/UserAvatar.vue'

const emit = defineEmits<{
  indicate: []
}>()

const route = useRoute()
const router = useRouter()
const isMobile = useMediaQuery('(max-width: 767px)')
const isAccountOpen = ref(false)

const { store, logout } = useAuth()

const roleLabel = computed(() => {
  const map = { admin: 'Administrador', editor: 'Editor', viewer: 'Membro' }
  return map[store.user?.role ?? 'viewer']
})

const toggleAccount = () => {
  isAccountOpen.value = !isAccountOpen.value
}

const closeAccount = () => {
  isAccountOpen.value = false
}

const handleLogout = async () => {
  closeAccount()
  await logout()
  router.push('/')
}
</script>

<style lang="scss" scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;

  display: flex;
  align-items: stretch;
  height: 56px;

  background: var(--color-header-bg);
  border-top: 1px solid rgba(var(--color-surface-default-rgb), 0.08);

  // Safe area para dispositivos com home indicator (iPhone X+)
  padding-bottom: env(safe-area-inset-bottom);

  &__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    min-height: 44px;

    border: none;
    background: none;
    cursor: pointer;
    text-decoration: none;
    color: var(--color-action-text-subtle);
    font-family: var(--font-family-body);

    transition: color var(--motion-transition-default);

    &:hover,
    &--active {
      color: var(--color-action-default);
    }
  }

  &__icon {
    width: 20px;
    height: 20px;
    color: inherit;
    flex-shrink: 0;
  }

  &__avatar {
    width: 22px !important;
    height: 22px !important;
  }

  &__label {
    font: {
      size: 0.65rem;
      weight: 500;
    }
    letter-spacing: 0.03em;
    color: inherit;
    line-height: 1;
  }

  // ── Dropdown de conta ──────────────────────
  &__account-sheet {
    position: fixed;
    bottom: calc(56px + env(safe-area-inset-bottom));
    left: 0;
    right: 0;
    z-index: 110;

    background: var(--color-surface-default);
    border-top: 1px solid var(--color-border-default);
    border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
    box-shadow: var(--shadow-xl);

    padding-bottom: 8px;
  }

  &__account-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 16px 12px;
  }

  &__account-avatar {
    width: 2.25rem !important;
    height: 2.25rem !important;
  }

  &__account-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__account-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text-default);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__account-role {
    font-size: 0.72rem;
    color: var(--color-text-subtle);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__account-divider {
    height: 1px;
    background: var(--color-border-default);
    margin-bottom: 4px;
  }

  &__account-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 48px;
    padding: 12px 16px;
    background: none;
    border: none;
    text-decoration: none;
    font-family: var(--font-family-body);
    font-size: 0.95rem;
    color: var(--color-text-default);
    cursor: pointer;
    transition: background var(--motion-transition-default);
    text-align: left;

    svg {
      width: 16px;
      height: 16px;
      color: var(--color-text-subtle);
      flex-shrink: 0;
    }

    &:hover {
      background: var(--color-background-subtle);
    }

    &--danger {
      &:hover {
        background: var(--color-background-subtle);
        color: #c0392b;

        svg {
          color: #c0392b;
        }
      }
    }
  }

  // ── Overlay ────────────────────────────────
  &__overlay {
    position: fixed;
    inset: 0;
    z-index: 105;
    background: rgba(0, 0, 0, 0.3);
  }
}

// ── Transições ─────────────────────────────────
.account-sheet-enter-active,
.account-sheet-leave-active {
  transition:
    transform var(--motion-transition-default),
    opacity var(--motion-transition-default);
}

.account-sheet-enter-from,
.account-sheet-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.2s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
</style>
