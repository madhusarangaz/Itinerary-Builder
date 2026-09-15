import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

export function Drawer({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  const node = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.aside
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col border-l border-gray-100 bg-white shadow-2xl dark:border-[#2C2A2A] dark:bg-[#1E1E20]"
          >
            <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4 dark:border-[#2C2A2A]">
              <div>
                <h2 className="text-[17px] font-semibold text-gray-900 dark:text-white">{title}</h2>
                {subtitle ? <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p> : null}
              </div>
              <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {footer ? (
              <div className="border-t border-gray-100 px-5 py-4 dark:border-[#2C2A2A]">{footer}</div>
            ) : null}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (typeof document === 'undefined') return node
  return createPortal(node, document.body)
}
