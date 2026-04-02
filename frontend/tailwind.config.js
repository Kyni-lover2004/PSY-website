/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Основной мягкий фон (вместо чисто белого)
        base: '#FDFBFA',
        // Приглушенный зеленый (успокаивает, ассоциируется с ростом)
        primary: '#7C9082',
        // Мягкий серо-голубой (интеллект и глубина)
        secondary: '#9BAEBC',
        // Теплый бежевый для акцентов
        accent: '#D7C4B7',
        // Глубокий серый для текста (мягче, чем черный)
        'text-dark': '#3A3D3B',
      },
      boxShadow: {
        // Очень мягкая "воздушная" тень для карточек
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '1rem',
      }
    },
  },
  plugins: [],
}