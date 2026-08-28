import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  ArrowUpRight,
  ClipboardCheck,
  Package,
  Truck,
  TrendingDown,
  Wallet,
} from 'lucide-react'
import clsx from 'clsx'

import PageHeader from '@/components/PageHeader'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'
import { SkeletonCard, SkeletonChart } from '@/components/Skeleton'
import { ChartCard, ChartTooltip, Legend, axisProps, categorical, chartColors } from '@/components/ChartKit'
import { getDashboard } from '@/lib/api'
import {
  daysToStockout,
  daysUntil,
  expiryLevel,
  num,
  overallLevel,
  rupiahShort,
  stockoutLevel,
} from '@/lib/format'
import { itemVariants, listVariants, revealOnScroll } from '@/lib/motion'
import { useAuth } from '@/store/AuthContext'
import { useLang } from '@/store/LangContext'

const toneDot = {
  danger: 'bg-danger',
  warn: 'bg-warn',
  vital: 'bg-vital',
  primary: 'bg-primary',
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const scope = useRef(null)
  const { user } = useAuth()
  const { t, td, lang, locale } = useLang()

  useEffect(() => {
    let alive = true
    getDashboard().then((d) => alive && setData(d))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!data) return
    const ctx = revealOnScroll(scope)
    return () => ctx?.revert()
  }, [data])

  const stats = useMemo(() => {
    if (!data) return null
    const { medicines, shipments, requests } = data

    const critical = medicines.filter((m) => overallLevel(m) === 'critical').length
    const expiringSoon = medicines.filter((m) => expiryLevel(m.expiry) !== 'safe').length
    const value = medicines.reduce((s, m) => s + m.stock * m.price, 0)
    const inTransit = shipments.filter((s) => s.stage > 0 && s.stage < 3).length
    const pending = requests.filter((r) => r.status === 'pending').length

    return { total: medicines.length, critical, expiringSoon, value, inTransit, pending }
  }, [data])

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 11) return t('dash.pagi')
    if (h < 15) return t('dash.siang')
    if (h < 19) return t('dash.sore')
    return t('dash.malam')
  }, [t])

  // panel perlu perhatian, urut dari yang paling dekat kedaluwarsa
  const attention = useMemo(() => {
    if (!data) return []
    return [...data.medicines]
      .sort((a, b) => daysUntil(a.expiry) - daysUntil(b.expiry))
      .slice(0, 6)
  }, [data])

  // obat yang paling cepat habis kalau laju pakainya tetap
  const segeraHabis = useMemo(() => {
    if (!data) return []
    return [...data.medicines]
      .filter((m) => stockoutLevel(m) !== 'safe')
      .sort((a, b) => (daysToStockout(a) ?? 1e9) - (daysToStockout(b) ?? 1e9))
      .slice(0, 5)
  }, [data])

  if (!data || !stats) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-9 w-64 rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <SkeletonChart className="lg:col-span-2" />
          <SkeletonChart />
        </div>
      </div>
    )
  }

  return (
    <div ref={scope} className="space-y-6">
      <PageHeader
        eyebrow="StockPulse"
        title={`${greeting}, ${user?.name?.split(' ')[0] ?? 'Tim'}.`}
        description={t('dash.deskripsi')}
        actions={
          <Link to="/approval" className="btn-primary group">
            <ClipboardCheck size={15} strokeWidth={2.4} />
            {t('dash.menungguBtn', { n: stats.pending })}
            <ArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        }
      />

      <motion.div
        variants={listVariants(0.07)}
        initial="initial"
        animate="animate"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          icon={Package}
          label={t('dash.totalItem')}
          value={stats.total}
          delta={4.2}
          hint={t('dash.totalItemHint', { n: num(stats.total * 1240, locale) })}
          accent="primary"
          progress={82}
        />
        <StatCard
          icon={AlertTriangle}
          label={t('dash.perluTindakan')}
          value={stats.critical}
          delta={-11.5}
          hint={t('dash.perluTindakanHint', { n: stats.expiringSoon })}
          accent="danger"
          progress={(stats.critical / stats.total) * 100}
        />
        <StatCard
          icon={Truck}
          label={t('dash.dalamPerjalanan')}
          value={stats.inTransit}
          delta={8.1}
          hint={t('dash.dalamPerjalananHint', { n: data.shipments.length })}
          accent="vital"
          progress={(stats.inTransit / data.shipments.length) * 100}
        />
        <StatCard
          icon={Wallet}
          label={t('dash.nilaiPersediaan')}
          value={stats.value}
          format={(v) => rupiahShort(v, locale)}
          delta={2.6}
          hint={t('dash.nilaiPersediaanHint')}
          accent="warn"
          progress={68}
        />
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          className="lg:col-span-2"
          title={t('dash.trenJudul')}
          subtitle={t('dash.trenSub')}
          action={
            <span className="rounded-full bg-vital-soft px-2.5 py-1 text-[11px] font-bold text-vital-ink">
              +12,4% YoY
            </span>
          }
        >
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.consumptionTrend} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gMasuk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColors.primary} stopOpacity={0.42} />
                    <stop offset="100%" stopColor={chartColors.primary} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gKeluar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColors.vital} stopOpacity={0.38} />
                    <stop offset="100%" stopColor={chartColors.vital} stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 6" stroke={chartColors.line} vertical={false} />
                <XAxis dataKey="month" {...axisProps} />
                {/* dibulatkan ke ribuan, kalau tidak labelnya kepotong */}
                <YAxis
                  {...axisProps}
                  width={58}
                  tickFormatter={(v) => (v === 0 ? '0' : `${Math.round(v / 1000)}rb`)}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: chartColors.primary, strokeWidth: 1, strokeDasharray: '4 4' }}
                />

                <Area
                  type="monotone"
                  dataKey="masuk"
                  name={t('dash.obatMasuk')}
                  stroke={chartColors.primary}
                  strokeWidth={2.4}
                  fill="url(#gMasuk)"
                  animationDuration={1600}
                  animationEasing="ease-out"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: 'hsl(var(--surface))' }}
                />
                <Area
                  type="monotone"
                  dataKey="keluar"
                  name={t('dash.obatKeluar')}
                  stroke={chartColors.vital}
                  strokeWidth={2.4}
                  fill="url(#gKeluar)"
                  animationDuration={1600}
                  animationBegin={220}
                  animationEasing="ease-out"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: 'hsl(var(--surface))' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <Legend
            items={[
              { label: t('dash.obatMasuk'), color: chartColors.primary },
              { label: t('dash.obatKeluar'), color: chartColors.vital },
            ]}
          />
        </ChartCard>

        <ChartCard title={t('dash.komposisiJudul')} subtitle={t('dash.komposisiSub')}>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryMix}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="86%"
                  paddingAngle={3}
                  stroke="hsl(var(--surface))"
                  strokeWidth={3}
                  animationDuration={1400}
                >
                  {data.categoryMix.map((_, i) => (
                    <Cell key={i} fill={categorical[i % categorical.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip unit="%" />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <Legend
            items={data.categoryMix.map((c, i) => ({
              label: `${c.name} · ${c.value}%`,
              color: categorical[i % categorical.length],
            }))}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title={t('dash.permintaanJudul')} subtitle={t('dash.permintaanSub')}>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.unitDemand}
                layout="vertical"
                margin={{ top: 0, right: 12, left: 4, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 6" stroke={chartColors.line} horizontal={false} />
                <XAxis type="number" {...axisProps} />
                <YAxis type="category" dataKey="unit" {...axisProps} width={92} tickFormatter={(v) => td('lokasi', v)} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--primary) / 0.06)' }} />
                <Bar
                  dataKey="permintaan"
                  name={t('dash.permintaanJudul')}
                  radius={[0, 6, 6, 0]}
                  animationDuration={1300}
                >
                  {data.unitDemand.map((_, i) => (
                    <Cell key={i} fill={categorical[i % categorical.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <div className="reveal card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line p-5">
            <div>
              <h3 className="text-sm font-bold tracking-tight">{t('dash.perhatianJudul')}</h3>
              <p className="mt-0.5 text-xs text-faint">{t('dash.perhatianSub')}</p>
            </div>
            <Link
              to="/stok"
              className="text-[11px] font-bold text-primary transition-colors hover:text-primary-ink"
            >
              {t('umum.lihatSemua')}
            </Link>
          </div>

          <motion.ul
            variants={listVariants(0.055)}
            initial="initial"
            animate="animate"
            className="divide-y divide-line"
          >
            {attention.map((m) => {
              const level = expiryLevel(m.expiry)
              const d = daysUntil(m.expiry)
              return (
                <motion.li
                  key={m.id}
                  variants={itemVariants}
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <span
                    className={clsx(
                      'h-8 w-1 shrink-0 rounded-full',
                      level === 'critical' ? 'bg-danger' : level === 'warning' ? 'bg-warn' : 'bg-vital'
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{m.name}</p>
                    <p className="truncate text-[10px] text-faint">
                      {m.batch} · {td('lokasi', m.location)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-extrabold tnum">{d} {t('umum.hari')}</p>
                    <p className="text-[10px] text-faint">{t('dash.sisaUmur')}</p>
                  </div>
                </motion.li>
              )
            })}
          </motion.ul>
        </div>

        <div className="reveal card overflow-hidden">
          <div className="border-b border-line p-5">
            <h3 className="text-sm font-bold tracking-tight">{t('dash.aktivitasJudul')}</h3>
            <p className="mt-0.5 text-xs text-faint">{t('dash.aktivitasSub')}</p>
          </div>

          <motion.ol
            variants={listVariants(0.055)}
            initial="initial"
            animate="animate"
            className="relative space-y-4 p-5"
          >
            <span aria-hidden className="absolute bottom-6 left-[26px] top-7 w-px bg-line" />

            {data.activityFeed.map((a) => (
              <motion.li key={a.id} variants={itemVariants} className="relative flex gap-3.5 pl-0">
                <span className="relative z-10 mt-1 grid h-3 w-3 shrink-0 place-items-center">
                  <span
                    className={clsx(
                      'h-3 w-3 rounded-full ring-4 ring-surface',
                      toneDot[a.type] ?? 'bg-primary'
                    )}
                  />
                </span>
                <div className="min-w-0 pb-0.5">
                  <p className="text-xs leading-snug">{lang === 'en' && a.textEn ? a.textEn : a.text}</p>
                  <p className="mt-0.5 text-[10px] text-faint">{a.time} {t('topbar.lalu')}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </div>

      <div className="reveal card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-line p-5">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold tracking-tight">
              <TrendingDown size={15} className="text-warn" strokeWidth={2.5} />
              {t('dash.pesanJudul')}
            </h3>
            <p className="mt-0.5 text-xs text-faint">
              {t('dash.pesanSub')}
            </p>
          </div>
          <Link
            to="/stok"
            className="text-[11px] font-bold text-primary transition-colors hover:text-primary-ink"
          >
            {t('dash.kelolaStok')}
          </Link>
        </div>

        {segeraHabis.length === 0 ? (
          <p className="p-8 text-center text-xs text-muted">
            {t('dash.pesanKosong')}
          </p>
        ) : (
          <motion.ul
            variants={listVariants(0.055)}
            initial="initial"
            animate="animate"
            className="divide-y divide-line"
          >
            {segeraHabis.map((m) => {
              const sisa = daysToStockout(m)
              const lvl = stockoutLevel(m)
              const persen = Math.max(4, Math.min(100, (sisa / 30) * 100))
              return (
                <motion.li key={m.id} variants={itemVariants} className="px-5 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-xs font-bold">{m.name}</p>
                    <p
                      className={clsx(
                        'shrink-0 text-xs font-extrabold tnum',
                        lvl === 'critical' ? 'text-danger-ink' : 'text-warn-ink'
                      )}
                    >
                      ± {sisa} {t('umum.hari')}
                    </p>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line/70">
                    <motion.div
                      className={clsx(
                        'h-full rounded-full',
                        lvl === 'critical' ? 'bg-danger' : 'bg-warn'
                      )}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${persen}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-faint">
                    {t('dash.sisa')} {num(m.stock, locale)} {td('satuan', m.unit)} · {t('dash.pakai')} {m.dailyUsage}{t('stok.perHari')}
                  </p>
                </motion.li>
              )
            })}
          </motion.ul>
        )}
      </div>

      <div className="reveal card flex flex-wrap items-center gap-x-6 gap-y-3 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">{t('dash.kunciIndikator')}</p>
        <StatusBadge level="safe" label={t('dash.kunciAman')} />
        <StatusBadge level="warning" label={t('dash.kunciPerhatian')} />
        <StatusBadge level="critical" label={t('dash.kunciKritis')} />
        <p className="ml-auto text-[11px] text-faint">
          {t('dash.kunciCatatan')}
        </p>
      </div>
    </div>
  )
}
