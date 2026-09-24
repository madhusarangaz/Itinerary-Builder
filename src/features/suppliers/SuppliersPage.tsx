import { AnimatePresence, motion } from 'framer-motion'
import { Archive, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { BaseButton } from '../../components/ui/BaseButton'
import { BaseSelect } from '../../components/ui/BaseSelect'
import { GUIDE_TYPE_LABEL, SUPPLIER_LANGUAGES, SUPPLIER_STATUS_LABELS, SUPPLIER_TYPE_LABEL, activeDriverCount, formatUpdated, serviceLabel, vehicleCount } from '../../data/supplier-catalog'
import { emptySupplier } from '../../lib/supplier'
import { cn } from '../../lib/cn'
import { useToast } from '../../components/ui/Toast'
import { useSuppliers } from '../../state/supplier-store'
import type { GuideType, SupplierStatus, SupplierType } from '../../types/supplier'
import { SupplierBuilder } from './SupplierBuilder'

const slideUp = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' as const, when: 'beforeChildren' } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' as const, when: 'afterChildren' } },
}
const panel = {
  hidden: { opacity: 0, y: 100 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: 100, transition: { duration: 0.2, ease: 'easeIn' as const } },
}

export function SuppliersPage() {
  const { suppliers, setActiveId, addSupplier, archiveSupplier, removeSupplier } = useSuppliers()
  const { notify } = useToast()
  const [open, setOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState<'edit' | 'summary'>('edit')
  const [q, setQ] = useState('')
  const [type, setType] = useState('')
  const [guide, setGuide] = useState('')
  const [language, setLanguage] = useState('')
  const [status, setStatus] = useState('')

  const rows = useMemo(() => {
    const term = q.toLowerCase().trim()
    return suppliers.filter((supplier) => {
      const regs = supplier.vehicleInventory.flatMap((group) => [group.model, group.transportName, ...group.vehicles.map((unit) => unit.registrationNumber)]).join(' ')
      const drivers = supplier.drivers.map((driver) => driver.name).join(' ')
      const hay = `${supplier.name} ${supplier.sltdaRegistrationNo ?? ''} ${regs} ${drivers}`.toLowerCase()
      if (term && !hay.includes(term)) return false
      if (type && supplier.type !== type) return false
      if (guide && !supplier.guideTypes.includes(guide as GuideType)) return false
      if (language && !supplier.languages.includes(language)) return false
      if (status && supplier.status !== status) return false
      return true
    })
  }, [suppliers, q, type, guide, language, status])

  function openRow(id: string) {
    setActiveId(id)
    setMobileTab('edit')
    setOpen(true)
  }

  return (
    <AppShell>
      <div className="flex h-full flex-col p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium text-gray-900 dark:text-zinc-100">Suppliers</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Manage guides, transport suppliers, vehicles and drivers.</p>
          </div>
          <BaseButton onClick={() => { addSupplier(emptySupplier()); setOpen(true) }}>
            <Plus size={16} /> Add Supplier
          </BaseButton>
        </div>
        <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-5">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search suppliers..." className="h-10 w-full rounded-lg border border-gray-200 bg-white pr-3 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-transparent dark:bg-zinc-800 dark:text-zinc-100" />
          </div>
          <BaseSelect className="mb-0" placeholder="All types" value={type} options={(Object.keys(SUPPLIER_TYPE_LABEL) as SupplierType[]).map((id) => ({ value: id, label: SUPPLIER_TYPE_LABEL[id] }))} onChange={(e) => setType(e.target.value)} />
          <BaseSelect className="mb-0" placeholder="All guide types" value={guide} options={(Object.keys(GUIDE_TYPE_LABEL) as GuideType[]).map((id) => ({ value: id, label: GUIDE_TYPE_LABEL[id] }))} onChange={(e) => setGuide(e.target.value)} />
          <BaseSelect className="mb-0" placeholder="All languages" value={language} options={SUPPLIER_LANGUAGES.map((item) => ({ value: item, label: item }))} onChange={(e) => setLanguage(e.target.value)} />
          <BaseSelect className="mb-0" placeholder="All statuses" value={status} options={(Object.keys(SUPPLIER_STATUS_LABELS) as SupplierStatus[]).map((id) => ({ value: id, label: SUPPLIER_STATUS_LABELS[id] }))} onChange={(e) => setStatus(e.target.value)} />
        </div>
        <div className="overflow-auto rounded-xl border border-gray-100 dark:border-[#2C2A2A]">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Services / Guide Type</th>
                <th className="px-4 py-3 font-medium">Vehicles</th>
                <th className="px-4 py-3 font-medium">Drivers</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((supplier) => {
                const vehicles = supplier.type === 'vehicle_fleet' ? vehicleCount(supplier) : 0
                const drivers = supplier.type === 'vehicle_fleet' ? activeDriverCount(supplier) : 0
                return (
                  <tr key={supplier.id} className="cursor-pointer border-t border-gray-100 hover:bg-gray-50 dark:border-[#2C2A2A] dark:hover:bg-white/5" onClick={() => openRow(supplier.id)}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-zinc-100">{supplier.name || 'Untitled supplier'}</td>
                    <td className="px-4 py-3">{supplier.type ? SUPPLIER_TYPE_LABEL[supplier.type] : '—'}</td>
                    <td className="px-4 py-3">{serviceLabel(supplier)}</td>
                    <td className="px-4 py-3">{supplier.type === 'vehicle_fleet' ? vehicles : '—'}</td>
                    <td className="px-4 py-3">{supplier.type === 'vehicle_fleet' ? drivers : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px]', supplier.status === 'active' ? 'bg-gray-900 text-white dark:bg-[#7A3714]' : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-zinc-200')}>{SUPPLIER_STATUS_LABELS[supplier.status]}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatUpdated(supplier.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 text-xs text-gray-500">
                        <button type="button" className="inline-flex items-center gap-1" onClick={(e) => { e.stopPropagation(); openRow(supplier.id) }}><Pencil size={12} /> Edit</button>
                        <button type="button" className="inline-flex items-center gap-1" onClick={(e) => { e.stopPropagation(); archiveSupplier(supplier.id) }}><Archive size={12} /> {supplier.status === 'inactive' ? 'Restore' : 'Deactivate'}</button>
                        <button type="button" className="inline-flex items-center gap-1 text-red-600" onClick={(e) => { e.stopPropagation(); const label = supplier.name || 'this supplier'; if (!window.confirm(`Delete "${label}"?`)) return; removeSupplier(supplier.id); setOpen(false); notify('Supplier deleted.') }}><Trash2 size={12} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {rows.length === 0 ? <p className="px-4 py-8 text-center text-sm text-gray-400">No suppliers match these filters.</p> : null}
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div variants={slideUp} initial="hidden" animate="visible" exit="exit" className="fixed inset-0 z-40 h-full bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}>
            <motion.div variants={panel} className="fixed top-8 right-5 bottom-0 left-2 z-50 flex flex-col overflow-hidden rounded-t-xl bg-white shadow-lg md:left-[15%] dark:bg-[#1E1E20]" onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-2 border-b border-gray-100 px-4 py-2 md:hidden">
                {(['edit', 'summary'] as const).map((tab) => (
                  <button key={tab} type="button" onClick={() => setMobileTab(tab)} className={`rounded-full px-3 py-1 text-sm capitalize ${mobileTab === tab ? 'bg-gray-900 text-white' : 'text-gray-500'}`}>{tab}</button>
                ))}
              </div>
              <div className="min-h-0 flex-1">
                <SupplierBuilder onClose={() => setOpen(false)} mobileTab={mobileTab} onShowEditor={() => setMobileTab('edit')} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
