import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { compatibilityAPI } from '../api/api';
import { useTheme } from '../context/ThemeContext';
import { Heart, AlertCircle, BookOpen, Copy } from 'lucide-react';

const CompatibilityCheck = () => {
  const { isDark } = useTheme();
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
    <div className="py-12 px-4" style={{ background: 'var(--bg-gradient-hero)', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-2">
            <Heart className="w-8 h-8" /> Проверка совместимости
          </h1>
          <p className="text-white/80 text-lg">
            Рассчитайте индекс комплементарности между двумя партнёрами
          </p>
        </div>

        <div className="rounded-3xl shadow-2xl p-8 mb-8 fade-in" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <form onSubmit={handleCheck} className="space-y-6">
            {/* Мой код */}
            <div>
              <label className="block font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Ваш код совместимости
              </label>
              {myCode ? (
                <div className="flex items-center gap-3">
                  <div className="flex-1 rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--primary-light)' }}>
                    <code className="text-lg font-mono font-bold" style={{ color: 'var(--bg-gradient-from)' }}>{myCode}</code>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(myCode)}
                    className="p-3 rounded-xl hover:shadow-lg transition"
                    style={{ backgroundColor: isDark ? 'var(--bg-card-alt)' : '#f3f4f6' }}
                    title="Копировать"
                  >
                    <Copy className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition font-mono"
                  style={{ borderColor: isDark ? 'var(--border-color)' : '#e5e7eb', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  value={myCode}
                  onChange={(e) => setMyCode(e.target.value.toUpperCase())}
                  placeholder="PSY-YYYYMMDD-XXXXXXXX"
                />
              )}
              {!myCode && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Получите код после прохождения теста на архетипы
                </p>
              )}
            </div>

            {/* Код партнёра */}
            <div>
              <label className="block font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Код партнёра
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition font-mono"
                style={{ borderColor: isDark ? 'var(--border-color)' : '#e5e7eb', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
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
                  ? 'cursor-not-allowed'
                  : 'text-white hover:shadow-lg hover:scale-105'
              }`}
              style={{ backgroundColor: loading ? (isDark ? 'var(--bg-card-alt)' : '#d1d5db') : 'var(--bg-gradient-hero)', color: loading ? 'var(--text-muted)' : 'white' }}
            >
              {loading ? 'Проверка...' : 'Рассчитать совместимость'}
            </button>
          </form>

          {error && (
            <div className="mt-6 px-4 py-3 rounded-xl flex items-center gap-2" style={{ backgroundColor: 'var(--disclaimer-bg)', borderColor: 'var(--disclaimer-border)', color: 'var(--disclaimer-text)', border: '1px solid' }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
            </div>
          )}
        </div>

        {result && (
          <div className="fade-in">
            <div className="rounded-3xl shadow-2xl p-8 text-white mb-8" style={{ background: 'var(--bg-gradient-hero)' }}>
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

            <div className="rounded-3xl shadow-2xl p-8" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <BookOpen className="w-6 h-6" style={{ color: 'var(--bg-gradient-from)' }} /> Расшифровка значений
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="text-2xl font-bold" style={{ color: 'var(--bg-gradient-from)' }}>7/0</div>
                  <div>
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Максимальная прочность</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Идеальное совпадение архетипов</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-2xl font-bold" style={{ color: 'var(--bg-gradient-from)' }}>0/7</div>
                  <div>
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Минимальная прочность</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Высокий риск развала отношений</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-2xl font-bold" style={{ color: 'var(--bg-gradient-from)' }}>&gt; 1</div>
                  <div>
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>База есть</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Отношения перспективны, но есть очаги конфликтов</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-2xl font-bold" style={{ color: 'var(--bg-gradient-from)' }}>&lt; 1</div>
                  <div>
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Союз временный</div>
                    <div style={{ color: 'var(--text-secondary)' }}>«Против» больше чем «за»</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-2xl font-bold" style={{ color: 'var(--bg-gradient-from)' }}>А ≥ 3</div>
                  <div>
                    <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Правило спасения</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Отношения имеют тенденцию к сохранению независимо от П</div>
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
