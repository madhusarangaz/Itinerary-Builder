import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen overflow-hidden bg-[#F2F2F2] p-2 dark:bg-[#1F1F20]">
      <div className="hidden h-[calc(100vh-16px)] md:block">
        <Sidebar />
      </div>
      <main className="relative ml-0 min-w-0 flex-1 rounded-3xl bg-white md:ml-3 dark:bg-[#242528]">{children}</main>
    </div>
  )
}
