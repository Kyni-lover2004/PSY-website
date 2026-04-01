import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const questionsAPI = {
  getQuestions: (gender) => api.get(`/questions/${gender}`),
};

export const testAPI = {
  complete: (data) => api.post('/test/complete', data),
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
  getQuestions: () => api.get('/admin/questions'),
  updateQuestion: (id, data) => api.put(`/admin/questions/${id}`, data),
  getArchetypes: () => api.get('/admin/archetypes'),
  updateArchetype: (id, data) => api.put(`/admin/archetypes/${id}`, data),
  getConsultations: () => api.get('/admin/consultations'),
  updateConsultation: (id, status) => api.put(`/admin/consultations/${id}?status=${status}`),
};

export default api;
