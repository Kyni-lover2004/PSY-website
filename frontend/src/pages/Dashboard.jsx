import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TestResultsTab from './TestResultsTab';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="py-12 px-4" style={{ background: 'linear-gradient(135deg, #6B8F8B 0%, #4A6B68 100%)', minHeight: '100vh' }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Личный кабинет</h1>

        {/* Вкладки */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition ${
              activeTab === 'profile'
                ? 'bg-white text-primary shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            👤 Профиль
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition ${
              activeTab === 'results'
                ? 'bg-white text-primary shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            📊 Результаты тестов
          </button>
          <button
            onClick={() => setActiveTab('compatibility')}
            className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition ${
              activeTab === 'compatibility'
                ? 'bg-white text-primary shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            💕 Совместимость
          </button>
        </div>

        {/* Содержимое вкладок */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 min-h-[400px]">
          {activeTab === 'profile' && (
            <div className="fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">👤 Профиль</h2>
              {user ? (
                <div className="space-y-4 max-w-md">
                  <div>
                    <div className="text-gray-500 text-sm">Логин</div>
                    <div className="text-gray-800 font-semibold">{user.login}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-sm">Пол</div>
                    <div className="text-gray-800 font-semibold capitalize">
                      {user.gender === 'male' ? 'Мужской' : 'Женский'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-600">
                  <p>Вы вошли как гость</p>
                  <Link to="/login" className="text-primary hover:underline">Войти в аккаунт</Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'results' && (
            <div className="fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Результаты тестов</h2>
              <TestResultsTab />
            </div>
          )}

          {activeTab === 'compatibility' && (
            <div className="fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">💕 Совместимость</h2>
              <CompatibilityTab />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Компонент вкладки совместимости
const CompatibilityTab = () => {
  const compatibilityCode = sessionStorage.getItem('compatibilityCode');

  if (!compatibilityCode) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💕</div>
        <p className="text-gray-600 mb-4">Пройдите тест, чтобы получить код совместимости</p>
        <Link
          to="/test"
          className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition"
        >
          Пройти тест
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-primary rounded-2xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">Ваш код совместимости</h3>
        <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 mb-4">
          <p className="text-3xl font-mono font-bold tracking-wider text-center">
            {compatibilityCode}
          </p>
        </div>
        <p className="text-white/90 text-center">
          Поделитесь этим кодом с партнёром для проверки совместимости
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Как проверить совместимость?</h4>
        <ol className="space-y-3 text-gray-700">
          <li className="flex items-start gap-3">
            <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
            <span>Попросите партнёра пройти тест на архетипы</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
            <span>Получите от него код совместимости</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
            <span>Перейдите в раздел "Проверка совместимости" и введите оба кода</span>
          </li>
        </ol>
        <Link
          to="/compatibility"
          className="mt-6 inline-block bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition"
        >
          Проверить совместимость →
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
