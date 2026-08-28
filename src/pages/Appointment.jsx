import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { consultationAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  CheckCircle, Calendar, MessageCircle,
  User, Users, Baby, PersonStanding, ArrowRight, ChevronDown, ChevronUp,
  FileText, CreditCard, Dices, Banknote
  } from 'lucide-react';

import { SOCIALS } from '../lib/contacts';

export const GAME_CATEGORY = 'Трансформационная игра';

const GAME_FORMATS = [
  { title: 'Группой', people: 'от 3 человек', price: '2 500 ₽', priceNote: 'с человека', time: '5–6 часов' },
  { title: 'Индивидуально', people: 'один на один с ведущим', price: '4 000 ₽', priceNote: '', time: '4 часа' },
];

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
      'Развод и измена',
      'Выбор партнера',
      'Подготовка к зачатию',
      'Помощь в зачатии',
      'Самопознание и саморазвитие',
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
      'Адаптация в саду/школе',
      'Энурез, энкопрез',
      'Сопровождение развития',
      'Отношения с сиблингами',
      'Буллинг',
      'Отношения с родителями',
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
      'Травмы и переживания',
      'Буллинг',
      'Депрессия и самоповреждения',
      'Профориентация',
      'Первая любовь и чувства',
      'Гендерные вопросы',
      'Другое',
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
      'Детско-родительские отношения',
    ]
  },
  games: {
    label: GAME_CATEGORY,
    icon: Dices,
    topics: [
      'Переходы',
      'Тревоги',
      'Психосоматика',
    ]
  },
};

const Appointment = () => {
  const { user, token } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: '',
    topic: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openCategory, setOpenCategory] = useState(null);
  const [agreedToRules, setAgreedToRules] = useState(false);

  // У игры свои форматы и условия вместо правил консультации.
  const isGame = formData.category === GAME_CATEGORY;

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
      if (category && topic) setStep(1);
    }
  }, [searchParams]);

  const handleCategorySelect = (key) => {
    setOpenCategory(openCategory === key ? null : key);
  };

  const handleTopicSelect = (categoryKey, topic) => {
    const cat = categories[categoryKey];
    setFormData(prev => ({ ...prev, category: cat.label, topic }));
    setOpenCategory(null);
    setStep(3);
  };

const submitConsultation = async () => {
    setLoading(true);
    try {
      const telegramToSend = user?.telegram;
      const requestData = {
        user_id: user?.id || null,
        name: user?.name || user?.login || 'Неизвестно',
        telegram: telegramToSend || null,
        category: formData.category,
        topic: formData.topic,
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

// ===================== ШАГ 5: Выбор соцсети =====================
if (step === 5) {
  return (
    <div className="py-20 px-4" style={{ background: 'var(--bg-gradient-hero)', minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Выберите соцсеть для связи</h1>
          <p className="text-white/80">Ксения свяжется с вами через выбранную соцсеть</p>
        </div>

        <div className="rounded-3xl shadow-2xl p-8 fade-in" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SOCIALS.map(({ key, label, color, Icon, href }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 p-4 rounded-xl font-semibold text-white transition hover:shadow-lg"
                style={{ backgroundColor: color }}
              >
                <Icon className="w-6 h-6 shrink-0" />
                <span>{label}</span>
              </a>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t" style={{ borderColor: isDark ? 'var(--border-color)' : '#e5e7eb' }}>
            <button
              onClick={() => setStep(3)}
              className="w-full py-4 rounded-xl font-semibold transition"
              style={{ backgroundColor: isDark ? 'var(--bg-card-alt)' : '#f3f4f6', color: 'var(--text-secondary)' }}
            >
              ← Назад к правилам
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== ЭКРАН ПОДТВЕРЖДЕНИЯ =====================
if (submitted) {
  return (
    <div className="py-20 px-4" style={{ background: 'var(--bg-gradient-hero)', minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto rounded-3xl shadow-2xl p-8 text-center fade-in" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Заявка отправлена!</h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          Ксения свяжется с вами в выбранной соцсети.
        </p>
        <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'var(--primary-light)' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}><strong>Тип:</strong> {formData.category}</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}><strong>Тема:</strong> {formData.topic}</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition"
          style={{ backgroundColor: 'var(--bg-gradient-from)' }}
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
      <div className="py-20 px-4" style={{ background: 'var(--bg-gradient-hero)', minHeight: '100vh' }}>
        <div className="max-w-2xl mx-auto rounded-3xl shadow-2xl p-8 text-center" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--bg-gradient-from)' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  // ===================== ШАГ 4: Правила оплаты =====================
  if (step === 4) {
    return (
      <div className="py-20 px-4" style={{ background: 'var(--bg-gradient-hero)', minHeight: '100vh' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Правила оплаты</h1>
          </div>

          <div className="rounded-3xl shadow-2xl p-8 fade-in" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
            <div
              className="rounded-2xl p-6 sm:p-7"
              style={{
                backgroundColor: isDark ? 'var(--bg-card-alt)' : '#f9fafb',
                borderLeft: '4px solid var(--bg-gradient-from)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--bg-gradient-from)' }}
                >
                  <Banknote className="w-6 h-6 text-white" />
                </div>
                <p className="font-serif text-xl" style={{ color: 'var(--text-primary)' }}>
                  Уважаемые клиенты!
                </p>
              </div>

              <p className="leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                В связи с перебоями в работе банков и интернета прошу вас
                <strong style={{ color: 'var(--text-primary)' }}> приходить на сессии с наличными</strong> —
                так оплата точно пройдёт без задержек.
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Спасибо за понимание.
              </p>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-4 rounded-xl font-semibold hover:shadow-lg transition"
                style={{ backgroundColor: isDark ? 'var(--bg-card-alt)' : '#f3f4f6', color: 'var(--text-secondary)' }}
              >
                ← Назад
              </button>
              <button
                onClick={() => setStep(5)}
                className="flex-1 py-4 rounded-xl font-semibold text-lg text-white transition hover:shadow-lg flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--bg-gradient-from)' }}
              >
                Далее <ArrowRight className="w-5 h-5" />
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
      <div className="py-20 px-4" style={{ background: 'var(--bg-gradient-hero)', minHeight: '100vh' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isGame ? 'Форматы и условия игры' : 'Правила прохождения консультации'}
            </h1>
          </div>

          <div className="rounded-3xl shadow-2xl p-8 fade-in" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
            {isGame ? (
              <div className="space-y-4">
                {GAME_FORMATS.map((format) => (
                  <div
                    key={format.title}
                    className="rounded-2xl p-5 border"
                    style={{
                      backgroundColor: isDark ? 'var(--bg-card-alt)' : '#f9fafb',
                      borderColor: isDark ? 'var(--border-color)' : '#e5e7eb',
                    }}
                  >
                    <div className="flex items-baseline justify-between gap-4 mb-1">
                      <h2 className="text-lg font-bold">{format.title}</h2>
                      <div className="text-xl font-bold whitespace-nowrap" style={{ color: 'var(--bg-gradient-from)' }}>
                        {format.price}
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span>{format.people} · {format.time}</span>
                      {format.priceNote && <span className="whitespace-nowrap">{format.priceNote}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <div className="space-y-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              <p>• Важно приходить <strong>вовремя</strong> — опоздание сокращает время сессии.</p>
              <p>• Консультация проходит в <strong>тихом и спокойном месте</strong>, где вас никто не побеспокоит.</p>
              <p>• Рекомендуется использовать <strong>видеосвязь</strong> для более эффективной работы.</p>
              <p>• Всё сказанное на консультации остаётся <strong>конфиденциальным</strong>.</p>
              <p>• Пожалуйста, <strong>отключите уведомления</strong> на время сессии.</p>
              <p>• Если вам нужно отменить или перенести встречу — предупредите <strong>минимум за 24 часа</strong>.</p>
            </div>
            )}

            <label className="flex items-start gap-3 mt-6 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToRules}
                onChange={(e) => setAgreedToRules(e.target.checked)}
                className="mt-1 w-5 h-5 rounded"
                style={{ color: 'var(--bg-gradient-from)' }}
              />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {isGame
                  ? 'Я ознакомлен(а) с форматами и условиями игры'
                  : 'Я ознакомлен(а) с правилами прохождения консультации'}
              </span>
            </label>

            <div className="flex gap-4 mt-8">
<button
        onClick={() => { setStep(1); setAgreedToRules(false); }}
        className="flex-1 py-4 rounded-xl font-semibold hover:shadow-lg transition"
        style={{ backgroundColor: isDark ? 'var(--bg-card-alt)' : '#f3f4f6', color: 'var(--text-secondary)' }}
      >
        ← Назад
      </button>
              <button
                onClick={() => setStep(4)}
                disabled={!agreedToRules}
                className={`flex-1 py-4 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2 ${
                  agreedToRules
                    ? 'text-white hover:shadow-lg'
                    : 'cursor-not-allowed'
                }`}
                style={{ backgroundColor: agreedToRules ? 'var(--bg-gradient-from)' : (isDark ? 'var(--bg-card-alt)' : '#d1d5db'), color: agreedToRules ? 'white' : 'var(--text-muted)' }}
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
    <div className="py-20 px-4" style={{ background: 'var(--bg-gradient-hero)', minHeight: '100vh' }}>
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

        <div className="rounded-3xl shadow-2xl p-8 fade-in" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
{/* Индикатор шагов */}
<div className="flex items-center justify-center gap-2 mb-8">
  {[1, 2, 3, 4].map((s) => (
    <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
      s <= step ? 'text-white' : ''
    }`}
    style={{ backgroundColor: s <= step ? 'var(--bg-gradient-from)' : (isDark ? 'var(--bg-card-alt)' : '#e5e7eb'), color: s <= step ? 'white' : 'var(--text-muted)' }}>
      {s}
    </div>
  ))}
</div>

          {/* ===== ШАГ 1: Выбор категории и темы ===== */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: 'var(--text-primary)' }}>Тип консультации и тема</h2>
              <p className="text-center mb-6" style={{ color: 'var(--text-muted)' }}>Выберите, для кого консультация и с чем хотите поработать</p>

              <div className="space-y-3">
                {Object.entries(categories).map(([key, cat]) => {
                  const Icon = cat.icon;
                  const isOpen = openCategory === key;
                  const isSelected = formData.category === cat.label;

                  return (
                    <div key={key} className={`border-2 rounded-2xl overflow-hidden transition-all ${
                      isSelected ? 'border-primary bg-primary/5' : isOpen ? 'border-primary/50' : ''
                    }`}
                    style={{ borderColor: isSelected ? 'var(--bg-gradient-from)' : (isOpen ? 'rgba(107,143,139,0.5)' : (isDark ? 'var(--border-color)' : '#e5e7eb')), backgroundColor: isSelected ? 'var(--primary-light)' : (isDark ? 'transparent' : 'transparent') }}>
                      <button
                        type="button"
                        onClick={() => handleCategorySelect(key)}
                        className="w-full flex items-center gap-3 p-4 text-left"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isOpen || isSelected ? 'text-white' : ''
                        }`}
                        style={{ backgroundColor: isOpen || isSelected ? 'var(--bg-gradient-from)' : (isDark ? 'var(--bg-card-alt)' : '#f3f4f6'), color: isOpen || isSelected ? 'white' : 'var(--text-muted)' }}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>{cat.label}</span>
                        {isOpen ? <ChevronUp className="w-5 h-5" style={{ color: 'var(--text-muted)' }} /> : <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />}
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 border-t" style={{ backgroundColor: isDark ? 'var(--bg-card-alt)' : '#f9fafb', borderColor: isDark ? 'var(--border-color)' : '#f3f4f6' }}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {cat.topics.map((topic) => (
                              <button
                                key={topic}
                                type="button"
                                onClick={() => handleTopicSelect(key, topic)}
                                className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition ${
                                  formData.topic === topic
                                    ? 'text-white'
                                    : 'hover:text-primary'
                                }`}
                                style={{ backgroundColor: formData.topic === topic ? 'var(--bg-gradient-from)' : (isDark ? 'var(--bg-card)' : 'white'), color: formData.topic === topic ? 'white' : 'var(--text-secondary)' }}
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
  <div className="mt-6 rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--primary-light)' }}>
    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Выбрано:</p>
    <p className="font-bold text-lg" style={{ color: 'var(--bg-gradient-from)' }}>{formData.category}</p>
    <p style={{ color: 'var(--text-secondary)' }}>{formData.topic}</p>
    <button
      type="button"
      onClick={() => setStep(3)}
      className="mt-3 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2 mx-auto"
      style={{ backgroundColor: 'var(--bg-gradient-from)' }}
    >
      Далее <ArrowRight className="w-4 h-4" />
    </button>
  </div>
)}

{/* Дисклеймер: с чем не работаю */}
<div className="text-center mt-6 rounded-2xl p-5 max-w-2xl mx-auto" style={{ backgroundColor: 'var(--disclaimer-bg)', borderColor: 'var(--disclaimer-border)', borderWidth: '1px', borderStyle: 'solid' }}>
  <p className="font-semibold text-sm" style={{ color: 'var(--disclaimer-text)' }}>
    Не работаю с онкологией и суицидальным поведением
  </p>
</div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
};

export default Appointment;
