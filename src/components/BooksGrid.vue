<template>
  <div class="books-grid-wrap">
    <TransitionGroup v-if="books.length > 0" name="grid" tag="div" class="books-grid">
      <BookCard v-for="book in visibleBooks" :key="book.id" :book="book" />
    </TransitionGroup>

    <div v-else class="empty-state">
      <BaseIcon name="book" aria-hidden="true" />
      <p>{{ emptyMessage }}</p>
      <button class="retry-btn" @click="emit('clear')">Limpar filtros</button>
    </div>

    <!-- Sentinel: observado pelo IntersectionObserver para carregar mais -->
    <div v-if="hasMore" ref="sentinelRef" class="sentinel" aria-hidden="true" />

    <!-- Indicador discreto enquanto carrega o próximo lote -->
    <Transition name="loader">
      <div v-if="isLoading" class="load-indicator" aria-live="polite" aria-label="Carregando mais títulos">
        <span class="load-dot" />
        <span class="load-dot" />
        <span class="load-dot" />
      </div>
    </Transition>

    <!-- Contagem discreta ao chegar no fim -->
    <Transition name="loader">
      <p v-if="!hasMore && books.length > PAGE_SIZE" class="end-label">
        -- <i>FIM DA LISTA</i>: {{ books.length }} títulos encontrados --
      </p>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'

import BookCard from '@/components/BookCard.vue'
import type { Book } from '@/types'

const PAGE_SIZE = 24

const props = withDefaults(
  defineProps<{
    books: Book[]
    emptyMessage?: string
  }>(),
  {
    emptyMessage: 'Nenhum título encontrado com estes filtros.',
  },
)

const emit = defineEmits<{ clear: [] }>()

// ── Slice visível ─────────────────────────────
const visibleCount = ref(PAGE_SIZE)

const visibleBooks = computed(() => props.books.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < props.books.length)
const isLoading = ref(false)

// Ao mudar a lista (filtro aplicado), volta para o início
watch(
  () => props.books,
  () => {
    visibleCount.value = PAGE_SIZE
  },
)

// ── IntersectionObserver ──────────────────────
const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const loadMore = () => {
  if (!hasMore.value || isLoading.value) return
  isLoading.value = true

  // rAF para não bloquear o frame de scroll
  requestAnimationFrame(() => {
    visibleCount.value += PAGE_SIZE
    isLoading.value = false
  })
}

const connectObserver = (el: HTMLElement) => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) loadMore()
    },
    { rootMargin: '300px' }, // começa a carregar 300px antes do fim
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
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
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

// Sentinel invisível — só existe para ser observado
.sentinel {
  height: 1px;
  pointer-events: none;
}

// Três pontinhos animados
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

// Label discreta no fim da lista
.end-label {
  padding: 20px 0 8px;
  text-align: center;
  font-size: 0.82rem;
  color: var(--color-text-disabled);
  letter-spacing: 0.04em;
}

@media (max-width: 767px) {
  .books-grid {
    grid-template-columns: 1fr;
  }
}

// Transição do loader e end-label
.loader-enter-active,
.loader-leave-active {
  transition: opacity var(--motion-transition-default);
}
.loader-enter-from,
.loader-leave-to {
  opacity: 0;
}

/* Grid transitions */
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
