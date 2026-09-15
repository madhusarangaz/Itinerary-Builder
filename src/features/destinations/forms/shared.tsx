import { useState, type ReactNode } from 'react'
import { StepperField } from '../../../components/ui/StepperField'
import type { ActivityCost } from '../../../types/destination'

export function SectionHead({ title, helper }: { title: string; helper: string }) {
  return (
    <>
      <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mb-4 text-xs text-gray-400">{helper}</p>
    </>
  )
}

export function MoreDetails({ children, label = 'More details' }: { children: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm text-gray-500 underline decoration-gray-300 underline-offset-2 hover:text-gray-700 dark:text-zinc-400"
      >
        {open ? 'Hide details' : label}
      </button>
      {open ? <div className="mt-3">{children}</div> : null}
    </div>
  )
}

export function DurationFields({
  label,
  hours,
  minutes,
  onChange,
}: {
  label?: string
  hours: number
  minutes: number
  onChange: (hours: number, minutes: number) => void
}) {
  return (
    <div className="mb-3">
      {label ? <p className="mb-1.5 text-sm font-normal text-gray-800 dark:text-zinc-100">{label}</p> : null}
      <div className="grid grid-cols-2 gap-3">
        <StepperField label="Hours" value={hours} min={0} max={24} onChange={(h) => onChange(h, minutes)} />
        <StepperField label="Minutes" value={minutes} min={0} max={55} step={5} onChange={(m) => onChange(hours, m)} />
      </div>
    </div>
  )
}

export function minutesToParts(total?: number) {
  const n = total ?? 0
  return { hours: Math.floor(n / 60), minutes: n % 60 }
}

export function partsToMinutes(hours: number, minutes: number) {
  return hours * 60 + minutes
}

const SYMBOL: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', AUD: 'A$', LKR: 'Rs ' }
const COST_SUFFIX: Record<string, string> = {
  per_person: '/person',
  per_group: '/group',
  per_vehicle: '/vehicle',
  flat: '',
  free: '',
  unknown: '',
}

export function formatActivityCost(cost?: ActivityCost) {
  if (!cost || cost.type === 'unknown') return ''
  if (cost.type === 'free') return 'Free'
  const symbol = SYMBOL[cost.currency] ?? `${cost.currency} `
  const amount = cost.amount ?? 0
  const suffix = COST_SUFFIX[cost.type] ?? ''
  return `${symbol}${amount}${suffix ? ` ${suffix}` : ''}`
}

export function formatUpdated(iso: string) {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const diff = Date.now() - t
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 14) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}
