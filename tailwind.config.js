/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        deck: {
          950: '#06080d',
          900: '#0b0f19',
          850: '#111726',
          800: '#182035',
          700: '#232e4a',
          600: '#324269',
          500: '#485e94',
        },
        neon: {
          cyan: '#00f2fe',
          blue: '#4facfe',
          purple: '#b827fc',
          magenta: '#f107a3',
          emerald: '#10b981',
          amber: '#fbbf24',
          rose: '#f43f5e',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 15px -3px rgba(0, 242, 254, 0.4)',
        'glow-blue': '0 0 15px -3px rgba(79, 172, 254, 0.4)',
        'glow-purple': '0 0 15px -3px rgba(184, 39, 252, 0.4)',
        'glow-emerald': '0 0 15px -3px rgba(16, 185, 129, 0.4)',
        'deck-card': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 2s ease-in-out infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      }
    },
  },
  plugins: [],
}
