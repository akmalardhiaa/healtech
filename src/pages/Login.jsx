import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react'
import clsx from 'clsx'
import { gsap, drawPath } from '@/lib/motion'
import { useAuth } from '@/store/AuthContext'
import { useToast } from '@/components/Toast'
import { demoAccounts } from '@/lib/api'
import { useLang } from '@/store/LangContext'

const highlights = [
  { icon: ShieldCheck, key: 'fefo' },
  { icon: Activity, key: 'pantau' },
]

export default function Login() {
  const [email, setEmail] = useState('admin@vitalstock.id')
  const [password, setPassword] = useState('vitalstock')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const { t, td } = useLang()
  const toast = useToast()
  const navigate = useNavigate()

  const scope = useRef(null)
  const ecgRef = useRef(null)
  const cardRef = useRef(null)

  // urutan masuk: brand, teks, field, terakhir garis EKG
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.from('.lg-brand', { opacity: 0, y: -20, duration: 0.6 })
        .from('.lg-line', { opacity: 0, y: 26, duration: 0.7, stagger: 0.09 }, '-=0.3')
        .from('.lg-pill', { opacity: 0, scale: 0.8, duration: 0.5, stagger: 0.08 }, '-=0.35')
        .from(
          '.lg-card',
          { opacity: 0, y: 34, scale: 0.97, duration: 0.75 },
          '-=0.6'
        )
        .from('.lg-field', { opacity: 0, y: 16, duration: 0.5, stagger: 0.08 }, '-=0.4')

      // setelah kegambar, jalanin loop geser pelan
      const tween = drawPath(ecgRef.current, 2.2, 0.5)
      if (tween) {
        tween.eventCallback('onComplete', () => {
          gsap.to(ecgRef.current, {
            strokeDashoffset: `-=${ecgRef.current.getTotalLength()}`,
            duration: 6,
            ease: 'none',
            repeat: -1,
          })
        })
      }
    }, scope)

    return () => ctx.revert()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (busy) return
    setError('')
    setBusy(true)

    try {
      const user = await login(email, password)
      toast.success(t('login.selamatDatang', { nama: user.name.split(' ')[0] }))
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.code === 'INVALID_CREDENTIALS' ? t('login.salah') : err.message)
      gsap.fromTo(
        cardRef.current,
        { x: 0 },
        { keyframes: { x: [-9, 8, -6, 4, 0] }, duration: 0.45, ease: 'power2.out' }
      )
    } finally {
      setBusy(false)
    }
  }

  function useAccount(acc) {
    setEmail(acc.email)
    setPassword('vitalstock')
    setError('')
  }

  return (
    <div ref={scope} className="relative min-h-dvh overflow-hidden bg-canvas">
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg opacity-50" />
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-32 top-0 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-[120px]"
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 right-0 h-[30rem] w-[30rem] rounded-full bg-vital/[0.08] blur-[120px]"
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative mx-auto grid min-h-dvh w-full max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 lg:order-1">
          <div className="lg-brand mb-8 flex items-center gap-3">
            <span className="relative grid h-11 w-11 place-items-center rounded-2xl bg-primary text-white shadow-[0_5px_14px_-7px_hsl(var(--primary)/0.55)]">
              <Activity size={22} strokeWidth={2.6} />
            </span>
            <div className="leading-tight">
              <p className="text-lg font-extrabold tracking-tight">VitalStock</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-faint">
                {t('brand.tagline')}
              </p>
            </div>
          </div>

          <h1 className="lg-line text-4xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-5xl">
            {t('login.judul1')}{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-primary via-primary to-vital bg-clip-text text-transparent">
                {t('login.judul2')}
              </span>
              <motion.span
                className="absolute -bottom-1 left-0 h-[3px] rounded-full bg-gradient-to-r from-primary to-vital"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 1.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
          </h1>

          <p className="lg-line mt-4 max-w-md text-[15px] leading-relaxed text-muted text-balance">
            {t('login.deskripsi')}
          </p>

          <div className="lg-line mt-8 rounded-2xl border border-line bg-surface/60 p-4 backdrop-blur">
            <svg viewBox="0 0 480 90" className="h-[70px] w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="ecg" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--vital))" />
                </linearGradient>
              </defs>
              <path
                ref={ecgRef}
                d="M0 45 H70 l10 -26 l10 52 l12 -60 l12 34 H190 l14 -18 l10 36 l10 -18 H320 l12 -30 l12 44 l10 -14 H480"
                fill="none"
                stroke="url(#ecg)"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-2 flex items-center justify-between text-[11px] text-faint">
              <span className="font-semibold uppercase tracking-wider">{t('login.stockPulse')}</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-vital" />
                {t('login.sistemAktif')}
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {highlights.map((h) => (
              <div
                key={h.key}
                className="lg-pill flex items-start gap-3 rounded-xl border border-line bg-surface/60 p-3.5 backdrop-blur"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-vital-soft text-vital-ink">
                  <h.icon size={15} strokeWidth={2.4} />
                </span>
                <div className="leading-snug">
                  <p className="text-xs font-bold">{t(`login.${h.key}Judul`)}</p>
                  <p className="mt-0.5 text-[11px] text-muted">{t(`login.${h.key}Isi`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div
            ref={cardRef}
            className="lg-card mx-auto w-full max-w-md rounded-3xl border border-line bg-surface/85 p-6 shadow-lift backdrop-blur-xl sm:p-8"
          >
            <h2 className="text-xl font-extrabold tracking-tight">{t('login.masukJudul')}</h2>
            <p className="mt-1 text-sm text-muted">
              {t('login.masukSub')}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="lg-field">
                <label htmlFor="email" className="label">
                  {t('login.email')}
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
                  />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-10"
                    placeholder="nama@vitalstock.id"
                  />
                </div>
              </div>

              <div className="lg-field">
                <label htmlFor="password" className="label">
                  {t('login.sandi')}
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
                  />
                  <input
                    id="password"
                    type={show ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-10 pr-11"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-faint transition-colors hover:text-ink"
                    aria-label={show ? t('login.sembunyiSandi') : t('login.lihatSandi')}
                  >
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="rounded-lg bg-danger-soft px-3 py-2 text-xs font-semibold text-danger-ink"
                >
                  {error}
                </motion.p>
              )}

              {/* animasinya lewat Framer, bukan ikut stagger .lg-field */}
              <motion.button
                type="submit"
                disabled={busy}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: busy ? 1 : 1.015 }}
                whileTap={{ scale: busy ? 1 : 0.985 }}
                className="btn-primary group w-full py-3"
              >
                {busy ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {t('login.verifikasi')}
                  </>
                ) : (
                  <>
                    {t('login.masuk')}
                    <ArrowRight
                      size={16}
                      strokeWidth={2.6}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6 border-t border-line pt-5">
              <p className="label">{t('login.akunDemo')}</p>
              <div className="mt-2 space-y-1.5">
                {demoAccounts.map((acc) => (
                  <motion.button
                    key={acc.id}
                    type="button"
                    onClick={() => useAccount(acc)}
                    whileHover={{ x: 3 }}
                    className={clsx(
                      'flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors',
                      email === acc.email
                        ? 'border-primary/40 bg-primary-soft'
                        : 'border-line bg-elevated hover:border-primary/30'
                    )}
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface text-[10px] font-bold text-primary-ink">
                      {acc.initials}
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate text-xs font-bold">{td('peran', acc.role)}</span>
                      <span className="block truncate text-[10px] text-faint">{acc.email}</span>
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
