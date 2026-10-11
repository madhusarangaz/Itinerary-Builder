import { useEffect, useState } from 'react'

export function useMissingAttention(token: number, onHandled?: () => void) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (!token) return
    setOn(true)
    const handle = window.setTimeout(() => {
      revealFirstMissing()
      onHandled?.()
    }, 80)
    return () => window.clearTimeout(handle)
  }, [token, onHandled])
  return on
}

export function revealFirstMissing(root?: ParentNode | null) {
  const scope = root ?? document
  const target = scope.querySelector<HTMLElement>('[data-missing="true"]')
  if (!target) return
  target.scrollIntoView({ block: 'center', behavior: 'smooth' })
  const focusable = target.matches('input, textarea, button, select')
    ? target
    : target.querySelector<HTMLElement>('input, textarea, button, select')
  focusable?.focus()
}
