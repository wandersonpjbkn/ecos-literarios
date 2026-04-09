<template>
  <aside v-if="!isMobile" class="app-sidebar" :class="{ 'app-sidebar--expanded': isExpanded }">
    <!-- Branding -->
    <RouterLink to="/" class="app-sidebar__brand" :title="isExpanded ? '' : 'Ecos Literários'">
      <span class="app-sidebar__brand-icon">📚</span>
      <Transition name="label-fade">
        <span v-if="isExpanded" class="app-sidebar__brand-label">Ecos Literários</span>
      </Transition>
    </RouterLink>

    <div class="app-sidebar__divider" />

    <!-- Nav principal -->
    <nav class="app-sidebar__nav">
      <RouterLink
        to="/"
        class="app-sidebar__item"
        :class="{ 'app-sidebar__item--active': route.path === '/' }"
        :title="isExpanded ? '' : 'Catálogo'"
      >
        <BaseIcon name="book" class="app-sidebar__icon" aria-hidden="true" />
        <Transition name="label-fade">
          <span v-if="isExpanded" class="app-sidebar__label">Catálogo</span>
        </Transition>
      </RouterLink>

      <!-- Indicar — só para logados -->
      <button
        v-if="store.isLoggedIn"
        class="app-sidebar__item"
        :title="isExpanded ? '' : 'Indicar livro'"
        type="button"
        @click="emit('indicate')"
      >
        <BaseIcon name="arrow-right" class="app-sidebar__icon" aria-hidden="true" />
        <Transition name="label-fade">
          <span v-if="isExpanded" class="app-sidebar__label">Indicar</span>
        </Transition>
      </button>

      <!-- Admin — só para admins -->
      <RouterLink
        v-if="store.isAdmin"
        to="/admin"
        class="app-sidebar__item"
        :class="{ 'app-sidebar__item--active': route.path.startsWith('/admin') }"
        :title="isExpanded ? '' : 'Painel admin'"
      >
        <BaseIcon name="user" class="app-sidebar__icon" aria-hidden="true" />
        <Transition name="label-fade">
          <span v-if="isExpanded" class="app-sidebar__label">Admin</span>
        </Transition>
      </RouterLink>
    </nav>

    <!-- Rodapé: configurações + toggle -->
    <div class="app-sidebar__footer">
      <button
        class="app-sidebar__item app-sidebar__item--muted"
        :title="isExpanded ? '' : 'Configurações'"
        type="button"
        @click="emit('settings')"
      >
        <BaseIcon name="filter" class="app-sidebar__icon" aria-hidden="true" />
        <Transition name="label-fade">
          <span v-if="isExpanded" class="app-sidebar__label">Configurações</span>
        </Transition>
      </button>

      <button
        class="app-sidebar__item app-sidebar__item--muted"
        :title="isExpanded ? 'Colapsar' : 'Expandir'"
        :aria-label="isExpanded ? 'Colapsar menu lateral' : 'Expandir menu lateral'"
        type="button"
        @click="toggleExpanded"
      >
        <BaseIcon
          name="chevron"
          class="app-sidebar__icon"
          :class="{ 'app-sidebar__icon--chevron-open': isExpanded }"
          aria-hidden="true"
        />
        <Transition name="label-fade">
          <span v-if="isExpanded" class="app-sidebar__label">Colapsar</span>
        </Transition>
      </button>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import { useAuth } from '@/composables/useAuth'

const emit = defineEmits<{
  settings: []
  indicate: []
}>()

const route = useRoute()
const isMobile = useMediaQuery('(max-width: 767px)')
const isExpanded = ref(false)

const { store } = useAuth()

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style lang="scss" scoped>
.app-sidebar {
  position: relative;
  z-index: 100;
  flex-shrink: 0;

  width: 52px;
  height: 100dvh;

  display: flex;
  flex-direction: column;

  background: var(--color-header-bg);
  border-right: 1px solid rgba(var(--color-surface-default-rgb), 0.08);

  transition: width var(--motion-transition-default);
  overflow: hidden;

  &--expanded {
    width: 188px;
  }

  // ── Branding ────────────────────────────────
  &__brand {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 64px;
    padding: 0 14px;
    flex-shrink: 0;
    white-space: nowrap;
    overflow: hidden;
    color: var(--color-surface-default);
    text-decoration: none;
    transition: opacity var(--motion-transition-default);

    &:hover {
      opacity: 0.8;
    }
  }

  &__brand-icon {
    font-size: 1.3rem;
    line-height: 1;
    flex-shrink: 0;
    width: 24px;
    text-align: center;
  }

  &__brand-label {
    font: {
      family: var(--font-family-display);
      size: 0.95rem;
      weight: 400;
    }
    color: var(--color-surface-default);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__divider {
    height: 1px;
    background: rgba(var(--color-surface-default-rgb), 0.08);
    margin: 0 8px 4px;
    flex-shrink: 0;
  }

  // ── Nav ─────────────────────────────────────
  &__nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 4px 6px;
    gap: 2px;
    overflow: hidden;
  }

  &__footer {
    display: flex;
    flex-direction: column;
    padding: 4px 6px 8px;
    gap: 2px;
    border-top: 1px solid rgba(var(--color-surface-default-rgb), 0.08);
    flex-shrink: 0;
  }

  // ── Item base ───────────────────────────────
  &__item {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 40px;
    padding: 0 10px;
    border-radius: var(--border-radius-sm);
    border: none;
    background: none;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    color: var(--color-action-text-subtle);
    text-decoration: none;
    font-family: var(--font-family-body);
    transition: all var(--motion-transition-default);
    width: 100%;
    text-align: left;
    flex-shrink: 0;

    &:hover {
      background: rgba(var(--color-surface-default-rgb), 0.08);
      color: var(--color-surface-default);
    }

    &--active {
      background: rgba(var(--color-action-default-rgb), 0.18);
      color: var(--color-action-default);

      &:hover {
        background: rgba(var(--color-action-default-rgb), 0.24);
        color: var(--color-action-default);
      }
    }

    &--muted {
      color: rgba(var(--color-surface-default-rgb), 0.4);

      &:hover {
        color: var(--color-surface-default);
        background: rgba(var(--color-surface-default-rgb), 0.06);
      }
    }
  }

  // ── Ícone ───────────────────────────────────
  &__icon {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    color: inherit;
    transition: transform var(--motion-transition-default);

    // chevron: aponta para a direita quando colapsado, para a esquerda quando expandido
    &--chevron-open {
      transform: rotate(90deg);
    }
  }

  // ── Label ───────────────────────────────────
  &__label {
    font: {
      size: 0.875rem;
      weight: 400;
    }
    color: inherit;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// ── Transição expand/colapsar ────────────────
.label-fade-enter-active,
.label-fade-leave-active {
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}

.label-fade-enter-from,
.label-fade-leave-to {
  opacity: 0;
  transform: translateX(-6px);
}
</style>
