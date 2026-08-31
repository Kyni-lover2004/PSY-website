import { useState, createContext, useContext, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { authAPI } from '../api/api';

const AuthContext = createContext(null);

const AUTH_INIT_TIMEOUT_MS = 8000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSessionData = useCallback(() => {
    sessionStorage.removeItem('testData');
    sessionStorage.removeItem('sessionId');
    sessionStorage.removeItem('compatibilityCode');
  }, []);

  const applyUser = useCallback((userData, accessToken = null) => {
    const normalizedUser = {
      ...userData,
      compatibility_code: userData.compatibility_code ?? null,
    };

    if (accessToken) {
      setToken(accessToken);
    }
    setUser(normalizedUser);

    const storedCode = sessionStorage.getItem('compatibilityCode');
    if (storedCode && !normalizedUser.compatibility_code) {
      setUser({ ...normalizedUser, compatibility_code: storedCode });
    }
  }, []);

  const logout = useCallback(async ({ skipRequest = false } = {}) => {
    // Сначала выходим локально: если запрос к Supabase зависнет, пользователь
    // всё равно окажется разлогинен, а не останется ждать неизвестно чего.
    clearSessionData();
    setToken(null);
    setUser(null);

    if (!skipRequest) {
      try {
        await authAPI.logout();
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }
  }, [clearSessionData]);

  useEffect(() => {
    let isMounted = true;
    let settled = false;

    const finishLoading = () => {
      if (!isMounted || settled) return;
      settled = true;
      setLoading(false);
    };

    // Предохранитель: если Supabase не ответит (холодный старт, плохая сеть,
    // зависшая блокировка обновления токена), приложение не должно навсегда
    // остаться в состоянии загрузки.
    const timeoutId = setTimeout(finishLoading, AUTH_INIT_TIMEOUT_MS);

    const initAuth = async () => {
      try {
        const response = await authAPI.me();
        if (!isMounted) return;
        applyUser(
          { ...response.data.user, compatibility_code: response.data.compatibility_code },
          response.data.access_token
        );
      } catch {
        // не авторизован — это нормальное состояние
      } finally {
        clearTimeout(timeoutId);
        finishLoading();
      }
    };

    initAuth();

    // Следим за обновлением/протуханием токена Supabase
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_OUT') {
        setToken(null);
        setUser(null);
      } else if (session?.access_token) {
        setToken(session.access_token);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription?.subscription?.unsubscribe?.();
    };
  }, [applyUser]);

  const login = (userData, accessToken) => {
    clearSessionData();
    applyUser(userData, accessToken);
  };

  const updateUserCompatibilityCode = (code) => {
    if (!user) return;
    setUser({ ...user, compatibility_code: code });
    sessionStorage.setItem('compatibilityCode', code);
  };

  const isAdmin = () => user && user.role === 'admin';

  // Приложение рендерится сразу: публичные страницы не должны ждать проверку
  // сессии. Ожидание берут на себя ProtectedRoute и AdminRoute через loading.
  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, updateUserCompatibilityCode, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
