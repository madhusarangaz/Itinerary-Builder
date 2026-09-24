import type { VehicleGroup } from '../types/transport'

export const VEHICLE_CATEGORIES = [
  'Car',
  'Flat Roof Van',
  'High Roof Van',
  'Mini Coach',
  '33 Seater Coach',
  '45 Seater Coach',
] as const

export const VEHICLE_GROUP_LABELS: Record<VehicleGroup, string> = {
  car: 'Car',
  van: 'Van',
  coach: 'Coach',
  other: 'Other',
}

export const ARRIVAL_LOCATIONS = ['Colombo', 'Negombo']

export const IMAGE_SLOTS = [
  { id: 'front' as const, label: 'Front' },
  { id: 'interior' as const, label: 'Interior' },
  { id: 'side' as const, label: 'Side View' },
  { id: 'luggage' as const, label: 'Luggage Space' },
]

export function inferVehicleGroup(category: string): VehicleGroup {
  const q = category.toLowerCase()
  if (q.includes('coach')) return 'coach'
  if (q.includes('van')) return 'van'
  if (q.includes('car') || q.includes('sedan') || q.includes('suv')) return 'car'
  return 'other'
}

export function defaultLeisureKm(group: VehicleGroup) {
  return group === 'coach' ? 100 : 80
}

export function formatLkr(amount?: number) {
  if (amount == null || Number.isNaN(amount)) return '—'
  return `LKR ${amount.toLocaleString('en-LK')}`
}

export function formatCapacity(minAdults: number | undefined, maxAdults: number) {
  if (!maxAdults && !minAdults) return '—'
  if (minAdults && maxAdults && minAdults !== maxAdults) return `${minAdults}–${maxAdults} pax`
  if (maxAdults) return `${maxAdults} pax`
  return `${minAdults} pax`
}

export function formatModels(names: string[]) {
  if (!names.length) return '—'
  if (names.length <= 2) return names.join(', ')
  return `${names.slice(0, 2).join(', ')} +${names.length - 2}`
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
