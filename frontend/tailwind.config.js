/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        credora: {
          dark: '#031D16',
          deep: '#062E23',
          card: '#0B3B2F',
          surface: '#0F4C3A',
          gold: '#D4AF37',
          goldHover: '#C29F2B',
          accent: '#E5C158',
          green: '#00A859',
          lightGreen: '#E8F8F0',
          textDark: '#101828',
          textMuted: '#667085',
          bgLight: '#F4F7F6'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
