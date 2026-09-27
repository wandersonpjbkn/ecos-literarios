<template>
  <Transition name="fade">
    <AppButton v-if="isVisible" class="back-top" @click="backTop">
      <BaseIcon name="arrow-left" class="back-top__icon" aria-hidden="true" />
      Voltar ao topo
    </AppButton>
  </Transition>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useScroll } from '@vueuse/core'

import AppButton from '@/components/AppButton.vue'

const props = defineProps<{
  target: HTMLElement | null
}>()

const THRESHOLD = 300

const { y } = useScroll(() => props.target ?? window)

const isVisible = computed(() => y.value > THRESHOLD)

const backTop = () => {
  const el = props.target ?? window
  el.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style lang="scss" scoped>
// Secondary, not primary: the screen already has its one primary action.
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
