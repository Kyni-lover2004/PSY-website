import { useState } from 'react';
import { consultationAPI } from '../api/api';
import { CheckCircle, Calendar, Clock, Send, MessageCircle, Timer, User, Sparkles } from 'lucide-react';

const Appointment = () => {
  const [formData, setFormData] = useState({
    login: '',
    telegram: '',
    date: '',
    time: '',
    request: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTelegramChange = (e) => {
    let value = e.target.value;
    value = value.replace('@', '');
    value = value.replace(/[^a-zA-Z0-9_]/g, '');
    setFormData({...formData, telegram: value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestData = {
        request_text: `
Логин: ${formData.login}
Telegram: ${formData.telegram ? '@' + formData.telegram : 'Не указан'}
Желаемая дата: ${formData.date || 'Не указана'}
Желаемое время: ${formData.time || 'Не указано'}
Запрос: ${formData.request}
        `.trim()
      };

      await consultationAPI.create(requestData);
      setSubmitted(true);
    } catch (error) {
      console.error('Ошибка отправки:', error);
      alert('Ошибка при отправке заявки. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    const daysOfWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayName = daysOfWeek[date.getDay()];
      const dayNum = date.getDate();
      const month = months[date.getMonth()];
      
      dates.push({
        value: dateStr,
        label: `${dayName}, ${dayNum} ${month}`,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }
    
    return dates;
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00'
  ];

  if (submitted) {
    return (
      <div className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #6B8F8B 0%, #4A6B68 100%)', minHeight: '100vh' }}>
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 text-center fade-in">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Заявка отправлена!</h2>
          <p className="text-gray-600 mb-6">
            Спасибо! Ксения свяжется с вами в ближайшее время для обсуждения деталей.
          </p>
          <div className="bg-primary-light/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-700 space-y-1">
              <span className="flex items-center gap-2 justify-center"><Calendar className="w-4 h-4" /> Желаемая дата: <strong>{formData.date || 'Не указана'}</strong></span>
              <span className="flex items-center gap-2 justify-center"><Clock className="w-4 h-4" /> Желаемое время: <strong>{formData.time || 'Не указано'}</strong></span>
              <span className="flex items-center gap-2 justify-center"><MessageCircle className="w-4 h-4" /> Telegram: <strong>{formData.telegram ? '@' + formData.telegram : 'Не указан'}</strong></span>
              <span className="flex items-center gap-2 justify-center"><User className="w-4 h-4" /> Логин: <strong>{formData.login}</strong></span>
            </p>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({ login: '', telegram: '', date: '', time: '', request: '' });
            }}
            className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition"
          >
            Отправить ещё одну заявку
          </button>
        </div>
      </div>
    );
  }

  const availableDates = getAvailableDates();

  return (
    <div className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #6B8F8B 0%, #4A6B68 100%)', minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Записаться на консультацию</h1>
          <p className="text-white/80 text-lg">
            Выберите удобное время, и я свяжусь с вами для подтверждения
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 text-center">
          <p className="text-white flex items-center justify-center gap-2">
            <MessageCircle className="w-5 h-5" /> <strong>Онлайн</strong> (Zoom, Telegram) или <strong>Очно</strong> (г. Рязань)
          </p>
          <p className="text-white/80 text-sm mt-2 flex items-center justify-center gap-2">
            <Timer className="w-4 h-4" /> Длительность сессии: 50 минут
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Ваш логин *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
                value={formData.login}
                onChange={(e) => setFormData({...formData, login: e.target.value})}
                placeholder="Ваш логин"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Telegram для связи
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                  @
                </span>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
                  value={formData.telegram}
                  onChange={handleTelegramChange}
                  placeholder="username"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ваш никнейм в Telegram (без @)
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Желаемая дата
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                >
                  <option value="">Не выбрана</option>
                  {availableDates.map((date) => (
                    <option
                      key={date.value}
                      value={date.value}
                      disabled={date.isWeekend}
                    >
                      {date.label} {date.isWeekend ? '(выходной)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Желаемое время
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                >
                  <option value="">Не выбрано</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Или выберите время быстро:
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setFormData({...formData, time})}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold transition ${
                      formData.time === time
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
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
                placeholder="Опишите кратко, с чем вы хотели бы поработать..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:shadow-lg hover:scale-105'
              }`}
            >
              {loading ? 'Отправка...' : 'Отправить заявку'}
            </button>
          </form>

          <div className="bg-primary-light/30 rounded-xl p-4 mt-6">
            <p className="text-sm text-gray-700 text-center flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> После отправки заявки Ксения свяжется с вами в Telegram или по телефону для подтверждения времени встречи
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointment;
