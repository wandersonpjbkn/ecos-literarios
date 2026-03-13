<template>
  <component :is="dynamicIcon" v-if="dynamicIcon" v-bind="$attrs" />
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent } from 'vue'

type UIcons =
  // UI
  | 'arrow-left'
  | 'arrow-right'
  | 'book'
  | 'checkbox'
  | 'check'
  | 'chevron'
  | 'error'
  | 'filter'
  | 'funil'
  | 'search'
  | 'times'
  | 'user'
  // brand
  | 'amazon'
  | 'chrome'
  | 'youtube'

const props = defineProps<{
  name: UIcons
}>()

const dynamicIcon = computed(() => {
  if (!props.name) return null

  return defineAsyncComponent(() => import(`@/assets/icons/${props.name}.svg`))
})
</script>
