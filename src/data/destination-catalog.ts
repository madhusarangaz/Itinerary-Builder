export const PROVINCES = [
  'Central Province',
  'Eastern Province',
  'North Central Province',
  'Northern Province',
  'North Western Province',
  'Sabaragamuwa Province',
  'Southern Province',
  'Uva Province',
  'Western Province',
]

export const DISTRICTS_BY_PROVINCE: Record<string, string[]> = {
  'Central Province': ['Kandy', 'Matale', 'Nuwara Eliya'],
  'Eastern Province': ['Ampara', 'Batticaloa', 'Trincomalee'],
  'North Central Province': ['Anuradhapura', 'Polonnaruwa'],
  'Northern Province': ['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'],
  'North Western Province': ['Kurunegala', 'Puttalam'],
  'Sabaragamuwa Province': ['Kegalle', 'Ratnapura'],
  'Southern Province': ['Galle', 'Hambantota', 'Matara'],
  'Uva Province': ['Badulla', 'Monaragala'],
  'Western Province': ['Colombo', 'Gampaha', 'Kalutara'],
}

export const EXPERIENCE_TYPES = [
  'Culture',
  'Heritage',
  'History',
  'Nature',
  'Wildlife',
  'Beach',
  'Adventure',
  'Wellness',
  'Tea Country',
  'Photography',
  'Food & Culinary',
  'Religious',
  'Hiking',
  'Water Sports',
  'Family',
  'Honeymoon',
  'Luxury',
  'Local Experience',
]

export const ACTIVITY_CATEGORIES = [
  'Culture',
  'Heritage',
  'Wildlife',
  'Adventure',
  'Nature',
  'Religious',
  'Beach',
  'Water Sports',
  'Food',
  'Wellness',
  'Photography',
  'Local Experience',
  'Shopping',
  'Entertainment',
  'Other',
]

export const MONTHS = [
  { n: 1, label: 'Jan' },
  { n: 2, label: 'Feb' },
  { n: 3, label: 'Mar' },
  { n: 4, label: 'Apr' },
  { n: 5, label: 'May' },
  { n: 6, label: 'Jun' },
  { n: 7, label: 'Jul' },
  { n: 8, label: 'Aug' },
  { n: 9, label: 'Sep' },
  { n: 10, label: 'Oct' },
  { n: 11, label: 'Nov' },
  { n: 12, label: 'Dec' },
]

export const AIRPORTS = [
  { code: 'CMB', name: 'Bandaranaike International Airport (CMB)' },
  { code: 'HRI', name: 'Mattala Rajapaksa International Airport (HRI)' },
]

export const SUITABLE_FOR = ['Solo Travellers', 'Couples', 'Families', 'Groups', 'Seniors', 'Children']

export function formatStay(d: { visitType: string; minimumNights?: number; idealNights?: number }) {
  if (d.visitType === 'day_trip') return 'Day trip'
  const min = d.minimumNights ?? 1
  const ideal = d.idealNights ?? min
  if (min === ideal) return `${min} night${min === 1 ? '' : 's'}`
  return `${min}–${ideal} nights`
}

export function formatDuration(minutes?: number) {
  if (!minutes) return ''
  if (minutes === 60) return '1 hour'
  if (minutes === 120) return '2 hours'
  if (minutes === 240) return 'Half day'
  if (minutes === 480) return 'Full day'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h && m) return `${h}h ${m}m`
  if (h) return `${h}h`
  return `${m}m`
}

export function formatTravel(hours: number, minutes: number) {
  const h = hours || 0
  const m = minutes || 0
  if (h && m) return `${h}h ${m}m`
  if (h) return `${h}h`
  return `${m}m`
}

export function monthRangeLabel(months: number[]) {
  if (!months.length) return ''
  if (months.length === 12) return 'All year'
  const sorted = [...months].sort((a, b) => a - b)
  const groups: number[][] = []
  for (const n of sorted) {
    const last = groups[groups.length - 1]
    if (last && last[last.length - 1] === n - 1) last.push(n)
    else groups.push([n])
  }
  return groups
    .map((g) => {
      const labels = g.map((n) => MONTHS.find((m) => m.n === n)!.label)
      if (labels.length === 1) return labels[0]
      return `${labels[0]} – ${labels[labels.length - 1]}`
    })
    .join(', ')
}
