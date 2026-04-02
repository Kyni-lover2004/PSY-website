import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TestAuthCheck = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Проверяем авторизацию
    if (!user) {
      // Пользователь не авторизован - перенаправляем на регистрацию
      navigate('/register?redirect=test');
    } else {
      // Пользователь авторизован - перенаправляем на анкету
      navigate('/test/archetypes/anketa');
    }
    setChecking(false);
  }, [user, navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default TestAuthCheck;
