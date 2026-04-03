import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TestAnketa = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    orientation: '',
    goal: '',
    partnerCode: '',
    consultationRequest: '',
    consent: false,
  });

  // Если пользователь не авторизован - перенаправляем
  if (!user) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.consent) {
      alert('Необходимо согласие на обработку данных');
      return;
    }

    // Сохраняем данные вместе с данными пользователя из кабинета
    const testData = {
      login: user.login,
      gender: user.gender,
      orientation: formData.orientation,
      goal: formData.goal,
      partnerCode: formData.partnerCode,
      consultationRequest: formData.consultationRequest,
      consent: formData.consent,
    };

    sessionStorage.setItem('testData', JSON.stringify(testData));
    navigate('/test/questionnaire');
  };

  return (
    <div className="py-12 px-4" style={{ background: 'linear-gradient(135deg, #6B8F8B 0%, #4A6B68 100%)', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Тест на архетипы</h1>
          <p className="text-xl text-white/80">
            Узнайте свой ведущий архетип и подберите идеальных партнёров
          </p>
        </div>

        {/* Инфо о пользователе */}
        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 text-center">
          <p className="text-white/90">
            👤 <span className="font-semibold">@{user.login}</span> •{' '}
            {user.gender === 'female' ? 'Женский' : 'Мужской'} пол
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Карточка 1 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-white font-semibold mb-2">12 архетипов</h3>
            <p className="text-white/70 text-sm">
              Классическая система К. Пирсон
            </p>
          </div>

          {/* Карточка 2 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">⏱️</div>
            <h3 className="text-white font-semibold mb-2">15 минут</h3>
            <p className="text-white/70 text-sm">
              Среднее время прохождения
            </p>
          </div>

          {/* Карточка 3 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">💕</div>
            <h3 className="text-white font-semibold mb-2">Совместимость</h3>
            <p className="text-white/70 text-sm">
              Подбор идеальных партнёров
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 fade-in">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Анкета</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Ориентация *</label>
              <select
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
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

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Цель тестирования *</label>
              <select
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
                value={formData.goal}
                onChange={(e) => setFormData({...formData, goal: e.target.value})}
              >
                <option value="">Выберите...</option>
                <option value="archetype">Узнать свой архетип + подбор партнеров</option>
                <option value="compatibility">Проверить совместимость с партнёром</option>
                <option value="selfdiscovery">Самоисследование (без партнера)</option>
                <option value="consultation">Тест + консультация психолога</option>
              </select>
            </div>

            {formData.goal === 'compatibility' && (
              <div className="fade-in">
                <label className="block text-gray-700 font-semibold mb-2">Код партнёра</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
                  value={formData.partnerCode}
                  onChange={(e) => setFormData({...formData, partnerCode: e.target.value})}
                  placeholder="PSY-YYYYMMDD-XXXXXXXX"
                />
              </div>
            )}

            {formData.goal === 'consultation' && (
              <div className="fade-in">
                <label className="block text-gray-700 font-semibold mb-2">Ваш запрос психологу *</label>
                <textarea
                  required
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
                  value={formData.consultationRequest}
                  onChange={(e) => setFormData({...formData, consultationRequest: e.target.value})}
                  placeholder="Опишите, с чем вы хотели бы поработать..."
                />
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 w-5 h-5 text-primary rounded focus:ring-primary"
                  checked={formData.consent}
                  onChange={(e) => setFormData({...formData, consent: e.target.checked})}
                />
                <span className="text-sm text-gray-700">
                  Я даю согласие на обработку моих персональных данных в соответствии с политикой конфиденциальности
                </span>
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/tests')}
                className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                ← Все тесты
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition transform"
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

export default TestAnketa;
