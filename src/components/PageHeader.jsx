import { motion } from 'framer-motion'
import { itemVariants } from '@/lib/motion'

export default function PageHeader({ eyebrow, title, description, actions }) {
  const words = String(title).split(' ')

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <motion.p
            variants={itemVariants}
            className="mb-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary"
          >
            {eyebrow}
          </motion.p>
        )}

        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {words.map((w, i) => (
            <motion.span
              key={i}
              className="mr-[0.28em] inline-block"
              initial={{ opacity: 0, y: 20, rotateX: -45 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                delay: 0.08 + i * 0.055,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {w}
            </motion.span>
          ))}
        </h1>

        {description && (
          <motion.p
            variants={itemVariants}
            className="mt-2 max-w-2xl text-sm text-muted text-balance"
          >
            {description}
          </motion.p>
        )}
      </div>

      {actions && (
        <motion.div variants={itemVariants} className="flex shrink-0 items-center gap-2">
          {actions}
        </motion.div>
      )}
    </div>
  )
}
