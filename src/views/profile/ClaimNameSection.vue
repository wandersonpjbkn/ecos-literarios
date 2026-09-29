<template>
  <div class="area-section">
    <SectionHeader title="Vincular meu nome">
      Os livros antigos vieram da conversa do WhatsApp, com o nome de quem falou deles.
      <template v-if="!lockedOut">
        Vincule o nome que é seu e eles passam a aparecer em Meus livros, onde você pode corrigi-los.
      </template>
    </SectionHeader>

    <BaseSpinner v-if="loading">
      <p>Carregando o vínculo…</p>
    </BaseSpinner>

    <AppNotice v-else-if="loadError" :text="loadError" retry @retry="load" />

    <template v-else-if="status?.has_claim">
      <AppNotice v-if="status.warning" live="status" :text="status.warning" />
      <div class="claim-card width-column">
        <UserAvatar :alt="status.claim_name ?? ''" />
        <div class="claim-card__who">
          <p class="claim-card__name">Você é "{{ status.claim_name }}" no catálogo</p>
          <p class="claim-card__count">{{ claimedText }}</p>
        </div>
        <div class="claim-card__actions">
          <AppButton size="md" :to="{ name: 'profile-books' }">Ver meus livros</AppButton>
          <AppButton size="md" @click="openUndo">Desfazer o vínculo</AppButton>
        </div>
      </div>
    </template>

    <!-- Linking follows the matrix (claim: update); a Visitante sees why instead of a form. -->
    <div v-else-if="!canClaim" class="claim-locked">
      <p class="claim-locked__text">
        Vincular um nome do grupo não está liberado para a sua conta.
        <template v-if="!accessRequest">Se você é do clube, fale com um Administrador.</template>
      </p>
      <AppButton v-if="accessRequest" variant="primary" size="md" :href="accessRequest"
        ><BaseIcon name="whatsapp" aria-hidden="true" />Pedir a liberação</AppButton
      >
    </div>

    <form v-else class="claim-form width-form" @submit.prevent="submitClaim">
      <AppField label="Escolha o seu nome" hint="É o nome que aparece nos livros que você mencionou.">
        <template #default="{ labelId, describedBy }">
          <MultiSelect
            label="Escolher o nome"
            :labelledby="labelId"
            :aria-describedby="describedBy"
            :options="availableNames"
            :selected="chosenName"
            :multiple="false"
            :searchable="true"
            @toggle="(v) => (chosenName = v)"
          />
        </template>
      </AppField>
      <AppNotice v-if="actionError" :text="actionError" />
      <AppButton type="submit" variant="primary" :disabled="isSubmitting || !chosenName">
        {{ isSubmitting ? 'Vinculando…' : 'Vincular este nome' }}
      </AppButton>
    </form>

    <ul v-if="canClaim || status?.has_claim" class="claim-rules">
      <li>Um nome por vez: para trocar, desfaça o vínculo e escolha outro.</li>
      <li>Um nome que outra pessoa já vinculou não aparece na lista.</li>
    </ul>

    <ConfirmModal
      v-model="undo.open"
      :title="`Desfazer o vínculo com &quot;${status?.claim_name}&quot;?`"
      destructive
      description="Os livros saem de Meus livros e o nome volta a ficar livre."
      confirm-label="Desfazer o vínculo"
      busy-label="Desfazendo…"
      :error="undo.error"
      :loading="undo.loading"
      @confirm="unclaim"
      @cancel="undo.open = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'

import type { MyClaimStatus } from '@/types'

import { useAuthStore, useBooksStore, usePermissionsStore } from '@/stores'

import { useAccessRequest, useApi, useErrorReporter, useToast } from '@/composables'
import { reloadAccount } from '@/composables/accountSync'
import { errorText } from '@/composables/apiError'
import { claimRegister, getMyClaimStatus, unclaimRegister } from '@/composables/useApi'

import AppButton from '@/components/ui/AppButton.vue'
import AppField from '@/components/ui/AppField.vue'
import AppNotice from '@/components/ui/AppNotice.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import MultiSelect from '@/components/ui/MultiSelect.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import UserAvatar from '@/components/ui/UserAvatar.vue'

const authStore = useAuthStore()
const booksStore = useBooksStore()
const permissions = usePermissionsStore()
const toast = useToast()

const status = ref<MyClaimStatus | null>(null)
const loading = ref(false)
const loadError = ref('')
const actionError = ref('')
const isSubmitting = ref(false)
const chosenName = ref('')
const undo = reactive({ open: false, loading: false, error: '' })

// Placeholders no account has linked; a book added after a claim may lack its owner, so its name is not free.
const availableNames = computed(() => {
  const taken = new Set(booksStore.books.filter((b) => b.quem_user_id && b.quem_nome).map((b) => b.quem_nome))
  const free = booksStore.books
    .filter((b) => !b.quem_user_id && b.quem_nome && !taken.has(b.quem_nome))
    .map((b) => b.quem_nome as string)
  return [...new Set(free)].sort((a, b) => a.localeCompare(b, 'pt-BR'))
})
const canClaim = computed(() => permissions.can('claim', 'update'))
const accessRequest = useAccessRequest()
// Known to lack the permission: the invitation to link would contradict the refusal below.
const lockedOut = computed(() => !!permissions.mine && !canClaim.value && !status.value?.has_claim)

const claimedText = computed(() => {
  const n = status.value?.claimed_books ?? 0
  if (n === 0) return 'Nenhum livro com esse nome ainda.'
  return n === 1 ? '1 livro mencionado com esse nome é seu' : `${n} livros mencionados com esse nome são seus`
})

const load = async () => {
  loading.value = true
  loadError.value = ''
  try {
    status.value = await getMyClaimStatus()
  } catch (err) {
    loadError.value = errorText(err, 'Não foi possível carregar o vínculo. Tente de novo.')
    useErrorReporter().captureException(err, { context: 'ClaimNameSection.load' })
  } finally {
    loading.value = false
  }
}

const submitClaim = async () => {
  if (!chosenName.value) return
  isSubmitting.value = true
  actionError.value = ''

  try {
    const result = await claimRegister(chosenName.value)
    if (result.name_synced && result.claim_name && authStore.user) {
      authStore.user = { ...authStore.user, name: result.claim_name }
    }
    const linked = result.updated_books
    // The API's own message says "claim"; the screen keeps its words (COPY.md).
    toast.show(
      typeof linked === 'number'
        ? `Pronto: ${linked === 1 ? '1 livro vinculado' : `${linked} livros vinculados`} ao seu nome.`
        : 'Nome vinculado.',
    )
    chosenName.value = ''
    await Promise.all([load(), reloadAccount()])
    useApi().fetchBooks()
  } catch (err) {
    actionError.value = errorText(err, 'Não foi possível vincular o nome. Tente de novo.')
    useErrorReporter().captureException(err, { context: 'ClaimNameSection.submit', quemNome: chosenName.value })
  } finally {
    isSubmitting.value = false
  }
}

const openUndo = () => {
  undo.error = ''
  undo.open = true
}

// A refused undo stays in the dialog, where the person acted; confirming again retries it.
const unclaim = async () => {
  undo.loading = true
  undo.error = ''
  try {
    await unclaimRegister()
    undo.open = false
    toast.show('Vínculo desfeito. Os livros saíram de Meus livros.')
    await Promise.all([load(), reloadAccount()])
    useApi().fetchBooks()
  } catch (err) {
    undo.error = errorText(err, 'Não foi possível desfazer o vínculo. Tente de novo.')
    useErrorReporter().captureException(err, { context: 'ClaimNameSection.unclaim' })
  } finally {
    undo.loading = false
  }
}

onMounted(load)
</script>

<style lang="scss" scoped>
.claim-locked {
  display: flex;
  max-width: var(--text-column);
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);

  &__text {
    margin: 0;
    font-size: var(--font-size-ui);
    line-height: var(--line-height-text);
    color: var(--color-text-secondary);
  }
}

.claim-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3) var(--space-4);
  padding: var(--space-4);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  background: var(--color-background-subtle);

  &__who {
    flex: 1 1 var(--field-basis-sm);
    min-width: 0;
  }

  &__name {
    margin: 0;
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-default);
  }

  &__count {
    margin: var(--space-1) 0 0;
    font-size: var(--font-size-meta);
    color: var(--color-text-secondary);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
}

.claim-form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);

  :deep(.app-field) {
    width: 100%;
    max-width: var(--dialog-max);
  }
}

.claim-rules {
  margin: var(--space-4) 0 0;
  padding-left: var(--space-5);
  font-size: var(--font-size-meta);
  color: var(--color-text-subtle);

  li + li {
    margin-top: var(--space-1);
  }
}
</style>
