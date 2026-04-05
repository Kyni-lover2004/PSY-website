import { BookOpen, ExternalLink, Sparkles } from 'lucide-react';

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
  return (
    <div className="min-h-screen py-16 px-4" style={{ background: 'linear-gradient(135deg, #6B8F8B 0%, #4A6B68 100%)' }}>
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

        {/* Категории */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <span
              key={cat}
              className="bg-white/15 text-white px-4 py-2 rounded-full text-sm font-medium"
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Книги */}
        <div className="grid md:grid-cols-2 gap-6">
          {books.map((book, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 transition-all duration-300 hover:bg-white/20 hover:scale-[1.02] hover:shadow-2xl reveal scale-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
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
