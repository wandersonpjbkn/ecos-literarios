<template>
  <div class="app-wrapper">
    <!-- Tab order follows the screen: top bar, then navigation, then the content; this link jumps straight there. -->
    <a href="#conteudo" class="skip-link">Ir para o conteúdo</a>
    <AppHeader />
    <AppSidebar />

    <main id="conteudo" ref="content" class="app-main" tabindex="-1">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <BackTop :target="content" />
  </div>
</template>

<script lang="ts">
// Module scope: the scroll places survive a visit to an area frame (panel, Minha conta), which unmounts this one.
const scrollPositions = new Map<string, number>()
</script>

<script lang="ts" setup>
import { defineAsyncComponent, nextTick, onUnmounted, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppHeader from '@/layouts/AppHeader.vue'
import { FRAME_HAS_RAIL } from '@/layouts/frame'

const AppSidebar = defineAsyncComponent(() => import('@/layouts/AppSidebar.vue'))
const BackTop = defineAsyncComponent(() => import('@/layouts/BackTop.vue'))

// The frame of the reading screens (catalog, book, Meus livros, login): rail, top bar and the scrolling <main>.
const route = useRoute()
const router = useRouter()
// The rail sits at the left edge: a drawer opens beside it.
provide(FRAME_HAS_RAIL, true)

const content = ref<HTMLElement | null>(null)

const stopRemember = router.beforeEach((_, from) => {
  if (content.value) scrollPositions.set(from.fullPath, content.value.scrollTop)
})
onUnmounted(stopRemember)

// Path only: filters live in the query, and toggling one must not scroll the catalog back to the top.
watch(
  () => route.path,
  async () => {
    await nextTick()
    setTimeout(() => {
      if (!content.value) return
      const saved = scrollPositions.get(route.fullPath)
      if (saved !== undefined) content.value.scrollTo({ top: saved, behavior: 'instant' })
      else content.value.scrollTo({ top: 0, behavior: 'smooth' })
    }, 350)
  },
  // Also on mount: coming back from an area frame remounts this layout on a path it already knows.
  { immediate: true },
)
</script>

<style lang="scss" scoped>
.app-wrapper {
  display: grid;
  height: 100%;
  grid-template-rows: auto 1fr;
  grid-template-columns: auto 1fr;
  overflow: hidden;

  :deep(.app-sidebar) {
    grid-row: 1 / 3;
  }

  :deep(.app-header) {
    grid-column: 2 / 3;
  }

  @media (max-width: $bp-phone-max) {
    grid-template-rows: auto 1fr auto;
    grid-template-columns: 1fr;

    :deep(.app-sidebar) {
      grid-row: 3 / 4;
    }

    :deep(.app-header) {
      grid-row: 1 / 2;
      grid-column: 1 / 2;
    }
  }
}

.app-main {
  width: auto;
  overflow-y: auto;

  &:focus {
    outline: none;
  }
}

.skip-link {
  position: fixed;
  top: var(--space-2);
  left: var(--space-2);
  z-index: var(--layer-skip-link);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-pill);
  background: var(--color-surface-default);
  color: var(--color-action-default);
  font-weight: var(--font-weight-semibold);
  transform: translateY(-200%);

  &:focus {
    transform: none;
  }
}
</style>
