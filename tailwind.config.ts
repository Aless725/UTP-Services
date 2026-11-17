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
      fontSize: {
        title: ['1.5rem', { lineHeight: '1.2', fontWeight: '800' }],
        display: ['1.75rem', { lineHeight: '1.15', fontWeight: '800' }],
      },
    },
  },
  plugins: [],
} satisfies Config
