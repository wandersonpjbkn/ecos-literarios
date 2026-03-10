<template>
  <RouterLink :to="`/livro/${book.id}`" class="book-card">
    <!-- Color swatch based on category -->
    <div class="card-spine" :style="{ '--background': useCategoryColors().categoryClass(book.categoria) }" />

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
          <BaseIcon name="user" />
          {{ book.quem }}
        </span>
        <BaseIcon name="arrow-right" class="arrow" />
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

<style lang="scss" scoped>
.book {
  &-card {
    position: relative;

    display: flex;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);

    overflow: hidden;
    transition: all 220ms ease;
    cursor: pointer;

    &:hover {
      box-shadow: var(--shadow-lg);
      border-color: rgba(var(--accent-rgb), 0.3);

      transform: translateY(-3px);

      .arrow {
        color: var(--accent);
        transform: translateX(3px);
      }
    }
  }
}

.card {
  &-spine {
    width: 5px;
    flex-shrink: 0;
    opacity: 0.85;
  }

  &-body {
    display: flex;
    padding: 16px;
    min-width: 0;

    gap: 8px;
    flex-direction: column;
    flex: 1;
  }

  &-meta-top {
    display: flex;

    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  &-titulo {
    display: -webkit-box;

    font: {
      family: var(--font-display);
      size: 1rem;
      weight: 600;
    }
    line-height: 1.3;
    color: var(--ink);

    overflow: hidden;

    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &-autor {
    font: {
      size: 0.82rem;
      style: italic;
    }
    color: var(--muted);
  }

  &-tags {
    margin-top: 2px;

    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  &-footer {
    margin-top: auto;

    display: flex;
    padding-top: 4px;

    align-items: center;
    justify-content: space-between;
  }
}

.midia-badge {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 3px;
}

.badge {
  &-livro {
    background: var(--accent-light);
    color: var(--accent);
  }
  &-manga {
    background: var(--lilac-light);
    color: var(--lilac);
  }
  &-hq {
    background: var(--green-light);
    color: var(--green);
  }
}

.categoria-tag {
  font-size: 0.75rem;
  color: var(--muted);
}

.sub-tag {
  font-size: 0.7rem;
  background: var(--bg-subtle);
  color: var(--muted);
  padding: 2px 7px;
  border-radius: 100px;
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
</style>
