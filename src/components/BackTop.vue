<template>
  <Transition name="fade">
    <aside
      v-if="isVisible"
      class="back-top"
      aria-label="Voltar ao topo"
      role="button"
      tabindex="0"
      @click="backTop"
      @keydown.enter="backTop"
      @keydown.space.prevent="backTop"
    >
      <BaseIcon name="arrow-left" class="back-top-icon" aria-hidden="true" />
    </aside>
  </Transition>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useScroll } from '@vueuse/core'

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
.back-top {
  $size: 3rem;

  position: fixed;
  right: 3rem;
  bottom: 1rem;
  z-index: 10;

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: var(--color-action-default);
  border: none;
  border-radius: var(--border-radius-default);
  width: $size;
  height: $size;
  cursor: pointer;

  @media (max-width: 767px) {
    $size-mobile: 44px;

    right: 1rem;
    bottom: 4rem;

    width: $size-mobile;
    height: $size-mobile;
  }

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  &-icon {
    $size: 1.5rem;

    width: $size;
    height: $size;

    color: var(--color-surface-default);

    transform: rotate(90deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--motion-transition-default);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
