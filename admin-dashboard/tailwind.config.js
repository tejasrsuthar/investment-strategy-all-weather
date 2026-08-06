/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        forest: {
          DEFAULT: '#0F2522',
          hover: '#0a1917',
          dark: '#07100F',
        },
        lime: {
          DEFAULT: '#CBE743',
          hover: '#b9d435',
        },
        sage: {
          DEFAULT: '#EDEEE9',
          hover: '#E3E5DC',
        },
        sand: '#FAF9F6',
        bordercolor: '#E2E4DC',
        textmuted: '#5E6967',
      }
    },
  },
  plugins: [],
}
