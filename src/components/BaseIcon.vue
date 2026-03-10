<template>
  <component :is="dynamicIcon" v-if="dynamicIcon" v-bind="$attrs" />
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent } from 'vue'

const props = defineProps<{
  name: string
}>()

const dynamicIcon = computed(() => {
  if (!props.name) return null

  return defineAsyncComponent(() => import(`@/assets/icons/${props.name}.svg`))
})
</script>
