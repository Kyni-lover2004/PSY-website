import axios from 'axios';

// Production URL для Render с префиксом /api
const PRODUCTION_URL = 'https://psy-website-3.onrender.com/api';

// Получаем URL из переменной окружения или используем production
const API_URL = import.meta.env.VITE_API_URL || PRODUCTION_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 30000,
});

// Добавляем JWT токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обрабатываем 401 ошибки
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('401 Unauthorized - ошибка авторизации:', error.config?.url);
      console.error('Detail:', error.response?.data);
      // Не редиректим автоматически, пусть компонент сам обрабатывает
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export const questionsAPI = {
  getQuestions: (gender) => api.get(`/questions/${gender}`),
};

export const testAPI = {
  complete: (data) => api.post('/test/complete', data),
  saveToAccount: (data) => api.post('/test/save-to-account', data),
};

export const consultationAPI = {
  create: (data) => api.post('/consultation', data),
};

export const profileAPI = {
  getProfile: (code) => api.get(`/profile/${code}`),
};

export const compatibilityAPI = {
  check: (code1, code2) => api.post('/compatibility/check', { code1, code2 }),
};

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (userId, role) => api.post(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getTestResults: () => api.get('/admin/test-results'),
  getConsultations: () => api.get('/admin/consultations'),
  updateConsultationStatus: (id, status) => api.post(`/admin/consultations/${id}/status`, { status }),
  getQuestions: () => api.get('/admin/questions'),
  getArchetypes: () => api.get('/admin/archetypes'),
  createTest: (data) => api.post('/tests', data),
  deleteTest: (testId) => api.delete(`/tests/${testId}`),
  getTestQuestions: (testId) => api.get(`/tests/${testId}/questions`),
  createQuestion: (data) => api.post('/tests/questions', data),
  deleteQuestion: (questionId) => api.delete(`/tests/questions/${questionId}`),
  createAnswer: (data) => api.post('/tests/answers', data),
  getAnswers: (questionId) => api.get(`/questions/${questionId}/answers`),
  deleteAnswer: (answerId) => api.delete(`/tests/answers/${answerId}`),
  getAllComments: () => api.get('/admin/comments'),
  deleteCommentAdmin: (commentId) => api.delete(`/admin/comments/${commentId}`),
};

export const commentsAPI = {
  create: (data) => api.post('/comments', data),
  getAll: (targetType = 'general', targetId = null) =>
    api.get(`/comments?target_type=${targetType}${targetId !== null ? `&target_id=${targetId}` : ''}`),
  getOne: (commentId) => api.get(`/comments/${commentId}`),
  update: (commentId, data) => api.put(`/comments/${commentId}`, data),
  delete: (commentId) => api.delete(`/comments/${commentId}`),
};

export default api;
