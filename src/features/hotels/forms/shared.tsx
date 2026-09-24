export function SectionHead({ title, helper }: { title: string; helper: string }) {
  return (
    <>
      <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mb-4 text-xs text-gray-400">{helper}</p>
    </>
  )
}
