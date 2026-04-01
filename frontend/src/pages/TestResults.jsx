import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { profileAPI } from '../api/api';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const TestResults = () => {
  const { code } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await profileAPI.getProfile(code);
        setProfile(response.data);
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Загрузка результатов...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Профиль не найден</h2>
          <p className="text-gray-600">Проверьте код совместимости</p>
        </div>
      </div>
    );
  }

  // Данные для雷达图
  const chartData = profile.archetypes.map(arch => ({
    subject: arch.name.split(' ')[0],
    A: arch.score,
    fullMark: 5,
    color: arch.color
  }));

  const dominantArchetype = profile.archetypes[0];

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-8 fade-in">
          <h1 className="text-4xl font-bold text-white mb-2">Ваши результаты</h1>
          <p className="text-white/80">Код совместимости: <span className="font-mono font-bold">{code}</span></p>
        </div>

        {/* Доминирующий архетип */}
        {dominantArchetype && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 fade-in">
            <div className="text-center mb-6">
              <span className="text-5xl mb-4 block">🏆</span>
              <h2 className="text-3xl font-bold mb-2" style={{ color: dominantArchetype.color }}>
                {dominantArchetype.name}
              </h2>
              <p className="text-gray-600">
                {dominantArchetype.score} из 5 баллов • Статус: {
                  dominantArchetype.status === 'A' ? 'Активный' :
                  dominantArchetype.status === 'M' ? 'Средний' :
                  dominantArchetype.status === 'N' ? 'Неопределенный' : 'Пассивный'
                }
              </p>
            </div>
            
            {dominantArchetype.description && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <p className="text-gray-700 leading-relaxed">{dominantArchetype.description}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {dominantArchetype.strengths && (
                <div className="bg-green-50 rounded-xl p-4">
                  <h3 className="font-semibold text-green-800 mb-2">💪 Сильные стороны</h3>
                  <p className="text-green-700">{dominantArchetype.strengths}</p>
                </div>
              )}
              {dominantArchetype.weaknesses && (
                <div className="bg-red-50 rounded-xl p-4">
                  <h3 className="font-semibold text-red-800 mb-2">⚠️ Зоны роста</h3>
                  <p className="text-red-700">{dominantArchetype.weaknesses}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Radar Chart */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 fade-in">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Профиль архетипов</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 12 }} />
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

        {/* Все архетипы */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 fade-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Все архетипы</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.archetypes.map((arch, index) => (
              <div
                key={arch.code}
                className="border-2 rounded-xl p-4 transition hover:shadow-lg"
                style={{ borderColor: arch.color + '40' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{arch.name}</h3>
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
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(arch.score / 5) * 100}%`, backgroundColor: arch.color }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-600">{arch.score}/5</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Код совместимости */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl shadow-2xl p-8 text-white text-center fade-in">
          <h2 className="text-2xl font-bold mb-4">💕 Ваш код совместимости</h2>
          <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 mb-4">
            <p className="text-3xl font-mono font-bold tracking-wider">{code}</p>
          </div>
          <p className="text-white/80 mb-6">
            Поделитесь этим кодом с партнёром для проверки совместимости
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition"
            >
              📋 Копировать код
            </button>
            <a
              href="/compatibility"
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-primary transition"
            >
              Проверить совместимость
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResults;
