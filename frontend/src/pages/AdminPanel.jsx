import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../api/api';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [tests, setTests] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  
  // Формы
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showAddAnswer, setShowAddAnswer] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [questionAnswers, setQuestionAnswers] = useState([]);
  const [testForm, setTestForm] = useState({ title: '', description: '', category: '' });
  const [questionForm, setQuestionForm] = useState({ text: '', order_index: 1 });
  const [answerForm, setAnswerForm] = useState({ text: '', score: 0, order_index: 1 });

  useEffect(() => {
    if (!user) return; // Ждем загрузки данных
    if (user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboardPromise = adminAPI.getDashboard().then(r => r.data).catch((err) => {
        console.error('Ошибка загрузки dashboard:', err);
        return null;
      });
      const usersPromise = adminAPI.getUsers().then(r => r.data).catch((err) => {
        console.error('Ошибка загрузки users:', err);
        return [];
      });
      const consultationsPromise = adminAPI.getConsultations().then(r => r.data).catch((err) => {
        console.error('Ошибка загрузки consultations:', err);
        return [];
      });
const testsPromise = adminAPI.getTests().then(r => r.data).catch((err) => {
  console.error('Ошибка загрузки tests:', err);
  return [];
});
      const questionsPromise = adminAPI.getQuestions().then(r => r.data).catch((err) => {
        console.error('Ошибка загрузки questions:', err);
        return [];
      });
      const testResultsPromise = adminAPI.getTestResults().then(r => r.data).catch((err) => {
        console.error('Ошибка загрузки testResults:', err);
        return [];
      });

      const [dashboard, usersData, consultationsData, testsData, questionsData, testResultsData] = await Promise.all([
        dashboardPromise,
        usersPromise,
        consultationsPromise,
        testsPromise,
        questionsPromise,
        testResultsPromise
      ]);

      if (dashboard) setStats(dashboard.stats);
      setUsers(usersData);
      setConsultations(consultationsData);
      setTests(testsData);
      setQuestions(questionsData);
      setTestResults(testResultsData);
    } catch (err) {
      console.error('Критическая ошибка загрузки:', err);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  // Тесты
  const handleCreateTest = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createTest(testForm);
      setTestForm({ title: '', description: '', category: '' });
      setShowCreateTest(false);
      fetchData();
      alert('✅ Тест создан!');
    } catch (error) {
      alert('Ошибка: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!confirm('Удалить тест?')) return;
    try {
      await adminAPI.deleteTest(testId);
      fetchData();
      alert('✅ Тест удален');
    } catch (error) {
      alert('Ошибка удаления');
    }
  };

  const loadTestQuestions = async (testId) => {
    try {
      const res = await adminAPI.getTestQuestions(testId);
      setTestQuestions(res.data);
      setSelectedTestId(testId);
      setShowAddQuestion(true);
    } catch (error) {
      alert('Ошибка загрузки вопросов');
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const questionData = {
        test_id: selectedTestId,
        text: questionForm.text,
        order_index: parseInt(questionForm.order_index) || 1
      };
      console.log('Отправляем вопрос:', questionData);
      await adminAPI.createQuestion(questionData);
      setQuestionForm({ text: '', order_index: questionForm.order_index + 1 });
      loadTestQuestions(selectedTestId);
      alert('✅ Вопрос добавлен!');
    } catch (error) {
      console.error('Ошибка при добавлении вопроса:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Неизвестная ошибка';
      alert('Ошибка: ' + errorMsg);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Удалить вопрос?')) return;
    try {
      await adminAPI.deleteQuestion(questionId);
      loadTestQuestions(selectedTestId);
      alert('✅ Вопрос удален');
    } catch (error) {
      alert('Ошибка удаления');
    }
  };

  const loadQuestionAnswers = async (questionId) => {
    try {
      const res = await adminAPI.getAnswers(questionId);
      setQuestionAnswers(res.data);
      setSelectedQuestionId(questionId);
      setShowAddAnswer(true);
    } catch (error) {
      alert('Ошибка загрузки ответов');
    }
  };

  const handleAddAnswer = async (e) => {
    e.preventDefault();
    try {
      const answerData = {
        question_id: selectedQuestionId,
        text: answerForm.text,
        score: parseFloat(answerForm.score) || 0,
        order_index: parseInt(answerForm.order_index) || 1
      };
      console.log('Отправляем ответ:', answerData);
      await adminAPI.createAnswer(answerData);
      setAnswerForm({ text: '', score: 0, order_index: answerForm.order_index + 1 });
      loadQuestionAnswers(selectedQuestionId);
      alert('✅ Вариант добавлен!');
    } catch (error) {
      console.error('Ошибка при добавлении ответа:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Неизвестная ошибка';
      alert('Ошибка: ' + errorMsg);
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!confirm('Удалить вариант?')) return;
    try {
      await adminAPI.deleteAnswer(answerId);
      loadQuestionAnswers(selectedQuestionId);
      alert('✅ Вариант удален');
    } catch (error) {
      alert('Ошибка удаления');
    }
  };

  // Пользователи
  const handleUserRoleUpdate = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Изменить роль на '${newRole}'?`)) return;
    try {
      await adminAPI.updateUserRole(userId, newRole);
      fetchData();
      alert('Роль обновлена');
    } catch (error) {
      alert('Ошибка обновления роли');
    }
  };

  const handleUserDelete = async (userId) => {
    if (!confirm('Удалить пользователя?')) return;
    try {
      await adminAPI.deleteUser(userId);
      fetchData();
      alert('Пользователь удален');
    } catch (error) {
      alert('Ошибка удаления');
    }
  };

  // Консультации
  const handleConsultationStatusUpdate = async (id, status) => {
    try {
      await adminAPI.updateConsultationStatus(id, status);
      fetchData();
    } catch (error) {
      alert('Ошибка обновления статуса');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6B8F8B 0%, #4A6B68 100%)' }}>
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4" style={{ background: 'linear-gradient(135deg, #6B8F8B 0%, #4A6B68 100%)', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">🔧 Админ-панель</h1>
            <p className="text-white/80">Администратор: {user?.login}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/" className="bg-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/30 transition font-semibold">🏠 На главную</Link>
            <button onClick={handleLogout} className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition font-semibold">Выйти</button>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">❌ {error}</div>}

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg"><div className="text-3xl font-bold text-primary">{stats.total_users || 0}</div><div className="text-gray-600 text-sm mt-1">Пользователей</div></div>
            <div className="bg-white rounded-2xl p-6 shadow-lg"><div className="text-3xl font-bold text-primary">{stats.total_consultations || 0}</div><div className="text-gray-600 text-sm mt-1">Консультаций</div></div>
            <div className="bg-white rounded-2xl p-6 shadow-lg"><div className="text-3xl font-bold text-yellow-600">{stats.new_consultations || 0}</div><div className="text-gray-600 text-sm mt-1">Новых заявок</div></div>
            <div className="bg-white rounded-2xl p-6 shadow-lg"><div className="text-3xl font-bold text-primary">{stats.total_tests || 0}</div><div className="text-gray-600 text-sm mt-1">Тестов</div></div>
            <div className="bg-white rounded-2xl p-6 shadow-lg"><div className="text-3xl font-bold text-primary">{stats.total_results || 0}</div><div className="text-gray-600 text-sm mt-1">Результатов</div></div>
          </div>
        )}

        <div className="flex gap-3 mb-8 flex-wrap">
          {[
            { id: 'dashboard', icon: '📊', label: 'Обзор' },
            { id: 'users', icon: '👥', label: 'Пользователи' },
            { id: 'test-results', icon: '📈', label: 'Результаты тестов' },
            { id: 'consultations', icon: '📝', label: `Заявки (${consultations.filter(c => c.status === 'new').length})` },
            { id: 'tests', icon: '📋', label: `Тесты (${tests.length})` },
            { id: 'questions', icon: '❓', label: `Вопросы (${questions.length})` }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-3 rounded-xl font-semibold transition ${activeTab === tab.id ? 'bg-white text-primary shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 min-h-[400px]">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Обзор системы</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Последние пользователи</h3>
                  <div className="space-y-3">
                    {users.slice(0, 5).map(u => (
                      <div key={u.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div><div className="font-semibold">{u.login}</div><div className="text-sm text-gray-500">{u.telegram ? '@' + u.telegram : 'Нет Telegram'}</div></div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-700'}`}>{u.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Последние заявки</h3>
                  <div className="space-y-3">
                    {consultations.slice(0, 5).map(c => (
                      <div key={c.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold">{c.name}</span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${c.status === 'new' ? 'bg-green-100 text-green-800' : c.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-700'}`}>{c.status === 'new' ? 'Новая' : c.status === 'in_progress' ? 'В работе' : 'Завершена'}</span>
                        </div>
                        <div className="text-sm text-gray-600 truncate">{c.topic || c.category || c.request}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users */}
          {activeTab === 'users' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">👥 Пользователи</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="bg-gray-100">
                    <th className="p-3 text-left">ID</th><th className="p-3 text-left">Логин</th><th className="p-3 text-left">Telegram</th>
                    <th className="p-3 text-left">Пол</th><th className="p-3 text-left">Роль</th><th className="p-3 text-left">Действия</th>
                  </tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{u.id}</td><td className="p-3 font-semibold">{u.login}</td><td className="p-3">{u.telegram || '-'}</td>
                        <td className="p-3">{u.gender || '-'}</td>
                        <td className="p-3"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-700'}`}>{u.role}</span></td>
                        <td className="p-3">
                          <button onClick={() => handleUserRoleUpdate(u.id, u.role)} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm hover:bg-yellow-200 mr-2 transition">Изменить роль</button>
                          <button onClick={() => handleUserDelete(u.id)} className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm hover:bg-red-200 transition">Удалить</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Результаты тестов */}
          {activeTab === 'test-results' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📈 Результаты тестов</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="bg-gray-100">
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Пользователь</th>
                    <th className="p-3 text-left">Telegram</th>
                    <th className="p-3 text-left">Пол</th>
                    <th className="p-3 text-left">Тип теста</th>
                    <th className="p-3 text-left">Архетип</th>
                    <th className="p-3 text-left">Баллы</th>
                    <th className="p-3 text-left">Дата</th>
                  </tr></thead>
                  <tbody>
                    {testResults.length > 0 ? (
                      testResults.map(r => (
                        <tr key={r.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{r.id}</td>
                          <td className="p-3 font-semibold">{r.user_login}</td>
                          <td className="p-3">{r.user_telegram ? '@' + r.user_telegram : '-'}</td>
                          <td className="p-3">{r.gender === 'male' ? 'Мужской' : r.gender === 'female' ? 'Женский' : '-'}</td>
                          <td className="p-3"><span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-lg text-sm font-semibold">{r.test_type}</span></td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-semibold">
                              {r.archetype_name || r.archetype_code || '-'}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-primary">{r.total_score}</td>
                          <td className="p-3 text-gray-500 text-sm">{new Date(r.completed_at).toLocaleString('ru-RU')}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="p-6 text-center text-gray-500">Пока нет результатов тестов</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {testResults.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-gray-700 mb-4">Детализация результатов</h3>
                  <div className="space-y-3">
                    {testResults.map(r => (
                      <div key={r.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-semibold">{r.user_login}</span>
                            {r.user_telegram && <span className="text-gray-500 text-sm ml-2">@{r.user_telegram}</span>}
                          </div>
                          <span className="text-gray-500 text-sm">{new Date(r.completed_at).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>🎯 Архетип: <strong>{r.archetype_name || r.archetype_code || '-'}</strong></div>
                          <div>📊 Баллы: <strong>{r.total_score}</strong></div>
                          <div>⚤ {r.gender === 'male' ? 'Мужской' : 'Женский'}</div>
                          <div>📋 {r.test_type}</div>
                        </div>
                        {r.scores_breakdown && (
                          <div className="mt-2 text-xs text-gray-600">
                            Детализация: {r.scores_breakdown}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Consultations */}
          {activeTab === 'consultations' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 Заявки на консультацию</h2>
              <div className="space-y-4">
                {consultations.length > 0 ? (
                  consultations.map(c => (
                    <div key={c.id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-primary transition">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-lg">{c.name}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.status === 'new' ? 'bg-green-100 text-green-800' : c.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-700'}`}>{c.status === 'new' ? 'Новая' : c.status === 'in_progress' ? 'В работе' : 'Завершена'}</span>
                        </div>
                        <span className="text-gray-500 text-sm">{new Date(c.created_at).toLocaleString('ru-RU')}</span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-3 mb-3 text-sm text-gray-600">
                        {c.telegram && <div>💬 Telegram: <strong>@{c.telegram}</strong></div>}
                        {c.category && <div>📁 Категория: <strong>{c.category}</strong></div>}
                        {c.topic && <div>🎯 Тема: <strong>{c.topic}</strong></div>}
                      </div>
                      <p className="text-gray-700 mb-4 p-3 bg-gray-50 rounded-lg">{c.request}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleConsultationStatusUpdate(c.id, 'in_progress')} className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm hover:bg-yellow-200 transition">В работу</button>
                        <button onClick={() => handleConsultationStatusUpdate(c.id, 'completed')} className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm hover:bg-green-200 transition">Завершить</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">Заявок пока нет</div>
                )}
              </div>
            </div>
          )}

          {/* Tests */}
          {activeTab === 'tests' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">📋 Тесты</h2>
                <button onClick={() => setShowCreateTest(true)} className="bg-primary text-white px-6 py-3 rounded-xl hover:shadow-lg transition font-semibold">+ Создать тест</button>
              </div>

              {showCreateTest && (
                <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border-2 border-primary/20">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Новый тест</h3>
                  <form onSubmit={handleCreateTest} className="space-y-4">
                    <div><label className="block text-gray-700 font-semibold mb-2">Название *</label>
                      <input type="text" required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none" value={testForm.title} onChange={(e) => setTestForm({...testForm, title: e.target.value})} placeholder="Тест на архетипы" /></div>
                    <div><label className="block text-gray-700 font-semibold mb-2">Описание</label>
                      <textarea className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none" rows="3" value={testForm.description} onChange={(e) => setTestForm({...testForm, description: e.target.value})} placeholder="Описание..." /></div>
                    <div><label className="block text-gray-700 font-semibold mb-2">Категория</label>
                      <input type="text" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none" value={testForm.category} onChange={(e) => setTestForm({...testForm, category: e.target.value})} placeholder="psychology" /></div>
                    <div className="flex gap-3">
                      <button type="submit" className="bg-primary text-white px-6 py-3 rounded-xl hover:shadow-lg transition font-semibold">✅ Создать</button>
                      <button type="button" onClick={() => setShowCreateTest(false)} className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition font-semibold">Отмена</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-4">
                {tests.map(t => (
                  <div key={t.id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-primary transition">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800 mb-2">{t.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{t.description || 'Нет описания'}</p>
                        <div className="flex gap-4 text-sm text-gray-500"><span>📁 {t.category || 'Без категории'}</span><span>📅 {new Date(t.created_at).toLocaleDateString('ru-RU')}</span></div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => loadTestQuestions(t.id)} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm hover:bg-blue-200 transition font-semibold">❓ Вопросы</button>
                        <button onClick={() => handleDeleteTest(t.id)} className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm hover:bg-red-200 transition font-semibold">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {showAddQuestion && (
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Вопросы к тесту #{selectedTestId}</h3>
                    <button onClick={() => setShowAddQuestion(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
                  </div>
                  <form onSubmit={handleAddQuestion} className="mb-6 p-4 bg-white rounded-xl">
                    <h4 className="font-semibold text-gray-700 mb-3">Добавить вопрос</h4>
                    <div className="space-y-3">
                      <div><label className="block text-gray-700 font-semibold mb-2">Текст *</label>
                        <textarea required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none" rows="3" value={questionForm.text} onChange={(e) => setQuestionForm({...questionForm, text: e.target.value})} placeholder="Вопрос..." /></div>
                      <div><label className="block text-gray-700 font-semibold mb-2">Порядок *</label>
                        <input type="number" required min="1" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none" value={questionForm.order_index} onChange={(e) => setQuestionForm({...questionForm, order_index: parseInt(e.target.value)})} /></div>
                      <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-semibold">+ Добавить вопрос</button>
                    </div>
                  </form>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700">Вопросы ({testQuestions.length})</h4>
                    {testQuestions.map(q => (
                      <div key={q.id} className="bg-white rounded-xl p-4 border-2 border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">№{q.order_index}</span>
                            <p className="text-gray-700 mt-2">{q.text}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button onClick={() => loadQuestionAnswers(q.id)} className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm hover:bg-green-200">💬 Ответы</button>
                            <button onClick={() => handleDeleteQuestion(q.id)} className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm hover:bg-red-200">🗑️</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showAddAnswer && (
                <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border-2 border-green-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Варианты для вопроса #{selectedQuestionId}</h3>
                    <button onClick={() => setShowAddAnswer(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
                  </div>
                  <form onSubmit={handleAddAnswer} className="mb-6 p-4 bg-white rounded-xl">
                    <h4 className="font-semibold text-gray-700 mb-3">Добавить вариант</h4>
                    <div className="space-y-3">
                      <div><label className="block text-gray-700 font-semibold mb-2">Текст *</label>
                        <input type="text" required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none" value={answerForm.text} onChange={(e) => setAnswerForm({...answerForm, text: e.target.value})} placeholder="Да, согласен" /></div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div><label className="block text-gray-700 font-semibold mb-2">Баллы *</label>
                          <input type="number" required step="0.1" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none" value={answerForm.score} onChange={(e) => setAnswerForm({...answerForm, score: parseFloat(e.target.value)})} /></div>
                        <div><label className="block text-gray-700 font-semibold mb-2">Порядок *</label>
                          <input type="number" required min="1" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none" value={answerForm.order_index} onChange={(e) => setAnswerForm({...answerForm, order_index: parseInt(e.target.value)})} /></div>
                      </div>
                      <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition font-semibold">+ Добавить вариант</button>
                    </div>
                  </form>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700">Варианты ({questionAnswers.length})</h4>
                    {questionAnswers.map(a => (
                      <div key={a.id} className="bg-white rounded-xl p-4 border-2 border-gray-200 flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">#{a.order_index}</span>
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">⭐ {a.score} баллов</span>
                          </div>
                          <p className="text-gray-700">{a.text}</p>
                        </div>
                        <button onClick={() => handleDeleteAnswer(a.id)} className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm hover:bg-red-200 ml-4">🗑️</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Questions */}
          {activeTab === 'questions' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">❓ Вопросы</h2>
              <div className="space-y-4">
                {questions.map(q => (
                  <div key={q.id} className="border-2 border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-4 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${q.gender_type === 'female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'}`}>{q.gender_type === 'female' ? 'Женский' : 'Мужской'}</span>
                      <span className="text-gray-600 text-sm">Код: {q.archetype_code}</span>
                      <span className="text-gray-600 text-sm">№{q.order_index}</span>
                    </div>
                    <p className="text-gray-700">{q.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
