/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pmmg: {
          black: '#373435',
          gold: '#A08F63',
          'gold-light': '#B3A369',
          'gold-dark': '#847550',
          red: '#AB2328',
          'red-dark': '#8E1C20',
          bg: '#F8F9FA',
          border: '#DDE0E5',
          text: '#1F2421',
          muted: '#6C757D'
        }
      },
      fontFamily: {
        rawline: ['Rawline', 'Arial', 'sans-serif'],
        teko: ['Teko', 'Impact', 'sans-serif']
      }
    },
  },
  plugins: [],
}
