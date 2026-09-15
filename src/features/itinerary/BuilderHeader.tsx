import { X } from 'lucide-react'
import type { SaveStatus } from '../../types/itinerary'
import { ThemeToggle } from '../../components/ui/ThemeToggle'

export function BuilderHeader({
  saveStatus,
  onClose,
  onShowPreview,
  showPreviewToggle,
  title = 'Create Itinerary',
  subtitle = 'Type: Custom tour',
  previewLabel = 'Show preview',
}: {
  saveStatus: SaveStatus
  onClose: () => void
  onShowPreview?: () => void
  showPreviewToggle?: boolean
  title?: string
  subtitle?: string
  previewLabel?: string
}) {
  const label = saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Autosaved just now' : ''
  return (
    <div className="sticky top-0 z-10 rounded-[16px] bg-white dark:bg-[#1E1E20]">
      <div className="flex items-center justify-between px-6 pt-4">
        <div>
          <h2 className="text-base text-black dark:text-white">{title}</h2>
          <p className="text-sm text-gray-500 opacity-70 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-gray-400 sm:inline">{label}</span>
          <ThemeToggle compact />
          {showPreviewToggle && (
            <button type="button" onClick={onShowPreview} className="text-sm text-gray-700 underline md:hidden dark:text-zinc-300">
              {previewLabel}
            </button>
          )}
          <button type="button" onClick={onClose} className="text-gray-950 hover:text-red-500 dark:text-white">
            <X size={14} />
          </button>
        </div>
      </div>
      <hr className="my-2 border-gray-100 opacity-50 dark:border-gray-800" />
    </div>
  )
}
