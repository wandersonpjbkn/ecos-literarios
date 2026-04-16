<template>
  <div class="enrichment-panel">
    <div class="enrichment-panel__trigger">
      <button
        v-if="bookId"
        type="button"
        class="panel-btn panel-btn--secondary"
        :disabled="disabled || isLoading"
        @click="fetchPreview"
      >
        {{ isLoading ? 'Buscando dados…' : 'Buscar dados' }}
      </button>
      <p v-else class="enrichment-hint">Salve o livro para habilitar sugestões automáticas de enriquecimento.</p>
    </div>

    <p v-if="error" class="panel-feedback panel-feedback--error">{{ error }}</p>

    <div v-if="preview" class="enrichment-preview">
      <div class="enrichment-preview__header">
        <strong>Prévia disponível ({{ preview.sourceLabel }})</strong>
        <p>Selecione abaixo quais campos deseja aplicar.</p>
      </div>

      <label
        v-for="item in preview.items"
        :key="item.field"
        class="enrichment-option"
        :class="{ 'is-disabled': !item.hasValue }"
      >
        <input
          v-model="selectedFields"
          type="checkbox"
          :value="item.field"
          :disabled="!item.hasValue || isApplying || disabled"
        />
        <span class="enrichment-option__meta">
          <strong>{{ item.label }}</strong>
          <small>{{ item.preview || 'Sem valor retornado' }}</small>
        </span>
      </label>

      <button
        type="button"
        class="panel-btn panel-btn--primary"
        :disabled="selectedFields.length === 0 || isApplying || disabled"
        @click="handleApply"
      >
        {{ isApplying ? 'Aplicando…' : 'Aplicar seleção no livro' }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useBookEnrichment } from '@/composables/useBookEnrichment'

const props = defineProps<{
  bookId: string | null
  disabled?: boolean
}>()

const emit = defineEmits<{ applied: [] }>()

const { isLoading, isApplying, error, preview, selectedFields, fetchPreview, applySelected, reset } = useBookEnrichment(
  () => props.bookId ?? undefined,
)

async function handleApply(): Promise<void> {
  const ok = await applySelected()
  if (ok) emit('applied')
}

defineExpose({ reset })
</script>

<style lang="scss" scoped>
@use '@/assets/scss/components/admin-shared';

.enrichment-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &__trigger {
    display: flex;
    align-items: center;
  }
}

.enrichment-hint {
  margin: 0;
  font-size: 0.82rem;
  color: var(--color-text-subtle);
}

.enrichment-preview {
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-sm);
  padding: 0.7rem;
  background: var(--color-surface-default);
  display: flex;
  flex-direction: column;
  gap: 0.55rem;

  &__header {
    p {
      margin: 0.25rem 0 0;
      font-size: 0.8rem;
      color: var(--color-text-subtle);
    }
  }
}

.enrichment-option {
  display: flex;
  gap: 0.55rem;
  align-items: flex-start;
  padding: 0.45rem 0.5rem;
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-sm);
  background: var(--color-surface-raised);
  cursor: pointer;

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-width: 0;
  }

  strong {
    font-size: 0.82rem;
    color: var(--color-text-default);
  }

  small {
    font-size: 0.74rem;
    color: var(--color-text-subtle);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &.is-disabled {
    opacity: 0.55;
    cursor: default;
  }
}
</style>
