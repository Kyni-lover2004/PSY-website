# Настройка API для Production

## 1. Создание файла .env

Создайте файл `.env` в корне frontend проекта:

```bash
# Production
VITE_API_URL=https://psy-website-3.onrender.com

# Development (локально)
# VITE_API_URL=http://localhost:8000
```

## 2. Переменные окружения

| Переменная | Описание | Пример |
|------------|----------|--------|
| `VITE_API_URL` | URL backend API | `https://psy-website-3.onrender.com` |

## 3. Структура файлов

``
frontend/
├── .env                  # Локальные переменные (не коммитить!)
├── .env.example          # Пример переменных (можно коммитить)
├── .gitignore            # Игнорирует .env в git
├── src/
│   ├── config/
│   │   └── api.js        # Централизованная конфигурация API
│   └── api/
│       └── api.js        # API клиенты (axios)
``

## 4. Как использовать в коде

```javascript
// ✅ Правильно: через api.js
import { consultationAPI } from './api/api';
const result = await consultationAPI.create(data);

// ✅ Правильно: через API_CONFIG
import { API_CONFIG } from '../config/api';
fetch(`${API_CONFIG.baseURL}/endpoint`);

// ❌ Неправильно: хардкодить URL
fetch('http://localhost:8000/api/...');
``

## 5. Запуск

### Development (локально)
```bash
# Установите зависимости
npm install

# Создайте .env файл
cp .env.example .env

# Запустите dev сервер
npm run dev
``

### Production (сборка)
```bash
# Установите зависимости
npm install

# Создайте .env файл с production URL
echo "VITE_API_URL=https://psy-website-3.onrender.com" > .env

# Соберите проект
npm run build

# Или используйте Docker/другой хостинг
``

## 6. Проверка

После настройки проверьте:

```bash
# Проверка, что .env существует
cat .env

# Проверка, что API_URL установлен
npm run dev
# В консоли не должно быть предупреждений
``

## 7. Безопасность

- ✅ `.env` добавлен в `.gitignore`
- ✅ Используйте `.env.example` для шаблона
- ✅ Не коммитьте реальные URL или ключи
- ✅ Для production используйте secrets/environment variables

## 8. Troubleshooting

### Ошибка: "VITE_API_URL не установлен"
- Создайте файл `.env` в корне frontend
- Добавьте строку `VITE_API_URL=...`
- Перезапустите dev сервер

### Ошибка CORS
- Убедитесь, что backend разрешает запросы с вашего домена
- Проверьте настройки CORS в FastAPI

### API не работает в production
- Проверьте, что `VITE_API_URL` установлен при сборке
- Проверьте логи в браузере (console)
- Убедитесь, что backend доступен по указанному URL
