import { ImageUploader } from '../../../components/ui/ImageUploader'
import { IMAGE_SLOTS } from '../../../data/transport-catalog'
import { uid } from '../../../lib/ids'
import { useTransport } from '../../../state/transport-store'
import type { TransportImageSlot } from '../../../types/transport'
import { SectionHead } from './shared'

export function MediaForm() {
  const { active: t, patchActive } = useTransport()

  function setSlot(slot: TransportImageSlot, url: string) {
    patchActive({
      images: {
        ...t.images,
        [slot]: url ? { id: t.images[slot]?.id ?? uid('img'), url } : undefined,
      },
    })
  }

  return (
    <div id="form-media" className="scroll-mt-3 space-y-1 px-6 py-4">
      <SectionHead
        title="Vehicle Images"
        helper="Add standard vehicle images that can be reused in itineraries and transport information."
      />
      <p className="mb-3 text-[11px] text-gray-400">Drafts can be saved without images. All four are recommended before activating.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {IMAGE_SLOTS.map((slot) => (
          <ImageUploader
            key={slot.id}
            className="mb-0"
            aspect="aspect-[4/3]"
            label={slot.label}
            value={t.images[slot.id]?.url ?? ''}
            onChange={(url) => setSlot(slot.id, url)}
            onRemove={() => setSlot(slot.id, '')}
          />
        ))}
      </div>
    </div>
  )
}
