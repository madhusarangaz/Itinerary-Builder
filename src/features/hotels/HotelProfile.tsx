import { Building2 } from 'lucide-react'
import { starLabel, starMarks } from '../../data/hotel-catalog'
import { coverImage } from '../../lib/hotel'
import { hotelProgress } from '../../lib/hotel-completeness'
import { useHotelMaster } from '../../state/hotel-store'

export function HotelProfile() {
  const { active: hotel } = useHotelMaster()
  const cover = coverImage(hotel)
  const progress = hotelProgress(hotel)
  const totalRooms = hotel.rooms.reduce((sum, room) => sum + (room.numberOfRooms || 0), 0)
  const place = hotel.destinationName || hotel.address.split('\n')[0]

  return (
    <div className="h-full overflow-auto bg-[#f2f2f2] p-4 dark:bg-[#1F1F20]">
      <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-[#2C2A2A] dark:bg-[#1E1E20]">
        <div className="mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-zinc-800">
          {cover?.url ? (
            <img src={cover.url} alt="" className="aspect-[16/9] w-full object-cover" />
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center text-gray-300 dark:text-zinc-600">
              <Building2 size={28} />
            </div>
          )}
        </div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-zinc-100">{hotel.name || 'Untitled hotel'}</h2>
        <p className="text-sm text-[#c4a574]">{starMarks(hotel.starCategory) || starLabel(hotel.starCategory)}</p>
        {place ? <p className="mt-1 text-sm text-gray-500">{place}</p> : null}
        {hotel.address ? <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-gray-500">{hotel.address}</p> : null}

        <div className="mt-4 border-t border-gray-100 pt-3 dark:border-[#2C2A2A]">
          <p className="mb-1 text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Rooms</p>
          {hotel.rooms.filter((r) => r.name.trim()).map((room) => (
            <div key={room.id} className="flex justify-between py-0.5 text-sm">
              <span className="text-gray-600 dark:text-zinc-300">{room.name}</span>
              <span className="font-medium text-gray-900 dark:text-zinc-100">{room.numberOfRooms}</span>
            </div>
          ))}
          <p className="mt-1 text-xs text-gray-400">{totalRooms} total rooms</p>
        </div>

        <div className="mt-3 border-t border-gray-100 pt-3 text-sm dark:border-[#2C2A2A]">
          <p className="mb-1 text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Contacts</p>
          <p className="text-gray-600 dark:text-zinc-300">Sales · {hotel.contacts.sales.length}</p>
          <p className="text-gray-600 dark:text-zinc-300">Reservations · {hotel.contacts.reservations.length}</p>
        </div>

        <div className="mt-3 border-t border-gray-100 pt-3 dark:border-[#2C2A2A]">
          <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Media</p>
          <p className="text-sm text-gray-600 dark:text-zinc-300">{hotel.images.filter((img) => img.url).length} images</p>
        </div>

        <div className="mt-3 border-t border-gray-100 pt-3 dark:border-[#2C2A2A]">
          <p className="text-[10px] font-medium tracking-[0.18em] text-gray-400 uppercase">Profile</p>
          <p className="mt-1 text-sm text-gray-700 dark:text-zinc-300">{progress.percent}% complete</p>
          <p className="text-xs text-gray-400">
            {progress.remaining === 0 ? 'Ready to reuse in itineraries.' : progress.remaining === 1 ? '1 recommended detail remaining' : `${progress.remaining} recommended details remaining`}
          </p>
        </div>
      </div>
    </div>
  )
}
