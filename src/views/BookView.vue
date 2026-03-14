<template>
  <div class="page book-page" data-page="book">
    <!-- Loading -->
    <PageStatus :loading="useBooksStore().loading" loading-text="Carregando livro…" />

    <!-- Not found (só mostra se não está loading E livro não existe) -->
    <div v-if="!useBooksStore().loading && !book" class="state-screen">
      <p>Livro não encontrado.</p>
      <RouterLink to="/" class="back-btn">
        <BaseIcon name="arrow-left" />
        Voltar ao catálogo
      </RouterLink>
    </div>

    <!-- Book -->
    <template v-if="!useBooksStore().loading && book">
      <div class="top-bar">
        <div class="top-bar-inner">
          <RouterLink to="/" class="back-link back-link--primary">
            <BaseIcon name="arrow-left" />
            Voltar ao catálogo
          </RouterLink>

          <div class="breadcrumb">
            <span class="breadcrumb-divider">/</span>
            <span class="breadcrumb-current">{{ book.titulo }}</span>
          </div>
        </div>
      </div>

      <!-- Hero -->
      <section class="book-hero-wrap" :style="{ '--accent': categoryColor }">
        <div class="hero-shell">
          <RailCard :accent="categoryColor">
            <div class="hero-main">
              <div class="hero-meta">
                <span class="midia-badge" :class="midiaBadgeClass">{{ book.midia }}</span>

                <span v-if="book.categoria" class="categoria-pill">
                  <span class="categoria-dot" />
                  {{ formatCategoria(book.categoria) }}
                </span>
              </div>

              <h1 class="book-titulo">{{ book.titulo }}</h1>
              <p class="book-autor">{{ book.autor }}</p>

              <div v-if="book.subgenerosArr?.length" class="subgeneros-list">
                <span v-for="sg in book.subgenerosArr" :key="sg" class="sg-tag">{{ sg }}</span>
              </div>
            </div>
          </RailCard>
        </div>
      </section>

      <!-- Content -->
      <section class="book-content">
        <div class="content-inner">
          <!-- Indicação -->
          <div v-if="book.quem || book.porque" class="indicacao-card" :style="{ '--accent': categoryColor }">
            <div v-if="book.quem" class="indicacao-header">
              <BaseIcon name="user" class="icon-user" />
              <span
                >Mencionado por <strong>{{ book.quem }}</strong></span
              >
            </div>
            <blockquote v-if="book.porque" class="porque-quote">{{ book.porque }}</blockquote>
          </div>

          <!-- Busca externa -->
          <section class="external-search">
            <SectionHeading
              title="Buscar mundo à fora"
              :description-html="`Pesquise mais sobre <strong>${book.titulo}</strong> em outras plataformas:`"
              variant="spaced"
            />

            <div class="external-search-btns">
              <a
                :href="`https://www.amazon.com.br/s?k=${encodeURIComponent(`${book.titulo} ${book.autor}`)}`"
                target="_blank"
                rel="noopener noreferrer"
                class="ext-btn ext-btn--amazon"
                aria-label="Buscar na Amazon"
                @click="emitGTMEvent('amazon')"
              >
                <BaseIcon name="amazon" /><span>Amazon</span>
              </a>
              <a
                :href="`https://www.youtube.com/results?search_query=${encodeURIComponent(`${book.titulo} ${book.autor}`)}`"
                target="_blank"
                rel="noopener noreferrer"
                class="ext-btn ext-btn--youtube"
                aria-label="Buscar no YouTube"
                @click="emitGTMEvent('youtube')"
              >
                <BaseIcon name="youtube" /><span>YouTube</span>
              </a>
              <a
                :href="`https://www.google.com/search?q=${encodeURIComponent(`${book.titulo} ${book.autor}`)}`"
                target="_blank"
                rel="noopener noreferrer"
                class="ext-btn ext-btn--google"
                aria-label="Buscar no Google"
                @click="emitGTMEvent('google')"
              >
                <BaseIcon name="chrome" /><span>Google</span>
              </a>
            </div>
          </section>

          <!-- Explore mais -->
          <section class="nav-section">
            <SectionHeading
              title="Explore mais"
              description="Continue navegando pelo catálogo com estes atalhos relacionados."
              variant="spaced"
            />

            <div class="meta-grid">
              <RouterLink
                v-if="book.midia"
                :to="`/midia/${encodeURIComponent(book.midia)}`"
                class="meta-item meta-item--link"
                aria-label="Ver outros títulos pelo mesmo formato"
              >
                <span class="meta-label">Mídia</span>
                <span class="meta-value">{{ book.midia }}</span>
                <span class="meta-hint">Ver outros títulos nesse formato</span>
                <BaseIcon name="arrow-right" class="meta-arrow" />
              </RouterLink>

              <RouterLink
                v-if="book.categoria"
                :to="`/categoria/${encodeURIComponent(book.categoria)}`"
                class="meta-item meta-item--link"
                aria-label="Ver outros títulos da mesma categoria"
              >
                <span class="meta-label">Categoria</span>
                <span class="meta-value">{{ formatCategoria(book.categoria) }}</span>
                <span class="meta-hint">Abrir a seleção relacionada</span>
                <BaseIcon name="arrow-right" class="meta-arrow" />
              </RouterLink>

              <RouterLink
                v-if="book.autor"
                :to="`/autor/${encodeURIComponent(book.autor)}`"
                class="meta-item meta-item--link"
                aria-label="Ver outros títulos do mesmo autor"
              >
                <span class="meta-label">Autor/a</span>
                <span class="meta-value">{{ book.autor }}</span>
                <span class="meta-hint">Ver mais obras deste autor</span>
                <BaseIcon name="arrow-right" class="meta-arrow" />
              </RouterLink>

              <RouterLink
                v-if="book.quem"
                :to="`/mencao/${encodeURIComponent(book.quem)}`"
                class="meta-item meta-item--link"
                aria-label="Ver outras indicações da mesma pessoa"
              >
                <span class="meta-label">Mencionado por</span>
                <span class="meta-value">{{ book.quem }}</span>
                <span class="meta-hint">Ver outras indicações dessa pessoa</span>
                <BaseIcon name="arrow-right" class="meta-arrow" />
              </RouterLink>
            </div>
          </section>
        </div>
      </section>

      <!-- Related -->
      <section v-if="related.length" class="related-wrap">
        <div class="content-inner">
          <SectionHeading variant="between">
            <template #default>
              <RouterLink :to="`/categoria/${encodeURIComponent(book.categoria)}`" class="section-link">
                Ver todos <BaseIcon name="arrow-right" />
              </RouterLink>
            </template>
            <template #description>
              Outros títulos em <strong>{{ formatCategoria(book.categoria) }}</strong
              >.
            </template>
          </SectionHeading>

          <div class="related-grid">
            <RouterLink v-for="r in related" :key="r.id" :to="`/livro/${r.id}`" class="related-card">
              <div class="related-spine" :style="{ background: getCategoryColor(r.categoria) }" />
              <div class="related-body">
                <span class="related-kicker">{{ r.midia }} · {{ formatCategoria(r.categoria) }}</span>
                <strong>{{ r.titulo }}</strong>
                <span>{{ r.autor }}</span>
              </div>
              <BaseIcon name="arrow-right" class="arrow" />
            </RouterLink>
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
import { sendGtmEvent } from '@/utils/gtm'

import PageStatus from '@/components/PageStatus.vue'
import RailCard from '@/components/RailCard.vue'
import SectionHeading from '@/components/SectionHeading.vue'

import type { Book, CategoryType } from '@/types'

const route = useRoute()
const colors = useCategoryColors()

onMounted(() => useSheets().fetchBooks())

const book = computed((): Book | undefined =>
  useBooksStore().books.find((b) => String(b.id) === String(route.params.id)),
)

const related = computed(() => {
  if (!book.value) return []
  return useBooksStore()
    .books.filter((b) => b.id !== book.value?.id && b.categoria === book.value?.categoria)
    .slice(0, 4)
})

const categoryColor = computed(() =>
  book.value ? colors.categoryColor(book.value.categoria) : 'var(--color-action-default)',
)
const midiaBadgeClass = computed(() => (book.value ? colors.midiaBadgeClass(book.value.midia) : ''))

const formatCategoria = (v?: string) => (v ? v.replace(/-/g, ' ') : '')
const getCategoryColor = (v?: CategoryType) => colors.categoryColor(v!)

const emitGTMEvent = (origin: string) => {
  if (!book.value) return
  sendGtmEvent({
    event: 'external_link',
    external_link_origin: origin,
    external_link_name: book.value.titulo,
    external_link_author: book.value.autor,
  })
}
</script>

<style lang="scss" scoped>
/* ── Top bar ───────────────────────────────────── */
.top-bar {
  position: sticky;
  top: 0;
  z-index: 5;
  background: var(--color-surface-default);
  border-bottom: 1px solid var(--color-border-default);
  padding: 0 24px;

  &-inner {
    margin: 0 auto;
    max-width: calc(1200px - (2 * 24px));
    min-height: 56px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-subtle);
  text-decoration: none;
  white-space: nowrap;
  transition: color var(--motion-transition-default);

  &:hover {
    color: var(--color-action-default);
  }
  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 3px;
    border-radius: 6px;
  }
  &--primary {
    font-weight: 600;
    color: var(--color-text-default);
  }
}

.breadcrumb {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  &-divider {
    color: var(--color-text-disabled);
  }
  &-current {
    color: var(--color-text-subtle);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

/* ── Hero ──────────────────────────────────────── */
.book-hero-wrap {
  background: var(--accent);
  padding: 40px 24px;
  box-shadow: inset var(--shadow-lg);
}

.hero-shell {
  max-width: calc(1200px - (2 * 24px));
  margin: 0 auto;
}

.hero-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  width: fit-content;
}

.book-titulo {
  margin: 0;
  font-family: var(--font-family-display);
  font-size: clamp(1.8rem, 4vw, 2.7rem);
  line-height: 1.1;
  color: var(--color-text-default);
}

.book-autor {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text-secondary);
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
  background: var(--accent);
  flex-shrink: 0;
}

.subgeneros-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sg-tag {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--badge-tag-background-color);
  color: var(--badge-tag-text-color);
  font-size: 0.8rem;
}

/* ── Content ───────────────────────────────────── */
.book-content {
  padding: 40px 24px 72px;
  background: var(--color-background-default);
}

.content-inner {
  max-width: calc(1200px - (2 * 24px));
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.indicacao-card {
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-left: 6px solid var(--accent);
  border-radius: var(--border-radius-default);
  padding: 24px 28px;
}

.indicacao-header {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text-subtle);
  font-size: 0.95rem;
  margin-bottom: 14px;

  strong {
    color: var(--color-text-default);
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
  margin: 0;
  font-family: var(--font-family-display);
  font-style: italic;
  font-size: 1.05rem;
  color: var(--color-text-default);
  line-height: 1.6;
}

/* ── Meta grid ─────────────────────────────────── */
.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.meta-item {
  position: relative;
  min-height: 132px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  text-decoration: none;
  transition:
    transform var(--motion-transition-default),
    border-color var(--motion-transition-default),
    box-shadow var(--motion-transition-default),
    background var(--motion-transition-default);

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(var(--color-action-default-rgb), 0.22);
    background: var(--color-action-background-subtle);
    box-shadow: var(--shadow-sm);

    .meta-arrow {
      transform: translateX(3px);
      color: var(--color-action-default);
    }
    .meta-value {
      color: var(--color-action-default);
    }
  }

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 3px;
  }
}

.meta-label {
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
  font-weight: 700;
}

.meta-value {
  font-size: 1.05rem;
  color: var(--color-text-default);
  font-weight: 600;
  transition: color var(--motion-transition-default);
}

.meta-hint {
  margin-top: auto;
  padding-right: 24px;
  font-size: 0.84rem;
  color: var(--color-text-subtle);
  line-height: 1.4;
}

.meta-arrow {
  position: absolute;
  right: 16px;
  bottom: 16px;
  color: var(--color-border-strong);
  transition:
    transform var(--motion-transition-default),
    color var(--motion-transition-default);
}

/* ── External search ───────────────────────────── */
.external-search {
  display: flex;
  flex-direction: column;
}

.external-search-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ext-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--color-border-default);
  background: var(--color-surface-default);
  color: var(--color-text-default);
  text-decoration: none;
  font-weight: 600;
  transition:
    transform var(--motion-transition-default),
    box-shadow var(--motion-transition-default),
    border-color var(--motion-transition-default),
    background var(--motion-transition-default),
    color var(--motion-transition-default);

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 3px;
  }
  svg {
    width: 18px;
    height: 18px;
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
  .ext-btn {
    box-shadow: var(--shadow-sm);
    justify-content: center;
    width: 100%;
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
  .external-search-btns {
    flex-direction: column;
  }
}

/* ── Related ───────────────────────────────────── */
.related-wrap {
  background: var(--color-surface-default);
  padding: 40px 24px;
}

.section-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-action-default);
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
  transition: color var(--motion-transition-default);
  flex-shrink: 0;

  &:hover {
    color: var(--color-action-default-hover);
  }
  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 3px;
    border-radius: 6px;
  }
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.related-card {
  display: flex;
  align-items: stretch;
  background: var(--color-surface-default);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  overflow: hidden;
  text-decoration: none;
  transition:
    transform var(--motion-transition-default),
    box-shadow var(--motion-transition-default),
    border-color var(--motion-transition-default);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
    border-color: rgba(var(--color-action-default-rgb), 0.22);
    .arrow {
      color: var(--color-action-default);
      transform: translateX(3px);
    }
  }
  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 3px;
  }
}

.related-spine {
  width: 8px;
  flex-shrink: 0;
}

.related-body {
  flex: 1;
  min-width: 0;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    color: var(--color-text-default);
    font-size: 0.95rem;
    line-height: 1.3;
  }
  span {
    color: var(--color-text-subtle);
    font-size: 0.84rem;
  }
}

.related-kicker {
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.68rem !important;
  color: var(--color-text-disabled) !important;
}

.arrow {
  margin: auto 14px auto 0;
  color: var(--color-border-strong);
  transition:
    transform var(--motion-transition-default),
    color var(--motion-transition-default);
}

/* ── Not found / state ─────────────────────────── */
.state-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 24px;
  color: var(--color-text-subtle);
  text-align: center;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-action-default);
  font-size: 1rem;
  border: 1px solid var(--color-action-default);
  padding: 10px 18px;
  border-radius: var(--border-radius-sm);
  min-height: 44px;
  text-decoration: none;
  transition:
    background var(--motion-transition-default),
    color var(--motion-transition-default);

  &:hover {
    background: var(--color-action-default);
    color: var(--color-surface-default);
  }
}

/* ── Mobile ────────────────────────────────────── */
@media (max-width: 767px) {
  .book-hero-wrap {
    padding: 16px 24px;
  }
  .book-titulo {
    font-size: 1.7rem;
  }
  .book-autor {
    font-size: 0.95rem;
  }
  .meta-grid {
    grid-template-columns: 1fr;
  }
  .related-grid {
    grid-template-columns: 1fr;
  }
}
</style>
