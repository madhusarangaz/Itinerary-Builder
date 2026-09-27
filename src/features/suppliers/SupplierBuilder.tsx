import { useEffect, useState } from 'react'
import { BaseButton } from '../../components/ui/BaseButton'
import { Modal } from '../../components/ui/Modal'
import { BuilderFooter } from '../itinerary/BuilderFooter'
import { BuilderHeader } from '../itinerary/BuilderHeader'
import { requiredSupplierIssues, supplierProgress, supplierSections } from '../../lib/supplier-completeness'
import { useSuppliers } from '../../state/supplier-store'
import type { SupplierSectionId } from '../../types/supplier'
import { SupplierNav } from './SupplierNav'
import { SupplierSections } from './forms/SupplierSections'

export function SupplierBuilder({ onClose }: { onClose: () => void }) {
  const { active, saveStatus, patchActive } = useSuppliers()
  const [section, setSection] = useState<SupplierSectionId>('supplier')
  const [issues, setIssues] = useState<string[] | null>(null)
  const progress = supplierProgress(active)
  const visible = supplierSections(active)

  useEffect(() => {
    if (!visible.some((item) => item.id === section)) setSection('supplier')
  }, [section, visible])

  function activate() {
    const missing = requiredSupplierIssues(active)
    if (missing.length) {
      setIssues(missing.map((item) => item.message))
      setSection(missing[0].section)
      return
    }
    patchActive({ status: 'active' })
  }

  return (
    <>
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white dark:bg-[#1E1E20]">
        <BuilderHeader
          saveStatus={saveStatus}
          onClose={onClose}
          statusFirst
          progress={progress.percent}
          title={active.name.trim() ? `Edit ${active.name}` : 'Create Supplier'}
          subtitle="Supplier Master"
        />
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="md:hidden">
            <SupplierNav supplier={active} active={section} onChange={setSection} orientation="horizontal" />
          </div>
          <div className="hidden h-full md:flex">
            <SupplierNav supplier={active} active={section} onChange={setSection} />
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-[720px]">
                <SupplierSections section={section} />
              </div>
            </div>
            <BuilderFooter
              align="end"
              onSaveDraft={() => patchActive({ status: 'draft' })}
              onGenerate={activate}
              draftLabel="Save as Draft"
              generateLabel={active.status === 'active' ? 'Save supplier' : 'Activate Supplier'}
            />
          </div>
        </div>
      </div>
      <Modal open={!!issues} title="A few details remaining" onClose={() => setIssues(null)} footer={<BaseButton onClick={() => setIssues(null)}>Continue editing</BaseButton>}>
        <ul className="list-disc space-y-1 pl-4 text-sm text-gray-600 dark:text-zinc-300">
          {issues?.map((issue) => <li key={issue}>{issue}</li>)}
        </ul>
      </Modal>
    </>
  )
}
