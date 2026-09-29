<template>
  <!-- dynamic page class -->
  <Head>
    <bodyAttrs :class="[useRoute().meta.pageClass, `page-${useRoute().name as string}`]" />
  </Head>
  <div class="app-root">
    <!-- Areas (panel, Minha conta) are route components with their own frame; entering has its own; the rest reads. -->
    <RouterView v-if="route.meta.frame === 'area'" v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
    <AuthLayout v-else-if="route.meta.frame === 'auth'" />
    <ReadingLayout v-else />

    <UpdateNotification />
    <AppToast />
  </div>
</template>

<script lang="ts" setup>
import { useHead } from '@unhead/vue'
import { Head } from '@unhead/vue/components'
import { onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuth, useToast } from '@/composables'
import { startAccountSync } from '@/composables/accountSync'
import { startCatalogSync } from '@/composables/catalogSync'
import { startFormatsSync } from '@/composables/formatsSync'
import { useRouteFocus } from '@/composables/useRouteFocus'

import AppToast from '@/layouts/AppToast.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import ReadingLayout from '@/layouts/ReadingLayout.vue'
import UpdateNotification from '@/layouts/UpdateNotification.vue'

const route = useRoute()
const router = useRouter()
useRouteFocus()
const { restoreSession, watchSession } = useAuth()
const toast = useToast()

useHead({
  htmlAttrs: { lang: 'pt-BR' },
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

let stopWatchSession: (() => void) | null = null
let stopAccount: (() => void) | null = null
let stopCatalog: (() => void) | null = null

onMounted(async () => {
  stopWatchSession = watchSession(async (reason) => {
    toast.show(reason === 'suspended' ? 'Esta conta está suspensa.' : 'Sua sessão venceu. Entre de novo.')
    // The first navigation may still be resolving: the page it lands on decides, not the blank start.
    await router.isReady()
    const current = router.currentRoute.value
    if (!current.meta.signedIn) return
    // A suspended account has no login to go back to; the catalog stays open to anyone.
    if (reason === 'suspended') router.replace('/')
    else router.replace({ name: 'auth-login', query: { voltar: current.fullPath } })
  })
  // Public: the catalog does not wait for the session.
  stopCatalog = startCatalogSync()
  // A returning visit may carry an expired token: the account is read only after Supabase has refreshed it.
  await restoreSession()
  const formats = startFormatsSync()
  const stopAccountSync = startAccountSync(formats)
  stopAccount = () => {
    stopAccountSync()
    formats.stop()
  }
})

onUnmounted(() => {
  stopWatchSession?.()
  stopAccount?.()
  stopCatalog?.()
})
</script>

<style lang="scss" scoped>
.app-root {
  height: 100dvh;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--motion-transition-default);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
