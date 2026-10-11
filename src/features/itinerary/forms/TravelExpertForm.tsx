import { BaseSelect } from '../../../components/ui/BaseSelect'
import { ImageUploader } from '../../../components/ui/ImageUploader'
import { InputField } from '../../../components/ui/InputField'
import { TextAreaField } from '../../../components/ui/TextAreaField'
import { TRAVEL_EXPERTS } from '../../../data/travel-experts'
import { useItinerary } from '../../../state/itinerary-store'

export function TravelExpertForm() {
  const { trip, patch } = useItinerary()
  const e = trip.travelExpert
  const selected = TRAVEL_EXPERTS.find((expert) => expert.name === e.name)?.id ?? ''

  function chooseExpert(id: string) {
    const expert = TRAVEL_EXPERTS.find((item) => item.id === id)
    if (!expert) return
    patch({
      travelExpert: {
        name: expert.name,
        role: expert.role,
        photo: expert.photo,
        email: expert.email,
        phone: expert.phone,
        bio: expert.bio,
      },
    })
  }

  return (
    <div id="form-expert" className="scroll-mt-3 space-y-3 px-6 py-4">
      <h3 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Travel expert</h3>
      <BaseSelect
        label="Travel expert"
        placeholder="Select a travel expert"
        value={selected}
        options={TRAVEL_EXPERTS.map((expert) => ({ value: expert.id, label: expert.name }))}
        onChange={(ev) => chooseExpert(ev.target.value)}
      />
      <ImageUploader
        label="Profile image"
        value={e.photo}
        onChange={(url) => patch({ travelExpert: { ...e, photo: url } })}
        onRemove={() => patch({ travelExpert: { ...e, photo: '' } })}
        aspect="aspect-square"
        className="max-w-40"
      />
      <div id="expert-name" className="scroll-mt-3">
        <InputField label="Name" value={e.name} onChange={(ev) => patch({ travelExpert: { ...e, name: ev.target.value } })} />
      </div>
      <InputField label="Role" value={e.role} onChange={(ev) => patch({ travelExpert: { ...e, role: ev.target.value } })} />
      <div id="expert-email" className="scroll-mt-3">
        <InputField label="Email" value={e.email} onChange={(ev) => patch({ travelExpert: { ...e, email: ev.target.value } })} />
      </div>
      <InputField label="Phone" value={e.phone} onChange={(ev) => patch({ travelExpert: { ...e, phone: ev.target.value } })} />
      <TextAreaField
        label="Short bio"
        value={e.bio}
        onChange={(ev) => patch({ travelExpert: { ...e, bio: ev.target.value } })}
      />
    </div>
  )
}
