<template>
  <div class="books-grid-wrap">
    <TransitionGroup v-if="books.length > 0" name="grid" tag="div" class="books-grid">
      <BookCard
        v-for="book in visibleBooks"
        :key="book.id"
        :book="book"
        :active-filters="activeFilters"
        @detail="emit('detail', $event)"
      />
    </TransitionGroup>

    <div v-else class="empty-state">
      <BaseIcon name="book" aria-hidden="true" />
      <p>{{ emptyMessage }}</p>
      <button class="retry-btn" @click="emit('clear')">Limpar filtros</button>
    </div>

    <div v-if="hasMore" ref="sentinelRef" class="sentinel" aria-hidden="true" />

    <Transition name="loader">
      <div v-if="isLoading" class="load-indicator" aria-live="polite" aria-label="Carregando mais títulos">
        <span class="load-dot" />
        <span class="load-dot" />
        <span class="load-dot" />
      </div>
    </Transition>

    <Transition name="loader">
      <p v-if="!hasMore && books.length > pageSize" class="end-label">
        -- <i>FIM DA LISTA</i>: {{ books.length }} títulos encontrados --
      </p>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onBeforeUnmount } from 'vue'

import BookCard from '@/components/BookCard.vue'
import { useBooksGrid } from '@/composables'
import type { Book, Options } from '@/types'

const books = defineModel<Book[]>({ required: true })

withDefaults(
  defineProps<{
    emptyMessage?: string
    activeFilters?: Options
  }>(),
  {
    emptyMessage: 'Nenhum título encontrado com estes filtros.',
    activeFilters: undefined,
  },
)

const emit = defineEmits<{
  clear: []
  detail: [book: Book]
}>()

const { visibleBooks, hasMore, isLoading, pageSize, loadMore } = useBooksGrid(books)

const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const connectObserver = (el: HTMLElement) => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) loadMore()
    },
    { rootMargin: '300px' },
  )
  observer.observe(el)
}

watch(
  sentinelRef,
  (el) => {
    observer?.disconnect()
    if (el) connectObserver(el)
  },
  { immediate: true },
)

onBeforeUnmount(() => observer?.disconnect())
</script>

<style lang="scss" scoped>
.books-grid-wrap {
  position: relative;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;

  @media (max-width: 767px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.75rem;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 24px;
  color: var(--color-text-subtle);
  text-align: center;
  font-size: 1rem;
}

.retry-btn {
  border: none;
  padding: 10px 20px;
  border-radius: var(--border-radius-sm);
  min-height: 44px;
  font-family: var(--font-family-body);
  font-size: 1rem;
  cursor: pointer;
  background: var(--color-action-default);
  color: var(--color-surface-default);
  transition: opacity var(--motion-transition-default);

  &:hover {
    opacity: 0.85;
    background: var(--color-action-default-hover);
  }
  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }
}

.sentinel {
  height: 1px;
  pointer-events: none;
}

.load-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 24px 0 8px;
}

.load-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-border-strong);
  animation: bounce 0.9s ease-in-out infinite;

  &:nth-child(2) {
    animation-delay: 0.15s;
  }
  &:nth-child(3) {
    animation-delay: 0.3s;
  }
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  40% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

.end-label {
  padding: 20px 0 8px;
  text-align: center;
  font-size: 0.82rem;
  color: var(--color-text-disabled);
  letter-spacing: 0.04em;
}

.loader-enter-active,
.loader-leave-active {
  transition: opacity var(--motion-transition-default);
}
.loader-enter-from,
.loader-leave-to {
  opacity: 0;
}

.grid-enter-active {
  transition:
    opacity var(--motion-transition-default),
    transform var(--motion-transition-default);
}
.grid-enter-from {
  opacity: 0;
  transform: scale(0.96);
}
.grid-leave-active {
  transition: opacity var(--motion-transition-default);
  position: absolute;
}
.grid-leave-to {
  opacity: 0;
}
.grid-move {
  transition: transform var(--motion-transition-default);
}
</style>
