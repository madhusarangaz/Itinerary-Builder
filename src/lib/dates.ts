import dayjs from 'dayjs'

export function nightsBetween(start: string, end: string) {
  const a = dayjs(start)
  const b = dayjs(end)
  const n = b.diff(a, 'day')
  return Number.isFinite(n) && n > 0 ? n : 0
}

/** Inclusive calendar days (arrival through departure). Nights + 1 when dates are valid. */
export function calendarDays(start: string, end: string) {
  const n = nightsBetween(start, end)
  return n > 0 ? n + 1 : 0
}

export function addDays(iso: string, amount: number) {
  return dayjs(iso).add(amount, 'day').format('YYYY-MM-DD')
}

export function formatLong(iso: string) {
  return dayjs(iso).format('D MMMM YYYY')
}

export function formatShort(iso: string) {
  return dayjs(iso).format('D MMM YYYY')
}

export function formatRange(start: string, end: string) {
  const a = dayjs(start)
  const b = dayjs(end)
  if (a.year() === b.year() && a.month() === b.month()) {
    return `${a.format('D')}–${b.format('D MMMM YYYY')}`
  }
  if (a.year() === b.year()) {
    return `${a.format('D MMMM')} – ${b.format('D MMMM YYYY')}`
  }
  return `${a.format('D MMMM YYYY')} – ${b.format('D MMMM YYYY')}`
}
