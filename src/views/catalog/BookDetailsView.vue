<template>
  <div class="book-page" data-page="book">
    <PageStatus :loading="useBooksStore().loading" loading-text="Carregando livro…" />

    <div v-if="!useBooksStore().loading && !book" class="state-screen">
      <p>Livro não encontrado.</p>
      <RouterLink :to="{ name: 'catalog-books' }" class="back-btn">
        <BaseIcon name="arrow-left" />
        Voltar ao catálogo
      </RouterLink>
    </div>

    <template v-if="!useBooksStore().loading && book">
      <nav class="top-bar">
        <div class="top-bar__inner">
          <RouterLink :to="{ name: 'catalog-books' }" class="top-bar__back">
            <BaseIcon name="arrow-left" />
            <span>Catálogo</span>
          </RouterLink>
          <span class="top-bar__sep" aria-hidden="true">/</span>
          <span class="top-bar__current">{{ book.titulo }}</span>
        </div>
      </nav>

      <section class="hero" :style="{ '--accent': categoryColor }">
        <div class="hero__inner">
          <div class="hero__cover-wrap">
            <div v-if="book.cover_url" class="hero__cover">
              <img :src="book.cover_url" :alt="`Capa de ${book.titulo}`" class="hero__cover-img" />
            </div>
            <div v-else class="hero__cover-fallback">
              <div class="book-css">
                <div class="book-css__spine" />
                <div class="book-css__face">
                  <span class="book-css__title">{{ book.titulo }}</span>
                  <span class="book-css__author">{{ book.autor }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="hero__meta">
            <div class="hero__badges">
              <span class="midia-badge" :class="mediaBadgeClass">{{ book.midia }}</span>
              <span v-if="book.categoria" class="categoria-pill">
                <span class="categoria-dot" :style="{ background: categoryColor }" />
                {{ formatCategoria(book.categoria) }}
              </span>
            </div>

            <h1 class="hero__title">{{ book.titulo }}</h1>
            <p class="hero__author">{{ book.autor }}</p>

            <div v-if="book.published_year || book.page_count" class="hero__stats">
              <span v-if="book.published_year" class="hero__stat">{{ book.published_year }}</span>
              <span v-if="book.published_year && book.page_count" class="hero__stat-sep" aria-hidden="true">·</span>
              <span v-if="book.page_count" class="hero__stat">{{ book.page_count }} páginas</span>
            </div>

            <div v-if="book.subgenerosArr?.length" class="hero__tags">
              <span v-for="sg in book.subgenerosArr" :key="sg" class="hero__tag">{{ sg }}</span>
            </div>

            <div v-if="book.quem" class="hero__mention">
              <div class="hero__mention-avatar" aria-hidden="true">{{ book.quem.charAt(0).toUpperCase() }}</div>
              <span
                >Mencionado por <strong>{{ book.quem }}</strong></span
              >
            </div>
          </div>
        </div>
      </section>

      <div class="content">
        <div class="content__inner">
          <div class="content__main">
            <section v-if="book.synopsis" class="content-section">
              <h2 class="content-section__title">Sinopse</h2>
              <p class="content-section__text">{{ book.synopsis }}</p>
            </section>

            <section v-if="book.porque" class="content-section">
              <h2 class="content-section__title">Por que foi indicado</h2>
              <div class="porque-card" :style="{ '--accent': categoryColor }">
                <div v-if="book.quem" class="porque-card__header">
                  <div class="porque-card__avatar" aria-hidden="true">{{ book.quem.charAt(0).toUpperCase() }}</div>
                  <span class="porque-card__name">{{ book.quem }}</span>
                </div>
                <blockquote class="porque-card__quote" :class="{ 'is-collapsed': !reasonExpanded && isLongReason }">
                  {{ book.porque }}
                </blockquote>
                <button
                  v-if="isLongReason"
                  class="porque-card__toggle"
                  type="button"
                  @click="reasonExpanded = !reasonExpanded"
                >
                  {{ reasonExpanded ? 'Mostrar menos' : 'Ler completo' }}
                  <BaseIcon name="chevron" class="porque-card__chevron" :class="{ 'is-open': reasonExpanded }" />
                </button>
              </div>
            </section>

            <section class="content-section">
              <h2 class="content-section__title">Buscar fora</h2>
              <div class="ext-btns">
                <a
                  :href="`https://www.amazon.com.br/s?k=${encodeURIComponent(`${book.titulo} ${book.autor}`)}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="ext-btn ext-btn--amazon"
                  @click="trackExternal('amazon')"
                >
                  <BaseIcon name="amazon" /><span>Amazon</span>
                </a>
                <a
                  :href="`https://www.youtube.com/results?search_query=${encodeURIComponent(`${book.titulo} ${book.autor}`)}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="ext-btn ext-btn--youtube"
                  @click="trackExternal('youtube')"
                >
                  <BaseIcon name="youtube" /><span>YouTube</span>
                </a>
                <a
                  :href="`https://www.google.com/search?q=${encodeURIComponent(`${book.titulo} ${book.autor}`)}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="ext-btn ext-btn--google"
                  @click="trackExternal('google')"
                >
                  <BaseIcon name="chrome" /><span>Google</span>
                </a>
              </div>
            </section>
          </div>

          <aside class="content__sidebar">
            <h2 class="content-section__title">Explorar</h2>
            <div class="explore-list">
              <template v-for="(item, index) in explore" :key="index">
                <RouterLink
                  v-if="item.show"
                  :to="{
                    name: item.name,
                    params: {
                      slug: item.slug,
                    },
                  }"
                  class="explore-item"
                >
                  <span class="explore-item__label">{{ item.label }}</span>
                  <span class="explore-item__value">{{ item.value }}</span>
                  <BaseIcon name="arrow-right" class="explore-item__arrow" />
                </RouterLink>
              </template>
            </div>
          </aside>
        </div>
      </div>

      <section v-if="related.length" class="related">
        <div class="related__inner">
          <div class="related__header">
            <h2 class="related__title">
              Outros em <em>{{ formatCategoria(book.categoria) }}</em>
            </h2>
            <RouterLink
              :to="{
                name: 'catalog-category',
                params: {
                  slug: useUtils().slugify(book.categoria),
                },
              }"
              class="related__see-all"
            >
              Ver todos <BaseIcon name="arrow-right" />
            </RouterLink>
          </div>
          <div class="related__grid">
            <RouterLink
              v-for="r in related"
              :key="r.id"
              :to="{
                name: 'catalog-book-details',
                params: { id: r.id },
              }"
              class="related-card"
            >
              <div class="related-card__spine" :style="{ background: getCategoryColor(r.categoria) }" />
              <div class="related-card__body">
                <span class="related-card__kicker">{{ r.midia }} · {{ formatCategoria(r.categoria) }}</span>
                <span class="related-card__title">{{ r.titulo }}</span>
                <span class="related-card__author">{{ r.autor }}</span>
              </div>
              <BaseIcon name="arrow-right" class="related-card__arrow" />
            </RouterLink>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { useBooksStore } from '@/stores'
import { useCategoryColors, useApi, usePageMeta, useUtils } from '@/composables'

import PageStatus from '@/components/PageStatus.vue'

import type { Book, CategoryType } from '@/types'

const REASON_COLLAPSE_CHARS = 240

const route = useRoute()
const colors = useCategoryColors()

onMounted(() => useApi().fetchBooks())

const book = computed((): Book | undefined =>
  useBooksStore().books.find((b) => String(b.id) === String(route.params.id)),
)

const reasonExpanded = ref(false)
const isLongReason = computed(() => (book.value?.porque?.length ?? 0) > REASON_COLLAPSE_CHARS)

const related = computed(() => {
  if (!book.value) return []
  return useBooksStore()
    .books.filter((b) => b.id !== book.value?.id && b.categoria === book.value?.categoria)
    .slice(0, 4)
})
const explore = computed(() => {
  if (!book.value) return []
  return [
    {
      show: !!book.value.midia,
      name: 'catalog-midia',
      slug: useUtils().slugify(book.value.midia),
      label: 'Mídia',
      value: book.value.midia,
    },
    {
      show: !!book.value.categoria,
      name: 'catalog-category',
      slug: useUtils().slugify(book.value.categoria),
      label: 'Categoria',
      value: formatCategoria(book.value.categoria),
    },
    {
      show: !!book.value.autor,
      name: 'catalog-author',
      slug: useUtils().slugify(book.value.autor),
      label: 'Autor',
      value: book.value.autor,
    },
    {
      show: !!book.value.quem,
      name: 'catalog-mention',
      slug: useUtils().slugify(book.value.quem),
      label: 'Indicado por',
      value: book.value.quem,
    },
  ]
})

const categoryColor = computed(() =>
  book.value ? colors.categoryColor(book.value.categoria) : 'var(--color-action-default)',
)
const mediaBadgeClass = computed(() => (book.value ? colors.mediaBadgeClass(book.value.midia) : ''))

const formatCategoria = (v?: string) => (v ? v.replace(/-/g, ' ') : '')
const getCategoryColor = (v?: CategoryType) => colors.categoryColor(v!)

const trackExternal = (origin: string) => {
  if (!book.value) return
  useUtils().sendGtmEvent({
    event: 'external_link',
    external_link_origin: origin,
    external_link_name: book.value.titulo,
    external_link_author: book.value.autor,
  })
}

usePageMeta(
  computed(() => ({
    title: book.value?.titulo ?? 'Livro',
    description: book.value ? `${book.value.titulo} · ${book.value.autor} — indicado por ${book.value.quem}` : '',
    type: 'article' as const,
  })),
)
</script>

<style lang="scss" scoped>
.top-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-surface-default);
  border-bottom: 1px solid var(--color-border-default);

  &__inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    min-height: 52px;
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-default);
    text-decoration: none;
    flex-shrink: 0;
    transition: color var(--motion-transition-default);
    svg {
      width: 16px;
      height: 16px;
    }
    &:hover {
      color: var(--color-action-default);
    }
  }

  &__sep {
    color: var(--color-text-disabled);
    flex-shrink: 0;
  }

  &__current {
    font-size: 0.875rem;
    color: var(--color-text-subtle);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

.hero {
  background: color-mix(in srgb, var(--accent) 45%, #000 55%);

  &__inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem;
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 2rem;
    align-items: start;

    @media (max-width: 767px) {
      grid-template-columns: 1fr;
      padding: 1.5rem 1rem;
    }
  }
}

.hero__cover-wrap {
  @media (max-width: 767px) {
    display: flex;
    justify-content: center;
  }
}

.hero__cover {
  width: 200px;
  aspect-ratio: 2 / 3;
  border-radius: var(--border-radius-default);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

  @media (max-width: 767px) {
    width: 140px;
  }

  &-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.hero__cover-fallback {
  width: 200px;
  @media (max-width: 767px) {
    width: 140px;
  }
}

.book-css {
  display: grid;
  grid-template-columns: 18px 1fr;
  width: 100%;
  aspect-ratio: 2 / 3;
  border-radius: var(--border-radius-default);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

  &__spine {
    background: color-mix(in srgb, var(--accent) 60%, #000 40%);
  }

  &__face {
    background: var(--accent);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 1rem;
    gap: 0.5rem;
  }

  &__title {
    font-family: var(--font-family-display);
    font-size: 0.85rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 6;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__author {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.65);
    line-height: 1.3;
  }
}

.hero__meta {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  min-width: 0;
}

.hero__badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.hero__title {
  margin: 0;
  font-family: var(--font-family-display);
  font-size: clamp(1.6rem, 3.5vw, 2.4rem);
  font-weight: 500;
  line-height: 1.15;
  color: #fff;
}

.hero__author {
  margin: 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.72);
}

.hero__stats {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.65);
}
.hero__stat-sep {
  opacity: 0.5;
}

.hero__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.hero__tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.hero__mention {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.65);
  margin-top: 0.25rem;
  strong {
    color: rgba(255, 255, 255, 0.92);
    font-weight: 500;
  }
}

.hero__mention-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-action-default);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
}

.midia-badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
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
  gap: 5px;
  min-height: 24px;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--color-background-subtle);
  color: var(--color-text-subtle);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}
.categoria-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  flex-shrink: 0;
}

.content {
  background: var(--color-background-default);
  padding: 2.5rem 0;
  @media (max-width: 767px) {
    padding: 1.5rem 0;
  }

  &__inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    display: grid;
    grid-template-columns: 1fr 260px;
    gap: 3rem;
    align-items: start;
    @media (max-width: 900px) {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    @media (max-width: 767px) {
      padding: 0 1rem;
    }
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  &__sidebar {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: sticky;
    top: 72px;
    @media (max-width: 900px) {
      position: static;
    }
  }
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &__title {
    margin: 0;
    font-family: var(--font-family-display);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  &__text {
    margin: 0;
    font-size: 0.95rem;
    color: var(--color-text-secondary);
    line-height: 1.7;
  }
}

.porque-card {
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-left: 4px solid var(--accent);
  border-radius: 0 var(--border-radius-default) var(--border-radius-default) 0;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--color-action-default);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    color: #fff;
    flex-shrink: 0;
  }

  &__name {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-default);
  }

  &__quote {
    margin: 0;
    font-family: var(--font-family-display);
    font-style: italic;
    font-size: 0.95rem;
    color: var(--color-text-default);
    line-height: 1.65;
    overflow: hidden;

    &.is-collapsed {
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
    }
  }

  &__toggle {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    padding: 0;
    font-family: var(--font-family-body);
    font-size: 0.82rem;
    color: var(--color-action-default);
    cursor: pointer;
    align-self: flex-start;
    transition: opacity var(--motion-transition-default);
    &:hover {
      opacity: 0.75;
    }
  }

  &__chevron {
    width: 14px;
    height: 14px;
    transition: transform var(--motion-transition-default);
    &.is-open {
      transform: rotate(180deg);
    }
  }
}

.ext-btns {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.ext-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 1rem;
  border-radius: 999px;
  border: 1px solid var(--color-border-default);
  background: var(--color-surface-default);
  color: var(--color-text-default);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition:
    transform var(--motion-transition-default),
    box-shadow var(--motion-transition-default),
    background var(--motion-transition-default),
    color var(--motion-transition-default),
    border-color var(--motion-transition-default);
  svg {
    width: 18px;
    height: 18px;
  }
  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 3px;
  }
}

@media (hover: hover) and (pointer: fine) {
  .ext-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }
  .ext-btn--amazon:hover {
    border-color: #ff9900;
    background: #ff9900;
    color: #fff;
  }
  .ext-btn--youtube:hover {
    border-color: #ff0000;
    background: #ff0000;
    color: #fff;
  }
  .ext-btn--google:hover {
    border-color: #4285f4;
    background: #4285f4;
    color: #fff;
  }
}

@media (max-width: 767px) {
  .ext-btns {
    flex-direction: column;
  }
  .ext-btn {
    justify-content: center;
  }
  .ext-btn--amazon {
    border-color: #ff9900;
    background: #ff9900;
    color: #fff;
  }
  .ext-btn--youtube {
    border-color: #ff0000;
    background: #ff0000;
    color: #fff;
  }
  .ext-btn--google {
    border-color: #4285f4;
    background: #4285f4;
    color: #fff;
  }
}

.explore-list {
  display: flex;
  flex-direction: column;
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  overflow: hidden;
}

.explore-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.875rem 1rem;
  text-decoration: none;
  border-bottom: 1px solid var(--color-border-default);
  transition: background var(--motion-transition-default);
  position: relative;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--color-background-subtle);
    .explore-item__arrow {
      transform: translateX(3px) translateY(-50%);
      color: var(--color-action-default);
    }
    .explore-item__value {
      color: var(--color-action-default);
    }
  }

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: -2px;
  }

  &__label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-text-disabled);
  }

  &__value {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--color-text-default);
    text-transform: capitalize;
    transition: color var(--motion-transition-default);
    padding-right: 1.5rem;
  }

  &__arrow {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    width: 14px;
    height: 14px;
    color: var(--color-border-strong);
    transition:
      transform var(--motion-transition-default),
      color var(--motion-transition-default);
  }
}

.related {
  background: var(--color-surface-default);
  border-top: 1px solid var(--color-border-default);
  padding: 2.5rem 0;

  &__inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    @media (max-width: 767px) {
      padding: 0 1rem;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  &__title {
    margin: 0;
    font-family: var(--font-family-display);
    font-size: 1rem;
    font-weight: 500;
    color: var(--color-text-default);
    em {
      font-style: normal;
      color: var(--color-action-default);
    }
  }

  &__see-all {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--color-action-default);
    text-decoration: none;
    flex-shrink: 0;
    transition: opacity var(--motion-transition-default);
    svg {
      width: 12px;
      height: 12px;
    }
    &:hover {
      opacity: 0.75;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 10px;
    @media (max-width: 767px) {
      grid-template-columns: 1fr;
    }
  }
}

.related-card {
  display: flex;
  align-items: stretch;
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  overflow: hidden;
  text-decoration: none;
  background: var(--color-surface-default);
  transition:
    transform var(--motion-transition-default),
    box-shadow var(--motion-transition-default),
    border-color var(--motion-transition-default);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
    border-color: rgba(var(--color-action-default-rgb), 0.2);
    .related-card__arrow {
      transform: translateX(3px);
      color: var(--color-action-default);
    }
  }

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 3px;
  }

  &__spine {
    width: 6px;
    flex-shrink: 0;
  }

  &__body {
    flex: 1;
    min-width: 0;
    padding: 0.875rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  &__kicker {
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-disabled);
  }
  &__title {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--color-text-default);
    line-height: 1.3;
  }
  &__author {
    font-size: 0.8rem;
    color: var(--color-text-subtle);
  }

  &__arrow {
    margin: auto 0.875rem auto 0;
    width: 14px;
    height: 14px;
    color: var(--color-border-strong);
    flex-shrink: 0;
    transition:
      transform var(--motion-transition-default),
      color var(--motion-transition-default);
  }
}

.state-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 5rem 1.5rem;
  color: var(--color-text-subtle);
  text-align: center;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 10px 18px;
  border: 1px solid var(--color-action-default);
  border-radius: var(--border-radius-sm);
  color: var(--color-action-default);
  text-decoration: none;
  font-size: 0.9rem;
  transition:
    background var(--motion-transition-default),
    color var(--motion-transition-default);
  &:hover {
    background: var(--color-action-default);
    color: #fff;
  }
}
</style>
