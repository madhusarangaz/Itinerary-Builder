import { useState, type ReactNode } from 'react'
import { InputField } from '../../../components/ui/InputField'

export function SectionHead({ title, helper }: { title: string; helper: string }) {
  return (
    <>
      <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mb-4 text-xs text-gray-400">{helper}</p>
    </>
  )
}

export function MoreDetails({ children, label = 'Advanced mileage settings' }: { children: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm text-gray-500 underline decoration-gray-300 underline-offset-2 hover:text-gray-700 dark:text-zinc-400"
      >
        {open ? 'Hide details' : label}
      </button>
      {open ? <div className="mt-3">{children}</div> : null}
    </div>
  )
}

export function MoneyField({
  label,
  value,
  onChange,
  optional,
  hint,
}: {
  label: string
  value?: number
  onChange: (value: number | undefined) => void
  optional?: boolean
  hint?: string
}) {
  return (
    <div>
      <InputField
        label={label}
        optional={optional}
        type="number"
        min={0}
        inputMode="numeric"
        startIcon={<span className="text-[11px] font-medium text-gray-500">LKR</span>}
        value={value ?? ''}
        onChange={(e) => {
          const raw = e.target.value
          onChange(raw === '' ? undefined : Number(raw))
        }}
      />
      {hint ? <p className="mb-3 -mt-2 text-[11px] text-gray-400">{hint}</p> : null}
    </div>
  )
}
