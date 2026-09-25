<template>
  <BasePill
    :as="isLink ? RouterLink : 'button'"
    :to="isLink ? to : undefined"
    :type="isLink ? undefined : type"
    :disabled="disabled || undefined"
    :tone="TONE[variant]"
    :size="size"
    class="app-button"
  >
    <slot />
  </BasePill>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

import BasePill, { type PillTone } from '@/components/BasePill.vue'

type Variant = 'primary' | 'secondary' | 'soft' | 'ghost'

// Button.md weights on the shared pill; "soft" is the action that opens more (Filtrar).
const TONE: Record<Variant, PillTone> = {
  primary: 'primary',
  secondary: 'neutral',
  soft: 'soft',
  ghost: 'ghost',
}

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: 'md' | 'lg'
    to?: RouteLocationRaw
    type?: 'button' | 'submit'
    disabled?: boolean
  }>(),
  { variant: 'secondary', size: 'lg', to: undefined, type: 'button', disabled: false },
)

// A disabled destination renders as a disabled button: a link cannot be disabled.
const isLink = computed(() => !!props.to && !props.disabled)
</script>
