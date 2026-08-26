import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as api from '@/lib/api'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

const SESSION_KEY = 'vitalstock:session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(true)

  // restore session biar refresh tidak balik ke /login
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      if (raw) setUser(JSON.parse(raw))
    } catch {
      // abaikan
    }
    setBooting(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const u = await api.login(email, password)
    setUser(u)
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(u))
    } catch {
      // abaikan
    }
    return u
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    try {
      sessionStorage.removeItem(SESSION_KEY)
    } catch {
      /* non-fatal */
    }
  }, [])

  const value = useMemo(() => ({ user, booting, login, logout }), [user, booting, login, logout])
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
