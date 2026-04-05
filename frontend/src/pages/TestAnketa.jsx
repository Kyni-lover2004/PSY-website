import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, ArrowLeft, Brain } from 'lucide-react';

const TestAnketa = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    orientation: '',
    consent: false,
  });

  if (!user) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.consent) {
      alert('Необходимо согласие на обработку данных');
      return;
    }

    const testData = {
      login: user.login,
      gender: user.gender,
      orientation: formData.orientation,
      consent: formData.consent,
    };

    sessionStorage.setItem('testData', JSON.stringify(testData));
    navigate('/test/questionnaire');
  };

  return (
    <div className="py-12 px-4" style={{ background: 'linear-gradient(135deg, #6B8F8B 0%, #4A6B68 100%)', minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto">
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

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-8 text-center">
          <p className="text-white/90 flex items-center justify-center gap-2">
            <User className="w-4 h-4" /> <span className="font-semibold">@{user.login}</span> •{' '}
            {user.gender === 'female' ? 'Женский' : 'Мужской'} пол
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-white/10 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white font-semibold text-sm">12 архетипов</h3>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-white font-semibold text-sm">~15 минут</h3>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-white font-semibold text-sm">В кабинет</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 fade-in">
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

            <div className="bg-blue-50 p-4 rounded-xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 w-5 h-5 text-primary rounded focus:ring-primary"
                  checked={formData.consent}
                  onChange={(e) => setFormData({...formData, consent: e.target.checked})}
                />
                <span className="text-sm text-gray-700">
                  Я даю согласие на обработку моих персональных данных
                </span>
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/test/archetypes')}
                className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Назад
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
