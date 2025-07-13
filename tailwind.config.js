/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  safelist: [
    // Dynamic color classes for content types and status badges
    {
      pattern: /bg-(blue|green|purple|yellow|gray|indigo|red|teal|orange)-(50|100|500|600|700|800|900)/,
    },
    {
      pattern: /text-(blue|green|purple|yellow|gray|indigo|red|teal|orange)-(50|100|500|600|700|800|900)/,
    },
    {
      pattern: /border-(blue|green|purple|yellow|gray|indigo|red|teal|orange)-(50|100|500|600|700|800|900)/,
    },
    // Dark mode variants
    {
      pattern: /dark:bg-(blue|green|purple|yellow|gray|indigo|red|teal|orange)-(50|100|500|600|700|800|900)/,
    },
    {
      pattern: /dark:text-(blue|green|purple|yellow|gray|indigo|red|teal|orange)-(50|100|500|600|700|800|900)/,
    },
    {
      pattern: /dark:border-(blue|green|purple|yellow|gray|indigo|red|teal|orange)-(50|100|500|600|700|800|900)/,
    },
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
        'glass-dark': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0))',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}