import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import clsx from 'clsx'

const ToastCtx = createContext(null)
export const useToast = () => useContext(ToastCtx)

const tones = {
  success: { icon: CheckCircle2, cls: 'text-vital-ink bg-vital-soft border-vital/30', bar: 'bg-vital' },
  error: { icon: AlertTriangle, cls: 'text-danger-ink bg-danger-soft border-danger/30', bar: 'bg-danger' },
  info: { icon: Info, cls: 'text-primary-ink bg-primary-soft border-primary/30', bar: 'bg-primary' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const seq = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const push = useCallback(
    (message, tone = 'info', ttl = 3800) => {
      const id = ++seq.current
      setToasts((t) => [...t, { id, message, tone }])
      setTimeout(() => dismiss(id), ttl)
      return id
    },
    [dismiss]
  )

  const api = useMemo(
    () => ({
      push,
      success: (m) => push(m, 'success'),
      error: (m) => push(m, 'error'),
      info: (m) => push(m, 'info'),
      dismiss,
    }),
    [push, dismiss]
  )

  return (
    <ToastCtx.Provider value={api}>
      {children}

      <div className="pointer-events-none fixed bottom-5 right-5 z-[80] flex w-[min(92vw,22rem)] flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const tone = tones[t.tone] ?? tones.info
            const Icon = tone.icon
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.92, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 340, damping: 26 }}
                className={clsx(
                  'pointer-events-auto relative overflow-hidden rounded-xl border px-4 py-3 pr-9',
                  'shadow-lift backdrop-blur',
                  tone.cls
                )}
              >
                <div className="flex items-start gap-2.5">
                  <Icon size={16} strokeWidth={2.5} className="mt-0.5 shrink-0" />
                  <p className="text-sm font-medium leading-snug">{t.message}</p>
                </div>

                <button
                  onClick={() => dismiss(t.id)}
                  className="absolute right-2 top-2.5 rounded-md p-1 opacity-60 transition hover:opacity-100"
                  aria-label="Tutup notifikasi"
                >
                  <X size={13} strokeWidth={2.6} />
                </button>

                <motion.div
                  className={clsx('absolute bottom-0 left-0 h-0.5', tone.bar)}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 3.8, ease: 'linear' }}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  )
}
