<template>
  <div class="area-section">
    <SectionHeader title="Este aparelho">
      Recarregar baixa o catálogo de novo, sem sair da conta. Limpar tira a conta deste aparelho.
    </SectionHeader>
    <AppNotice v-if="refreshFailed" text="Não deu pra recarregar o catálogo." retry @retry="refreshCatalog" />
    <div class="device">
      <AppButton size="md" :disabled="refreshing" @click="refreshCatalog">
        {{ refreshing ? 'Recarregando…' : 'Recarregar o catálogo' }}
      </AppButton>
      <AppButton size="md" @click="confirmOpen = true">Limpar os dados deste aparelho</AppButton>
    </div>

    <ConfirmModal
      v-model="confirmOpen"
      title="Limpar os dados deste aparelho?"
      description="Você sai da conta neste aparelho e o catálogo é baixado de novo. Sua escolha de formatos fica. Pra voltar, é só entrar com o link do e-mail."
      confirm-label="Limpar e sair"
      busy-label="Limpando…"
      :loading="clearing"
      @confirm="clearDevice"
      @cancel="confirmOpen = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useApi, useAuth, useToast, useUtils } from '@/composables'
import { PREFERENCES_STORE_ID, useBooksStore } from '@/stores'
import AppButton from '@/components/AppButton.vue'
import AppNotice from '@/components/AppNotice.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import SectionHeader from '@/components/SectionHeader.vue'

const route = useRoute()
const router = useRouter()
const { logout } = useAuth()
const toast = useToast()

const refreshing = ref(false)
const refreshFailed = ref(false)
const confirmOpen = ref(false)
const clearing = ref(false)

const fetchFresh = () => {
  useUtils().sendGtmEvent({ event: 'force_refresh', force_refresh_origin: route.fullPath })
  return useApi().fetchBooks(true)
}

const refreshCatalog = async () => {
  refreshing.value = true
  refreshFailed.value = false
  await fetchFresh()
  refreshing.value = false
  refreshFailed.value = !!useBooksStore().error
  if (!refreshFailed.value) toast.show('Catálogo atualizado.')
}

// Leaving the account is what the dialog promises: the session goes first, or pinia would write it back.
const clearDevice = async () => {
  clearing.value = true
  await logout()
  Object.keys(localStorage)
    .filter((key) => key !== PREFERENCES_STORE_ID)
    .forEach((key) => localStorage.removeItem(key))
  fetchFresh()
  confirmOpen.value = false
  clearing.value = false
  router.push('/')
}
</script>

<style lang="scss" scoped>
.device {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
</style>
