<template>
  <!-- The official file from the Google Books branding guidelines, unaltered: never redraw it. -->
  <img :src="logo" alt="" class="powered-by-google" width="62" height="30" />
</template>

<script lang="ts" setup>
import logo from '@/assets/brand/powered-by-google.png'
</script>

<style lang="scss" scoped>
.powered-by-google {
  flex-shrink: 0;
}
</style>
