<template>
  <EmptyState
    title-tag="h1"
    title="Não achamos essa página"
    text="O link pode ter chegado incompleto, ou a página mudou de endereço."
  >
    <AppButton :to="lastCatalog" variant="primary">Voltar ao catálogo</AppButton>
  </EmptyState>
</template>

<script lang="ts" setup>
import { useLastCatalog, usePageMeta } from '@/composables'
import AppButton from '@/components/ui/AppButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const lastCatalog = useLastCatalog()

usePageMeta({ title: 'Página não encontrada', description: 'Este endereço não existe no Ecos Literários.' })
</script>
