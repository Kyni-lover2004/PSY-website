import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* Hero секция */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 fade-in">
            Психолог Ксения Панкратова
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto fade-in">
            Практикующий психолог. Помогаю обрести гармонию с собой и построить счастливые отношения
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in">
            <Link to="/tests" className="bg-white text-primary px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition transform">
              Все тесты
            </Link>
            <Link to="/appointment" className="bg-transparent text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-primary transition">
              Записаться на консультацию
            </Link>
          </div>
        </div>
      </section>

      {/* О психологе */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Обо мне</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8 h-96 flex items-center justify-center">
              <span className="text-9xl">👩‍⚕️</span>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                Здравствуйте! Меня зовут <strong className="text-primary">Ксения Панкратова</strong> — 
                практикующий психолог с более чем 10-летним опытом работы.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Я помогаю людям справляться с тревогой, выгоранием, сложностями в отношениях и жизненными кризисами. 
                В своей работе я использую интегративный подход, сочетающий классическую психологию, 
                гештальт-терапию, когнитивно-поведенческие техники и глубинную работу с бессознательным.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Моя специализация:
              </p>
              <ul className="text-lg text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Отношения в паре, совместимость, конфликты</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Самооценка, принятие себя, личные границы</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Тревожность, страхи, эмоциональное выгорание</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Поиск предназначения, жизненные кризисы</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Глубинное понимание себя через архетипы</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* История */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">Моя история</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { year: '2015', title: 'Начало пути', desc: 'Начала изучать психологию, прошла первое профессиональное обучение в области консультирования.' },
              { year: '2017', title: 'Открытие архетипов', desc: 'Познакомилась с теорией архетипов К.Г. Юнга и прошла специализацию по архетипическому анализу.' },
              { year: '2019', title: 'Собственная методика', desc: 'Разработала авторскую методику работы с архетипами в отношениях, основанную на 7 женских и 7 мужских архетипах.' },
              { year: '2024', title: 'Онлайн-платформа', desc: 'Запустила онлайн-платформу для тестирования и консультаций, чтобы помочь большему числу людей.' },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 fade-in">
                <div className="text-4xl font-bold text-primary mb-3">{item.year}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/80">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Услуги */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">С чем я работаю</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Помогаю в самых разных жизненных ситуациях — от личных кризисов до сложностей в отношениях
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 text-center hover:shadow-xl transition transform hover:-translate-y-2">
              <div className="text-5xl mb-4">💑</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Отношения в паре</h3>
              <p className="text-gray-600 mb-4">Конфликты, недопонимание, потеря близости, поиск совместимости с партнёром.</p>
              <Link to="/compatibility" className="text-primary font-semibold hover:underline">Проверить совместимость →</Link>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 text-center hover:shadow-xl transition transform hover:-translate-y-2">
              <div className="text-5xl mb-4">💆</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Тревога и стресс</h3>
              <p className="text-gray-600 mb-4">Постоянное беспокойство, панические атаки, эмоциональное выгорание, усталость.</p>
              <Link to="/appointment" className="text-primary font-semibold hover:underline">Записаться на консультацию →</Link>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-2xl p-8 text-center hover:shadow-xl transition transform hover:-translate-y-2">
              <div className="text-5xl mb-4">🎭</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Самопознание</h3>
              <p className="text-gray-600 mb-4">Поиск себя, принятие своих теневых сторон, понимание глубинных мотивов.</p>
              <Link to="/tests" className="text-primary font-semibold hover:underline">Пройти тесты →</Link>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 text-center hover:shadow-xl transition transform hover:-translate-y-2">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Жизненные кризисы</h3>
              <p className="text-gray-600 mb-4">Потеря смысла, смена жизненного этапа, развод, утрата, переезд.</p>
              <Link to="/appointment" className="text-primary font-semibold hover:underline">Записаться на консультацию →</Link>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 text-center hover:shadow-xl transition transform hover:-translate-y-2">
              <div className="text-5xl mb-4">💪</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Самооценка</h3>
              <p className="text-gray-600 mb-4">Неуверенность в себе, зависимость от чужого мнения, нарушение границ.</p>
              <Link to="/appointment" className="text-primary font-semibold hover:underline">Записаться на консультацию →</Link>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 text-center hover:shadow-xl transition transform hover:-translate-y-2">
              <div className="text-5xl mb-4">🔮</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Глубинная терапия</h3>
              <p className="text-gray-600 mb-4">Работа с бессознательным, архетипами, родовыми сценариями и повторами.</p>
              <Link to="/tests" className="text-primary font-semibold hover:underline">Узнать свои архетипы →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Архетипы */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">Архетипы</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Женские */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">🌸 Женские архетипы</h3>
              <div className="space-y-3">
                {[
                  { name: 'Ксения', desc: 'Сестра/Артемида' },
                  { name: 'Кира', desc: 'Стратег/Афина' },
                  { name: 'Катерина', desc: 'Хранительница/Гестия' },
                  { name: 'Карина', desc: 'Возлюбленная/Афродита' },
                  { name: 'Клара', desc: 'Мать/Деметра' },
                  { name: 'Кристина', desc: 'Дочь/Персефона' },
                  { name: 'Каллерия', desc: 'Жена/Гера' },
                ].map((arch, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/10 rounded-xl p-3">
                    <span className="text-white font-semibold">{arch.name}</span>
                    <span className="text-white/70 text-sm">{arch.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Мужские */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">⚔️ Мужские архетипы</h3>
              <div className="space-y-3">
                {[
                  { name: 'Константин', desc: 'Правитель/Зевс' },
                  { name: 'Кирилл', desc: 'Эмоциональный/Посейдон' },
                  { name: 'Клемент', desc: 'Потусторонний/Гадес' },
                  { name: 'Кузьма', desc: 'Умный/Гермес' },
                  { name: 'Кондратий', desc: 'Гармоничный/Аполлон' },
                  { name: 'Кристиан', desc: 'Ранимый/Гефест' },
                  { name: 'Клим', desc: 'Воинственный/Арес' },
                ].map((arch, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/10 rounded-xl p-3">
                    <span className="text-white font-semibold">{arch.name}</span>
                    <span className="text-white/70 text-sm">{arch.desc}</span>
                  </div>
                ))}
              </div>
            </div>
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/tests" className="bg-gradient-to-r from-primary to-secondary text-white px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition transform">
              Все тесты
            </Link>
            <Link to="/appointment" className="bg-gray-100 text-gray-800 px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition transform">
              Записаться к психологу
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
