export type ThemePreference = 'light' | 'dark'

const KEY = 'travelbuilding.theme'

export function readTheme(): ThemePreference {
  try {
    const value = localStorage.getItem(KEY)
    if (value === 'light' || value === 'dark') return value
  } catch {
    /* ignore */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function writeTheme(preference: ThemePreference) {
  try {
    localStorage.setItem(KEY, preference)
  } catch {
    /* ignore */
  }
}

export function applyTheme(preference: ThemePreference) {
  const dark = preference === 'dark'
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
}
