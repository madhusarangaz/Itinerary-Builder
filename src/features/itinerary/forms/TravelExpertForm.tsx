import { ImageUploader } from '../../../components/ui/ImageUploader'
import { InputField } from '../../../components/ui/InputField'
import { TextAreaField } from '../../../components/ui/TextAreaField'
import { useItinerary } from '../../../state/itinerary-store'

export function TravelExpertForm() {
  const { trip, patch } = useItinerary()
  const e = trip.travelExpert
  return (
    <div id="form-expert" className="scroll-mt-3 space-y-3 px-6 py-4">
      <h3 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Travel expert</h3>
      <ImageUploader
        label="Profile image"
        value={e.photo}
        onChange={(url) => patch({ travelExpert: { ...e, photo: url } })}
        onRemove={() => patch({ travelExpert: { ...e, photo: '' } })}
        aspect="aspect-square"
        className="max-w-40"
      />
      <InputField label="Name" value={e.name} onChange={(ev) => patch({ travelExpert: { ...e, name: ev.target.value } })} />
      <InputField label="Role" value={e.role} onChange={(ev) => patch({ travelExpert: { ...e, role: ev.target.value } })} />
      <InputField label="Email" value={e.email} onChange={(ev) => patch({ travelExpert: { ...e, email: ev.target.value } })} />
      <InputField label="Phone" value={e.phone} onChange={(ev) => patch({ travelExpert: { ...e, phone: ev.target.value } })} />
      <TextAreaField
        label="Short bio"
        value={e.bio}
        onChange={(ev) => patch({ travelExpert: { ...e, bio: ev.target.value } })}
      />
    </div>
  )
}
