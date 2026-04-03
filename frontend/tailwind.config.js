/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#F5F5F5',            // Светлый фон (цвет2)
        card: '#FFFFFF',            // Белый для карточек
        primary: '#6B8F8B',         // Бирюзовый (цвет1)
        'primary-light': '#A8C5C2', // Светло-бирюзовый
        'primary-dark': '#4A6B68',  // Тёмно-бирюзовый
        dark: '#2D312E',            // Темный текст
      },
      fontFamily: {
        serif: ['Lora', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 20px 50px rgba(45, 49, 46, 0.08)',
      }
    },
  },
  plugins: [],
}