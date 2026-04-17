<template>
  <!-- dynamic page class -->
  <Head>
    <bodyAttrs :class="[useRoute().meta.pageClass, `page-${useRoute().name as string}`]" />
  </Head>
  <div class="app-wrapper">
    <!-- sidebar -->
    <AppSidebar
      :category-is-open="categorySidebar?.instance?.isOpen"
      :menu-is-open="preferencesSidebar?.instance?.isOpen"
      @toggle-categories="toggleCategories"
      @toggle-menu="togglePreferences"
    />

    <!-- header -->
    <AppHeader :menu-is-open="preferencesSidebar?.instance?.isOpen" @toggle-menu="togglePreferences" />

    <!-- content -->
    <main ref="content" class="app-main">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <!-- portal -->
    <aside id="sidebar" />

    <!-- categories sidebar -->
    <PanelCategories ref="categorySidebar" />

    <!-- preferences sidebar -->
    <PanelPreferences ref="preferencesSidebar" />

    <!-- back to top -->
    <BackTop :target="content" />

    <!-- update notification -->
    <UpdateNotification />
  </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import { Head } from '@unhead/vue/components'

import { useAuth } from '@/composables'
import AppHeader from '@/components/AppHeader.vue'
import UpdateNotification from '@/components/UpdateNotification.vue'

const AppSidebar = defineAsyncComponent(() => import('@/components/AppSidebar.vue'))
const PanelCategories = defineAsyncComponent(() => import('@/components/PanelCategories.vue'))
const PanelPreferences = defineAsyncComponent(() => import('@/components/PanelPreferences.vue'))
const BackTop = defineAsyncComponent(() => import('@/components/BackTop.vue'))

const route = useRoute()
const router = useRouter()
const { restoreSession, watchSession } = useAuth()

useHead({
  htmlAttrs: { lang: 'pt-BR' },
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const content = ref<HTMLElement | null>(null)
const preferencesSidebar = ref<InstanceType<typeof PanelPreferences> | null>(null)
const categorySidebar = ref<InstanceType<typeof PanelCategories> | null>(null)

const togglePreferences = () => preferencesSidebar.value?.instance?.toggle()
const toggleCategories = () => categorySidebar.value?.instance?.toggle()

const scrollPositions = new Map<string, number>()

router.beforeEach((_, from) => {
  if (content.value) {
    scrollPositions.set(from.fullPath, content.value.scrollTop)
  }
})

watch(route, async (to) => {
  await nextTick()
  setTimeout(() => {
    if (!content.value) return
    const saved = scrollPositions.get(to.fullPath)
    if (saved !== undefined) {
      content.value.scrollTo({ top: saved, behavior: 'instant' })
    } else {
      content.value.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, 350)
})

let stopWatchSession: (() => void) | null = null

onMounted(() => {
  restoreSession()
  stopWatchSession = watchSession()
})

onUnmounted(() => stopWatchSession?.())
</script>

<style lang="scss" scoped>
.app-wrapper {
  display: grid;
  height: 100dvh;

  grid-template-rows: 4rem 1fr;
  grid-template-columns: auto 1fr;
  overflow: hidden;

  :deep(.app-sidebar) {
    grid-row: 1 / 3;
  }

  :deep(.app-header) {
    grid-column: 2 / 3;
  }

  @media (max-width: 767px) {
    grid-template-rows: 3rem 1fr auto;
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
}

/* Route transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--motion-transition-default);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
