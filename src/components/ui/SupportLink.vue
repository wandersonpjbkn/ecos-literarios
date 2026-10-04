<template>
  <AppButton v-if="help && pill" variant="ghost" :href="help">
    <BaseIcon name="whatsapp" aria-hidden="true" />
    <slot>Falar com o suporte</slot>
  </AppButton>
  <a v-else-if="help" :href="help" target="_blank" rel="noopener noreferrer">
    <BaseIcon name="whatsapp" aria-hidden="true" />
    <slot>Falar com o suporte</slot>
    <span class="visually-hidden"> (abre em outra aba)</span>
  </a>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useAuthStore } from '@/stores'

import { helpLink } from '@/composables/useSupport'

import AppButton from '@/components/ui/AppButton.vue'

const props = withDefaults(
  defineProps<{
    email?: string | null
    pill?: boolean
  }>(),
  { email: undefined, pill: false },
)

const auth = useAuthStore()

const help = computed(() => helpLink(props.email === undefined ? auth.user?.email : props.email))
</script>
