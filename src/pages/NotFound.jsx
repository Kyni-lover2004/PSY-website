import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const NotFound = () => {
  const { isDark } = useTheme();

  return (
    <div
      className="min-h-screen py-20 px-4 flex items-center justify-center"
      style={{ background: 'var(--bg-gradient-hero)' }}
    >
      <div
        className="max-w-lg w-full rounded-3xl shadow-2xl p-8 text-center"
        style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
      >
        <Compass className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--bg-gradient-from)' }} />
        <h1 className="text-3xl font-bold mb-2">Страница не найдена</h1>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
          Возможно, ссылка устарела или в адресе опечатка.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition hover:shadow-lg"
            style={{ backgroundColor: 'var(--bg-gradient-from)' }}
          >
            <ArrowLeft className="w-5 h-5" /> На главную
          </Link>
          <Link
            to="/tests"
            className="px-6 py-3 rounded-xl font-semibold transition"
            style={{
              backgroundColor: isDark ? 'var(--bg-card-alt)' : '#f3f4f6',
              color: 'var(--text-secondary)',
            }}
          >
            Все тесты
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
