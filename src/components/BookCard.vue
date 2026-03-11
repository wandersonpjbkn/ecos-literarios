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
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);

    overflow: hidden;
    transition: all var(--transition);

    @media (min-width: 768px) {
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

    gap: 0.45rem;
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
      size: 1.25rem;
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
      size: 0.875rem;
      style: italic;
    }
    color: var(--muted);
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
    margin-top: 1rem;

    display: flex;
    padding-top: 4px;

    align-items: center;
    justify-content: space-between;

    @media (max-width: 768px) {
      .arrow {
        color: var(--accent);
      }
    }
  }

  &-link {
    display: flex;
    background: var(--bg-subtle);
    color: var(--accent);
    border: none;
    padding: 9px 20px;
    border-radius: var(--radius-sm);

    font: {
      family: var(--font-body);
      size: 0.8rem;
    }

    align-items: center;
    cursor: pointer;
    transition: all var(--transition);

    .arrow {
      margin-left: 5px;
    }

    &:active {
      color: var(--surface);
      background: var(--accent);

      .arrow {
        color: var(--surface);
      }
    }
  }
}

.midia-badge {
  font-size: 0.7rem;
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
  font-size: 0.85rem;
  color: var(--muted);
}

.sub-tag {
  font-size: 0.8rem;
  background: var(--bg-subtle);
  color: var(--muted);
  padding: 0.25rem 0.75rem;
  border-radius: 100px;
}

.quem-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: var(--muted);
}

.arrow {
  color: var(--border);
  transition: all var(--transition);
  flex-shrink: 0;
}
</style>
