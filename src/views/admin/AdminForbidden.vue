<template>
  <!-- The same message as "página não encontrada": an EmptyState with the page's h1 and the way out. -->
  <EmptyState title-tag="h1" title="Sem permissão" :text="reason">
    <AppButton :to="lastCatalog" variant="primary">Voltar ao catálogo</AppButton>
    <!-- An Editor who opened an admin-only section by link keeps a way back to the panel they can use. -->
    <AppButton v-if="auth.isEditor" :to="{ name: 'admin-books' }">Voltar ao painel</AppButton>
  </EmptyState>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useAuthStore } from '@/stores'

import { useLastCatalog, usePageMeta } from '@/composables'

import AppButton from '@/components/ui/AppButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const route = useRoute()

const auth = useAuthStore()

const lastCatalog = useLastCatalog()

usePageMeta({ title: 'Sem permissão', description: 'Esta parte do painel não está aberta para o seu nível.' })

// Why this person is here: "Adicionar" as a Membro, an admin-only section as an Editor, or the panel itself.
const reason = computed(() => {
  if (route.query.motivo === 'adicionar') return 'Adicionar livros é para Administrador e Editor.'
  return auth.isEditor
    ? 'Esta parte do painel é só para Administrador.'
    : 'O painel do clube é para Administrador e Editor.'
})
</script>
