import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import TestResultsTab from './TestResultsTab';
import { User, BarChart3, Calendar, Award, Palette, Copy, CheckCircle, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (user?.compatibility_code) {
      navigator.clipboard.writeText(user.compatibility_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Форматируем дату регистрации
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Не указана';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Не указана';
    }
  };

  return (
    <div className="py-12 px-4" style={{ background: 'var(--bg-gradient-hero)', minHeight: '100vh' }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Личный кабинет</h1>

        <div className="flex gap-2 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className="px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition"
            style={activeTab === 'profile' ? { backgroundColor: 'var(--bg-gradient-from)', color: '#ffffff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' } : { backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
          >
            <User className="w-4 h-4 inline mr-1" /> Профиль
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className="px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition"
            style={activeTab === 'results' ? { backgroundColor: 'var(--bg-gradient-from)', color: '#ffffff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' } : { backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
          >
            <BarChart3 className="w-4 h-4 inline mr-1" /> Результаты тестов
          </button>
        </div>

        <div className="rounded-3xl shadow-2xl p-8 min-h-[400px]" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          {activeTab === 'profile' && (
            <div className="fade-in">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: isDark ? 'var(--text-primary)' : '#1F2937' }}><User className="w-6 h-6" /> Профиль</h2>
              {user ? (
                <div className="space-y-6">
                  {/* Карточка пользователя */}
                  <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{user.login}</h3>
                        <p className="text-white/70 text-sm">
                          {user.gender === 'male' ? 'Мужской' : 'Женский'} пол
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <Calendar className="w-4 h-4" />
                      Дата регистрации: <span className="text-white font-medium">{formatDate(user.created_at)}</span>
                    </div>
                  </div>

                  {/* Код совместимости */}
                  {user.compatibility_code ? (
                    <div className="rounded-2xl p-6" style={{ backgroundColor: isDark ? 'var(--bg-card-alt)' : '#F3F4F6' }}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: isDark ? 'var(--text-primary)' : '#1F2937' }}>
                          <Palette className="w-5 h-5 text-primary" />
                          Код совместимости
                        </h3>
                        <button
                          onClick={handleCopyCode}
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          {copied ? <><CheckCircle className="w-4 h-4" /> Скопировано</> : <><Copy className="w-4 h-4" /> Копировать</>}
                        </button>
                      </div>
                      <div className="rounded-xl px-4 py-3 border-2 border-dashed border-primary/30" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                        <code className="text-xl font-mono font-bold text-primary">{user.compatibility_code}</code>
                      </div>
                      <Link
                        to="/compatibility"
                        className="mt-3 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition"
                      >
                        Проверить совместимость <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Award className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-amber-800 mb-1">Тест ещё не пройден</h3>
                          <p className="text-amber-700 text-sm mb-3">
                            Пройдите тест на архетипы, чтобы получить свой код совместимости и результаты.
                          </p>
                          <Link
                            to="/test/archetypes"
                            className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-700 transition"
                          >
                            Пройти тест <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Информация о профиле */}
                  <div className="rounded-2xl p-6" style={{ backgroundColor: isDark ? 'var(--bg-card-alt)' : '#F3F4F6' }}>
                    <h3 className="text-lg font-bold mb-4" style={{ color: isDark ? 'var(--text-primary)' : '#1F2937' }}>Информация</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                        <div className="text-sm" style={{ color: isDark ? 'var(--text-muted)' : '#6B7280' }}>Логин</div>
                        <div className="font-semibold mt-1" style={{ color: isDark ? 'var(--text-primary)' : '#1F2937' }}>{user.login}</div>
                      </div>
                      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                        <div className="text-sm" style={{ color: isDark ? 'var(--text-muted)' : '#6B7280' }}>Пол</div>
                        <div className="font-semibold mt-1 capitalize" style={{ color: isDark ? 'var(--text-primary)' : '#1F2937' }}>
                          {user.gender === 'male' ? 'Мужской' : 'Женский'}
                        </div>
                      </div>
                      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                        <div className="text-sm" style={{ color: isDark ? 'var(--text-muted)' : '#6B7280' }}>Роль</div>
                        <div className="font-semibold mt-1" style={{ color: isDark ? 'var(--text-primary)' : '#1F2937' }}>
                          {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                        </div>
                      </div>
                      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                        <div className="text-sm" style={{ color: isDark ? 'var(--text-muted)' : '#6B7280' }}>Дата регистрации</div>
                        <div className="font-semibold mt-1" style={{ color: isDark ? 'var(--text-primary)' : '#1F2937' }}>{formatDate(user.created_at)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-600" style={{ color: isDark ? 'var(--text-muted)' : '#6B7280' }}>
                  <p>Вы вошли как гость</p>
                  <Link to="/login" className="text-primary hover:underline">Войти в аккаунт</Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'results' && (
            <div className="fade-in">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: isDark ? 'var(--text-primary)' : '#1F2937' }}><BarChart3 className="w-6 h-6" /> Результаты тестов</h2>
              <TestResultsTab />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
