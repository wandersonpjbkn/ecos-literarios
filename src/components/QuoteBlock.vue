<template>
  <section class="quote-block" :class="{ 'is-empty': !hasText }" aria-labelledby="quote-block-title">
    <h2 id="quote-block-title" class="quote-block__label">Comentário</h2>

    <template v-if="hasText">
      <blockquote :id="textId" class="quote-block__text" :class="{ 'is-collapsed': isLong && !expanded }">
        {{ text }}
      </blockquote>
      <AppButton
        v-if="isLong"
        variant="ghost"
        size="md"
        class="quote-block__toggle"
        :aria-expanded="expanded"
        :aria-controls="textId"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Mostrar menos' : 'Ler o resto' }}
      </AppButton>
    </template>

    <template v-else>
      <p class="quote-block__empty-title">{{ person }} não escreveu nada sobre este livro</p>
      <p v-if="fromConversation" class="quote-block__empty-note">
        O livro apareceu na conversa do grupo, sem comentário junto.
      </p>
      <div class="quote-block__actions">
        <AppButton v-if="isAuthor" size="md" :disabled="!canWrite" @click="emit('write')">
          <BaseIcon name="pencil" aria-hidden="true" />
          Escrever o que achei
        </AppButton>
        <template v-else>
          <AppButton size="md" :href="askLink">Perguntar pra {{ person }}</AppButton>
          <p class="quote-block__hint">Abre o WhatsApp com a pergunta pronta.</p>
        </template>
      </div>
    </template>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref, useId } from 'vue'

import AppButton from '@/components/AppButton.vue'

const props = defineProps<{
  text: string
  // Who mentioned the book; "Comentário" does not claim they wrote the text (QuoteBlock.md, slice 5).
  person: string
  isAuthor: boolean
  canWrite: boolean
  fromConversation: boolean
  askLink: string
}>()

const emit = defineEmits<{ write: [] }>()

const COLLAPSE_CHARS = 240

const textId = useId()
const expanded = ref(false)
const hasText = computed(() => !!props.text.trim())
const isLong = computed(() => props.text.length > COLLAPSE_CHARS)
</script>

<style lang="scss" scoped>
.quote-block {
  padding: var(--space-5) var(--space-6);

  background: var(--color-background-subtle);
  border-left: 3px solid var(--color-action-text-subtle);
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;

  &.is-empty {
    border-left-color: var(--color-border-strong);
  }

  &__label {
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--color-text-subtle);
  }

  // body-l: the one large body size of the system (QuoteBlock.md).
  &__text {
    margin: var(--space-3) 0 0;
    font-size: 1.1875rem;
    line-height: 1.58;
    color: var(--color-text-default);
    white-space: pre-line;

    &.is-collapsed {
      display: -webkit-box;
      overflow: hidden;
      -webkit-line-clamp: 5;
      -webkit-box-orient: vertical;
    }
  }

  &__toggle {
    margin-top: var(--space-2);
    margin-left: calc(-1 * var(--space-2));
  }

  &__empty-title {
    margin-top: var(--space-3);
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-default);
  }

  &__empty-note {
    margin-top: var(--space-1);
    font-size: 0.9375rem;
    color: var(--color-text-secondary);
  }

  &__actions {
    margin-top: var(--space-4);
  }

  &__hint {
    margin-top: var(--space-2);
    font-size: 0.875rem;
    color: var(--color-text-subtle);
  }
}
</style>
