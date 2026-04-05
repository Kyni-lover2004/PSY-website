import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsDrawerOpen(false);
    navigate('/');
  };

  const closeDrawer = () => setIsDrawerOpen(false);
  const openDrawer = () => setIsDrawerOpen(true);

  const navLinkClass = (extra = '') =>
    `block w-full text-left px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-primary rounded-lg transition text-lg ${extra}`;

  return (
    <div className="min-h-screen">
      {/* Плавающая кнопка меню */}
      <button
        onClick={openDrawer}
        className="fixed top-4 right-4 z-30 p-2 bg-white/90 backdrop-blur rounded-lg shadow-lg hover:bg-white transition"
        aria-label="Открыть меню"
      >
        <Menu className="w-7 h-7 text-gray-700" />
      </button>

      {/* Затемнение фона */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={closeDrawer}
        />
      )}

      {/* Боковая шторка справа */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Заголовок шторки */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-primary">Меню</h2>
            <button
              onClick={closeDrawer}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Закрыть меню"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Навигация */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            <Link to="/" onClick={closeDrawer} className={navLinkClass()}>
              Главная
            </Link>
            <Link to="/tests" onClick={closeDrawer} className={navLinkClass()}>
              Тесты
            </Link>
            <Link to="/appointment" onClick={closeDrawer} className={navLinkClass()}>
              Записаться
            </Link>
            <Link to="/practices" onClick={closeDrawer} className={navLinkClass()}>
              Практики
            </Link>
            <Link to="/reading-list" onClick={closeDrawer} className={navLinkClass()}>
              Список литературы
            </Link>

            {user && (
              <>
                <div className="border-t my-4" />
                <Link to="/dashboard" onClick={closeDrawer} className={navLinkClass()}>
                  Кабинет
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={closeDrawer} className={navLinkClass('text-red-600 hover:bg-red-50')}>
                    <span className="flex items-center gap-2">
                      <Settings className="w-5 h-5" /> Админка
                    </span>
                  </Link>
                )}
                <div className="border-t my-4" />
                <button onClick={handleLogout} className={navLinkClass()}>
                  Выйти
                </button>
              </>
            )}

            {!user && (
              <>
                <div className="border-t my-4" />
                <Link to="/login" onClick={closeDrawer} className={navLinkClass()}>
                  Войти
                </Link>
                <Link
                  to="/register"
                  onClick={closeDrawer}
                  className="block w-full text-center mt-4 bg-primary text-white px-4 py-3 rounded-lg hover:shadow-lg transition text-lg"
                >
                  Регистрация
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2026 Психолог Ксения Панкратова. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
