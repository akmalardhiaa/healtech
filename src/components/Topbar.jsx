import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { Bell, Menu, Moon, Search, Sun } from 'lucide-react'
import CommandPalette from './CommandPalette'
import clsx from 'clsx'
import { useTheme } from '@/store/ThemeContext'
import { useLang } from '@/store/LangContext'
import { navItems } from './Sidebar'
import { activityFeed } from '@/data/mockData'

const toneDot = {
  danger: 'bg-danger',
  warn: 'bg-warn',
  vital: 'bg-vital',
  primary: 'bg-primary',
}

function LangToggle() {
  const { lang, toggle, t } = useLang()
  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      className="grid h-9 min-w-9 place-items-center rounded-xl border border-line bg-surface px-2 text-[11px] font-bold uppercase tracking-wide text-muted transition-colors hover:text-ink"
      aria-label={t('topbar.bahasa')}
      title={`${t('topbar.bahasa')}: ${lang === 'id' ? 'Indonesia' : 'English'}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={lang}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {lang === 'id' ? 'ID' : 'EN'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

function ThemeToggle() {
  const { dark, toggle } = useTheme()
  const { t } = useLang()
  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl border border-line bg-surface text-muted transition-colors hover:text-ink"
      aria-label={dark ? t('topbar.modeTerang') : t('topbar.modeGelap')}
      title={dark ? t('topbar.modeTerang') : t('topbar.modeGelap')}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={dark ? 'moon' : 'sun'}
          initial={{ y: 16, opacity: 0, rotate: -60 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -16, opacity: 0, rotate: 60 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          className="absolute"
        >
          {dark ? <Moon size={16} strokeWidth={2.3} /> : <Sun size={16} strokeWidth={2.3} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

function NotificationBell() {
  const { t, lang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.9 }}
        className="relative grid h-9 w-9 place-items-center rounded-xl border border-line bg-surface text-muted transition-colors hover:text-ink"
        aria-label={t('topbar.notifikasi')}
      >
        <Bell size={16} strokeWidth={2.3} />
        <span className="absolute right-2 top-2 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="absolute right-0 z-50 mt-2 w-[min(88vw,20rem)] origin-top-right overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="text-sm font-bold">{t('topbar.aktivitasTerbaru')}</p>
              <span className="rounded-full bg-danger-soft px-2 py-0.5 text-[10px] font-bold text-danger-ink">
                {t('topbar.baru', { n: activityFeed.length })}
              </span>
            </div>

            <ul className="max-h-80 divide-y divide-line overflow-y-auto">
              {activityFeed.map((a, i) => (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.3 }}
                  className="flex gap-3 px-4 py-3 transition-colors hover:bg-elevated"
                >
                  <span
                    className={clsx(
                      'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                      toneDot[a.type] ?? 'bg-primary'
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-xs leading-snug text-ink">{lang === 'en' && a.textEn ? a.textEn : a.text}</p>
                    <p className="mt-0.5 text-[10px] text-faint">{a.time} {t('topbar.lalu')}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Topbar({ onMenu }) {
  const [cari, setCari] = useState(false)
  const { t } = useLang()
  const { pathname } = useLocation()

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCari((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  const current = navItems.find((n) => pathname.startsWith(n.to))

  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 30, restDelta: 0.001 })

  return (
    <header className="sticky top-0 z-30 border-b border-line glass">
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-primary via-vital to-primary"
        style={{ scaleX: progress }}
      />

      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          onClick={onMenu}
          className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-surface text-muted lg:hidden"
          aria-label={t('topbar.bukaMenu')}
        >
          <Menu size={16} strokeWidth={2.4} />
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight">{current?.label ?? 'VitalStock'}</p>
          <p className="hidden truncate text-[11px] text-faint sm:block">{current ? t(current.hint) : ''}</p>
        </div>

        <div className="ml-auto hidden items-center md:flex">
          <button
            onClick={() => setCari(true)}
            className="group flex w-64 items-center gap-2.5 rounded-xl border border-line bg-elevated px-3 py-2 text-left transition-colors hover:border-primary/40"
          >
            <Search size={15} className="shrink-0 text-faint transition-colors group-hover:text-primary" />
            <span className="flex-1 text-sm text-faint">{t('palette.tombol')}</span>
            <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-faint">
              Ctrl K
            </kbd>
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-3">
          <button
            onClick={() => setCari(true)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-surface text-muted transition-colors hover:text-ink md:hidden"
            aria-label={t('umum.cari')}
          >
            <Search size={16} strokeWidth={2.3} />
          </button>
          <NotificationBell />
          <LangToggle />
          <ThemeToggle />
        </div>
      </div>

      <CommandPalette open={cari} onClose={() => setCari(false)} />
    </header>
  )
}
