import { Send, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { sendGaps } from '../../lib/completeness'
import { cn } from '../../lib/cn'
import { formatShort } from '../../lib/dates'
import { uid } from '../../lib/ids'
import { useItinerary } from '../../state/itinerary-store'
import type { Trip } from '../../types/itinerary'

type Msg = { id: string; from: 'user' | 'ai'; text: string }

const PROMPTS = ["What's still open?", 'Draft a trip name', 'Walk the nights', 'Which hotels are missing?']

function replyFor(text: string, trip: Trip) {
  const q = text.toLowerCase()
  const name = trip.title.trim() || 'this trip'
  const gaps = sendGaps(trip)
  const who = trip.customer.trim()

  if (/(open|missing|left|ready|send|complete|todo)/.test(q)) {
    if (!gaps.length) return `${name} is ready to send.`
    const lines = gaps.slice(0, 8).map((gap) => `• ${gap.label}`)
    const more = gaps.length > 8 ? `\n• ${gaps.length - 8} more` : ''
    return `Still open before you send:\n${lines.join('\n')}${more}`
  }

  if (/(name|title|draft|call it)/.test(q)) {
    if (trip.title.trim()) {
      return `The trip is already called “${trip.title.trim()}”. A guest-facing line could be “${trip.nights} nights${who ? ` for ${who}` : ''}”.`
    }
    const nights = trip.nights || 'A few'
    return `The title is empty. Try “${nights} Nights in Sri Lanka”${who ? ` for ${who}` : ''}.`
  }

  if (/(night|journey|walk|route|summar|day)/.test(q)) {
    if (!trip.days.length) return 'No days are laid out yet. Set the dates, then place where each night is spent.'
    const lines = trip.days.map((day) => `• Day ${String(day.dayNumber).padStart(2, '0')} · ${formatShort(day.date)} · ${day.destination.trim() || 'Place not set'}`)
    return `${trip.nights} nights · ${formatShort(trip.startDate)} to ${formatShort(trip.endDate)}\n${lines.join('\n')}`
  }

  if (/(hotel|stay|accommod)/.test(q)) {
    if (!trip.accommodations.length) return 'No stays yet. Add a stay once the nights are placed.'
    const missing = trip.accommodations.filter((stay) => !stay.hotelId)
    if (!missing.length) {
      const named = trip.accommodations.map((stay) => stay.hotelName.trim() || stay.destination.trim()).filter(Boolean)
      return `Every stay has a hotel${named.length ? `: ${named.join(', ')}` : ''}.`
    }
    return `Still need a hotel:\n${missing.map((stay) => `• ${stay.destination.trim() || 'New stay'}`).join('\n')}`
  }

  return `${name}${who ? ` for ${who}` : ''} is ${trip.nights} nights, ${formatShort(trip.startDate)} to ${formatShort(trip.endDate)}. Ask what’s still open, or have me walk the nights.`
}

export function ItineraryAiChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { trip } = useItinerary()
  const name = trip.title.trim() || 'this itinerary'
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [messages, setMessages] = useState<Msg[]>(() => [
    {
      id: 'welcome',
      from: 'ai',
      text: `Hi — I can help you finish ${name}. Ask what’s still open, or have me walk the nights.`,
    },
  ])
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
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
    setDraft('')
    setBusy(true)
    setMessages((prev) => [...prev, { id: uid('u'), from: 'user', text: value }])
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { id: uid('a'), from: 'ai', text: replyFor(value, trip) }])
      setBusy(false)
    }, 520)
  }

  if (!open) return null

  const node = (
    <aside
      className="itinerary-ai-drawer fixed inset-y-0 left-0 z-[60] flex w-[min(360px,calc(100vw-3rem))] flex-col border-r border-gray-200 bg-white shadow-[8px_0_32px_rgb(0_0_0_/_0.12)] dark:border-[#2C2A2A] dark:bg-[#1E1E20]"
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
        {messages.map((message) => (
          <div key={message.id} className={cn('flex', message.from === 'user' ? 'justify-end' : 'justify-start')}>
            <p
              className={cn(
                'max-w-[90%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap',
                message.from === 'user'
                  ? 'bg-gray-900 text-white dark:bg-[#7A3714]'
                  : 'bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-zinc-100',
              )}
            >
              {message.text}
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
            {PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => send(prompt)}
                className="rounded-full border border-gray-200 px-2.5 py-1 text-[11px] text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-white/5"
              >
                {prompt}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <form
        className="shrink-0 border-t border-gray-100 p-3 dark:border-[#2C2A2A]"
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
      >
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask about this itinerary…"
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
  )

  if (typeof document === 'undefined') return node
  return createPortal(node, document.body)
}
