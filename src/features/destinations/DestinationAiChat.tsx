import { Send, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { formatStay, formatTravel, monthRangeLabel, formatDuration } from '../../data/destination-catalog'
import { cn } from '../../lib/cn'
import { recommendedDestinationIssues } from '../../lib/destination-completeness'
import { uid } from '../../lib/ids'
import { useActivities } from '../../state/activity-store'
import type { Destination } from '../../types/destination'
import type { ActivityRecord } from '../../types/activity'

export const AI_DRAWER_WIDTH = 360

type Msg = { id: string; from: 'user' | 'ai'; text: string }

const PROMPTS = ['Write a short guest description', 'When should people visit?', 'What are the top experiences?', 'How do guests get here?']

function replyFor(text: string, d: Destination, activities: ActivityRecord[]) {
  const q = text.toLowerCase()
  const name = d.name.trim() || 'this destination'
  const where = [d.district, d.province].filter(Boolean).join(', ')
  const tags = d.experienceTypes.slice(0, 4).join(', ')
  const best = monthRangeLabel(d.bestVisitMonths)
  const stay = formatStay(d)
  const air = d.airportConnections[0]
  const missing = recommendedDestinationIssues(d)

  if (/(descript|copy|write|draft|guest text|blurb|intro)/.test(q)) {
    if (d.shortDescription.trim()) {
      return `Here’s a tightened guest intro you can paste into Short description:\n\n${d.shortDescription.trim()}\n\nI kept the facts you already have${tags ? ` (${tags})` : ''}${where ? ` in ${where}` : ''}.`
    }
    return `Try this as a starting short description:\n\n${name} is a ${tags ? tags.toLowerCase() : 'standout'} stop${where ? ` in ${where}` : ''} in Sri Lanka. ${stay !== 'Day trip' ? `Plan ${stay.toLowerCase()} so guests can settle in.` : 'It works well as a day visit from nearby stays.'} ${best ? `Best from ${best}.` : ''}\n\nAdd a cover image and one signature activity so this reads as a finished profile.`
  }
  if (/(best time|when to visit|when should|people visit|season|month|weather|climate)/.test(q)) {
    const temp =
      d.climate.averageLowC != null && d.climate.averageHighC != null
        ? `Typical range is ${d.climate.averageLowC}–${d.climate.averageHighC}°C.`
        : 'Average temperatures are still empty on Travel.'
    return `${best ? `Best time to visit ${name} is ${best}.` : `No best-visit months are selected yet for ${name}.`} ${temp}${d.climate.note ? ` ${d.climate.note}` : ''}`
  }
  if (/(activit|experience|do there|highlight|fortress|climb)/.test(q)) {
    if (!activities.length) return `${name} has no activities yet. Add a signature experience in Activities — name, duration, and a photo make the preview feel complete.`
    const lines = activities
      .slice(0, 5)
      .map((a) => `• ${a.name}${a.durationMinutes ? ` (${formatDuration(a.durationMinutes)})` : ''}`)
      .join('\n')
    return `Top experiences currently on the profile:\n${lines}\n\nThese are what guests will see under Top experiences.`
  }
  if (/(get there|airport|distance|travel|from cmb|transfer|kandy|connection)/.test(q)) {
    const airLine =
      air && air.distanceKm
        ? `From ${air.airportCode} Airport it is about ${air.distanceKm} km · ${formatTravel(air.travelHours, air.travelMinutes)}.`
        : 'Airport distance is not filled in yet.'
    const links = d.destinationConnections
      .slice(0, 4)
      .map((c) => `${c.destinationName} (${c.distanceKm} km · ${formatTravel(c.travelHours, c.travelMinutes)})`)
      .join('; ')
    return `${airLine}${links ? ` Nearby links: ${links}.` : ''}`
  }
  if (/(stay|night|overnight|day trip|how long|pace)/.test(q)) {
    const pace = d.typicalPace ? d.typicalPace[0].toUpperCase() + d.typicalPace.slice(1) : 'not set'
    return `${name} is set as ${stay.toLowerCase()} with a ${pace.toLowerCase()} pace.${d.minimumNights || d.idealNights ? ` Minimum ${d.minimumNights ?? '—'} / ideal ${d.idealNights ?? '—'} nights.` : ''}`
  }
  if (/(tip|dress|know|pack|cultur)/.test(q)) {
    const tips = d.travellerTips.filter((t) => t.showInItinerary && !t.internalOnly)
    if (!tips.length) return 'No guest-facing tips yet. Add one under Traveller Info — dress code and walking notes show up in the preview.'
    return tips
      .slice(0, 3)
      .map((t) => `• ${t.title}: ${t.information}`)
      .join('\n')
  }
  if (/(missing|complete|todo|left to|what else)/.test(q)) {
    if (!missing.length) return `${name} looks complete for a live profile. You can still enrich copy or add another activity.`
    return `Still useful to add:\n${missing.map((m) => `• ${m}`).join('\n')}`
  }
  return `${name}${where ? ` (${where})` : ''} is ${stay.toLowerCase()}${tags ? ` — ${tags}` : ''}. ${best ? `Best ${best}. ` : ''}Ask me to draft copy, check travel times, or list what’s still missing.`
}

export function AskAiButton({
  onClick,
  className,
}: {
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-white/5',
        className,
      )}
    >
      <Sparkles size={13} />
      Ask AI
    </button>
  )
}

export function DestinationAiChat({
  destination,
  open,
  onClose,
}: {
  destination: Destination
  open: boolean
  onClose: () => void
}) {
  const { activities } = useActivities()
  const linked = activities.filter((activity) => destination.activityIds.includes(activity.id))
  const name = destination.name.trim() || 'this destination'
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [messages, setMessages] = useState<Msg[]>(() => [
    {
      id: 'welcome',
      from: 'ai',
      text: `Hi — I can help you build the ${name} profile. Ask about copy, climate, activities, or how guests get here.`,
    },
  ])
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy, open])

  function send(text = draft) {
    const value = text.trim()
    if (!value || busy) return
    const user: Msg = { id: uid('u'), from: 'user', text: value }
    setDraft('')
    setBusy(true)
    setMessages((prev) => [...prev, user])
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { id: uid('a'), from: 'ai', text: replyFor(value, destination, linked) }])
      setBusy(false)
    }, 520)
  }

  const node = open ? (
    <aside
      className="dest-ai-drawer fixed inset-y-0 left-0 z-[55] flex w-[min(360px,calc(100vw-3rem))] flex-col border-r border-gray-200 bg-white shadow-[8px_0_32px_rgb(0_0_0_/_0.12)] dark:border-[#2C2A2A] dark:bg-[#1E1E20]"
      aria-label="Ask AI"
    >
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-4 py-3.5 dark:border-[#2C2A2A]">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-white">
            <Sparkles size={15} className="text-gray-700 dark:text-zinc-200" />
            Ask AI
          </p>
          <p className="mt-0.5 truncate text-xs text-gray-500">Help with {name}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-zinc-200"
          aria-label="Close Ask AI"
        >
          <X size={16} />
        </button>
      </div>

      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <div key={m.id} className={cn('flex', m.from === 'user' ? 'justify-end' : 'justify-start')}>
            <p
              className={cn(
                'max-w-[90%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-[13px] leading-relaxed',
                m.from === 'user'
                  ? 'bg-gray-900 text-white dark:bg-[#7A3714]'
                  : 'bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-zinc-100',
              )}
            >
              {m.text}
            </p>
          </div>
        ))}
        {busy ? (
          <p className="text-xs text-gray-400" aria-live="polite">
            Thinking…
          </p>
        ) : null}
        {messages.length < 3 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => send(p)}
                className="rounded-full border border-gray-200 px-2.5 py-1 text-[11px] text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-white/5"
              >
                {p}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <form
        className="shrink-0 border-t border-gray-100 p-3 dark:border-[#2C2A2A]"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about this destination…"
            className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-transparent dark:bg-zinc-800 dark:text-zinc-100 dark:shadow-[0px_0px_1px_1px_#404040]"
          />
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[linear-gradient(180deg,#2B2D33_0%,#111317_100%)] text-white disabled:opacity-40 dark:bg-[#7A3714]"
            aria-label="Send"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </aside>
  ) : null

  if (typeof document === 'undefined') return node
  return createPortal(node, document.body)
}
