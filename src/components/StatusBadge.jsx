import clsx from 'clsx'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Clock, XCircle, Zap } from 'lucide-react'
import { useLang } from '@/store/LangContext'

const tones = {
  safe: 'bg-vital-soft text-vital-ink ring-vital/30',
  warning: 'bg-warn-soft text-warn-ink ring-warn/30',
  critical: 'bg-danger-soft text-danger-ink ring-danger/30',
  info: 'bg-primary-soft text-primary-ink ring-primary/30',
  neutral: 'bg-elevated text-muted ring-line',
}

const icons = {
  safe: CheckCircle2,
  warning: Clock,
  critical: AlertTriangle,
  info: Zap,
  neutral: XCircle,
}

export default function StatusBadge({ level = 'neutral', label, icon = true, pulse, className }) {
  const { t } = useLang()
  const Icon = icons[level] ?? icons.neutral
  const bawaan = { safe: t('umum.aman'), warning: t('umum.perhatian'), critical: t('umum.kritis') }
  const text = label ?? bawaan[level] ?? level
  const shouldPulse = pulse ?? level === 'critical'

  return (
    <span
      className={clsx(
        'relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
        'text-[11px] font-semibold ring-1 ring-inset',
        tones[level] ?? tones.neutral,
        className
      )}
    >
      {shouldPulse && (
        <motion.span
          aria-hidden
          className="absolute -left-0.5 -top-0.5 h-2 w-2 rounded-full bg-danger"
          animate={{ scale: [1, 1.5, 1], opacity: [0.9, 0.25, 0.9] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {icon && <Icon size={12} strokeWidth={2.6} className="shrink-0" />}
      {text}
    </span>
  )
}
