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

import BasePill, { type PillTone } from '@/components/ui/BasePill.vue'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'

const TONE: Record<Variant, PillTone> = {
  primary: 'primary',
  secondary: 'neutral',
  outline: 'outline',
  ghost: 'ghost',
  danger: 'danger',
}

const EXTERNAL_NOTE = ' (abre em outra aba)'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: 'md' | 'lg'
    to?: RouteLocationRaw
    href?: string
    type?: 'button' | 'submit'
    disabled?: boolean
  }>(),
  { variant: 'secondary', size: 'lg', to: undefined, href: undefined, type: 'button', disabled: false },
)

const isLink = computed(() => !!props.to && !props.disabled)
const isExternal = computed(() => !!props.href && !props.disabled)
const externalAttrs = computed(() =>
  isExternal.value ? { href: props.href, target: '_blank', rel: 'noopener noreferrer' } : {},
)
</script>

<style lang="scss" scoped>
@media (max-width: $bp-phone-max) {
  .app-button.pill--md {
    min-height: var(--touch-cta);
  }
}
</style>
