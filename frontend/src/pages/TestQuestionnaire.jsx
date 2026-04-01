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

  const testData = JSON.parse(sessionStorage.getItem('testData') || '{}');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await questionsAPI.getQuestions(testData.gender);
        setQuestions(response.data);
      } catch (error) {
        console.error('Ошибка загрузки вопросов:', error);
        alert('Ошибка загрузки вопросов. Попробуйте позже.');
        navigate('/test');
      } finally {
        setLoading(false);
      }
    };

    if (testData.gender) {
      fetchQuestions();
    }
  }, [testData.gender, navigate]);

  const handleAnswer = (value) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentIndex].id]: value
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      submitTest();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const submitTest = async () => {
    setSubmitting(true);
    try {
      const answersArray = Object.entries(answers).map(([questionId, value]) => ({
        question_id: parseInt(questionId),
        value
      }));

      const payload = {
        answers: answersArray,
        goal: testData.goal,
        partner_code: testData.partnerCode || null,
        consultation_request: testData.consultationRequest || null
      };

      const response = await testAPI.complete(payload);
      const code = response.data.compatibility_code;
      
      // Сохраняем код совместимости
      sessionStorage.setItem('compatibilityCode', code);
      
      navigate(`/test/results/${code}`);
    } catch (error) {
      console.error('Ошибка отправки теста:', error);
      alert('Ошибка при сохранении результатов. Попробуйте позже.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Загрузка вопросов...</div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const hasAnswer = answers[currentQuestion?.id] !== undefined;

  return (
    <div className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Прогресс бар */}
        <div className="mb-8">
          <div className="flex justify-between text-white mb-2">
            <span>Вопрос {currentIndex + 1} из {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Карточка вопроса */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 fade-in">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8 leading-relaxed">
            {currentQuestion?.text || 'Загрузка...'}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => handleAnswer(true)}
              className={`py-4 px-6 rounded-xl font-semibold text-lg transition transform hover:scale-105 ${
                answers[currentQuestion?.id] === true
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✅ Да
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className={`py-4 px-6 rounded-xl font-semibold text-lg transition transform hover:scale-105 ${
                answers[currentQuestion?.id] === false
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ❌ Нет
            </button>
          </div>

          {/* Навигация */}
          <div className="flex gap-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`flex-1 py-3 rounded-xl font-semibold transition ${
                currentIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ← Назад
            </button>
            <button
              onClick={handleNext}
              disabled={!hasAnswer || submitting}
              className={`flex-1 py-3 rounded-xl font-semibold transition ${
                !hasAnswer || submitting
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:scale-105'
              }`}
            >
              {submitting ? 'Сохранение...' : currentIndex === questions.length - 1 ? 'Завершить' : 'Далее →'}
            </button>
          </div>
        </div>

        {/* Подсказка */}
        <p className="text-center text-white/80 mt-6">
          Отвечайте честно — здесь нет правильных или неправильных ответов
        </p>
      </div>
    </div>
  );
};

export default TestQuestionnaire;
