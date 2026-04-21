import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

const Register = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
const [formData, setFormData] = useState({
  login: '',
  password: '',
  confirmPassword: '',
  gender: 'female'
});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 8) {
      setError('Пароль должен быть не менее 8 символов');
      return;
    }

    if (formData.login.length < 3) {
      setError('Логин должен быть не менее 3 символов');
      return;
    }

    setLoading(true);

try {
  const response = await authAPI.register({
    login: formData.login,
    password: formData.password,
    gender: formData.gender
  });

      // Очищаем sessionStorage перед входом нового пользователя
      sessionStorage.removeItem('testData');
      sessionStorage.removeItem('sessionId');
      sessionStorage.removeItem('compatibilityCode');

      const user = { ...response.data.user, compatibility_code: response.data.compatibility_code, created_at: response.data.user.created_at };
      const token = response.data.access_token;

      login(user, token);

      const redirect = searchParams.get('redirect');
      if (redirect === 'test') {
        navigate('/test/archetypes/anketa');
      } else {
        // Если был редирект на регистрацию с /appointment — перенаправляем туда
        const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
        if (savedRedirect) {
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(savedRedirect);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.detail || 'Ошибка регистрации. Попробуйте другой логин.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4" style={{ background: 'var(--bg-gradient-hero)', minHeight: '100vh' }}>
      <div className="max-w-md mx-auto rounded-3xl shadow-2xl p-8 fade-in" style={{ backgroundColor: 'var(--bg-card)' }}>
        <h1 className="text-3xl font-bold text-center mb-2" style={{ color: isDark ? 'var(--text-primary)' : '#1F2937' }}>Регистрация</h1>
        <p className="text-center mb-8" style={{ color: isDark ? 'var(--text-muted)' : '#6B7280' }}>
          {searchParams.get('redirect') === 'test'
            ? 'Зарегистрируйтесь для прохождения теста'
            : 'Для сохранения результатов и кода совместимости'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-2" style={{ color: isDark ? 'var(--text-secondary)' : '#374151' }}>Логин *</label>
            <input
              type="text"
              required
              minLength={3}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition"
              style={{ borderColor: isDark ? 'var(--border-color)' : '#E5E7EB', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
              value={formData.login}
              onChange={(e) => setFormData({...formData, login: e.target.value})}
              placeholder="Придумайте логин"
            />
          </div>

  <div>
            <label className="block font-semibold mb-2" style={{ color: isDark ? 'var(--text-secondary)' : '#374151' }}>Пароль *</label>
            <input
              type="password"
              required
              minLength={8}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition"
              style={{ borderColor: isDark ? 'var(--border-color)' : '#E5E7EB', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Минимум 8 символов"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2" style={{ color: isDark ? 'var(--text-secondary)' : '#374151' }}>Подтверждение пароля *</label>
            <input
              type="password"
              required
              minLength={8}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition"
              style={{ borderColor: isDark ? 'var(--border-color)' : '#E5E7EB', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              placeholder="Повторите пароль"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2" style={{ color: isDark ? 'var(--text-secondary)' : '#374151' }}>Пол *</label>
            <select
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition"
              style={{ borderColor: isDark ? 'var(--border-color)' : '#E5E7EB', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
            >
              <option value="female">Женский</option>
              <option value="male">Мужской</option>
            </select>
          </div>

          {error && (
            <div className="border px-4 py-3 rounded-xl flex items-center gap-2" style={{ backgroundColor: 'var(--disclaimer-bg)', borderColor: 'var(--disclaimer-border)', color: 'var(--disclaimer-text)' }}>
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
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="text-center mt-6" style={{ color: isDark ? 'var(--text-muted)' : '#6B7280' }}>
          Уже есть аккаунт?{' '}
          <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--bg-gradient-from)' }}>Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
