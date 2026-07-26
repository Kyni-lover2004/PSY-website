import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserSearch, ArrowRight } from 'lucide-react';

const TestAuthCheck = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user || !token) {
      sessionStorage.setItem('redirectAfterLogin', '/test/archetypes');
      navigate('/register?redirect=test');
    }
    setChecking(false);
  }, [user, token, navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-gradient-hero)' }}>
        <div className="rounded-3xl p-8 text-center" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--bg-gradient-from)' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 px-4" style={{ background: 'var(--bg-gradient-hero)', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Тест на архетипы</h1>
          <p className="text-xl text-white/80">
            Добро пожаловать, <strong>{user?.name || user?.login}</strong>! Готовы начать?
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          {/* Карточка: Самоисследование */}
          <div
            onClick={() => navigate('/test/archetypes/anketa')}
            className="group rounded-3xl shadow-2xl p-8 cursor-pointer hover:shadow-3xl hover:scale-105 transition-all duration-300"
            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center group-hover:scale-110 transition" style={{ backgroundColor: 'var(--primary-light)' }}>
              <UserSearch className="w-8 h-8" style={{ color: 'var(--bg-gradient-from)' }} />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-center" style={{ color: 'var(--text-primary)' }}>Самоисследование</h2>
            <p className="text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
              Пройдите тест и узнайте свой ведущий архетип. Результаты будут сохранены в личном кабинете.
            </p>
            <div className="flex items-center justify-center gap-2 font-semibold group-hover:translate-x-2 transition-transform" style={{ color: 'var(--bg-gradient-from)' }}>
              Пройти тест <ArrowRight className="w-5 h-5" />
            </div>
            <div className="mt-4 text-center">
              <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--bg-gradient-from)' }}>
                ~15 минут
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAuthCheck;
