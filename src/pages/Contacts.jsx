import { useState, useEffect } from 'react';
import { Phone, MapPin, X } from 'lucide-react';
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
  const [lightbox, setLightbox] = useState(null);

  // Просмотр фото закрывается по Escape — как ожидается от модального окна.
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => e.key === 'Escape' && setLightbox(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

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
              onClick={() => setLightbox(photo)}
              className={`group relative overflow-hidden rounded-2xl shadow-xl transition hover:shadow-2xl ${
                i === 0 ? 'col-span-2 md:col-span-2 md:row-span-2' : ''
              }`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className="w-full h-full object-cover aspect-[4/5] group-hover:scale-105 transition duration-500"
              />
            </button>
          ))}
        </div>

        {/* Как добраться */}
        <h2 className="text-3xl font-bold text-center text-white mb-2">Как добраться</h2>
        <p className="text-center text-white/80 mb-8 max-w-2xl mx-auto">
          Пешком от остановок около 7 минут.
        </p>

        <div className="rounded-3xl shadow-2xl p-4 md:p-6" style={cardStyle}>
          <button onClick={() => setLightbox({ src: route, alt: 'Схема прохода до кабинета' })} className="block w-full">
            <img
              src={route}
              alt="Схема прохода до кабинета: Быстрецкая улица, 18к2, подъезд 2"
              loading="lazy"
              className="w-full rounded-2xl"
            />
          </button>
          <p className="text-center mt-4" style={{ color: 'var(--text-secondary)' }}>
            {ADDRESS}
          </p>
        </div>
      </div>

      {/* Просмотр фото во весь экран */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            aria-label="Закрыть"
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className="max-w-full max-h-full rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Contacts;
