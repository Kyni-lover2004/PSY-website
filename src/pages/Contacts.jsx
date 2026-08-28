import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Phone, MapPin, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { PHONE, PHONE_HREF, ADDRESS, SOCIALS } from '../lib/contacts';
import cabinet1 from '../assets/cabinet/cabinet-1.jpg';
import cabinet2 from '../assets/cabinet/cabinet-2.jpg';
import cabinet3 from '../assets/cabinet/cabinet-3.jpg';
import cabinet4 from '../assets/cabinet/cabinet-4.jpg';
import cabinet5 from '../assets/cabinet/cabinet-5.jpg';
import route from '../assets/cabinet/route.jpg';

const PHOTOS = [
  { src: cabinet4, alt: 'Кабинет: кресло у окна' },
  { src: cabinet5, alt: 'Кабинет: два кресла и столик у окна' },
  { src: cabinet1, alt: 'Уголок кабинета с картиной и комодом' },
  { src: cabinet2, alt: 'Расписной комод с сухоцветами' },
  { src: cabinet3, alt: 'Детали интерьера кабинета' },
];

const Contacts = () => {
  const { isDark } = useTheme();
  // Просмотр открывается по индексу — так фото можно листать, не закрывая.
  const [viewer, setViewer] = useState(null);
  const gallery = viewer?.list || [];
  const current = viewer ? gallery[viewer.index] : null;

  const close = useCallback(() => setViewer(null), []);
  const step = useCallback(
    (delta) =>
      setViewer((v) => (v ? { ...v, index: (v.index + delta + v.list.length) % v.list.length } : v)),
    []
  );

  useEffect(() => {
    if (!viewer) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    // Фон не должен уезжать под открытым просмотром.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [viewer, close, step]);

  const cardStyle = { backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' };

  return (
    <div className="min-h-screen py-16 px-4" style={{ background: 'var(--bg-gradient-hero)' }}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-white mb-4">Контакты</h1>
        <p className="text-center text-white/80 mb-12 max-w-2xl mx-auto">
          Напишите удобным способом или позвоните — отвечу и помогу подобрать время.
        </p>

        {/* Телефон и адрес */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <a
            href={PHONE_HREF}
            className="rounded-3xl shadow-2xl p-6 flex items-center gap-4 transition hover:shadow-xl"
            style={cardStyle}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--bg-gradient-from)' }}
            >
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Телефон</div>
              <div className="text-xl font-semibold whitespace-nowrap">{PHONE}</div>
            </div>
          </a>

          <div className="rounded-3xl shadow-2xl p-6 flex items-center gap-4" style={cardStyle}>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--bg-gradient-from)' }}
            >
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Адрес кабинета</div>
              <div className="font-semibold">{ADDRESS}</div>
            </div>
          </div>
        </div>

        {/* Мессенджеры и соцсети */}
        <div className="rounded-3xl shadow-2xl p-6 md:p-8 mb-12" style={cardStyle}>
          <h2 className="text-xl font-bold mb-4">Написать в мессенджер</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {SOCIALS.map(({ key, label, color, Icon, href }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 p-4 rounded-xl font-semibold text-white transition hover:shadow-lg"
                style={{ backgroundColor: color }}
              >
                <Icon className="w-6 h-6 shrink-0" />
                <span>{label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Фотографии кабинета */}
        <h2 className="text-3xl font-bold text-center text-white mb-2">Кабинет</h2>
        <p className="text-center text-white/80 mb-8 max-w-2xl mx-auto">
          Спокойное место, где вас никто не побеспокоит. Нажмите на фото, чтобы рассмотреть.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-16">
          {PHOTOS.map((photo, i) => (
            <button
              key={photo.src}
              onClick={() => setViewer({ list: PHOTOS, index: i })}
              className={`group relative overflow-hidden rounded-2xl shadow-xl transition hover:shadow-2xl ${
                i === 0 ? 'col-span-2 md:row-span-2' : ''
              }`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className="w-full h-full object-cover aspect-[4/5] group-hover:scale-105 transition duration-500"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
              <span className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition duration-300">
                <Maximize2 className="w-4 h-4 text-white" />
              </span>
              <span className="absolute left-4 right-4 bottom-4 text-left text-white text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition duration-300">
                {photo.alt}
              </span>
            </button>
          ))}
        </div>

        {/* Как добраться */}
        <h2 className="text-3xl font-bold text-center text-white mb-2">Как добраться</h2>
        <p className="text-center text-white/80 mb-8 max-w-2xl mx-auto">
          Пешком от остановок около 7 минут.
        </p>

        <div className="rounded-3xl shadow-2xl p-4 md:p-6" style={cardStyle}>
          <button
            onClick={() => setViewer({ list: [{ src: route, alt: 'Схема прохода до кабинета' }], index: 0 })}
            className="block w-full group relative overflow-hidden rounded-2xl"
          >
            <img
              src={route}
              alt="Схема прохода до кабинета: Быстрецкая улица, 18к2, подъезд 2"
              loading="lazy"
              className="w-full rounded-2xl"
            />
            <span className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
              <Maximize2 className="w-4 h-4 text-white" />
            </span>
          </button>
          <p className="text-center mt-4" style={{ color: 'var(--text-secondary)' }}>
            {ADDRESS}
          </p>
        </div>
      </div>

      {/* Просмотр фото. Рендерится в body: у обёртки страницы есть transform,
          а он ломает position: fixed — окно уезжало вверх страницы и пряталось
          под кнопкой меню. */}
      {current &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 sm:p-6"
            style={{ backgroundColor: 'rgba(15, 23, 21, 0.92)', backdropFilter: 'blur(6px)' }}
            onClick={close}
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={close}
              aria-label="Закрыть"
              className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <figure
              className="relative flex flex-col items-center max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={current.src}
                alt={current.alt}
                className="rounded-2xl object-contain shadow-2xl max-h-[72vh] sm:max-h-[76vh] max-w-[92vw] sm:max-w-[min(88vw,760px)]"
                style={{ border: '1px solid rgba(255,255,255,0.12)' }}
              />
              <figcaption className="mt-4 text-center text-white/85 text-sm px-4">
                {current.alt}
              </figcaption>
            </figure>

            {gallery.length > 1 && (
              <div
                className="mt-4 flex items-center gap-4"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => step(-1)}
                  aria-label="Предыдущее фото"
                  className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <span className="text-white/70 text-sm tabular-nums w-14 text-center">
                  {viewer.index + 1} / {gallery.length}
                </span>
                <button
                  onClick={() => step(1)}
                  aria-label="Следующее фото"
                  className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};

export default Contacts;
