import { createClient } from '@supabase/supabase-js';

// Данные проекта Supabase. Anon-ключ — публичный (он в любом случае
// виден в собранном бандле), доступ к данным ограничивают RLS-политики.
const DEFAULT_URL = 'https://yeswihnahnfcwkozmnhl.supabase.co';
const DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllc3dpaG5haG5mY3drb3ptbmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNzk5NDgsImV4cCI6MjEwMDY1NTk0OH0.YyznuyAB9F1WlMrhwqNsY1cso5fElPHikukjWMAEvPc';

// Переменные окружения (если заданы корректно) имеют приоритет.
// Частые ошибки в URL исправляются автоматически.
function resolveUrl(raw) {
  if (!raw) return DEFAULT_URL;
  const value = String(raw).trim().replace(/\/+$/, '');

  // Вставили ссылку на панель: https://supabase.com/dashboard/project/<ref>
  const dashboard = value.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dashboard) return `https://${dashboard[1]}.supabase.co`;

  if (/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(value)) return value;

  console.warn(`VITE_SUPABASE_URL выглядит неверно ("${value}"), используется адрес по умолчанию`);
  return DEFAULT_URL;
}

function resolveKey(raw) {
  const value = String(raw || '').trim();
  return value.startsWith('eyJ') || value.startsWith('sb_publishable_') ? value : DEFAULT_ANON_KEY;
}

const supabaseUrl = resolveUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = resolveKey(import.meta.env.VITE_SUPABASE_ANON_KEY);

// Штатная блокировка supabase (navigator.locks) иногда залипает: одна
// незавершённая операция авторизации вешает все последующие — вход, выход,
// обновление токена — и висят они бесконечно. Ждём блокировку ограниченное
// время, после чего выполняем операцию без неё.
const LOCK_TIMEOUT_MS = 5000;

async function lockWithTimeout(name, _acquireTimeout, fn) {
  if (typeof navigator === 'undefined' || !navigator.locks?.request) return fn();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOCK_TIMEOUT_MS);
  try {
    return await navigator.locks.request(name, { signal: controller.signal }, fn);
  } catch (error) {
    if (error?.name === 'AbortError') {
      console.warn('Блокировка авторизации не освободилась, продолжаем без неё');
      return fn();
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    lock: lockWithTimeout,
  },
});

export default supabase;
