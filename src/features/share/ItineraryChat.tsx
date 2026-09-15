import { MessageCircle, Send, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import type { Trip } from '../../types/itinerary'

type Msg = { id: string; from: 'guest' | 'expert'; text: string }

function replyFor(text: string, trip: Trip) {
  const q = text.toLowerCase()
  const hotels = trip.accommodations.map((a) => a.hotelName).filter(Boolean).join(', ')
  const priceLine = `${trip.pricing.currency} ${trip.pricing.total.toLocaleString()} for ${trip.pricing.travellerCount} adults. ${trip.pricing.occupancyNote}`
  const hotelLine = `Stays on this journey: ${hotels || 'hotels to be confirmed'}. Golden Ridge is the Nuwara Eliya tea-country night.`
  const wantsPrice = /(price|cost|usd|pay|investment|budget)/.test(q)
  const wantsHotel = /(hotel|stay|golden|ridge|amari|marriott|accommodat)/.test(q)
  if (wantsPrice && wantsHotel) return `${priceLine} ${hotelLine}`
  if (wantsPrice) return priceLine
  if (wantsHotel) return hotelLine
  if (/(airport|cmb|arrival|depart|flight)/.test(q)) {
    return 'Arrival and departure are Bandaranaike International (Colombo Airport). Day 01 is meet-and-assist; Day 07 returns via Galle.'
  }
  if (/(day 5|day five|ella|nine arch|train)/.test(q)) {
    return 'Day 05 travels the highlands to the south coast — Nanu Oya to Ella train, Nine Arches Bridge, then Mirissa for sunset.'
  }
  if (/(day 6|day six|dolphin|surf|ocean|mirissa beach)/.test(q)) {
    return 'Day 06 is an ocean day in Mirissa: dolphin watching, water sports, and beach time.'
  }
  if (/(include|exclu|visa|ticket)/.test(q)) {
    return 'Inclusions cover private vehicle, chauffeur-guide, meals per plan, and hotels. Airfare, visa, and entrance tickets are listed under exclusions.'
  }
  if (/(map|route|journey)/.test(q)) {
    return 'Open The journey section for the live road map — numbered pins from Colombo Airport through the island and back.'
  }
  return `I’ll pass this to ${trip.travelExpert.name} (${trip.travelExpert.email}). For anything urgent, call ${trip.travelExpert.phone}.`
}

export function ItineraryChat({
  trip,
  placement = 'fixed',
}: {
  trip: Trip
  placement?: 'fixed' | 'absolute'
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<Msg[]>(() => [
    {
      id: 'welcome',
      from: 'expert',
      text: `Hi, I’m ${trip.travelExpert.name || 'your expert'}. Ask anything about this itinerary — hotels, days, or the investment.`,
    },
  ])
  const listRef = useRef<HTMLDivElement>(null)
  const expert = trip.travelExpert.name.split(' ')[0] || 'Expert'
  const shell = placement === 'fixed' ? 'fixed inset-0 z-40' : 'absolute inset-0 z-30'

  function send() {
    const text = draft.trim()
    if (!text) return
    const guest: Msg = { id: `g-${Date.now()}`, from: 'guest', text }
    setDraft('')
    setMessages((prev) => [...prev, guest])
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, from: 'expert', text: replyFor(text, trip) },
      ])
      window.setTimeout(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
      }, 40)
    }, 550)
    window.setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
    }, 40)
  }

  return (
    <div className={cn('pointer-events-none', shell)}>
      <div className="absolute inset-4 flex flex-col items-end justify-end gap-3">
        {open && (
          <div className="pointer-events-auto flex min-h-0 w-full max-w-[22rem] flex-1 flex-col overflow-hidden rounded-2xl border border-[#1c2a3a]/10 bg-[#f4eee4] shadow-[0_24px_60px_rgb(28_42_58_/_0.28)] max-h-[min(28rem,calc(100%-4.5rem))]">
            <div className="flex items-center gap-3 bg-[#1c2a3a] px-4 py-3 text-[#f4eee4]">
              {trip.travelExpert.photo ? (
                <img src={trip.travelExpert.photo} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <div className="grid h-9 w-9 place-items-center rounded-full bg-[#c4a574] text-sm text-[#1c2a3a]">
                  {expert.slice(0, 1)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-[family-name:var(--font-satoshi)] text-sm font-medium">Ask about this itinerary</p>
                <p className="truncate text-[11px] text-[#c4a574]">{trip.travelExpert.name}</p>
              </div>
              <button type="button" className="text-white/70 hover:text-white" onClick={() => setOpen(false)} aria-label="Close chat">
                <X size={16} />
              </button>
            </div>
            <div ref={listRef} className="flex-1 space-y-2 overflow-auto px-3 py-3">
              {messages.map((m) => (
                <div key={m.id} className={cn('flex', m.from === 'guest' ? 'justify-end' : 'justify-start')}>
                  <p
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3 py-2 font-[family-name:var(--font-satoshi)] text-[13px] leading-relaxed',
                      m.from === 'guest' ? 'bg-[#1c2a3a] text-white' : 'bg-white text-[#1c2a3a] shadow-sm',
                    )}
                  >
                    {m.text}
                  </p>
                </div>
              ))}
            </div>
            <form
              className="flex gap-2 border-t border-[#1c2a3a]/10 bg-white p-2"
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask a question…"
                className="h-10 flex-1 rounded-xl border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-[#c4a574]"
              />
              <button
                type="submit"
                className="grid h-10 w-10 place-items-center rounded-xl bg-[#c4a574] text-[#1c2a3a]"
                aria-label="Send"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="pointer-events-auto grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#c4a574] text-[#1c2a3a] shadow-[0_12px_30px_rgb(28_42_58_/_0.28)]"
          aria-label={open ? 'Close itinerary chat' : 'Chat about this itinerary'}
        >
          {open ? <X size={22} /> : <MessageCircle size={22} />}
        </button>
      </div>
    </div>
  )
}
