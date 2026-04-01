import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TestWelcome = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    orientation: '',
    goal: '',
    partnerCode: '',
    consultationRequest: '',
    consent: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.consent) {
      alert('Необходимо согласие на обработку данных');
      return;
    }
    
    // Сохраняем данные в sessionStorage для использования в тесте
    sessionStorage.setItem('testData', JSON.stringify(formData));
    navigate('/test/questionnaire');
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 fade-in">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Тест на архетипы</h1>
        <p className="text-center text-gray-600 mb-8">Заполните анкету перед началом тестирования</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Ваше имя *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Как к вам обращаться"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Пол *</label>
            <select
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
            >
              <option value="">Выберите...</option>
              <option value="female">Женский</option>
              <option value="male">Мужской</option>
            </select>
          </div>

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

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition transform"
          >
            Начать тест
          </button>
        </form>
      </div>
    </div>
  );
};

export default TestWelcome;
