import type { ReactNode } from 'react'
import { Sidebar, type SidebarAskAi } from './Sidebar'

export function AppShell({ children, askAi }: { children: ReactNode; askAi?: SidebarAskAi }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F6F6F7] p-4 dark:bg-[#050505]">
      <div className="hidden h-full md:block">
        <Sidebar askAi={askAi} />
      </div>
      <main className="relative ml-0 h-full min-w-0 flex-1 overflow-hidden rounded-3xl bg-white shadow-[0_1px_1px_rgb(0_0_0/_0.03),0_16px_40px_rgb(0_0_0/_0.06)] md:ml-4 dark:bg-[#101012] dark:shadow-[0_16px_40px_rgb(0_0_0/_0.35)]">
        {children}
      </main>
    </div>
  )
}
