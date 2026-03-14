<template>
  <div class="section-heading" :class="`section-heading--${variant}`">
    <div class="section-heading__copy">
      <h2 v-if="title" class="section-heading__title">{{ title }}</h2>
      <p v-if="description || descriptionHtml" class="section-heading__desc">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-if="descriptionHtml" v-html="descriptionHtml" />
        <template v-else>{{ description }}</template>
      </p>
    </div>
    <slot />
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    title?: string
    description?: string
    descriptionHtml?: string
    variant?: 'default' | 'spaced' | 'between' | 'inline'
  }>(),
  {
    title: '',
    description: '',
    descriptionHtml: '',
    variant: 'default',
  },
)
</script>

<style lang="scss" scoped>
.section-heading {
  display: flex;
  gap: 0.375rem;

  &--default {
    flex-direction: column;
  }

  &--spaced,
  &--inline {
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 1rem;
  }

  &--between {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }
}

.section-heading__copy {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.section-heading__title {
  margin: 0;
  font-family: var(--font-family-display);
  font-size: 1.15rem;
  color: var(--color-text-default);
  text-align: left;
}

.section-heading__desc {
  margin: 0;
  color: var(--color-text-subtle);
  font-size: 0.92rem;
  line-height: 1.45;
  text-align: left;
}

@media (max-width: 767px) {
  .section-heading--between {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
