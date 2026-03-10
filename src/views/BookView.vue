<template>
  <div class="book-page">
    <!-- Loading -->
    <div v-if="useBooksStore().loading" class="state-screen">
      <div class="spinner"></div>
    </div>

    <!-- Not found -->
    <div v-else-if="!book" class="state-screen">
      <p>Livro não encontrado.</p>
      <RouterLink to="/" class="back-btn">← Voltar ao catálogo</RouterLink>
    </div>

    <!-- Book detail -->
    <template v-else>
      <!-- Top bar -->
      <div class="top-bar">
        <div class="top-bar-inner">
          <RouterLink to="/" class="back-link">
            <BaseIcon name="arrow-left" />
            Catálogo
          </RouterLink>
          <div class="breadcrumb-divider">
            <span>/</span>
          </div>
          <span class="breadcrumb-current">{{ book.titulo }}</span>
        </div>
      </div>

      <!-- Hero -->
      <section class="book-hero" :style="{ '--spine-color': useCategoryColors().categoryClass(book.categoria) }">
        <div class="hero-inner">
          <!-- Book visual -->
          <div class="book-cover">
            <div class="cover-spine"></div>
            <div class="cover-front">
              <span class="cover-midia">{{ book.midia }}</span>
              <h2 class="cover-titulo">{{ book.titulo }}</h2>
              <p class="cover-autor">{{ book.autor }}</p>
            </div>
          </div>

          <!-- Info -->
          <div class="book-info">
            <div class="info-badges">
              <span class="midia-badge" :class="useCategoryColors().midiaClass(book.midia)">{{ book.midia }}</span>
              <span class="categoria-badge">{{ book.categoria }}</span>
            </div>
            <h1 class="book-titulo">{{ book.titulo }}</h1>
            <p class="book-autor">{{ book.autor }}</p>

            <div v-if="book.subgenerosArr?.length" class="subgeneros-list">
              <span v-for="sg in book.subgenerosArr" :key="sg" class="sg-tag">{{ sg }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Content -->
      <section class="book-content">
        <div class="content-inner">
          <!-- Quem indicou + Por que -->
          <div v-if="book.quem || book.porque" class="indicacao-card">
            <div class="indicacao-header">
              <BaseIcon name="user" class="icon-user" />
              <span v-if="book.quem"
                >Indicado por <strong>{{ book.quem }}</strong></span
              >
            </div>
            <blockquote v-if="book.porque" class="porque-quote">"{{ book.porque }}"</blockquote>
          </div>

          <!-- Metadata grid -->
          <div class="meta-grid">
            <div v-if="book.midia" class="meta-item">
              <span class="meta-label">Mídia</span>
              <span class="meta-value">{{ book.midia }}</span>
            </div>
            <div v-if="book.categoria" class="meta-item">
              <span class="meta-label">Categoria</span>
              <span class="meta-value">{{ book.categoria }}</span>
            </div>
            <div v-if="book.autor" class="meta-item">
              <span class="meta-label">Autor/a</span>
              <span class="meta-value">{{ book.autor }}</span>
            </div>
            <div v-if="book.quem" class="meta-item">
              <span class="meta-label">Indicado por</span>
              <span class="meta-value">{{ book.quem }}</span>
            </div>
          </div>

          <!-- Related: same category -->
          <div v-if="related.length" class="related-section">
            <h3 class="related-title">
              Mais em <em>{{ book.categoria }}</em>
            </h3>
            <div class="related-grid">
              <RouterLink v-for="r in related" :key="r.id" :to="`/livro/${r.id}`" class="related-card">
                <div class="related-spine" :style="{ background: useCategoryColors().categoryClass(book.categoria) }" />
                <div class="related-body">
                  <strong>{{ r.titulo }}</strong>
                  <span>{{ r.autor }}</span>
                </div>
              </RouterLink>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { useBooksStore } from '@/stores'
import { useCategoryColors, useSheets } from '@/composables'

import type { Book } from '@/types'

const route = useRoute()

onMounted(() => useSheets().fetchBooks())

const book = computed((): Book => useBooksStore().books.find((b) => String(b.id) === String(route.params.id)) as Book)

const related = computed(() => {
  if (!book.value) return []

  return useBooksStore()
    .books.filter((b) => b.id !== book.value.id && b.categoria === book.value.categoria)
    .slice(0, 4)
})
</script>

<style lang="scss" scoped>
.state-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 24px;
  color: var(--muted);
}
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Top bar ─────────────────────────────────── */
.top-bar {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0 24px;

  &-inner {
    margin: 0 auto;

    display: flex;
    max-width: 900px;
    height: 44px;

    align-items: center;
    gap: 8px;

    font-size: 0.85rem;
  }
}
.back-link {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--muted);
  transition: color var(--transition);

  &:hover {
    color: var(--accent);
  }
}
.breadcrumb {
  &-divider {
    display: inline-flex;

    color: var(--muted);

    align-items: center;
  }

  &-current {
    color: var(--ink);
    font-weight: 500;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

.book {
  /* ── Hero ────────────────────────────────────── */
  &-hero {
    background: var(--ink);
    padding: 48px 24px;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse 50% 100% at 0% 50%, rgba(var(--accent-rgb), 0.2) 0%, transparent 60%);
      pointer-events: none;
    }
  }

  /* Book 3D cover visual */
  &-cover {
    display: flex;
    flex-shrink: 0;
    filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.5));
  }

  /* Info */
  &-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-top: 8px;
  }

  &-titulo {
    font-family: var(--font-display);
    font-size: clamp(1.6rem, 4vw, 2.4rem);
    font-weight: 700;
    color: var(--surface);
    line-height: 1.15;
  }

  &-autor {
    font-size: 1rem;
    color: rgba(var(--surface-rgb), 0.65);
    font-style: italic;
  }
}

.hero-inner {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  gap: 48px;
  align-items: flex-start;
  position: relative;
}

.cover {
  &-spine {
    width: 18px;
    background: var(--spine-color, #5a5a5a);
    border-radius: 2px 0 0 2px;
    filter: brightness(0.7);
  }

  &-front {
    width: 140px;
    min-height: 200px;
    background: var(--spine-color, #5a5a5a);
    border-radius: 0 4px 4px 0;
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(var(--surface-rgb), 0.08) 0%, transparent 60%);
    }
  }

  &-midia {
    font-size: 0.6rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(var(--surface-rgb), 0.6);
    font-weight: 600;
  }

  &-titulo {
    font-family: var(--font-display);
    font-size: 0.85rem;
    color: rgba(var(--surface-rgb), 0.95);
    font-weight: 700;
    line-height: 1.3;
  }

  &-autor {
    font-size: 0.65rem;
    color: rgba(var(--surface-rgb), 0.55);
    font-style: italic;
  }
}

.info-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.midia-badge {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 3px;
}

.badge {
  &-livro {
    background: #1e40af;
    color: #dbeafe;
  }
  &-manga {
    background: #9d174d;
    color: #fce7f3;
  }
  &-hq {
    background: #065f46;
    color: #d1fae5;
  }
}

.categoria-badge {
  font-size: 0.8rem;
  color: rgba(var(--surface-rgb), 0.65);
  background: rgba(var(--surface-rgb), 0.07);
  padding: 3px 9px;
  border-radius: 3px;
}

.subgeneros-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.sg-tag {
  font-size: 0.75rem;
  background: rgba(var(--surface-rgb), 0.1);
  color: rgba(var(--surface-rgb), 0.8);
  padding: 4px 10px;
  border-radius: 100px;
  border: 1px solid rgba(var(--surface-rgb), 0.1);
}

/* ── Content ─────────────────────────────────── */
.book-content {
  padding: 40px 24px 64px;
  background: var(--bg);
}
.content-inner {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Indicação card */
.indicacao-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 4px solid var(--accent);
  border-radius: var(--radius);
  padding: 24px 28px;
}

.indicacao-header {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--muted);
  font-size: 0.9rem;
  margin-bottom: 14px;
}
.indicacao-header strong {
  color: var(--ink);
}
.indicacao-header svg {
  color: var(--accent);
  flex-shrink: 0;
}

.icon-user {
  $size: 1.125rem;

  width: $size;
  height: $size;
}

.porque-quote {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.05rem;
  color: var(--ink);
  line-height: 1.6;
  position: relative;
  padding-left: 0;
}

/* Meta grid */
.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.meta-item {
  background: var(--surface);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 500;
}

.meta-value {
  font-size: 0.95rem;
  color: var(--ink);
  font-weight: 500;
}

/* Related */
.related-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 16px;
}
.related-title em {
  font-style: italic;
  color: var(--accent);
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.related-card {
  display: flex;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  transition: all var(--transition);
}
.related-card:hover {
  box-shadow: var(--shadow);
  transform: translateY(-2px);
}

.related-spine {
  width: 4px;
  flex-shrink: 0;
}

.related-body {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.related-body strong {
  font-size: 0.85rem;
  font-weight: 600;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.related-body span {
  font-size: 0.75rem;
  color: var(--muted);
  font-style: italic;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--accent);
  font-size: 0.9rem;
  border: 1px solid var(--accent);
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  transition: all var(--transition);
}
.back-btn:hover {
  background: var(--accent);
  color: white;
}

@media (max-width: 640px) {
  .hero-inner {
    flex-direction: column;
    gap: 24px;
  }
  .book-cover {
    display: none;
  }
}
</style>
