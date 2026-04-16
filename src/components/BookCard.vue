<template>
  <div class="book-card-wrap">
    <RouterLink
      :to="{
        name: 'catalog-book-details',
        params: { id: book.id },
      }"
      class="book-card"
      :class="`cat-${slugify(book.categoria)}`"
      :aria-label="`${book.titulo}, ${book.autor}`"
    >
      <!-- Cover -->
      <div class="card-cover" :style="{ '--accent': categoryColor }">
        <img
          v-if="book.cover_url"
          :src="book.cover_url"
          :alt="`Capa de ${book.titulo}`"
          class="card-cover__img"
          loading="lazy"
        />
        <div v-else class="card-cover__fallback" aria-hidden="true">
          <BaseIcon name="book" class="card-cover__fallback-icon" />
        </div>

        <!-- Active filter match badges -->
        <TransitionGroup v-if="matchTags.length" name="match-tag" tag="div" class="card-match-tags is-inline">
          <span v-for="tag in matchTags.slice(0, 2)" :key="tag" class="card-match-tag">
            {{ tag }}
          </span>
          <span v-if="matchTags.length > 2" :key="'more'" class="card-match-tag card-match-tag--more">
            +{{ matchTags.length - 2 }}
          </span>
        </TransitionGroup>
      </div>

      <!-- Basic info -->
      <div class="card-info">
        <h3 class="card-title">{{ book.titulo }}</h3>
        <p class="card-author">{{ book.autor }}</p>
      </div>
    </RouterLink>

    <!-- Info button — outside RouterLink to prevent navigation on click -->
    <button
      class="card-info-btn"
      type="button"
      :aria-label="`Ver detalhes de ${book.titulo}`"
      @click.stop="emit('detail', book)"
    >
      <BaseIcon name="info" aria-hidden="true" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useCategoryColors, useUtils } from '@/composables'
import type { Book, Options } from '@/types'

const props = defineProps<{
  book: Book
  activeFilters?: Options
}>()

const emit = defineEmits<{
  detail: [book: Book]
}>()

const colors = useCategoryColors()
const { slugify } = useUtils()

const categoryColor = computed(() => colors.categoryColor(props.book.categoria))

// Tags of active filters that match this book
const matchTags = computed(() => {
  const f = props.activeFilters
  if (!f) return []

  const tags: string[] = []

  if (f.midia?.includes(props.book.midia)) tags.push(props.book.midia)
  if (f.categoria?.includes(props.book.categoria)) tags.push(props.book.categoria)
  if (f.quem?.includes(props.book.quem)) tags.push(props.book.quem)

  const matchedSubs = f.subgeneros?.filter((sg) => props.book.subgenerosArr?.includes(sg)) ?? []
  tags.push(...matchedSubs)

  return tags
})
</script>

<style lang="scss" scoped>
.book-card-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.book-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  text-decoration: none;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  box-shadow: var(--shadow-sm);
  transition:
    transform var(--motion-transition-default),
    box-shadow var(--motion-transition-default),
    border-color var(--motion-transition-default);

  @media (min-width: 768px) {
    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
      border-color: rgba(var(--color-action-default-rgb), 0.22);

      .card-cover__img {
        transform: scale(1.03);
      }
    }
  }

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 3px;
  }
}

.card-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  flex-shrink: 0;

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform var(--motion-transition-default);
  }

  &__fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent);
  }

  &__fallback-icon {
    width: 2.5rem;
    height: 2.5rem;
    color: rgba(255, 255, 255, 0.55);
  }
}

.card-match-tags {
  position: absolute;
  top: 0.75rem;
  left: 0.5rem;
  right: 2.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  pointer-events: none;

  @media (max-width: 767px) {
    top: 0.65rem;
  }
}

.card-match-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  width: fit-content;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  backdrop-filter: blur(4px);
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;

  &--more {
    background: rgba(0, 0, 0, 0.4);
  }
}

.card-info {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-title {
  margin: 0;
  font-family: var(--font-family-display);
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-text-default);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-author {
  margin: 0;
  font-size: 0.78rem;
  color: var(--color-text-subtle);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-info-btn {
  $color: rgba(0, 0, 0, 0.35);

  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  height: fit-content;
  padding: 0;
  border: none;
  border-radius: 50%;
  background-color: #{$color};
  color: #fff;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: transform var(--motion-transition-default);
  overflow: hidden;

  &:hover {
    transform: scale(1.1);
  }

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  svg {
    $size: 1.75rem;

    width: $size;
    height: $size;
    background-color: rgba(#000, 0);
    border-radius: 50%;
    overflow: hidden;
  }
}

.match-tag-enter-active,
.match-tag-leave-active {
  transition: all var(--motion-transition-default);
}
.match-tag-enter-from,
.match-tag-leave-to {
  opacity: 0;
  transform: scale(0.85);
}
</style>
