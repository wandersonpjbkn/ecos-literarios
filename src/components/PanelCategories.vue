<template>
  <SideBar ref="instance" title="Categorias" :enter="`left:${isTablet ? '0' : '5rem'}`">
    <template #body>
      <nav class="panel-category" aria-label="Navegação por categoria">
        <RouterLink
          v-for="cat in categoryLinks"
          :key="cat.slug"
          :to="{ name: 'catalog-category', params: { slug: cat.slug } }"
          class="panel-category__item"
          :class="{ 'is-active': isCategoryActive(cat.slug) }"
          @click="instance?.close()"
        >
          <span class="panel-category__dot" :style="{ background: cat.color }" />
          <span class="panel-category__label">{{ cat.name }}</span>
          <span class="panel-category__count">{{ cat.count }}</span>
        </RouterLink>

        <p v-if="categoryLinks.length === 0" class="panel-category__empty">Carregando categorias…</p>
      </nav>
    </template>
  </SideBar>
</template>

<script lang="ts" setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'

import { useBooksStore } from '@/stores'
import { useBreakpoints, useCategoryColors, useUtils } from '@/composables'

const SideBar = defineAsyncComponent(() => import('@/components/SideBar.vue'))

const route = useRoute()
const colors = useCategoryColors()
const { slugify } = useUtils()

const isTablet = useMediaQuery(useBreakpoints.isTablet)

const instance = ref<InstanceType<typeof SideBar> | null>(null)

const categoryLinks = computed(() => {
  const books = useBooksStore().books
  const countMap = new Map<string, number>()

  for (const book of books) {
    if (!book.categoria) continue
    countMap.set(book.categoria, (countMap.get(book.categoria) ?? 0) + 1)
  }

  return [...countMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
    .map(([name, count]) => ({
      name,
      slug: slugify(name),
      color: colors.categoryColor(name),
      count,
    }))
})

const isCategoryActive = (slug: string): boolean => route.name === 'catalog-category' && route.params.slug === slug

defineExpose({ instance })
</script>

<style lang="scss" scoped>
.panel-category {
  display: flex;
  flex-direction: column;
  gap: 2px;

  &__item {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 10px 12px;
    border-radius: var(--border-radius-default);
    text-decoration: none;
    font-size: 0.9rem;
    color: var(--color-text-default);
    transition:
      background var(--motion-transition-default),
      color var(--motion-transition-default);

    &:hover {
      background: var(--color-background-subtle);
    }

    &.is-active {
      background: var(--color-action-background-subtle);
      color: var(--color-action-default);
      font-weight: 500;
    }
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    flex-shrink: 0;
  }

  &__label {
    flex: 1;
    text-transform: capitalize;
  }

  &__count {
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    border-radius: 999px;
    background: var(--color-background-subtle);
    color: var(--color-text-subtle);
    font-size: 0.72rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;

    .is-active & {
      background: var(--color-action-default);
      color: #fff;
    }
  }

  &__empty {
    padding: 1rem;
    font-size: 0.9rem;
    color: var(--color-text-subtle);
    text-align: center;
  }
}
</style>
