import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { formatLong, formatRange } from '../../lib/dates'
import { cn } from '../../lib/cn'
import { buildJourneyStops } from '../../lib/journey-stops'
import { buildDayGlance } from '../../lib/day-glance'
import type { Accommodation, Activity, Day, EditorTarget, Highlight, Trip } from '../../types/itinerary'
import { HeroBackground } from './HeroBackground'
import { JourneyMap } from './JourneyMap'

gsap.registerPlugin(ScrollTrigger)

const MEAL: Record<string, string> = {
  BB: 'Bed & Breakfast',
  HB: 'Half Board',
  FB: 'Full Board',
}

function SafeImg({ src, className, alt = '', style }: { src: string; className?: string; alt?: string; style?: CSSProperties }) {
  if (!src) return <div className={cn('bg-[#f0f0ee]', className)} />
  return <img src={src} alt={alt} className={className} style={style} />
}

function Wrap({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('itinerary-wrap', className)}>{children}</div>
}

function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('itinerary-kicker', className)}>{children}</p>
}

function Stars({ count }: { count: number }) {
  return (
    <span className="itinerary-stars" aria-label={`${count} star hotel`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < count ? 'is-on' : undefined}>
          ★
        </span>
      ))}
    </span>
  )
}

function hotspot(onEdit: ((target: EditorTarget) => void) | undefined, target: EditorTarget, className?: string) {
  if (!onEdit) return { className }
  return {
    role: 'button' as const,
    tabIndex: 0,
    className: cn('itinerary-edit-hotspot', className),
    onClick: (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      onEdit(target)
    },
    onKeyDown: (e: { key: string; preventDefault: () => void }) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onEdit(target)
      }
    },
  }
}

const STATUS_LABEL: Record<string, string> = {
  included: 'Included',
  optional: 'Optional',
  extra: 'Extra',
}

function DayGlance({ day }: { day: Day }) {
  const rows = buildDayGlance(day)
  if (!rows.length) return null
  return (
    <div className="itinerary-glance">
      <p className="itinerary-glance-kicker">Today at a glance</p>
      <dl className="itinerary-glance-list">
        {rows.map((row) => (
          <div key={row.label} className="itinerary-glance-row">
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function ActivityLine({ activity }: { activity: Activity }) {
  const status = activity.status ? STATUS_LABEL[activity.status] : ''
  return (
    <li>
      {activity.time?.trim() ? <span className="itinerary-activity-time">{activity.time.trim()}</span> : null}
      {activity.title}
      {status ? <span className="itinerary-activity-status">{status}</span> : null}
      {activity.subActivities.length > 0 && (
        <ul>
          {activity.subActivities.map((s) => (
            <li key={s.id}>{s.title}</li>
          ))}
        </ul>
      )}
    </li>
  )
}

function DayBlock({ day, flip, onEdit }: { day: Day; flip: boolean; onEdit?: (target: EditorTarget) => void }) {
  const items = day.activities.filter((a) => a.title.trim())
  return (
    <article {...hotspot(onEdit, { section: 'days', dayId: day.id }, cn('itinerary-day', flip && 'is-flip'))}>
      <div className="itinerary-day-media">
        <SafeImg src={day.image} className="h-full w-full object-cover" alt={day.destination} />
      </div>
      <div className="min-w-0">
        <Kicker>
          Day {String(day.dayNumber).padStart(2, '0')} · {formatLong(day.date)}
        </Kicker>
        <h3 className="itinerary-title itinerary-h3">{day.destination || '—'}</h3>
        {day.title ? <p className="mt-2 text-[15px] text-[var(--it-muted)] @min-[768px]:text-lg">{day.title}</p> : null}
        <DayGlance day={day} />
        {items.length > 0 && (
          <ul className="itinerary-activities">
            {items.map((a) => (
              <ActivityLine key={a.id} activity={a} />
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}

function highlightSet(highlights: Highlight[]) {
  if (highlights.length === 0) return []
  const repeats = Math.max(1, Math.ceil(6 / highlights.length))
  return Array.from({ length: repeats }, () => highlights).flat()
}

function HighlightCard({ highlight, decorative = false }: { highlight: Highlight; decorative?: boolean }) {
  return (
    <figure className="itinerary-highlight-card">
      <SafeImg
        src={highlight.image}
        className="itinerary-highlight-photo"
        alt={decorative ? '' : highlight.name}
      />
      <figcaption className="itinerary-highlight-caption">
        <div className="itinerary-title text-[1.05rem] leading-tight @min-[768px]:text-[1.2rem]">{highlight.name}</div>
        {highlight.description ? (
          <div className="mt-1 text-[12px] leading-snug text-[var(--it-muted)]">{highlight.description}</div>
        ) : null}
      </figcaption>
    </figure>
  )
}

function HighlightsCarousel({ highlights }: { highlights: Highlight[] }) {
  const set = useMemo(() => highlightSet(highlights), [highlights])
  if (set.length === 0) return null

  return (
    <div
      className="itinerary-highlights-marquee"
      style={{ '--hl-n': set.length } as CSSProperties}
      aria-label="Tour highlights"
    >
      <div className="itinerary-highlights-track">
        <div className="itinerary-highlights-set">
          {set.map((h, i) => (
            <HighlightCard key={`${h.id}-a-${i}`} highlight={h} />
          ))}
        </div>
        <div className="itinerary-highlights-set" aria-hidden="true">
          {set.map((h, i) => (
            <HighlightCard key={`${h.id}-b-${i}`} highlight={h} decorative />
          ))}
        </div>
      </div>
    </div>
  )
}

function HotelCard({ stay, onEdit }: { stay: Accommodation; onEdit?: (target: EditorTarget) => void }) {
  return (
    <article {...hotspot(onEdit, { section: 'stay' }, 'itinerary-hotel')}>
      <div className="itinerary-hotel-media">
        <SafeImg src={stay.image} className="h-full w-full object-cover" alt={stay.hotelName} />
      </div>
      <div className="itinerary-hotel-body">
        <p className="itinerary-kicker">{stay.destination}</p>
        <h4 className="itinerary-title mt-1 text-[1.35rem] leading-tight @min-[768px]:text-[1.55rem]">
          {stay.hotelName || 'Hotel to be confirmed'}
        </h4>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <Stars count={stay.starCategory} />
          <span className="text-[var(--it-muted)]">{stay.starCategory}-star</span>
        </div>
        <p className="mt-2 text-sm text-[var(--it-muted)]">
          {stay.nights} {stay.nights === 1 ? 'night' : 'nights'} · {MEAL[stay.mealPlan] ?? stay.mealPlan}
        </p>
      </div>
    </article>
  )
}

export function ItineraryTemplate({
  trip,
  animate = true,
  onEdit,
}: {
  trip: Trip
  animate?: boolean
  onEdit?: (target: EditorTarget) => void
}) {
  const root = useRef<HTMLDivElement>(null)
  const [openFaq, setOpenFaq] = useState<string | null>('inclusions')
  const route = buildJourneyStops(trip)
  const collage = useMemo(() => {
    const fromDays = trip.days.map((d) => d.image).filter(Boolean)
    const fromHighlights = trip.highlights.map((h) => h.image).filter(Boolean)
    return [...fromDays, ...fromHighlights].slice(0, 8)
  }, [trip.days, trip.highlights])
  const enquireHref = `mailto:${trip.travelExpert.email}?subject=${encodeURIComponent(trip.title || 'Itinerary enquiry')}`

  useGSAP(
    () => {
      if (!animate || !root.current) return
      const q = gsap.utils.selector(root)
      gsap.from(q('.hero-copy > *'), {
        y: 20,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: 'power3.out',
      })
      q('.reveal').forEach((el) => {
        gsap.from(el, {
          y: 28,
          opacity: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%' },
        })
      })
    },
    { scope: root, dependencies: [trip.id, animate] },
  )

  return (
    <div
      ref={root}
      className={cn(
        'itinerary-doc mx-auto w-full max-w-[1100px] @min-[768px]:shadow-[0_24px_80px_rgb(28_42_58_/_0.08)]',
        onEdit && 'is-editable',
      )}
    >
      <header {...hotspot(onEdit, { section: 'details', field: 'header' }, 'itinerary-hero relative overflow-hidden')}>
        <HeroBackground image={trip.coverImage} videoUrl={trip.heroVideoUrl ?? ''} alt={trip.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c2a3a] via-[#1c2a3a]/45 to-transparent" />
        <div className="itinerary-hero-inner relative z-10 flex flex-col">
          <Wrap className="flex items-center justify-between py-4">
            <p className="itinerary-title text-[16px] tracking-tight text-white @min-[768px]:text-[18px]">Travel Building</p>
            <p className="text-[10px] tracking-[0.22em] text-white/75 uppercase">{trip.tourId || 'Your journey'}</p>
          </Wrap>
          <Wrap className="hero-copy mt-auto pb-8 @min-[768px]:pb-12">
            <p className="itinerary-kicker text-white/80">
              {trip.country} · {trip.nights} nights
            </p>
            <h1 className="itinerary-title itinerary-h1 max-w-2xl text-white">{trip.title || 'Untitled journey'}</h1>
            <p className="mt-3 text-base text-white/90 @min-[768px]:text-lg">{trip.customer}</p>
            <div className="itinerary-meta">
              <span>{formatRange(trip.startDate, trip.endDate)}</span>
              {trip.option ? <span>{trip.option}</span> : null}
              <span>
                {String(trip.pricing.travellerCount).padStart(2, '0')} adults
              </span>
            </div>
          </Wrap>
        </div>
      </header>

      <section {...hotspot(onEdit, { section: 'details', field: 'highlights' }, 'itinerary-section reveal')}>
        <Wrap>
          <Kicker>This includes</Kicker>
          <h2 className="itinerary-title itinerary-h2">Tour highlights</h2>
        </Wrap>
        <HighlightsCarousel highlights={trip.highlights} />
        {trip.facilities.length > 0 && (
          <Wrap>
            <div {...hotspot(onEdit, { section: 'details', field: 'facilities' }, 'mt-10')}>
              <Kicker>Our extras</Kicker>
              <h3 className="itinerary-title itinerary-h3">Facilities</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {trip.facilities.map((f) => (
                  <span
                    key={f.id}
                    className="border border-[var(--it-navy)]/12 bg-white px-3 py-1.5 text-xs tracking-wide text-[var(--it-navy)]"
                  >
                    {f.label}
                  </span>
                ))}
              </div>
            </div>
          </Wrap>
        )}
      </section>

      <section className="itinerary-section is-sand">
        <Wrap>
          <div {...hotspot(onEdit, { section: 'days' }, 'reveal mb-8 @min-[768px]:mb-10')}>
            <Kicker>Day by day</Kicker>
            <h2 className="itinerary-title itinerary-h2">Your itinerary</h2>
          </div>
          <div className="space-y-10 @min-[768px]:space-y-16">
            {trip.days.map((day, i) => (
              <div key={day.id} className="reveal">
                <DayBlock day={day} flip={i % 2 === 1} onEdit={onEdit} />
              </div>
            ))}
          </div>
        </Wrap>
      </section>

      <section className="itinerary-section reveal">
        <Wrap>
          <div {...hotspot(onEdit, { section: 'stay' })}>
            <Kicker>Where you’ll stay</Kicker>
            <h2 className="itinerary-title itinerary-h2">Hotels</h2>
          </div>
          <div className="itinerary-hotels">
            {trip.accommodations.map((a) => (
              <HotelCard key={a.id} stay={a} onEdit={onEdit} />
            ))}
          </div>
          {trip.accommodationNote ? (
            <p className="mt-6 max-w-xl text-xs leading-relaxed text-[var(--it-muted)]">{trip.accommodationNote}</p>
          ) : null}
        </Wrap>
      </section>

      <section id="pricing" {...hotspot(onEdit, { section: 'pricing' }, 'itinerary-price reveal')}>
        <Kicker>Investment</Kicker>
        <p className="mt-3 text-[11px] tracking-[0.28em] text-[var(--it-gold)] uppercase">
          {String(trip.pricing.travellerCount).padStart(2, '0')} adults
        </p>
        <p className="itinerary-title itinerary-price-amount">
          {trip.pricing.currency} {trip.pricing.total.toLocaleString()}
        </p>
        <div className="itinerary-price-rule" />
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-[#d5cfc4]">{trip.pricing.occupancyNote}</p>
        <a
          className="itinerary-btn-gold mt-7"
          href={enquireHref}
          onClick={(e) => {
            if (!onEdit) return
            e.preventDefault()
            e.stopPropagation()
            onEdit({ section: 'pricing' })
          }}
        >
          Enquire
        </a>
      </section>

      <section className="itinerary-section">
        <Wrap>
          <div {...hotspot(onEdit, { section: 'days' }, 'reveal')}>
            <Kicker>The journey</Kicker>
            <h2 className="itinerary-title itinerary-h2">Your route</h2>
          </div>
          <div className="mt-7 grid items-start gap-8 @min-[1024px]:grid-cols-[minmax(0,1.35fr)_minmax(11rem,0.65fr)]">
            <JourneyMap trip={trip} />
            <div
              {...hotspot(
                onEdit,
                { section: 'days' },
                'reveal flex flex-col text-[1.45rem] leading-snug @min-[768px]:text-[1.7rem]',
              )}
            >
              {route.length === 0 ? (
                <p className="text-sm text-[var(--it-muted)]">Add destinations to plot this route.</p>
              ) : (
                route.map((stop, i) => (
                  <div key={stop.id} className="flex flex-col">
                    <span className="itinerary-title">{stop.label}</span>
                    {i < route.length - 1 && <span className="my-1 text-base text-[var(--it-gold)]">↓</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        </Wrap>
      </section>

      <section className="itinerary-section is-sand reveal">
        <Wrap>
          <div {...hotspot(onEdit, { section: 'terms' })}>
            <Kicker>Before you go</Kicker>
            <h2 className="itinerary-title itinerary-h2">Terms</h2>
          </div>
          {[
            { id: 'inclusions', title: 'What is included?', body: trip.inclusions.map((r) => r.text) },
            { id: 'exclusions', title: 'What is not included?', body: trip.exclusions.map((r) => r.text) },
            {
              id: 'cancel',
              title: 'Cancellation policy',
              body: trip.cancellationPolicies
                .map((p) => `${p.window} — ${p.detail}`)
                .concat(trip.cancellationNote ? [trip.cancellationNote] : []),
            },
          ].map((faq) => (
            <button
              key={faq.id}
              type="button"
              onClick={() => {
                if (onEdit) {
                  onEdit({ section: 'terms', field: faq.id })
                  return
                }
                setOpenFaq((cur) => (cur === faq.id ? null : faq.id))
              }}
              className="mt-3 block w-full border-b border-[var(--it-line)] py-4 text-left"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="itinerary-title text-xl @min-[768px]:text-[1.45rem]">{faq.title}</span>
                <span className="text-lg text-[var(--it-gold)]">{openFaq === faq.id ? '−' : '+'}</span>
              </div>
              {openFaq === faq.id && !onEdit && (
                <ul className="mt-3 space-y-1.5 text-sm text-[var(--it-muted)]">
                  {faq.body.map((line) => (
                    <li key={line}>— {line}</li>
                  ))}
                </ul>
              )}
            </button>
          ))}
        </Wrap>
      </section>

      <section id="expert" className="itinerary-section reveal">
        <Wrap>
          <div
            {...hotspot(
              onEdit,
              { section: 'expert' },
              'border border-[var(--it-line)] bg-white px-6 py-12 text-center @min-[768px]:px-10',
            )}
          >
            <SafeImg
              src={trip.travelExpert.photo}
              className="mx-auto h-24 w-24 object-cover ring-4 ring-[var(--it-gold)]"
              alt={trip.travelExpert.name}
            />
            <Kicker className="mt-5">Your expert</Kicker>
            <h3 className="itinerary-title itinerary-h3">{trip.travelExpert.name}</h3>
            <p className="mt-1 text-[11px] tracking-[0.22em] text-[var(--it-muted)] uppercase">{trip.travelExpert.role}</p>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[var(--it-muted)] @min-[768px]:text-base">
              {trip.travelExpert.bio}
            </p>
            <p className="mt-4 text-sm text-[var(--it-navy)]">
              {trip.travelExpert.email} · {trip.travelExpert.phone}
            </p>
            <a
              className="itinerary-btn-gold mt-6"
              href={enquireHref}
              onClick={(e) => {
                if (!onEdit) return
                e.preventDefault()
                e.stopPropagation()
                onEdit({ section: 'expert' })
              }}
            >
              Message {trip.travelExpert.name.split(' ')[0] || 'your expert'}
            </a>
          </div>
        </Wrap>
      </section>

      {collage.length > 0 && (
        <section {...hotspot(onEdit, { section: 'days' }, 'itinerary-section is-sand reveal')}>
          <Wrap>
            <Kicker>Along the way</Kicker>
            <h2 className="itinerary-title itinerary-h2 mb-6">Gallery</h2>
            <div className="grid grid-cols-2 gap-3 @min-[768px]:grid-cols-4 @min-[768px]:gap-4">
              {collage.map((src, i) => (
                <figure key={`${src}-${i}`} className="overflow-hidden bg-white">
                  <SafeImg src={src} className="aspect-[4/5] w-full object-cover" alt="" />
                </figure>
              ))}
            </div>
          </Wrap>
        </section>
      )}

      <footer {...hotspot(onEdit, { section: 'details', field: 'header' }, 'itinerary-footer')}>
        <p className="itinerary-title itinerary-footer-mark">Travel Building</p>
        <p className="itinerary-kicker mt-4">Designed journeys · {trip.country || 'Sri Lanka'}</p>
      </footer>
    </div>
  )
}
