import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import psychologistPhoto from '../assets/psychologist.jpg';
import vkIcon from '../assets/vk-icon.png';
import maxIcon from '../assets/max-icon.jpg';
import { ArrowRight, User, Baby, Users, MessageCircle, UsersRound, Waves, AlertTriangle, Flame, Frown, Lightbulb, Compass, Lock, Shield, BookOpen, Tablet, Moon, HeartHandshake, GraduationCap, Droplets, Stethoscope, Scale, HeartCrack, KeyRound, BabyIcon, MessageSquare, Building2, DoorOpen, PersonStanding, Ghost } from 'lucide-react';

const Home = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('personal');

  const requestsData = {
    personal: [
      { icon: MessageCircle, title: 'Контакт с ребёнком или родителем', desc: 'Наладить отношения с ребёнком или со своим родителем.', link: '/appointment?category=Личные запросы&topic=Контакт с ребёнком или родителем', linkText: 'Записаться на консультацию' },
      { icon: UsersRound, title: 'Отношения в паре', desc: 'Наладить отношения в паре.', link: '/appointment?category=Личные запросы&topic=Отношения в паре', linkText: 'Проверить совместимость' },
      { icon: Waves, title: 'Тревожность и ПА', desc: 'Тревожность, панические атаки, постоянное беспокойство.', link: '/appointment?category=Личные запросы&topic=Тревожность и ПА', linkText: 'Записаться на консультацию' },
      { icon: Frown, title: 'Переживание утраты', desc: 'Помощь в проживании горя и утраты.', link: '/appointment?category=Личные запросы&topic=Переживания утраты', linkText: 'Записаться на консультацию' },
      { icon: AlertTriangle, title: 'Травмы и тяжёлые переживания', desc: 'Работа с травмирующим опытом и сложными переживаниями.', link: '/appointment?category=Личные запросы&topic=Травмы и тяжёлые переживания', linkText: 'Записаться на консультацию' },
      { icon: Ghost, title: 'Страхи', desc: 'Помощь в работе со страхами и фобиями.', link: '/appointment?category=Личные запросы&topic=Страхи', linkText: 'Записаться на консультацию' },
    ],
    children: [
      { icon: Waves, title: 'Тревожность', desc: 'Повышенная тревожность, беспокойство, неуверенность у ребёнка.', link: '/appointment?category=Детские запросы&topic=Тревожность', linkText: 'Записаться на консультацию' },
      { icon: Flame, title: 'Агрессивность', desc: 'Агрессивное поведение, вспышки гнева, проблемы с контролем эмоций.', link: '/appointment?category=Детские запросы&topic=Агрессивность', linkText: 'Записаться на консультацию' },
      { icon: BookOpen, title: 'Школьная неуспеваемость', desc: 'Трудности в обучении, снижение успеваемости, нежелание учиться.', link: '/appointment?category=Детские запросы&topic=Школьная неуспеваемость', linkText: 'Записаться на консультацию' },
      { icon: UsersRound, title: 'Нарушения общения', desc: 'Трудности в общении со сверстниками, замкнутость, конфликты.', link: '/appointment?category=Детские запросы&topic=Нарушения общения', linkText: 'Записаться на консультацию' },
      { icon: Tablet, title: 'Зависимость от гаджетов', desc: 'Чрезмерное увлечение экранами, играми, социальными сетями.', link: '/appointment?category=Детские запросы&topic=Зависимость от гаджетов', linkText: 'Записаться на консультацию' },
      { icon: Moon, title: 'Страхи и кошмары', desc: 'Ночные кошмары, страхи темноты, одиночества и другие.', link: '/appointment?category=Детские запросы&topic=Страхи и кошмары', linkText: 'Записаться на консультацию' },
    ],
    family: [
      { icon: Waves, title: 'Кризисы семейной жизни', desc: 'Помощь в преодолении кризисов в отношениях и восстановлении близости.', link: '/appointment?category=Семейные запросы&topic=Кризисы семейной жизни', linkText: 'Записаться на консультацию' },
      { icon: Lock, title: 'Сексологические запросы', desc: 'Деликатная работа с интимными вопросами в паре.', link: '/appointment?category=Семейные запросы&topic=Сексологические запросы', linkText: 'Записаться на консультацию' },
      { icon: HeartCrack, title: 'Измены и потеря доверия', desc: 'Восстановление доверия и работы с последствиями измены.', link: '/appointment?category=Семейные запросы&topic=Измены и потеря доверия', linkText: 'Записаться на консультацию' },
      { icon: KeyRound, title: 'Начало семьи и добрачное консультирование', desc: 'Подготовка к совместной жизни и осознанный выбор партнёра.', link: '/appointment?category=Семейные запросы&topic=Начало семьи и добрачное консультирование', linkText: 'Записаться на консультацию' },
      { icon: DoorOpen, title: 'Развод', desc: 'Психологическая поддержка в процессе развода.', link: '/appointment?category=Семейные запросы&topic=Развод', linkText: 'Записаться на консультацию' },
      { icon: MessageSquare, title: 'Коммуникация в семье', desc: 'Организация эффективной коммуникации между членами семьи.', link: '/appointment?category=Семейные запросы&topic=Коммуникация в семье', linkText: 'Записаться на консультацию' },
    ],
    teenagers: [
      { icon: Waves, title: 'Тревожность', desc: 'Повышенная тревожность, беспокойство, неуверенность у подростка.', link: '/appointment?category=Подростковые запросы&topic=Тревожность', linkText: 'Записаться на консультацию' },
      { icon: Flame, title: 'Агрессивность', desc: 'Агрессивное поведение, вспышки гнева, проблемы с контролем эмоций.', link: '/appointment?category=Подростковые запросы&topic=Агрессивность', linkText: 'Записаться на консультацию' },
      { icon: BookOpen, title: 'Школьная неуспеваемость', desc: 'Трудности в обучении, снижение успеваемости, нежелание учиться.', link: '/appointment?category=Подростковые запросы&topic=Школьная неуспеваемость', linkText: 'Записаться на консультацию' },
      { icon: UsersRound, title: 'Нарушения общения', desc: 'Трудности в общении со сверстниками, замкнутость, конфликты.', link: '/appointment?category=Подростковые запросы&topic=Нарушения общения', linkText: 'Записаться на консультацию' },
      { icon: Tablet, title: 'Зависимость от гаджетов', desc: 'Чрезмерное увлечение экранами, играми, социальными сетями.', link: '/appointment?category=Подростковые запросы&topic=Зависимость от гаджетов', linkText: 'Записаться на консультацию' },
      { icon: Moon, title: 'Страхи и кошмары', desc: 'Ночные кошмары, страхи, панические атаки.', link: '/appointment?category=Подростковые запросы&topic=Страхи и кошмары', linkText: 'Записаться на консультацию' },
    ],
  };

  const tabs = [
    { key: 'personal', label: 'Личные запросы', icon: User },
    { key: 'children', label: 'Детские запросы', icon: Baby },
    { key: 'teenagers', label: 'Подростковые запросы', icon: PersonStanding },
    { key: 'family', label: 'Семейные запросы', icon: Users },
  ];

  const currentRequests = requestsData[activeTab];

  useEffect(() => {
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
    revealOnScroll();

    return () => window.removeEventListener('scroll', revealOnScroll);
  }, []);

  return (
    <div>
      <section className="relative pt-24 pb-20 px-4 overflow-hidden" style={{ background: 'var(--bg-gradient-hero)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl float" style={{ animationDelay: '0s' }}></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/10 rounded-full blur-3xl float" style={{ animationDelay: '2s' }}></div>
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
            <Link to="/tests" className="group px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition transform" style={{ backgroundColor: 'var(--hero-btn-bg)', color: 'var(--hero-btn-text)' }}>
              Все тесты
              <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/appointment" className="group bg-transparent border-2 px-8 py-4 rounded-xl font-semibold text-lg transition hover:scale-105" style={{ borderColor: 'var(--hero-btn-border)', color: 'var(--text-on-bg)', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = 'var(--hero-btn-bg)'; e.target.style.color = 'var(--hero-btn-text)'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = 'var(--text-on-bg)'; }}
            >
              Записаться на консультацию
              <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 reveal" style={{ color: 'var(--text-primary)' }}>Обо мне</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="reveal scale-in">
              <img
                src={psychologistPhoto}
                alt="Ксения Панкратова - психолог"
                className="w-full h-[500px] object-cover rounded-3xl shadow-2xl"
              />
            </div>
            <div className="space-y-6 reveal">
              <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Здравствуйте! Меня зовут <strong className="text-primary">Ксения Панкратова</strong> —
                дипломированный психолог с многолетним опытом практики.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                <div className="flex items-center gap-3 rounded-xl p-3" style={{ backgroundColor: 'var(--primary-light)' }}>
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Дипломированный психолог</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl p-3" style={{ backgroundColor: 'var(--primary-light)' }}>
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Немедицинский психотерапевт</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl p-3" style={{ backgroundColor: 'var(--primary-light)' }}>
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Психодраматист</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl p-3" style={{ backgroundColor: 'var(--primary-light)' }}>
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Психолог для взрослых и детей (5+)</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl p-3" style={{ backgroundColor: 'var(--primary-light)' }}>
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Подростковый психолог</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl p-3" style={{ backgroundColor: 'var(--primary-light)' }}>
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Сексолог</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl p-3" style={{ backgroundColor: 'var(--primary-light)' }}>
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Арт-терапевт</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl p-3" style={{ backgroundColor: 'var(--primary-light)' }}>
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Ведущая психологических групп</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl p-3 sm:col-span-2" style={{ backgroundColor: 'var(--primary-light)' }}>
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Основатель частного детского сада, практика (2007-2016)</span>
                </div>
              </div>

              <div className="pt-4">
                <Link to="/appointment" className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition transform hover:-translate-y-1">
                  Записаться на первую встречу
                </Link>
              </div>
              <div className="pt-6 border-t" style={{ borderColor: isDark ? 'var(--border-color)' : '#e5e7eb' }}>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Я в соцсетях:</p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="https://vk.ru/pankratova_kseniya"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-2"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition transform ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white/20 hover:bg-white/30'}`}>
                      <img src={vkIcon} alt="VK" className="w-6 h-6 object-contain" />
                    </div>
                    <span className="text-xs text-center group-hover:text-primary transition" style={{ color: 'var(--text-muted)' }}>Основная страница ВКонтакте</span>
                  </a>
                  <a
                    href="https://vk.ru/it_mama62"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-2"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition transform ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white/20 hover:bg-white/30'}`}>
                      <img src={vkIcon} alt="VK" className="w-6 h-6 object-contain" />
                    </div>
                    <span className="text-xs text-center group-hover:text-primary transition" style={{ color: 'var(--text-muted)' }}>Группа ВКонтакте</span>
                  </a>
                  <a
                    href="https://max.ru/join/6HA8FoejJXU4ExztiPfwUh-ueBUh29SqE4qkW2iHdyY"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-2"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition transform ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white/20 hover:bg-white/30'}`}>
                      <img src={maxIcon} alt="Max" className="w-7 h-7 object-contain rounded-full" />
                    </div>
                    <span className="text-xs text-center group-hover:text-primary transition" style={{ color: 'var(--text-muted)' }}>Мессенджер Макс</span>
                  </a>
                  <a
                    href="https://t.me/+oBt1XAigVGA2ZjUy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-2"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition transform ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white/20 hover:bg-white/30'}`}>
                      <svg className="w-6 h-6 text-[#2AABEE]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                    </div>
                    <span className="text-xs text-center group-hover:text-primary transition" style={{ color: 'var(--text-muted)' }}>Telegram-канал</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 reveal" style={{ background: 'var(--bg-gradient-hero)' }}>
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

      <section className="py-20 px-4 reveal" style={{ background: 'var(--bg-gradient-hero)' }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-4">Моя история</h2>
          <p className="text-center text-white/80 mb-12 max-w-2xl mx-auto">
            Более 17 лет практики в психологии и работе с детьми
          </p>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-white/30 hidden md:block"></div>

            <div className="space-y-8">
              {[
                {
                  year: '2023 — н.в.',
                  title: 'Частная практика',
                  role: 'Психолог',
                  desc: 'Индивидуальное консультирование, работа с парами, диагностика архетипов, подростковая и арт-терапия.'
                },
                {
                  year: '2021 — 2023',
                  title: 'Детский центр "МОРСКАЯ ШКОЛА"',
                  role: 'Психолог-педагог',
                  desc: 'Диагностика и коррекция эмоционального состояния детей, работа с родителями.'
                },
                {
                  year: '2019 — 2020',
                  title: 'Центр детского творчества «Феникс»',
                  role: 'Педагог-психолог',
                  desc: 'Психологическое сопровождение детей, групповые занятия.'
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
                  <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-white border-4 border-primary rounded-full z-10 hidden md:block"></div>
                  <div className={`ml-8 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/20 transition transform hover:scale-105 duration-300 fade-in">
                      <div className="text-3xl font-bold text-white mb-2">{item.year}</div>
                      <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                      <div className="text-white/80 text-sm font-medium mb-2">{item.role}</div>
                      <p className="text-white/90 text-sm">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 reveal">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4" style={{ color: 'var(--text-primary)' }}>С чем я работаю</h2>
          <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            Выберите категорию запросов и найдите то, что откликается именно вам
          </p>

          {/* Табы-переключатели */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-2xl p-1.5 gap-1" style={{ backgroundColor: isDark ? 'var(--tab-bg)' : '#f3f4f6' }}>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${
                      isActive
                        ? 'shadow-lg scale-105 text-white'
                        : isDark ? 'hover:bg-white/5' : 'hover:bg-white'
                    }`}
                    style={{ backgroundColor: isActive ? 'var(--bg-gradient-from)' : 'transparent', color: isActive ? 'white' : (isDark ? 'var(--tab-inactive)' : 'var(--text-secondary)') }}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Карточки запросов */}
          <div className="flex flex-wrap justify-center gap-8">
            {currentRequests.map((item, i) => (
              <div
                key={`${activeTab}-${i}`}
                className="rounded-2xl p-8 text-center hover:shadow-xl transition transform hover:-translate-y-2 reveal scale-in w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] max-w-sm"
                style={{ backgroundColor: 'var(--primary-light)', animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary-light-bg)' }}>
                  <item.icon className="w-8 h-8" style={{ color: 'var(--bg-gradient-from)' }} />
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                <p className="mb-4" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                <a href={item.link} className="font-semibold hover:underline inline-flex items-center gap-1" style={{ color: 'var(--bg-gradient-from)' }}>
                  {item.linkText} <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>

          {/* Примечание о других темах */}
          <div className="text-center mt-10">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Остальные темы указаны в разделе <a href="/appointment" className="text-primary font-semibold hover:underline">«Записаться на консультацию»</a>
            </p>
          </div>

          {/* Дисклеймер: с чем не работаю */}
          <div className="text-center mt-6 rounded-2xl p-5 max-w-2xl mx-auto" style={{ backgroundColor: 'var(--disclaimer-bg)', borderColor: 'var(--disclaimer-border)', borderWidth: '1px', borderStyle: 'solid' }}>
            <p className="font-semibold text-sm" style={{ color: 'var(--disclaimer-text)' }}>
              Не работаю с онкологией и суицидальным поведением
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 reveal" style={{ background: 'var(--bg-gradient-hero)' }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-4">Польза работы с психологом</h2>
          <p className="text-center text-white/80 mb-12 max-w-2xl mx-auto">
            Профессиональная психологическая помощь — это инвестиция в качество вашей жизни
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: HeartHandshake, title: 'Понимание себя', desc: 'Вы научитесь распознавать свои истинные потребности, чувства и мотивы. Это даст ясность в принятии решений и понимание, почему вы поступаете так, а не иначе.' },
              { icon: Shield, title: 'Устойчивость к стрессу', desc: 'Психолог поможет выработать внутренние опоры, чтобы вы могли справляться с трудностями без разрушения себя и отношений.' },
              { icon: Users, title: 'Гармоничные отношения', desc: 'Работа с паттернами поведения позволит строить более близкие, доверительные и глубокие отношения с близкими людьми.' },
              { icon: Lightbulb, title: 'Осознанный выбор', desc: 'Вместо импульсивных реакций и автоматических сценариев вы получите свободу выбирать — как отвечать на вызовы жизни.' },
              { icon: HeartCrack, title: 'Проживание боли', desc: 'Безопасное пространство для проживания горя, утраты, обиды и других тяжёлых чувств, которые в одиночку нести слишком тяжело.' },
              { icon: GraduationCap, title: 'Рост и развитие', desc: 'Психологическая работа — это не только про «починку», но и про раскрытие вашего потенциала, талантов и возможностей.' },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 hover:bg-white/20 transition transform hover:scale-105 duration-300 reveal scale-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 text-center">{item.title}</h3>
                <p className="text-white/80 text-sm text-center leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 reveal" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 scale-in" style={{ color: 'var(--text-primary)' }}>Готовы узнать себя лучше?</h2>
          <p className="text-xl mb-8 reveal" style={{ color: 'var(--text-muted)' }}>
            Пройдите тест бесплатно прямо сейчас. Регистрация потребуется только для сохранения результатов.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center reveal">
            <Link to="/tests" className="group text-white px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition transform" style={{ backgroundColor: 'var(--bg-gradient-from)' }}>
              Все тесты
              <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/appointment" className="group px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition transform" style={{ backgroundColor: isDark ? 'var(--bg-card-alt)' : '#f3f4f6', color: 'var(--text-primary)' }}>
              Записаться к психологу
              <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
