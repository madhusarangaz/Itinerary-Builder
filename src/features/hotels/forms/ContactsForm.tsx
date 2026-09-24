import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { BaseButton } from '../../../components/ui/BaseButton'
import { InputField } from '../../../components/ui/InputField'
import { Modal } from '../../../components/ui/Modal'
import { isValidEmail } from '../../../data/hotel-catalog'
import { newContact } from '../../../lib/hotel'
import { useHotelMaster } from '../../../state/hotel-store'
import type { HotelContact } from '../../../types/hotel'
import { SectionHead } from './shared'

function ContactGroup({
  title,
  contacts,
  onChange,
}: {
  title: string
  contacts: HotelContact[]
  onChange: (contacts: HotelContact[]) => void
}) {
  const [editing, setEditing] = useState<string | null>(null)
  const [removeId, setRemoveId] = useState<string | null>(null)

  return (
    <div className="mb-6">
      <p className="mb-2 text-sm font-medium text-gray-800 dark:text-zinc-100">{title}</p>
      <div className="space-y-2">
        {contacts.map((contact) => {
          const open = editing === contact.id || !contact.contactPerson.trim()
          return open ? (
            <div key={contact.id} className="rounded-xl border border-gray-100 p-3 dark:border-[#2C2A2A]">
              <InputField label="Contact Person" value={contact.contactPerson} onChange={(e) => onChange(contacts.map((c) => (c.id === contact.id ? { ...c, contactPerson: e.target.value } : c)))} />
              <InputField label="Designation" value={contact.designation} onChange={(e) => onChange(contacts.map((c) => (c.id === contact.id ? { ...c, designation: e.target.value } : c)))} />
              <InputField label="Email ID" type="email" value={contact.email} onChange={(e) => onChange(contacts.map((c) => (c.id === contact.id ? { ...c, email: e.target.value } : c)))} />
              {contact.email && !isValidEmail(contact.email) ? <p className="-mt-2 mb-2 text-[11px] text-red-500">Enter a valid email address.</p> : null}
              <InputField label="Contact Number" type="tel" value={contact.contactNumber} onChange={(e) => onChange(contacts.map((c) => (c.id === contact.id ? { ...c, contactNumber: e.target.value } : c)))} />
              <div className="flex gap-2">
                <BaseButton size="sm" variant="secondary" onClick={() => setEditing(null)} disabled={!contact.contactPerson.trim()}>
                  Done
                </BaseButton>
                <button type="button" className="text-xs text-gray-400 hover:text-red-500" onClick={() => setRemoveId(contact.id)}>
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div key={contact.id} className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 px-3 py-3 dark:border-[#2C2A2A]">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{contact.contactPerson}</p>
                {contact.designation ? <p className="text-xs text-gray-500">{contact.designation}</p> : null}
                {contact.email ? <p className="mt-1 text-xs text-gray-600 dark:text-zinc-300">{contact.email}</p> : null}
                {contact.contactNumber ? <p className="text-xs text-gray-600 dark:text-zinc-300">{contact.contactNumber}</p> : null}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="text-xs text-gray-500 underline" onClick={() => setEditing(contact.id)}>
                  Edit
                </button>
                <button type="button" className="p-1 text-gray-400 hover:text-red-500" aria-label="Remove contact" onClick={() => setRemoveId(contact.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
      <BaseButton variant="secondary" className="mt-2" onClick={() => {
        const created = newContact()
        onChange([...contacts, created])
        setEditing(created.id)
      }}>
        + Add Contact
      </BaseButton>
      <Modal
        open={!!removeId}
        title="Remove contact"
        onClose={() => setRemoveId(null)}
        footer={
          <>
            <BaseButton variant="secondary" onClick={() => setRemoveId(null)}>Cancel</BaseButton>
            <BaseButton variant="danger" onClick={() => { onChange(contacts.filter((c) => c.id !== removeId)); setRemoveId(null) }}>Remove</BaseButton>
          </>
        }
      >
        <p className="text-sm text-gray-700 dark:text-gray-300">This contact will be removed from the hotel.</p>
      </Modal>
    </div>
  )
}

export function ContactsForm() {
  const { active: hotel, patchActive } = useHotelMaster()
  return (
    <div className="scroll-mt-3 px-6 py-4">
      <SectionHead title="Hotel Contacts" helper="Sales and reservations stay as separate groups. Add as many people as the hotel has." />
      <ContactGroup title="Sales Contacts" contacts={hotel.contacts.sales} onChange={(sales) => patchActive({ contacts: { ...hotel.contacts, sales } })} />
      <ContactGroup title="Reservations Contacts" contacts={hotel.contacts.reservations} onChange={(reservations) => patchActive({ contacts: { ...hotel.contacts, reservations } })} />
    </div>
  )
}
