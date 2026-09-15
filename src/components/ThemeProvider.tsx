import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { applyTheme, readTheme, writeTheme, type ThemePreference } from '../lib/theme'

type ThemeCtx = {
  theme: ThemePreference
  setTheme: (theme: ThemePreference) => void
}

const ThemeContext = createContext<ThemeCtx | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    const next = readTheme()
    applyTheme(next)
    return next
  })

  useEffect(() => {
    applyTheme(theme)
    writeTheme(theme)
  }, [theme])

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next)
  }, [])

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
