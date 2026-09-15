import { cn } from '../../lib/cn'

export function CheckboxField({
  label,
  checked,
  onChange,
  hint,
  className,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  hint?: string
  className?: string
}) {
  return (
    <label className={cn('mb-3 flex cursor-pointer items-start gap-2.5 text-sm', className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-gray-900 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
      />
      <span>
        <span className="text-gray-800 dark:text-zinc-100">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-gray-400">{hint}</span> : null}
      </span>
    </label>
  )
}
