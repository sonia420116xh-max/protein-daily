/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#eafaf4', 100: '#cdf4e6', 500: '#00a874', 600: '#009966', 700: '#007b55' },
        ink: '#18302a',
        canvas: '#f6f8f4',
        line: '#e6ebe7',
        citrus: '#e8b931',
        coral: '#e66c55',
      },
      fontFamily: {
        sans: ['Avenir Next', 'PingFang SC', 'Noto Sans SC', 'sans-serif'],
      },
      boxShadow: { card: '0 8px 28px rgba(23, 55, 46, 0.07)' },
    },
  },
  plugins: [],
}
