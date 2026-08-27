import { useRef } from 'react'
import clsx from 'clsx'
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'
import AnimatedNumber from './AnimatedNumber'

const accents = {
  primary: { ring: 'ring-primary/25', chip: 'bg-primary-soft text-primary-ink', bar: 'bg-primary' },
  vital: { ring: 'ring-vital/25', chip: 'bg-vital-soft text-vital-ink', bar: 'bg-vital' },
  warn: { ring: 'ring-warn/25', chip: 'bg-warn-soft text-warn-ink', bar: 'bg-warn' },
  danger: { ring: 'ring-danger/25', chip: 'bg-danger-soft text-danger-ink', bar: 'bg-danger' },
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  format,
  suffix,
  delta,
  hint,
  accent = 'primary',
  progress,
}) {
  const ref = useRef(null)
  const a = accents[accent] ?? accents.primary

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  // pakai spring biar berhentinya halus
  const rx = useSpring(useMotionValue(0), { stiffness: 260, damping: 24 })
  const ry = useSpring(useMotionValue(0), { stiffness: 260, damping: 24 })

  const spotlight = useMotionTemplate`radial-gradient(340px circle at ${mx}px ${my}px, hsl(var(--primary) / 0.06), transparent 70%)`

  function handleMove(e) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    mx.set(x)
    my.set(y)
    ry.set(((x - r.width / 2) / r.width) * 4)
    rx.set((-(y - r.height / 2) / r.height) * 4)
  }

  function handleLeave() {
    rx.set(0)
    ry.set(0)
  }

  const up = delta != null && delta >= 0
  const Trend = up ? TrendingUp : TrendingDown

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className={clsx(
        // jangan kasih .reveal di sini, transform-nya sudah dipegang Framer
        'group relative overflow-hidden rounded-2xl border border-line bg-surface p-5',
        'shadow-card ring-1 ring-inset transition-shadow duration-300 hover:shadow-lift',
        a.ring
      )}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlight }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className={clsx('grid h-10 w-10 place-items-center rounded-xl', a.chip)}>
          <Icon size={18} strokeWidth={2.3} />
        </div>
        {delta != null && (
          <span
            className={clsx(
              'inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold',
              up ? 'bg-vital-soft text-vital-ink' : 'bg-danger-soft text-danger-ink'
            )}
          >
            <Trend size={12} strokeWidth={2.8} />
            {up ? '+' : ''}
            {delta}%
          </span>
        )}
      </div>

      <p className="relative mt-4 text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </p>

      <p className="relative mt-1 flex items-baseline gap-1 text-3xl font-extrabold tracking-tight tnum">
        <AnimatedNumber value={value} format={format} />
        {suffix && <span className="text-base font-bold text-muted">{suffix}</span>}
      </p>

      {hint && <p className="relative mt-1 text-xs text-faint">{hint}</p>}

      {progress != null && (
        <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-line/70">
          <motion.div
            className={clsx('h-full rounded-full', a.bar)}
            initial={{ width: 0 }}
            whileInView={{ width: `${Math.min(100, progress)}%` }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          />
        </div>
      )}
    </motion.div>
  )
}
