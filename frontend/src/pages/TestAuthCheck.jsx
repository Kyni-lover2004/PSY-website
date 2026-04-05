import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserSearch, Heart, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

const TestAuthCheck = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [checking, setChecking] = useState(true);
  const [hasResults, setHasResults] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      sessionStorage.setItem('redirectAfterLogin', '/test/archetypes');
      navigate('/register?redirect=test');
    } else {
      // Проверяем есть ли у пользователя результаты теста
      setHasResults(!!user.compatibility_code);
    }
    setChecking(false);
  }, [user, token, navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6B8F8B 0%, #4A6B68 100%)' }}>
        <div className="bg-white rounded-3xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #6B8F8B 0%, #4A6B68 100%)', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Тест на архетипы</h1>
          <p className="text-xl text-white/80">
            Добро пожаловать, <strong>{user?.name || user?.login}</strong>! Что вы хотите сделать?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Карточка: Самоисследование */}
          <div
            onClick={() => navigate('/test/archetypes/anketa')}
            className="group bg-white rounded-3xl shadow-2xl p-8 cursor-pointer hover:shadow-3xl hover:scale-105 transition-all duration-300"
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition">
              <UserSearch className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3 text-center">Самоисследование</h2>
            <p className="text-gray-600 text-center mb-6">
              Пройдите тест и узнайте свой ведущий архетип. Результаты будут сохранены в личном кабинете.
            </p>
            <div className="flex items-center justify-center gap-2 text-primary font-semibold group-hover:translate-x-2 transition-transform">
              Пройти тест <ArrowRight className="w-5 h-5" />
            </div>
            <div className="mt-4 text-center">
              <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                ~15 минут
              </span>
            </div>
          </div>

          {/* Карточка: Проверка совместимости */}
          <div
            onClick={() => {
              if (hasResults) {
                navigate(`/compatibility?mycode=${user.compatibility_code}`);
              } else {
                alert('Сначала пройдите тест на архетипы, чтобы получить свой код совместимости.');
                navigate('/test/archetypes/anketa');
              }
            }}
            className={`group bg-white rounded-3xl shadow-2xl p-8 cursor-pointer hover:shadow-3xl hover:scale-105 transition-all duration-300 ${
              !hasResults ? 'opacity-80' : ''
            }`}
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-pink-50 rounded-2xl flex items-center justify-center group-hover:bg-pink-100 transition">
              <Heart className="w-8 h-8 text-pink-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3 text-center">Проверка совместимости</h2>
            <p className="text-gray-600 text-center mb-6">
              {hasResults
                ? `Ваш код: ${user.compatibility_code}. Введите код партнёра для проверки совместимости.`
                : 'Сначала пройдите тест, чтобы получить свой код совместимости.'}
            </p>
            <div className="flex items-center justify-center gap-2 text-pink-500 font-semibold group-hover:translate-x-2 transition-transform">
              {hasResults ? (
                <>Проверить <ArrowRight className="w-5 h-5" /></>
              ) : (
                <>Сначала тест <ArrowRight className="w-5 h-5" /></>
              )}
            </div>
            <div className="mt-4 text-center">
              {hasResults ? (
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium flex items-center gap-1 justify-center">
                  <CheckCircle className="w-3 h-3" /> Тест пройден
                </span>
              ) : (
                <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-medium flex items-center gap-1 justify-center">
                  <Loader2 className="w-3 h-3" /> Тест не пройден
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAuthCheck;
