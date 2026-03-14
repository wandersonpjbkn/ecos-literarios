<template>
  <component
    :is="rootComponent"
    :to="!isMobile ? `/livro/${book.id}` : undefined"
    class="book-card"
    :class="[`is-${normalize(book.midia)}`, `cat-${normalize(book.categoria)}`, { 'is-mobile': isMobile }]"
    :role="isMobile ? 'article' : undefined"
    :aria-label="`${book.titulo}, ${book.autor}`"
  >
    <div class="card-rail" :style="{ '--accent': categoryColor }" aria-hidden="true" />

    <div class="card-body">
      <div class="card-meta">
        <span class="midia-badge" :class="midiaBadgeClass">
          {{ book.midia }}
        </span>

        <span v-if="book.categoria" class="categoria-pill">
          <span class="categoria-dot" :style="{ background: categoryColor }" />
          {{ formatCategoria(book.categoria) }}
        </span>
      </div>

      <div class="card-header">
        <h3 class="card-title">
          {{ book.titulo }}
        </h3>

        <p class="card-author">
          {{ book.autor }}
        </p>
      </div>

      <div v-if="book.subgenerosArr?.length" class="card-tags">
        <span v-for="tag in book.subgenerosArr.slice(0, 3)" :key="tag" class="sub-tag">
          {{ tag }}
        </span>

        <span v-if="book.subgenerosArr.length > 3" class="sub-tag sub-tag--more">
          +{{ book.subgenerosArr.length - 3 }}
        </span>
      </div>

      <div class="card-footer">
        <div v-if="book.quem" class="quem-block">
          <span class="quem-label">Mencionado por</span>
          <span class="quem-value">
            <BaseIcon name="user" />
            {{ book.quem }}
          </span>
        </div>

        <BaseIcon v-if="!isMobile" name="arrow-right" class="arrow" aria-hidden="true" />

        <RouterLink
          v-if="isMobile"
          :to="`/livro/${book.id}`"
          class="card-link"
          :aria-label="`Ver detalhes de ${book.titulo}`"
        >
          <span>Ver detalhes</span>
          <BaseIcon name="arrow-right" class="arrow" aria-hidden="true" />
        </RouterLink>
      </div>
    </div>
  </component>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useCategoryColors } from '@/composables'
import type { Book } from '@/types'

const props = defineProps<{
  book: Book
}>()

const isMobile = useMediaQuery('(max-width: 767px)')
const rootComponent = computed(() => (isMobile.value ? 'div' : 'RouterLink'))

const colors = useCategoryColors()

const categoryColor = computed(() => colors.categoryColor(props.book.categoria))
const midiaBadgeClass = computed(() => colors.midiaBadgeClass(props.book.midia))

const normalize = (value?: string) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')

const formatCategoria = (value?: string) => {
  if (!value) return ''
  return value.replace(/-/g, ' ')
}
</script>

<style lang="scss" scoped>
.book-card {
  position: relative;
  display: grid;
  grid-template-columns: 1.1rem 1fr;
  min-height: 100%;
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  text-decoration: none;
  box-shadow: var(--shadow-sm);

  transition:
    transform var(--motion-transition-default),
    box-shadow var(--motion-transition-default),
    border-color var(--motion-transition-default);

  @media (min-width: 768px) {
    cursor: pointer;

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
      border-color: rgba(var(--color-action-default-rgb), 0.22);

      .arrow {
        transform: translateX(4px);
        color: var(--color-action-default);
      }
    }
  }

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 3px;
  }
}

.card-rail {
  --accent: var(--color-action-default);
  background: var(--accent);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  padding: 1rem;
}

.card-meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 6px 8px;
  border-radius: 999px;
  background: var(--color-background-subtle);
  width: fit-content;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-title {
  margin: 0;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  font-family: var(--font-family-display);
  font-size: 1.08rem;
  font-weight: 700;
  line-height: 1.32;
  letter-spacing: -0.01em;
  color: var(--color-text-default);
}

.card-author {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.35;
}

.card-tags {
  margin-bottom: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.card-footer {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--color-border-default);

  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
}

.midia-badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 4px 10px;
  border-radius: 999px;

  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.badge-livro {
  background: var(--badge-livro-background-color);
  color: var(--badge-livro-text-color);
}

.badge-manga {
  background: var(--badge-manga-background-color);
  color: var(--badge-manga-text-color);
}

.badge-hq {
  background: var(--badge-hq-background-color);
  color: var(--badge-hq-text-color);
}

.categoria-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 24px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--color-background-subtle);
  color: var(--color-text-subtle);

  font-size: 0.78rem;
  font-weight: 600;
  text-transform: capitalize;
}

.categoria-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  flex-shrink: 0;
}

.sub-tag {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--badge-tag-background-color);
  color: var(--badge-tag-text-color);
  font-size: 0.78rem;
  line-height: 1;
}

.sub-tag--more {
  background: var(--color-background-subtle);
  color: var(--color-text-subtle);
}

.quem-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.quem-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-disabled);
}

.quem-value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 0.88rem;
  line-height: 1.3;
  color: var(--color-text-subtle);
}

.arrow {
  color: var(--color-border-strong);
  flex-shrink: 0;
  transition:
    transform var(--motion-transition-default),
    color var(--motion-transition-default);
}

.card-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  min-height: 44px;
  padding: 10px 14px;
  border-radius: var(--border-radius-default);

  background: var(--color-background-subtle);
  color: var(--color-action-default);
  text-decoration: none;
  font-size: 0.92rem;
  font-weight: 600;

  transition:
    background var(--motion-transition-default),
    color var(--motion-transition-default);

  &:active {
    background: var(--color-action-default);
    color: var(--color-surface-default);

    .arrow {
      color: var(--color-surface-default);
    }
  }
}

@media (max-width: 767px) {
  .book-card {
    grid-template-columns: 0.85rem 1fr;
    border-radius: var(--border-radius-default);
  }

  .card-body {
    gap: 10px;
  }

  .card-title {
    font-size: 0.98rem;
  }

  .card-author {
    font-size: 0.84rem;
  }

  .card-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .card-link {
    width: 100%;
  }
}
</style>
