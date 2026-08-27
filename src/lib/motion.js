import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export const EASE = 'power3.out'
export const EASE_IO = 'power2.inOut'

// versi cubic-bezier dari EASE, biar Framer sama feel-nya dengan GSAP
export const easeOut = [0.22, 1, 0.36, 1]
export const easeInOut = [0.65, 0, 0.35, 1]

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const pageVariants = {
  initial: { opacity: 0, y: 18, filter: 'blur(6px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: easeOut, staggerChildren: 0.06, delayChildren: 0.05 },
  },
  exit: { opacity: 0, y: -12, filter: 'blur(4px)', transition: { duration: 0.28, ease: easeInOut } },
}

export const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

export const listVariants = (stagger = 0.05, delay = 0) => ({
  initial: {},
  animate: { transition: { staggerChildren: stagger, delayChildren: delay } },
  exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
})

export const rowVariants = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: easeOut } },
  exit: { opacity: 0, x: 24, transition: { duration: 0.22, ease: easeInOut } },
}

export const modalVariants = {
  initial: { opacity: 0, scale: 0.94, y: 22 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 26 },
  },
  exit: { opacity: 0, scale: 0.97, y: 12, transition: { duration: 0.18, ease: easeInOut } },
}

export const springHover = {
  whileHover: { y: -4, transition: { type: 'spring', stiffness: 400, damping: 22 } },
  whileTap: { scale: 0.985 },
}

// return context-nya supaya bisa di-revert pas unmount, kalau tidak
// ScrollTrigger-nya numpuk tiap ganti halaman
export function revealOnScroll(scope, { y = 26, stagger = 0.08, start = 'top 88%' } = {}) {
  return gsap.context(() => {
    const targets = gsap.utils.toArray('.reveal')
    if (!targets.length) return

    if (prefersReducedMotion()) {
      gsap.set(targets, { opacity: 1, y: 0 })
      return
    }

    targets.forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.72,
          ease: EASE,
          delay: (i % 3) * stagger,
          scrollTrigger: { trigger: el, start, once: true },
        }
      )
    })

    // chart & tabel baru selesai layout setelah ini, jadi posisi trigger
    // harus dihitung ulang
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, scope)
}

export function countTo(from, value, onUpdate, duration = 1.4) {
  if (prefersReducedMotion()) {
    onUpdate(value)
    return { kill() {} }
  }
  const proxy = { n: from }
  return gsap.to(proxy, {
    n: value,
    duration,
    ease: EASE,
    onUpdate: () => onUpdate(proxy.n),
    onComplete: () => onUpdate(value),
  })
}

export function drawPath(el, duration = 1.6, delay = 0) {
  if (!el) return null
  const len = el.getTotalLength()
  gsap.set(el, { strokeDasharray: len, strokeDashoffset: len })
  if (prefersReducedMotion()) {
    gsap.set(el, { strokeDashoffset: 0 })
    return null
  }
  return gsap.to(el, { strokeDashoffset: 0, duration, delay, ease: EASE_IO })
}
