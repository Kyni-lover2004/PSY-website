import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { compatibilityAPI } from '../api/api';
import { Heart, AlertCircle, BookOpen, Copy } from 'lucide-react';

const CompatibilityCheck = () => {
  const [searchParams] = useSearchParams();
  const myCodeFromUrl = searchParams.get('mycode') || '';
  
  const [myCode, setMyCode] = useState(myCodeFromUrl);
  const [partnerCode, setPartnerCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (myCodeFromUrl) {
      setMyCode(myCodeFromUrl);
    }
  }, [myCodeFromUrl]);

  const handleCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await compatibilityAPI.check(myCode, partnerCode);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка проверки совместимости');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4" style={{ background: 'linear-gradient(135deg, #6B8F8B 0%, #4A6B68 100%)', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-2">
            <Heart className="w-8 h-8" /> Проверка совместимости
          </h1>
          <p className="text-white/80 text-lg">
            Рассчитайте индекс комплементарности между двумя партнёрами
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 fade-in">
          <form onSubmit={handleCheck} className="space-y-6">
            {/* Мой код */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Ваш код совместимости
              </label>
              {myCode ? (
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-primary/10 rounded-xl px-4 py-3">
                    <code className="text-lg font-mono text-primary font-bold">{myCode}</code>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(myCode)}
                    className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                    title="Копировать"
                  >
                    <Copy className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition font-mono"
                  value={myCode}
                  onChange={(e) => setMyCode(e.target.value.toUpperCase())}
                  placeholder="PSY-YYYYMMDD-XXXXXXXX"
                />
              )}
              {!myCode && (
                <p className="text-xs text-gray-500 mt-1">
                  Получите код после прохождения теста на архетипы
                </p>
              )}
            </div>

            {/* Код партнёра */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Код партнёра
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition font-mono"
                value={partnerCode}
                onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                placeholder="PSY-YYYYMMDD-XXXXXXXX"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:scale-105'
              }`}
            >
              {loading ? 'Проверка...' : 'Рассчитать совместимость'}
            </button>
          </form>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
            </div>
          )}
        </div>

        {result && (
          <div className="fade-in">
            <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl shadow-2xl p-8 text-white mb-8">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">Индекс комплементарности</h2>
                <div className="text-6xl font-bold my-4">{result.index}</div>
                <p className="text-xl text-white/90">{result.interpretation}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold">{result.A_count}</div>
                  <div className="text-white/80">Активных совпадений (А)</div>
                </div>
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold">{result.P_count}</div>
                  <div className="text-white/80">Пассивных конфликтов (П)</div>
                </div>
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold">{result.score}%</div>
                  <div className="text-white/80">Общий балл</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6" /> Расшифровка значений
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">7/0</div>
                  <div>
                    <div className="font-semibold text-gray-800">Максимальная прочность</div>
                    <div className="text-gray-600">Идеальное совпадение архетипов</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-2xl">0/7</div>
                  <div>
                    <div className="font-semibold text-gray-800">Минимальная прочность</div>
                    <div className="text-gray-600">Высокий риск развала отношений</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-2xl">&gt; 1</div>
                  <div>
                    <div className="font-semibold text-gray-800">База есть</div>
                    <div className="text-gray-600">Отношения перспективны, но есть очаги конфликтов</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-2xl">&lt; 1</div>
                  <div>
                    <div className="font-semibold text-gray-800">Союз временный</div>
                    <div className="text-gray-600">«Против» больше чем «за»</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-2xl">А ≥ 3</div>
                  <div>
                    <div className="font-semibold text-gray-800">Правило спасения</div>
                    <div className="text-gray-600">Отношения имеют тенденцию к сохранению независимо от П</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompatibilityCheck;
