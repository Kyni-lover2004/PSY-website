/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff8fa3',
        secondary: '#ff6b8a',
        accent: '#ffb3c6',
      }
    },
  },
  plugins: [],
}
