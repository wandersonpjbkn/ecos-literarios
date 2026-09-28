<template>
  <p class="visually-hidden" role="status" aria-live="polite">{{ spoken }}</p>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, ref, watch } from 'vue'

// Reads a result aloud once the typing stops, so a screen reader hears "12 de 87 livros", not every keystroke.
const props = withDefaults(defineProps<{ text: string; delay?: number }>(), { delay: 700 })

const spoken = ref('')
let timer: ReturnType<typeof setTimeout> | undefined

watch(
  () => props.text,
  (text) => {
    clearTimeout(timer)
    timer = setTimeout(() => (spoken.value = text), props.delay)
  },
)

onBeforeUnmount(() => clearTimeout(timer))
</script>
