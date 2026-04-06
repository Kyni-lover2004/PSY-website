import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, Settings, Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
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
    `block w-full text-left px-4 py-3 rounded-lg transition text-lg ${
      isDark
        ? 'text-gray-300 hover:bg-white/5 hover:text-white'
        : 'text-gray-700 hover:bg-purple-50 hover:text-primary'
    } ${extra}`;

  return (
    <div className="min-h-screen">
      {/* Плавающая кнопка меню */}
      <button
        onClick={openDrawer}
        className={`fixed top-4 right-4 z-30 p-2 rounded-lg shadow-lg transition ${
          isDark
            ? 'bg-gray-800/90 backdrop-blur hover:bg-gray-700'
            : 'bg-white/90 backdrop-blur hover:bg-white'
        }`}
        aria-label="Открыть меню"
      >
        <Menu className={`w-7 h-7 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
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
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Заголовок шторки */}
          <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-gray-700' : ''}`}>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-primary'}`}>Меню</h2>
            <button
              onClick={closeDrawer}
              className={`p-2 rounded-lg transition ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              aria-label="Закрыть меню"
            >
              <X className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
            </button>
          </div>

          {/* Переключатель темы */}
          <div className={`flex items-center justify-between px-6 py-3 border-b ${isDark ? 'border-gray-700' : ''}`}>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Тема оформления</span>
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                isDark
                  ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isDark ? <><Moon className="w-4 h-4" /> Тёмная</> : <><Sun className="w-4 h-4" /> Светлая</>}
            </button>
          </div>

          {/* Навигация */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            <Link to="/" onClick={closeDrawer} className={navLinkClass()}>Главная</Link>
            <Link to="/tests" onClick={closeDrawer} className={navLinkClass()}>Тесты</Link>
            <Link to="/appointment" onClick={closeDrawer} className={navLinkClass()}>Записаться</Link>
            <Link to="/practices" onClick={closeDrawer} className={navLinkClass()}>Практики</Link>
            <Link to="/price" onClick={closeDrawer} className={navLinkClass()}>Прайс</Link>
            <Link to="/reading-list" onClick={closeDrawer} className={navLinkClass()}>Список литературы</Link>
            <div className={`px-4 py-3 opacity-50 cursor-not-allowed`}>
              <span className={`text-lg flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Курсы <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-500'}`}>скоро</span>
              </span>
            </div>

            {user && (
              <>
                <div className={`border-t my-4 ${isDark ? 'border-gray-700' : ''}`} />
                <Link to="/dashboard" onClick={closeDrawer} className={navLinkClass()}>Кабинет</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={closeDrawer} className={navLinkClass('text-red-400 hover:bg-red-900/20')}>
                    <span className="flex items-center gap-2">
                      <Settings className="w-5 h-5" /> Админка
                    </span>
                  </Link>
                )}
                <div className={`border-t my-4 ${isDark ? 'border-gray-700' : ''}`} />
                <button onClick={handleLogout} className={navLinkClass()}>Выйти</button>
              </>
            )}

            {!user && (
              <>
                <div className={`border-t my-4 ${isDark ? 'border-gray-700' : ''}`} />
                <Link to="/login" onClick={closeDrawer} className={navLinkClass()}>Войти</Link>
                <Link
                  to="/register"
                  onClick={closeDrawer}
                  className={`block w-full text-center mt-4 px-4 py-3 rounded-lg hover:shadow-lg transition text-lg ${
                    isDark ? 'bg-primary/80 text-white hover:bg-primary' : 'bg-primary text-white hover:shadow-lg'
                  }`}
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

      <footer className={`py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-900'} text-white`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2026 Психолог Ксения Панкратова. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
