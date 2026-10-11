import { Check, Plus } from 'lucide-react'
import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { cn } from '../../lib/cn'

export type ImageChoice = {
  src: string
  alt?: string
}

type Props = {
  value: string
  options: ImageChoice[]
  onChange: (url: string) => void
  className?: string
  /** Hotel stays can keep several photos. Other pickers stay single-select. */
  multiple?: boolean
  values?: string[]
  onSelectMany?: (urls: string[]) => void
  /** Three columns keeps a hotel gallery as two rows of three. */
  columns?: 3
}

export function ImageSelect({ value, options, onChange, className, multiple = false, values, onSelectMany, columns }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [added, setAdded] = useState<string[]>([])

  const tiles = useMemo(() => {
    const seen = new Set<string>()
    const list: ImageChoice[] = []
    function push(src: string, alt?: string) {
      if (!src || seen.has(src)) return
      seen.add(src)
      list.push({ src, alt })
    }
    for (const option of options) push(option.src, option.alt)
    for (const src of added) push(src, 'Uploaded image')
    if (multiple) {
      for (const src of values ?? []) push(src, 'Selected image')
    } else {
      push(value, 'Selected image')
    }
    return list
  }, [added, multiple, options, value, values])

  function choose(src: string) {
    if (!multiple) {
      onChange(src)
      return
    }
    const current = values ?? []
    const next = current.includes(src) ? current.filter((item) => item !== src) : [...current, src]
    onSelectMany?.(next)
  }

  function readFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result
      if (typeof url !== 'string') return
      setAdded((current) => (current.includes(url) ? current : [...current, url]))
      if (multiple) {
        const current = values ?? []
        onSelectMany?.(current.includes(url) ? current : [...current, url])
        return
      }
      onChange(url)
    }
    reader.readAsDataURL(file)
  }

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) readFile(file)
    event.target.value = ''
  }

  function onDrop(event: DragEvent) {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) readFile(file)
  }

  return (
    <div className={className}>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      <div className={columns === 3 ? 'grid grid-cols-3 gap-2' : 'grid grid-cols-3 gap-2 sm:grid-cols-4'}>
        {tiles.map((tile) => {
          const selected = multiple ? (values ?? []).includes(tile.src) : tile.src === value
          return (
            <button
              key={tile.src}
              type="button"
              aria-label={tile.alt || 'Select image'}
              aria-pressed={selected}
              onClick={() => choose(tile.src)}
              className={cn(
                'relative aspect-[4/3] overflow-hidden rounded-lg border bg-gray-50',
                selected
                  ? 'border-[#C5D7FF] ring-2 ring-[#E7EFFF] dark:border-[#5b93ff]/50 dark:ring-[#5b93ff]/25'
                  : 'border-gray-200 hover:border-gray-300 dark:border-zinc-700 dark:hover:border-zinc-500',
              )}
            >
              <img src={tile.src} alt="" className="h-full w-full object-cover" />
              {selected ? (
                <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#E7EFFF] text-[#14357A] dark:bg-[#5b93ff]/30 dark:text-[#c5d9ff]">
                  <Check size={12} strokeWidth={2.5} />
                </span>
              ) : null}
            </button>
          )
        })}
        <button
          type="button"
          aria-label="Add new image"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
          className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:border-gray-400 hover:bg-gray-100 dark:border-zinc-600 dark:bg-zinc-800/40 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <Plus size={16} />
          <span className="text-xs font-medium">Add new</span>
        </button>
      </div>
    </div>
  )
}
