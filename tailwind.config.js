/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    fontFamily: {
      'playfair': ['Playfair Display'],
      'open-sans': ['Open Sans'],
    },
    extend: {
      colors: {
        customCyan: '#588B8B',
        customPurple: '#8D86C9',
        customTangerine: '#F28F3B',
        customOlive: "#30332E",
        customMarine: "#B5FED9"
      },
    },
  },
  plugins: [],
}



