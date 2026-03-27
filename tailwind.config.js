/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#E53935',
        'primary-dark': '#B71C1C',
      }
    }
  },
  plugins: [],
}
