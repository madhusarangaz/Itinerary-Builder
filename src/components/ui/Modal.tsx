import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { BaseButton } from './BaseButton'

type Props = {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ open, title, subtitle, onClose, children, footer }: Props) {
  const node = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-[#333336] dark:bg-[#1E1E20]"
          >
            <div className="flex items-start justify-between border-b border-gray-100 px-6 pt-5 pb-4 dark:border-[#2C2A2A]">
              <div>
                <h2 className="text-[17px] leading-tight font-semibold text-gray-900 dark:text-white">{title}</h2>
                {subtitle && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
              </div>
              <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-[#2C2A2A] dark:bg-[#1A1A1C]">
              {footer ?? (
                <BaseButton variant="secondary" onClick={onClose}>
                  Close
                </BaseButton>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (typeof document === 'undefined') return node
  return createPortal(node, document.body)
}
