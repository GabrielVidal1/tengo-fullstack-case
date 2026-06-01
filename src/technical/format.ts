import { format, isValid, parseISO } from 'date-fns'
import type { Tender } from '@/api/generated/tengoMockAPI.schemas'

/** Placeholder shown when a value is missing. */
const EMPTY = '—'

/** Formats an ISO date string as e.g. `16 January 2026`. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return EMPTY
  const date = parseISO(iso)
  return isValid(date) ? format(date, 'd MMMM yyyy') : EMPTY
}

/** Formats an amount in EUR as a compact label, e.g. `400k€`, `1,3M€`. */
export function formatAmount(value: number | null | undefined): string {
  if (value == null) return EMPTY
  if (value >= 1_000_000) {
    const millions = value / 1_000_000
    return `${millions.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}M€`
  }
  if (value >= 1_000) return `${Math.round(value / 1_000)}k€`
  return `${value}€`
}

/** Builds a human-readable execution location: `City - PostalCode`. */
export function formatLocation(tender: Tender): string {
  const city = tender.buyerContact?.location?.city
  const postalCode =
    tender.executionLocation?.postalCode ??
    tender.buyerContact?.location?.postalCode
  if (city && postalCode) return `${city} - ${postalCode}`
  return city ?? postalCode ?? EMPTY
}
