import type { ReactNode } from 'react'
import { Check, ChevronRight, X } from 'lucide-react'
import type { Tender, TenderStatus } from '@/api/generated/tengoMockAPI.schemas'
import { formatAmount, formatDate, formatLocation } from '@/technical/format'

interface TenderCardProps {
  tender: Tender
  onReject?: (tender: Tender) => void
  onAnalyze?: (tender: Tender) => void
  onOpen?: (tender: Tender) => void
  /** Disables the action buttons (e.g. while a decision is in flight). */
  disabled?: boolean
  className?: string
}

/**
 * Presentational card for a single tender. Holds no data or query logic —
 * it renders the passed `tender` and forwards the action callbacks.
 */
export function TenderCard({
  tender,
  onReject,
  onAnalyze,
  onOpen,
  disabled = false,
  className = '',
}: TenderCardProps) {
  const status = STATUS_LABELS[tender.status] ?? {
    label: tender.status,
    className: 'bg-gray-100 text-gray-600',
  }
  const lotCount = tender.lots?.length ?? 0
  const cpv = (tender.cpvs ?? [])
    .map((c) => c.title)
    .filter(Boolean)
    .join(', ')

  return (
    <article
      className={`flex gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-gray-300 ${className}`}
    >
      <div className="min-w-0 flex-1">
        {/* Header: buyer + title on the left, actions on the right */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {tender.buyerName && (
              <p className="truncate text-sm font-medium text-teal-600">
                {tender.buyerName}
              </p>
            )}
            <h3 className="mt-0.5 font-semibold text-gray-900">
              {tender.title}
            </h3>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onReject?.(tender)}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={14} strokeWidth={2.5} />
              Rejeter
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onAnalyze?.(tender)}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={14} strokeWidth={2.5} />
              À analyser
            </button>
          </div>
        </div>

        {/* Metadata row */}
        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
          <Field label="Dates">
            <span className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${status.className}`}
              >
                {status.label}
              </span>
              <span className="text-gray-700">
                {formatDate(tender.publicationDate)} →{' '}
                {formatDate(tender.responseDeadline)}
              </span>
            </span>
          </Field>

          <Field label="Montant">{formatAmount(tender.estimatedValueInEur)}</Field>

          <Field label="Durée">
            {tender.durationInMonth != null
              ? `${tender.durationInMonth} mois`
              : '—'}
          </Field>

          <Field label="Lieu d'exéc.">{formatLocation(tender)}</Field>

          <Field label="Lots">
            {lotCount > 0 ? (
              <span className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700">
                {lotCount}
              </span>
            ) : (
              '—'
            )}
          </Field>
        </dl>

        {/* CPV */}
        {cpv && (
          <p className="mt-4 text-xs text-gray-500">
            <span className="font-medium text-gray-600">CPV :</span> {cpv}
          </p>
        )}
      </div>

      {/* Trailing open affordance */}
      <button
        type="button"
        aria-label="Ouvrir l'appel d'offres"
        onClick={() => onOpen?.(tender)}
        className="self-center rounded-md p-1 text-gray-300 transition-colors hover:bg-gray-50 hover:text-gray-500"
      >
        <ChevronRight size={20} />
      </button>
    </article>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium text-gray-400">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{children}</dd>
    </div>
  )
}

const STATUS_LABELS: Partial<
  Record<TenderStatus, { label: string; className: string }>
> = {
  OPEN: { label: 'Ouvert', className: 'bg-green-100 text-green-700' },
}

export default TenderCard
