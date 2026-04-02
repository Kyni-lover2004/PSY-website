import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { usePhoneMask } from '../hooks/usePhoneMask';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { phone, setPhone, handleChange, handleFocus, getCleanPhone } = usePhoneMask('+7');
  const [formData, setFormData] = useState({
    surname: '',
    name: '',
    password: '',
    confirmPassword: '',
    gender: 'female'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Проверка паролей
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        surname: formData.surname,
        name: formData.name,
        phone: getCleanPhone(),
        password: formData.password,
        gender: formData.gender
      });

      // Сохраняем пользователя
      const user = {
        id: response.data.user_id,
        name: response.data.name,
        surname: response.data.surname,
        gender: response.data.gender
      };
      localStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('compatibilityCode', response.data.compatibility_code);

      // Проверяем, был ли редирект с теста
      const redirect = searchParams.get('redirect');
      if (redirect === 'test') {
        navigate('/test/archetypes/anketa');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.detail || 'Ошибка регистрации. Попробуйте другой номер телефона.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-8 fade-in">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Регистрация</h1>
        <p className="text-center text-gray-600 mb-8">
          {searchParams.get('redirect') === 'test' 
            ? 'Зарегистрируйтесь для прохождения теста'
            : 'Для сохранения результатов и кода совместимости'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Фамилия *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
                value={formData.surname}
                onChange={(e) => setFormData({...formData, surname: e.target.value})}
                placeholder="Иванова"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Имя *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Мария"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Номер телефона *</label>
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
            <label className="block text-gray-700 font-semibold mb-2">Пароль *</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Минимум 6 символов"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Подтверждение пароля *</label>
            <input
              type="password"
              required
              minLength={6}
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
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Уже зарегистрированы?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
