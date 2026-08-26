import { useEffect, useRef, useState } from 'react'
import { countTo } from '@/lib/motion'

export default function AnimatedNumber({
  value = 0,
  format = (n) => Math.round(n).toLocaleString('id-ID'),
  duration = 1.4,
  className,
}) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const seen = useRef(false)
  const prev = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let tween
    const run = () => {
      tween = countTo(prev.current, value, setDisplay, duration)
      prev.current = value
    }

    if (seen.current) {
      run()
      return () => tween?.kill()
    }

    // render pertama, tunggu sampai elemennya kelihatan dulu
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          seen.current = true
          run()
          io.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      tween?.kill()
    }
  }, [value, duration])

  return (
    <span ref={ref} className={className}>
      {format(display)}
    </span>
  )
}
