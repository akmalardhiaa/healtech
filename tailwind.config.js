/** @type {import('tailwindcss').Config} */
const withVar = (name) => `hsl(var(${name}) / <alpha-value>)`

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        canvas: withVar('--canvas'),
        surface: withVar('--surface'),
        elevated: withVar('--elevated'),
        line: withVar('--line'),
        ink: withVar('--ink'),
        muted: withVar('--muted'),
        faint: withVar('--faint'),
        primary: {
          DEFAULT: withVar('--primary'),
          soft: withVar('--primary-soft'),
          ink: withVar('--primary-ink'),
        },
        vital: {
          DEFAULT: withVar('--vital'),
          soft: withVar('--vital-soft'),
          ink: withVar('--vital-ink'),
        },
        warn: {
          DEFAULT: withVar('--warn'),
          soft: withVar('--warn-soft'),
          ink: withVar('--warn-ink'),
        },
        danger: {
          DEFAULT: withVar('--danger'),
          soft: withVar('--danger-soft'),
          ink: withVar('--danger-ink'),
        },
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 2px hsl(var(--shadow) / 0.06), 0 8px 24px -12px hsl(var(--shadow) / 0.18)',
        lift: '0 2px 4px hsl(var(--shadow) / 0.06), 0 24px 48px -20px hsl(var(--shadow) / 0.28)',
        glow: '0 0 0 1px hsl(var(--primary) / 0.28), 0 12px 40px -12px hsl(var(--primary) / 0.45)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.85)', opacity: '0.7' },
          '70%': { transform: 'scale(1.9)', opacity: '0' },
          '100%': { transform: 'scale(1.9)', opacity: '0' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        dash: {
          to: { strokeDashoffset: '-24' },
        },
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        pulseRing: 'pulseRing 2.4s cubic-bezier(0.24, 0.6, 0.35, 1) infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        dash: 'dash 0.9s linear infinite',
        sweep: 'sweep 4s linear infinite',
      },
    },
  },
  plugins: [],
}
