import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { ARCHETYPE_IMAGES } from '../lib/archetypeImages';

// Разбор архетипа — это плакат с мелким текстом, поэтому кроме превью
// нужен полноэкранный просмотр с увеличением до натурального размера.
const ArchetypePoster = ({ code, name, isDark }) => {
  const src = ARCHETYPE_IMAGES[code];
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    setZoomed(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  if (!src) return null;

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden mb-6"
        style={{ backgroundColor: isDark ? 'var(--bg-card-alt)' : '#f9fafb' }}
      >
        <button
          onClick={() => setOpen(true)}
          className="group relative block w-full"
          aria-label={`Открыть разбор архетипа «${name}»`}
        >
          <img
            src={src}
            alt={`Разбор архетипа «${name}»`}
            className="w-full max-h-[70vh] object-contain mx-auto transition duration-500 group-hover:scale-[1.01]"
          />
          <span className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/45 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <Maximize2 className="w-5 h-5 text-white" />
          </span>
        </button>
        <p className="text-center text-sm py-3" style={{ color: 'var(--text-muted)' }}>
          Нажмите на изображение, чтобы рассмотреть подробно
        </p>
      </div>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100]"
            style={{ backgroundColor: 'rgba(15, 23, 21, 0.95)' }}
            onClick={close}
          >
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomed((z) => !z);
                }}
                aria-label={zoomed ? 'Уменьшить' : 'Увеличить'}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition"
              >
                {zoomed ? <ZoomOut className="w-6 h-6 text-white" /> : <ZoomIn className="w-6 h-6 text-white" />}
              </button>
              <button
                onClick={close}
                aria-label="Закрыть"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div
              className={`w-full h-full ${zoomed ? 'overflow-auto' : 'flex items-center justify-center p-4'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={src}
                alt={`Разбор архетипа «${name}»`}
                onClick={() => setZoomed((z) => !z)}
                className={
                  zoomed
                    ? 'max-w-none cursor-zoom-out'
                    : 'max-h-full max-w-full object-contain rounded-xl cursor-zoom-in'
                }
              />
            </div>

            {!zoomed && (
              <p className="absolute bottom-4 inset-x-0 text-center text-white/70 text-sm pointer-events-none">
                Нажмите на изображение, чтобы увеличить
              </p>
            )}
          </div>,
          document.body
        )}
    </>
  );
};

export default ArchetypePoster;
