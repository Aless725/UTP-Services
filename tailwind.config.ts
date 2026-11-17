import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#B50D30',
          dark: '#8F0A26',
          soft: '#FBE9EE',
        },
        surface: '#F2F2F7',
        card: '#FFFFFF',
        ink: {
          DEFAULT: '#0A0A0A',
          muted: '#6B6B70',
          faint: '#C7C7CC',
        },
        success: {
          DEFAULT: '#12A150',
          soft: '#E4F6EC',
        },
        info: {
          DEFAULT: '#2F6FED',
          soft: '#E6EEFD',
        },
        danger: '#B50D30',
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.06)',
        float: '0 8px 24px rgba(0,0,0,0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      keyframes: {
        pageIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeOut: { from: { opacity: '1' }, to: { opacity: '0' } },
        sheetUp: {
          from: { opacity: '0', transform: 'translateY(24px) scale(0.98)' },
          to: { opacity: '1', transform: 'none' },
        },
        sheetDown: {
          from: { opacity: '1', transform: 'none' },
          to: { opacity: '0', transform: 'translateY(24px) scale(0.98)' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'none' },
        },
        pop: {
          '0%': { opacity: '0', transform: 'scale(0.6)' },
          '60%': { opacity: '1', transform: 'scale(1.12)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        toastIn: {
          from: { opacity: '0', transform: 'translateY(12px) scale(0.96)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        'page-in': 'pageIn 0.35s cubic-bezier(0.22,1,0.36,1) backwards',
        'fade-in': 'fadeIn 0.2s ease-out backwards',
        'fade-out': 'fadeOut 0.2s ease-in forwards',
        'sheet-up': 'sheetUp 0.32s cubic-bezier(0.22,1,0.36,1) backwards',
        'sheet-down': 'sheetDown 0.2s ease-in forwards',
        rise: 'rise 0.45s cubic-bezier(0.22,1,0.36,1) backwards',
        pop: 'pop 0.45s cubic-bezier(0.34,1.56,0.64,1) backwards',
        'toast-in': 'toastIn 0.28s cubic-bezier(0.22,1,0.36,1) backwards',
      },
      fontSize: {
        title: ['1.5rem', { lineHeight: '1.2', fontWeight: '800' }],
        display: ['1.75rem', { lineHeight: '1.15', fontWeight: '800' }],
      },
    },
  },
  plugins: [],
} satisfies Config
