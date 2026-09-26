<template>
  <BasePill
    :as="isExternal ? 'a' : isLink ? RouterLink : 'button'"
    :to="isLink ? to : undefined"
    v-bind="externalAttrs"
    :type="isLink || isExternal ? undefined : type"
    :disabled="disabled || undefined"
    :tone="TONE[variant]"
    :size="size"
    class="app-button"
  >
    <slot />
    <span v-if="isExternal" class="visually-hidden">{{ EXTERNAL_NOTE }}</span>
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
    // Outside the app (WhatsApp, stores): opens in a new tab.
    href?: string
    type?: 'button' | 'submit'
    disabled?: boolean
  }>(),
  { variant: 'secondary', size: 'lg', to: undefined, href: undefined, type: 'button', disabled: false },
)

// A disabled destination renders as a disabled button: a link cannot be disabled.
const isLink = computed(() => !!props.to && !props.disabled)
const isExternal = computed(() => !!props.href && !props.disabled)
// Only for external links: an explicit href="undefined" would override the one RouterLink builds (no href, no Tab).
const externalAttrs = computed(() =>
  isExternal.value ? { href: props.href, target: '_blank', rel: 'noopener noreferrer' } : {},
)
// Leading space: without it a screen reader hears the label and the note as one word.
const EXTERNAL_NOTE = ' (abre em outra aba)'
</script>
