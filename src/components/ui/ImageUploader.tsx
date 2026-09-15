import { ImageIcon } from 'lucide-react'
import { useRef, type ChangeEvent, type CSSProperties, type DragEvent } from 'react'
import { cn } from '../../lib/cn'
import { BaseButton } from './BaseButton'

type Source = 'upload' | 'library'

type Props = {
  value: string
  onChange: (url: string) => void
  onRemove?: () => void
  onReposition?: () => void
  label?: string
  className?: string
  aspect?: string
  /** Reserved for a later image library / search source. */
  source?: Source
  imageStyle?: CSSProperties
}

export function ImageUploader({
  value,
  onChange,
  onRemove,
  onReposition,
  label = 'Upload image',
  className,
  aspect = 'aspect-[16/9]',
  imageStyle,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function readFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') onChange(reader.result)
    }
    reader.readAsDataURL(file)
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) readFile(file)
    e.target.value = ''
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) readFile(file)
  }

  return (
    <div className={cn('mb-3', className)}>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      {value ? (
        <div className={cn('relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2C2A2A]', aspect)}>
          <img src={value} alt="" className="h-full w-full object-cover" style={imageStyle} />
          <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/60 p-3">
            <BaseButton size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
              Replace
            </BaseButton>
            {onReposition && (
              <BaseButton size="sm" variant="secondary" onClick={onReposition}>
                Reposition
              </BaseButton>
            )}
            {onRemove && (
              <BaseButton size="sm" variant="danger" onClick={onRemove}>
                Remove
              </BaseButton>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-500 transition hover:border-gray-400 hover:bg-gray-100 dark:border-zinc-600 dark:bg-zinc-800/40 dark:text-zinc-400',
            aspect,
          )}
        >
          <ImageIcon className="h-6 w-6" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{label}</span>
          <span className="text-xs text-gray-400">Drag & drop or browse</span>
        </button>
      )}
    </div>
  )
}
