import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { BaseButton } from '../../../components/ui/BaseButton'
import { InputField } from '../../../components/ui/InputField'
import { Modal } from '../../../components/ui/Modal'
import { StepperField } from '../../../components/ui/StepperField'
import { newRoom } from '../../../lib/hotel'
import { useHotelMaster } from '../../../state/hotel-store'
import { SectionHead } from './shared'

export function RoomsForm() {
  const { active: hotel, patchActive } = useHotelMaster()
  const [removeId, setRemoveId] = useState<string | null>(null)

  function save(rooms: typeof hotel.rooms) {
    patchActive({ rooms: rooms.map((room, sortOrder) => ({ ...room, sortOrder })) })
  }

  return (
    <div className="scroll-mt-3 space-y-1 px-6 py-4">
      <SectionHead title="Room Categories & Inventory" helper="Add the room categories available at this hotel. Names are specific to this property." />
      <div className="space-y-2">
        {hotel.rooms.map((room) => (
          <div key={room.id} className="flex items-end gap-2 rounded-xl border border-gray-100 px-3 py-3 dark:border-[#2C2A2A]">
            <InputField
              className="mb-0 flex-1"
              label="Room category"
              placeholder="e.g. Deluxe"
              value={room.name}
              onChange={(e) => save(hotel.rooms.map((r) => (r.id === room.id ? { ...r, name: e.target.value } : r)))}
            />
            <StepperField
              className="mb-0 w-36"
              label="Rooms"
              value={room.numberOfRooms}
              min={0}
              max={999}
              onChange={(numberOfRooms) => save(hotel.rooms.map((r) => (r.id === room.id ? { ...r, numberOfRooms } : r)))}
            />
            <button type="button" className="mb-1 p-2 text-gray-400 hover:text-red-500" aria-label="Remove room category" onClick={() => setRemoveId(room.id)}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <BaseButton
        variant="secondary"
        className="mt-3"
        onClick={() => save([...hotel.rooms, newRoom({ sortOrder: hotel.rooms.length })])}
      >
        + Add Room Category
      </BaseButton>
      <Modal
        open={!!removeId}
        title="Remove room category"
        onClose={() => setRemoveId(null)}
        footer={
          <>
            <BaseButton variant="secondary" onClick={() => setRemoveId(null)}>
              Cancel
            </BaseButton>
            <BaseButton
              variant="danger"
              onClick={() => {
                save(hotel.rooms.filter((room) => room.id !== removeId))
                setRemoveId(null)
              }}
            >
              Remove
            </BaseButton>
          </>
        }
      >
        <p className="text-sm text-gray-700 dark:text-gray-300">This room category will be removed from the hotel.</p>
      </Modal>
    </div>
  )
}
