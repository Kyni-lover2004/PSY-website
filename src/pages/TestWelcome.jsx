import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Target, Clock, Brain, ArrowLeft } from 'lucide-react';

const TestWelcome = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    gender: '',
    orientation: '',
    consent: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.consent) {
      alert('Необходимо согласие на обработку данных');
      return;
    }

    sessionStorage.setItem('testData', JSON.stringify(formData));
    navigate('/test/questionnaire');
  };

  return (
    <div className="py-12 px-4" style={{ background: 'var(--bg-gradient-hero)', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/test/archetypes')}
            className="text-white/80 hover:text-white flex items-center gap-2 mb-4 mx-auto transition"
          >
            <ArrowLeft className="w-4 h-4" /> Назад к выбору
          </button>
          <h1 className="text-4xl font-bold text-white mb-4">Самоисследование</h1>
          <p className="text-xl text-white/80">
            Пройдите тест и узнайте свой ведущий архетип
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-white/10 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">12 архетипов</h3>
            <p className="text-white/70 text-sm">
              Классическая система К. Пирсон
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-white/10 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">15 минут</h3>
            <p className="text-white/70 text-sm">
              Среднее время прохождения
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-white/10 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Результат</h3>
            <p className="text-white/70 text-sm">
              Сохранится в личном кабинете
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto rounded-3xl shadow-2xl p-8 fade-in" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <h2 className="text-2xl font-bold text-center mb-6" style={{ color: 'var(--text-primary)' }}>Анкета</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Ваша фамилия *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition"
                style={{ borderColor: isDark ? 'var(--border-color)' : '#e5e7eb', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
                value={formData.surname}
                onChange={(e) => setFormData({...formData, surname: e.target.value})}
                placeholder="Иванов"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Ваше имя *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition"
                style={{ borderColor: isDark ? 'var(--border-color)' : '#e5e7eb', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Как к вам обращаться"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Пол *</label>
              <select
                required
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition"
                style={{ borderColor: isDark ? 'var(--border-color)' : '#e5e7eb', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="">Выберите...</option>
                <option value="female">Женский</option>
                <option value="male">Мужской</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Ориентация *</label>
              <select
                required
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition"
                style={{ borderColor: isDark ? 'var(--border-color)' : '#e5e7eb', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
                value={formData.orientation}
                onChange={(e) => setFormData({...formData, orientation: e.target.value})}
              >
                <option value="">Выберите...</option>
                <option value="hetero">Гетеро</option>
                <option value="homo">Гомо</option>
                <option value="bi">Бисексуальная</option>
                <option value="pan">Пансексуальная</option>
              </select>
            </div>

            <div className="p-4 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(59,130,246,0.15)' : '#eff6ff' }}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 w-5 h-5 rounded"
                  style={{ color: 'var(--bg-gradient-from)' }}
                  checked={formData.consent}
                  onChange={(e) => setFormData({...formData, consent: e.target.checked})}
                />
                <span className="text-sm" style={{ color: isDark ? 'var(--text-secondary)' : '#374151' }}>
                  Я даю согласие на обработку моих персональных данных
                </span>
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/test/archetypes')}
                className="flex-1 py-4 rounded-xl font-semibold hover:shadow-lg transition"
                style={{ backgroundColor: isDark ? 'var(--bg-card-alt)' : '#e5e7eb', color: 'var(--text-secondary)' }}
              >
                Назад
              </button>
              <button
                type="submit"
                className="flex-1 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition transform"
                style={{ backgroundColor: 'var(--bg-gradient-from)' }}
              >
                Начать тест
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TestWelcome;
