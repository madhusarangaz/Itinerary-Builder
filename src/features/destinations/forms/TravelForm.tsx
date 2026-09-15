import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { BaseButton } from '../../../components/ui/BaseButton'
import { BaseSelect } from '../../../components/ui/BaseSelect'
import { CheckboxField } from '../../../components/ui/CheckboxField'
import { Drawer } from '../../../components/ui/Drawer'
import { SearchSelect } from '../../../components/ui/SearchSelect'
import { StepperField } from '../../../components/ui/StepperField'
import { TextAreaField } from '../../../components/ui/TextAreaField'
import { AIRPORTS, formatTravel } from '../../../data/destination-catalog'
import { uid } from '../../../lib/ids'
import { useDestinations } from '../../../state/destination-store'
import type { AirportConnection, ClimateType, ConnectionTransport, DestinationConnection } from '../../../types/destination'
import { DurationFields, MoreDetails, SectionHead } from './shared'

const CLIMATE: { value: ClimateType; label: string }[] = [
  { value: 'tropical', label: 'Tropical' },
  { value: 'coastal', label: 'Coastal' },
  { value: 'dry', label: 'Dry' },
  { value: 'humid', label: 'Humid' },
  { value: 'hill_country', label: 'Cool / Hill country' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'other', label: 'Other' },
]

const AIR_TRANSPORT = [
  { value: 'private_car', label: 'Private car' },
  { value: 'van', label: 'Van' },
  { value: 'coach', label: 'Coach' },
  { value: 'train', label: 'Train' },
  { value: 'domestic_flight', label: 'Domestic flight' },
  { value: 'boat', label: 'Boat' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'other', label: 'Other' },
]

const CONN_TRANSPORT: { value: ConnectionTransport; label: string }[] = [
  { value: 'road', label: 'Road' },
  { value: 'train', label: 'Train' },
  { value: 'flight', label: 'Flight' },
  { value: 'boat', label: 'Boat' },
  { value: 'mixed', label: 'Mixed' },
]

function emptyConn(): DestinationConnection {
  return {
    id: uid('conn'),
    destinationId: '',
    destinationName: '',
    distanceKm: 0,
    travelHours: 0,
    travelMinutes: 0,
    transportType: 'road',
    bidirectional: true,
  }
}

export function TravelForm() {
  const { active: d, destinations, patchActive } = useDestinations()
  const [draft, setDraft] = useState<DestinationConnection | null>(null)
  const air = d.airportConnections[0]
  const otherDestinations = destinations.filter((x) => x.id !== d.id)

  function patchAir(patch: Partial<AirportConnection>) {
    if (!air) {
      const created: AirportConnection = {
        id: uid('air'),
        airportCode: 'CMB',
        airportName: 'Bandaranaike International Airport (CMB)',
        distanceKm: 0,
        travelHours: 0,
        travelMinutes: 0,
        transportType: 'private_car',
        ...patch,
      }
      patchActive({ airportConnections: [created] })
      return
    }
    patchActive({ airportConnections: [{ ...air, ...patch }] })
  }

  function saveConn() {
    if (!draft?.destinationId) return
    const named = {
      ...draft,
      destinationName: otherDestinations.find((x) => x.id === draft.destinationId)?.name ?? draft.destinationName,
    }
    const exists = d.destinationConnections.some((c) => c.id === named.id)
    patchActive({
      destinationConnections: exists
        ? d.destinationConnections.map((c) => (c.id === named.id ? named : c))
        : [...d.destinationConnections, named],
    })
    setDraft(null)
  }

  return (
    <div id="form-travel" className="scroll-mt-3 space-y-6 px-6 py-4">
      <div>
        <SectionHead title="Travel & Climate" helper="Operational information reused in itineraries and costing." />
      </div>

      <section>
        <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Climate</h4>
        <p className="mb-3 text-[11px] text-gray-400">Structured averages for now — monthly highs and lows can be added later.</p>
        <div className="grid grid-cols-2 gap-4">
          <StepperField
            label="Average day temperature"
            value={d.climate.averageHighC ?? 0}
            min={0}
            max={50}
            suffix="°C"
            onChange={(averageHighC) => patchActive({ climate: { ...d.climate, averageHighC } })}
          />
          <StepperField
            label="Average night temperature"
            value={d.climate.averageLowC ?? 0}
            min={0}
            max={40}
            suffix="°C"
            onChange={(averageLowC) => patchActive({ climate: { ...d.climate, averageLowC } })}
          />
        </div>
        <BaseSelect
          label="Climate type"
          optional
          placeholder="Select"
          value={d.climate.climateType ?? ''}
          options={CLIMATE}
          onChange={(e) =>
            patchActive({ climate: { ...d.climate, climateType: (e.target.value || undefined) as ClimateType | undefined } })
          }
        />
        <MoreDetails label="Optional climate note">
          <TextAreaField
            label="Climate note"
            optional
            rows={3}
            placeholder="Warm and dry during the main travel season, with cooler evenings during some months."
            value={d.climate.note ?? ''}
            onChange={(e) => patchActive({ climate: { ...d.climate, note: e.target.value } })}
          />
        </MoreDetails>
      </section>

      <section>
        <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">From main airport</h4>
        <SearchSelect
          label="Airport"
          value={air?.airportCode ?? 'CMB'}
          options={AIRPORTS.map((a) => ({ value: a.code, label: a.name }))}
          onChange={(code) => {
            const found = AIRPORTS.find((a) => a.code === code)
            patchAir({ airportCode: code, airportName: found?.name ?? code })
          }}
        />
        <StepperField
          label="Distance"
          value={air?.distanceKm ?? 0}
          min={0}
          max={800}
          step={5}
          suffix="km"
          onChange={(distanceKm) => patchAir({ distanceKm })}
        />
        <DurationFields
          label="Approximate travel time"
          hours={air?.travelHours ?? 0}
          minutes={air?.travelMinutes ?? 0}
          onChange={(travelHours, travelMinutes) => patchAir({ travelHours, travelMinutes })}
        />
        <MoreDetails>
          <BaseSelect
            label="Typical transport"
            value={air?.transportType ?? 'private_car'}
            options={AIR_TRANSPORT}
            onChange={(e) => patchAir({ transportType: e.target.value as AirportConnection['transportType'] })}
          />
          <TextAreaField
            label="Travel note"
            optional
            rows={2}
            placeholder="Travel time may vary depending on Colombo traffic."
            value={air?.note ?? ''}
            onChange={(e) => patchAir({ note: e.target.value })}
          />
        </MoreDetails>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Connections to other destinations</h4>
            <p className="text-[11px] text-gray-400">Save common distances and travel times so they can be reused in itineraries and costing.</p>
          </div>
        </div>
        <div className="space-y-2">
          {d.destinationConnections.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-3 dark:border-[#2C2A2A]"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{c.destinationName}</p>
                <p className="text-xs text-gray-500">
                  {c.distanceKm} km · Approx. {formatTravel(c.travelHours, c.travelMinutes)} · {c.transportType}
                  {c.bidirectional ? ' · Both ways' : ''}
                </p>
              </div>
              <div className="flex gap-1">
                <button type="button" className="rounded-lg p-2 text-gray-400 hover:bg-gray-50" onClick={() => setDraft({ ...c })}>
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  onClick={() => patchActive({ destinationConnections: d.destinationConnections.filter((x) => x.id !== c.id) })}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <BaseButton variant="secondary" className="mt-3" onClick={() => setDraft(emptyConn())}>
          <Plus size={14} /> Add destination connection
        </BaseButton>
      </section>

      <Drawer
        open={!!draft}
        title={draft && d.destinationConnections.some((c) => c.id === draft.id) ? 'Edit connection' : 'Add destination connection'}
        subtitle="Manual distances are enough for the prototype. Maps can fill these later."
        onClose={() => setDraft(null)}
        footer={
          <div className="flex justify-end gap-2">
            <BaseButton variant="secondary" onClick={() => setDraft(null)}>
              Cancel
            </BaseButton>
            <BaseButton disabled={!draft?.destinationId} onClick={saveConn}>
              Save connection
            </BaseButton>
          </div>
        }
      >
        {draft ? (
          <>
            <SearchSelect
              label="Destination"
              placeholder="Search destinations…"
              value={draft.destinationId}
              options={otherDestinations.map((x) => ({ value: x.id, label: x.name, hint: x.province }))}
              onChange={(destinationId) =>
                setDraft({
                  ...draft,
                  destinationId,
                  destinationName: otherDestinations.find((x) => x.id === destinationId)?.name ?? '',
                })
              }
            />
            <StepperField
              label="Distance"
              value={draft.distanceKm}
              min={0}
              max={800}
              step={5}
              suffix="km"
              onChange={(distanceKm) => setDraft({ ...draft, distanceKm })}
            />
            <DurationFields
              label="Travel time"
              hours={draft.travelHours}
              minutes={draft.travelMinutes}
              onChange={(travelHours, travelMinutes) => setDraft({ ...draft, travelHours, travelMinutes })}
            />
            <MoreDetails>
              <BaseSelect
                label="Transport type"
                value={draft.transportType}
                options={CONN_TRANSPORT}
                onChange={(e) => setDraft({ ...draft, transportType: e.target.value as ConnectionTransport })}
              />
              <TextAreaField
                label="Route note"
                optional
                rows={2}
                placeholder="Scenic road through Matale."
                value={draft.note ?? ''}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              />
            </MoreDetails>
            <CheckboxField
              label="Make this connection available in both directions"
              hint="Saving Sigiriya → Kandy also teaches the CRM Kandy ↔ Sigiriya."
              checked={draft.bidirectional}
              onChange={(bidirectional) => setDraft({ ...draft, bidirectional })}
            />
          </>
        ) : null}
      </Drawer>
    </div>
  )
}
