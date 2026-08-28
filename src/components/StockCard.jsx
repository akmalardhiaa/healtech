import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDownLeft, ArrowUpRight, Download, TrendingDown, X } from 'lucide-react'
import clsx from 'clsx'

import Portal from './Portal'
import StatusBadge from './StatusBadge'
import { getMovements } from '@/lib/api'
import { useLang } from '@/store/LangContext'
import { downloadCSV, stamp, toCSV } from '@/lib/export'
import {
  dateID,
  daysToStockout,
  daysUntil,
  levelLabel,
  num,
  overallLevel,
  rupiah,
  stockoutDate,
  stockoutLevel,
} from '@/lib/format'

const kolomCSV = (t, td, locale) => [
  { label: t('csv.tanggal'), value: (r) => dateID(r.at, locale) },
  { label: t('csv.jenisTrx'), value: (r) => (r.type === 'masuk' ? t('csv.masuk') : t('csv.keluar')) },
  { label: t('csv.jumlahTrx'), value: (r) => r.qty },
  { label: t('csv.saldo'), value: (r) => r.saldo },
  { label: t('csv.referensi'), value: (r) => r.ref },
  { label: t('csv.pihak'), value: (r) => td('lokasi', r.pihak) },
]

export default function StockCard({ med, onClose }) {
  const [rows, setRows] = useState(null)
  const { t, td, locale } = useLang()

  useEffect(() => {
    let alive = true
    getMovements(med.id).then((d) => alive && setRows(d))
    return () => {
      alive = false
    }
  }, [med.id])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const habis = daysToStockout(med)
  const habisLevel = stockoutLevel(med)
  const tglHabis = stockoutDate(med)

  return (
    <Portal>
    <motion.div
      className="fixed inset-0 z-[80] flex justify-end bg-black/45 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.aside
        onClick={(e) => e.stopPropagation()}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        className="flex h-full w-full max-w-lg flex-col border-l border-line bg-surface"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line p-5">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{t('kartu.label')}</p>
            <h3 className="mt-1 truncate text-lg font-extrabold tracking-tight">{med.name}</h3>
            <p className="mt-0.5 text-xs text-muted">
              {med.batch} · {med.supplier} · {td('lokasi', med.location)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-faint hover:bg-elevated hover:text-ink"
            aria-label={t('umum.tutup')}
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 border-b border-line p-5">
          <div className="rounded-xl bg-elevated p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">
              {t('kartu.stokSaatIni')}
            </p>
            <p className="mt-1 text-xl font-extrabold tnum">
              {num(med.stock, locale)}{' '}
              <span className="text-xs font-bold text-muted">{td('satuan', med.unit)}</span>
            </p>
            <p className="mt-0.5 text-[10px] text-faint">{t('kartu.minimum')} {num(med.minStock, locale)}</p>
          </div>

          <div className="rounded-xl bg-elevated p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">
              {t('kartu.nilai')}
            </p>
            <p className="mt-1 text-xl font-extrabold tnum">{rupiah(med.stock * med.price, locale)}</p>
            <p className="mt-0.5 text-[10px] text-faint">{rupiah(med.price, locale)} / {td('satuan', med.unit)}</p>
          </div>

          <div
            className={clsx(
              'col-span-2 rounded-xl p-3.5 ring-1 ring-inset',
              habisLevel === 'critical'
                ? 'bg-danger-soft ring-danger/25'
                : habisLevel === 'warning'
                  ? 'bg-warn-soft ring-warn/25'
                  : 'bg-vital-soft ring-vital/25'
            )}
          >
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
              <TrendingDown size={12} strokeWidth={2.6} />
              {t('kartu.prediksiJudul')}
            </p>
            {habis === null ? (
              <p className="mt-1 text-sm font-bold">{t('kartu.tanpaPemakaian')}</p>
            ) : (
              <>
                <p className="mt-1 text-lg font-extrabold tnum">
                  {t('kartu.prediksiIsi', { n: habis })}
                  <span className="ml-2 text-xs font-semibold opacity-70">{dateID(tglHabis, locale)}</span>
                </p>
                <p className="mt-0.5 text-[11px] opacity-80">
                  {t('kartu.prediksiDasar', { n: med.dailyUsage, satuan: td('satuan', med.unit) })}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
          <div className="flex items-center gap-2">
            <StatusBadge level={overallLevel(med)} />
            <span className="text-[11px] text-faint">
              {t('kartu.kedaluwarsaDalam', { n: daysUntil(med.expiry) })}
            </span>
          </div>
          <button
            onClick={() =>
              downloadCSV(
                `kartu-stok-${med.batch}-${stamp()}.csv`,
                toCSV(kolomCSV(t, td, locale), rows ?? [])
              )
            }
            disabled={!rows?.length}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[11px] font-bold text-muted transition-colors hover:border-primary/40 hover:text-primary-ink disabled:opacity-40"
          >
            <Download size={13} strokeWidth={2.4} />
            CSV
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <p className="mb-3 text-xs font-bold">{t('kartu.riwayat')}</p>

          {!rows && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton h-14 rounded-xl" />
              ))}
            </div>
          )}

          {rows && (
            <ol className="relative space-y-3">
              <span aria-hidden className="absolute bottom-3 left-[15px] top-3 w-px bg-line" />
              <AnimatePresence initial={false}>
                {rows.map((r, i) => {
                  const masuk = r.type === 'masuk'
                  return (
                    <motion.li
                      key={r.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.04, 0.3) }}
                      className="relative flex gap-3"
                    >
                      <span
                        className={clsx(
                          'relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full ring-4 ring-surface',
                          masuk ? 'bg-vital-soft text-vital-ink' : 'bg-warn-soft text-warn-ink'
                        )}
                      >
                        {masuk ? (
                          <ArrowDownLeft size={14} strokeWidth={2.6} />
                        ) : (
                          <ArrowUpRight size={14} strokeWidth={2.6} />
                        )}
                      </span>

                      <div className="min-w-0 flex-1 rounded-xl border border-line bg-elevated px-3.5 py-2.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-xs font-bold">
                            {masuk ? '+' : '−'}
                            {num(r.qty, locale)} {td('satuan', med.unit)}
                          </p>
                          <p className="shrink-0 text-[10px] text-faint">{dateID(r.at, locale)}</p>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-muted">
                          {r.ref} · {td('lokasi', r.pihak)}
                        </p>
                        <p className="mt-1 text-[10px] text-faint tnum">
                          {t('kartu.saldoSetelah')}: {num(r.saldo, locale)} {td('satuan', med.unit)}
                        </p>
                      </div>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ol>
          )}

          {rows?.length === 0 && (
            <p className="py-10 text-center text-xs text-muted">{t('kartu.kosong')}</p>
          )}
        </div>
      </motion.aside>
    </motion.div>
    </Portal>
  )
}
