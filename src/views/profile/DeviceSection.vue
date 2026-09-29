<template>
  <div class="area-section">
    <SectionHeader title="Dados salvos" />
    <AppNotice v-if="refreshFailed" text="Não foi possível recarregar o catálogo." retry @retry="refreshCatalog" />
    <!-- Each action with what it does; clearing signs out, so it takes the weight of what has no way back (8e). -->
    <ul class="device panel-box width-column">
      <li class="device__row panel-row">
        <AppButton size="md" :disabled="refreshing" @click="refreshCatalog">
          {{ refreshing ? 'Recarregando…' : 'Recarregar o catálogo' }}
        </AppButton>
        <p class="device__what">Baixa o catálogo de novo. Você continua na conta.</p>
      </li>
      <li class="device__row panel-row">
        <AppButton variant="danger" size="md" @click="confirmOpen = true">Limpar os dados deste aparelho</AppButton>
        <p class="device__what">Sai da conta e baixa o catálogo de novo. Sua escolha de formatos fica.</p>
      </li>
    </ul>

    <ConfirmModal
      v-model="confirmOpen"
      destructive
      title="Limpar os dados deste aparelho?"
      description="Você sai da conta neste aparelho e o catálogo é baixado de novo. Sua escolha de formatos fica. Para voltar, entre de novo pelo link do e-mail."
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

import { PREFERENCES_STORE_ID, useBooksStore } from '@/stores'

import { useApi, useAuth, useToast, useUtils } from '@/composables'

import AppButton from '@/components/ui/AppButton.vue'
import AppNotice from '@/components/ui/AppNotice.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'

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
  return useApi().fetchBooks()
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
  margin: 0;
  padding: 0;
  list-style: none;

  &__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-4);
    padding-block: var(--space-3);
  }

  &__what {
    flex: 1 1 var(--field-basis-sm);
    margin: 0;
    font-size: var(--font-size-ui);
    color: var(--color-text-secondary);
  }
}
</style>
