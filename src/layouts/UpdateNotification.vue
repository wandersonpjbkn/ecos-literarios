<template>
  <Transition name="update-banner">
    <div v-if="isVisible" class="update-banner" role="status" aria-live="polite">
      <span class="update-banner__text">Tem uma versão nova da plataforma</span>
      <AppButton class="update-banner__btn" variant="primary" size="md" @click="reload">
        <BaseIcon name="reload" aria-hidden="true" />
        Atualizar
      </AppButton>
      <button class="update-banner__dismiss" type="button" aria-label="Fechar" @click="isVisible = false">
        <BaseIcon name="times" aria-hidden="true" />
      </button>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import AppButton from '@/components/ui/AppButton.vue'
import { ref, onMounted } from 'vue'

const isVisible = ref(false)

const reload = () => window.location.reload()

onMounted(() => {
  if (!('serviceWorker' in navigator)) return

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    isVisible.value = true
  })
})
</script>

<style lang="scss" scoped>
.update-banner {
  --icn-size: var(--icon-sm);

  position: fixed;
  bottom: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--layer-notice);

  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  min-width: var(--toast-min);
  max-width: calc(100dvw - var(--space-8));

  background: var(--color-text-default);
  color: var(--color-on-inverse);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xl);

  :deep(.base-icon) {
    width: var(--icn-size);
    height: var(--icn-size);
  }

  &__dismiss {
    display: inline-flex;
    padding: var(--space-2) var(--space-3);
    width: fit-content;
    min-width: var(--touch-min);
    min-height: var(--touch-min);
    border: none;
    border-radius: var(--radius-sm);
    background: rgba(var(--color-surface-default-rgb), 0.15);

    color: var(--color-on-inverse);

    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition:
      background var(--motion-transition-default),
      color var(--motion-transition-default);

    &:hover {
      background: rgba(var(--color-surface-default-rgb), 0.25);
      color: var(--color-on-inverse);
    }
  }

  &__text {
    flex: 1;
    font-size: var(--font-size-meta);

    @media (max-width: $bp-phone-max) {
      font-size: var(--font-size-caption);
    }
  }

  @media (max-width: $bp-phone-max) {
    --icn-size: var(--icon-xs);

    bottom: var(--above-tab-bar);

    &__text {
      font-size: var(--font-size-caption);
    }
  }
}

.update-banner-enter-active,
.update-banner-leave-active {
  transition:
    opacity var(--motion-transition-default),
    transform var(--motion-transition-default);
}
.update-banner-enter-from,
.update-banner-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}
</style>
