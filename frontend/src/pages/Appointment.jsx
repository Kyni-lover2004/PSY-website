import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { consultationAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle, Calendar, MessageCircle,
  User, Users, Baby, PersonStanding, ArrowRight, ChevronDown, ChevronUp,
  FileText, CreditCard, ThumbsUp, ThumbsDown, Send
} from 'lucide-react';

const categories = {
  personal: {
    label: 'Личная консультация',
    icon: User,
    topics: [
      'Контакт с ребёнком или родителем',
      'Отношения в паре',
      'Тревожность и ПА',
      'Переживание утраты',
      'Травмы и тяжёлые переживания',
      'Страхи',
      'Трудности в принятии решения',
      'Самоценность и самоопределение',
      'Профессиональное развитие',
      'Сексологические вопросы',
    ]
  },
  children: {
    label: 'Консультация для ребёнка (до 14 лет)',
    icon: Baby,
    topics: [
      'Тревожность',
      'Агрессивность',
      'Школьная неуспеваемость',
      'Нарушения общения',
      'Зависимость от гаджетов',
      'Страхи и кошмары',
      'Травмы и переживания',
      'Готовность к школе',
      'Адаптация в саду',
      'Энурез, энкопрез',
      'Сопровождение развития',
    ]
  },
  teenagers: {
    label: 'Консультация для подростка (от 15 лет)',
    icon: PersonStanding,
    topics: [
      'Тревожность',
      'Агрессивность',
      'Школьная неуспеваемость',
      'Нарушения общения',
      'Зависимость от гаджетов',
      'Страхи и кошмары',
      'Травмы и переживания',
      'Адаптация в коллективе',
      'Энурез, энкопрез',
    ]
  },
  family: {
    label: 'Семейная консультация',
    icon: Users,
    topics: [
      'Кризисы семейной жизни',
      'Сексологические запросы',
      'Измены и потеря доверия',
      'Начало семьи и добрачное консультирование',
      'Развод',
      'Коммуникация в семье',
      'Семейная структура и система',
      'Незавершённая сепарация',
    ]
  },
};

const Appointment = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: '',
    topic: '',
    telegram: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openCategory, setOpenCategory] = useState(null);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [agreedToPayment, setAgreedToPayment] = useState(false);

  // Если не авторизован — перенаправляем на регистрацию
  useEffect(() => {
    if (!user || !token) {
      sessionStorage.setItem('redirectAfterLogin', '/appointment');
      navigate('/register');
    }
  }, [user, token, navigate]);

  // Автозаполнение из URL
  useEffect(() => {
    const category = searchParams.get('category');
    const topic = searchParams.get('topic');
    if (category || topic) {
      setFormData(prev => ({
        ...prev,
        category: category || '',
        topic: topic || ''
      }));
      if (category && topic) setStep(2);
    }
  }, [searchParams]);

  const handleCategorySelect = (key) => {
    setOpenCategory(openCategory === key ? null : key);
  };

  const handleTopicSelect = (categoryKey, topic) => {
    const cat = categories[categoryKey];
    setFormData(prev => ({ ...prev, category: cat.label, topic }));
    setOpenCategory(null);
    setStep(2);
  };

  const submitConsultation = async () => {
    setLoading(true);
    try {
      const telegramToSend = formData.telegram || user?.telegram;
      const requestData = {
        request_text: `
Категория: ${formData.category}
Тема: ${formData.topic}
Telegram: ${telegramToSend ? '@' + telegramToSend : 'Не указан'}
Пользователь: ${user?.name || user?.login || 'Неизвестно'}
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

  // ===================== ЭКРАН ПОДТВЕРЖДЕНИЯ =====================
  if (submitted) {
    return (
      <div className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #6B8F8B 0%, #4A6B68 100%)', minHeight: '100vh' }}>
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 text-center fade-in">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Заявка отправлена!</h2>
          <p className="text-gray-600 mb-6">
            Ксения свяжется с вами в Telegram для подтверждения.
          </p>
          <div className="bg-primary/10 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-700"><strong>Тип:</strong> {formData.category}</p>
            <p className="text-sm text-gray-700 mt-1"><strong>Тема:</strong> {formData.topic}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  // ===================== ЕСЛИ НЕ АВТОРИЗОВАН =====================
  if (!user || !token) {
    return (
      <div className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #6B8F8B 0%, #4A6B68 100%)', minHeight: '100vh' }}>
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  // ===================== ШАГ 4: Правила оплаты =====================
  if (step === 4) {
    return (
      <div className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #6B8F8B 0%, #4A6B68 100%)', minHeight: '100vh' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Правила оплаты</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 fade-in">
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>• Оплата консультации производится <strong>предварительно</strong> до начала сессии.</p>
              <p>• Стоимость индивидуальной консультации — <strong>3 000 ₽</strong> (50 минут).</p>
              <p>• Семейная консультация (пара) — <strong>4 000 ₽</strong> (80 минут).</p>
              <p>• При отмене менее чем за <strong>24 часа</strong> до консультации оплата не возвращается.</p>
              <p>• При опоздании время консультации не продлевается.</p>
              <p>• Оплата возможна переводом на карту или через СБП.</p>
            </div>

            <label className="flex items-start gap-3 mt-6 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToPayment}
                onChange={(e) => setAgreedToPayment(e.target.checked)}
                className="mt-1 w-5 h-5 text-primary rounded focus:ring-primary"
              />
              <span className="text-sm text-gray-700">
                Я ознакомлен(а) и принимаю условия оплаты
              </span>
            </label>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
              >
                <ThumbsDown className="w-5 h-5" /> Мне не подходит
              </button>
              <button
                onClick={() => {
                  submitConsultation();
                }}
                disabled={!agreedToPayment || loading}
                className={`flex-1 py-4 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2 ${
                  agreedToPayment && !loading
                    ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? 'Отправка...' : <><ThumbsUp className="w-5 h-5" /> Мне подходит</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===================== ШАГ 3: Правила прохождения =====================
  if (step === 3) {
    return (
      <div className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #6B8F8B 0%, #4A6B68 100%)', minHeight: '100vh' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Правила прохождения консультации</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 fade-in">
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>• Консультация длится <strong>50 минут</strong> (индивидуальная) или <strong>80 минут</strong> (семейная).</p>
              <p>• Важно приходить <strong>вовремя</strong> — опоздание сокращает время сессии.</p>
              <p>• Консультация проходит в <strong>тихом и спокойном месте</strong>, где вас никто не побеспокоит.</p>
              <p>• Рекомендуется использовать <strong>видеосвязь</strong> для более эффективной работы.</p>
              <p>• Всё сказанное на консультации остаётся <strong>конфиденциальным</strong>.</p>
              <p>• Пожалуйста, <strong>отключите уведомления</strong> на время сессии.</p>
              <p>• Если вам нужно отменить или перенести встречу — предупредите <strong>минимум за 24 часа</strong>.</p>
            </div>

            <label className="flex items-start gap-3 mt-6 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToRules}
                onChange={(e) => setAgreedToRules(e.target.checked)}
                className="mt-1 w-5 h-5 text-primary rounded focus:ring-primary"
              />
              <span className="text-sm text-gray-700">
                Я ознакомлен(а) с правилами прохождения консультации
              </span>
            </label>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => { setStep(2); setAgreedToRules(false); }}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                ← Назад
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!agreedToRules}
                className={`flex-1 py-4 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2 ${
                  agreedToRules
                    ? 'bg-primary text-white hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ArrowRight className="w-5 h-5" /> Далее
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===================== ШАГ 1-2: Выбор темы + Telegram =====================
  return (
    <div className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #6B8F8B 0%, #4A6B68 100%)', minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Записаться на консультацию</h1>
          <p className="text-white/80 text-lg">
            Добро пожаловать, <strong>{user?.name || user?.login}</strong>! Выберите тип консультации.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 text-center">
          <p className="text-white flex items-center justify-center gap-2">
            <MessageCircle className="w-5 h-5" /> <strong>Онлайн</strong> (Google Meet, VK) или <strong>Очно</strong> (г. Рязань)
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 fade-in">
          {/* Индикатор шагов */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                s <= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {s}
              </div>
            ))}
          </div>

          {/* ===== ШАГ 1: Выбор категории и темы ===== */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Тип консультации и тема</h2>
              <p className="text-gray-500 text-center mb-6">Выберите, для кого консультация и с чем хотите поработать</p>

              <div className="space-y-3">
                {Object.entries(categories).map(([key, cat]) => {
                  const Icon = cat.icon;
                  const isOpen = openCategory === key;
                  const isSelected = formData.category === cat.label;

                  return (
                    <div key={key} className={`border-2 rounded-2xl overflow-hidden transition-all ${
                      isSelected ? 'border-primary bg-primary/5' : isOpen ? 'border-primary/50' : 'border-gray-200'
                    }`}>
                      <button
                        type="button"
                        onClick={() => handleCategorySelect(key)}
                        className="w-full flex items-center gap-3 p-4 text-left"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isOpen || isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-gray-800 flex-1">{cat.label}</span>
                        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 bg-gray-50 border-t border-gray-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {cat.topics.map((topic) => (
                              <button
                                key={topic}
                                type="button"
                                onClick={() => handleTopicSelect(key, topic)}
                                className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition ${
                                  formData.topic === topic
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-gray-700 hover:bg-primary/10 hover:text-primary'
                                }`}
                              >
                                {topic}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {formData.category && formData.topic && (
                <div className="mt-6 bg-primary/10 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600">Выбрано:</p>
                  <p className="text-primary font-bold text-lg">{formData.category}</p>
                  <p className="text-gray-700">{formData.topic}</p>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="mt-3 bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2 mx-auto"
                  >
                    Далее <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ===== ШАГ 2: Telegram ===== */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Контакт для связи</h2>

              <div className="bg-primary/10 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Тема обращения:</p>
                  <p className="font-semibold text-gray-800">{formData.topic}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-primary text-sm font-semibold hover:underline"
                >
                  Изменить
                </button>
              </div>

              {!user?.telegram ? (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" /> Telegram для связи *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
                    value={formData.telegram}
                    onChange={(e) => {
                      let val = e.target.value.replace('@', '').replace(/[^a-zA-Z0-9_]/g, '');
                      setFormData({...formData, telegram: val});
                    }}
                    placeholder="username"
                  />
                  <p className="text-xs text-gray-500 mt-1">Ксения свяжется с вами в Telegram</p>
                </div>
              ) : (
                <div className="bg-primary/10 rounded-xl p-4 flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span className="text-gray-700">Telegram: <strong>@{user.telegram}</strong></span>
                  <span className="text-green-600 text-sm ml-auto">✓ Указан</span>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition"
                >
                  ← Назад
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!user?.telegram && !formData.telegram}
                  className={`flex-1 py-4 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2 ${
                    user?.telegram || formData.telegram
                      ? 'bg-primary text-white hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Далее <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointment;
