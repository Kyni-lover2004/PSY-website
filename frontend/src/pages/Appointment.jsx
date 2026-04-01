import { useState } from 'react';
import { consultationAPI } from '../api/api';

const Appointment = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    request: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await consultationAPI.create({ request_text: formData.request });
      setSubmitted(true);
    } catch (error) {
      console.error('Ошибка отправки:', error);
      alert('Ошибка при отправке заявки. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-20 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 text-center fade-in">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Заявка отправлена!</h2>
          <p className="text-gray-600 mb-6">
            Спасибо! Ксения свяжется с вами в ближайшее время для обсуждения деталей.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: '', phone: '', email: '', request: '' });
            }}
            className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition"
          >
            Отправить ещё одну заявку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Записаться на консультацию</h1>
          <p className="text-white/80 text-lg">
            Оставьте заявку, и я свяжусь с вами в ближайшее время для обсуждения деталей
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Ваше имя *
              </label>
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
              <label className="block text-gray-700 font-semibold mb-2">
                Номер телефона *
              </label>
              <input
                type="tel"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+7 (___) ___-__-__"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="example@mail.ru"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Ваш запрос *
              </label>
              <textarea
                required
                rows="5"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
                value={formData.request}
                onChange={(e) => setFormData({...formData, request: e.target.value})}
                placeholder="Опишите, с чем вы хотели бы поработать..."
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
              {loading ? 'Отправка...' : 'Отправить заявку'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            После отправки заявки психолог свяжется с вами для согласования времени встречи
          </p>
        </div>
      </div>
    </div>
  );
};

export default Appointment;
