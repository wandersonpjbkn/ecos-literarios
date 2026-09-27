<template>
  <AreaLayout title="Minha conta" nav-label="Seções da conta" :groups="GROUPS">
    <template #foot>
      <!-- The way to the other area sits last, where the panel keeps "Minha conta": the same spot never signs out. -->
      <button type="button" class="area-link area-link--leave" @click="handleLogout">
        <BaseIcon name="sign-out" aria-hidden="true" />
        Sair da conta
      </button>
      <RouterLink v-if="authStore.isEditor" :to="{ name: 'admin-books' }" class="area-link">Painel do clube</RouterLink>
    </template>
  </AreaLayout>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

import { useAuth } from '@/composables'
import { useAuthStore } from '@/stores'
import AreaLayout from '@/layouts/AreaLayout.vue'
import type { AreaGroup } from '@/layouts/AreaSections.vue'

// Same frame as the club panel (estudo-moldura.md): each part has its own address.
const GROUPS: AreaGroup[] = [
  {
    title: 'Conta',
    links: [
      { name: 'account-you', label: 'Você' },
      { name: 'account-formats', label: 'O que você quer ver' },
      { name: 'account-claim', label: 'Seu nome no grupo' },
      { name: 'account-device', label: 'Este aparelho' },
    ],
  },
]

const router = useRouter()
const authStore = useAuthStore()
const { logout } = useAuth()

const handleLogout = async () => {
  await logout()
  router.push('/')
}
</script>
