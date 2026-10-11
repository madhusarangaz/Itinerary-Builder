import { Calendar } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import dayjs from 'dayjs'
import { formatRange, formatShort, nightsBetween } from '../../lib/dates'
import { BaseButton } from './BaseButton'
import { FieldAttention } from './FieldAttention'
import { GlowInputWrapper } from './GlowInputWrapper'
import 'react-day-picker/style.css'

type Props = {
  label?: string
  start: string
  end: string
  onChange: (start: string, end: string) => void
  attention?: boolean
}

function iso(date: Date) {
  return dayjs(date).format('YYYY-MM-DD')
}

function sameDay(a: Date, b: Date) {
  return iso(a) === iso(b)
}

function completeRange(range: DateRange | undefined): range is { from: Date; to: Date } {
  return Boolean(range?.from && range.to && !sameDay(range.from, range.to))
}

export function DateRangeField({ label = 'Date range', start, end, onChange, attention = false }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange | undefined>()
  const rootRef = useRef<HTMLDivElement>(null)
  const fieldId = useId()

  const startDate = start ? dayjs(start).toDate() : undefined
  const endDate = end ? dayjs(end).toDate() : undefined
  const saved: DateRange | undefined = startDate ? { from: startDate, to: endDate } : undefined
  const ready = completeRange(draft)

  useEffect(() => {
    if (!open) return
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) closeDraft()
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') closeDraft()
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function closeDraft() {
    setDraft(undefined)
    setOpen(false)
  }

  function openDraft() {
    setDraft(saved)
    setOpen(true)
  }

  function selectRange(range: DateRange | undefined) {
    if (!range?.from) {
      setDraft(undefined)
      return
    }
    if (!range.to || sameDay(range.from, range.to)) {
      setDraft({ from: range.from })
      return
    }
    const from = range.from < range.to ? range.from : range.to
    const to = range.from < range.to ? range.to : range.from
    setDraft({ from, to })
  }

  function applyDraft() {
    if (!completeRange(draft)) return
    onChange(iso(draft.from), iso(draft.to))
    setDraft(undefined)
    setOpen(false)
  }

  const valueText = start && end ? formatRange(start, end) : 'Select a date range'
  const fromLabel = draft?.from ? formatShort(iso(draft.from)) : 'Arrival'
  const toLabel = ready ? formatShort(iso(draft.to)) : 'Departure'
  const nights = ready ? nightsBetween(iso(draft.from), iso(draft.to)) : 0
  const hint = !draft?.from
    ? 'Select the arrival date, then the departure date.'
    : ready
      ? `${nights} ${nights === 1 ? 'night' : 'nights'}. Apply to update the trip.`
      : 'Now select the departure date.'

  return (
    <div ref={rootRef} id="form-dates" className="relative mb-3 scroll-mt-3 w-full space-y-1">
      <label htmlFor={fieldId} className="mb-1.5 flex items-center gap-1 text-sm font-normal text-gray-800 dark:text-zinc-100">
        {label}
      </label>
      <FieldAttention on={attention}>
      <GlowInputWrapper>
        <button
          id={fieldId}
          type="button"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={start && end ? `Date range ${valueText}` : 'Select a date range'}
          onClick={() => (open ? closeDraft() : openDraft())}
          className="relative flex h-10 w-full items-center rounded-lg border border-gray-200 bg-white pr-3 pl-9 text-left text-sm text-gray-900 hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-transparent dark:bg-zinc-800 dark:text-zinc-100 dark:shadow-[0px_0px_1px_1px_#404040] dark:hover:shadow-[0px_0px_1px_1px_#525252]"
        >
          <Calendar size={16} className="pointer-events-none absolute left-3 text-gray-400 dark:text-zinc-500" />
          <span className={start && end ? '' : 'text-gray-400 dark:text-zinc-500'}>{valueText}</span>
        </button>
      </GlowInputWrapper>
      </FieldAttention>
      {open ? (
        <div
          role="dialog"
          aria-label="Select a date range"
          className="absolute z-30 mt-2 w-[292px] rounded-xl border border-gray-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          <div className="mb-2 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
              <p className="text-[10px] font-medium tracking-wide text-gray-400 uppercase">From</p>
              <p className={`text-sm ${draft?.from ? 'text-gray-900 dark:text-zinc-100' : 'text-gray-400 dark:text-zinc-500'}`}>{fromLabel}</p>
            </div>
            <div
              className={`rounded-lg border px-2.5 py-1.5 ${
                draft?.from && !ready
                  ? 'border-[#D6E4FF] bg-[#F9FBFF] dark:border-[#5b93ff]/40 dark:bg-[#5b93ff]/10'
                  : 'border-gray-200 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800'
              }`}
            >
              <p className="text-[10px] font-medium tracking-wide text-gray-400 uppercase">To</p>
              <p className={`text-sm ${ready ? 'text-gray-900 dark:text-zinc-100' : 'text-gray-400 dark:text-zinc-500'}`}>{toLabel}</p>
            </div>
          </div>
          <DayPicker
            mode="range"
            className="trip-date-range"
            selected={draft}
            onSelect={selectRange}
            resetOnSelect
            min={2}
            defaultMonth={draft?.from ?? startDate ?? new Date()}
            numberOfMonths={1}
          />
          <p className="px-1 pt-1 text-xs text-gray-500 dark:text-zinc-400">{hint}</p>
          <div className="mt-2 flex items-center justify-end gap-2 border-t border-gray-100 pt-2 dark:border-zinc-800">
            <BaseButton variant="secondary" size="sm" onClick={closeDraft}>
              Cancel
            </BaseButton>
            <BaseButton size="sm" disabled={!ready} onClick={applyDraft}>
              Apply
            </BaseButton>
          </div>
        </div>
      ) : null}
    </div>
  )
}
