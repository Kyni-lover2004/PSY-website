import { Wallet, Clock, Users, Baby, GraduationCap, Heart } from 'lucide-react';

const Price = () => {
  const categories = [
    {
      title: 'Взрослые',
      icon: Heart,
      headerBg: '#AEB5B0',
      iconColor: '#6B7270',
      bgColor: '#F0F1F0',
      borderColor: '#D1D5D3',
      sessions: [
        { duration: '1 час', price: '2 800 ₽' },
        { duration: '1 час 20 мин', price: '3 500 ₽' },
      ]
    },
    {
      title: 'Юноши (15–21 год)',
      icon: GraduationCap,
      headerBg: '#5A5D6B',
      iconColor: '#3D3F4A',
      bgColor: '#E5E7EB',
      borderColor: '#C2C5CE',
      sessions: [
        { duration: '1 час', price: '2 200 ₽' },
      ]
    },
    {
      title: 'Дети и подростки (4–14 лет)',
      icon: Baby,
      headerBg: '#7FB3B3',
      iconColor: '#4A7A7A',
      bgColor: '#E0F0F0',
      borderColor: '#A8D5D5',
      sessions: [
        { duration: '1 час', price: '2 000 ₽' },
      ]
    },
    {
      title: 'Семейная консультация (пара)',
      icon: Users,
      headerBg: '#4A7A7A',
      iconColor: '#2D5050',
      bgColor: '#D0E8E8',
      borderColor: '#8AC0C0',
      sessions: [
        { duration: '1 час 20 мин', price: '4 000 ₽' },
      ]
    },
  ];

  return (
    <div className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #6B8F8B 0%, #4A6B68 100%)', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Прайс 2026</h1>
          <p className="text-xl text-white/80">
            Стоимость индивидуальных консультаций
          </p>
        </div>

        {/* Карточки */}
        <div className="space-y-6">
          {categories.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.title}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Шапка карточки */}
                <div style={{ backgroundColor: cat.headerBg }} className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">{cat.title}</h2>
                  </div>
                </div>

                {/* Сессии */}
                <div className="p-6">
                  <div className="space-y-4">
                    {cat.sessions.map((session, i) => (
                      <div
                        key={i}
                        className="rounded-2xl px-6 py-5 border"
                        style={{ backgroundColor: cat.bgColor, borderColor: cat.borderColor }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Clock style={{ color: cat.iconColor }} className="w-5 h-5" />
                            <span className="text-gray-800 font-semibold text-lg">
                              Сессия {session.duration}
                            </span>
                          </div>
                          <span className="text-2xl font-bold" style={{ color: cat.iconColor }}>
                            {session.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Кнопка записи */}
        <div className="text-center mt-10">
          <a
            href="/appointment"
            className="inline-flex items-center gap-2 bg-white text-primary px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition transform"
          >
            Записаться на консультацию
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Price;
