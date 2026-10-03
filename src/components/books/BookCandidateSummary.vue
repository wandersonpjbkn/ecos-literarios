<template>
  <span class="candidate" :class="`candidate--${size}`">
    <img v-if="showImage" :src="candidate.cover_url" alt="" class="candidate__cover" @error="imageFailed = true" />
    <span v-else class="candidate__cover candidate__cover--none" aria-hidden="true">sem capa</span>
    <span class="candidate__about">
      <span class="candidate__title">{{ candidate.title }}</span>
      <span class="candidate__meta">{{ candidate.authors.join(', ') }}</span>
      <span v-if="facts" class="candidate__meta">{{ facts }}</span>
      <span v-if="language" class="candidate__language">{{ language }}</span>
    </span>
  </span>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

import { languageName } from '@/data/languages'
import type { BookCandidate } from '@/types'

const props = withDefaults(defineProps<{ candidate: BookCandidate; size?: 'list' | 'check' }>(), { size: 'list' })

const imageFailed = ref(false)
watch(
  () => props.candidate.cover_url,
  () => (imageFailed.value = false),
)
const showImage = computed(() => !!props.candidate.cover_url && !imageFailed.value)

const language = computed(() => languageName(props.candidate.language))
const facts = computed(() =>
  [
    props.candidate.publisher,
    props.candidate.published_year,
    props.size === 'check' && props.candidate.page_count && `${props.candidate.page_count} páginas`,
  ]
    .filter(Boolean)
    .join(' · '),
)
</script>

<style lang="scss" scoped>
.candidate {
  display: flex;
  gap: var(--space-3);
  min-width: 0;

  &__cover {
    flex-shrink: 0;
    width: var(--search-cover-w);
    height: var(--search-cover-h);
    border-radius: var(--radius-sm);
    object-fit: cover;

    .candidate--check & {
      width: var(--check-cover-w);
      height: var(--check-cover-h);
    }
  }

  &__cover--none {
    display: flex;
    align-items: flex-end;
    padding: var(--space-1);
    border: 1px solid var(--color-border-default);
    background: var(--color-background-subtle);
    font-size: var(--font-size-micro);
    color: var(--color-text-subtle);
  }

  &__about {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
    min-width: 0;
  }

  &__title {
    font-weight: var(--font-weight-semibold);
    overflow-wrap: anywhere;
  }

  &__meta {
    font-size: var(--font-size-caption);
    color: var(--color-text-secondary);
  }

  &__language {
    padding: 0 var(--space-2);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-pill);
    font-size: var(--font-size-caption);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-secondary);
  }
}
</style>
