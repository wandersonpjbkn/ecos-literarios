<template>
  <Transition name="fade">
    <aside v-if="isVisible" class="back-top">
      <BaseIcon name="arrow-left" class="back-top-icon" @click="backTop" />
    </aside>
  </Transition>
</template>

<script lang="ts" setup>
import { ref, onUnmounted, watch } from 'vue'

const props = defineProps<{
  target: HTMLElement | null
}>()

const isVisible = ref(false)
const THRESHOLD = 300

const handleScroll = () => {
  const scrollTop = props.target ? props.target.scrollTop : window.scrollY || document.documentElement.scrollTop

  isVisible.value = scrollTop > THRESHOLD
}

const backTop = () => {
  const target = props.target || window
  target.scrollTo({ top: 0, behavior: 'smooth' })
}

const updateListener = (newTarget: HTMLElement | null | undefined, oldTarget: HTMLElement | null | undefined) => {
  const oldEl = oldTarget || window
  oldEl.removeEventListener('scroll', handleScroll)

  const newEl = newTarget || window
  newEl.addEventListener('scroll', handleScroll)
}

watch(
  () => props.target,
  (newVal, oldVal) => {
    updateListener(newVal, oldVal)
  },
  { immediate: true },
)

onUnmounted(() => {
  const el = props.target || window
  el.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="scss" scoped>
.back-top {
  $size: 3rem;

  position: fixed;
  right: 2rem;
  bottom: 1rem;
  z-index: 100;

  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  width: $size;
  height: $size;

  &-icon {
    width: inherit;
    height: inherit;
    color: var(--accent);
    cursor: pointer;
    transform: rotate(90deg);
  }
}

// Estilo para a transição de fade
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
