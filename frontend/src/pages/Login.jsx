import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { usePhoneMask } from '../hooks/usePhoneMask';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { phone, setPhone, handleChange, handleFocus, getCleanPhone } = usePhoneMask('+7');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({
        phone: getCleanPhone(),
        password: password
      });

      const user = {
        id: response.data.user.id,
        name: response.data.user.name,
        surname: response.data.user.surname,
        phone: response.data.user.phone,
        gender: response.data.user.gender
      };
      localStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('compatibilityCode', response.data.compatibility_code);

      login(user);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Пользователь не найден. Зарегистрируйтесь сначала.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-8 fade-in">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Вход</h1>
        <p className="text-center text-gray-600 mb-8">Введите номер телефона и пароль</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Номер телефона</label>
            <input
              type="tel"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
              value={phone}
              onChange={handleChange}
              onFocus={handleFocus}
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Пароль</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите ваш пароль"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:scale-105'
            }`}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
