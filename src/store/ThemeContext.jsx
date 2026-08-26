import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const ThemeCtx = createContext(null)
export const useTheme = () => useContext(ThemeCtx)

const KEY = 'vitalstock:theme'

export function ThemeProvider({ children }) {
  // The inline script in index.html has already set the class; read it back so
  // React's first render agrees with the DOM.
  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : true
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try {
      localStorage.setItem(KEY, dark ? 'dark' : 'light')
    } catch {
      /* non-fatal */
    }
  }, [dark])

  const toggle = useCallback(() => setDark((d) => !d), [])
  const value = useMemo(() => ({ dark, toggle }), [dark, toggle])

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}
