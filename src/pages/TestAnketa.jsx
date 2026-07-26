import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, ArrowLeft, Brain } from 'lucide-react';

const TestAnketa = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();

  if (!user) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const testData = {
      login: user.login,
      gender: user.gender,
    };

    sessionStorage.setItem('testData', JSON.stringify(testData));
    navigate('/test/questionnaire');
  };

  return (
    <div className="py-12 px-4" style={{ background: 'var(--bg-gradient-hero)', minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/test/archetypes')}
            className="text-white/80 hover:text-white flex items-center gap-2 mb-4 mx-auto transition"
          >
            <ArrowLeft className="w-4 h-4" /> Назад к выбору
          </button>
          <h1 className="text-4xl font-bold text-white mb-4">Самоисследование</h1>
          <p className="text-xl text-white/80">
            Пройдите тест и узнайте свой ведущий архетип
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-8 text-center">
          <p className="text-white/90 flex items-center justify-center gap-2">
            <User className="w-4 h-4" /> <span className="font-semibold">@{user.login}</span> •{' '}
            {user.gender === 'female' ? 'Женский' : 'Мужской'} пол
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-white/10 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white font-semibold text-sm">12 архетипов</h3>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-white font-semibold text-sm">~15 минут</h3>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-white font-semibold text-sm">В кабинет</h3>
          </div>
        </div>

        <div className="rounded-3xl shadow-2xl p-8 fade-in" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <h2 className="text-2xl font-bold text-center mb-6" style={{ color: 'var(--text-primary)' }}>Готовы?</h2>
          <p className="text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
            Пол определён автоматически: <strong>{user.gender === 'female' ? 'Женский' : 'Мужской'}</strong>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/test/archetypes')}
                className="flex-1 py-4 rounded-xl font-semibold hover:shadow-lg transition"
                style={{ backgroundColor: isDark ? 'var(--bg-card-alt)' : '#e5e7eb', color: 'var(--text-secondary)' }}
              >
                Назад
              </button>
              <button
                type="submit"
                className="flex-1 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition transform"
                style={{ backgroundColor: 'var(--bg-gradient-from)' }}
              >
                Начать тест
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TestAnketa;
