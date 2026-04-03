import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionsAPI, testAPI } from '../api/api';

const TestQuestionnaire = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Получаем testData
  const testData = JSON.parse(sessionStorage.getItem('testData') || '{}');
  
  console.log('TestQuestionnaire - testData:', testData);
  console.log('TestQuestionnaire - gender:', testData?.gender);
  
  // Генерируем session_id при загрузке
  const [sessionId] = useState(() => {
    let stored = sessionStorage.getItem('sessionId');
    if (!stored) {
      stored = 'sess_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('sessionId', stored);
    }
    return stored;
  });

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

      const response = await testAPI.complete({
        session_id: sessionId,
        answers: answersArray,
        gender: testData.gender,
        login: testData.login,
        orientation: testData.orientation
      });

      const code = response.data.compatibility_code;
      sessionStorage.setItem('compatibilityCode', code);
      navigate(`/test/results/${code}`);
    } catch (error) {
      console.error('Ошибка отправки:', error);
      alert('Ошибка при сохранении результатов: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6B8F8B 0%, #4A6B68 100%)' }}>
        <div className="bg-white rounded-3xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка вопросов...</p>
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
    <div className="py-12 px-4" style={{ background: 'linear-gradient(135deg, #6B8F8B 0%, #4A6B68 100%)', minHeight: '100vh' }}>
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
        <div className="bg-white rounded-3xl shadow-2xl p-8 fade-in">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8 leading-relaxed">
            {currentQuestion ? (currentQuestion.text || 'Нет текста') : 'Вопрос не найден'}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => handleAnswer(true)}
              className={`py-4 px-6 rounded-xl font-semibold text-lg transition transform hover:scale-105 ${
                answers[currentQuestion?.id] === true
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >✅ Да</button>
            <button
              onClick={() => handleAnswer(false)}
              className={`py-4 px-6 rounded-xl font-semibold text-lg transition transform hover:scale-105 ${
                answers[currentQuestion?.id] === false
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >❌ Нет</button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`flex-1 py-3 rounded-xl font-semibold transition ${
                currentIndex === 0 ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >← Назад</button>
            <button
              onClick={handleNext}
              disabled={!hasAnswer || submitting}
              className={`flex-1 py-3 rounded-xl font-semibold transition ${
                !hasAnswer || submitting ? 'bg-gray-200 text-gray-400' : 'bg-primary text-white hover:shadow-lg'
              }`}
            >
              {submitting ? 'Сохранение...' : currentIndex === questions.length - 1 ? 'Завершить' : 'Далее →'}
            </button>
          </div>
        </div>

        <p className="text-center text-white/80 mt-6">Отвечайте честно — здесь нет правильных ответов</p>
      </div>
    </div>
  );
};

export default TestQuestionnaire;
