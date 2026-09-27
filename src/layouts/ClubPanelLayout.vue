<template>
  <AreaLayout title="Painel do clube" nav-label="Seções do painel" :groups="visibleGroups">
    <template v-if="permissions.failed" #notice>
      <AppNotice
        text="Não deu pra carregar o que você pode fazer no painel. Tente de novo."
        retry
        @retry="retryAccountSync"
      />
    </template>
    <template #foot>
      <RouterLink :to="{ name: 'profile-account' }" class="area-link">Minha conta</RouterLink>
    </template>
  </AreaLayout>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { retryAccountSync } from '@/composables/accountSync'
import { useAuthStore, usePermissionsStore } from '@/stores'
import AppNotice from '@/components/AppNotice.vue'
import AreaLayout from '@/layouts/AreaLayout.vue'
import type { AreaGroup } from '@/layouts/AreaSections.vue'

const GROUPS: AreaGroup[] = [
  {
    title: 'Acervo',
    links: [
      { name: 'admin-books', label: 'Livros' },
      { name: 'admin-entities', label: 'Autores e gêneros' },
      { name: 'admin-enrichment', label: 'Capas e sinopses' },
    ],
  },
  {
    title: 'Pessoas',
    links: [
      { name: 'admin-members', label: 'Membros' },
      { name: 'admin-permissions', label: 'Permissões' },
      { name: 'admin-claims', label: 'Histórico de vínculos' },
    ],
  },
]

const router = useRouter()
const authStore = useAuthStore()
const permissions = usePermissionsStore()

// Admin-only comes from the route (adminRoute), so the menu never offers what the guard would refuse.
const isOpenToMe = (name: string) => !router.resolve({ name }).meta.adminOnly || authStore.isAdmin

const visibleGroups = computed(() =>
  GROUPS.map((group) => ({ ...group, links: group.links.filter((link) => isOpenToMe(link.name)) })).filter(
    (group) => group.links.length > 0,
  ),
)
</script>
