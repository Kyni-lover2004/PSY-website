import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { profileAPI } from '../api/api';
import { BarChart3, Palette, Zap, Heart, Link2, Gem, MessageCircle, Shield, AlertTriangle, Award, Trophy } from 'lucide-react';

const TestResultsTab = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedTest, setExpandedTest] = useState(null);

  useEffect(() => {
    const code = sessionStorage.getItem('compatibilityCode');
    if (code) {
      profileAPI.getProfile(code)
        .then(response => {
          setResults({
            code,
            ...response.data
          });
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const toggleExpand = (testId) => {
    setExpandedTest(expandedTest === testId ? null : testId);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-primary" />
        </div>
        <p className="text-gray-600 mb-4">Вы ещё не проходили тесты</p>
        <Link
          to="/test"
          className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition"
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
      <div className="bg-primary/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Palette className="w-5 h-5" /> Тест на архетипы</h3>
          <span className="text-sm text-gray-500">Код: {results.code}</span>
        </div>
        <p className="text-gray-600 mb-4">
          Пройдено тестов: <span className="font-semibold">1</span>
        </p>

        <div className="space-y-3">
          {topArchetypes.map((arch, index) => (
            <div 
              key={arch.code}
              className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <Trophy className={`w-6 h-6 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-600'}`} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{arch.name}</div>
                <div className="text-sm text-gray-500">
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
          className="mt-4 w-full bg-white text-primary py-3 rounded-xl font-semibold hover:bg-primary/5 transition"
        >
          {expandedTest === 'archetypes' ? 'Свернуть' : 'Показать все результаты'}
        </button>
      </div>

      {expandedTest === 'archetypes' && (
      <div className="bg-white rounded-2xl shadow-lg p-6 fade-in">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Все архетипы</h4>
          <div className="space-y-4">
            {allArchetypes.map((arch, index) => (
              <div 
                key={arch.code}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: arch.color }}
                    />
                    <div>
                      <div className="font-semibold text-gray-800">{arch.name}</div>
                      <div className="text-sm text-gray-500">
                        Код: {arch.code} • Чакра: {arch.chakra ? `${arch.chakra}-я` : 'Н/Д'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{arch.score}</div>
                    <div className="text-xs text-gray-500">баллов</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      arch.status === 'A' ? 'bg-green-100 text-green-700' :
                      arch.status === 'M' ? 'bg-yellow-100 text-yellow-700' :
                      arch.status === 'N' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {arch.status === 'A' ? 'Активный' : 
                       arch.status === 'M' ? 'Средний' : 
                       arch.status === 'N' ? 'Неопределенный' : 'Пассивный'}
                    </div>
                  </div>
                </div>

                {arch.description && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-700">{arch.description}</p>
                  </div>
                )}

                {arch.strengths && (
                  <div className="bg-green-50 rounded-lg p-3 mb-3">
                    <div className="text-sm font-semibold text-green-800 mb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> Сильные стороны:</div>
                    <p className="text-sm text-green-700">{arch.strengths}</p>
                  </div>
                )}

                {arch.weaknesses && (
                  <div className="bg-red-50 rounded-lg p-3">
                    <div className="text-sm font-semibold text-red-800 mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Зоны роста:</div>
                    <p className="text-sm text-red-700">{arch.weaknesses}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Другие тесты</h3>
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
              className="flex items-center justify-between bg-white rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <test.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{test.name}</div>
                  <div className="text-sm text-gray-500">Доступен для прохождения</div>
                </div>
              </div>
              <Link 
                to="/tests"
                className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-semibold hover:bg-primary/20 transition"
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
