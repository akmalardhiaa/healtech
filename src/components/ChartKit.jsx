import { motion } from 'framer-motion'
import clsx from 'clsx'

// warna chart diambil dari token tema biar ikut ganti pas dark/light
export const chartColors = {
  primary: 'hsl(var(--primary))',
  vital: 'hsl(var(--vital))',
  warn: 'hsl(var(--warn))',
  danger: 'hsl(var(--danger))',
  line: 'hsl(var(--line))',
  muted: 'hsl(var(--muted))',
}

export const categorical = [
  'hsl(var(--primary))',
  'hsl(var(--vital))',
  'hsl(var(--warn))',
  'hsl(var(--danger))',
  'hsl(var(--faint))',
]

export const axisProps = {
  stroke: 'hsl(var(--faint))',
  tick: { fill: 'hsl(var(--muted))', fontSize: 11, fontWeight: 500 },
  tickLine: false,
  axisLine: false,
}

export function ChartTooltip({ active, payload, label, formatter, unit = '' }) {
  if (!active || !payload?.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="rounded-xl border border-line bg-surface/95 px-3 py-2.5 shadow-lift backdrop-blur"
    >
      {label != null && (
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-faint">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: p.color ?? p.fill }}
            />
            <span className="capitalize text-muted">{p.name}</span>
            <span className="ml-auto font-bold tnum text-ink">
              {formatter ? formatter(p.value) : p.value.toLocaleString('id-ID')}
              {unit}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export function ChartCard({ title, subtitle, action, className, children }) {
  return (
    <div className={clsx('reveal card sheen p-5', className)}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold tracking-tight">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-faint">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

export function Legend({ items }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5 text-[11px] text-muted">
          <span className="h-2 w-2 rounded-full" style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  )
}
