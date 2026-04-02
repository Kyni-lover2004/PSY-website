import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import psychologistPhoto from '../assets/psychologist.jpg';
import vkIcon from '../assets/vk-icon.avif';
import maxIcon from '../assets/max-icon.jpg';

const Home = () => {
  useEffect(() => {
    // Анимация при скролле
    const revealElements = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
      const windowHeight = window.innerHeight;
      const elementVisible = 100;
      
      revealElements.forEach((reveal) => {
        const elementTop = reveal.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
          reveal.classList.add('active');
        }
      });
    };
    
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Проверить при загрузке
    
    return () => window.removeEventListener('scroll', revealOnScroll);
  }, []);

  return (
    <div>
      {/* Hero секция */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Плавающие частицы на фоне */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl float" style={{ animationDelay: '0s' }}></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-300/10 rounded-full blur-3xl float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-purple-300/10 rounded-full blur-3xl float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 fade-in scale-in">
            Ксения Панкратова
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-3xl mx-auto fade-in" style={{ animationDelay: '0.2s' }}>
            Частный практикующий психолог
          </p>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto fade-in leading-relaxed" style={{ animationDelay: '0.4s' }}>
            Работаю в классическом подходе: безопасное пространство, конфиденциальность и глубинная работа
            с вашим внутренним миром без поверхностных советов
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in" style={{ animationDelay: '0.6s' }}>
            <Link to="/tests" className="group bg-white text-primary px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition transform glow">
              Все тесты
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link to="/appointment" className="group bg-transparent text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-primary transition hover:scale-105">
              Записаться на консультацию
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* О психологе */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12 reveal">Обо мне</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="reveal scale-in">
              <img 
                src={psychologistPhoto} 
                alt="Ксения Панкратова - психолог" 
                className="w-full h-[500px] object-cover rounded-3xl shadow-2xl"
              />
            </div>
            <div className="space-y-6 reveal">
              <p className="text-lg text-gray-700 leading-relaxed">
                Здравствуйте! Меня зовут <strong className="text-primary">Ксения Панкратова</strong> —
                дипломированный психолог с многолетним опытом практики.
              </p>
              
              {/* Специализации столбиками */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                <div className="flex items-center gap-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-3">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700 font-medium text-sm">Дипломированный психолог</span>
                </div>
                <div className="flex items-center gap-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700 font-medium text-sm">Немедицинский психотерапевт</span>
                </div>
                <div className="flex items-center gap-3 bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-3">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700 font-medium text-sm">Психодраматист</span>
                </div>
                <div className="flex items-center gap-3 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-3">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700 font-medium text-sm">Психолог для взрослых и детей (5+)</span>
                </div>
                <div className="flex items-center gap-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700 font-medium text-sm">Подростковый психолог</span>
                </div>
                <div className="flex items-center gap-3 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-3">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700 font-medium text-sm">Ведущая психологических групп</span>
                </div>
                <div className="flex items-center gap-3 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-3 sm:col-span-2">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700 font-medium text-sm">Основатель частного детского сада, практика (2007-2016)</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Link to="/appointment" className="inline-block bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition transform hover:-translate-y-1">
                  Записаться на первую встречу
                </Link>
              </div>
              {/* Соцсети и мессенджеры */}
              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3">Я в соцсетях:</p>
                <div className="flex flex-wrap gap-3">
                  <a 
                    href="https://vk.ru/pankratova_kseniya" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-600 transition transform hover:scale-105"
                  >
                    <img src={vkIcon} alt="VK" className="w-5 h-5 object-contain rounded-full" />
                    ВКонтакте
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <a 
                    href="https://max.ru/join/6HA8FoejJXU4ExztiPfwUh-ueBUh29SqE4qkW2iHdyY" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition transform hover:scale-105"
                  >
                    <img src={maxIcon} alt="Max" className="w-5 h-5 object-contain rounded-full" />
                    Мессенджер Макс
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Цитата Юнга */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto reveal">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/30"></div>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/30"></div>
          </div>
          <blockquote className="text-center">
            <p className="text-xl md:text-2xl text-white/95 italic leading-relaxed mb-4 font-light">
              Ваш взор станет ясным лишь тогда, когда вы сможете заглянуть в свою собственную душу.
            </p>
            <footer className="text-white/60 text-sm font-medium tracking-wide uppercase">
              — Карл Густав Юнг
            </footer>
          </blockquote>
          <div className="flex items-center gap-4 mt-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/20"></div>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/20"></div>
          </div>
        </div>
      </section>

      {/* История */}
      <section className="py-20 px-4 reveal">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-4">Моя история</h2>
          <p className="text-center text-white/80 mb-12 max-w-2xl mx-auto">
            Более 17 лет практики в психологии и работе с детьми
          </p>
          <div className="relative">
            {/* Вертикальная линия */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary via-secondary to-pink-300 hidden md:block"></div>
            
            <div className="space-y-8">
              {[
                { 
                  year: '2023 — н.в.', 
                  title: 'Кабинет семейной психологии К. Панкратовой',
                  role: 'Создатель, психолог',
                  desc: 'Частная практика: индивидуальное консультирование, работа с парами, диагностика архетипов.'
                },
                { 
                  year: '2021 — 2023', 
                  title: 'Детский центр "МОРСКАЯ ШКОЛА"',
                  role: 'Психолог-педагог',
                  desc: 'Диагностика и коррекция эмоционального состояния детей, профориентация, работа с родителями.'
                },
                { 
                  year: '2019 — 2020', 
                  title: 'Центр детского творчества «Феникс»',
                  role: 'Педагог-психолог',
                  desc: 'Психологическое сопровождение творческого развития детей, групповые занятия.'
                },
                { 
                  year: '2018 — 2020', 
                  title: 'Детский сад № 146 города Рязани',
                  role: 'Педагог-психолог',
                  desc: 'Психологическая диагностика, адаптация детей, консультации для воспитателей и родителей.'
                },
                { 
                  year: '2017 — 2018', 
                  title: 'Частный детский сад «Знайка-Академия детства»',
                  role: 'Администратор',
                  desc: 'Организация образовательного процесса, координация работы персонала.'
                },
                { 
                  year: '2007 — 2016', 
                  title: 'Частный детский садик «Семицветик»',
                  role: 'Создатель, директор, психолог',
                  desc: 'Основала и руководила частным детским садом, совмещала административную работу с психологическим сопровождением детей.'
                },
              ].map((item, i) => (
                <div key={i} className={`relative flex items-center gap-8 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} ${i % 2 === 0 ? 'slide-in-left' : 'slide-in-right'}`} style={{ animationDelay: `${i * 0.1}s` }}>
                  {/* Точка на линии */}
                  <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-white border-4 border-primary rounded-full z-10 hidden md:block"></div>
                  
                  {/* Карточка */}
                  <div className={`ml-8 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/20 transition transform hover:scale-105 duration-300 fade-in">
                      <div className="text-3xl font-bold text-pink-200 mb-2">{item.year}</div>
                      <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                      <div className="text-pink-400 text-sm font-medium mb-2">{item.role}</div>
                      <p className="text-white/90 text-sm">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Услуги */}
      <section className="py-20 px-4 bg-white reveal">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">С чем я работаю</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Помогаю в самых разных жизненных ситуациях — от личных кризисов до сложностей в отношениях
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 text-center hover:shadow-xl transition transform hover:-translate-y-2 reveal scale-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-5xl mb-4">💑</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Отношения в паре</h3>
              <p className="text-gray-600 mb-4">Конфликты, недопонимание, потеря близости, поиск совместимости с партнёром.</p>
              <Link to="/compatibility" className="text-primary font-semibold hover:underline">Проверить совместимость →</Link>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 text-center hover:shadow-xl transition transform hover:-translate-y-2 reveal scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-5xl mb-4">💆</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Тревога и стресс</h3>
              <p className="text-gray-600 mb-4">Постоянное беспокойство, панические атаки, эмоциональное выгорание, усталость.</p>
              <Link to="/appointment" className="text-primary font-semibold hover:underline">Записаться на консультацию →</Link>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-2xl p-8 text-center hover:shadow-xl transition transform hover:-translate-y-2 reveal scale-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-5xl mb-4">🎭</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Самопознание</h3>
              <p className="text-gray-600 mb-4">Поиск себя, принятие своих теневых сторон, понимание глубинных мотивов.</p>
              <Link to="/tests" className="text-primary font-semibold hover:underline">Пройти тесты →</Link>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 text-center hover:shadow-xl transition transform hover:-translate-y-2 reveal scale-in" style={{ animationDelay: '0.4s' }}>
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Жизненные кризисы</h3>
              <p className="text-gray-600 mb-4">Потеря смысла, смена жизненного этапа, развод, утрата, переезд.</p>
              <Link to="/appointment" className="text-primary font-semibold hover:underline">Записаться на консультацию →</Link>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 text-center hover:shadow-xl transition transform hover:-translate-y-2 reveal scale-in" style={{ animationDelay: '0.5s' }}>
              <div className="text-5xl mb-4">💪</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Самооценка</h3>
              <p className="text-gray-600 mb-4">Неуверенность в себе, зависимость от чужого мнения, нарушение границ.</p>
              <Link to="/appointment" className="text-primary font-semibold hover:underline">Записаться на консультацию →</Link>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 text-center hover:shadow-xl transition transform hover:-translate-y-2 reveal scale-in" style={{ animationDelay: '0.6s' }}>
              <div className="text-5xl mb-4">🔮</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Глубинная терапия</h3>
              <p className="text-gray-600 mb-4">Работа с бессознательным, архетипами, родовыми сценариями и повторами.</p>
              <Link to="/tests" className="text-primary font-semibold hover:underline">Узнать свои архетипы →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Архетипы */}
      <section className="py-20 px-4 reveal">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">Архетипы</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Женские */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 reveal scale-in">
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
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 reveal scale-in" style={{ animationDelay: '0.2s' }}>
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
      <section className="py-20 px-4 bg-white reveal">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6 scale-in">Готовы узнать себя лучше?</h2>
          <p className="text-xl text-gray-600 mb-8 reveal">
            Пройдите тест бесплатно прямо сейчас. Регистрация потребуется только для сохранения результатов.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center reveal">
            <Link to="/tests" className="group bg-gradient-to-r from-primary to-secondary text-white px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition transform glow">
              Все тесты
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link to="/appointment" className="group bg-gray-100 text-gray-800 px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition transform">
              Записаться к психологу
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
