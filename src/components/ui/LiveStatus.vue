<template>
  <p class="visually-hidden" role="status" aria-live="polite">{{ spoken }}</p>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, ref, watch } from 'vue'

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
