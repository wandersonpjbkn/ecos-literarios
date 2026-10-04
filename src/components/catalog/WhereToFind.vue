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

import type { Book } from '@/types'

import { useUtils } from '@/composables'

const props = defineProps<{
  book: Book
}>()

const query = computed(() => encodeURIComponent(`${props.book.titulo} ${props.book.authors[0] ?? ''}`))

const links = computed(() => {
  const { isbn } = props.book
  return [
    {
      name: 'Amazon',
      origin: 'amazon',
      icon: 'amazon' as const,
      href: `https://www.amazon.com.br/s?k=${isbn ? encodeURIComponent(isbn) : query.value}`,
    },
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
    external_link_author: props.book.authors[0] ?? '',
  })
</script>

<style lang="scss" scoped>
.where {
  &__title {
    font-size: var(--font-size-ui);
    font-weight: var(--font-weight-bold);
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

    font-size: var(--font-size-ui);
    color: var(--color-text-default);
    text-decoration: none;
    border-radius: var(--radius-md);

    &:hover {
      color: var(--color-action-default);
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: var(--focus-offset);
    }
  }

  &__icon {
    width: var(--icon-md);
    height: var(--icon-md);
    flex-shrink: 0;
    color: var(--color-text-subtle);
  }

  &__arrow {
    width: var(--icon-xs);
    height: var(--icon-xs);
    margin-left: auto;
    color: var(--color-text-subtle);
  }
}
</style>
