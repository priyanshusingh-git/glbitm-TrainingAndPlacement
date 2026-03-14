import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {

      /* ── COLORS ── all wired to CSS variables ── */
      colors: {
        border:      'rgb(var(--border) / <alpha-value>)',
        input:       'rgb(var(--input) / <alpha-value>)',
        ring:        'rgb(var(--ring) / <alpha-value>)',
        background:  'rgb(var(--background) / <alpha-value>)',
        foreground:  'rgb(var(--foreground) / <alpha-value>)',

        /* shadcn semantic */
        primary: {
          DEFAULT:    'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT:    'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT:    'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT:    'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT:    'rgb(var(--destructive) / <alpha-value>)',
          foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT:    'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT:    'rgb(var(--popover) / <alpha-value>)',
          foreground: 'rgb(var(--popover-foreground) / <alpha-value>)',
        },

        /* GL Bajaj brand scale — direct access */
        brown: {
          950: 'rgb(var(--color-primary-950) / <alpha-value>)',
          900: 'rgb(var(--color-primary-900) / <alpha-value>)',
          800: 'rgb(var(--color-primary-800) / <alpha-value>)',  /* #512912 */
          700: 'rgb(var(--color-primary-700) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500) / <alpha-value>)',
          400: 'rgb(var(--color-primary-400) / <alpha-value>)',
          100: 'rgb(var(--color-primary-100) / <alpha-value>)',
          50:  'rgb(var(--color-primary-50)  / <alpha-value>)',
        },
        amber: {
          900: 'rgb(var(--color-accent-900) / <alpha-value>)',
          700: 'rgb(var(--color-accent-700) / <alpha-value>)',
          500: 'rgb(var(--color-accent-500) / <alpha-value>)',  /* #E8A020 */
          400: 'rgb(var(--color-accent-400) / <alpha-value>)',
          100: 'rgb(var(--color-accent-100) / <alpha-value>)',
        },
        cream:  'rgb(var(--color-primary-50)  / <alpha-value>)',
        sand:   'rgb(var(--color-primary-100) / <alpha-value>)',
      },

      /* ── TYPOGRAPHY ── */
      fontFamily: {
        display: ['var(--font-display)'],
        body:    ['var(--font-body)'],
        mono:    ['var(--font-mono)'],
        sans:    ['var(--font-body)'],   /* override Tailwind default */
      },

      fontSize: {
        'hero': ['clamp(2.75rem, 5.5vw, 4.75rem)', { lineHeight: '1.04', letterSpacing: '-0.03em' }],
        'h2':   ['clamp(1.875rem, 3.8vw, 3.375rem)', { lineHeight: '1.1',  letterSpacing: '-0.025em' }],
      },

      /* ── BORDER RADIUS ── */
      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        DEFAULT: 'var(--radius)',
      },

      /* ── BOX SHADOWS ── */
      boxShadow: {
        sm:    'var(--shadow-sm)',
        md:    'var(--shadow-md)',
        lg:    'var(--shadow-lg)',
        amber: 'var(--shadow-amber)',
      },

      /* ── SPACING ── extend with brand scale ── */
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },

      /* ── ANIMATIONS ── */
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        ticker: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1',  transform: 'scale(1)'   },
          '50%':      { opacity: '0.4', transform: 'scale(1.5)' },
        },
        bob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(7px)' },
        },
      },
      animation: {
        'fade-up':  'fadeUp  0.7s ease both',
        'fade-in':  'fadeIn  0.5s ease both',
        'ticker':   'ticker  28s linear infinite',
        'pulse-dot':'pulseDot 2s ease-in-out infinite',
        'bob':      'bob      2.2s ease-in-out infinite',
      },

      /* ── TRANSITIONS ── */
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      /* ── BACKGROUND IMAGES ── */
      backgroundImage: {
        'hero-gradient':
          'radial-gradient(ellipse 65% 55% at 75% 40%, rgba(232,160,32,0.10) 0%, transparent 60%), ' +
          'radial-gradient(ellipse 40% 55% at 10% 90%, rgba(58,28,11,0.6) 0%, transparent 55%)',
        'diagonal-lines':
          'repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(255,255,255,0.012) 40px, rgba(255,255,255,0.012) 41px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
