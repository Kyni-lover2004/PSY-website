import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionsAPI, testAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { CheckCircle, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';

const TestQuestionnaire = () => {
  const navigate = useNavigate();
  const { user, updateUserCompatibilityCode } = useAuth(); // Получаем данные авторизованного пользователя
  const { isDark } = useTheme();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const testData = JSON.parse(sessionStorage.getItem('testData') || '{}');

  console.log('TestQuestionnaire - testData:', testData);
  console.log('TestQuestionnaire - gender:', testData?.gender);
  console.log('TestQuestionnaire - авторизованный пользователь:', user?.id, user?.login);

  // Создаём НОВЫЙ sessionId для каждого прохождения теста
  const [sessionId] = useState(() => {
    // Всегда создаём новую сессию для нового прохождения теста
    const newSessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    console.log('Создан новый sessionId:', newSessionId);
    return newSessionId;
  });

  // Формируем login из имени и фамилии, если он не был установлен
  const login = testData.login || `${testData.name}_${testData.surname}`.toLowerCase().replace(/\s+/g, '_').replace(/[^a-zа-яё0-9_]/gi, '') || `user_${sessionId}`;

  useEffect(() => {
    console.log('Fetching questions for gender:', testData?.gender);
    
    if (!testData?.gender) {
      alert('Ошибка: пол не выбран. Возвращаемся к анкете.');
      navigate('/test');
      return;
    }
    
    const fetchQuestions = async () => {
      try {
        console.log('API call: /questions/' + testData.gender);
        const response = await questionsAPI.getQuestions(testData.gender);
        console.log('Questions received:', response.data);
        setQuestions(response.data);
      } catch (error) {
        console.error('Ошибка загрузки вопросов:', error);
        alert('Ошибка загрузки вопросов: ' + (error.message || 'Проверьте подключение к серверу'));
        navigate('/test');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [testData?.gender, navigate]);

  const handleAnswer = (value) => {
    setAnswers(prev => ({ ...prev, [questions[currentIndex].id]: value }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      submitTest();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const submitTest = async () => {
    setSubmitting(true);
    try {
      const answersArray = Object.entries(answers).map(([qid, value]) => ({
        question_id: parseInt(qid),
        value
      }));

      console.log('Отправка данных на сервер:', {
        session_id: sessionId,
        answers_count: answersArray.length,
        gender: testData.gender,
        login: login,
        orientation: testData.orientation,
        user_id: user?.id || null
      });

      const response = await testAPI.complete({
        session_id: sessionId,
        answers: answersArray,
        gender: testData.gender,
        login: login,
        orientation: testData.orientation,
        user_id: user?.id || null  // Передаём ID авторизованного пользователя
      });

  console.log('Ответ от сервера:', response.data);

  const code = response.data.compatibility_code;
  console.log('Получен compatibility_code:', code);

  if (!code) {
    console.error('Сервер не вернул compatibility_code!');
    alert('Ошибка: сервер не вернул код совместимости. Попробуйте ещё раз.');
    return;
  }

  // Обновляем код в AuthContext и localStorage
  if (updateUserCompatibilityCode) {
    updateUserCompatibilityCode(code);
    console.log('compatibility_code обновлён в AuthContext');
  } else {
    sessionStorage.setItem('compatibilityCode', code);
  }

  // Автоматический переход к результатам без алерта
  console.log('Навигация на:', `/test/results/${code}`);
  navigate(`/test/results/${code}`);
    } catch (error) {
      console.error('Ошибка отправки:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert('Ошибка при сохранении результатов: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-gradient-hero)' }}>
        <div className="rounded-3xl p-8 text-center" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--bg-gradient-from)' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Загрузка вопросов...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const hasAnswer = answers[currentQuestion?.id] !== undefined;
  
  console.log('currentIndex:', currentIndex);
  console.log('questions.length:', questions.length);
  console.log('currentQuestion:', currentQuestion);
  console.log('currentQuestion.text:', currentQuestion?.text);

  return (
    <div className="py-12 px-4" style={{ background: 'var(--bg-gradient-hero)', minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto">
        {/* Прогресс */}
        <div className="mb-8">
          <div className="flex justify-between text-white mb-2">
            <span>Вопрос {currentIndex + 1} из {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Вопрос */}
        <div className="rounded-3xl shadow-2xl p-8 fade-in" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          <h2 className="text-2xl font-semibold mb-8 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {currentQuestion ? (currentQuestion.text || 'Нет текста') : 'Вопрос не найден'}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => handleAnswer(true)}
              className={`py-4 px-6 rounded-xl font-semibold text-lg transition transform hover:scale-105 ${
                answers[currentQuestion?.id] === true
                  ? 'text-white shadow-lg'
                  : 'hover:shadow-lg'
              }`}
              style={{ backgroundColor: answers[currentQuestion?.id] === true ? 'var(--bg-gradient-from)' : (isDark ? 'var(--bg-card-alt)' : '#f3f4f6'), color: answers[currentQuestion?.id] === true ? 'white' : 'var(--text-secondary)' }}
            >
              <CheckCircle className="w-5 h-5 inline mr-2" /> Да
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className={`py-4 px-6 rounded-xl font-semibold text-lg transition transform hover:scale-105 ${
                answers[currentQuestion?.id] === false
                  ? 'text-white shadow-lg'
                  : 'hover:shadow-lg'
              }`}
              style={{ backgroundColor: answers[currentQuestion?.id] === false ? 'var(--bg-gradient-from)' : (isDark ? 'var(--bg-card-alt)' : '#f3f4f6'), color: answers[currentQuestion?.id] === false ? 'white' : 'var(--text-secondary)' }}
            >
              <XCircle className="w-5 h-5 inline mr-2" /> Нет
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`flex-1 py-3 rounded-xl font-semibold transition ${
                currentIndex === 0 ? 'cursor-not-allowed' : 'hover:shadow-lg'
              }`}
              style={{ backgroundColor: currentIndex === 0 ? (isDark ? 'var(--bg-card-alt)' : '#e5e7eb') : (isDark ? 'var(--bg-card-alt)' : '#f3f4f6'), color: currentIndex === 0 ? 'var(--text-muted)' : 'var(--text-secondary)' }}
            ><ArrowLeft className="w-4 h-4 inline" /> Назад</button>
            <button
              onClick={handleNext}
              disabled={!hasAnswer || submitting}
              className={`flex-1 py-3 rounded-xl font-semibold transition ${
                !hasAnswer || submitting ? 'cursor-not-allowed' : 'text-white hover:shadow-lg'
              }`}
              style={{ backgroundColor: (!hasAnswer || submitting) ? (isDark ? 'var(--bg-card-alt)' : '#e5e7eb') : 'var(--bg-gradient-from)', color: (!hasAnswer || submitting) ? 'var(--text-muted)' : 'white' }}
            >
              {submitting ? 'Сохранение...' : currentIndex === questions.length - 1 ? 'Завершить' : 'Далее '}
              {!submitting && currentIndex !== questions.length - 1 && <ArrowRight className="w-4 h-4 inline" />}
            </button>
          </div>
        </div>

        <p className="text-center text-white/80 mt-6">Отвечайте честно — здесь нет правильных ответов</p>
      </div>
    </div>
  );
};

export default TestQuestionnaire;
