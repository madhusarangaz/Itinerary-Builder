import { Check, X } from 'lucide-react'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

type ToastItem = { id: number; message: string }

const ToastContext = createContext<{ notify: (message: string) => void } | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const notify = useCallback((message: string) => {
    const id = Date.now()
    setItems((prev) => [...prev.filter((item) => item.message !== message), { id, message }].slice(-3))
    window.setTimeout(() => setItems((prev) => prev.filter((item) => item.id !== id)), 3200)
  }, [])

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[80] flex w-[min(320px,calc(100vw-2rem))] flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="pointer-events-auto flex items-start gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-lg dark:border-[#2C2A2A] dark:bg-[#1E1E20] dark:text-zinc-100">
            <Check size={16} className="mt-0.5 shrink-0" />
            <p className="flex-1">{item.message}</p>
            <button type="button" className="text-gray-400" onClick={() => setItems((prev) => prev.filter((row) => row.id !== item.id))}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within provider')
  return ctx
}
