import { Link } from 'react-router-dom';
import { Sparkles, Compass, HeartPulse, ExternalLink, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const GAMES = [
  {
    key: 'perekhody',
    title: 'Переходы',
    subtitle: 'Ресурсная игра для женщин',
    Icon: Compass,
    accent: '#8F6B8F',
    about: [
      'Игра о женской природе, её ритмах и циклах и о переходах — тех жизненных этапах, когда меняются роли, ориентиры и планы: рождение ребёнка, смена профессии, выход из отношений или начало новых.',
      'Путь строится через четыре образа — Девочка, Девушка, Женщина, Старица — и через стихии огня, воды, земли и воздуха как ресурсные части женской природы. Запрос, с которым вы приходите, может быть любым.',
    ],
    gives: [
      'Опору в период перемен, когда привычное уже не работает',
      'Контакт с телом, своими ритмами и состояниями',
      'Ресурс от внутренних женских фигур, к которым можно возвращаться и после игры',
      'Взгляд на свой запрос со стороны — в безопасном кругу и без спешки',
    ],
    source: { label: 'Об игре у автора', href: 'https://www.irmaklimenko.ru/perekhody' },
  },
  {
    key: 'trevogi',
    title: 'Тревоги',
    subtitle: 'Игра о тревоге и опорах',
    Icon: Sparkles,
    accent: '#6B8F8B',
    about: [
      'Игра помогает рассмотреть собственную тревогу: из чего она складывается, что её запускает и как она проявляется в теле, мыслях и поступках.',
      'Тревогу не пытаются «выключить» — с ней знакомятся. Часто именно это снимает лишнее напряжение: то, что названо и понятно, пугает меньше.',
    ],
    gives: [
      'Понимание, что именно запускает тревогу именно у вас',
      'Умение замечать её ранние телесные сигналы',
      'Набор личных опор и способов самопомощи',
      'Меньше стыда за свои реакции и больше выбора в том, как отвечать',
    ],
  },
  {
    key: 'psychosomatics',
    title: 'Психосоматика',
    subtitle: 'Игра о связи тела и чувств',
    Icon: HeartPulse,
    accent: '#A8785F',
    about: [
      'Игра о том, как переживания отражаются в теле. Телесные сигналы рассматриваются не как поломка, а как сообщение, у которого есть смысл и адресат.',
      'В ходе игры исследуется, какие чувства остаются невыраженными и какую задачу берёт на себя тело, когда им не находится другого выхода.',
    ],
    gives: [
      'Более внимательное отношение к сигналам тела',
      'Связь между привычными состояниями и телесными реакциями',
      'Понимание, какие чувства давно не находили выражения',
      'Ориентиры, с чем идти дальше — к психологу или к врачу',
    ],
    note: 'Игра не заменяет обследование и лечение у врача.',
  },
];

const Games = () => {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen py-16 px-4" style={{ background: 'var(--bg-gradient-hero)' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-white mb-4">
          Трансформационные игры
        </h1>
        <p className="text-center text-white/80 mb-12 max-w-2xl mx-auto">
          Игра — мягкий способ посмотреть на свой запрос со стороны. Не гадание и не тренинг:
          вы остаётесь автором своих решений, а игра помогает их разглядеть.
        </p>

        <div className="space-y-6">
          {GAMES.map(({ key, title, subtitle, Icon, accent, about, gives, source, note }) => (
            <article
              key={key}
              className="rounded-3xl shadow-2xl overflow-hidden reveal"
              style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            >
              <div className="flex items-center gap-4 p-6 md:p-8" style={{ backgroundColor: accent }}>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
                  <p className="text-white/80 text-sm mt-0.5">{subtitle}</p>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="space-y-3 mb-6" style={{ color: 'var(--text-secondary)' }}>
                  {about.map((paragraph) => (
                    <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                  ))}
                </div>

                <h3 className="font-semibold mb-3">Что даёт</h3>
                <ul className="space-y-2 mb-6">
                  {gives.map((item) => (
                    <li key={item} className="flex gap-3" style={{ color: 'var(--text-secondary)' }}>
                      <span
                        className="mt-2 w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: accent }}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {note && (
                  <p
                    className="text-sm rounded-xl p-3 mb-6"
                    style={{
                      backgroundColor: isDark ? 'var(--bg-card-alt)' : '#f3f4f6',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {note}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/appointment"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition hover:shadow-lg"
                    style={{ backgroundColor: accent }}
                  >
                    Записаться на игру <ArrowRight className="w-5 h-5" />
                  </Link>
                  {source && (
                    <a
                      href={source.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition"
                      style={{
                        backgroundColor: isDark ? 'var(--bg-card-alt)' : '#f3f4f6',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {source.label} <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Games;
