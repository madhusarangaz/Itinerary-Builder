import { ArrowLeft, ChevronDown, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import type { SaveStatus } from '../../types/itinerary'

export type ReadinessItem = { id: string; label: string }

type TitlePhase = 'rest' | 'travel' | 'hold'

function CrumbTitle({ text }: { text: string }) {
  const outerRef = useRef<HTMLSpanElement>(null)
  const innerRef = useRef<HTMLSpanElement>(null)
  const distanceRef = useRef(0)
  const [overflowing, setOverflowing] = useState(false)
  const [offset, setOffset] = useState(0)
  const [duration, setDuration] = useState(0)
  const [phase, setPhase] = useState<TitlePhase>('rest')

  useLayoutEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return
    const measure = () => {
      const extra = Math.ceil(inner.scrollWidth - outer.clientWidth)
      distanceRef.current = extra > 8 ? extra : 0
      setOverflowing(extra > 8)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(outer)
    return () => observer.disconnect()
  }, [text])

  useEffect(() => {
    setOffset(0)
    setPhase('rest')
    setDuration(0)
    if (!overflowing) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cancel = false
    let timer = 0
    const later = (ms: number, run: () => void) => {
      timer = window.setTimeout(() => {
        if (!cancel) run()
      }, ms)
    }

    const cycle = () => {
      const distance = distanceRef.current
      if (distance < 8) return
      const travel = Math.min(5200, Math.max(1400, Math.round((distance / 42) * 1000)))
      setPhase('travel')
      setDuration(travel)
      setOffset(distance)
      later(travel, () => {
        setPhase('hold')
        later(1100, () => {
          setPhase('travel')
          setDuration(650)
          setOffset(0)
          later(650, () => {
            setPhase('rest')
            setDuration(0)
            later(4500, cycle)
          })
        })
      })
    }

    later(1000, cycle)
    return () => {
      cancel = true
      window.clearTimeout(timer)
    }
  }, [overflowing, text])

  const mask = !overflowing
    ? undefined
    : phase === 'hold'
      ? 'linear-gradient(to right, transparent, #000 1.5rem)'
      : phase === 'travel'
        ? 'linear-gradient(to right, transparent, #000 1.15rem, #000 calc(100% - 1.15rem), transparent)'
        : 'linear-gradient(to right, #000 calc(100% - 1.75rem), transparent)'

  return (
    <span className="group relative block w-max min-w-0 max-w-[12rem]">
      <span
        ref={outerRef}
        className="block overflow-hidden font-medium text-gray-950 dark:text-white"
        style={mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
      >
        <span
          ref={innerRef}
          className="inline-block whitespace-nowrap"
          style={{
            transform: offset ? `translateX(-${offset}px)` : undefined,
            transition: duration ? `transform ${duration}ms ease-in-out` : undefined,
          }}
        >
          {text}
        </span>
      </span>
      {overflowing ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute top-full left-0 z-30 mt-1.5 hidden w-max max-w-sm rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium whitespace-normal text-gray-950 shadow-lg group-hover:block dark:border-[#2C2A2A] dark:bg-[#0C0C0E] dark:text-white"
        >
          {text}
        </span>
      ) : null}
    </span>
  )
}

export function BuilderHeader({
  saveStatus,
  onClose,
  onShowPreview,
  showPreviewToggle,
  title = 'Create Itinerary',
  subtitle = 'Type: Custom tour',
  previewLabel = 'Show preview',
  actions,
  statusFirst = false,
  progress,
  progressLabel = 'Itinerary completion',
  readiness,
  backLabel,
  crumb,
  blend = false,
}: {
  saveStatus: SaveStatus
  onClose: () => void
  onShowPreview?: () => void
  showPreviewToggle?: boolean
  title?: string
  subtitle?: string
  previewLabel?: string
  actions?: ReactNode
  statusFirst?: boolean
  progress?: number
  progressLabel?: string
  readiness?: {
    items: ReadinessItem[]
    open: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (id: string) => void
    readyLabel?: string
    hint?: string
  }
  backLabel?: string
  crumb?: { parent: string; current: string }
  blend?: boolean
}) {
  const label = saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Autosaved just now' : ''
  const readinessRoot = useRef<HTMLDivElement>(null)
  const items = readiness?.items ?? []
  const shown = items.slice(0, 1)
  const hidden = items.length - shown.length

  useEffect(() => {
    if (!readiness?.open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') readiness?.onOpenChange(false)
    }
    function onPointer(event: MouseEvent) {
      if (!readinessRoot.current?.contains(event.target as Node)) readiness?.onOpenChange(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
    }
  }, [readiness])

  return (
    <div className={`sticky top-0 z-10 rounded-[16px] bg-white ${blend ? 'dark:bg-[#101012]' : 'dark:bg-[#0C0C0E]'}`}>
      <div className="flex items-start justify-between gap-4 px-6 pt-4">
        <div className="min-w-0 flex-1">
          <div className="flex h-10 min-w-0 items-center gap-3">
            {crumb ? (
              <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex shrink-0 items-center gap-1 text-gray-500 hover:text-gray-950 dark:text-zinc-400 dark:hover:text-white"
                >
                  <ArrowLeft size={14} />
                  {crumb.parent}
                </button>
                <span className="text-gray-300 dark:text-zinc-600" aria-hidden>
                  /
                </span>
                <CrumbTitle text={crumb.current} />
              </nav>
            ) : (
              <h2 className="shrink-0 text-base text-black dark:text-white">{title}</h2>
            )}
            {progress != null ? (
              <div className="flex shrink-0 items-center gap-2">
                <div
                  className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10"
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={progressLabel}
                >
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs tabular-nums text-gray-500 dark:text-zinc-400">{progress}%</span>
              </div>
            ) : null}
            {readiness && items.length === 0 ? (
              <span className="shrink-0 text-xs font-medium text-emerald-700 dark:text-emerald-400">{readiness.readyLabel ?? 'Ready to send'}</span>
            ) : null}
            {readiness && items.length > 0 ? (
              <div ref={readinessRoot} className="relative flex min-w-0 flex-1 items-center gap-2">
                {shown.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    title={item.label}
                    onClick={() => readiness.onSelect(item.id)}
                    className="min-w-0 max-w-[220px] truncate text-left text-xs text-gray-600 hover:text-gray-950 hover:underline dark:text-zinc-300 dark:hover:text-white"
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  aria-expanded={readiness.open}
                  aria-label={hidden > 0 ? `${hidden} more still open` : 'Show what is still open'}
                  onClick={() => readiness.onOpenChange(!readiness.open)}
                  className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-gray-500 hover:text-gray-950 dark:text-zinc-400 dark:hover:text-white"
                >
                  {hidden > 0 ? `+${hidden}` : null}
                  <ChevronDown size={14} className={readiness.open ? 'rotate-180' : ''} />
                </button>
                {readiness.open ? (
                  <div className="absolute top-full left-0 z-30 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-[#2C2A2A] dark:bg-[#0C0C0E]">
                    <div className="border-b border-gray-100 px-3 py-2 dark:border-[#2C2A2A]">
                      <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase dark:text-zinc-500">Still open</p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">{readiness.hint ?? 'Fill these in, then generate the PDF.'}</p>
                    </div>
                    <ul className="max-h-72 overflow-y-auto py-1">
                      {items.map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => readiness.onSelect(item.id)}
                            className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-zinc-200 dark:hover:bg-white/5"
                          >
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <p className="text-sm text-gray-500 opacity-70 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className="flex h-10 shrink-0 items-center gap-3">
          {statusFirst && label ? <span className="hidden text-xs text-gray-400 sm:inline">{label}</span> : null}
          {actions}
          {!statusFirst && label ? <span className="hidden text-xs text-gray-400 sm:inline">{label}</span> : null}
          {showPreviewToggle && (
            <button type="button" onClick={onShowPreview} className="text-sm text-gray-700 underline md:hidden dark:text-zinc-300">
              {previewLabel}
            </button>
          )}
          {crumb ? null : backLabel ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-[var(--accent-text)] shadow-sm hover:bg-gray-50 dark:border-[#3a3a3c] dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              <ArrowLeft size={14} />
              {backLabel}
            </button>
          ) : (
            <button type="button" onClick={onClose} className="text-gray-950 hover:text-red-500 dark:text-white" aria-label="Close">
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      <hr className="my-2 border-gray-100 opacity-50 dark:border-gray-800" />
    </div>
  )
}
