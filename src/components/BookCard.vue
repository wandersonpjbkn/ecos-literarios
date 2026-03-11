<template>
  <component :is="isComponent" :to="`/livro/${book.id}`" class="book-card">
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
        <BaseIcon v-if="!isMobile" name="arrow-right" class="arrow" />

        <!-- mobile -->
        <RouterLink v-if="isMobile" :to="`/livro/${book.id}`" class="card-link">
          <span>Ver detalhe</span>
          <BaseIcon name="arrow-right" class="arrow" />
        </RouterLink>
      </div>
    </div>
  </component>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import type { Book } from '@/types'

import { useCategoryColors } from '@/composables'

defineProps<{
  book: Book
}>()

const isMobile = computed(() => window.innerWidth < 768)
const isComponent = computed(() => {
  if (isMobile.value) return 'div'
  return 'RouterLink'
})
</script>

<style lang="scss" scoped>
.book {
  &-card {
    position: relative;

    display: flex;
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--border-radius-default);

    overflow: hidden;
    transition: all var(--motion-transition-default);

    @media (min-width: 768px) {
      cursor: pointer;

      &:hover {
        box-shadow: var(--shadow-lg);
        border-color: rgba(var(--color-action-default-rgb), 0.3);

        transform: translateY(-3px);

        .arrow {
          color: var(--color-action-default);
          transform: translateX(3px);
        }
      }
    }
  }
}

.card {
  &-spine {
    width: 5px;
    flex-shrink: 0;
    background: var(--background);
    opacity: 0.85;
  }

  &-body {
    display: flex;
    padding: 16px;
    min-width: 0;

    gap: 6px;
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
      family: var(--font-family-display);
      size: clamp(1rem, 2.5vw, 1.2rem);
      weight: 600;
    }
    line-height: 1.35;
    color: var(--color-text-default);

    overflow: hidden;

    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &-autor {
    font: {
      size: 0.9rem;
      style: italic;
    }
    color: var(--color-text-subtle);
  }

  &-tags {
    margin: {
      top: 2px;
      bottom: auto;
    }

    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  &-footer {
    margin-top: 12px;

    display: flex;
    padding-top: 4px;

    align-items: center;
    justify-content: space-between;

    @media (max-width: 768px) {
      .arrow {
        color: var(--color-action-default);
      }
    }
  }

  &-link {
    display: inline-flex;
    background: var(--color-background-subtle);
    border: none;
    padding: 10px 16px;
    border-radius: var(--border-radius-sm);

    font: {
      family: var(--font-family-body);
      size: 0.95rem;
    }
    color: var(--color-action-default);

    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: all var(--motion-transition-default);

    &:active {
      color: var(--color-surface-default);
      background: var(--color-action-default);

      .arrow {
        color: var(--color-surface-default);
      }
    }
  }
}

.midia-badge {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 3px;
}

.badge {
  &-livro {
    background: var(--badge-livro-background-color);
    color: var(--badge-livro-text-color);
  }
  &-manga {
    background: var(--badge-manga-background-color);
    color: var(--badge-manga-text-color);
  }
  &-hq {
    background: var(--badge-hq-background-color);
    color: var(--badge-hq-text-color);
  }
}

.categoria-tag {
  font-size: 0.875rem;
  color: var(--color-text-subtle);
}

.sub-tag {
  font-size: 0.8rem;
  background: var(--badge-tag-background-color);
  color: var(--color-text-subtle);
  padding: 3px 10px;
  border-radius: 100px;
}

.quem-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.875rem;
  color: var(--color-text-subtle);
}

.arrow {
  color: var(--color-border-default);
  transition: all var(--motion-transition-default);
  flex-shrink: 0;
}
</style>
