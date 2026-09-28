<template>
  <div class="area-section">
    <SectionHeader title="Histórico de vínculos">
      <span>Quem vinculou a conta a um nome dos livros ou desfez o vínculo, e quantos livros isso mudou.</span>
      <template v-if="loaded" #actions>
        <AppButton size="md" :disabled="loading" @click="loadHistory">
          {{ loading ? 'Atualizando…' : 'Atualizar' }}
        </AppButton>
      </template>
    </SectionHeader>

    <AppNotice v-if="error" :text="error" retry @retry="loadHistory" />

    <BaseSpinner v-if="loading && !loaded">
      <p>Carregando o histórico…</p>
    </BaseSpinner>

    <EmptyState
      v-else-if="loaded && history.length === 0"
      title="Ninguém vinculou um nome ainda"
      text="Quando alguém vincula a conta ao nome que aparece nos livros, fica registrado aqui."
    />

    <div v-else-if="history.length" ref="table" class="history-table panel-box" role="table" aria-label="Vínculos">
      <div class="history-table__row history-table__row--head panel-row" role="row">
        <span role="columnheader">Membro</span>
        <span role="columnheader">O que fez</span>
        <span role="columnheader">Nome</span>
        <span role="columnheader">Livros</span>
        <span role="columnheader">Quando</span>
      </div>

      <div
        v-for="item in visibleHistory"
        :key="item._id"
        class="history-table__row panel-row"
        role="row"
        tabindex="-1"
        data-list-item
      >
        <span role="cell" class="history-table__who">
          <span v-if="item.user_name" class="history-table__name">{{ item.user_name }}</span>
          <span class="history-table__email">{{ item.user_email }}</span>
        </span>
        <span role="cell" data-label="O que fez">{{ item.action === 'claim' ? 'Vinculou' : 'Desfez o vínculo' }}</span>
        <span role="cell" data-label="Nome">{{ item.claim_name || joinWords(item.previous_claim_names ?? []) || 'sem nome' }}</span>
        <span role="cell" data-label="Livros">{{ item.affected_books }}</span>
        <span role="cell" data-label="Quando">{{ formatDateTime(item.performed_at) }}</span>
      </div>
    </div>

    <ListFooter
      v-if="history.length"
      :shown="visibleHistory.length"
      :total="history.length"
      :next-batch="nextBatch"
      :capped="serverTotal > history.length"
      @more="more(table)"
    />
  </div>
</template>

<script lang="ts" setup>
import { errorText } from '@/composables/apiError'
import { onMounted, ref } from 'vue'

import { useErrorReporter } from '@/composables'
import { joinWords } from '@/data/words'
import { useLoadMore } from '@/composables/useLoadMore'
import { getClaimHistory } from '@/composables/useApi'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import AppButton from '@/components/ui/AppButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import AppNotice from '@/components/ui/AppNotice.vue'
import ListFooter from '@/components/ui/ListFooter.vue'
import type { AdminClaimHistoryEntry } from '@/types'

// The API's ceiling for this list; older records stay in the database, and the footer says the list is the recent part.
const HISTORY_LIMIT = 500

const loading = ref(false)
const loaded = ref(false)
const error = ref('')
const history = ref<AdminClaimHistoryEntry[]>([])
const serverTotal = ref(0)
const table = ref<HTMLElement | null>(null)
const { visible: visibleHistory, nextBatch, more } = useLoadMore(history, { name: 'painel-vinculos' })

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })

const loadHistory = async () => {
  loading.value = true
  error.value = ''

  try {
    const payload = await getClaimHistory(HISTORY_LIMIT)
    history.value = payload.history
    serverTotal.value = payload.total
    loaded.value = true
  } catch (e) {
    error.value = errorText(e, 'Não foi possível carregar o histórico. Tente de novo.')
    useErrorReporter().captureException(e, { context: 'AdminClaimHistory.load' })
    console.error('[AdminClaimHistory]', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadHistory)
</script>

<style lang="scss" scoped>
.history-table {
  overflow: hidden;

  &__row {
    display: grid;
    grid-template-columns: minmax(var(--col-xl), 2fr) minmax(var(--col-lg), 1.2fr) minmax(var(--col-lg), 1.4fr) minmax(var(--col-sm), 0.6fr) minmax(var(--col-date), 1fr);
    align-items: center;
    gap: var(--space-3);
    min-height: var(--row-min);
    padding-block: var(--space-2);
    font-size: var(--font-size-meta);
    color: var(--color-text-secondary);

    &--head {
      min-height: var(--touch-min);
      background: var(--color-background-subtle);
      font-size: var(--font-size-caption);
      font-weight: var(--font-weight-semibold);
    }
  }

  // Name over e-mail, the same pair as a row in Membros.
  &__who {
    display: flex;
    min-width: 0;
    flex-direction: column;
  }

  &__name {
    font-size: var(--font-size-ui);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-default);
  }

  &__email {
    font-size: var(--font-size-meta);
    color: var(--color-text-subtle);
    overflow-wrap: anywhere;
  }
}

@media (max-width: $bp-phone-max) {
  .history-table__row {
    grid-template-columns: 1fr;
    gap: var(--space-1);
    padding-block: var(--space-3);

    &--head {
      display: none;
    }

    [data-label]::before {
      content: attr(data-label) ': ';
      color: var(--color-text-subtle);
    }
  }
}
</style>
