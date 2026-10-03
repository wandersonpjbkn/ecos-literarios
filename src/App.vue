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

    <BookFormDrawer
      :book="bookForm.book.value"
      :title="bookForm.title.value"
      :focus="bookForm.focus.value"
      :return-focus="bookForm.returnFocus.value"
      :is-open="bookForm.isOpen.value"
      @close="bookForm.close"
      @saved="onBookSaved"
      @removed="onBookRemoved"
    />

    <UpdateNotification />
    <AppToast />
  </div>
</template>

<script lang="ts" setup>
import { useHead } from '@unhead/vue'
import { Head } from '@unhead/vue/components'
import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore, usePermissionsStore } from '@/stores'

import { useApi, useAuth, useBookForm, useToast } from '@/composables'
import { startAccountSync } from '@/composables/accountSync'
import { startCatalogSync } from '@/composables/catalogSync'
import { startFormatsSync } from '@/composables/formatsSync'
import { useRouteFocus } from '@/composables/useRouteFocus'

import AppToast from '@/layouts/AppToast.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import ReadingLayout from '@/layouts/ReadingLayout.vue'
import UpdateNotification from '@/layouts/UpdateNotification.vue'

import BookFormDrawer from '@/components/books/BookFormDrawer.vue'

const route = useRoute()
const router = useRouter()
useRouteFocus()
const { restoreSession, watchSession } = useAuth()
const toast = useToast()
const bookForm = useBookForm()

// The catalog is one list for every screen; a screen with a list of its own reacts to bookForm.lastChange.
const onBookSaved = () => {
  useApi().fetchBooks()
  bookForm.notify({ kind: 'saved' })
}
const onBookRemoved = (id: string) => {
  useApi().fetchBooks()
  bookForm.notify({ kind: 'removed', id })
}
// The form belonged to the screen that opened it: going to another page closes it, as before.
watch(
  () => route.path,
  () => bookForm.close(),
)

// "Adicionar" anywhere is this screen with ?adicionar=1 (useAddTarget): the form opens over it, also back from login.
const auth = useAuthStore()
const permissions = usePermissionsStore()
watch(
  [() => route.query.adicionar, () => auth.isLoggedIn, () => permissions.mine],
  ([asked, signedIn, matrix]) => {
    // Signed out, the link went to the login; signed in, the matrix may still be on its way.
    if (asked !== '1' || !signedIn || !matrix) return
    if (!permissions.can('books', 'create')) {
      // The page says why and how to ask for access, which a passing notice could not.
      router.replace({ name: 'admin-forbidden', query: { motivo: 'adicionar' } })
      return
    }
    // Open only once ?adicionar=1 left the URL: else the form's history entry keeps it, and a later back reopens the form.
    router.replace({ query: { ...route.query, adicionar: undefined } }).then(() => bookForm.openAdd())
  },
  { immediate: true },
)

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
