import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  ClipboardCheck,
  Clock,
  FileText,
  Hospital,
  Lock,
  ThumbsDown,
  ThumbsUp,
  User,
  X,
} from 'lucide-react'
import clsx from 'clsx'

import PageHeader from '@/components/PageHeader'
import Portal from '@/components/Portal'
import StatusBadge from '@/components/StatusBadge'
import { SkeletonTable } from '@/components/Skeleton'
import { decideRequest, getRequests } from '@/lib/api'
import { num } from '@/lib/format'
import { itemVariants, listVariants, modalVariants, revealOnScroll } from '@/lib/motion'
import { useToast } from '@/components/Toast'
import { useAuth } from '@/store/AuthContext'
import { useLang } from '@/store/LangContext'

const statusMeta = {
  pending: { level: 'warning', tk: 'umum.menunggu' },
  approved: { level: 'safe', tk: 'umum.disetujui' },
  rejected: { level: 'critical', tk: 'umum.ditolak' },
}

function DecisionModal({ req, decision, onClose, onConfirm }) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const { t, td, locale } = useLang()
  const approve = decision === 'approved'

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    await onConfirm(req.id, decision, note)
    onClose()
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
        className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-lift"
      >
        <div className="flex items-start gap-3">
          <span
            className={clsx(
              'grid h-11 w-11 shrink-0 place-items-center rounded-2xl',
              approve ? 'bg-vital-soft text-vital-ink' : 'bg-danger-soft text-danger-ink'
            )}
          >
            {approve ? <ThumbsUp size={20} strokeWidth={2.4} /> : <ThumbsDown size={20} strokeWidth={2.4} />}
          </span>
          <div>
            <h3 className="text-base font-extrabold tracking-tight">
              {approve ? t('approval.setujuiTanya') : t('approval.tolakTanya')}
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              {req.id} · {req.medicine}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-2 rounded-xl bg-elevated p-4 text-xs">
          {[
            [t('approval.jumlah'), `${num(req.qty, locale)} ${td('satuan', req.unit)}`],
            [t('approval.unitPemohon'), td('lokasi', req.unitName)],
            [t('approval.pemohon'), req.requester],
            [t('approval.prioritas'), req.priority === 'Urgent' ? t('umum.urgent') : t('umum.reguler')],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <span className="text-muted">{k}</span>
              <span className="text-right font-bold">{v}</span>
            </div>
          ))}
        </div>

        {approve && (
          <p className="mt-3 rounded-lg bg-primary-soft px-3 py-2 text-[11px] text-primary-ink">
            {t('approval.peringatanStok', { qty: num(req.qty, locale), satuan: td('satuan', req.unit) })}
          </p>
        )}

        <div className="mt-4">
          <label htmlFor="note" className="label">
            {approve ? t('approval.catatanOpsional') : t('approval.catatanWajib')}
          </label>
          <textarea
            id="note"
            rows={3}
            required={!approve}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              approve ? t('approval.contohSetuju') : t('approval.contohTolak')
            }
            className="input resize-none"
          />
        </div>

        <div className="mt-6 flex gap-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            {t('umum.batal')}
          </button>
          <button
            type="submit"
            disabled={busy}
            className={clsx('flex-1', approve ? 'btn-primary' : 'btn-danger')}
          >
            {busy ? t('umum.memproses') : approve ? t('approval.setujui') : t('approval.tolak')}
          </button>
        </div>
      </motion.form>
    </motion.div>
    </Portal>
  )
}

function RequestCard({ req, onDecide, canApprove }) {
  const { t, td, lang, locale } = useLang()
  const meta = statusMeta[req.status]
  const pending = req.status === 'pending'
  const urgent = req.priority === 'Urgent'

  return (
    <motion.article
      layout
      variants={itemVariants}
      exit={{ opacity: 0, scale: 0.94, y: -10, transition: { duration: 0.25 } }}
      whileHover={pending ? { y: -3 } : undefined}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className={clsx(
        'card sheen relative overflow-hidden p-5',
        urgent && pending && 'ring-1 ring-inset ring-danger/25'
      )}
    >
      <span
        aria-hidden
        className={clsx(
          'absolute inset-y-0 left-0 w-1',
          req.status === 'approved'
            ? 'bg-vital'
            : req.status === 'rejected'
              ? 'bg-danger'
              : urgent
                ? 'bg-danger'
                : 'bg-warn'
        )}
      />

      <div className="flex flex-wrap items-start justify-between gap-3 pl-2">
        <div>
          <p className="font-mono text-[11px] font-bold text-faint">{req.id}</p>
          <h3 className="mt-0.5 text-sm font-extrabold tracking-tight">{req.medicine}</h3>
          <p className="mt-1 text-xs font-semibold text-primary-ink tnum">
            {num(req.qty, locale)} {td('satuan', req.unit)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge level={meta.level} label={t(meta.tk)} pulse={false} />
          {urgent && pending && <StatusBadge level="critical" label={t('umum.urgent')} icon={false} />}
        </div>
      </div>

      <div className="mt-4 grid gap-2 pl-2 text-[11px] sm:grid-cols-2">
        {[
          { icon: User, label: req.requester },
          { icon: Hospital, label: td('lokasi', req.unitName) },
          { icon: Clock, label: (lang === 'en' && req.submittedAtEn) || req.submittedAt },
          { icon: FileText, label: `${t('approval.prioritas')}: ${req.priority === 'Urgent' ? t('umum.urgent') : t('umum.reguler')}` },
        ].map((f, i) => (
          <p key={i} className="flex items-center gap-1.5 text-muted">
            <f.icon size={12} strokeWidth={2.2} className="shrink-0 text-faint" />
            <span className="truncate">{f.label}</span>
          </p>
        ))}
      </div>

      <p className="mt-3 rounded-xl bg-elevated px-3.5 py-2.5 text-[11px] leading-relaxed text-muted">
        {lang === 'en' && req.reasonEn ? req.reasonEn : req.reason}
      </p>

      {req.note && (
        <p className="mt-2 rounded-xl border border-dashed border-line px-3.5 py-2.5 text-[11px] leading-relaxed text-muted">
          <span className="font-bold text-ink">{t('approval.catatanPenyetuju')}</span>
          {req.note}
        </p>
      )}

      <AnimatePresence mode="wait">
        {pending ? (
          canApprove ? (
            <motion.div
              key="actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex gap-2 pl-2"
            >
              <motion.button
                onClick={() => onDecide(req, 'rejected')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="btn-ghost flex-1 py-2 text-xs hover:border-danger/40 hover:text-danger-ink"
              >
                <X size={14} strokeWidth={2.8} />
                {t('approval.tolak')}
              </motion.button>
              <motion.button
                onClick={() => onDecide(req, 'approved')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary flex-1 py-2 text-xs"
              >
                <Check size={14} strokeWidth={2.8} />
                {t('approval.setujui')}
              </motion.button>
            </motion.div>
          ) : (
            <p className="mt-4 flex items-center gap-1.5 pl-2 text-[11px] text-faint">
              <Lock size={12} strokeWidth={2.4} />
              {t('approval.terkunci')}
            </p>
          )
        ) : (
          <motion.p
            key="decided"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 pl-2 text-[11px] text-faint"
          >
            {t('approval.diputuskan', { kapan: req.decidedAt === 'baru saja' ? t('approval.baruSaja') : (req.decidedAt ?? t('approval.sebelumnya')) })}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

export default function ApprovalFlow() {
  const [requests, setRequests] = useState(null)
  const [tab, setTab] = useState('pending')
  const [dialog, setDialog] = useState(null) // { req, decision }
  const scope = useRef(null)
  const toast = useToast()
  const { user } = useAuth()
  const { t, td } = useLang()

  useEffect(() => {
    let alive = true
    getRequests().then((d) => alive && setRequests(d))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!requests) return
    const ctx = revealOnScroll(scope)
    return () => ctx?.revert()
  }, [requests])

  const tabs = useMemo(() => {
    if (!requests) return []
    const by = (s) => requests.filter((r) => r.status === s).length
    return [
      { key: 'pending', label: t('umum.menunggu'), n: by('pending') },
      { key: 'approved', label: t('umum.disetujui'), n: by('approved') },
      { key: 'rejected', label: t('umum.ditolak'), n: by('rejected') },
      { key: 'all', label: t('approval.tabSemua'), n: requests.length },
    ]
  }, [requests, t])

  const visible = useMemo(() => {
    if (!requests) return []
    return tab === 'all' ? requests : requests.filter((r) => r.status === tab)
  }, [requests, tab])

  async function confirm(id, decision, note) {
    try {
      const updated = await decideRequest(id, decision, note)
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)))
      toast[decision === 'approved' ? 'success' : 'info'](
        t(decision === 'approved' ? 'approval.toastSetuju' : 'approval.toastTolak', { id })
      )
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (!requests) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-9 w-56 rounded-lg" />
        <SkeletonTable rows={4} />
      </div>
    )
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length

  return (
    <div ref={scope} className="space-y-6">
      <PageHeader
        eyebrow="ApprovalFlow"
        title={t('approval.judul')}
        description={t('approval.deskripsi')}
        actions={
          <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2">
            <ClipboardCheck size={15} className="text-warn" strokeWidth={2.4} />
            <span className="text-xs font-bold tnum">{pendingCount}</span>
            <span className="text-xs text-muted">{t('approval.menungguKeputusan')}</span>
          </div>
        }
      />

      {!user?.canApprove && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 rounded-xl border border-warn/30 bg-warn-soft px-4 py-3"
        >
          <Lock size={15} strokeWidth={2.4} className="mt-0.5 shrink-0 text-warn-ink" />
          <p className="text-xs leading-relaxed text-warn-ink">
            {t('approval.hanyaPantau', { peran: td('peran', user?.role) })}
          </p>
        </motion.div>
      )}

      <div className="flex gap-1 overflow-x-auto rounded-xl bg-elevated p-1 no-scrollbar">
        {tabs.map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                'relative shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors',
                active ? 'text-ink' : 'text-muted hover:text-ink'
              )}
            >
              {active && (
                <motion.span
                  layoutId="req-tab"
                  className="absolute inset-0 rounded-lg bg-surface shadow-card"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{t.label}</span>
              <span className="relative ml-1.5 rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-primary-ink tnum">
                {t.n}
              </span>
            </button>
          )
        })}
      </div>

      <motion.div
        variants={listVariants(0.06)}
        initial="initial"
        animate="animate"
        className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {visible.map((r) => (
            <RequestCard
              key={r.id}
              req={r}
              canApprove={!!user?.canApprove}
              onDecide={(req, decision) => setDialog({ req, decision })}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {visible.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card grid place-items-center gap-2 px-5 py-16 text-center"
        >
          <motion.div
            initial={{ scale: 0.7, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="grid h-12 w-12 place-items-center rounded-2xl bg-vital-soft text-vital-ink"
          >
            <Check size={22} strokeWidth={2.8} />
          </motion.div>
          <p className="text-sm font-bold">{t('approval.kosongJudul')}</p>
          <p className="max-w-xs text-xs text-muted">
            {t('approval.kosongIsi')}
          </p>
        </motion.div>
      )}

      <AnimatePresence>
        {dialog && (
          <DecisionModal
            req={dialog.req}
            decision={dialog.decision}
            onClose={() => setDialog(null)}
            onConfirm={confirm}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
