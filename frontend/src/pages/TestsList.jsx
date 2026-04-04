import { Link } from 'react-router-dom';
import { Palette, Zap, Heart, Link2, Gem, MessageCircle, Lightbulb } from 'lucide-react';

const TestsList = () => {
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
    <div className="py-12 px-4" style={{ background: 'linear-gradient(135deg, #6B8F8B 0%, #4A6B68 100%)', minHeight: '100vh' }}>
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
              className="group bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                  {<test.icon className="w-8 h-8 text-white" />}
                </div>
                {test.popular && (
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                    Популярный
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition">
                {test.title}
              </h3>

              <p className="text-gray-600 text-sm mb-4">
                {test.description}
              </p>

              <div className="flex items-center text-primary font-semibold group-hover:translate-x-2 transition-transform">
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
            className="inline-block bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition"
          >
            Начать с теста на архетипы
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestsList;
