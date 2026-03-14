<template>
  <div class="books-grid-wrap">
    <TransitionGroup v-if="books.length > 0" name="grid" tag="div" class="books-grid">
      <BookCard v-for="book in books" :key="book.id" :book="book" />
    </TransitionGroup>

    <div v-else class="empty-state">
      <BaseIcon name="book" aria-hidden="true" />
      <p>{{ emptyMessage }}</p>
      <button class="retry-btn" @click="emit('clear')">
        Limpar filtros
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BookCard from '@/components/BookCard.vue'
import type { Book } from '@/types'

withDefaults(
  defineProps<{
    books: Book[]
    emptyMessage?: string
  }>(),
  {
    emptyMessage: 'Nenhum título encontrado com estes filtros.',
  },
)

const emit = defineEmits<{ clear: [] }>()
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

@media (max-width: 767px) {
  .books-grid {
    grid-template-columns: 1fr;
  }
}
</style>
