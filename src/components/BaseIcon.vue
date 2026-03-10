<template>
  <component :is="dynamicIcon" v-if="dynamicIcon" v-bind="$attrs" />
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent } from 'vue'

type icons =
  | 'arrow-left'
  | 'arrow-right'
  | 'book'
  | 'checkbox'
  | 'chevron'
  | 'error'
  | 'filter'
  | 'search'
  | 'times'
  | 'user'

const props = defineProps<{
  name: icons
}>()

const dynamicIcon = computed(() => {
  if (!props.name) return null

  return defineAsyncComponent(() => import(`@/assets/icons/${props.name}.svg`))
})
</script>
