import { useState, useEffect } from 'react';
import { adminAPI } from '../api/api';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('questions');
  const [questions, setQuestions] = useState([]);
  const [archetypes, setArchetypes] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes, aRes, cRes] = await Promise.all([
        adminAPI.getQuestions(),
        adminAPI.getArchetypes(),
        adminAPI.getConsultations()
      ]);
      setQuestions(qRes.data);
      setArchetypes(aRes.data);
      setConsultations(cRes.data);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionUpdate = async (id, text) => {
    try {
      await adminAPI.updateQuestion(id, { text });
      alert('Вопрос обновлён');
      fetchData();
    } catch (error) {
      alert('Ошибка обновления');
    }
  };

  const handleArchetypeUpdate = async (id, field, value) => {
    try {
      await adminAPI.updateArchetype(id, { [field]: value });
      alert('Описание обновлено');
      fetchData();
    } catch (error) {
      alert('Ошибка обновления');
    }
  };

  const handleConsultationUpdate = async (id, status) => {
    try {
      await adminAPI.updateConsultation(id, status);
      fetchData();
    } catch (error) {
      alert('Ошибка обновления');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">🔧 Админ-панель</h1>

        {/* Табы */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === 'questions'
                ? 'bg-white text-primary'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Вопросы
          </button>
          <button
            onClick={() => setActiveTab('archetypes')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === 'archetypes'
                ? 'bg-white text-primary'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Архетипы
          </button>
          <button
            onClick={() => setActiveTab('consultations')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === 'consultations'
                ? 'bg-white text-primary'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Заявки ({consultations.filter(c => c.status === 'new').length})
          </button>
        </div>

        {/* Вопросы */}
        {activeTab === 'questions' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Редактор вопросов</h2>
            <div className="space-y-4">
              {questions.map(q => (
                <div key={q.id} className="border rounded-xl p-4">
                  <div className="flex items-center gap-4 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      q.gender_type === 'female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {q.gender_type === 'female' ? 'Женский' : 'Мужской'}
                    </span>
                    <span className="text-gray-600 text-sm">Код: {q.archetype_code}</span>
                    <span className="text-gray-600 text-sm">№{q.order_index}</span>
                  </div>
                  <textarea
                    className="w-full border rounded-lg p-3 focus:outline-none focus:border-primary"
                    rows="2"
                    value={q.text || ''}
                    onChange={(e) => handleQuestionUpdate(q.id, e.target.value)}
                    placeholder="Введите текст вопроса..."
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Архетипы */}
        {activeTab === 'archetypes' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Редактор архетипов</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {archetypes.map(a => (
                <div key={a.id} className="border rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: a.color || '#999' }}
                    />
                    <h3 className="font-semibold text-lg">{a.name}</h3>
                    <span className="text-gray-500 text-sm">({a.code})</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Описание</label>
                      <textarea
                        className="w-full border rounded-lg p-2 text-sm"
                        rows="3"
                        value={a.description || ''}
                        onChange={(e) => handleArchetypeUpdate(a.id, 'description', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Сильные стороны</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2 text-sm"
                        value={a.strengths || ''}
                        onChange={(e) => handleArchetypeUpdate(a.id, 'strengths', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Слабые стороны</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg p-2 text-sm"
                        value={a.weaknesses || ''}
                        onChange={(e) => handleArchetypeUpdate(a.id, 'weaknesses', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Заявки */}
        {activeTab === 'consultations' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Заявки на консультацию</h2>
            <div className="space-y-4">
              {consultations.map(c => (
                <div key={c.id} className="border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{c.user_name}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        c.status === 'new' ? 'bg-green-100 text-green-800' :
                        c.status === 'processed' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {c.status === 'new' ? 'Новая' :
                         c.status === 'processed' ? 'В работе' : 'Завершена'}
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {new Date(c.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{c.request_text}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConsultationUpdate(c.id, 'processed')}
                      className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm hover:bg-yellow-200 transition"
                    >
                      В работу
                    </button>
                    <button
                      onClick={() => handleConsultationUpdate(c.id, 'done')}
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
      </div>
    </div>
  );
};

export default AdminPanel;
