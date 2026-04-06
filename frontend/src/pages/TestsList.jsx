import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Palette, Zap, Heart, Link2, Gem, MessageCircle, Lightbulb } from 'lucide-react';

const TestsList = () => {
  const { isDark } = useTheme();
  const tests = [
    {
      id: 'archetypes',
      title: 'Тест на архетипы',
      description: 'Узнайте свой ведущий архетип и узнайте, какие партнёры вам подходят',
      icon: Palette,
      link: '/test/archetypes',
      popular: true,
    },
    {
      id: 'temperament',
      title: 'Тест на темперамент',
      description: 'Определите свой тип темперамента: сангвиник, холерик, флегматик или меланхолик',
      icon: Zap,
      link: '/test/temperament',
      popular: false,
    },
    {
      id: 'love-language',
      title: 'Языки любви',
      description: 'Узнайте, как вы предпочитаете давать и получать любовь в отношениях',
      icon: Heart,
      link: '/test/love-language',
      popular: false,
    },
    {
      id: 'attachment',
      title: 'Тип привязанности',
      description: 'Определите свой стиль привязанности в близких отношениях',
      icon: Link2,
      link: '/test/attachment',
      popular: true,
    },
    {
      id: 'values',
      title: 'Ценности в отношениях',
      description: 'Выясните, что для вас наиболее важно в партнёрстве',
      icon: Gem,
      link: '/test/values',
      popular: false,
    },
    {
      id: 'communication',
      title: 'Стиль коммуникации',
      description: 'Узнайте свой стиль общения и решения конфликтов',
      icon: MessageCircle,
      link: '/test/communication',
      popular: false,
    },
  ];

  return (
    <div className="py-12 px-4" style={{ background: 'var(--bg-gradient-hero)', minHeight: '100vh' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Все тесты</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Пройдите тесты и узнайте себя лучше. Каждый тест поможет раскрыть новые грани вашей личности
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <Link
              key={test.id}
              to={test.link}
              className="group rounded-3xl shadow-xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: 'var(--bg-gradient-from)' }}>
                  {<test.icon className="w-8 h-8 text-white" />}
                </div>
                {test.popular && (
                  <span className="text-white text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-gradient-from)' }}>
                    Популярный
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition" style={{ color: 'var(--text-primary)' }}>
                {test.title}
              </h3>

              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                {test.description}
              </p>

              <div className="flex items-center font-semibold group-hover:translate-x-2 transition-transform" style={{ color: 'var(--bg-gradient-from)' }}>
                Пройти тест
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
            <Lightbulb className="w-6 h-6" /> Не знаете, с чего начать?
          </h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Рекомендуем начать с теста на архетипы — это основа для понимания себя и подбора совместимых партнёров
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
