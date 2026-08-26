import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { pageVariants } from '@/lib/motion'

/**
 * Persistent shell. Only the <Outlet/> swaps between routes, so the sidebar
 * pill and the topbar keep their state while the page crossfades.
 */
export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-dvh">
      {/* Ambient background wash — fixed so it never scrolls with content. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-primary/[0.07] blur-[100px]" />
        <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-vital/[0.07] blur-[100px]" />
      </div>

      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="lg:pl-[248px]">
        <Topbar onMenu={() => setMenuOpen(true)} />

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
          {/* Keyed remount rather than <AnimatePresence mode="wait">: with a
              presence wrapper here, an entering route intermittently gets
              painted with the outgoing route's exit variant and never runs its
              enter animation, leaving the page blank. Changing the key unmounts
              the old subtree outright, so `initial → animate` always plays. */}
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
            <span className="font-semibold text-muted">VitalStock</span> — Tim SIKATT · HealTech
            Front-End Code Challenge 2026
          </p>
          <p className="mt-1">Data pada demo ini menggunakan mock data sisi klien.</p>
        </footer>
      </div>
    </div>
  )
}
