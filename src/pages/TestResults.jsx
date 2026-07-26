import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileAPI } from '../api/api';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Trophy, Shield, AlertTriangle, Download, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const TestResults = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { isDark } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  useEffect(() => {
    console.log('TestResults - загрузка профиля для кода:', code);
    
    if (!code) {
      setError('Код результата не найден');
      setLoading(false);
      return;
    }
    
    const fetchProfile = async () => {
      try {
        setError(null);
        setErrorDetails(null);
        const response = await profileAPI.getProfile(code);
        console.log('TestResults - профиль загружен:', response.data);
        setProfile(response.data);
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        const status = error.response?.status;
        const detail = error.response?.data?.detail || error.message;
        setError(status === 404 ? 'Профиль не найден' : status === 400 ? 'Неверный формат кода' : 'Ошибка загрузки');
        setErrorDetails(detail);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-gradient-hero)' }}>
        <div className="rounded-3xl p-8 text-center" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--bg-gradient-from)' }}></div>
          <div className="text-xl" style={{ color: 'var(--text-primary)' }}>Загрузка результатов...</div>
          <div className="text-sm mt-2 font-mono" style={{ color: 'var(--text-muted)' }}>{code}</div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-gradient-hero)' }}>
        <div className="rounded-3xl p-8 text-center max-w-md" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{error || 'Ошибка'}</h2>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Проверьте код результата</p>
          <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: isDark ? 'var(--bg-card-alt)' : '#f3f4f6' }}>
            <code className="text-sm break-all" style={{ color: 'var(--text-secondary)' }}>{code || 'Код не получен'}</code>
          </div>
          {errorDetails && (
            <div className="rounded-lg p-3 mb-4 text-left" style={{ backgroundColor: 'var(--disclaimer-bg)' }}>
              <p className="text-sm font-mono break-all" style={{ color: 'var(--disclaimer-text)' }}>{errorDetails}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => { setLoading(true); setError(null); setErrorDetails(null); window.location.reload(); }}
              className="flex-1 px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition"
              style={{ backgroundColor: isDark ? 'var(--bg-card-alt)' : '#f3f4f6', color: 'var(--text-secondary)' }}
            >
              🔄 Повторить
            </button>
            <button
              onClick={() => navigate('/test')}
              className="flex-1 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition"
              style={{ backgroundColor: 'var(--bg-gradient-from)' }}
            >
              Пройти заново
            </button>
          </div>
        </div>
      </div>
    );
  }

  const chartData = profile.archetypes.map(arch => ({
    subject: arch.name.split(' ')[0],
    A: arch.score,
    fullMark: 5,
    color: arch.color
  }));

  const dominantArchetype = profile.archetypes[0];

  return (
    <div className="py-12 px-4" style={{ background: 'var(--bg-gradient-hero)', minHeight: '100vh' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 fade-in">
          <h1 className="text-4xl font-bold text-white mb-2">Ваши результаты</h1>
          <p className="text-white/80">Код результата: <span className="font-mono font-bold">{code}</span></p>
        </div>

        {dominantArchetype && (
          <div className="rounded-3xl shadow-2xl p-8 mb-8 fade-in" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(202, 138, 4, 0.1)' }}>
                <Trophy className="w-8 h-8" style={{ color: '#ca8a04' }} />
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: dominantArchetype.color }}>
                {dominantArchetype.name}
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                {dominantArchetype.score} из 5 баллов • Статус: {
                  dominantArchetype.status === 'A' ? 'Активный' :
                  dominantArchetype.status === 'M' ? 'Средний' :
                  dominantArchetype.status === 'N' ? 'Неопределенный' : 'Пассивный'
                }
              </p>
            </div>

            {dominantArchetype.description && (
              <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: isDark ? 'var(--bg-card-alt)' : '#f9fafb' }}>
                <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{dominantArchetype.description}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {dominantArchetype.strengths && (
                <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                  <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: '#166534' }}><Shield className="w-4 h-4" /> Сильные стороны</h3>
                  <p style={{ color: '#15803d' }}>{dominantArchetype.strengths}</p>
                </div>
              )}
              {dominantArchetype.weaknesses && (
                <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--disclaimer-bg)' }}>
                  <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--disclaimer-text)' }}><AlertTriangle className="w-4 h-4" /> Зоны роста</h3>
                  <p style={{ color: 'var(--disclaimer-text)' }}>{dominantArchetype.weaknesses}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="rounded-3xl shadow-2xl p-8 mb-8 fade-in" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <h2 className="text-2xl font-bold text-center mb-6" style={{ color: 'var(--text-primary)' }}>Профиль архетипов</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? '#888899' : '#666', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} />
                <Radar
                  name="Баллы"
                  dataKey="A"
                  stroke="#667eea"
                  strokeWidth={3}
                  fill="#667eea"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl shadow-2xl p-8 mb-8 fade-in" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Все архетипы</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.archetypes.map((arch, index) => (
              <div
                key={arch.code}
                className="border-2 rounded-xl p-4 transition hover:shadow-lg hover:-translate-y-1 duration-300 stagger-item"
                style={{ borderColor: arch.color + '40', backgroundColor: isDark ? 'transparent' : 'white', animationDelay: `${index * 0.08}s` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{arch.name}</h3>
                  <span
                    className="text-xs px-2 py-1 rounded-full font-semibold"
                    style={{
                      backgroundColor: arch.status === 'A' ? '#22c55e' :
                                      arch.status === 'M' ? '#eab308' :
                                      arch.status === 'N' ? '#9ca3af' : '#ef4444',
                      color: 'white'
                    }}
                  >
                    {arch.status === 'A' ? 'Активный' :
                     arch.status === 'M' ? 'Средний' :
                     arch.status === 'N' ? 'Неопр.' : 'Пассивный'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? 'var(--bg-card-alt)' : '#e5e7eb' }}>
                    <div
                      className="h-full rounded-full bar-grow"
                      style={{ width: `${(arch.score / 5) * 100}%`, backgroundColor: arch.color, animationDelay: `${0.3 + index * 0.08}s` }}
                    />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{arch.score}/5</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Скачивание результатов */}
        <div className="rounded-3xl shadow-2xl p-8 text-center fade-in" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Download className="w-6 h-6" style={{ color: 'var(--bg-gradient-from)' }} />
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Ваши результаты</h3>
          </div>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            {authUser
              ? 'Результаты сохранены в вашем личном кабинете. Также вы можете скачать их в PDF.'
              : 'Вы можете скачать результаты в PDF.'}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => window.print()}
              className="text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition transform hover:scale-105"
              style={{ backgroundColor: 'var(--bg-gradient-from)' }}
            >
              <Download className="w-5 h-5 inline mr-2" /> Скачать результаты (PDF)
            </button>
            {authUser && (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition transform hover:scale-105"
                style={{ backgroundColor: isDark ? 'var(--bg-card-alt)' : '#f3f4f6', color: 'var(--text-secondary)' }}
              >
                <User className="w-5 h-5 inline mr-2" /> В личный кабинет
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResults;
