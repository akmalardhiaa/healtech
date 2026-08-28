import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Package,
  Thermometer,
  Truck,
  User,
  Zap,
} from 'lucide-react'
import clsx from 'clsx'

import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { SkeletonTable } from '@/components/Skeleton'
import { advanceShipment, getShipments } from '@/lib/api'
import { shipmentStages } from '@/data/mockData'
import { itemVariants, listVariants, revealOnScroll, gsap, drawPath } from '@/lib/motion'
import { useToast } from '@/components/Toast'
import { useLang } from '@/store/LangContext'

const stageTone = ['bg-faint', 'bg-primary', 'bg-warn', 'bg-vital']
const stageLevel = ['neutral', 'info', 'warning', 'safe']

function StageRail({ stage, compact }) {
  const { td } = useLang()
  const pct = (stage / (shipmentStages.length - 1)) * 100

  return (
    <div className={clsx('relative', compact ? 'pt-1' : 'pt-2')}>
      <div className="relative h-1 rounded-full bg-line">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-vital"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />

        {stage < 3 && (
          <motion.span
            className="absolute -top-[10px] grid h-6 w-6 place-items-center rounded-full bg-primary text-white shadow-[0_4px_12px_-2px_hsl(var(--primary)/0.9)] ring-2 ring-surface"
            initial={{ left: '0%' }}
            animate={{ left: `${pct}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginLeft: -12 }}
          >
            <motion.span
              className="grid place-items-center"
              animate={{ x: [0, 1.5, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Truck size={13} strokeWidth={2.6} />
            </motion.span>
          </motion.span>
        )}

        {shipmentStages.map((_, i) => {
          const done = i <= stage
          return (
            <motion.span
              key={i}
              className={clsx(
                'absolute -top-[5px] h-[11px] w-[11px] rounded-full ring-2 ring-surface transition-colors',
                done ? 'bg-vital' : 'bg-line'
              )}
              style={{ left: `${(i / (shipmentStages.length - 1)) * 100}%`, marginLeft: -5.5 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15 + i * 0.09, type: 'spring', stiffness: 420, damping: 20 }}
            />
          )
        })}
      </div>

      {!compact && (
        <div className="mt-3 grid grid-cols-4 gap-1">
          {shipmentStages.map((s, i) => (
            <p
              key={s}
              className={clsx(
                'text-[10px] font-semibold leading-tight transition-colors',
                i === 0 ? 'text-left' : i === 3 ? 'text-right' : 'text-center',
                i <= stage ? 'text-ink' : 'text-faint'
              )}
            >
              {td('tahap', s)}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

function RouteMap({ shipments }) {
  const { t, td } = useLang()
  const svgRef = useRef(null)
  const pathRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      drawPath(pathRef.current, 2, 0.3)
      gsap.from('.node', {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        stagger: 0.12,
        delay: 0.6,
        ease: 'back.out(2)',
        transformOrigin: 'center',
      })
    }, svgRef)
    return () => ctx.revert()
  }, [])

  const nodes = [
    { x: 60, y: 150, label: 'Gudang Pusat', hub: true },
    { x: 200, y: 70, label: 'Depo IGD' },
    { x: 320, y: 175, label: 'Rawat Inap' },
    { x: 450, y: 90, label: 'Rawat Jalan' },
    { x: 560, y: 165, label: 'Kamar Operasi' },
  ]

  const active = shipments.filter((s) => s.stage > 0 && s.stage < 3).length

  return (
    <div className="reveal card relative overflow-hidden p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold tracking-tight">{t('distribusi.petaJudul')}</h3>
          <p className="mt-0.5 text-xs text-faint">
            {t('distribusi.petaSub')}
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-bold text-primary-ink">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          {t('distribusi.armadaAktif', { n: active })}
        </span>
      </div>

      <div ref={svgRef} className="relative">
        <svg viewBox="0 0 620 230" className="h-auto w-full" role="img" aria-label={t('distribusi.petaJudul')}>
          <defs>
            <linearGradient id="route" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--vital))" />
            </linearGradient>
            <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="hsl(var(--line))" />
            </pattern>
          </defs>

          <rect width="620" height="230" fill="url(#dots)" opacity="0.7" />

          <path
            ref={pathRef}
            d="M60 150 C 110 90, 160 60, 200 70 C 250 82, 275 160, 320 175 C 375 192, 405 105, 450 90 C 500 74, 525 140, 560 165"
            fill="none"
            stroke="url(#route)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* garis putus-putus yang jalan di rute yang sama */}
          <path
            d="M60 150 C 110 90, 160 60, 200 70 C 250 82, 275 160, 320 175 C 375 192, 405 105, 450 90 C 500 74, 525 140, 560 165"
            fill="none"
            stroke="hsl(var(--surface))"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeDasharray="2 22"
            className="animate-dash"
            opacity="0.9"
          />

          {nodes.map((n) => (
            <g key={n.label} className="node">
              {n.hub && (
                <circle cx={n.x} cy={n.y} r="20" fill="hsl(var(--primary) / 0.14)">
                  <animate
                    attributeName="r"
                    values="16;26;16"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.5;0;0.5"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <circle
                cx={n.x}
                cy={n.y}
                r={n.hub ? 9 : 6.5}
                fill={n.hub ? 'hsl(var(--primary))' : 'hsl(var(--vital))'}
                stroke="hsl(var(--surface))"
                strokeWidth="2.5"
              />
              <text
                x={n.x}
                y={n.y - (n.hub ? 20 : 16)}
                textAnchor="middle"
                fill="hsl(var(--muted))"
                fontSize="10"
                fontWeight="600"
              >
                {td('lokasi', n.label)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

function ShipmentCard({ shp, onAdvance, busy }) {
  const { t, td, lang } = useLang()
  const [open, setOpen] = useState(false)
  const done = shp.stage === 3
  const urgent = shp.priority === 'Urgent'

  return (
    <motion.article
      layout
      variants={itemVariants}
      className={clsx(
        'card sheen overflow-hidden transition-shadow duration-300 hover:shadow-lift',
        urgent && !done && 'ring-1 ring-inset ring-danger/25'
      )}
    >
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={clsx(
                'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
                done ? 'bg-vital-soft text-vital-ink' : 'bg-primary-soft text-primary-ink'
              )}
            >
              {done ? (
                <CheckCircle2 size={18} strokeWidth={2.4} />
              ) : (
                <Truck size={18} strokeWidth={2.4} />
              )}
            </span>
            <div className="leading-tight">
              <p className="font-mono text-xs font-bold tracking-tight">{shp.id}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
                <Building2 size={11} />
                {td('lokasi', shp.origin)}
                <ChevronRight size={11} className="text-faint" />
                <span className="font-semibold text-ink">{td('lokasi', shp.destination)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {urgent && <StatusBadge level="critical" label={t('umum.urgent')} icon={false} />}
            <StatusBadge
              level={stageLevel[shp.stage]}
              label={td('tahap', shipmentStages[shp.stage])}
              icon={false}
              pulse={false}
            />
          </div>
        </div>

        <div className="mt-5">
          <StageRail stage={shp.stage} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: Package, label: t('distribusi.item'), value: `${shp.items} ${t('distribusi.jenis')}` },
            { icon: User, label: t('distribusi.kurir'), value: shp.driver },
            { icon: Thermometer, label: t('distribusi.suhu'), value: shp.temperature },
            { icon: MapPin, label: t('distribusi.eta'), value: (lang === 'en' && shp.etaEn) || shp.eta },
          ].map((f) => (
            <div key={f.label} className="rounded-xl bg-elevated px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-faint">
                <f.icon size={11} strokeWidth={2.4} />
                {f.label}
              </p>
              <p className="mt-1 truncate text-xs font-bold">{f.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-[11px] font-bold text-muted transition-colors hover:text-ink"
          >
            {open ? t('distribusi.sembunyiRiwayat') : t('distribusi.lihatRiwayat')}
          </button>

          <motion.button
            onClick={() => onAdvance(shp.id)}
            disabled={done || busy}
            whileHover={{ scale: done ? 1 : 1.03 }}
            whileTap={{ scale: done ? 1 : 0.97 }}
            className={clsx(
              'ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors',
              done
                ? 'cursor-not-allowed bg-elevated text-faint'
                : 'bg-primary text-white hover:brightness-110'
            )}
          >
            <Zap size={12} strokeWidth={2.6} />
            {done ? t('distribusi.selesai') : t('distribusi.lanjutkan')}
          </motion.button>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.ol
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-3 border-t border-line pt-4">
                {shipmentStages.map((s, i) => {
                  const reached = i <= shp.stage
                  return (
                    <motion.li
                      key={s}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-3"
                    >
                      <span
                        className={clsx(
                          'h-2.5 w-2.5 shrink-0 rounded-full',
                          reached ? stageTone[i] : 'bg-line'
                        )}
                      />
                      <p
                        className={clsx(
                          'text-xs',
                          reached ? 'font-semibold text-ink' : 'text-faint'
                        )}
                      >
                        {td('tahap', s)}
                      </p>
                      <p className="ml-auto text-[10px] text-faint">
                        {reached ? (i === 0 ? shp.departedAt : '✓') : '-'}
                      </p>
                    </motion.li>
                  )
                })}
              </div>
            </motion.ol>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  )
}

export default function DistribusiTrack() {
  const [shipments, setShipments] = useState(null)
  const [busy, setBusy] = useState(null)
  const [tab, setTab] = useState('all')
  const scope = useRef(null)
  const toast = useToast()
  const { t, td } = useLang()

  useEffect(() => {
    let alive = true
    getShipments().then((d) => alive && setShipments(d))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!shipments) return
    const ctx = revealOnScroll(scope)
    return () => ctx?.revert()
  }, [shipments])

  const tabs = useMemo(() => {
    if (!shipments) return []
    return [
      { key: 'all', label: t('distribusi.tabSemua'), n: shipments.length },
      { key: 'transit', label: t('distribusi.tabPerjalanan'), n: shipments.filter((s) => s.stage > 0 && s.stage < 3).length },
      { key: 'done', label: t('distribusi.tabSelesai'), n: shipments.filter((s) => s.stage === 3).length },
      { key: 'queue', label: t('distribusi.tabAntrean'), n: shipments.filter((s) => s.stage === 0).length },
    ]
  }, [shipments, t])

  const visible = useMemo(() => {
    if (!shipments) return []
    if (tab === 'transit') return shipments.filter((s) => s.stage > 0 && s.stage < 3)
    if (tab === 'done') return shipments.filter((s) => s.stage === 3)
    if (tab === 'queue') return shipments.filter((s) => s.stage === 0)
    return shipments
  }, [shipments, tab])

  async function handleAdvance(id) {
    setBusy(id)
    try {
      const updated = await advanceShipment(id)
      setShipments((prev) => prev.map((s) => (s.id === id ? updated : s)))
      toast.success(t('distribusi.majuToast', { id, tahap: td('tahap', shipmentStages[updated.stage]) }))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(null)
    }
  }

  if (!shipments) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-9 w-64 rounded-lg" />
        <SkeletonTable rows={5} />
      </div>
    )
  }

  return (
    <div ref={scope} className="space-y-6">
      <PageHeader
        eyebrow="DistribusiTrack"
        title={t('distribusi.judul')}
        description={t('distribusi.deskripsi')}
      />

      <RouteMap shipments={shipments} />

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
                  layoutId="ship-tab"
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
        variants={listVariants(0.07)}
        initial="initial"
        animate="animate"
        className="grid gap-4 xl:grid-cols-2"
      >
        <AnimatePresence mode="popLayout">
          {visible.map((s) => (
            <ShipmentCard key={s.id} shp={s} onAdvance={handleAdvance} busy={busy === s.id} />
          ))}
        </AnimatePresence>
      </motion.div>

      {visible.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card grid place-items-center gap-2 px-5 py-16 text-center"
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-elevated text-faint">
            <Truck size={20} />
          </div>
          <p className="text-sm font-bold">{t('distribusi.kosongJudul')}</p>
          <p className="max-w-xs text-xs text-muted">
            {t('distribusi.kosongIsi')}
          </p>
        </motion.div>
      )}
    </div>
  )
}
