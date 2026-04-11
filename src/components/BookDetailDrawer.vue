<template>
  <!-- Overlay -->
  <Transition name="overlay">
    <div v-if="isOpen" class="drawer-overlay" aria-hidden="true" @click="close" />
  </Transition>

  <!-- Drawer -->
  <Transition :name="isMobile ? 'drawer-bottom' : 'drawer-right'">
    <aside
      v-if="isOpen && book"
      ref="drawerRef"
      class="book-drawer"
      :class="{ 'is-mobile': isMobile }"
      role="complementary"
      :aria-label="`Detalhes de ${book.titulo}`"
    >
      <!-- Handle para swipe no mobile -->
      <div v-if="isMobile" class="drawer-handle" aria-hidden="true" />

      <!-- Header -->
      <div class="drawer-header">
        <div class="drawer-header__meta">
          <span class="midia-badge" :class="midiaBadgeClass">{{ book.midia }}</span>
          <span v-if="book.categoria" class="categoria-pill">
            <span class="categoria-dot" :style="{ background: categoryColor }" />
            {{ formatCategoria(book.categoria) }}
          </span>
        </div>
        <button class="drawer-close" type="button" aria-label="Fechar detalhes" @click="close">
          <BaseIcon name="times" aria-hidden="true" />
        </button>
      </div>

      <!-- Body scrollável -->
      <div class="drawer-body">
        <!-- Capa + título -->
        <div class="drawer-hero">
          <div class="drawer-cover" :style="{ '--accent': categoryColor }">
            <img
              v-if="book.cover_url"
              :src="book.cover_url"
              :alt="`Capa de ${book.titulo}`"
              class="drawer-cover__img"
            />
            <div v-else class="drawer-cover__fallback" aria-hidden="true">
              <BaseIcon name="book" />
            </div>
          </div>
          <div class="drawer-title-group">
            <h2 class="drawer-title">{{ book.titulo }}</h2>
            <p class="drawer-author">{{ book.autor }}</p>
          </div>
        </div>

        <!-- Sub-gêneros -->
        <div v-if="book.subgenerosArr?.length" class="drawer-section">
          <span class="drawer-section__label">Sub-gêneros</span>
          <div class="drawer-tags">
            <span v-for="sg in book.subgenerosArr" :key="sg" class="drawer-tag">{{ sg }}</span>
          </div>
        </div>

        <!-- Quem mencionou -->
        <div v-if="book.quem" class="drawer-section">
          <span class="drawer-section__label">Mencionado por</span>
          <span class="drawer-quem">
            <BaseIcon name="user" class="drawer-quem__icon" aria-hidden="true" />
            {{ book.quem }}
          </span>
        </div>

        <!-- Sinopse (quando disponível via Google Books) -->
        <div v-if="book.synopsis" class="drawer-section">
          <span class="drawer-section__label">Sinopse</span>
          <p class="drawer-synopsis">{{ book.synopsis }}</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="drawer-footer">
        <RouterLink
          :to="`/livro/${book.id}`"
          class="drawer-cta"
          @click="close"
        >
          Ver página completa
          <BaseIcon name="arrow-right" aria-hidden="true" />
        </RouterLink>
      </div>
    </aside>
  </Transition>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useMediaQuery, onClickOutside } from '@vueuse/core'
import { useCategoryColors } from '@/composables'
import type { Book } from '@/types'

const props = defineProps<{
  book: Book | null
}>()

const emit = defineEmits<{
  close: []
}>()

const isMobile = useMediaQuery('(max-width: 767px)')
const drawerRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

const colors = useCategoryColors()

const categoryColor = ref('var(--color-action-default)')
const midiaBadgeClass = ref('')

watch(
  () => props.book,
  (book) => {
    if (book) {
      categoryColor.value = colors.categoryColor(book.categoria)
      midiaBadgeClass.value = colors.midiaBadgeClass(book.midia)
      isOpen.value = true
      document.body.style.overflow = 'hidden'
    } else {
      close()
    }
  },
)

const close = () => {
  isOpen.value = false
  document.body.style.overflow = ''
  emit('close')
}

onClickOutside(drawerRef, () => {
  if (isOpen.value) close()
})

const formatCategoria = (v?: string) => (v ? v.replace(/-/g, ' ') : '')
</script>

<style lang="scss" scoped>
// ── Overlay ───────────────────────────────────────────────────────
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 60;
}

// ── Drawer ────────────────────────────────────────────────────────
.book-drawer {
  position: fixed;
  z-index: 70;
  background: var(--color-surface-default);
  display: flex;
  flex-direction: column;

  // Desktop: sidebar direita
  top: 0;
  right: 0;
  width: min(360px, 90dvw);
  height: 100dvh;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.14);

  // Mobile: bottom sheet
  &.is-mobile {
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    max-height: 92dvh;
    border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.14);
  }
}

// ── Handle (mobile) ───────────────────────────────────────────────
.drawer-handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: var(--color-border-strong);
  margin: 12px auto 0;
  flex-shrink: 0;
}

// ── Header ────────────────────────────────────────────────────────
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border-default);
  flex-shrink: 0;

  &__meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
}

.drawer-close {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-subtle);
  flex-shrink: 0;
  transition: background var(--motion-transition-default);

  &:hover {
    background: var(--color-background-subtle);
    color: var(--color-text-default);
  }

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }
}

// ── Body ──────────────────────────────────────────────────────────
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// ── Hero (capa + título) ──────────────────────────────────────────
.drawer-hero {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.drawer-cover {
  width: 72px;
  flex-shrink: 0;
  aspect-ratio: 2 / 3;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  background: var(--accent);

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.55);
  }
}

.drawer-title-group {
  flex: 1;
  min-width: 0;
  padding-top: 2px;
}

.drawer-title {
  margin: 0 0 6px;
  font-family: var(--font-family-display);
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-text-default);
}

.drawer-author {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-subtle);
}

// ── Seções de detalhe ─────────────────────────────────────────────
.drawer-section {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__label {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-text-disabled);
  }
}

.drawer-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.drawer-tag {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--badge-tag-background-color);
  color: var(--badge-tag-text-color);
  font-size: 0.78rem;
}

.drawer-quem {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: var(--color-text-default);
  font-weight: 500;

  &__icon {
    width: 14px;
    height: 14px;
    color: var(--color-text-subtle);
    flex-shrink: 0;
  }
}

.drawer-synopsis {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

// ── Footer ────────────────────────────────────────────────────────
.drawer-footer {
  padding: 14px 16px;
  border-top: 1px solid var(--color-border-default);
  flex-shrink: 0;
}

.drawer-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 44px;
  padding: 10px 16px;
  border-radius: var(--border-radius-default);
  background: var(--color-action-default);
  color: #fff;
  text-decoration: none;
  font-family: var(--font-family-body);
  font-size: 0.9rem;
  font-weight: 600;
  transition: opacity var(--motion-transition-default);

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    opacity: 0.88;
  }

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }
}

// ── Badges (reutilizados do BookCard) ─────────────────────────────
.midia-badge {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 0.68rem;
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
  min-height: 22px;
  padding: 3px 9px;
  border-radius: 999px;
  background: var(--color-background-subtle);
  color: var(--color-text-subtle);
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: capitalize;
}

.categoria-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  flex-shrink: 0;
}

// ── Transições ────────────────────────────────────────────────────
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.22s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

// Desktop — desliza da direita
.drawer-right-enter-active,
.drawer-right-leave-active {
  transition: transform 0.25s ease;
}
.drawer-right-enter-from,
.drawer-right-leave-to {
  transform: translateX(100%);
}

// Mobile — sobe do rodapé
.drawer-bottom-enter-active,
.drawer-bottom-leave-active {
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}
.drawer-bottom-enter-from,
.drawer-bottom-leave-to {
  transform: translateY(100%);
}
</style>
