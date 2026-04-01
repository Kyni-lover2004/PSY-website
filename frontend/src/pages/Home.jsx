import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* Hero секция */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 fade-in">
            Естественные архетипы взаимоотношений
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto fade-in">
            Исследуйте себя и свои отношения через древние архетипические паттерны. 
            Узнайте свой профиль и проверьте совместимость с партнёром.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in">
            <Link to="/test" className="bg-white text-primary px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition transform">
              Пройти тест
            </Link>
            <Link to="/compatibility" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-primary transition">
              Проверить совместимость
            </Link>
          </div>
        </div>
      </section>

      {/* О проекте */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">О проекте</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl text-center">
              <div className="text-5xl mb-4">🔮</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">7 Женских архетипов</h3>
              <p className="text-gray-600">Ксения, Кира, Катерина, Карина, Клара, Кристина, Каллерия</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl text-center">
              <div className="text-5xl mb-4">⚔️</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">7 Мужских архетипов</h3>
              <p className="text-gray-600">Константин, Кирилл, Клемент, Кузьма, Кондратий, Кристиан, Клим</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-red-50 p-8 rounded-2xl text-center">
              <div className="text-5xl mb-4">💕</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Совместимость пар</h3>
              <p className="text-gray-600">Расчёт индекса комплементарности А/П для прогнозирования отношений</p>
            </div>
          </div>
        </div>
      </section>

      {/* Как это работает */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">Как это работает</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Заполните анкету', desc: 'Укажите пол, ориентацию и цель тестирования' },
              { step: '2', title: 'Ответьте на 35 вопросов', desc: 'Честно отвечайте Да/Нет на каждый вопрос' },
              { step: '3', title: 'Получите результат', desc: 'Узнайте свой профиль архетипов с описанием' },
              { step: '4', title: 'Проверьте совместимость', desc: 'Сравните профили с партнёром по коду' },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl text-white">
                <div className="text-4xl font-bold text-primary mb-3">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-white/80">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Готовы узнать себя лучше?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Пройдите тест бесплатно прямо сейчас. Регистрация потребуется только для сохранения результатов.
          </p>
          <Link to="/test" className="inline-block bg-gradient-to-r from-primary to-secondary text-white px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition transform">
            Начать тестирование
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
