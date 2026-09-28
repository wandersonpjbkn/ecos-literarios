<template>
  <div class="area-section">
    <SectionHeader title="Você">O seu nome, o e-mail com que você entra e o seu nível.</SectionHeader>

    <form class="you width-form" @submit.prevent="submit">
      <AppField
        id="account-name"
        v-model="name"
        trim
        label="Seu nome"
        hint="Aparece no menu da conta e na lista de membros do clube."
        :maxlength="60"
        counter
        :error="error"
        :disabled="isSubmitting"
        autocomplete="name"
      />
      <AppField
        id="account-email"
        :model-value="authStore.user?.email"
        label="E-mail de acesso"
        hint="Você entra sempre por um link enviado para esse e-mail, sem senha."
        type="email"
        disabled
      />
    </form>

    <div v-if="isChanged" class="you__actions">
      <AppButton size="md" :disabled="isSubmitting" @click="reset">Cancelar</AppButton>
      <AppButton variant="primary" size="md" :disabled="isSubmitting || !isValid" @click="submit">
        {{ isSubmitting ? 'Salvando…' : 'Salvar o nome' }}
      </AppButton>
    </div>

    <p class="you__level">
      Nível de permissão: <strong>{{ roleLabel(authStore.user?.role ?? 'viewer') }}</strong
      >. O e-mail e o nível não mudam por aqui; se precisar, fale com um Administrador do clube.
    </p>
  </div>
</template>

<script lang="ts" setup>
import { errorText } from '@/composables/apiError'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import { computed, ref } from 'vue'

import { useErrorReporter, useToast } from '@/composables'
import { saveMyName } from '@/composables/useApi'
import { roleLabel } from '@/data/roles'
import { useAuthStore } from '@/stores'
import AppButton from '@/components/ui/AppButton.vue'
import AppField from '@/components/ui/AppField.vue'

const authStore = useAuthStore()
const toast = useToast()

const name = ref(authStore.user?.name ?? '')
const isSubmitting = ref(false)
const error = ref('')

// Same rule as PATCH /users/me: not empty (the 60 limit is the field's maxlength).
const isValid = computed(() => name.value.trim().length > 0)
const isChanged = computed(() => name.value.trim() !== authStore.user?.name)

const reset = () => {
  name.value = authStore.user?.name ?? ''
  error.value = ''
}

const submit = async () => {
  if (!isChanged.value) return
  if (!isValid.value) {
    error.value = 'Escreva o seu nome.'
    return
  }
  isSubmitting.value = true
  error.value = ''

  try {
    const updated = await saveMyName(name.value.trim())
    if (authStore.user) authStore.user = { ...authStore.user, name: updated.name }
    name.value = updated.name
    toast.show('Nome salvo.')
  } catch (err) {
    error.value = errorText(err, 'Não foi possível salvar o nome. Tente de novo.')
    useErrorReporter().captureException(err, { context: 'AccountNameSection.submit' })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.you {
  // One field per line, each at a readable width: side by side they squeezed each other.
  display: flex;
  max-width: var(--form-max);
  flex-direction: column;
  gap: var(--space-4);

  &__actions {
    display: flex;
    max-width: var(--form-max);
    justify-content: flex-end;
    gap: var(--space-2);
    margin-top: var(--space-4);
  }

  &__level {
    margin: var(--space-4) 0 0;
    font-size: var(--font-size-meta);
    color: var(--color-text-subtle);
  }
}
</style>
