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
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { Head } from '@unhead/vue/components'

import { useAuth } from '@/composables'
import { startFormatsSync } from '@/composables/formatsSync'
import { startAccountSync } from '@/composables/accountSync'
import { useRouteFocus } from '@/composables/useRouteFocus'
import AuthLayout from '@/layouts/AuthLayout.vue'
import ReadingLayout from '@/layouts/ReadingLayout.vue'
import UpdateNotification from '@/layouts/UpdateNotification.vue'
import AppToast from '@/layouts/AppToast.vue'

const route = useRoute()
useRouteFocus()
const { restoreSession, watchSession } = useAuth()

useHead({
  htmlAttrs: { lang: 'pt-BR' },
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

let stopWatchSession: (() => void) | null = null
let stopAccount: (() => void) | null = null

onMounted(async () => {
  stopWatchSession = watchSession()
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
