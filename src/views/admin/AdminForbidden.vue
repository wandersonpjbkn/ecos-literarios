<template>
  <EmptyState title-tag="h1" title="Sem permissão" :text="reason">
    <AppButton :to="lastCatalog" variant="primary">Voltar ao catálogo</AppButton>
    <AppButton v-if="auth.isEditor" :to="{ name: 'admin-books' }">Voltar ao painel</AppButton>
    <AppButton v-else-if="accessRequest" :href="accessRequest">
      <BaseIcon name="whatsapp" aria-hidden="true" />
      Pedir a liberação
    </AppButton>
  </EmptyState>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useAuthStore } from '@/stores'

import { accessRequestLink, useLastCatalog, usePageMeta } from '@/composables'

import AppButton from '@/components/ui/AppButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const route = useRoute()

const auth = useAuthStore()

const lastCatalog = useLastCatalog()

const accessRequest = computed(() =>
  auth.user
    ? accessRequestLink(
        auth.user.email,
        route.query.motivo === 'adicionar' ? 'adicionar livros' : 'usar o painel do clube',
      )
    : null,
)

const reason = computed(() => {
  if (route.query.motivo === 'adicionar') return 'Adicionar livros é para Administrador e Editor.'
  return auth.isEditor
    ? 'Esta parte do painel é só para Administrador.'
    : 'O painel do clube é para Administrador e Editor.'
})

usePageMeta({ title: 'Sem permissão', description: 'Esta parte do painel não está aberta para o seu nível.' })
</script>
