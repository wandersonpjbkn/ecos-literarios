<template>
  <div class="user-menu" :class="`user-menu--${placement}`">
    <RouterLink v-if="!store.isLoggedIn" :to="{ name: 'auth-login' }" class="user-btn">
      <BaseIcon name="user" aria-hidden="true" />
      <span class="user-btn__label">Entrar</span>
    </RouterLink>

    <RouterLink v-else :to="{ name: 'profile-account' }" class="user-btn">
      <UserAvatar :alt="store.user!.name" />
      <span class="user-btn__label">Minha conta</span>
    </RouterLink>
  </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/stores'

import UserAvatar from '@/components/ui/UserAvatar.vue'

withDefaults(
  defineProps<{
    placement?: 'header' | 'rail'
  }>(),
  { placement: 'header' },
)

const store = useAuthStore()
</script>

<style lang="scss" scoped>
.user-btn {
  display: inline-flex;
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: 0;
  border: none;
  border-radius: var(--radius-lg);
  background: none;
  font-family: var(--font-family-body);
  color: var(--color-text-subtle);
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color var(--motion-transition-default),
    color var(--motion-transition-default);

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: calc(-1 * var(--space-1));
  }

  :deep(.base-icon) {
    width: var(--icon-lg);
    height: var(--icon-lg);
  }

  :deep(.avatar) {
    width: var(--avatar-md);
    height: var(--avatar-md);
  }
}

.user-menu--rail .user-btn {
  width: 100%;
  min-height: var(--rail-item);
  flex-direction: column;
  padding: var(--space-1) 0;
  white-space: nowrap;

  &:hover {
    background: var(--color-background-subtle);
    color: var(--color-action-default);
  }

  .user-btn__label {
    font-size: var(--font-size-caption);
    line-height: var(--line-height-ui);
  }
}

.user-menu--header .user-btn {
  gap: var(--space-2);
  padding: 0 var(--space-2);
  font-size: var(--font-size-meta);
  white-space: nowrap;

  &:hover {
    background: var(--color-background-subtle);
  }
}
</style>
