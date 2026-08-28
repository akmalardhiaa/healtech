import { useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import {
  Activity,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  PackageSearch,
  Truck,
  X,
} from 'lucide-react'
import { gsap } from '@/lib/motion'
import { useAuth } from '@/store/AuthContext'
import { useLang } from '@/store/LangContext'

// label produk tidak diterjemahkan, keterangannya iya
export const navItems = [
  { to: '/dashboard', label: 'StockPulse', hint: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/stok', label: 'ExpiryGuard', hint: 'nav.stok', icon: PackageSearch },
  { to: '/distribusi', label: 'DistribusiTrack', hint: 'nav.distribusi', icon: Truck },
  { to: '/approval', label: 'ApprovalFlow', hint: 'nav.approval', icon: ClipboardCheck },
]

function NavRow({ item, onNavigate }) {
  const Icon = item.icon
  const { t } = useLang()
  return (
    <NavLink to={item.to} onClick={onNavigate} className="block">
      {({ isActive }) => (
        <div
          className={clsx(
            'nav-row group relative flex items-center gap-3 rounded-xl px-3 py-2.5',
            'transition-colors duration-200',
            isActive ? 'text-primary-ink' : 'text-muted hover:text-ink'
          )}
        >
          {isActive && (
            <motion.div
              layoutId="nav-pill"
              className="absolute inset-0 rounded-xl bg-primary-soft ring-1 ring-inset ring-primary/25"
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            />
          )}

          <span
            className={clsx(
              'relative grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-all duration-200',
              isActive
                ? 'bg-primary text-white shadow-[0_3px_10px_-5px_hsl(var(--primary)/0.5)]'
                : 'bg-elevated text-muted group-hover:text-primary'
            )}
          >
            <Icon size={16} strokeWidth={2.3} />
          </span>

          <span className="relative min-w-0">
            <span className="block truncate text-sm font-semibold leading-tight">{item.label}</span>
            <span className="block truncate text-[11px] leading-tight text-faint">{t(item.hint)}</span>
          </span>

          {isActive && (
            <motion.span
              layoutId="nav-dot"
              className="relative ml-auto h-1.5 w-1.5 rounded-full bg-primary"
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            />
          )}
        </div>
      )}
    </NavLink>
  )
}

function SidebarBody({ onNavigate }) {
  const { user, logout } = useAuth()
  const { t, td } = useLang()
  const scope = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.nav-row', {
        opacity: 0,
        x: -18,
        duration: 0.5,
        stagger: 0.07,
        delay: 0.15,
        ease: 'power3.out',
      })
    }, scope)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={scope} className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-2.5 px-1 pt-1">
        <motion.span
          className="relative grid h-9 w-9 place-items-center rounded-xl bg-primary text-white shadow-[0_4px_12px_-6px_hsl(var(--primary)/0.55)]"
          whileHover={{ rotate: -8, scale: 1.06 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        >
          <Activity size={18} strokeWidth={2.6} />
        </motion.span>
        <div className="leading-tight">
          <p className="text-[15px] font-extrabold tracking-tight">VitalStock</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
            {t('brand.tagline')}
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavRow key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="relative mt-auto overflow-hidden rounded-2xl border border-line bg-elevated p-3.5">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-vital/20 blur-2xl"
        />
        <div className="relative flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-vital opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-vital" />
          </span>
          <p className="text-[11px] font-bold uppercase tracking-wider text-vital-ink">
            {t('sidebar.sinkron')}
          </p>
        </div>
        <p className="relative mt-1.5 text-[11px] leading-relaxed text-muted">
          {t('sidebar.sinkronIsi')}
        </p>
      </div>

      <div className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface p-2.5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary-ink">
          {user?.initials}
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-xs font-bold">{user?.name}</p>
          <p className="truncate text-[10px] text-faint">{td('peran', user?.role)}</p>
        </div>
        <motion.button
          onClick={logout}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-danger-soft hover:text-danger-ink"
          aria-label={t('umum.keluar')}
          title={t('umum.keluar')}
        >
          <LogOut size={15} strokeWidth={2.3} />
        </motion.button>
      </div>
    </div>
  )
}

export default function Sidebar({ open, onClose }) {
  const location = useLocation()

  // tutup drawer tiap pindah halaman
  useEffect(() => {
    onClose?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-line bg-surface lg:block">
        <SidebarBody />
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[264px] border-r border-line bg-surface lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            >
              <button
                onClick={onClose}
                className="absolute right-3 top-4 z-10 grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-elevated"
                aria-label={t('topbar.tutupMenu')}
              >
                <X size={16} strokeWidth={2.5} />
              </button>
              <SidebarBody onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
