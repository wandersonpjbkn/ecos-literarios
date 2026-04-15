<template>
  <div class="admin-section">
    <div class="admin-section__header">
      <div>
        <h2 class="admin-section__title">Enriquecimento de capas</h2>
        <p class="admin-section__desc">
          Rode o batch de enriquecimento e acompanhe status atual, resultado da execução e histórico recente.
        </p>
      </div>

      <button class="run-btn" :disabled="isRunning || loadingStatus" @click="runEnrichment">
        <span v-if="isRunning">Executando…</span>
        <span v-else>Executar enriquecimento</span>
      </button>
    </div>

    <div class="status-grid">
      <article class="status-card">
        <p class="status-card__label">Livros com capa</p>
        <p class="status-card__value">{{ status.with_cover }} / {{ status.total }}</p>
      </article>

      <article class="status-card">
        <p class="status-card__label">Cobertura</p>
        <p class="status-card__value">{{ status.coverage_pct }}%</p>
      </article>

      <article class="status-card">
        <p class="status-card__label">Último enriquecimento</p>
        <p class="status-card__value">
          {{ status.last_enriched_at ? formatDateTime(status.last_enriched_at) : 'Ainda não executado' }}
        </p>
      </article>
    </div>

    <div v-if="loadingStatus" class="admin-state">
      <div class="spinner" aria-hidden="true" />
      <p>Atualizando status e histórico…</p>
    </div>

    <template v-else>
      <section class="execution-panel">
        <header class="execution-panel__header">
          <h3>Execução</h3>

          <label class="force-toggle" :class="{ 'is-disabled': isRunning }">
            <input v-model="force" type="checkbox" :disabled="isRunning" />
            <span>Forçar re-enriquecimento</span>
          </label>
        </header>

        <BaseSpinner v-if="isRunning" class="admin-state">
          <p>Executando lote… {{ estimatedProcessed }} / {{ estimatedTotal }} processados (estimado)</p>
        </BaseSpinner>

        <div v-else-if="runError" class="admin-state admin-state--error">
          <BaseIcon name="error" aria-hidden="true" />
          <p>{{ runError }}</p>
        </div>

        <template v-else>
          <div v-if="summary" class="summary-grid">
            <article class="summary-card summary-card--applied">
              <p>Aplicados</p>
              <strong>{{ summary.applied }}</strong>
            </article>

            <article class="summary-card summary-card--skipped">
              <p>Ignorados</p>
              <strong>{{ summary.skipped }}</strong>
            </article>

            <article class="summary-card summary-card--failed">
              <p>Falhas</p>
              <strong>{{ summary.failed }}</strong>
            </article>

            <article class="summary-card">
              <p>Total processado</p>
              <strong>{{ summary.total }}</strong>
            </article>
          </div>

          <p v-if="results.length === 0" class="admin-empty">Nenhum processamento executado nesta sessão.</p>

          <div v-else class="results-list">
            <div class="result-row result-row--header">
              <span>Livro</span>
              <span>Status</span>
              <span>Detalhes</span>
            </div>
            <div v-for="item in results" :key="item.id" class="result-row">
              <span class="result-row__title">{{ item.title }}</span>
              <span class="result-row__status" :class="`is-${item.status}`">{{ statusLabel(item.status) }}</span>
              <span class="result-row__detail">{{ item.detail || '—' }}</span>
            </div>
          </div>
        </template>
      </section>

      <section class="history-panel">
        <header class="history-panel__header">
          <h3>Histórico recente</h3>
          <button class="ghost-btn" :disabled="loadingStatus || isRunning" @click="fetchStatusAndHistory">
            Atualizar
          </button>
        </header>

        <p v-if="historyError" class="history-error">{{ historyError }}</p>
        <p v-else-if="history.length === 0" class="admin-empty">Nenhuma execução registrada ainda.</p>

        <div v-else class="history-list">
          <details v-for="run in history" :key="run.id" class="history-item">
            <summary>
              <span>{{ formatDateTime(run.finished_at) }}</span>
              <span class="history-item__meta">{{ run.total }} livros · {{ run.coverage_pct_after }}% cobertura</span>
              <span class="history-item__badge" :class="{ 'is-force': run.force }">{{
                run.force ? 'force' : 'padrão'
              }}</span>
            </summary>

            <div class="history-item__stats">
              <span
                >applied: <strong>{{ run.applied }}</strong></span
              >
              <span
                >skipped: <strong>{{ run.skipped }}</strong></span
              >
              <span
                >failed: <strong>{{ run.failed }}</strong></span
              >
              <span
                >por: <strong>{{ run.initiated_by_email }}</strong></span
              >
            </div>

            <div v-if="run.results.length" class="results-list">
              <div class="result-row result-row--header">
                <span>Livro</span>
                <span>Status</span>
                <span>Detalhes</span>
              </div>
              <div v-for="item in run.results" :key="`${run.id}-${item.book_id}`" class="result-row">
                <span class="result-row__title">{{ item.titulo }}</span>
                <span class="result-row__status" :class="`is-${item.status}`">{{ statusLabel(item.status) }}</span>
                <span class="result-row__detail">{{ item.strategy ?? item.reason ?? item.error ?? '—' }}</span>
              </div>
            </div>
          </details>
        </div>
      </section>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'

import { useAuthStore } from '@/stores'

const API_BASE = import.meta.env.VITE_API_URL as string

type ResultStatus = 'applied' | 'skipped' | 'failed'

interface EnrichmentResult {
  id: string
  title: string
  status: ResultStatus
  detail?: string
}

interface EnrichmentSummary {
  total: number
  applied: number
  skipped: number
  failed: number
}

interface EnrichmentHistoryItem {
  book_id: string
  titulo: string
  status: ResultStatus
  source?: 'google_books' | 'open_library'
  reason?: 'manual_edit' | 'not_found' | 'missing_author'
  strategy?: string
  error?: string
  cover_url?: string
}

interface EnrichmentRun {
  id: string
  started_at: string
  finished_at: string
  force: boolean
  initiated_by_email: string
  total: number
  applied: number
  skipped: number
  failed: number
  coverage_pct_after: number
  results: EnrichmentHistoryItem[]
}

const authStore = useAuthStore()

const loadingStatus = ref(false)
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

const results = ref<EnrichmentResult[]>([])
const summary = ref<EnrichmentSummary | null>(null)
const history = ref<EnrichmentRun[]>([])

const estimatedProcessed = ref(0)
const estimationTimer = ref<number | null>(null)

const estimatedTotal = computed(() => {
  if (summary.value?.total) return summary.value.total
  return status.value.without_cover || status.value.total
})

const formatDateTime = (iso: string) => {
  return new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

const statusLabel = (value: ResultStatus) => {
  const map: Record<ResultStatus, string> = {
    applied: 'applied',
    skipped: 'skipped',
    failed: 'failed',
  }
  return map[value]
}

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${authStore.token}`,
})

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
    detail: String(row.strategy ?? row.error ?? row.message ?? ''),
  }
}

const normalizeSummary = (list: EnrichmentResult[], raw: Record<string, unknown>): EnrichmentSummary => ({
  total: Number(raw.total ?? list.length),
  applied: Number(raw.enriched ?? list.filter((r) => r.status === 'applied').length),
  skipped: Number(raw.skipped ?? list.filter((r) => r.status === 'skipped').length),
  failed: Number(raw.failed ?? list.filter((r) => r.status === 'failed').length),
})

const fetchStatus = async () => {
  const res = await fetch(`${API_BASE}/admin/books/enrich/status`, { headers: authHeaders() })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const payload = (await res.json()) as {
    total: number
    with_cover: number
    without_cover: number
    coverage_pct: number
    last_enriched_at: string | null
  }

  status.value = {
    total: payload.total,
    with_cover: payload.with_cover,
    without_cover: payload.without_cover,
    coverage_pct: payload.coverage_pct,
    last_enriched_at: payload.last_enriched_at ?? '',
  }
}

const fetchHistory = async () => {
  const res = await fetch(`${API_BASE}/admin/books/enrich/history?limit=8`, { headers: authHeaders() })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const payload = (await res.json()) as {
    history?: Array<Record<string, unknown>>
  }

  history.value = (payload.history ?? []).map((run, idx) => ({
    id: String(run._id ?? run.id ?? `run-${idx}`),
    started_at: String(run.started_at ?? ''),
    finished_at: String(run.finished_at ?? ''),
    force: Boolean(run.force),
    initiated_by_email: String(run.initiated_by_email ?? '-'),
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
  } catch (e) {
    historyError.value = 'Não foi possível carregar status/histórico de enriquecimento.'
    console.error('[AdminEnrichment][status/history]', e)
  } finally {
    loadingStatus.value = false
  }
}

const startEstimation = () => {
  estimatedProcessed.value = 0

  if (estimationTimer.value) window.clearInterval(estimationTimer.value)

  estimationTimer.value = window.setInterval(() => {
    if (!estimatedTotal.value) return
    estimatedProcessed.value = Math.min(estimatedProcessed.value + 1, estimatedTotal.value)
  }, 300)
}

const stopEstimation = () => {
  if (estimationTimer.value) {
    window.clearInterval(estimationTimer.value)
    estimationTimer.value = null
  }
  estimatedProcessed.value = estimatedTotal.value
}

const runEnrichment = async () => {
  isRunning.value = true
  runError.value = ''
  startEstimation()

  try {
    const res = await fetch(`${API_BASE}/admin/books/enrich`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ force: force.value }),
    })

    if (!res.ok) {
      const payload = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
      throw new Error(payload.error ?? `HTTP ${res.status}`)
    }

    const payload = (await res.json()) as Record<string, unknown>
    const list = ((payload.results as unknown[]) ?? []).map((item, idx) => normalizeRunResult(item, idx))

    results.value = list
    summary.value = normalizeSummary(list, payload)

    await fetchStatusAndHistory()
  } catch (e) {
    runError.value = e instanceof Error ? e.message : 'Erro ao executar enriquecimento.'
    console.error('[AdminEnrichment][run]', e)
  } finally {
    stopEstimation()
    isRunning.value = false
  }
}

onMounted(fetchStatusAndHistory)
</script>

<style lang="scss" scoped>
.admin-section {
  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  &__title {
    margin: 0 0 0.25rem;
    font-family: var(--font-family-display);
    font-size: 1.4rem;
    font-weight: 400;
    color: var(--color-text-default);
  }

  &__desc {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-text-subtle);
    max-width: 65ch;
  }
}

.run-btn,
.ghost-btn {
  border: none;
  border-radius: var(--border-radius-sm);
  min-height: 40px;
  padding: 0.5rem 0.9rem;
  font-size: 0.88rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
}

.run-btn {
  background: var(--color-action-default);
  color: #fff;
}

.ghost-btn {
  background: var(--color-background-subtle);
  color: var(--color-text-default);
}

.status-grid,
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.status-grid {
  margin-bottom: 1rem;
}

.status-card,
.summary-card {
  padding: 0.9rem;
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  background: var(--color-surface-default);

  p {
    margin: 0;
    font-size: 0.78rem;
    color: var(--color-text-subtle);
  }

  strong,
  .status-card__value {
    margin-top: 0.25rem;
    display: block;
    font-size: 1.1rem;
    color: var(--color-text-default);
    font-weight: 600;
  }
}

.execution-panel,
.history-panel {
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-default);
  background: var(--color-surface-default);
  padding: 1rem;
}

.execution-panel {
  margin-bottom: 1rem;
}

.execution-panel__header,
.history-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-default);
  }
}

.force-toggle {
  display: inline-flex;
  gap: 0.45rem;
  align-items: center;
  font-size: 0.85rem;
  color: var(--color-text-subtle);

  &.is-disabled {
    opacity: 0.6;
  }
}

.admin-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 20px;
  text-align: center;
  color: var(--color-text-subtle);

  &--error {
    color: var(--color-action-default);
  }
}

.summary-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 1rem;
}

.summary-card--applied {
  border-color: color-mix(in srgb, var(--color-success-default, #2e7d32) 55%, var(--color-border-default));
}

.summary-card--skipped {
  border-color: color-mix(in srgb, var(--color-warning-default, #ed6c02) 55%, var(--color-border-default));
}

.summary-card--failed {
  border-color: color-mix(in srgb, var(--color-action-default) 45%, var(--color-border-default));
}

.results-list {
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-sm);

  overflow-y: auto;
  max-height: 400px;
}

.result-row {
  display: grid;
  grid-template-columns: minmax(0, 2fr) auto minmax(0, 2fr);
  gap: 0.75rem;
  padding: 0.7rem 0.8rem;
  border-bottom: 1px solid var(--color-border-default);
  font-size: 0.85rem;

  &:last-child {
    border-bottom: 0;
  }

  &--header {
    span {
      font-weight: 600;
      color: var(--color-text-default);
    }
  }

  &__title,
  &__detail {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__title {
    color: var(--color-text-default);
  }

  &__detail {
    color: var(--color-text-subtle);
  }

  &__status {
    font-weight: 600;
    text-transform: lowercase;

    &.is-applied {
      color: var(--color-success-default, #2e7d32);
    }

    &.is-skipped {
      color: var(--color-warning-default, #ed6c02);
    }

    &.is-failed {
      color: var(--color-action-default);
    }
  }
}

.history-list {
  display: grid;
  gap: 0.65rem;
}

.history-item {
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-sm);

  summary {
    list-style: none;
    cursor: pointer;
    padding: 0.7rem 0.8rem;
    display: grid;
    gap: 0.4rem;
    background: var(--color-background-default);
    grid-template-columns: auto 1fr auto;
    align-items: center;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  &__meta {
    color: var(--color-text-subtle);
    font-size: 0.8rem;
  }

  &__badge {
    font-size: 0.72rem;
    text-transform: uppercase;
    border: 1px solid var(--color-border-default);
    border-radius: 999px;
    padding: 0.15rem 0.45rem;

    &.is-force {
      border-color: var(--color-action-default);
      color: var(--color-action-default);
    }
  }

  &__stats {
    border-top: 1px solid var(--color-border-default);
    padding: 0.65rem 0.8rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    font-size: 0.8rem;
    color: var(--color-text-subtle);

    strong {
      color: var(--color-text-default);
      font-weight: 600;
    }
  }

  .results-list {
    margin: 0 0.8rem 0.8rem;
    background: var(--color-surface-raised);
  }
}

.history-error,
.admin-empty {
  margin: 0;
  border: 1px dashed var(--color-border-default);
  border-radius: var(--border-radius-sm);
  padding: 1rem;
  color: var(--color-text-subtle);
  text-align: center;
}

@media (max-width: 920px) {
  .status-grid,
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .admin-section {
    &__title {
      font-size: 1.2rem;
    }

    &__desc {
      font-size: 0.85rem;
    }
  }

  .status-card,
  .summary-card {
    p {
      font-size: 0.72rem;
    }

    strong,
    .status-card__value {
      font-size: 0.95rem;
      word-break: break-word;
    }
  }
}

@media (max-width: 640px) {
  .admin-section {
    &__header {
      flex-direction: column;
      align-items: stretch;
      margin-bottom: 1rem;
    }
  }

  .run-btn {
    min-height: 44px;
    align-self: flex-start;
  }

  .status-grid,
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .execution-panel,
  .history-panel {
    padding: 0.85rem;
  }

  .execution-panel__header,
  .history-panel__header {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.75rem;
  }

  .ghost-btn {
    min-height: 44px;
    width: 100%;
  }

  .result-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;

    &--header {
      display: none;
    }

    &__title,
    &__detail {
      white-space: normal;
      word-break: break-word;
    }
  }

  .history-item summary {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .history-item__badge {
    justify-self: flex-start;
  }
}
</style>
