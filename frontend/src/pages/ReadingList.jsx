import { BookOpen, ExternalLink, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const books = [
  {
    title: 'Архетипы и символы коллективного бессознательного',
    author: 'Карл Густав Юнг',
    description: 'Фундаментальная работа о природе архетипов и их проявлении в психике человека.',
    category: 'Аналитическая психология',
  },
  {
    title: 'Душа и миф: шесть сущностей',
    author: 'Джеймс Хиллман',
    description: 'Исследование мифологических структур в повседневной психологической жизни.',
    category: 'Аналитическая психология',
  },
  {
    title: 'Герой с тысячью лицами',
    author: 'Джозеф Кэмпбелл',
    description: 'Классическое исследование мономифа и архетипа героя в мировых мифологиях.',
    category: 'Мифология и архетипы',
  },
  {
    title: 'Тайная сторона психики',
    author: 'Мари-Луиза фон Франц',
    description: 'Глубокое погружение в юнгианский анализ сновидений и символов.',
    category: 'Аналитическая психология',
  },
  {
    title: 'Внутренний ребёнок: исцеление травмы',
    author: 'Стефани Шталь',
    description: 'Практическое руководство по работе с детскими травмами и внутренним ребёнком.',
    category: 'Самопомощь',
  },
  {
    title: 'Границы личности',
    author: 'Анри Клод Азур',
    description: 'О личных границах и умении говорить «нет» без чувства вины.',
    category: 'Отношения и границы',
  },
  {
    title: 'Обнимай меня крепче',
    author: 'Сью Джонсон',
    description: 'Семь бесед, которые помогут вам оставаться вместе всю жизнь. Терапия привязанности.',
    category: 'Отношения в паре',
  },
  {
    title: 'Дары несовершенства',
    author: 'Брене Браун',
    description: 'О мужестве быть уязвимым и о том, как перестать стремиться к идеалу.',
    category: 'Самопринятие',
  },
  {
    title: 'Тело помнит всё',
    author: 'Бессел ван дер Колк',
    description: 'Революционная книга о влиянии травмы на тело и мозг и путях исцеления.',
    category: 'Травма',
  },
  {
    title: 'Как работать над ошибками в отношениях',
    author: 'Джон Готтман',
    description: 'Научный подход к пониманию того, что разрушает отношения и как это исправить.',
    category: 'Отношения в паре',
  },
];

const categories = [...new Set(books.map((b) => b.category))];

const ReadingList = () => {
  const { isDark } = useTheme();
  return (
    <div className="min-h-screen py-16 px-4" style={{ background: 'var(--bg-gradient-hero)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-16 fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-white/80" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Список литературы</h1>
          </div>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Рекомендованные книги для самостоятельного изучения.
            Каждая из них поможет глубже понять себя, свои отношения и внутренние процессы.
          </p>
        </div>

        <div className="rounded-3xl shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="p-8 text-center" style={{ background: isDark ? 'linear-gradient(135deg, rgba(84,110,122,0.3) 0%, rgba(74,75,92,0.2) 100%)' : '#ffffff' }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: isDark ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' : 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)' }}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: isDark ? 'var(--text-primary)' : '#1f2937' }}>Больше книг и рекомендаций</h2>
            <p className="mb-6 max-w-xl mx-auto" style={{ color: isDark ? 'var(--text-secondary)' : '#4b5563' }}>
              Подписывайтесь на мой Telegram-канал! Там ещё больше полезной литературы, разборов и практических упражнений для самопознания и работы над собой.
            </p>
            <a
              href="https://t.me/+oBt1XAigVGA2ZjUy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition transform hover:scale-105"
              style={{ backgroundColor: '#2AABEE' }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Перейти в Telegram-канал
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Книги */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {books.map((book, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] hover:shadow-2xl reveal scale-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: isDark ? 'linear-gradient(135deg, rgba(245,158,11,0.8) 0%, rgba(249,115,22,0.8) 100%)' : 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)' }}>
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-white/50 text-xs uppercase tracking-wide">{book.category}</span>
                  <h3 className="text-lg font-bold text-white">{book.title}</h3>
                </div>
              </div>
              <p className="text-white/70 mb-3">
                <span className="text-white/90 font-medium">Автор:</span> {book.author}
              </p>
              <p className="text-white/80 leading-relaxed">{book.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReadingList;
