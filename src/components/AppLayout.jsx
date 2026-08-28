import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { pageVariants } from '@/lib/motion'
import { useLang } from '@/store/LangContext'

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { t } = useLang()
  const location = useLocation()

  return (
    <div className="min-h-dvh">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-primary/[0.04] blur-[110px]" />
        <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-vital/[0.04] blur-[110px]" />
      </div>

      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="lg:pl-[248px]">
        <Topbar onMenu={() => setMenuOpen(true)} />

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
          {/* key diganti tiap ganti route supaya subtree lama di-unmount dan
              animasi masuknya selalu jalan */}
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
          >
            <Outlet />
          </motion.div>
        </main>

        <footer className="border-t border-line px-4 py-6 text-center text-xs text-faint sm:px-6">
          <p>
            <span className="font-semibold text-muted">VitalStock</span> · {t('footer.tim')}
          </p>
          <p className="mt-1">{t('footer.mock')}</p>
        </footer>
      </div>
    </div>
  )
}
