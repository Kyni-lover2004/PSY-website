import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { profileAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BarChart3, Palette, Zap, Heart, Link2, Gem, MessageCircle, Shield, AlertTriangle, Award, Trophy } from 'lucide-react';

const TestResultsTab = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedTest, setExpandedTest] = useState(null);

  useEffect(() => {
    // Сначала пробуем получить код из профиля авторизованного пользователя
    const code = user?.compatibility_code || sessionStorage.getItem('compatibilityCode');
    
    if (code) {
      profileAPI.getProfile(code)
        .then(response => {
          setResults({
            code,
            ...response.data
          });
        })
        .catch(err => {
          console.error('Ошибка загрузки профиля:', err);
          // Если ошибка 404, очищаем incompatibilityCode
          if (err.response?.status === 404) {
            sessionStorage.removeItem('compatibilityCode');
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const toggleExpand = (testId) => {
    setExpandedTest(expandedTest === testId ? null : testId);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: 'var(--bg-gradient-from)' }}></div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary-light)' }}>
          <BarChart3 className="w-8 h-8" style={{ color: 'var(--bg-gradient-from)' }} />
        </div>
        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Вы ещё не проходили тесты</p>
        <Link
          to="/test"
          className="inline-block text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition"
          style={{ backgroundColor: 'var(--bg-gradient-from)' }}
        >
          Пройти тест на архетипы
        </Link>
      </div>
    );
  }

  const archetypes = results.archetypes || [];
  const topArchetypes = archetypes.slice(0, 3);
  const allArchetypes = archetypes;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--primary-light)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Palette className="w-5 h-5" style={{ color: 'var(--bg-gradient-from)' }} /> Тест на архетипы</h3>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Код: {results.code}</span>
        </div>
        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
          Пройдено тестов: <span className="font-semibold">1</span>
        </p>

        <div className="space-y-3">
          {topArchetypes.map((arch, index) => (
            <div
              key={arch.code}
              className="flex items-center gap-4 rounded-xl p-4 shadow-sm"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <Trophy className={`w-6 h-6 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-600'}`} />
              </div>
              <div className="flex-1">
                <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{arch.name}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {arch.score} баллов • Статус: {arch.status === 'A' ? 'Активный' : arch.status === 'M' ? 'Средний' : arch.status === 'N' ? 'Неопределенный' : 'Пассивный'}
                </div>
              </div>
              <div
                className="w-4 h-4 rounded-full shadow"
                style={{ backgroundColor: arch.color }}
                title={arch.name}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => toggleExpand('archetypes')}
          className="mt-4 w-full py-3 rounded-xl font-semibold hover:shadow-lg transition"
          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--bg-gradient-from)' }}
        >
          {expandedTest === 'archetypes' ? 'Свернуть' : 'Показать все результаты'}
        </button>
      </div>

      {expandedTest === 'archetypes' && (
      <div className="rounded-2xl shadow-lg p-6 fade-in" style={{ backgroundColor: 'var(--bg-card)' }}>
        <h4 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Все архетипы</h4>
          <div className="space-y-4">
            {allArchetypes.map((arch, index) => (
              <div
                key={arch.code}
                className="border rounded-xl p-4 hover:shadow-md transition"
                style={{ borderColor: isDark ? 'var(--border-color)' : '#e5e7eb' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: arch.color }}
                    />
                    <div>
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{arch.name}</div>
                      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Код: {arch.code} • Чакра: {arch.chakra ? `${arch.chakra}-я` : 'Н/Д'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: 'var(--bg-gradient-from)' }}>{arch.score}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>баллов</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      arch.status === 'A' ? (isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700') :
                      arch.status === 'M' ? (isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700') :
                      arch.status === 'N' ? (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-700') :
                      (isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700')
                    }`}>
                      {arch.status === 'A' ? 'Активный' :
                       arch.status === 'M' ? 'Средний' :
                       arch.status === 'N' ? 'Неопределенный' : 'Пассивный'}
                    </div>
                  </div>
                </div>

                {arch.description && (
                  <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: isDark ? 'var(--bg-card-alt)' : '#f9fafb' }}>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{arch.description}</p>
                  </div>
                )}

                {arch.strengths && (
                  <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: isDark ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.05)' }}>
                    <div className="text-sm font-semibold mb-1 flex items-center gap-1" style={{ color: isDark ? '#86efac' : '#166534' }}><Shield className="w-3 h-3" /> Сильные стороны:</div>
                    <p className="text-sm" style={{ color: isDark ? '#4ade80' : '#15803d' }}>{arch.strengths}</p>
                  </div>
                )}

                {arch.weaknesses && (
                  <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--disclaimer-bg)' }}>
                    <div className="text-sm font-semibold mb-1 flex items-center gap-1" style={{ color: 'var(--disclaimer-text)' }}><AlertTriangle className="w-3 h-3" /> Зоны роста:</div>
                    <p className="text-sm" style={{ color: 'var(--disclaimer-text)' }}>{arch.weaknesses}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl p-6" style={{ backgroundColor: isDark ? 'var(--bg-card-alt)' : '#f9fafb' }}>
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Другие тесты</h3>
        <div className="space-y-3">
          {[
            { id: 'temperament', name: 'Тест на темперамент', icon: Zap, status: 'available' },
            { id: 'love-language', name: 'Языки любви', icon: Heart, status: 'available' },
            { id: 'attachment', name: 'Тип привязанности', icon: Link2, status: 'available' },
            { id: 'values', name: 'Ценности в отношениях', icon: Gem, status: 'available' },
            { id: 'communication', name: 'Стиль коммуникации', icon: MessageCircle, status: 'available' },
          ].map((test) => (
            <div
              key={test.id}
              className="flex items-center justify-between rounded-xl p-4"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-light)' }}>
                  <test.icon className="w-5 h-5" style={{ color: 'var(--bg-gradient-from)' }} />
                </div>
                <div>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{test.name}</div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Доступен для прохождения</div>
                </div>
              </div>
              <Link
                to="/tests"
                className="px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition"
                style={{ backgroundColor: 'var(--primary-light)', color: 'var(--bg-gradient-from)' }}
              >
                Пройти
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestResultsTab;
