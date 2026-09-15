import { Monitor, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { formatDuration, formatStay, formatTravel, monthRangeLabel } from '../../data/destination-catalog'
import { cn } from '../../lib/cn'
import type { Destination } from '../../types/destination'

function Profile({ destination: d }: { destination: Destination }) {
  const cover = d.coverImage?.url
  const guestTips = d.travellerTips.filter((t) => t.showInItinerary && !t.internalOnly)
  const air = d.airportConnections[0]
  const high = d.climate.averageHighC
  const low = d.climate.averageLowC
  const pace = d.typicalPace ? d.typicalPace[0].toUpperCase() + d.typicalPace.slice(1) : ''

  return (
    <article className="itinerary-doc dest-profile">
      <div className="relative min-h-[260px] overflow-hidden bg-[#1c2a3a]">
        {cover ? (
          <img
            src={cover}
            alt={d.coverImage?.alt || d.name}
            className="h-[320px] w-full object-cover"
            style={{ objectPosition: `center ${d.coverImage?.focalY ?? 50}%` }}
          />
        ) : (
          <div className="dest-profile-pad flex h-[260px] items-end bg-[#1c2a3a] pb-8">
            <p className="text-sm text-white/50">Add a cover image to complete this profile.</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c2a3a] via-[#1c2a3a]/40 to-transparent" />
        <div className="dest-profile-pad absolute inset-x-0 bottom-0 pb-6">
          <p className="itinerary-kicker">Destination</p>
          <h1 className="itinerary-title itinerary-h1 text-white">{d.name || 'Untitled destination'}</h1>
          {d.experienceTypes.length ? (
            <p className="mt-2 text-sm tracking-wide text-[#c4a574]">{d.experienceTypes.slice(0, 4).join(' · ')}</p>
          ) : null}
        </div>
      </div>

      {d.shortDescription ? (
        <section className="itinerary-section dest-profile-pad">
          <p className="text-[15px] leading-relaxed text-[#1c2a3a]">{d.shortDescription}</p>
        </section>
      ) : null}

      <section className="itinerary-section is-sand dest-profile-pad">
        <p className="itinerary-kicker">At a glance</p>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[11px] tracking-wide text-[#5c564c] uppercase">Climate</p>
            <p className="mt-1 text-[#1c2a3a]">{low != null && high != null ? `${low}–${high}°C` : 'Add temperatures'}</p>
          </div>
          <div>
            <p className="text-[11px] tracking-wide text-[#5c564c] uppercase">Best time</p>
            <p className="mt-1 text-[#1c2a3a]">{monthRangeLabel(d.bestVisitMonths) || 'Any season'}</p>
          </div>
          <div>
            <p className="text-[11px] tracking-wide text-[#5c564c] uppercase">Recommended</p>
            <p className="mt-1 text-[#1c2a3a]">{formatStay(d)}</p>
          </div>
          <div>
            <p className="text-[11px] tracking-wide text-[#5c564c] uppercase">Typical pace</p>
            <p className="mt-1 text-[#1c2a3a]">{pace || '—'}</p>
          </div>
        </div>
      </section>

      <section className="itinerary-section dest-profile-pad">
        <p className="itinerary-kicker">Getting there</p>
        {air && air.distanceKm ? (
          <div className="mt-4 border-b border-[rgb(28_42_58_/_0.1)] pb-4">
            <p className="text-sm font-medium text-[#1c2a3a]">From {air.airportCode} Airport</p>
            <p className="text-sm text-[#5c564c]">
              {air.distanceKm} km · Approx. {formatTravel(air.travelHours, air.travelMinutes)}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[#5c564c]">Airport connection can be added when you have the numbers.</p>
        )}
        <div className="mt-3 space-y-3">
          {d.destinationConnections.map((c) => (
            <div key={c.id} className="flex justify-between gap-3 text-sm">
              <p className="font-medium text-[#1c2a3a]">{c.destinationName}</p>
              <p className="text-[#5c564c]">
                {c.distanceKm} km · {formatTravel(c.travelHours, c.travelMinutes)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {d.activities.length ? (
        <section className="itinerary-section is-sand dest-profile-pad">
          <p className="itinerary-kicker">Top experiences</p>
          <div className="mt-4 space-y-4">
            {d.activities.map((a) => (
              <div key={a.id} className="flex gap-3">
                <div className="h-16 w-20 shrink-0 overflow-hidden bg-[#eee]">
                  {a.image?.url ? <img src={a.image.url} alt="" className="h-full w-full object-cover" /> : null}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1c2a3a]">{a.name}</p>
                  <p className="text-xs text-[#5c564c]">
                    {[formatDuration(a.durationMinutes), a.difficulty ? a.difficulty[0].toUpperCase() + a.difficulty.slice(1) : '']
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {guestTips.length ? (
        <section className="itinerary-section dest-profile-pad">
          <p className="itinerary-kicker">Good to know</p>
          <ul className="mt-4 space-y-3">
            {guestTips.map((t) => (
              <li key={t.id}>
                <p className="text-sm font-medium text-[#1c2a3a]">{t.title}</p>
                <p className="text-sm leading-relaxed text-[#5c564c]">{t.information}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="h-8" />
    </article>
  )
}

export function DestinationPreview({ destination }: { destination: Destination }) {
  const [mode, setMode] = useState<'mobile' | 'desktop'>('desktop')

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f2f2f2]">
      <div className="z-20 flex shrink-0 items-center justify-between gap-3 border-b border-black/5 bg-[#f2f2f2]/90 px-4 py-3 backdrop-blur">
        <div className="flex rounded-lg border border-gray-200 bg-white p-0.5 text-sm shadow-sm">
          <button
            type="button"
            onClick={() => setMode('mobile')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition',
              mode === 'mobile' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50',
            )}
          >
            <Smartphone size={14} />
            Mobile view
          </button>
          <button
            type="button"
            onClick={() => setMode('desktop')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition',
              mode === 'desktop' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50',
            )}
          >
            <Monitor size={14} />
            Desktop view
          </button>
        </div>
      </div>

      {mode === 'desktop' ? (
        <div className="min-h-0 flex-1 overflow-auto bg-[#f2f2f2] px-6 py-5 lg:px-8">
          <div className="overflow-hidden bg-white shadow-[0_18px_50px_rgb(28_42_58_/_0.08)]">
            <Profile destination={destination} />
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 justify-center overflow-hidden px-3 py-4">
          <div className="flex h-full w-full max-w-[390px] min-w-0 flex-col overflow-hidden rounded-[2.1rem] bg-[#111] p-2 shadow-2xl">
            <div className="flex items-center justify-center pb-1 pt-1">
              <span className="h-1.5 w-16 rounded-full bg-white/25" />
            </div>
            <div className="min-h-0 flex-1 overflow-hidden rounded-[1.6rem] bg-white">
              <div className="h-full overflow-auto">
                <Profile destination={destination} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
