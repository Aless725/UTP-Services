import type { Config } from 'tailwindcss'

/** Color basado en variable CSS (canales RGB) para permitir temas y opacidad. */
const v = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Celular en horizontal: poca altura.
    screens: { short: { raw: '(orientation: landscape) and (max-height: 500px)' } },
    extend: {
      colors: {
        primary: {
          DEFAULT: v('primary'),
          dark: v('primary-dark'),
          soft: v('primary-soft'),
        },
        surface: v('surface'),
        card: v('card'),
        ink: {
          DEFAULT: v('ink'),
          muted: v('ink-muted'),
          faint: v('ink-faint'),
        },
        fill: v('fill'),
        success: {
          DEFAULT: v('success'),
          soft: v('success-soft'),
        },
        info: {
          DEFAULT: v('info'),
          soft: v('info-soft'),
        },
        danger: v('primary'),
      },
      borderRadius: {
        card: '14px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      transitionTimingFunction: {
        // Curva única de toda la app: arranque rápido, frenado suave, sin rebote
        smooth: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
      },
      keyframes: {
        pageForward: {
          from: { opacity: '0', transform: 'translate3d(28px, 0, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        pageBack: {
          from: { opacity: '0', transform: 'translate3d(-28px, 0, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        slideNext: {
          from: { opacity: '0', transform: 'translate3d(24px, 0, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        slidePrev: {
          from: { opacity: '0', transform: 'translate3d(-24px, 0, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        toastOut: {
          from: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
          to: { opacity: '0', transform: 'translate3d(0, 8px, 0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
        pageIn: {
          from: { opacity: '0', transform: 'translate3d(0, 8px, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeOut: { from: { opacity: '1' }, to: { opacity: '0' } },
        sheetUp: {
          from: { opacity: '0', transform: 'translate3d(0, 24px, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        sheetDown: {
          from: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
          to: { opacity: '0', transform: 'translate3d(0, 24px, 0)' },
        },
        rise: {
          from: { opacity: '0', transform: 'translate3d(0, 10px, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        pop: {
          '0%': { opacity: '0', transform: 'scale(0.7)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        toastIn: {
          from: { opacity: '0', transform: 'translate3d(0, 12px, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
      },
      animation: {
        'page-forward': 'pageForward 0.38s cubic-bezier(0.25,0.8,0.25,1) backwards',
        'page-back': 'pageBack 0.38s cubic-bezier(0.25,0.8,0.25,1) backwards',
        'slide-next': 'slideNext 0.32s cubic-bezier(0.25,0.8,0.25,1) backwards',
        'slide-prev': 'slidePrev 0.32s cubic-bezier(0.25,0.8,0.25,1) backwards',
        'toast-out': 'toastOut 0.22s ease-in forwards',
        'pulse-soft': 'pulseSoft 1.6s ease-in-out infinite',
        'page-in': 'pageIn 0.4s cubic-bezier(0.25,0.8,0.25,1) backwards',
        'fade-in': 'fadeIn 0.25s ease-out backwards',
        'fade-out': 'fadeOut 0.2s ease-in forwards',
        'sheet-up': 'sheetUp 0.38s cubic-bezier(0.25,0.8,0.25,1) backwards',
        'sheet-down': 'sheetDown 0.22s ease-in forwards',
        rise: 'rise 0.45s cubic-bezier(0.25,0.8,0.25,1) backwards',
        pop: 'pop 0.4s cubic-bezier(0.25,0.8,0.25,1) backwards',
        'toast-in': 'toastIn 0.3s cubic-bezier(0.25,0.8,0.25,1) backwards',
      },
      fontSize: {
        title: ['1.5rem', { lineHeight: '1.2', fontWeight: '800' }],
        display: ['1.75rem', { lineHeight: '1.15', fontWeight: '800' }],
      },
    },
  },
  plugins: [],
} satisfies Config
