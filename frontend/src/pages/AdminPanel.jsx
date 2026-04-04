import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, BarChart3, Users, ClipboardList, FileQuestion, TestTube2, CalendarDays, Phone, Mail, User, Trash2, X, MessageSquare, Plus, Clock, FolderOpen, ChevronRight, CheckCircle } from 'lucide-react';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [tests, setTests] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const [showCreateTest, setShowCreateTest] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showAddAnswer, setShowAddAnswer] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [questionAnswers, setQuestionAnswers] = useState([]);
  
  // Формы
  const [testForm, setTestForm] = useState({ title: '', description: '', category: '' });
  const [questionForm, setQuestionForm] = useState({ text: '', order_index: 1 });
  const [answerForm, setAnswerForm] = useState({ text: '', score: 0, order_index: 1 });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = user.id;
      const API = 'http://localhost:8000/api';

      const [dashboardRes, usersRes, consultationsRes, testsRes, questionsRes] = await Promise.allSettled([
        fetch(`${API}/admin/dashboard?user_id=${userId}`),
        fetch(`${API}/admin/users?user_id=${userId}`),
        fetch(`${API}/admin/consultations?user_id=${userId}`),
        fetch(`${API}/tests`),
        fetch(`${API}/admin/questions?user_id=${userId}`)
      ]);

      if (dashboardRes.status === 'fulfilled' && dashboardRes.value.ok) {
        const data = await dashboardRes.value.json();
        setStats(data.stats);
      }

      if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
        const data = await usersRes.value.json();
        setUsers(data);
      }

      if (consultationsRes.status === 'fulfilled' && consultationsRes.value.ok) {
        const data = await consultationsRes.value.json();
        setConsultations(data);
      }

      if (testsRes.status === 'fulfilled' && testsRes.value.ok) {
        const data = await testsRes.value.json();
        setTests(data);
      }

      if (questionsRes.status === 'fulfilled' && questionsRes.value.ok) {
        const data = await questionsRes.value.json();
        setQuestions(data);
      }

    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError('Ошибка загрузки данных. Убедитесь что бэкенд запущен на порту 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUserRoleUpdate = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Изменить роль на '${newRole === 'admin' ? 'Админ' : 'Пользователь'}'?`)) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/users/update-role?user_id_target=${userId}&role=${newRole}&user_id=${user.id}`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        fetchData();
        alert('Роль обновлена');
      } else {
        alert('Ошибка обновления роли');
      }
    } catch (error) {
      alert('Ошибка: ' + error.message);
    }
  };

  const handleUserDelete = async (userId) => {
    if (!confirm('Удалить этого пользователя?')) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/users/${userId}?user_id=${user.id}`,
        { method: 'DELETE' }
      );
      
      if (response.ok) {
        fetchData();
        alert('Пользователь удален');
      } else {
        alert('Ошибка удаления пользователя');
      }
    } catch (error) {
      alert('Ошибка: ' + error.message);
    }
  };

  const handleConsultationStatusUpdate = async (consultationId, status) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/consultations/update-status?consultation_id=${consultationId}&status=${status}&user_id=${user.id}`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        fetchData();
      } else {
        alert('Ошибка обновления статуса');
      }
    } catch (error) {
      alert('Ошибка: ' + error.message);
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:8000/api/tests?user_id=${user.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testForm)
        }
      );
      
      if (response.ok) {
        alert('Тест создан!');
        setTestForm({ title: '', description: '', category: '' });
        setShowCreateTest(false);
        fetchData();
      } else {
        const error = await response.json();
        alert('Ошибка: ' + error.detail);
      }
    } catch (error) {
      alert('Ошибка: ' + error.message);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!confirm('Удалить этот тест и все его вопросы?')) return;
    try {
      const response = await fetch(
        `http://localhost:8000/api/tests/${testId}?user_id=${user.id}`,
        { method: 'DELETE' }
      );
      
      if (response.ok) {
        alert('Тест удален');
        fetchData();
      } else {
        alert('Ошибка удаления теста');
      }
    } catch (error) {
      alert('Ошибка: ' + error.message);
    }
  };

  const loadTestQuestions = async (testId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/tests/${testId}/questions`);
      if (response.ok) {
        const data = await response.json();
        setTestQuestions(data);
        setSelectedTestId(testId);
        setShowAddQuestion(true);
      }
    } catch (error) {
      console.error('Ошибка загрузки вопросов:', error);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:8000/api/tests/questions?user_id=${user.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...questionForm,
            test_id: selectedTestId
          })
        }
      );
      
      if (response.ok) {
        alert('Вопрос добавлен!');
        setQuestionForm({ text: '', order_index: questionForm.order_index + 1 });
        loadTestQuestions(selectedTestId);
      } else {
        const error = await response.json();
        alert('Ошибка: ' + error.detail);
      }
    } catch (error) {
      alert('Ошибка: ' + error.message);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Удалить этот вопрос и все варианты ответов?')) return;
    try {
      const response = await fetch(
        `http://localhost:8000/api/tests/questions/${questionId}?user_id=${user.id}`,
        { method: 'DELETE' }
      );
      
      if (response.ok) {
        alert('Вопрос удален');
        loadTestQuestions(selectedTestId);
        fetchData();
      } else {
        alert('Ошибка удаления вопроса');
      }
    } catch (error) {
      alert('Ошибка: ' + error.message);
    }
  };

  const loadQuestionAnswers = async (questionId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/questions/${questionId}/answers`);
      if (response.ok) {
        const data = await response.json();
        setQuestionAnswers(data);
        setSelectedQuestionId(questionId);
        setShowAddAnswer(true);
      }
    } catch (error) {
      console.error('Ошибка загрузки ответов:', error);
    }
  };

  const handleAddAnswer = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:8000/api/tests/answers?user_id=${user.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...answerForm,
            question_id: selectedQuestionId
          })
        }
      );
      
      if (response.ok) {
        alert('Вариант ответа добавлен!');
        setAnswerForm({ text: '', score: 0, order_index: answerForm.order_index + 1 });
        loadQuestionAnswers(selectedQuestionId);
      } else {
        const error = await response.json();
        alert('Ошибка: ' + error.detail);
      }
    } catch (error) {
      alert('Ошибка: ' + error.message);
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!confirm('Удалить этот вариант ответа?')) return;
    try {
      const response = await fetch(
        `http://localhost:8000/api/tests/answers/${answerId}?user_id=${user.id}`,
        { method: 'DELETE' }
      );
      
      if (response.ok) {
        alert('Вариант удален');
        loadQuestionAnswers(selectedQuestionId);
      } else {
        alert('Ошибка удаления варианта');
      }
    } catch (error) {
      alert('Ошибка: ' + error.message);
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
            <h1 className="text-4xl font-bold text-white mb-2">
              <TestTube2 className="w-8 h-8 inline mr-2" />
              Админ-панель
            </h1>
            <p className="text-white/80">Администратор: {user?.login}</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/"
              className="bg-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/30 transition font-semibold"
            >
              <Home className="w-4 h-4 inline mr-1" />
              На главную
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition font-semibold"
            >
              Выйти
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
            <X className="w-4 h-4 inline mr-1 text-red-700" /> {error}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-primary">{stats.total_users || 0}</div>
              <div className="text-gray-600 text-sm mt-1">Пользователей</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-primary">{stats.total_consultations || 0}</div>
              <div className="text-gray-600 text-sm mt-1">Консультаций</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-yellow-600">{stats.new_consultations || 0}</div>
              <div className="text-gray-600 text-sm mt-1">Новых заявок</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-primary">{stats.total_tests || 0}</div>
              <div className="text-gray-600 text-sm mt-1">Тестов</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-primary">{stats.total_results || 0}</div>
              <div className="text-gray-600 text-sm mt-1">Результатов</div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === 'dashboard'
                ? 'bg-white text-primary shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-1" />
            Обзор
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === 'users'
                ? 'bg-white text-primary shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Users className="w-4 h-4 inline mr-1" />
            Пользователи
          </button>
          <button
            onClick={() => setActiveTab('consultations')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === 'consultations'
                ? 'bg-white text-primary shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <ClipboardList className="w-4 h-4 inline mr-1" />
            Заявки ({consultations.filter(c => c.status === 'new').length})
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === 'tests'
                ? 'bg-white text-primary shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <FileQuestion className="w-4 h-4 inline mr-1" />
            Тесты ({tests.length})
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === 'questions'
                ? 'bg-white text-primary shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <FileQuestion className="w-4 h-4 inline mr-1" />
            Вопросы ({questions.length})
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 min-h-[400px]">

          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                <BarChart3 className="w-6 h-6 inline mr-2" />
                Обзор системы
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Последние пользователи</h3>
                  <div className="space-y-3">
                    {users.slice(0, 5).map(u => (
                      <div key={u.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-semibold">{u.login}</div>
                          <div className="text-sm text-gray-500">{u.email || 'Нет email'}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          u.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                    ))}
                    {users.length === 0 && <p className="text-gray-500">Нет пользователей</p>}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Последние заявки</h3>
                  <div className="space-y-3">
                    {consultations.slice(0, 5).map(c => (
                      <div key={c.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold">{c.name}</span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            c.status === 'new' ? 'bg-green-100 text-green-800' :
                            c.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {c.status === 'new' ? 'Новая' :
                             c.status === 'in_progress' ? 'В работе' : 'Завершена'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 truncate">{c.request}</div>
                      </div>
                    ))}
                    {consultations.length === 0 && <p className="text-gray-500">Нет заявок</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                <Users className="w-6 h-6 inline mr-2" />
                Пользователи
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left rounded-tl-lg">ID</th>
                      <th className="p-3 text-left">Логин</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Телефон</th>
                      <th className="p-3 text-left">Пол</th>
                      <th className="p-3 text-left">Роль</th>
                      <th className="p-3 text-left rounded-tr-lg">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{u.id}</td>
                        <td className="p-3 font-semibold">{u.login}</td>
                        <td className="p-3">{u.email || '-'}</td>
                        <td className="p-3">{u.phone || '-'}</td>
                        <td className="p-3">{u.gender || '-'}</td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            u.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleUserRoleUpdate(u.id, u.role)}
                            className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm hover:bg-yellow-200 mr-2 transition"
                          >
                            Изменить роль
                          </button>
                          <button
                            onClick={() => handleUserDelete(u.id)}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm hover:bg-red-200 transition"
                          >
                            Удалить
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Нет пользователей</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'consultations' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                <ClipboardList className="w-6 h-6 inline mr-2" />
                Заявки на консультацию
              </h2>
              <div className="space-y-4">
                {consultations.map(c => (
                  <div key={c.id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-primary transition">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg">{c.name}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          c.status === 'new' ? 'bg-green-100 text-green-800' :
                          c.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {c.status === 'new' ? 'Новая' :
                           c.status === 'in_progress' ? 'В работе' : 'Завершена'}
                        </span>
                      </div>
                      <span className="text-gray-500 text-sm">
                        {new Date(c.created).toLocaleString('ru-RU')}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 mb-3 text-sm text-gray-600">
                      <div><Phone className="w-4 h-4 inline mr-1" /> {c.phone}</div>
                      <div><Mail className="w-4 h-4 inline mr-1" /> {c.email || 'Нет email'}</div>
                      {c.user_id && <div><User className="w-4 h-4 inline mr-1" /> User ID: {c.user_id}</div>}
                    </div>
                    <p className="text-gray-700 mb-4 p-3 bg-gray-50 rounded-lg">{c.request}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConsultationStatusUpdate(c.id, 'in_progress')}
                        className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm hover:bg-yellow-200 transition"
                      >
                        В работу
                      </button>
                      <button
                        onClick={() => handleConsultationStatusUpdate(c.id, 'completed')}
                        className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm hover:bg-green-200 transition"
                      >
                        Завершить
                      </button>
                    </div>
                  </div>
                ))}
                {consultations.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Заявок нет</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tests' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  <FileQuestion className="w-6 h-6 inline mr-2" />
                  Тесты
                </h2>
                <button
                  onClick={() => setShowCreateTest(true)}
                  className="bg-primary text-white px-6 py-3 rounded-xl hover:shadow-lg transition font-semibold"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Создать тест
                </button>
              </div>

              {showCreateTest && (
                <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border-2 border-primary/20">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Новый тест</h3>
                  <form onSubmit={handleCreateTest} className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Название теста *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                        value={testForm.title}
                        onChange={(e) => setTestForm({...testForm, title: e.target.value})}
                        placeholder="Например: Тест на архетипы"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Описание</label>
                      <textarea
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                        rows="3"
                        value={testForm.description}
                        onChange={(e) => setTestForm({...testForm, description: e.target.value})}
                        placeholder="Описание теста..."
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Категория</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                        value={testForm.category}
                        onChange={(e) => setTestForm({...testForm, category: e.target.value})}
                        placeholder="Например: psychology"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" className="bg-primary text-white px-6 py-3 rounded-xl hover:shadow-lg transition font-semibold">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Создать тест
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateTest(false)}
                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition font-semibold"
                      >
                        Отмена
                      </button>
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
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span><FolderOpen className="w-4 h-4 inline mr-1" /> {t.category || 'Без категории'}</span>
                          <span><CalendarDays className="w-4 h-4 inline mr-1" /> {new Date(t.created_at).toLocaleDateString('ru-RU')}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadTestQuestions(t.id)}
                          className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm hover:bg-blue-200 transition font-semibold"
                        >
                          <FileQuestion className="w-4 h-4 inline mr-1" />
                          Вопросы
                        </button>
                        <button
                          onClick={() => handleDeleteTest(t.id)}
                          className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm hover:bg-red-200 transition font-semibold"
                        >
                          <Trash2 className="w-4 h-4 inline mr-1" />
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {tests.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Тестов нет. Создайте первый тест!</p>
                )}
              </div>

              {showAddQuestion && (
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      Вопросы к тесту #{selectedTestId}
                    </h3>
                    <button
                      onClick={() => setShowAddQuestion(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleAddQuestion} className="mb-6 p-4 bg-white rounded-xl">
                    <h4 className="font-semibold text-gray-700 mb-3">Добавить вопрос</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Текст вопроса *</label>
                        <textarea
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                          rows="3"
                          value={questionForm.text}
                          onChange={(e) => setQuestionForm({...questionForm, text: e.target.value})}
                          placeholder="Введите текст вопроса..."
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Порядковый номер *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                          value={questionForm.order_index}
                          onChange={(e) => setQuestionForm({...questionForm, order_index: parseInt(e.target.value)})}
                        />
                      </div>
                      <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition font-semibold">
                        <Plus className="w-4 h-4 inline mr-1" />
                        Добавить вопрос
                      </button>
                    </div>
                  </form>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700">Вопросы ({testQuestions.length})</h4>
                    {testQuestions.map(q => (
                      <div key={q.id} className="bg-white rounded-xl p-4 border-2 border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                                №{q.order_index}
                              </span>
                            </div>
                            <p className="text-gray-700">{q.text}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => loadQuestionAnswers(q.id)}
                              className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm hover:bg-green-200 transition"
                            >
                              <MessageSquare className="w-4 h-4 inline mr-1" />
                              Ответы
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm hover:bg-red-200 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {testQuestions.length === 0 && (
                      <p className="text-gray-500 text-center py-4">Вопросов нет. Добавьте первый вопрос!</p>
                    )}
                  </div>
                </div>
              )}

              {showAddAnswer && (
                <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border-2 border-green-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      Варианты ответов для вопроса #{selectedQuestionId}
                    </h3>
                    <button
                      onClick={() => setShowAddAnswer(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleAddAnswer} className="mb-6 p-4 bg-white rounded-xl">
                    <h4 className="font-semibold text-gray-700 mb-3">Добавить вариант ответа</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Текст ответа *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                          value={answerForm.text}
                          onChange={(e) => setAnswerForm({...answerForm, text: e.target.value})}
                          placeholder="Например: Да, согласен"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-700 font-semibold mb-2">Баллы *</label>
                          <input
                            type="number"
                            required
                            step="0.1"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                            value={answerForm.score}
                            onChange={(e) => setAnswerForm({...answerForm, score: parseFloat(e.target.value)})}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-semibold mb-2">Порядок *</label>
                          <input
                            type="number"
                            required
                            min="1"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                            value={answerForm.order_index}
                            onChange={(e) => setAnswerForm({...answerForm, order_index: parseInt(e.target.value)})}
                          />
                        </div>
                      </div>
                      <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition font-semibold">
                        <Plus className="w-4 h-4 inline mr-1" />
                        Добавить вариант
                      </button>
                    </div>
                  </form>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700">Варианты ({questionAnswers.length})</h4>
                    {questionAnswers.map(a => (
                      <div key={a.id} className="bg-white rounded-xl p-4 border-2 border-gray-200 flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                              #{a.order_index}
                            </span>
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                              <BarChart3 className="w-3 h-3 inline mr-1" /> {a.score} баллов
                            </span>
                          </div>
                          <p className="text-gray-700">{a.text}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteAnswer(a.id)}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm hover:bg-red-200 transition ml-4"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {questionAnswers.length === 0 && (
                      <p className="text-gray-500 text-center py-4">Вариантов нет. Добавьте первый вариант!</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'questions' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                <FileQuestion className="w-6 h-6 inline mr-2" />
                Вопросы
              </h2>
              <div className="space-y-4">
                {questions.map(q => (
                  <div key={q.id} className="border-2 border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-4 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        q.gender_type === 'female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {q.gender_type === 'female' ? 'Женский' : 'Мужской'}
                      </span>
                      <span className="text-gray-600 text-sm">Код: {q.archetype_code}</span>
                      <span className="text-gray-600 text-sm">№{q.order_index}</span>
                    </div>
                    <p className="text-gray-700">{q.text}</p>
                  </div>
                ))}
                {questions.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Вопросов нет</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
