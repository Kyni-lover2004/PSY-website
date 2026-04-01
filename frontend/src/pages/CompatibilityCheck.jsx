import { useState } from 'react';
import { compatibilityAPI } from '../api/api';

const CompatibilityCheck = () => {
  const [code1, setCode1] = useState('');
  const [code2, setCode2] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await compatibilityAPI.check(code1, code2);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка проверки совместимости');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">💕 Проверка совместимости</h1>
          <p className="text-white/80 text-lg">
            Введите коды совместимости обоих партнёров для расчёта индекса комплементарности
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <form onSubmit={handleCheck} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Код первого партнёра
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
                  value={code1}
                  onChange={(e) => setCode1(e.target.value.toUpperCase())}
                  placeholder="PSY-YYYYMMDD-XXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Код второго партнёра
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
                  value={code2}
                  onChange={(e) => setCode2(e.target.value.toUpperCase())}
                  placeholder="PSY-YYYYMMDD-XXXXXXXX"
                />
              </div>
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
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              ❌ {error}
            </div>
          )}
        </div>

        {result && (
          <div className="fade-in">
            {/* Основной результат */}
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

            {/* Расшифровка */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">📖 Расшифровка значений</h3>
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
