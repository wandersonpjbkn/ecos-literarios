<template>
  <div class="app-wrapper">
    <a href="#conteudo" class="skip-link">Ir para o conteúdo</a>
    <AppHeader />
    <AppSidebar v-if="!isPhone" />

    <main id="conteudo" ref="content" class="app-main" tabindex="-1">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <AppSidebar v-if="isPhone" />

    <BackTop :target="content" />
  </div>
</template>

<script lang="ts">
const scrollPositions = new Map<string, number>()
</script>

<script lang="ts" setup>
import { useMediaQuery } from '@vueuse/core'
import { defineAsyncComponent, nextTick, onUnmounted, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useBreakpoints } from '@/composables'

import AppHeader from '@/layouts/AppHeader.vue'
import { FRAME_HAS_RAIL } from '@/layouts/frame'

const AppSidebar = defineAsyncComponent(() => import('@/layouts/AppSidebar.vue'))
const BackTop = defineAsyncComponent(() => import('@/layouts/BackTop.vue'))

const route = useRoute()
const router = useRouter()
provide(FRAME_HAS_RAIL, true)
const isPhone = useMediaQuery(useBreakpoints.isPhone)

const content = ref<HTMLElement | null>(null)

const stopRemember = router.beforeEach((_, from) => {
  if (content.value) scrollPositions.set(from.fullPath, content.value.scrollTop)
})
onUnmounted(stopRemember)

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
