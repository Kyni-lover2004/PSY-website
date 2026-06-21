import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Palette, Zap, Heart, Link2, Gem, MessageCircle, Lightbulb, Sparkles, Clock3 } from 'lucide-react';

const TestsList = () => {
  const { isDark } = useTheme();

  const mainTest = {
    id: 'archetypes',
    title: 'Тест на архетипы',
    description: 'Узнайте свой ведущий архетип, сильные стороны личности и то, какие партнёры вам подходят лучше всего.',
    icon: Palette,
    link: '/test/archetypes',
    popular: true,
  };

  const upcomingTests = [
    {
      id: 'temperament',
      title: 'Тест на темперамент',
      description: 'Определите свой ритм, эмоциональную динамику и природный способ реагирования.',
      icon: Zap,
    },
    {
      id: 'love-language',
      title: 'Языки любви',
      description: 'Поймите, как вы выражаете заботу и через что лучше всего чувствуете близость.',
      icon: Heart,
    },
    {
      id: 'attachment',
      title: 'Тип привязанности',
      description: 'Узнайте, как формируется доверие, близость и ощущение безопасности в отношениях.',
      icon: Link2,
    },
    {
      id: 'values',
      title: 'Ценности в отношениях',
      description: 'Выявите, что для вас действительно важно в партнёрстве, семье и совместной жизни.',
      icon: Gem,
    },
    {
      id: 'communication',
      title: 'Стиль коммуникации',
      description: 'Разберите свой способ общения, выражения чувств и прохождения конфликтов.',
      icon: MessageCircle,
    },
  ];

  return (
    <div className="py-12 px-4" style={{ background: 'var(--bg-gradient-hero)', minHeight: '100vh' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Все тесты</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Начните с главного теста и постепенно открывайте для себя новые грани личности и отношений
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Link
            to={mainTest.link}
            className="group block rounded-3xl shadow-2xl p-7 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            style={{ backgroundColor: 'var(--bg-card)' }}
          >
            <div className="flex items-start justify-between mb-5 gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: 'var(--bg-gradient-from)' }}>
                <mainTest.icon className="w-8 h-8 text-white" />
              </div>
              {mainTest.popular && (
                <span className="text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: 'var(--bg-gradient-from)' }}>
                  Основной тест
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition" style={{ color: 'var(--text-primary)' }}>
              {mainTest.title}
            </h2>

            <p className="text-base mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {mainTest.description}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center font-semibold group-hover:translate-x-2 transition-transform" style={{ color: 'var(--bg-gradient-from)' }}>
                Пройти тест
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                35 вопросов • персональный результат
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-10 rounded-[2rem] p-8 md:p-10 shadow-2xl border backdrop-blur-xl"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))'
              : 'linear-gradient(135deg, rgba(255,255,255,0.24), rgba(255,255,255,0.12))',
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.18)',
          }}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.35)',
                  color: '#fff',
                }}
              >
                <Sparkles className="w-4 h-4" /> Новые тесты в разработке
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Скоро в приложении</h2>
              <p className="text-white/80 max-w-2xl leading-relaxed">
                Мы работаем над новыми тестами, чтобы вы могли узнать себя ещё глубже: понять стиль общения, эмоциональные реакции,
                ценности и особенности привязанности. Следите за обновлениями — раздел будет постепенно расширяться.
              </p>
            </div>

            <div className="rounded-2xl px-5 py-4 min-w-[220px]"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.18)' }}
            >
              <div className="flex items-center gap-2 text-white font-semibold mb-2">
                <Clock3 className="w-4 h-4" /> В планах
              </div>
              <p className="text-white/75 text-sm leading-relaxed">
                Следующая серия тестов будет оформлена в том же стиле: с понятной интерпретацией результатов и практической пользой.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {upcomingTests.map((test) => (
              <div
                key={test.id}
                className="rounded-2xl p-5 border transition-all duration-300"
                style={{
                  backgroundColor: isDark ? 'rgba(17,24,39,0.45)' : 'rgba(255,255,255,0.65)',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.4)',
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: 'var(--primary-light)' }}>
                    <test.icon className="w-6 h-6" style={{ color: 'var(--bg-gradient-from)' }} />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)',
                      color: 'var(--bg-gradient-from)',
                    }}
                  >
                    Скоро
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-2" style={{ color: isDark ? '#fff' : 'var(--text-primary)' }}>
                  {test.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)' }}>
                  {test.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
            <Lightbulb className="w-6 h-6" /> Не знаете, с чего начать?
          </h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Рекомендуем начать с теста на архетипы — это основа для понимания себя, своей динамики в отношениях и подбора совместимых партнёров
          </p>
          <Link
            to="/test/archetypes"
            className="inline-block text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition"
            style={{ background: 'var(--bg-gradient-from)' }}
          >
            Начать с теста на архетипы
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestsList;
