import { Moon, Sun } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useTheme } from '../ThemeProvider'

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme()

  return (
    <div
      className={cn(
        'flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800',
        compact ? 'text-xs' : 'text-sm',
      )}
      role="group"
      aria-label="Color theme"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium transition',
          theme === 'light' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-600 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-white/5',
        )}
        aria-pressed={theme === 'light'}
      >
        <Sun size={compact ? 12 : 14} />
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium transition',
          theme === 'dark' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-600 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-white/5',
        )}
        aria-pressed={theme === 'dark'}
      >
        <Moon size={compact ? 12 : 14} />
        Dark
      </button>
    </div>
  )
}
