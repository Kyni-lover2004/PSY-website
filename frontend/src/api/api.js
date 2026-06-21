import axios from 'axios';
import { API_BASE } from '../config/apiConfig.js';

// API URL (центр. конфигурация)
const API_URL = API_BASE;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 30000,
});

let refreshPromise = null;

// Добавляем JWT токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обрабатываем 401 ошибки с попыткой silent refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axios.post(`${API_URL}/auth/refresh`, {}, {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const refreshResponse = await refreshPromise;
        const newToken = refreshResponse.data?.access_token;
        const refreshedUser = refreshResponse.data?.user
          ? { ...refreshResponse.data.user, compatibility_code: refreshResponse.data.compatibility_code }
          : null;

        if (newToken) {
          localStorage.setItem('token', newToken);
        }

        if (refreshedUser) {
          localStorage.setItem('user', JSON.stringify(refreshedUser));
        }

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.error('Silent refresh failed:', refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return Promise.reject(refreshError);
      } finally {
        refreshPromise = null;
      }
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
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
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
  getTests: () => api.get('/tests'),
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
