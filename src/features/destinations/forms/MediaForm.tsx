import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Star } from 'lucide-react'
import { useState } from 'react'
import { BaseButton } from '../../../components/ui/BaseButton'
import { ImageUploader } from '../../../components/ui/ImageUploader'
import { InputField } from '../../../components/ui/InputField'
import { Modal } from '../../../components/ui/Modal'
import { emptyImage } from '../../../data/destination-sample'
import { uid } from '../../../lib/ids'
import { useDestinations } from '../../../state/destination-store'
import type { DestinationImage } from '../../../types/destination'
import { SectionHead } from './shared'

function SortableImage({
  image,
  onChange,
  onRemove,
  onSetCover,
  onSettings,
}: {
  image: DestinationImage
  onChange: (url: string) => void
  onRemove: () => void
  onSetCover: () => void
  onSettings: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="relative"
    >
      <button
        type="button"
        className="absolute top-2 left-2 z-10 rounded-md bg-white/90 p-1 text-gray-500 shadow-sm"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </button>
      <ImageUploader
        value={image.url}
        aspect="aspect-[4/3]"
        imageStyle={{ objectPosition: `center ${image.focalY ?? 50}%` }}
        onChange={onChange}
        onRemove={onRemove}
        onReposition={onSettings}
        label="Add image"
      />
      <div className="mt-1 flex gap-2">
        <button type="button" className="text-[11px] text-gray-500 underline" onClick={onSetCover}>
          {image.isCover ? 'Cover image' : 'Set as cover'}
        </button>
        <button type="button" className="text-[11px] text-gray-500 underline" onClick={onSettings}>
          Caption & crop
        </button>
      </div>
    </div>
  )
}

export function MediaForm() {
  const { active: d, patchActive } = useDestinations()
  const [editId, setEditId] = useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const cover = d.coverImage
  const editing = d.gallery.find((g) => g.id === editId) ?? (cover?.id === editId ? cover : undefined)

  function setCoverFromUrl(url: string) {
    const next = emptyImage(url, { id: cover?.id ?? uid('img'), isCover: true, focalY: cover?.focalY ?? 50, caption: cover?.caption, alt: cover?.alt })
    const gallery = d.gallery.some((g) => g.id === next.id)
      ? d.gallery.map((g) => ({ ...g, url: g.id === next.id ? url : g.url, isCover: g.id === next.id }))
      : [{ ...next, sortOrder: 0 }, ...d.gallery.map((g, i) => ({ ...g, isCover: false, sortOrder: i + 1 }))]
    patchActive({ coverImage: next, gallery })
  }

  function bumpFocal() {
    const nextY = (cover?.focalY ?? 40) >= 70 ? 30 : (cover?.focalY ?? 40) + 20
    const next = cover ? { ...cover, focalY: nextY } : emptyImage('', { focalY: nextY, isCover: true })
    patchActive({
      coverImage: next,
      gallery: d.gallery.map((g) => (g.id === next.id || g.isCover ? { ...g, focalY: nextY } : g)),
    })
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const ids = d.gallery.map((g) => g.id)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    const gallery = arrayMove(d.gallery, oldIndex, newIndex).map((g, i) => ({ ...g, sortOrder: i }))
    patchActive({ gallery })
  }

  return (
    <div id="form-media" className="scroll-mt-3 space-y-1 px-6 py-4">
      <SectionHead title="Destination Media" helper="Add reusable destination photography for itineraries." />

      <p className="mb-1.5 text-sm text-gray-800 dark:text-zinc-100">Cover image</p>
      <ImageUploader
        value={cover?.url ?? ''}
        aspect="aspect-[16/9]"
        label="Upload cover image"
        imageStyle={{ objectPosition: `center ${cover?.focalY ?? 50}%` }}
        onChange={setCoverFromUrl}
        onReposition={bumpFocal}
        onRemove={() =>
          patchActive({
            coverImage: undefined,
            gallery: d.gallery.map((g) => ({ ...g, isCover: false })),
          })
        }
      />
      {cover?.url ? (
        <p className="mb-4 -mt-2 text-[11px] text-gray-400">Reposition cycles the focal point used in previews.</p>
      ) : null}

      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-sm text-gray-800 dark:text-zinc-100">Destination gallery</p>
        <span className="text-[11px] text-gray-400">Recommended 4–5 images</span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={d.gallery.map((g) => g.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 gap-3">
            {d.gallery.map((image) => (
              <SortableImage
                key={image.id}
                image={image}
                onChange={(url) => patchActive({ gallery: d.gallery.map((g) => (g.id === image.id ? { ...g, url } : g)) })}
                onRemove={() => {
                  const gallery = d.gallery.filter((g) => g.id !== image.id)
                  patchActive({
                    gallery,
                    coverImage: d.coverImage?.id === image.id ? gallery[0] : d.coverImage,
                  })
                }}
                onSetCover={() =>
                  patchActive({
                    coverImage: { ...image, isCover: true },
                    gallery: d.gallery.map((g) => ({ ...g, isCover: g.id === image.id })),
                  })
                }
                onSettings={() => setEditId(image.id)}
              />
            ))}
            <button
              type="button"
              onClick={() => patchActive({ gallery: [...d.gallery, emptyImage('', { sortOrder: d.gallery.length })] })}
              className="flex aspect-[4/3] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 hover:bg-gray-50 dark:border-zinc-600 dark:hover:bg-white/5"
            >
              + Add image
            </button>
          </div>
        </SortableContext>
      </DndContext>

      <Modal
        open={!!editing}
        title="Image details"
        subtitle="Caption and alt stay hidden until you open this."
        onClose={() => setEditId(null)}
        footer={
          <BaseButton onClick={() => setEditId(null)}>Done</BaseButton>
        }
      >
        {editing ? (
          <>
            <InputField
              label="Caption"
              optional
              value={editing.caption ?? ''}
              onChange={(e) => {
                const caption = e.target.value
                patchActive({
                  gallery: d.gallery.map((g) => (g.id === editing.id ? { ...g, caption } : g)),
                  coverImage: d.coverImage?.id === editing.id ? { ...d.coverImage, caption } : d.coverImage,
                })
              }}
            />
            <InputField
              label="Internal alt description"
              optional
              value={editing.alt ?? ''}
              onChange={(e) => {
                const alt = e.target.value
                patchActive({
                  gallery: d.gallery.map((g) => (g.id === editing.id ? { ...g, alt } : g)),
                  coverImage: d.coverImage?.id === editing.id ? { ...d.coverImage, alt } : d.coverImage,
                })
              }}
            />
            <p className="mb-1.5 text-sm text-gray-800">Focal point</p>
            <input
              type="range"
              min={10}
              max={90}
              value={editing.focalY ?? 50}
              onChange={(e) => {
                const focalY = Number(e.target.value)
                patchActive({
                  gallery: d.gallery.map((g) => (g.id === editing.id ? { ...g, focalY } : g)),
                  coverImage: d.coverImage?.id === editing.id ? { ...d.coverImage, focalY } : d.coverImage,
                })
              }}
              className="mb-3 w-full"
            />
            {editing.isCover ? (
              <p className="flex items-center gap-1 text-xs text-gray-500">
                <Star size={12} /> This is the cover image
              </p>
            ) : null}
          </>
        ) : null}
      </Modal>
    </div>
  )
}
