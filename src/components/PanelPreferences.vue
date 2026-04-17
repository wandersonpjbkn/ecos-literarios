<template>
  <SideBar ref="instance" title="Preferências" :enter="isTablet ? 'right' : 'left:4.5rem'">
    <template #body>
      <div class="menu-painel">
        <div class="menu-painel__card">
          <p>Tema</p>
          <MultiSelect
            label="Tema"
            :multiple="false"
            :searchable="false"
            :options="themesOptions"
            :selected="activeTheme"
            @toggle="(value) => select(value)"
          />
        </div>

        <div class="menu-painel__card">
          <p>Cache</p>

          <div class="menu-painel__buttons">
            <button class="btn" type="button" @click="forceRefresh">
              Recarregar catálogo
              <BaseIcon name="reload" />
            </button>
            <button class="btn" type="button" @click="forceReset">
              Resetar cache
              <BaseIcon name="trash" />
            </button>
          </div>
        </div>
      </div>
    </template>
  </SideBar>
</template>

<script lang="ts" setup>
import { ref, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'

import { useApi, useTheme, useUtils, useBreakpoints } from '@/composables'

const SideBar = defineAsyncComponent(() => import('@/components/SideBar.vue'))
const MultiSelect = defineAsyncComponent(() => import('@/components/MultiSelect.vue'))

const route = useRoute()
const { themes, activeTheme, select } = useTheme()

const isTablet = useMediaQuery(useBreakpoints.isTablet)

const instance = ref<InstanceType<typeof SideBar> | null>(null)

const themesOptions = themes.map((t) => ({
  value: t.value,
  label: `${t.emoji} ${t.label}`,
}))

const forceRefresh = () => {
  useApi().fetchBooks(true)
  instance.value?.close()
  useUtils().sendGtmEvent({
    event: 'force_refresh',
    force_refresh_origin: route.fullPath,
  })
}

const forceReset = () => {
  localStorage.clear()
  forceRefresh()
}

defineExpose({ instance })
</script>

<style lang="scss" scoped>
.menu-painel {
  display: grid;
  grid-template-rows: 1fr 1fr;
  row-gap: 2rem;

  &__card {
    p {
      margin-bottom: 0.15rem;
      font-size: 1rem;
      color: var(--color-text-default);
    }
  }

  &__buttons {
    display: grid;
    gap: 1rem;

    .btn {
      display: flex;
      width: fit-content;
      height: 44px;
      padding: 10px 20px;
      border-radius: var(--border-radius-sm);
      background: var(--color-background-subtle);
      border: 1px solid var(--color-border-default);

      font-family: var(--font-family-body);
      font-size: 1rem;
      color: var(--color-text-default);

      align-items: center;
      justify-content: center;
      transition: opacity var(--motion-transition-default);
      cursor: pointer;
      flex-shrink: 0;

      &:hover {
        background: var(--color-background-default);
      }

      :deep(.base-icon) {
        margin-left: 0.5rem;
      }
    }
  }
}
</style>
