<template>
  <div class="area-section">
    <SectionHeader title="Capas e sinopses">
      <span>Procura capa, sinopse, páginas e ano dos livros no Google Books e na Open Library.</span>
    </SectionHeader>

    <AppNotice v-if="historyError" :text="historyError" retry @retry="fetchStatusAndHistory" />

    <BaseSpinner v-if="loadingStatus && !loadedOnce">
      <p>Carregando o que já foi feito…</p>
    </BaseSpinner>

    <div v-if="loadedOnce" class="status-grid">
      <article class="status-card">
        <p class="status-card__label">Livros com capa</p>
        <p class="status-card__value">{{ status.with_cover }} de {{ status.total }} ({{ status.coverage_pct }}%)</p>
      </article>
      <article class="status-card">
        <p class="status-card__label">Sem capa</p>
        <p class="status-card__value">{{ status.without_cover }}</p>
      </article>
      <article class="status-card">
        <p class="status-card__label">Última busca</p>
        <p class="status-card__value">
          {{ status.last_enriched_at ? formatDateTime(status.last_enriched_at) : 'Nenhuma ainda' }}
        </p>
      </article>
    </div>

    <section class="enrich-panel panel-box" aria-labelledby="run-title">
      <h3 id="run-title" class="enrich-panel__title">Buscar agora</h3>
      <div class="run-controls">
        <CheckRow
          class="force-toggle"
          label="Buscar também nos livros que já têm capa"
          :checked="force"
          :disabled="isRunning"
          @change="force = ($event.target as HTMLInputElement).checked"
        />
        <AppButton variant="primary" :disabled="isRunning || loadingStatus || nothingToSearch" @click="runEnrichment">
          {{ isRunning ? 'Buscando…' : 'Buscar capas e dados' }}
        </AppButton>
      </div>

      <BaseSpinner v-if="isRunning">
        <p>Buscando em {{ booksWord(searchTotal) }}. Pode levar alguns minutos.</p>
      </BaseSpinner>

      <AppNotice v-else-if="runError" class="enrich-panel__notice" :text="runError" />

      <template v-else-if="summary">
        <div class="summary-grid">
          <article class="summary-card panel-box">
            <p>Preenchidos</p>
            <strong>{{ summary.applied }}</strong>
          </article>
          <article class="summary-card panel-box">
            <p>Pulados</p>
            <strong>{{ summary.skipped }}</strong>
          </article>
          <article class="summary-card panel-box">
            <p>Sem resultado</p>
            <strong>{{ summary.failed }}</strong>
          </article>
          <article class="summary-card panel-box">
            <p>Total</p>
            <strong>{{ summary.total }}</strong>
          </article>
        </div>

        <ul v-if="results.length" ref="resultList" class="result-list">
          <li v-for="item in visibleResults" :key="item.id" class="result-row" tabindex="-1" data-list-item>
            <span class="result-row__title">{{ item.title }}</span>
            <span class="result-row__status">{{ statusLabel(item.status) }}</span>
            <span v-if="item.detail" class="result-row__detail">{{ item.detail }}</span>
          </li>
        </ul>
        <ListFooter
          v-if="results.length"
          :shown="visibleResults.length"
          :total="results.length"
          :next-batch="nextBatch"
          @more="more(resultList)"
        />
      </template>

      <p v-else-if="nothingToSearch" class="enrich-panel__hint">Não há livros no acervo para buscar.</p>
    </section>

    <section v-if="loadedOnce" class="enrich-panel panel-box" aria-labelledby="history-title">
      <header class="enrich-panel__header">
        <h3 id="history-title" class="enrich-panel__title">Histórico recente</h3>
        <AppButton size="md" :disabled="loadingStatus || isRunning" @click="fetchStatusAndHistory">
          {{ loadingStatus ? 'Atualizando…' : 'Atualizar' }}
        </AppButton>
      </header>

      <EmptyState
        v-if="history.length === 0"
        title="Nenhuma busca ainda"
        text="Aqui aparece o que mudou em cada livro depois de cada busca."
      />

      <div v-else class="history-list">
        <details v-for="run in history" :key="run.id" class="history-item">
          <summary class="history-item__summary">
            <BaseIcon name="chevron" class="history-item__chevron" aria-hidden="true" />
            <span class="history-item__when">{{ formatDateTime(run.finished_at) }}</span>
            <span class="history-item__meta"
              >{{ booksWord(run.total) }} · {{ run.coverage_pct_after }}% com capa depois</span
            >
            <AppBadge v-if="run.force">Incluiu os que já tinham capa</AppBadge>
          </summary>

          <p class="history-item__stats">
            {{ counted(run.applied, 'preenchido', 'preenchidos') }} · {{ counted(run.skipped, 'pulado', 'pulados') }} ·
            {{ run.failed }} sem resultado
            <template v-if="run.initiated_by_email"> · por {{ run.initiated_by_email }}</template>
          </p>

          <ul v-if="run.results.length" class="result-list">
            <li v-for="item in run.results" :key="`${run.id}-${item.book_id}`" class="result-row">
              <span class="result-row__title">{{ item.titulo }}</span>
              <span class="result-row__status">{{ statusLabel(item.status) }}</span>
              <span v-if="detailOf(item)" class="result-row__detail">{{ detailOf(item) }}</span>
            </li>
          </ul>
        </details>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { errorText } from '@/composables/apiError'
import { computed, onMounted, ref } from 'vue'

import { useErrorReporter } from '@/composables'
import { getEnrichmentHistory, getEnrichmentStatus, runEnrichment as runEnrichmentBatch } from '@/composables/useApi'
import { counted } from '@/data/words'
import { useLoadMore } from '@/composables/useLoadMore'
import ListFooter from '@/components/ListFooter.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import AppButton from '@/components/AppButton.vue'
import CheckRow from '@/components/CheckRow.vue'
import EmptyState from '@/components/EmptyState.vue'
import AppBadge from '@/components/AppBadge.vue'
import AppNotice from '@/components/AppNotice.vue'
import type { ResultStatus, EnrichmentResult, EnrichmentSummary, EnrichmentRun } from '@/types'

const loadingStatus = ref(false)
// Numbers only after the first answer: before it, "0 / 0" and "Ainda não executado" would be invented.
const loadedOnce = ref(false)

const isRunning = ref(false)
const runError = ref('')
const historyError = ref('')
const force = ref(false)

const status = ref({
  total: 0,
  with_cover: 0,
  without_cover: 0,
  coverage_pct: 0,
  last_enriched_at: '',
})

const nothingToSearch = computed(() => loadedOnce.value && status.value.total === 0)

const results = ref<EnrichmentResult[]>([])
const summary = ref<EnrichmentSummary | null>(null)
const history = ref<EnrichmentRun[]>([])

const resultList = ref<HTMLElement | null>(null)
// Only the latest run pages: a second list on this screen would share the same ?ver= in the URL.
const { visible: visibleResults, nextBatch, more } = useLoadMore(results, { name: 'painel-capas' })

// The API does not report progress, so the screen says how many books this run covers, not a made-up count.
const searchTotal = computed(() => (force.value ? status.value.total : status.value.without_cover))
const booksWord = (n: number) => counted(n, 'livro', 'livros')

const formatDateTime = (iso: string) => {
  return new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

const statusLabel = (value: ResultStatus) => {
  const map: Record<ResultStatus, string> = {
    applied: 'Preenchido',
    skipped: 'Pulado',
    failed: 'Sem resultado',
  }
  return map[value]
}

// The API answers with codes (isbn, manual_edit…); the panel says what happened to the book.
const DETAILS: Record<string, string> = {
  isbn: 'Achado pelo ISBN no Google Books',
  title_author_pt: 'Achado por título e autor, edição em português',
  title_author: 'Achado por título e autor no Google Books',
  openlibrary_isbn: 'Achado pelo ISBN na Open Library',
  openlibrary_title_author: 'Achado por título e autor na Open Library',
  manual_edit: 'Alguém corrigiu à mão, então não mexemos',
  missing_author: 'Falta o autor para procurar',
  not_found: 'Não achamos este livro',
}

// A code the panel does not know yet still reads as a sentence, never as the raw code.
const detailOf = (row: { strategy?: unknown; reason?: unknown; error?: unknown }) => {
  if (typeof row.strategy === 'string' && row.strategy) return DETAILS[row.strategy] ?? 'Achado em outra fonte'
  if (typeof row.reason === 'string' && row.reason) return DETAILS[row.reason] ?? 'Pulado por outro motivo'
  return row.error ? 'Não deu pra buscar este livro' : ''
}

const parseResultStatus = (raw: unknown): ResultStatus => {
  if (raw === 'applied' || raw === 'skipped' || raw === 'failed') return raw
  return 'failed'
}

const normalizeRunResult = (raw: unknown, idx: number): EnrichmentResult => {
  const row = (raw ?? {}) as Record<string, unknown>

  return {
    id: String(row.id ?? row.book_id ?? row._id ?? `result-${idx}`),
    title: String(row.titulo ?? row.title ?? `Livro ${idx + 1}`),
    status: parseResultStatus(row.status),
    detail: detailOf(row),
  }
}

const normalizeSummary = (list: EnrichmentResult[], raw: Record<string, unknown>): EnrichmentSummary => ({
  total: Number(raw.total ?? list.length),
  applied: Number(raw.enriched ?? list.filter((r) => r.status === 'applied').length),
  skipped: Number(raw.skipped ?? list.filter((r) => r.status === 'skipped').length),
  failed: Number(raw.failed ?? list.filter((r) => r.status === 'failed').length),
})

const fetchStatus = async () => {
  const payload = await getEnrichmentStatus()

  status.value = {
    total: payload.total,
    with_cover: payload.with_cover,
    without_cover: payload.without_cover,
    coverage_pct: payload.coverage_pct,
    last_enriched_at: payload.last_enriched_at ?? '',
  }
}

const fetchHistory = async () => {
  const payload = await getEnrichmentHistory(8)

  history.value = (payload.history ?? []).map((run, idx) => ({
    id: String(run._id ?? run.id ?? `run-${idx}`),
    started_at: String(run.started_at ?? ''),
    finished_at: String(run.finished_at ?? ''),
    force: Boolean(run.force),
    initiated_by_email: String(run.initiated_by_email ?? ''),
    total: Number(run.total ?? 0),
    applied: Number(run.enriched ?? 0),
    skipped: Number(run.skipped ?? 0),
    failed: Number(run.failed ?? 0),
    coverage_pct_after: Number(run.coverage_pct_after ?? 0),
    results: ((run.results as unknown[]) ?? []).map((r) => {
      const row = (r ?? {}) as Record<string, unknown>
      return {
        book_id: String(row.book_id ?? row.id ?? ''),
        titulo: String(row.titulo ?? row.title ?? 'Livro'),
        status: parseResultStatus(row.status),
        source: row.source === 'google_books' || row.source === 'open_library' ? row.source : undefined,
        reason:
          row.reason === 'manual_edit' || row.reason === 'not_found' || row.reason === 'missing_author'
            ? row.reason
            : undefined,
        strategy: typeof row.strategy === 'string' ? row.strategy : '',
        error: typeof row.error === 'string' ? row.error : '',
        cover_url: typeof row.cover_url === 'string' ? row.cover_url : '',
      }
    }),
  }))
}

const fetchStatusAndHistory = async () => {
  loadingStatus.value = true
  historyError.value = ''
  runError.value = ''

  try {
    await Promise.all([fetchStatus(), fetchHistory()])
    loadedOnce.value = true
  } catch (e) {
    useErrorReporter().captureException(e, { context: 'AdminEnrichment.fetchStatus' })
    historyError.value = errorText(e, 'Não deu pra carregar o que já foi feito. Tente de novo.')
    console.error('[AdminEnrichment][status/history]', e)
  } finally {
    loadingStatus.value = false
  }
}

const runEnrichment = async () => {
  isRunning.value = true
  runError.value = ''

  try {
    const payload = await runEnrichmentBatch(force.value)
    const list = ((payload.results as unknown[]) ?? []).map((item, idx) => normalizeRunResult(item, idx))

    results.value = list
    summary.value = normalizeSummary(list, payload)

    await fetchStatusAndHistory()
  } catch (e) {
    runError.value = errorText(e, 'Não deu pra buscar os dados. Tente de novo.')
    useErrorReporter().captureException(e, { context: 'AdminEnrichment.run' })
    console.error('[AdminEnrichment][run]', e)
  } finally {
    isRunning.value = false
  }
}

onMounted(fetchStatusAndHistory)
</script>

<style lang="scss" scoped>
.status-grid,
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--stat-min), 1fr));
  gap: var(--space-3);
}

.status-grid {
  margin-bottom: var(--space-4);
}

.status-card,
.summary-card {
  padding: var(--space-4);

  p {
    margin: 0;
    font-size: var(--font-size-meta);
    color: var(--color-text-subtle);
  }

  strong,
  .status-card__value {
    display: block;
    margin-top: var(--space-1);
    font-size: var(--font-size-section);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-default);
  }
}

.enrich-panel {
  margin-bottom: var(--space-4);
  padding: var(--space-4) var(--space-5);

  &__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    margin-bottom: var(--space-3);
  }

  &__title {
    margin: 0;
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-default);
  }

  &__hint {
    margin: 0;
    font-size: var(--font-size-ui);
    color: var(--color-text-subtle);
  }

  &__notice {
    margin-bottom: 0;
  }
}

// The option sits right above the action it changes: first the setting, then the button, never side by side.
.run-controls {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-4);
  margin: var(--space-3) 0 var(--space-4);
}

.summary-grid {
  margin-bottom: var(--space-3);
}

.result-list {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--color-border-default);
}

.result-row {
  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: var(--focus-offset-inset);
  }

  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(var(--col-md), auto) minmax(0, 2fr);
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border-default);
  font-size: var(--font-size-meta);

  &:last-child {
    border-bottom: none;
  }

  &__title {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-default);
  }

  &__status {
    color: var(--color-text-default);
  }

  &__detail {
    color: var(--color-text-subtle);
  }
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.history-item {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);

  &__summary {
    display: flex;
    flex-wrap: wrap;
    min-height: var(--touch-min);
    align-items: center;
    gap: var(--space-1) var(--space-3);
    padding: var(--space-2) var(--space-4);
    list-style: none;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--color-border-focus);
      outline-offset: var(--focus-offset);
    }
  }

  &__summary::-webkit-details-marker {
    display: none;
  }

  &__chevron {
    width: var(--icon-sm);
    height: var(--icon-sm);
    color: var(--color-text-subtle);
    transition: transform var(--motion-transition-default);

    [open] > summary > & {
      transform: rotate(180deg);
    }
  }

  &__when {
    font-size: var(--font-size-ui);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-default);
  }

  &__meta {
    font-size: var(--font-size-meta);
    color: var(--color-text-subtle);
  }

  &__stats {
    margin: 0;
    padding: 0 var(--space-4) var(--space-3);
    font-size: var(--font-size-meta);
    color: var(--color-text-secondary);
  }

  .result-list {
    margin: 0 var(--space-4) var(--space-2);
  }
}

@media (max-width: $bp-phone-max) {
  .enrich-panel {
    padding: var(--space-4);
  }

  .result-row {
    grid-template-columns: 1fr auto;

    &__detail {
      grid-column: 1 / -1;
    }
  }
}
</style>
