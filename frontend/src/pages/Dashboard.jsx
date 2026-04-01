import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../api/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // В реальном приложении нужно получить профиль пользователя из API
    // Здесь используем код из sessionStorage для демонстрации
    const code = sessionStorage.getItem('compatibilityCode');
    if (code) {
      profileAPI.getProfile(code)
        .then(response => setProfile(response.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Личный кабинет</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Профиль пользователя */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">👤 Профиль</h2>
            {user ? (
              <div className="space-y-4">
                <div>
                  <div className="text-gray-500 text-sm">Имя</div>
                  <div className="text-gray-800 font-semibold">{user.name}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Email</div>
                  <div className="text-gray-800 font-semibold">{user.email}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Пол</div>
                  <div className="text-gray-800 font-semibold capitalize">{user.gender}</div>
                </div>
              </div>
            ) : (
              <div className="text-gray-600">
                <p>Вы вошли как гость</p>
                <Link to="/login" className="text-primary hover:underline">Войти в аккаунт</Link>
              </div>
            )}
          </div>

          {/* Код совместимости */}
          <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl shadow-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">💕 Код совместимости</h2>
            {sessionStorage.getItem('compatibilityCode') ? (
              <>
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 mb-4">
                  <p className="text-2xl font-mono font-bold tracking-wider">
                    {sessionStorage.getItem('compatibilityCode')}
                  </p>
                </div>
                <p className="text-white/80 text-sm">
                  Поделитесь этим кодом с партнёром для проверки совместимости
                </p>
              </>
            ) : (
              <div className="text-white/80">
                <p className="mb-4">Пройдите тест, чтобы получить код совместимости</p>
                <Link to="/test" className="inline-block bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition">
                  Пройти тест
                </Link>
              </div>
            )}
          </div>

          {/* Результаты тестов */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Результаты тестов</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : profile ? (
              <div className="space-y-4">
                {profile.archetypes.slice(0, 3).map((arch, i) => (
                  <div key={arch.code} className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                    <div className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{arch.name}</div>
                      <div className="text-sm text-gray-500">{arch.score} баллов</div>
                    </div>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: arch.color }}
                    />
                  </div>
                ))}
                <Link
                  to={`/test/results/${sessionStorage.getItem('compatibilityCode')}`}
                  className="inline-block text-primary font-semibold hover:underline"
                >
                  Показать все результаты →
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Вы ещё не проходили тесты</p>
                <Link to="/test" className="inline-block bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition">
                  Пройти тест
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
