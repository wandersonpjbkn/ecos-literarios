<template>
  <RouterLink :to="`/livro/${book.id}`" class="book-card">
    <!-- Color swatch based on category -->
    <div class="card-spine" :style="{ background: useCategoryColors().categoryColor(book.categoria) }"></div>

    <div class="card-body">
      <div class="card-meta-top">
        <span class="midia-badge" :class="useCategoryColors().midiaClass(book.midia)">{{ book.midia }}</span>
        <span class="categoria-tag">{{ book.categoria }}</span>
      </div>

      <h3 class="card-titulo">{{ book.titulo }}</h3>
      <p class="card-autor">{{ book.autor }}</p>

      <div v-if="book.subgenerosArr?.length" class="card-tags">
        <span v-for="tag in book.subgenerosArr.slice(0, 3)" :key="tag" class="sub-tag">{{ tag }}</span>
      </div>

      <div class="card-footer">
        <span v-if="book.quem" class="quem-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {{ book.quem }}
        </span>
        <svg
          class="arrow"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>
    </div>
  </RouterLink>
</template>

<script lang="ts" setup>
import type { Book } from '@/types'

defineProps<{
  book: Book
}>()

import { useCategoryColors } from '@/composables'
</script>

<style scoped>
.book-card {
  display: flex;
  background: var(--paper);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: all 220ms ease;
  cursor: pointer;
  position: relative;
}
.book-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(181, 69, 27, 0.3);
}

.card-spine {
  width: 5px;
  flex-shrink: 0;
  opacity: 0.85;
}

.card-body {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.card-meta-top {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.midia-badge {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 3px;
}
.badge-livro {
  background: #dbeafe;
  color: #1e40af;
}
.badge-manga {
  background: #fce7f3;
  color: #9d174d;
}
.badge-hq {
  background: #d1fae5;
  color: #065f46;
}

.categoria-tag {
  font-size: 0.75rem;
  color: var(--muted);
}

.card-titulo {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--ink);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-autor {
  font-size: 0.82rem;
  color: var(--muted);
  font-style: italic;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}

.sub-tag {
  font-size: 0.7rem;
  background: var(--tag-bg);
  color: var(--muted);
  padding: 2px 7px;
  border-radius: 100px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 4px;
}

.quem-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--muted);
}

.arrow {
  color: var(--border);
  transition: all var(--transition);
  flex-shrink: 0;
}
.book-card:hover .arrow {
  color: var(--accent);
  transform: translateX(3px);
}
</style>
