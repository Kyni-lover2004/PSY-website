import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

const Login = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({
        login: formData.login,
        password: formData.password
      });

      const user = { ...response.data.user, compatibility_code: response.data.compatibility_code, created_at: response.data.user.created_at };
      const token = response.data.access_token;

      login(user, token);

      // Проверяем редирект после входа
      const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
      if (savedRedirect) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(savedRedirect);
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Пользователь не найден. Зарегистрируйтесь сначала.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4" style={{ background: 'var(--bg-gradient-hero)', minHeight: '100vh' }}>
      <div className="max-w-md mx-auto rounded-3xl shadow-2xl p-8 fade-in" style={{ backgroundColor: 'var(--bg-card)' }}>
        <h1 className="text-3xl font-bold text-center mb-2" style={{ color: isDark ? 'var(--text-primary)' : '#1F2937' }}>Вход</h1>
        <p className="text-center mb-8" style={{ color: isDark ? 'var(--text-muted)' : '#6B7280' }}>Введите логин и пароль</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-2" style={{ color: isDark ? 'var(--text-secondary)' : '#374151' }}>Логин</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition"
              style={{ borderColor: isDark ? 'var(--border-color)' : '#E5E7EB', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
              value={formData.login}
              onChange={(e) => setFormData({...formData, login: e.target.value})}
              placeholder="Ваш логин"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2" style={{ color: isDark ? 'var(--text-secondary)' : '#374151' }}>Пароль</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition"
              style={{ borderColor: isDark ? 'var(--border-color)' : '#E5E7EB', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Введите ваш пароль"
            />
          </div>

          {error && (
            <div className="border text-red-700 px-4 py-3 rounded-xl flex items-center gap-2" style={{ backgroundColor: 'var(--disclaimer-bg)', borderColor: 'var(--disclaimer-border)' }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white hover:shadow-lg hover:scale-105'
            }`}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className="text-center mt-6" style={{ color: isDark ? 'var(--text-muted)' : '#6B7280' }}>
          Нет аккаунта?{' '}
          <Link to="/register" className="font-semibold hover:underline" style={{ color: 'var(--bg-gradient-from)' }}>Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
