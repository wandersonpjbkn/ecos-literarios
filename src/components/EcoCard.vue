<template>
  <RouterLink :to="{ name: 'catalog-book-details', params: { id: book.id } }" class="eco-card">
    <figure class="eco-card__panel">
      <figcaption class="eco-card__label">O eco da semana</figcaption>
      <blockquote class="eco-card__text">{{ book.porque }}</blockquote>
      <p class="eco-card__foot">
        <strong class="eco-card__book">{{ book.titulo }}</strong>
        <span class="eco-card__who">
          <UserAvatar :alt="book.quem" class="eco-card__avatar" />
          mencionado por {{ book.quem }}
        </span>
      </p>
    </figure>
  </RouterLink>
</template>

<script lang="ts" setup>
import UserAvatar from '@/components/UserAvatar.vue'
import type { Book } from '@/types'

defineProps<{
  book: Book
}>()
</script>

<style lang="scss" scoped>
// Fills the whole grid cell (cover + caption) so it never reads as a book tile; card language of the shelves.
.eco-card {
  display: block;
  height: 100%;
  min-width: 0;
  border-radius: var(--radius-xl);
  text-decoration: none;
  color: inherit;

  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: var(--space-1);
  }

  &__panel {
    display: flex;
    height: 100%;
    min-height: var(--cover-h-lg);
    margin: 0;
    padding: var(--space-4);
    flex-direction: column;
    gap: var(--space-2);

    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-xl);
    transition: border-color var(--motion-transition-default);
  }

  &:hover &__panel {
    border-color: var(--color-border-strong);
  }

  &__label {
    font-size: var(--font-size-meta);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-subtle);
  }

  &__text {
    display: -webkit-box;
    margin: 0;
    overflow: hidden;

    font-size: var(--font-size-body);
    line-height: var(--line-height-text);
    color: var(--color-text-default);

    -webkit-line-clamp: 6;
    -webkit-box-orient: vertical;
  }

  // Title first: it is the link's destination; "mencionado por" says only what the data guarantees (COPY.md).
  &__foot {
    display: flex;
    margin: auto 0 0;
    flex-direction: column;
    gap: var(--space-1);
    line-height: var(--line-height-title);
  }

  &__book {
    display: -webkit-box;
    overflow: hidden;
    font-size: var(--font-size-meta);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-default);

    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &__who {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-caption);
    color: var(--color-text-subtle);
  }

  &__avatar {
    width: var(--avatar-sm);
    height: var(--avatar-sm);
    font-size: var(--font-size-micro);
  }
}
</style>
