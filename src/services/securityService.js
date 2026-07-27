// src/services/securityService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// ✅ إنشاء instance محلي
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ إضافة Interceptor للـ Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const securityService = {
  // ========== المستخدمين ==========
  getUsers: (params = {}) => api.get('/security/users/', { params }),
  getUser: (id) => api.get(`/security/users/${id}/`),
  lockUser: (id) => api.post(`/security/users/${id}/lock/`),
  unlockUser: (id) => api.post(`/security/users/${id}/unlock/`),
  
  // ========== سجلات الأمان ==========
  getLogs: (params = {}) => api.get('/security/logs/', { params }),
  getLogsStats: () => api.get('/security/logs/stats/'),


  
  // ========== الجلسات ==========
  getSessions: (params = {}) => api.get('/security/sessions/', { params }),
  terminateSession: (id) => api.post(`/security/sessions/${id}/terminate/`),
  terminateAllSessions: () => api.post('/security/sessions/terminate_all/'),
  terminateAllExceptCurrent: () => api.post('/security/sessions/terminate_all_except_current/'),
  createSession: () => api.post('/security/sessions/create_session/'),

  // ========== إدارة الجلسات المتقدمة ==========
  cleanupSessions: () => api.post('/security/sessions/cleanup/'),
  clearUserSessions: () => api.post('/security/sessions/clear_user_sessions/'),
  getSessionStats: () => api.get('/security/sessions/session_stats/'),
  cleanupLogs: (days = 30) => api.post('/security/logs/cleanup/', { days }),

  
  // ========== إحصائيات الأمان ==========
  getLatestStats: () => api.get('/security/stats/latest/'),
  refreshStats: () => api.post('/security/stats/refresh/'),

  
};