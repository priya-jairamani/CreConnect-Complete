/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ── Brand purple system ── */
        brand: {
          400: 'var(--brand-400)',
          500: 'var(--brand-500)',
          600: '#5a49e8',
          700: 'var(--brand-700)',
        },
        /* ── Theme-aware surfaces (driven by CSS variables) ── */
        bg:       'var(--bg)',
        surface:  'var(--surface)',
        surface2: 'var(--surface-2)',
        /* ── Semantic ── */
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger:  'var(--danger)',
        accent:  'var(--accent)',
        /* ── Foreground ── */
        fg:      'var(--fg)',
        'fg-muted': 'var(--fg-muted)',
        /* ── Border ── */
        'border-subtle': 'var(--border)',
        /* ── Legacy navy/cream (kept for backward compat) ── */
        navy: {
          950: '#000f20',
          900: '#0a0b14',
          800: '#12131f',
          700: '#1c1e30',
          600: '#2a2d45',
          500: '#4d85a8',
          400: '#6a9ab0',
          300: '#9aa1b6',
          200: '#c5cde0',
          100: '#d4e7ee',
          50:  '#edf5f9',
        },
        cream: {
          300: '#d4b896',
          200: '#857fff',
          100: '#a89fff',
          50:  '#f9f5ee',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora',  'system-ui', 'sans-serif'],
      },
      fontSize: {
        '5xl': ['3rem',   { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        '6xl': ['3.75rem',{ lineHeight: '1',    letterSpacing: '-0.02em' }],
        '7xl': ['4.5rem', { lineHeight: '1',    letterSpacing: '-0.025em' }],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      boxShadow: {
        'brand-sm': '0 4px 20px -4px rgba(109,92,255,0.4)',
        'brand-md': '0 8px 30px -8px rgba(109,92,255,0.5)',
        'brand-lg': '0 16px 60px -12px rgba(109,92,255,0.55)',
        'glass':    '0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card':     '0 1px 2px rgba(0,0,0,0.25)',
        'card-lg':  '0 8px 32px rgba(0,0,0,0.35)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #6d5cff, #4c2dd1)',
        'brand-gradient-r': 'linear-gradient(120deg, #857fff, #4c2dd1)',
        'mesh-1': 'radial-gradient(60% 60% at 18% 12%, rgba(109,92,255,.22) 0, transparent 62%), radial-gradient(48% 48% at 88% 18%, rgba(245,158,11,.12) 0, transparent 58%), radial-gradient(50% 50% at 70% 95%, rgba(76,45,209,.18) 0, transparent 60%)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'drawer-in': {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.4' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up':         'fade-up .5s cubic-bezier(.22,1,.36,1) both',
        'fade-up-delay':   'fade-up .5s .15s cubic-bezier(.22,1,.36,1) both',
        'fade-in':         'fade-in .3s ease both',
        'slide-in-right':  'slide-in-right .4s cubic-bezier(.22,1,.36,1) both',
        'drawer-in':       'drawer-in .35s cubic-bezier(.22,1,.36,1) both',
        shimmer:           'shimmer 1.8s linear infinite',
        'pulse-slow':      'pulse 2s ease-in-out infinite',
        'spin-slow':       'spin-slow 3s linear infinite',
        float:             'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
