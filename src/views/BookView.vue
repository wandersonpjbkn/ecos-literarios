<template>
  <div class="page book-page" data-page="book">
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
          <!-- Quem mencionou + Por que -->
          <div v-if="book.quem || book.porque" class="indicacao-card">
            <div class="indicacao-header">
              <BaseIcon name="user" class="icon-user" />
              <span v-if="book.quem"
                >Mencionado por <strong>{{ book.quem }}</strong></span
              >
            </div>
            <blockquote v-if="book.porque" class="porque-quote">"{{ book.porque }}"</blockquote>
          </div>

          <!-- Pesquisar em outras mídias -->
          <div class="external-search">
            <p class="external-search-label">
              Buscar sobre <strong>{{ book.titulo }}</strong> em:
            </p>
            <div class="external-search-btns">
              <a
                :href="`https://www.amazon.com.br/s?k=${encodeURIComponent(book.titulo + ' ' + book.autor)}`"
                target="_blank"
                rel="noopener noreferrer"
                class="ext-btn ext-btn--amazon"
                aria-label="Buscar na Amazon"
                title="Amazon"
              >
                <!-- Amazon icon -->
                <BaseIcon name="amazon" />
              </a>

              <a
                :href="`https://www.youtube.com/results?search_query=${encodeURIComponent(book.titulo + ' ' + book.autor)}`"
                target="_blank"
                rel="noopener noreferrer"
                class="ext-btn ext-btn--youtube"
                aria-label="Buscar no YouTube"
                title="YouTube"
              >
                <!-- YouTube icon -->
                <BaseIcon name="youtube" />
              </a>

              <a
                :href="`https://www.google.com/search?q=${encodeURIComponent(book.titulo + ' ' + book.autor)}`"
                target="_blank"
                rel="noopener noreferrer"
                class="ext-btn ext-btn--google"
                aria-label="Buscar no Google"
                title="Google"
              >
                <!-- Google icon -->
                <BaseIcon name="chrome" />
              </a>
            </div>
          </div>

          <!-- Metadata grid — itens clicáveis -->
          <div class="meta-grid">
            <RouterLink
              v-if="book.midia"
              :to="`/midia/${encodeURIComponent(book.midia)}`"
              class="meta-item meta-item--link"
            >
              <span class="meta-label">Mídia</span>
              <span class="meta-value">{{ book.midia }}</span>
              <BaseIcon name="arrow-right" class="meta-arrow" />
            </RouterLink>

            <RouterLink
              v-if="book.categoria"
              :to="`/categoria/${encodeURIComponent(book.categoria)}`"
              class="meta-item meta-item--link"
            >
              <span class="meta-label">Categoria</span>
              <span class="meta-value">{{ book.categoria }}</span>
              <BaseIcon name="arrow-right" class="meta-arrow" />
            </RouterLink>

            <RouterLink
              v-if="book.autor"
              :to="`/autor/${encodeURIComponent(book.autor)}`"
              class="meta-item meta-item--link"
            >
              <span class="meta-label">Autor/a</span>
              <span class="meta-value">{{ book.autor }}</span>
              <BaseIcon name="arrow-right" class="meta-arrow" />
            </RouterLink>

            <RouterLink
              v-if="book.quem"
              :to="`/mencao/${encodeURIComponent(book.quem)}`"
              class="meta-item meta-item--link"
            >
              <span class="meta-label">Mencionado por</span>
              <span class="meta-value">{{ book.quem }}</span>
              <BaseIcon name="arrow-right" class="meta-arrow" />
            </RouterLink>
          </div>

          <!-- Related: same category -->
          <div v-if="related.length" class="related-section">
            <h3 class="related-title">
              Ver mais em <em>{{ book.categoria }}</em>
            </h3>
            <div class="related-grid">
              <RouterLink v-for="r in related" :key="r.id" :to="`/livro/${r.id}`" class="related-card">
                <div class="related-spine" :style="{ background: useCategoryColors().categoryClass(book.categoria) }" />
                <div class="related-body">
                  <strong>{{ r.titulo }}</strong>
                  <span>{{ r.autor }}</span>
                </div>
                <BaseIcon name="arrow-right" class="arrow" />
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
  position: sticky;
  top: 0;
  z-index: 2;

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

    font-size: 0.875rem;
  }
}

.back-link {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--muted);
  transition: color var(--transition);
  white-space: nowrap;

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
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(var(--surface-rgb), 0.6);
    font-weight: 600;
  }

  &-titulo {
    font-family: var(--font-display);
    font-size: 1rem;
    color: rgba(var(--surface-rgb), 0.95);
    font-weight: 700;
    line-height: 1.3;
  }

  &-autor {
    font-size: 0.8rem;
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
  font-size: 0.75rem;
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
  font-size: 0.875rem;
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
  font-size: 0.8rem;
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
  gap: 28px;
}

/* ── Indicação card ──────────────────────────── */
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
  font-size: 0.95rem;
  margin-bottom: 14px;

  strong {
    color: var(--ink);
  }
  svg {
    color: var(--accent);
    flex-shrink: 0;
  }
}

.icon-user {
  width: 1.125rem;
  height: 1.125rem;
}

.porque-quote {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.05rem;
  color: var(--ink);
  line-height: 1.6;
}

/* ── External search ─────────────────────────── */
.external-search {
  margin-left: auto;

  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.external-search-label {
  font-size: 0.875rem;
  color: var(--muted);
  flex-shrink: 0;
}

.external-search-btns {
  display: flex;
  gap: 10px;
}

.ext-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  transition: all var(--transition);
  flex-shrink: 0;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    border-color: transparent;
    transform: translateY(-2px);
    box-shadow: var(--shadow);
  }

  /* Cores de marca no hover */
  &--amazon:hover {
    background: #ff9900;
    color: #fff;
  }
  &--youtube:hover {
    background: #ff0000;
    color: #fff;
  }
  &--google:hover {
    background: #4285f4;
    color: #fff;
  }
}

/* ── Meta grid — clicável ────────────────────── */
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
  /* min touch target */
  min-height: 72px;
  transition: background var(--transition);

  &--link {
    position: relative;
    cursor: pointer;
    text-decoration: none;

    .meta-arrow {
      position: absolute;
      bottom: 14px;
      right: 14px;
      color: var(--border-strong);
      transition: all var(--transition);
    }

    &:hover {
      background: var(--accent-soft);

      .meta-label {
        color: var(--accent);
      }
      .meta-value {
        color: var(--accent);
      }
      .meta-arrow {
        color: var(--accent);
        transform: translateX(3px);
      }
    }
  }
}

.meta-label {
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 500;
  transition: color var(--transition);
}

.meta-value {
  font-size: 1rem;
  color: var(--ink);
  font-weight: 500;
  transition: color var(--transition);
}

/* ── Related ─────────────────────────────────── */
.related {
  &-title {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 16px;

    em {
      font-style: italic;
      color: var(--accent);
    }
  }

  &-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  &-card {
    display: flex;
    align-items: center;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    overflow: hidden;
    transition: all var(--transition);
    min-height: 56px;
    text-decoration: none;

    @media (min-width: 768px) {
      cursor: pointer;

      &:hover {
        box-shadow: var(--shadow);
        transform: translateY(-2px);

        .arrow {
          color: var(--accent);
          transform: translateX(3px);
        }
      }
    }
  }

  &-spine {
    width: 4px;
    align-self: stretch;
    flex-shrink: 0;
  }

  &-body {
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
    flex: 1;

    strong {
      font-size: 0.9rem;
      font-weight: 600;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      color: var(--ink);
    }

    span {
      font-size: 0.8rem;
      color: var(--muted);
      font-style: italic;
    }
  }
}

.arrow {
  margin-right: 12px;
  color: var(--border);
  flex-shrink: 0;
  transition: all var(--transition);

  @media (max-width: 768px) {
    color: var(--accent);
  }
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--accent);
  font-size: 1rem;
  border: 1px solid var(--accent);
  padding: 10px 18px;
  border-radius: var(--radius-sm);
  min-height: 44px;
  transition: all var(--transition);

  &:hover {
    background: var(--accent);
    color: white;
  }
}

@media (max-width: 640px) {
  .hero-inner {
    flex-direction: column;
    gap: 24px;
  }
  .book-cover {
    display: none;
  }
  .meta-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
