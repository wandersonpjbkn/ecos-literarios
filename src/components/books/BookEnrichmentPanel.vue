<template>
  <div class="enrichment-panel">
    <div class="enrichment-panel__trigger">
      <AppButton v-if="bookId" size="md" :disabled="disabled || isLoading" @click="fetchPreview">
        {{ isLoading ? 'Buscando…' : 'Buscar capa e dados' }}
      </AppButton>
      <p v-else class="enrichment-hint">Depois de salvar o livro, você pode buscar a capa e os dados dele.</p>
    </div>

    <AppNotice v-if="error" :text="error" />

    <div v-if="preview" class="enrichment-preview">
      <div class="enrichment-preview__header">
        <strong>Achamos em {{ preview.sourceLabel }}</strong>
        <p>Marque o que você quer usar no livro.</p>
      </div>

      <CheckRow
        v-for="item in preview.items"
        :key="item.field"
        class="enrichment-option"
        :label="item.label"
        :detail="item.preview || 'Não veio nada'"
        :checked="selectedFields.includes(item.field)"
        :disabled="!item.hasValue || isApplying || disabled"
        @change="toggleField(item.field)"
      />

      <AppButton size="md" :disabled="selectedFields.length === 0 || isApplying || disabled" @click="handleApply">
        {{ isApplying ? 'Salvando…' : 'Usar no livro' }}
      </AppButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useBookEnrichment } from '@/composables/useBookEnrichment'
import CheckRow from '@/components/ui/CheckRow.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppNotice from '@/components/ui/AppNotice.vue'
import type { BookPayload } from '@/types'

const props = defineProps<{
  bookId: string | null
  disabled?: boolean
}>()

const emit = defineEmits<{ applied: [book: BookPayload] }>()

const { isLoading, isApplying, error, preview, selectedFields, fetchPreview, applySelected, reset } = useBookEnrichment(
  () => props.bookId ?? undefined,
)

const toggleField = (field: (typeof selectedFields.value)[number]) => {
  selectedFields.value = selectedFields.value.includes(field)
    ? selectedFields.value.filter((f) => f !== field)
    : [...selectedFields.value, field]
}

async function handleApply(): Promise<void> {
  const book = await applySelected()
  if (book) emit('applied', book)
}

defineExpose({ reset })
</script>

<style lang="scss" scoped>
.enrichment-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  &__trigger {
    display: flex;
    align-items: center;
  }
}

.enrichment-hint {
  margin: 0;
  font-size: var(--font-size-caption);
  color: var(--color-text-subtle);
}

.enrichment-preview {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
  background: var(--color-surface-default);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  &__header {
    p {
      margin: var(--space-1) 0 0;
      font-size: var(--font-size-caption);
      color: var(--color-text-subtle);
    }
  }
}

</style>
