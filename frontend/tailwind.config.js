/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // ── Brand Colours ──────────────────────────────────────
      colors: {
        brand: {
          50 : '#fdf4ff',
          100: '#fae8ff',
          200: '#f3d0fe',
          300: '#e9a8fc',
          400: '#d970f8',
          500: '#c044ef',   // primary
          600: '#a321d4',
          700: '#891ab2',
          800: '#711991',
          900: '#5d1876',
          950: '#3e0b52',
        },
        accent: {
          50 : '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',   // accent orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        sky: {
          canvas: '#f0f4ff',
        },
      },

      // ── Typography ──────────────────────────────────────────
      fontFamily: {
        sans  : ['Nunito', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Nunito', 'sans-serif'],
      },

      // ── Border Radius ───────────────────────────────────────
      borderRadius: {
        '2xl' : '1rem',
        '3xl' : '1.5rem',
        '4xl' : '2rem',
      },

      // ── Box Shadow ──────────────────────────────────────────
      boxShadow: {
        'soft'   : '0 4px 24px -4px rgba(192, 68, 239, 0.15)',
        'card'   : '0 2px 16px -2px rgba(0,0,0,0.08)',
        'glow'   : '0 0 30px rgba(192, 68, 239, 0.3)',
        'glow-lg': '0 0 60px rgba(192, 68, 239, 0.25)',
      },

      // ── Animation ───────────────────────────────────────────
      animation: {
        'float'     : 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'slide-up'  : 'slideUp 0.3s ease-out',
        'fade-in'   : 'fadeIn 0.4s ease-out',
        'fly-up'    : 'flyUp 10s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%'     : { transform: 'translateY(-12px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%'     : { opacity: '0.7' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to  : { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to  : { opacity: '1' },
        },
        flyUp: {
          '0%': { transform: 'translateY(110vh) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '0.8' },
          '90%': { opacity: '0.8' },
          '100%': { transform: 'translateY(-20vh) rotate(360deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
