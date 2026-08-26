import clsx from 'clsx'

export function SkeletonLine({ className }) {
  return <div className={clsx('skeleton h-3', className)} />
}

export function SkeletonCard({ className }) {
  return (
    <div className={clsx('card p-5', className)}>
      <div className="skeleton h-10 w-10 rounded-xl" />
      <SkeletonLine className="mt-4 w-24" />
      <div className="skeleton mt-2 h-8 w-32 rounded-lg" />
      <SkeletonLine className="mt-3 w-40" />
    </div>
  )
}

export function SkeletonTable({ rows = 6 }) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line p-4">
        <SkeletonLine className="w-40" />
      </div>
      <div className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <div className="skeleton h-9 w-9 rounded-lg" />
            <SkeletonLine className="w-1/3" />
            <SkeletonLine className="ml-auto w-16" />
            <div className="skeleton h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonChart({ className }) {
  return (
    <div className={clsx('card p-5', className)}>
      <SkeletonLine className="w-36" />
      <div className="mt-6 flex h-56 items-end gap-2">
        {[52, 78, 41, 88, 63, 95, 70].map((h, i) => (
          <div key={i} className="skeleton flex-1 rounded-t-md" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}
