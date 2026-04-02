/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#764ba2',
        secondary: '#667eea',
        accent: '#a78bfa',
      }
    },
  },
  plugins: [],
}
