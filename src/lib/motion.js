/**
 * Shared motion vocabulary.
 *
 * Two libraries, one job each:
 *   • GSAP        — scroll-driven reveals, timelines, SVG path drawing,
 *                   number counters. Anything imperative or sequenced.
 *   • Framer      — component-lifecycle motion: mount/unmount, page
 *                   transitions, layout shifts, gesture springs.
 *
 * Keeping the constants here means every surface eases the same way, which is
 * what makes a set of animations read as one system instead of a pile of
 * effects.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

/** House easing curve — a soft overshoot-free deceleration. */
export const EASE = 'power3.out'
export const EASE_IO = 'power2.inOut'

/** Framer's cubic-bezier equivalent of EASE, so both libraries match. */
export const easeOut = [0.22, 1, 0.36, 1]
export const easeInOut = [0.65, 0, 0.35, 1]

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// --- Framer variants -------------------------------------------------------

/** Page-level crossfade + lift used by every route. */
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

/** Child of a staggering parent. */
export const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

/** Container that hands its children a stagger. */
export const listVariants = (stagger = 0.05, delay = 0) => ({
  initial: {},
  animate: { transition: { staggerChildren: stagger, delayChildren: delay } },
  exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
})

/** Table/feed row that slides in from the left edge. */
export const rowVariants = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: easeOut } },
  exit: { opacity: 0, x: 24, transition: { duration: 0.22, ease: easeInOut } },
}

/** Modal/dialog spring. */
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

/** Hover/tap feel shared by every interactive card. */
export const springHover = {
  whileHover: { y: -4, transition: { type: 'spring', stiffness: 400, damping: 22 } },
  whileTap: { scale: 0.985 },
}

// --- GSAP helpers ----------------------------------------------------------

/**
 * Reveal every `.reveal` inside `scope` as it scrolls into view.
 * Returns the GSAP context so the caller can `ctx.revert()` on unmount —
 * without that, ScrollTriggers leak across route changes.
 */
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

    // Charts and tables finish laying out after this runs, which shifts every
    // trigger below them. Without a refresh those triggers keep their stale
    // positions and the panels never fade in.
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, scope)
}

/**
 * Count a number up to `value`, easing out. Writes through `onUpdate` rather
 * than touching the DOM so React stays the single owner of the text node.
 */
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

/** Draw an SVG path from nothing to full length. */
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
