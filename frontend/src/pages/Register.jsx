import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

const Register = () => {
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

      const user = response.data.user;
      const token = response.data.access_token;
      
      login(user, token);

      const redirect = searchParams.get('redirect');
      if (redirect === 'test') {
        navigate('/test/archetypes/anketa');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.detail || 'Ошибка регистрации. Попробуйте другой логин.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4" style={{ background: 'linear-gradient(135deg, #6B8F8B 0%, #4A6B68 100%)', minHeight: '100vh' }}>
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-8 fade-in">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Регистрация</h1>
        <p className="text-center text-gray-600 mb-8">
          {searchParams.get('redirect') === 'test'
            ? 'Зарегистрируйтесь для прохождения теста'
            : 'Для сохранения результатов и кода совместимости'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Логин *</label>
            <input
              type="text"
              required
              minLength={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
              value={formData.login}
              onChange={(e) => setFormData({...formData, login: e.target.value})}
              placeholder="Придумайте логин"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Пароль *</label>
            <input
              type="password"
              required
              minLength={8}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Минимум 8 символов"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Подтверждение пароля *</label>
            <input
              type="password"
              required
              minLength={8}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              placeholder="Повторите пароль"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Пол *</label>
            <select
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
            >
              <option value="female">Женский</option>
              <option value="male">Мужской</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
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

        <p className="text-center text-gray-600 mt-6">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
