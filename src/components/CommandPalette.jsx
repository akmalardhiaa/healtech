import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ClipboardCheck, CornerDownLeft, Package, Search, Truck } from 'lucide-react'
import clsx from 'clsx'

import Portal from './Portal'
import { getDashboard } from '@/lib/api'
import { useLang } from '@/store/LangContext'
import { daysUntil, num, overallLevel } from '@/lib/format'
import { modalVariants } from '@/lib/motion'

const groupMeta = {
  obat: { label: 'Obat', icon: Package, to: '/stok' },
  kirim: { label: 'Pengiriman', icon: Truck, to: '/distribusi' },
  minta: { label: 'Permintaan', icon: ClipboardCheck, to: '/approval' },
}

const tone = {
  critical: 'text-danger-ink',
  warning: 'text-warn-ink',
  safe: 'text-muted',
}

export default function CommandPalette({ open, onClose }) {
  const [q, setQ] = useState('')
  const [data, setData] = useState(null)
  const [aktif, setAktif] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const { t, td, locale } = useLang()

  // data dimuat sekali saat palette pertama dibuka
  useEffect(() => {
    if (!open || data) return
    getDashboard().then(setData)
  }, [open, data])

  useEffect(() => {
    if (open) {
      setQ('')
      setAktif(0)
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [open])

  const hasil = useMemo(() => {
    if (!data) return []
    const kata = q.trim().toLowerCase()

    const obat = data.medicines
      .filter((m) =>
        !kata
          ? overallLevel(m) === 'critical'
          : `${m.name} ${m.batch} ${m.category} ${m.location}`.toLowerCase().includes(kata)
      )
      .slice(0, 6)
      .map((m) => ({
        grup: 'obat',
        id: m.id,
        judul: m.name,
        info: `${m.batch} · ${num(m.stock, locale)} ${td('satuan', m.unit)}`,
        kanan: `${daysUntil(m.expiry)} ${t('umum.hari')}`,
        level: overallLevel(m),
        cari: m.name,
      }))

    const kirim = (
      kata
        ? data.shipments.filter((s) =>
            `${s.id} ${s.destination} ${s.driver}`.toLowerCase().includes(kata)
          )
        : []
    )
      .slice(0, 4)
      .map((s) => ({
        grup: 'kirim',
        id: s.id,
        judul: s.id,
        info: `${td('lokasi', s.origin)} → ${td('lokasi', s.destination)}`,
        kanan: (locale.startsWith('en') && s.etaEn) || s.eta,
        level: 'safe',
      }))

    const minta = (
      kata
        ? data.requests.filter((r) =>
            `${r.id} ${r.medicine} ${r.unitName} ${r.requester}`.toLowerCase().includes(kata)
          )
        : data.requests.filter((r) => r.status === 'pending')
    )
      .slice(0, 4)
      .map((r) => ({
        grup: 'minta',
        id: r.id,
        judul: `${r.id} · ${r.medicine}`,
        info: `${num(r.qty, locale)} ${td('satuan', r.unit)} · ${td('lokasi', r.unitName)}`,
        kanan: r.status === 'pending' ? t('umum.menunggu') : '',
        level: r.priority === 'Urgent' ? 'critical' : 'safe',
      }))

    return [...obat, ...kirim, ...minta]
  }, [data, q])

  useEffect(() => setAktif(0), [q])

  function pilih(item) {
    if (!item) return
    const to = groupMeta[item.grup].to
    // untuk obat, kata kunci dibawa supaya tabelnya langsung tersaring
    navigate(item.cari ? `${to}?q=${encodeURIComponent(item.cari)}` : to)
    onClose()
  }

  function onKey(e) {
    if (e.key === 'Escape') return onClose()
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setAktif((i) => {
        const next = e.key === 'ArrowDown' ? i + 1 : i - 1
        const n = hasil.length
        return n ? (next + n) % n : 0
      })
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      pilih(hasil[aktif])
    }
  }

  // jaga baris terpilih tetap kelihatan saat digulir pakai panah
  useEffect(() => {
    listRef.current?.querySelector('[data-aktif="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [aktif])

  return (
    <Portal>
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search size={17} className="shrink-0 text-faint" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKey}
                placeholder={t('palette.placeholder')}
                className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-faint"
              />
              <kbd className="hidden shrink-0 rounded border border-line bg-elevated px-1.5 py-0.5 text-[10px] font-semibold text-faint sm:block">
                Esc
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
              {!data && <p className="px-3 py-8 text-center text-xs text-faint">{t('umum.memuat')}</p>}

              {data && hasil.length === 0 && (
                <p className="px-3 py-8 text-center text-xs text-muted">
                  {t('palette.kosong', { q })}
                </p>
              )}

              {hasil.map((item, i) => {
                const meta = groupMeta[item.grup]
                const Icon = meta.icon
                const dipilih = i === aktif
                return (
                  <button
                    key={`${item.grup}-${item.id}`}
                    data-aktif={dipilih}
                    onMouseEnter={() => setAktif(i)}
                    onClick={() => pilih(item)}
                    className={clsx(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                      dipilih ? 'bg-primary-soft' : 'hover:bg-elevated'
                    )}
                  >
                    <span
                      className={clsx(
                        'grid h-8 w-8 shrink-0 place-items-center rounded-lg',
                        dipilih ? 'bg-primary text-white' : 'bg-elevated text-muted'
                      )}
                    >
                      <Icon size={15} strokeWidth={2.3} />
                    </span>

                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate text-xs font-bold">{item.judul}</span>
                      <span className="block truncate text-[11px] text-faint">{item.info}</span>
                    </span>

                    <span className={clsx('shrink-0 text-[11px] font-semibold tnum', tone[item.level])}>
                      {item.kanan}
                    </span>

                    {dipilih && (
                      <CornerDownLeft size={13} className="shrink-0 text-primary-ink" strokeWidth={2.4} />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-4 border-t border-line bg-elevated/60 px-4 py-2.5 text-[10px] text-faint">
              <span>↑↓ {t('palette.pilih')}</span>
              <span>↵ {t('palette.buka')}</span>
              <span className="ml-auto">
                {q ? t('palette.hasil', { n: hasil.length }) : t('palette.bawaan')}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </Portal>
  )
}
