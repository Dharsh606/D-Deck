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
        canvas: {
          950: '#07080B',
          900: '#0B0D13',
          850: '#10131B',
          800: '#161A24',
          700: '#202636',
          600: '#2F374D',
        },
        accent: {
          primary: '#6366F1',
          cyan: '#38BDF8',
          emerald: '#10B981',
          rose: '#F43F5E',
          amber: '#F59E0B',
          purple: '#A855F7',
        }
      },
      boxShadow: {
        'glass-subtle': '0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'glass-card': '0 4px 20px 0 rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'glass-button': '0 2px 8px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'glow-subtle': '0 0 20px -5px rgba(99, 102, 241, 0.3)',
      },
    },
  },
  plugins: [],
}
