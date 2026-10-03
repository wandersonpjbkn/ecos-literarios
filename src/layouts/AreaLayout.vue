<template>
  <div class="panel">
    <header class="panel-bar">
      <BrandLogo class="panel-bar__brand" />
      <h1 class="panel-bar__title">{{ title }}</h1>
      <AppButton :to="lastCatalog" size="md" class="panel-bar__back">
        <BaseIcon name="arrow-left" aria-hidden="true" />
        <span>Voltar <span class="panel-bar__back-long">ao catálogo</span></span>
      </AppButton>
    </header>

    <div class="panel-side">
      <AreaSections :nav-label="navLabel" :groups="groups" foot-class="panel-foot--side">
        <slot name="foot" />
      </AreaSections>
    </div>

    <div class="panel-sections-bar">
      <AppButton
        variant="outline"
        size="md"
        class="panel-sections-bar__button"
        aria-haspopup="dialog"
        :aria-expanded="sectionsOpen"
        @click="sectionsOpen = true"
      >
        <span class="visually-hidden">{{ navLabel }}: </span>{{ currentLabel }}
        <BaseIcon
          name="chevron"
          class="panel-sections-bar__chevron"
          :class="{ 'is-open': sectionsOpen }"
          aria-hidden="true"
        />
      </AppButton>
    </div>

    <AppDrawer
      ref="sheet"
      :open="sectionsOpen && isPhone"
      :title="navLabel"
      class="panel-sections-sheet"
      initial-focus="[aria-current='page']"
      @close="sectionsOpen = false"
    >
      <div class="panel-sections-sheet__body" @click.capture="leaveSheet">
        <AreaSections :nav-label="navLabel" :groups="groups" foot-class="panel-foot--sheet">
          <slot name="foot" />
        </AreaSections>
      </div>
    </AppDrawer>

    <main class="panel-main">
      <div v-if="$slots.notice" class="panel-main__notice"><slot name="notice" /></div>
      <RouterView />
    </main>
  </div>
</template>

<script lang="ts" setup>
import { useMediaQuery } from '@vueuse/core'
import { computed, provide, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useBreakpoints, useLastCatalog, usePageMeta } from '@/composables'

import AreaSections, { type AreaGroup } from '@/layouts/AreaSections.vue'
import BrandLogo from '@/layouts/BrandLogo.vue'
import { FRAME_HAS_RAIL } from '@/layouts/frame'

import AppButton from '@/components/ui/AppButton.vue'
import AppDrawer from '@/components/ui/AppDrawer.vue'

const props = defineProps<{
  title: string
  navLabel: string
  groups: AreaGroup[]
}>()

const route = useRoute()
const router = useRouter()

provide(FRAME_HAS_RAIL, false)
const lastCatalog = useLastCatalog()
const isPhone = useMediaQuery(useBreakpoints.isPhone)

usePageMeta(() => ({ title: route.meta.title ?? props.title, description: props.title }))

const sectionsOpen = ref(false)
const sheet = ref<InstanceType<typeof AppDrawer> | null>(null)

const currentLabel = computed(
  () => props.groups.flatMap((group) => group.links).find((link) => link.name === route.name)?.label ?? props.title,
)

const leaveSheet = (event: MouseEvent) => {
  const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href]')
  if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target) return
  event.preventDefault()
  const target = link.getAttribute('href')!
  if (router.resolve(target).fullPath === route.fullPath) {
    sectionsOpen.value = false
    return
  }
  sheet.value?.closeThen(() => router.push(target))
}
</script>

<style lang="scss" scoped>
.panel {
  display: grid;
  height: 100%;
  grid-template-rows: auto 1fr;
  grid-template-columns: var(--area-side) 1fr;
  grid-template-areas:
    'bar bar'
    'nav main';
  overflow: hidden;
  background: var(--color-background-default);
}

.panel-bar {
  display: flex;
  grid-area: bar;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-8);
  background: var(--color-surface-default);
  border-bottom: 1px solid var(--color-border-default);

  &__title {
    margin: 0;
    padding-left: var(--space-4);
    border-left: 1px solid var(--color-border-strong);
    font-family: var(--font-family-body);
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-default);
  }

  &__back {
    margin-left: auto;
  }
}

.panel-side {
  display: flex;
  grid-area: nav;
  flex-direction: column;
  padding: var(--space-6) var(--space-4);
  overflow-y: auto;
  background: var(--color-surface-default);
  border-right: 1px solid var(--color-border-default);
}

.panel-sections-bar {
  display: none;
}

.panel-sections-sheet__body {
  padding-bottom: env(safe-area-inset-bottom);
}

.panel-main {
  grid-area: main;
  overflow-y: auto;

  :deep(.area-section) {
    max-width: var(--page-max);
    margin: 0 auto;
    padding: var(--space-8);
  }

  &__notice {
    max-width: var(--page-max);
    margin: 0 auto;
    padding: var(--space-8) var(--space-8) 0;
  }
}

@media (max-width: $bp-below-desktop-max) {
  .panel {
    grid-template-columns: var(--area-side-narrow) 1fr;
  }

  .panel-bar {
    padding: var(--space-3) var(--space-6);
  }

  .panel-main :deep(.area-section) {
    padding: var(--space-6);
  }

  .panel-main__notice {
    padding: var(--space-6) var(--space-6) 0;
  }
}

@media (max-width: $bp-phone-max) {
  .panel {
    grid-template-rows: auto auto 1fr;
    grid-template-columns: 1fr;
    grid-template-areas:
      'bar'
      'nav'
      'main';
  }

  .panel-bar {
    gap: var(--space-3);
    padding: var(--space-2) var(--space-4);

    &__brand {
      display: none;
    }

    &__back-long {
      @include visually-hidden;
    }

    &__title {
      padding-left: 0;
      border-left: none;
    }
  }

  .panel-side {
    display: none;
  }

  .panel-sections-bar {
    display: flex;
    grid-area: nav;
    padding: var(--space-2) var(--space-4);
    border-bottom: 1px solid var(--color-border-default);
    background: var(--color-surface-default);

    &__button {
      width: 100%;
      justify-content: space-between;
    }

    &__chevron {
      transition: transform var(--motion-transition-default);

      &.is-open {
        transform: rotate(180deg);
      }
    }
  }

  .panel-main :deep(.area-section) {
    padding: var(--space-4);
  }

  .panel-main__notice {
    padding: var(--space-4) var(--space-4) 0;
  }
}
</style>
