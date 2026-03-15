import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh/`, { refresh });
          localStorage.setItem('access_token', res.data.access);
          error.config.headers.Authorization = `Bearer ${res.data.access}`;
          return api.request(error.config);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register/', data),
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login/', data),
  me: () => api.get('/auth/me/'),
};

// Profile
export const profileAPI = {
  getProfile: () => api.get('/profile/'),
  getHistory: () => api.get('/profile/history/'),
};

// Quiz
export const quizAPI = {
  create: (data: { topic: string; num_questions: number; difficulty: string }) =>
    api.post('/quiz/create/', data),
  getQuiz: (sessionId: string) => api.get(`/quiz/${sessionId}/`),
  submitAnswer: (sessionId: string, data: { question_id: string; selected_index: number }) =>
    api.post(`/quiz/${sessionId}/answer/`, data),
  finish: (sessionId: string) => api.post(`/quiz/${sessionId}/finish/`),
  getResults: (sessionId: string) => api.get(`/quiz/${sessionId}/results/`),
};

// Cheatsheet
export const cheatsheetAPI = {
  generate: (sessionId: string) => api.post(`/quiz/${sessionId}/cheatsheet/generate/`),
  get: (sessionId: string) => api.get(`/quiz/${sessionId}/cheatsheet/`),
  downloadUrl: (sessionId: string) =>
    `${process.env.NEXT_PUBLIC_API_URL}/quiz/${sessionId}/cheatsheet/download/`,
};
