<template>
  <Transition name="fade">
    <AppButton v-if="isVisible" class="back-top" @click="backTop">
      <BaseIcon name="arrow-left" class="back-top__icon" aria-hidden="true" />
      Voltar ao topo
    </AppButton>
  </Transition>
</template>

<script lang="ts" setup>
import { useScroll } from '@vueuse/core'
import { computed } from 'vue'

import AppButton from '@/components/ui/AppButton.vue'

const THRESHOLD = 300

const props = defineProps<{
  target: HTMLElement | null
}>()

const { y } = useScroll(() => props.target ?? window)

const isVisible = computed(() => y.value > THRESHOLD)

const backTop = () => {
  const el = props.target ?? window
  el.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style lang="scss" scoped>
.back-top {
  position: fixed;
  right: var(--space-6);
  bottom: var(--space-6);
  z-index: var(--layer-back-top);
  box-shadow: var(--shadow-default);

  @media (max-width: $bp-phone-max) {
    right: var(--space-4);
    bottom: var(--above-tab-bar);
  }

  &__icon {
    transform: rotate(90deg);
  }
}
</style>
