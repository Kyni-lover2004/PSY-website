import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      {/* Навигация */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                🔮 Психолог Ксения Панкратова
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-primary transition">Главная</Link>
              <Link to="/test" className="text-gray-700 hover:text-primary transition">Тесты</Link>
              <Link to="/appointment" className="text-gray-700 hover:text-primary transition">Записаться</Link>
              
              {user ? (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-primary transition">Кабинет</Link>
                  <button onClick={handleLogout} className="text-gray-700 hover:text-primary transition">Выйти</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-primary transition">Войти</Link>
                  <Link to="/register" className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg hover:shadow-lg transition">
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Контент */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Футер */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 Психолог Ксения Панкратова. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
