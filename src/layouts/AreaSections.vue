<template>
  <!-- The sections (<nav>) and, outside it, who you are and the way out: leaving is not a place. -->
  <div class="area-sections">
    <nav class="panel-nav" :aria-label="navLabel">
      <div v-for="group in groups" :key="group.title" class="panel-nav__group">
        <p class="panel-nav__heading">{{ group.title }}</p>
        <ul class="panel-nav__list">
          <li v-for="link in group.links" :key="link.name">
            <RouterLink
              :to="{ name: link.name }"
              class="panel-nav__link"
              :class="{ 'is-active': route.name === link.name }"
              :aria-current="route.name === link.name ? 'page' : undefined"
            >
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </div>
    </nav>

    <div class="panel-foot" :class="footClass">
      <AreaWho />
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'

import AreaWho from '@/layouts/AreaWho.vue'

export type AreaGroup = { title: string; links: { name: string; label: string }[] }

// The same list on the desktop side and inside the phone's sheet (estudo-nav-area-celular.md).
defineProps<{
  navLabel: string
  groups: AreaGroup[]
  footClass?: string
}>()

const route = useRoute()
</script>

<style lang="scss" scoped>
.area-sections {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  gap: var(--space-6);
}

.panel-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);

  &__heading {
    margin: 0 0 var(--space-2);
    padding: 0 var(--space-3);
    font-size: var(--font-size-caption);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-subtle);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__link {
    display: flex;
    min-height: var(--touch-cta);
    align-items: center;
    padding: 0 var(--space-3);
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    font-size: var(--font-size-ui);
    color: var(--color-text-secondary);
    text-decoration: none;
    transition:
      background-color var(--motion-transition-default),
      color var(--motion-transition-default);

    &:hover {
      background: var(--color-background-subtle);
      color: var(--color-text-default);
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: var(--focus-offset);
    }

    &.is-active {
      border-color: var(--color-action-border-subtle);
      background: var(--color-action-background-subtle);
      color: var(--color-action-default-hover);
      font-weight: var(--font-weight-semibold);
    }
  }
}

// Who you are and the way to the other area, always after the sections.
.panel-foot {
  display: flex;
  margin-top: auto;
  flex-direction: column;
  gap: var(--space-2);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-default);

  // Slot content (the switch to the other area, "Sair da conta") looks like the section links above it.
  :deep(.area-link) {
    display: flex;
    width: 100%;
    min-height: var(--touch-cta);
    align-items: center;
    padding: 0 var(--space-3);
    border: none;
    border-radius: var(--radius-md);
    background: none;
    font-family: var(--font-family-body);
    font-size: var(--font-size-ui);
    color: var(--color-text-secondary);
    text-align: left;
    text-decoration: none;
    cursor: pointer;

    &:hover {
      background: var(--color-background-subtle);
      color: var(--color-text-default);
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: var(--focus-offset);
    }
  }

  // Leaving the account is set apart from the area links, so it never reads as one more place to go.
  :deep(.area-link--leave) {
    gap: var(--space-2);
  }

  :deep(.area-link--leave + .area-link) {
    position: relative;
    margin-top: var(--space-2);

    &::before {
      position: absolute;
      top: calc(-1 * var(--space-2));
      right: var(--space-3);
      left: var(--space-3);
      border-top: 1px solid var(--color-border-default);
      content: '';
    }
  }
}
</style>
