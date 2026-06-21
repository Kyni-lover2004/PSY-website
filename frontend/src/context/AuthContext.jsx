import { useState, createContext, useContext, useEffect, useCallback } from 'react';
import { authAPI } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuthStorage = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

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
      localStorage.setItem('token', accessToken);
      setToken(accessToken);
    }

    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);

    const storedCode = sessionStorage.getItem('compatibilityCode');
    if (storedCode && !normalizedUser.compatibility_code) {
      const updatedUser = { ...normalizedUser, compatibility_code: storedCode };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  }, []);

  const logout = useCallback(async ({ skipRequest = false } = {}) => {
    if (!skipRequest) {
      try {
        await authAPI.logout();
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }

    clearAuthStorage();
    clearSessionData();
    setToken(null);
    setUser(null);
  }, [clearAuthStorage, clearSessionData]);

  const restoreSession = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!storedToken) {
      try {
        const refreshResponse = await authAPI.refresh();
        const refreshedUser = {
          ...refreshResponse.data.user,
          compatibility_code: refreshResponse.data.compatibility_code,
        };
        applyUser(refreshedUser, refreshResponse.data.access_token);
        return;
      } catch {
        clearAuthStorage();
        clearSessionData();
        setToken(null);
        setUser(null);
        return;
      }
    }

    setToken(storedToken);

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        clearAuthStorage();
      }
    }

    try {
      const response = await authAPI.me();
      const serverUser = {
        ...response.data.user,
        compatibility_code: response.data.compatibility_code,
      };
      applyUser(serverUser);
    } catch (error) {
      try {
        const refreshResponse = await authAPI.refresh();
        const refreshedUser = {
          ...refreshResponse.data.user,
          compatibility_code: refreshResponse.data.compatibility_code,
        };
        applyUser(refreshedUser, refreshResponse.data.access_token);
      } catch (refreshError) {
        console.error('Session restore failed:', error, refreshError);
        await logout({ skipRequest: true });
      }
    }
  }, [applyUser, clearAuthStorage, clearSessionData, logout]);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      await restoreSession();
      if (isMounted) {
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [restoreSession]);

  const login = (userData, accessToken) => {
    clearSessionData();
    applyUser(userData, accessToken);
  };

  const updateUserCompatibilityCode = (code) => {
    if (!user) return;

    const updatedUser = { ...user, compatibility_code: code };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    sessionStorage.setItem('compatibilityCode', code);
  };

  const isAdmin = () => user && user.role === 'admin';

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    </div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, updateUserCompatibilityCode, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
