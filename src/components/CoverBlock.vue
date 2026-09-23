<template>
  <div class="cover-block" :style="tintVars">
    <span class="cover-block__title">{{ title }}</span>
    <span v-if="!showImage" class="cover-block__missing">sem capa</span>

    <img v-if="showImage" :src="coverUrl" alt="" class="cover-block__img" loading="lazy" @error="imageFailed = true" />

    <span v-if="badge" class="cover-block__badge">{{ badge }}</span>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

import { useCategoryColors } from '@/composables'

const props = defineProps<{
  title: string
  genre?: string
  format?: string
  coverUrl?: string
}>()

const BADGED_FORMATS = ['Mangá', 'HQ']

const imageFailed = ref(false)
watch(
  () => props.coverUrl,
  () => (imageFailed.value = false),
)

const tintVars = computed(() => {
  const tint = useCategoryColors().coverTint(props.genre)
  return {
    '--tint-bg': `var(--tint-${tint}-bg)`,
    '--tint-line': `var(--tint-${tint}-line)`,
    '--tint-ink': `var(--tint-${tint}-ink)`,
  }
})
const showImage = computed(() => !!props.coverUrl && !imageFailed.value)
const badge = computed(() => (props.format && BADGED_FORMATS.includes(props.format) ? props.format : null))
</script>

<style lang="scss" scoped>
.cover-block {
  position: relative;

  display: flex;
  height: 206px;
  padding: var(--space-5) var(--space-3);
  overflow: hidden;

  align-items: center;
  justify-content: center;
  text-align: center;

  background: var(--tint-bg);
  border: 1px solid var(--tint-line);
  border-radius: var(--radius-md);

  @media (min-width: 768px) {
    height: 212px;
  }

  &__title {
    display: -webkit-box;
    overflow: hidden;

    font: {
      size: 0.875rem;
      weight: 600;
    }
    line-height: 1.3;
    color: var(--tint-ink);

    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;

    @media (min-width: 768px) {
      font-size: 0.9375rem;
    }
  }

  &__missing {
    position: absolute;
    bottom: var(--space-2);
    left: 50%;
    transform: translateX(-50%);

    font-size: 0.6875rem;
    letter-spacing: 0.02em;
    color: var(--tint-ink);
    white-space: nowrap;
  }

  &__img {
    position: absolute;
    inset: 0;

    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__badge {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);

    padding: var(--space-1) var(--space-2);

    font: {
      size: 0.6875rem;
      weight: 600;
    }
    line-height: 1;
    color: var(--color-text-default);

    background: var(--color-surface-default);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-pill);
  }
}
</style>
