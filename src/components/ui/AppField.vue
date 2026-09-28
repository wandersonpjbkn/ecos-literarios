<template>
  <div class="app-field" :class="attrs.class">
    <label
      v-if="!$slots.default"
      :id="labelId"
      :for="fieldId"
      class="app-field__label"
      :class="{ 'visually-hidden': hideLabel }"
      >{{ label }}</label
    >
    <span v-else :id="labelId" class="app-field__label">{{ label }}</span>

    <slot :label-id="labelId" :described-by="describedBy">
      <component
        :is="multiline ? 'textarea' : 'input'"
        :id="fieldId"
        v-bind="fieldAttrs"
        :value="model ?? ''"
        :rows="multiline ? rows : undefined"
        :maxlength="maxlength"
        :aria-describedby="describedBy"
        :aria-invalid="error ? 'true' : undefined"
        class="app-field__control"
        :class="{ 'app-field__control--multiline': multiline, 'is-invalid': error }"
        @input="model = ($event.target as HTMLInputElement).value"
        @change="commit"
      />
    </slot>

    <!-- Under the control, like the error: fields side by side keep their boxes on one line whatever the hints. -->
    <p v-if="hint" :id="hintId" class="app-field__hint">{{ hint }}</p>
    <p v-if="error" :id="errorId" class="app-field__error">{{ error }}</p>

    <span v-if="maxlength && counter" class="app-field__counter" :class="{ 'is-limit': length >= maxlength - 5 }">
      {{ length }} de {{ maxlength }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import { computed, useAttrs, useId } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    label: string
    hint?: string
    multiline?: boolean
    rows?: number
    maxlength?: number
    counter?: boolean
    // Not v-model.trim: Vue would trim every emit, eating the space being typed.
    trim?: boolean
    // For a field whose row already shows what it edits (renaming in place); screen readers still hear the label.
    hideLabel?: boolean
    // Shown under the field and read with it (aria-describedby), never only as a colour.
    error?: string
    id?: string
  }>(),
  { hint: undefined, rows: 3, maxlength: undefined, error: undefined, id: undefined },
)

const model = defineModel<string | number | null | undefined>()

// Class goes on the wrapper (grid placement); every other attribute (type, placeholder, disabled…) on the field.
const attrs = useAttrs()

const uid = useId()

const fieldAttrs = computed(() => Object.fromEntries(Object.entries(attrs).filter(([key]) => key !== 'class')))

const fieldId = computed(() => props.id ?? `field-${uid}`)
const labelId = computed(() => `${fieldId.value}-label`)
const hintId = computed(() => `${fieldId.value}-hint`)
const errorId = computed(() => `${fieldId.value}-error`)
const describedBy = computed(
  () => [props.hint && hintId.value, props.error && errorId.value].filter(Boolean).join(' ') || undefined,
)
const length = computed(() => String(model.value ?? '').length)

// Trimmed once the value is committed (change), and the field shows what was kept.
const commit = (event: Event) => {
  const field = event.target as HTMLInputElement
  if (!props.trim) return
  field.value = field.value.trim()
  model.value = field.value
}
</script>

<style lang="scss" scoped>
.app-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--space-1);

  &__label {
    font-size: var(--font-size-ui);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-default);
  }

  &__hint {
    margin: 0;
    font-size: var(--font-size-meta);
    color: var(--color-text-subtle);
  }

  &__control {
    width: 100%;
    min-height: var(--touch-min);
    padding: 0 var(--space-3);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-md);
    background: var(--color-surface-default);
    font-family: var(--font-family-body);
    font-size: var(--font-size-body);
    color: var(--color-text-default);
    transition: border-color var(--motion-transition-default);

    &::placeholder {
      color: var(--color-text-subtle);
    }

    &:hover:not(:disabled) {
      border-color: var(--color-action-border-subtle);
    }

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: var(--focus-offset-tight);
    }

    &:disabled {
      background: var(--color-background-subtle);
      color: var(--color-text-subtle);
      cursor: not-allowed;
    }

    &.is-invalid {
      border-color: var(--alert-line);
    }

    &--multiline {
      padding: var(--space-2) var(--space-3);
      line-height: var(--line-height-text);
      resize: vertical;
    }
  }

  &__error {
    margin: 0;
    font-size: var(--font-size-meta);
    color: var(--alert-ink);
  }

  &__counter {
    align-self: flex-end;
    font-size: var(--font-size-caption);
    color: var(--color-text-subtle);

    &.is-limit {
      color: var(--alert-ink);
    }
  }
}
</style>
