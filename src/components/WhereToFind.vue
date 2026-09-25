<template>
  <section class="where" aria-labelledby="where-title">
    <h2 id="where-title" class="where__title">Onde encontrar</h2>
    <ul class="where__list">
      <li v-for="link in links" :key="link.name">
        <a :href="link.href" target="_blank" rel="noopener noreferrer" class="where__link" @click="track(link.origin)">
          <BaseIcon :name="link.icon" class="where__icon" aria-hidden="true" />
          <span>{{ link.name }}</span>
          <span class="visually-hidden">{{ ' (abre em outra aba)' }}</span>
          <BaseIcon name="external" class="where__arrow" aria-hidden="true" />
        </a>
      </li>
    </ul>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useUtils } from '@/composables'
import type { Book } from '@/types'

const props = defineProps<{
  book: Book
}>()

const query = computed(() => encodeURIComponent(`${props.book.titulo} ${props.book.autor}`))

// Search links, not affiliate ones; Google Books needs an ISBN or its own id, otherwise the row goes away.
const links = computed(() => {
  const { isbn, google_books_id: googleId } = props.book
  const googleBooks = isbn
    ? `https://books.google.com/books?vid=ISBN${encodeURIComponent(isbn)}`
    : googleId && `https://books.google.com/books?id=${encodeURIComponent(googleId)}`
  return [
    {
      name: 'Amazon',
      origin: 'amazon',
      icon: 'amazon' as const,
      href: `https://www.amazon.com.br/s?k=${isbn ? encodeURIComponent(isbn) : query.value}`,
    },
    ...(googleBooks
      ? [{ name: 'Google Books', origin: 'google-books', icon: 'book' as const, href: googleBooks }]
      : []),
    {
      name: 'Google',
      origin: 'google',
      icon: 'chrome' as const,
      href: `https://www.google.com/search?q=${query.value}`,
    },
    {
      name: 'YouTube',
      origin: 'youtube',
      icon: 'youtube' as const,
      href: `https://www.youtube.com/results?search_query=${query.value}`,
    },
  ]
})

const track = (origin: string) =>
  useUtils().sendGtmEvent({
    event: 'external_link',
    external_link_origin: origin,
    external_link_name: props.book.titulo,
    external_link_author: props.book.autor,
  })
</script>

<style lang="scss" scoped>
.where {
  &__title {
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--color-text-default);
  }

  &__list {
    margin-top: var(--space-2);
    list-style: none;
  }

  &__link {
    display: flex;
    min-height: var(--touch-min);
    align-items: center;
    gap: var(--space-3);

    font-size: 0.9375rem;
    color: var(--color-text-default);
    text-decoration: none;
    border-radius: var(--radius-md);

    &:hover {
      color: var(--color-action-default);
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: 2px;
    }
  }

  &__icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: var(--color-text-subtle);
  }

  &__arrow {
    width: 14px;
    height: 14px;
    margin-left: auto;
    color: var(--color-text-subtle);
  }
}
</style>
