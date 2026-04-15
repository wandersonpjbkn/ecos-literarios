<template>
  <component :is="dynamicIcon" v-if="dynamicIcon" class="base-icon" v-bind="$attrs" />
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent } from 'vue'

const props = defineProps<{
  name: // UI
    | 'arrow-left'
    | 'arrow-right'
    | 'book'
    | 'checkbox'
    | 'check'
    | 'chevron'
    | 'info'
    | 'error'
    | 'filter'
    | 'funil'
    | 'home'
    | 'link'
    | 'menu'
    | 'pencil'
    | 'plus'
    | 'reload'
    | 'search'
    | 'times'
    | 'trash'
    | 'user'
    // brands
    | 'amazon'
    | 'chrome'
    | 'youtube'
}>()

const dynamicIcon = computed(() => {
  if (!props.name) return null
  return defineAsyncComponent(() => import(`@/assets/icons/${props.name}.svg`))
})
</script>
