// Конфигурация API для frontend
// Использует переменную окружения VITE_API_URL

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000, // 30 секунд
};

// Проверка, что переменная окружения установлена
if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
  console.warn('⚠️ VITE_API_URL не установлен. Используется /api по умолчанию.');
}

if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  console.error('❌ VITE_API_URL должен быть установлен в production!');
}

export default API_CONFIG;
