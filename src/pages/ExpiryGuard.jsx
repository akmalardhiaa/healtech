import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpDown,
  Boxes,
  Filter,
  Download,
  PackagePlus,
  Search,
  TrendingDown,
  ShieldAlert,
  Timer,
  X,
} from 'lucide-react'
import clsx from 'clsx'

import PageHeader from '@/components/PageHeader'
import Portal from '@/components/Portal'
import StatusBadge from '@/components/StatusBadge'
import { SkeletonTable } from '@/components/Skeleton'
import StockCard from '@/components/StockCard'
import { downloadCSV, stamp, toCSV } from '@/lib/export'
import { getMedicines, restock } from '@/lib/api'
import {
  dateID,
  daysToStockout,
  daysUntil,
  expiryLevel,
  levelLabel,
  num,
  overallLevel,
  rupiah,
  stockLevel,
  stockoutLevel,
} from '@/lib/format'
import { itemVariants, listVariants, modalVariants, revealOnScroll, rowVariants } from '@/lib/motion'
import { useToast } from '@/components/Toast'
import { useLang } from '@/store/LangContext'

const filters = [
  { key: 'all', tk: 'umum.semua', icon: Boxes },
  { key: 'critical', tk: 'umum.kritis', icon: ShieldAlert },
  { key: 'warning', tk: 'umum.perhatian', icon: Timer },
  { key: 'safe', tk: 'umum.aman', icon: Filter },
]

const sorts = [
  { key: 'expiry', tk: 'stok.urutExpiry' },
  { key: 'stock', tk: 'stok.urutStok' },
  { key: 'name', tk: 'stok.urutNama' },
  { key: 'value', tk: 'stok.urutNilai' },
  { key: 'habis', tk: 'stok.urutHabis' },
]

function StockMeter({ stock, minStock }) {
  const { t, locale } = useLang()
  const level = stockLevel(stock, minStock)
  const pct = Math.min(100, (stock / Math.max(1, minStock * 2)) * 100)
  const tone =
    level === 'critical' ? 'bg-danger' : level === 'warning' ? 'bg-warn' : 'bg-vital'

  return (
    <div className="w-full min-w-[92px]">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-bold tnum">{num(stock, locale)}</span>
        <span className="text-[10px] text-faint tnum">{t('stok.min')} {num(minStock, locale)}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line/70">
        <motion.div
          className={clsx('h-full rounded-full', tone)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}

function ExpiryCell({ iso }) {
  const { t, locale } = useLang()
  const d = daysUntil(iso)
  const level = expiryLevel(iso)
  const tone =
    level === 'critical' ? 'text-danger-ink' : level === 'warning' ? 'text-warn-ink' : 'text-muted'

  return (
    <div className="leading-tight">
      <p className={clsx('whitespace-nowrap text-xs font-extrabold tnum', tone)}>{d} {t('umum.hari')}</p>
      <p className="text-[10px] text-faint">{dateID(iso, locale)}</p>
    </div>
  )
}

function StockoutCell({ med }) {
  const { t } = useLang()
  const d = daysToStockout(med)
  const level = stockoutLevel(med)
  if (d === null) return <span className="text-[11px] text-faint">—</span>

  const tone =
    level === 'critical' ? 'text-danger-ink' : level === 'warning' ? 'text-warn-ink' : 'text-muted'

  return (
    <div className="leading-tight">
      <p className={clsx('whitespace-nowrap text-xs font-extrabold tnum', tone)}>± {d} {t('umum.hari')}</p>
      <p className="text-[10px] text-faint">{med.dailyUsage}{t('stok.perHari')}</p>
    </div>
  )
}

function RestockModal({ med, onClose, onDone }) {
  const [qty, setQty] = useState(Math.max(100, med.minStock))
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const { t, td, locale } = useLang()

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const updated = await restock(med.id, Number(qty))
      toast.success(t('stok.berhasilTambah', { nama: med.name, qty: num(qty, locale), satuan: td('satuan', med.unit) }))
      onDone(updated)
      onClose()
    } catch (err) {
      toast.error(err.message)
      setBusy(false)
    }
  }

  return (
    <Portal>
    <motion.div
      className="fixed inset-0 z-[70] grid place-items-center bg-black/55 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        variants={modalVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-lift"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold tracking-tight">{t('stok.tambahJudul')}</h3>
            <p className="mt-0.5 text-xs text-muted">{med.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-faint hover:bg-elevated hover:text-ink"
            aria-label={t('umum.tutup')}
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        <div className="mt-5 rounded-xl bg-elevated p-3.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">{t('stok.stokSaatIni')}</span>
            <span className="font-bold tnum">
              {num(med.stock, locale)} {td('satuan', med.unit)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs">
            <span className="text-muted">{t('stok.setelahTambah')}</span>
            <motion.span
              key={qty}
              initial={{ scale: 1.12, color: 'hsl(var(--vital))' }}
              animate={{ scale: 1, color: 'hsl(var(--ink))' }}
              className="font-extrabold tnum"
            >
              {num(med.stock + Number(qty || 0), locale)} {td('satuan', med.unit)}
            </motion.span>
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="qty" className="label">
            {t('stok.jumlahTambah')}
          </label>
          <input
            id="qty"
            type="number"
            min={1}
            required
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="input tnum"
            autoFocus
          />
          <div className="mt-2 flex gap-1.5">
            {[100, 500, 1000, 2500].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setQty(v)}
                className="rounded-lg border border-line bg-elevated px-2.5 py-1 text-[11px] font-semibold text-muted transition-colors hover:border-primary/40 hover:text-primary-ink"
              >
                +{num(v, locale)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            {t('umum.batal')}
          </button>
          <button type="submit" disabled={busy} className="btn-primary flex-1">
            {busy ? t('umum.menyimpan') : t('umum.simpan')}
          </button>
        </div>
      </motion.form>
    </motion.div>
    </Portal>
  )
}

export default function ExpiryGuard() {
  const [meds, setMeds] = useState(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('expiry')
  const [target, setTarget] = useState(null)
  const [kartu, setKartu] = useState(null)
  const toast = useToast()
  const { t, td, locale } = useLang()
  const [params, setParams] = useSearchParams()
  const scope = useRef(null)

  // command palette mengirim kata kunci lewat ?q=
  useEffect(() => {
    const dari = params.get('q')
    if (dari) {
      setQuery(dari)
      params.delete('q')
      setParams(params, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let alive = true
    getMedicines().then((d) => alive && setMeds(d))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!meds) return
    const ctx = revealOnScroll(scope)
    return () => ctx?.revert()
  }, [meds])

  const counts = useMemo(() => {
    if (!meds) return {}
    return meds.reduce(
      (acc, m) => {
        acc.all++
        acc[overallLevel(m)]++
        return acc
      },
      { all: 0, safe: 0, warning: 0, critical: 0 }
    )
  }, [meds])

  const rows = useMemo(() => {
    if (!meds) return []
    const q = query.trim().toLowerCase()

    let out = meds.filter((m) => {
      if (filter !== 'all' && overallLevel(m) !== filter) return false
      if (!q) return true
      return (
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.batch.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q)
      )
    })

    const by = {
      expiry: (a, b) => daysUntil(a.expiry) - daysUntil(b.expiry),
      stock: (a, b) => a.stock / a.minStock - b.stock / b.minStock,
      name: (a, b) => a.name.localeCompare(b.name),
      value: (a, b) => b.stock * b.price - a.stock * a.price,
      habis: (a, b) => (daysToStockout(a) ?? 1e9) - (daysToStockout(b) ?? 1e9),
    }
    return out.sort(by[sort])
  }, [meds, query, filter, sort])

  function eksporCSV() {
    const kolom = [
      { label: t('csv.nama'), value: (m) => m.name },
      { label: t('csv.batch'), value: (m) => m.batch },
      { label: t('csv.kategori'), value: (m) => td('kategori', m.category) },
      { label: t('csv.satuan'), value: (m) => td('satuan', m.unit) },
      { label: t('csv.stok'), value: (m) => m.stock },
      { label: t('csv.stokMin'), value: (m) => m.minStock },
      { label: t('csv.pakaiHari'), value: (m) => m.dailyUsage },
      { label: t('csv.prediksiHari'), value: (m) => daysToStockout(m) ?? '' },
      { label: t('csv.sisaUmurHari'), value: (m) => daysUntil(m.expiry) },
      { label: t('csv.kedaluwarsa'), value: (m) => dateID(m.expiry, locale) },
      { label: t('csv.lokasi'), value: (m) => td('lokasi', m.location) },
      { label: t('csv.supplier'), value: (m) => m.supplier },
      { label: t('csv.harga'), value: (m) => m.price },
      { label: t('csv.nilai'), value: (m) => m.stock * m.price },
      { label: t('csv.status'), value: (m) => t(`umum.${{ safe: 'aman', warning: 'perhatian', critical: 'kritis' }[overallLevel(m)]}`) },
    ]
    downloadCSV(`stok-obat-${stamp()}.csv`, toCSV(kolom, rows))
    toast.success(t('stok.berhasilEkspor', { n: rows.length }))
  }

  function applyRestock(updated) {
    setMeds((prev) => prev.map((m) => (m.id === updated.id ? { ...m, stock: updated.stock } : m)))
  }

  if (!meds) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-9 w-56 rounded-lg" />
        <SkeletonTable rows={8} />
      </div>
    )
  }

  return (
    <div ref={scope} className="space-y-6">
      <PageHeader
        eyebrow="ExpiryGuard"
        title={t('stok.judul')}
        description={t('stok.deskripsi')}
      />

      <motion.div
        variants={listVariants(0.05)}
        initial="initial"
        animate="animate"
        className="card flex flex-col gap-4 p-4 lg:flex-row lg:items-center"
      >
        <motion.div variants={itemVariants} className="relative flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('stok.cariPlaceholder')}
            className="input pl-10"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-faint hover:text-ink"
              aria-label={t('umum.tutup')}
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          )}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex gap-1 overflow-x-auto rounded-xl bg-elevated p-1 no-scrollbar"
        >
          {filters.map((f) => {
            const active = filter === f.key
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={clsx(
                  'relative flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5',
                  'text-xs font-semibold transition-colors duration-200',
                  active ? 'text-ink' : 'text-muted hover:text-ink'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 rounded-lg bg-surface shadow-card"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <f.icon size={13} strokeWidth={2.4} className="relative" />
                <span className="relative">{t(f.tk)}</span>
                <span
                  className={clsx(
                    'relative rounded-full px-1.5 py-0.5 text-[10px] font-bold tnum',
                    active ? 'bg-primary-soft text-primary-ink' : 'bg-surface text-faint'
                  )}
                >
                  {counts[f.key] ?? 0}
                </span>
              </button>
            )
          })}
        </motion.div>

        <motion.div variants={itemVariants} className="relative">
          <ArrowUpDown
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input cursor-pointer appearance-none py-2 pl-9 pr-8 text-xs font-semibold"
            aria-label={t('stok.diurutkan')}
          >
            {sorts.map((s) => (
              <option key={s.key} value={s.key}>
                {t(s.tk)}
              </option>
            ))}
          </select>
        </motion.div>
      </motion.div>

      <div className="reveal card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h3 className="text-sm font-bold tracking-tight">
            {t('stok.daftar')}
            <span className="ml-2 rounded-full bg-elevated px-2 py-0.5 text-[11px] font-bold text-muted tnum">
              {rows.length}
            </span>
          </h3>
          <div className="flex items-center gap-3">
            <p className="hidden text-[11px] text-faint sm:block">
              {t('stok.diurutkan')}: {t(sorts.find((s) => s.key === sort)?.tk)}
            </p>
            <motion.button
              onClick={eksporCSV}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={!rows.length}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[11px] font-bold text-muted transition-colors hover:border-primary/40 hover:text-primary-ink disabled:opacity-40"
            >
              <Download size={13} strokeWidth={2.4} />
              {t('umum.ekspor')}
            </motion.button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-elevated/60">
                {['stok.kolomObat','stok.kolomKategori','stok.kolomStok','stok.kolomUmur','stok.kolomHabis','stok.kolomLokasi','stok.kolomNilai','stok.kolomStatus',''].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-faint"
                    >
                      {h ? t(h) : ''}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <motion.tbody
              variants={listVariants(0.028)}
              initial="initial"
              animate="animate"
              className="divide-y divide-line"
            >
              <AnimatePresence mode="popLayout">
                {rows.map((m) => {
                  const level = overallLevel(m)
                  return (
                    <motion.tr
                      key={m.id}
                      layout
                      variants={rowVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      onClick={() => setKartu(m)}
                      className="group cursor-pointer transition-colors hover:bg-elevated/70"
                      title="Lihat kartu stok"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            className={clsx(
                              'h-9 w-1 shrink-0 rounded-full transition-all duration-300 group-hover:h-10',
                              level === 'critical'
                                ? 'bg-danger'
                                : level === 'warning'
                                  ? 'bg-warn'
                                  : 'bg-vital'
                            )}
                          />
                          <div className="min-w-0 leading-tight">
                            <p className="truncate text-xs font-bold">{m.name}</p>
                            <p className="truncate text-[10px] text-faint">
                              {m.batch} · {m.supplier}
                            </p>

                            {/* di layar kecil kolom kanan harus digeser dulu,
                                jadi dua angka terpenting diringkas di sini */}
                            <p className="mt-1 flex flex-wrap gap-x-2 text-[10px] font-semibold lg:hidden">
                              <span
                                className={clsx(
                                  expiryLevel(m.expiry) === 'critical'
                                    ? 'text-danger-ink'
                                    : expiryLevel(m.expiry) === 'warning'
                                      ? 'text-warn-ink'
                                      : 'text-muted'
                                )}
                              >
                                {t('stok.exp')} {daysUntil(m.expiry)} {t('umum.hari')}
                              </span>
                              {daysToStockout(m) !== null && (
                                <span
                                  className={clsx(
                                    stockoutLevel(m) === 'critical'
                                      ? 'text-danger-ink'
                                      : stockoutLevel(m) === 'warning'
                                        ? 'text-warn-ink'
                                        : 'text-muted'
                                  )}
                                >
                                  {t('stok.habisSingkat')} ±{daysToStockout(m)} {t('umum.hari')}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="rounded-md bg-elevated px-2 py-1 text-[10px] font-semibold text-muted">
                          {td('kategori', m.category)}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <StockMeter stock={m.stock} minStock={m.minStock} />
                      </td>

                      <td className="px-5 py-3.5">
                        <ExpiryCell iso={m.expiry} />
                      </td>

                      <td className="px-5 py-3.5">
                        <StockoutCell med={m} />
                      </td>

                      <td className="px-5 py-3.5 text-[11px] text-muted">{td('lokasi', m.location)}</td>

                      <td className="px-5 py-3.5 text-[11px] font-semibold tnum text-muted">
                        {rupiah(m.stock * m.price, locale)}
                      </td>

                      <td className="px-5 py-3.5">
                        <StatusBadge level={level} />
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation()
                            setTarget(m)
                          }}
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.94 }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[11px] font-bold text-muted opacity-0 transition-all duration-200 hover:border-primary/40 hover:text-primary-ink focus-visible:opacity-100 group-hover:opacity-100"
                        >
                          <PackagePlus size={13} strokeWidth={2.4} />
                          {t('stok.restock')}
                        </motion.button>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid place-items-center gap-2 px-5 py-16 text-center"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-elevated text-faint">
              <Search size={20} />
            </div>
            <p className="text-sm font-bold">{t('stok.kosongJudul')}</p>
            <p className="max-w-xs text-xs text-muted">
              {t('stok.kosongIsi')}
            </p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {target && (
          <RestockModal med={target} onClose={() => setTarget(null)} onDone={applyRestock} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {kartu && (
          <StockCard
            med={meds.find((m) => m.id === kartu.id) ?? kartu}
            onClose={() => setKartu(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
