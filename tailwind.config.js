/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        background: '#0A0E1A',
        surface: {
          DEFAULT: '#0F1629',
          low: '#0E1320',
          high: '#141B30',
          highest: '#1A1F2F',
        },
        brand: {
          primary: '#2563EB',
          secondary: '#7C3AED',
          emerald: '#10B981',
          amber: '#F59E0B',
          red: '#EF4444',
        },
        text: {
          primary: '#F0F4FF',
          secondary: '#8B9CC8',
          muted: '#4A5578',
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #2563EB, #7C3AED)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(37, 99, 235, 0.15)',
        'glow-emerald': '0 0 15px rgba(16, 185, 129, 0.2)',
      }
    },
  },
  plugins: [],
}
