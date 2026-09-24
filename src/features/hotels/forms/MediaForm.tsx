import { ImageUploader } from '../../../components/ui/ImageUploader'
import { newHotelImage } from '../../../lib/hotel'
import { useHotelMaster } from '../../../state/hotel-store'
import { SectionHead } from './shared'

export function MediaForm() {
  const { active: hotel, patchActive } = useHotelMaster()
  const images = [...hotel.images].sort((a, b) => a.sortOrder - b.sortOrder)

  function save(next: typeof images) {
    patchActive({
      images: next.map((img, sortOrder) => ({ ...img, sortOrder, isCover: img.isCover })),
    })
  }

  function setCover(id: string) {
    save(images.map((img) => ({ ...img, isCover: img.id === id })))
  }

  return (
    <div className="scroll-mt-3 px-6 py-4">
      <SectionHead title="Hotel Images" helper="Add reusable hotel images for itineraries and hotel profiles. Upload from your computer. An authorised image source can be connected later." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {images.map((img, index) => (
          <div key={img.id}>
            <ImageUploader
              className="mb-1"
              aspect="aspect-[4/3]"
              label="Hotel image"
              value={img.url}
              onChange={(url) => save(images.map((item) => (item.id === img.id ? { ...item, url, source: 'upload' } : item)))}
              onRemove={() => {
                const next = images.filter((item) => item.id !== img.id)
                if (img.isCover && next[0]) next[0] = { ...next[0], isCover: true }
                save(next)
              }}
            />
            {img.url ? (
              <div className="mb-2 flex items-center justify-between text-xs">
                <button type="button" className="text-gray-500 underline" onClick={() => setCover(img.id)}>
                  {img.isCover ? 'Cover' : 'Set as cover'}
                </button>
                <span className="flex gap-2 text-gray-400">
                  <button type="button" disabled={index === 0} onClick={() => {
                    const next = [...images]
                    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
                    save(next)
                  }}>Earlier</button>
                  <button type="button" disabled={index === images.length - 1} onClick={() => {
                    const next = [...images]
                    ;[next[index + 1], next[index]] = [next[index], next[index + 1]]
                    save(next)
                  }}>Later</button>
                </span>
              </div>
            ) : null}
          </div>
        ))}
        <ImageUploader
          className="mb-0"
          aspect="aspect-[4/3]"
          label="Add image"
          value=""
          onChange={(url) => save([...images, newHotelImage(url, images.length, images.every((img) => !img.isCover))])}
        />
      </div>
    </div>
  )
}
