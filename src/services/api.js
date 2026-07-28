// frontend/src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request interceptor
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

// ✅ Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    const authPages = ['/login', '/register', '/forgot-password', '/reset-password'];
    const isAuthPage = authPages.some(page => window.location.pathname.includes(page));
    
    if (isAuthPage) {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) {
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        const response = await axios.post(`${API_URL}/auth/refresh/`, { refresh });
        localStorage.setItem('access_token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// ✅ دالة لإنشاء الجلسة
export const createSession = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.post(
      `${API_URL}/security/sessions/create_session/`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('✅ Session created:', response.data);
    return response.data;
  } catch (error) {
    console.warn('⚠️ Could not create session:', error);
    return null;
  }
};

// ✅ دالة لإنهاء جميع الجلسات الأخرى
export const terminateOtherSessions = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.post(
      `${API_URL}/security/sessions/terminate_all_except_current/`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('✅ Other sessions terminated:', response.data);
    return response.data;
  } catch (error) {
    console.warn('⚠️ Could not terminate other sessions:', error);
    return null;
  }
};


// ============================================================
// ✅ دوال إدارة الجلسات المتقدمة (دوال مساعدة)
// ============================================================

/**
 * تنظيف الجلسات المنتهية وغير النشطة
 */
export const cleanupSessions = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.post(
      `${API_URL}/security/sessions/cleanup/`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('✅ Sessions cleaned up:', response.data);
    return response.data;
  } catch (error) {
    console.warn('⚠️ Could not cleanup sessions:', error);
    return null;
  }
};

/**
 * حذف جميع جلسات المستخدم الحالي
 */
export const clearUserSessions = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.post(
      `${API_URL}/security/sessions/clear_user_sessions/`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('✅ User sessions cleared:', response.data);
    return response.data;
  } catch (error) {
    console.warn('⚠️ Could not clear user sessions:', error);
    return null;
  }
};

/**
 * الحصول على إحصائيات الجلسات
 */
export const getSessionStats = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(
      `${API_URL}/security/sessions/session_stats/`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('📊 Session stats:', response.data);
    return response.data;
  } catch (error) {
    console.warn('⚠️ Could not get session stats:', error);
    return null;
  }
};

// ========== خدمات المصادقة ==========
export const authService = {
  login: (email, password) => {
    return api.post('/auth/login/', { email, password })
      .then(async (response) => {
        // ✅ تحديث localStorage
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('isAuthenticated', 'true');
        
        // ✅ ✅ ✅ إنشاء جلسة وإنهاء الجلسات الأخرى
        try {
          // 1. إنشاء جلسة للمستخدم الحالي
          await createSession();
          console.log('✅ Session created for current user');
          
          // 2. إنهاء جميع الجلسات الأخرى
          await terminateOtherSessions();
          console.log('✅ Other sessions terminated');
        } catch (sessionError) {
          console.warn('⚠️ Session management error:', sessionError);
        }
        
        return response;
      });
  },
  register: (userData) => api.post('/auth/register/', userData),
  logout: () => api.post('/auth/logout/'),
  refreshToken: (refresh) => api.post('/auth/refresh/', { refresh }),
  forgotPassword: (email) => api.post('/auth/forgot-password/', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password/', { token, password }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
};

// ========== خدمات المنتجات ==========
export const productService = {
  getAll: (params = {}) => api.get('/products/', { params }),
  getById: (id) => api.get(`/products/${id}/`),
  create: (productData) => {
    if (productData instanceof FormData) {
      return api.post('/products/', productData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post('/products/', productData);
  },
  update: (id, productData) => {
    if (productData instanceof FormData) {
      return api.put(`/products/${id}/`, productData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.put(`/products/${id}/`, productData);
  },
  delete: (id) => api.delete(`/products/${id}/`),
  getStats: () => api.get('/products/stats/'),
  updateQuantity: (id, quantity) => api.post(`/products/${id}/update_quantity/`, { quantity }),
  deleteImage: (id, imageUrl) => api.delete(`/products/${id}/delete_image/`, { data: { image_url: imageUrl } }),
  getTopSellingWithGrowth: (params = {}) => api.get('/products/top_selling_with_growth/', { params }),
  reorder: (productId, data) => api.post(`/products/${productId}/reorder/`, data),
};

// ========== خدمات الفئات ==========
export const categoryService = {
  getAll: (params = {}) => api.get('/categories/', { params }),
  getById: (id) => api.get(`/categories/${id}/`),
  create: (data) => api.post('/categories/', data),
  update: (id, data) => api.patch(`/categories/${id}/`, data),
  delete: (id) => api.delete(`/categories/${id}/`),
  getStats: () => api.get('/categories/stats/'),
};

// ========== خدمات العروض ==========
export const promotionService = {
  getAll: (params = {}) => api.get('/promotions/', { params }),
  getById: (id) => api.get(`/promotions/${id}/`),
  create: (data) => api.post('/promotions/', data),
  update: (id, data) => api.patch(`/promotions/${id}/`, data),
  delete: (id) => api.delete(`/promotions/${id}/`),
  apply: (id, orderTotal) => api.post(`/promotions/${id}/apply/`, { order_total: orderTotal }),
  getStats: () => api.get('/promotions/stats/'),
};

// ========== خدمات العملاء ==========
export const customerService = {
  getAll: (params = {}) => api.get('/orders/customers/', { params }),
  getById: (id) => api.get(`/orders/customers/${id}/`),
  create: (data) => api.post('/orders/customers/', data),
  update: (id, data) => api.patch(`/orders/customers/${id}/`, data),
  delete: (id) => api.delete(`/orders/customers/${id}/`),
  getStats: () => api.get('/orders/customers/stats/'),
};

// ========== خدمات الطلبات ==========
export const orderService = {
  getAll: (params = {}) => api.get('/orders/', { params }),
  getById: (id) => api.get(`/orders/${id}/`),
  create: (data) => api.post('/orders/', data),
  createWithCustomer: (data) => api.post('/orders/', data),
  delete: (id) => api.delete(`/orders/${id}/`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/`, { status }),
  getStats: () => api.get('/orders/stats/'),
};

// ========== خدمات التحليلات ==========
export const analyticsService = {
  getSalesData: (params = {}) => api.get('/analytics/sales/', { params }),
  getRevenueData: (params = {}) => api.get('/analytics/revenue/', { params }),
  getCategoryData: (params = {}) => api.get('/analytics/categories/', { params }),
  getTrafficSources: (params = {}) => api.get('/analytics/traffic/', { params }),
  getDashboardMetrics: () => api.get('/analytics/dashboard/'),
};

// ========== خدمات التقارير ==========
export const reportsService = {
  getAll: (params = {}) => api.get('/reports/', { params }),
  getById: (id) => api.get(`/reports/${id}/`),
  generate: (data) => api.post('/reports/generate/', data),
  download: (id) => api.get(`/reports/${id}/download/`, { responseType: 'blob' }),
  incrementDownload: (id) => api.post(`/reports/${id}/increment_download/`),
  delete: (id) => api.delete(`/reports/${id}/`),
  getStats: () => api.get('/reports/stats/'),
};

// ========== خدمات الإشعارات ==========
export const notificationService = {
  getAll: () => api.get('/notifications/'),
  getUnreadCount: () => api.get('/notifications/unread_count/'),
  markRead: (id) => api.post(`/notifications/${id}/mark_read/`),
  markAllRead: () => api.post('/notifications/mark_all_read/'),
  delete: (id) => api.delete(`/notifications/${id}/delete_notification/`),
  clearAll: () => api.delete('/notifications/clear_all/'),
};

// ========== خدمات الإعدادات ==========
export const settingsService = {
  getGeneral: () => api.get('/settings/general/'),
  updateGeneral: (data) => api.patch('/settings/general/', data),
  getNotifications: () => api.get('/settings/notifications/'),
  updateNotifications: (data) => api.patch('/settings/notifications/', data),
  getSecurity: () => api.get('/settings/security/'),
  updateSecurity: (data) => api.patch('/settings/security/', data),
};


// ========== خدمات قاعدة البيانات ==========
export const databaseService = {
    getStats: () => api.get('/database/stats/'),
    getTables: () => api.get('/database/tables/'),
    getBackups: () => api.get('/database/backups/'),
    createBackup: () => api.post('/database/create_backup/'),
    deleteBackup: (id) => api.delete(`/database/${id}/delete_backup/`),
    downloadBackup: (id) => api.get(`/database/${id}/download_backup/`, { responseType: 'blob' }),
    restoreBackup: (id) => api.post(`/database/${id}/restore_backup/`),
    getTableDetails: (tableName) => api.get(`/database/table_details/?table_name=${tableName}`),
    getQueryStats: () => api.get('/database/query_stats/'),
    executeQuery: (query) => api.post('/database/execute_query/', { query }),
    clearLogs: (days) => api.post('/database/clear_logs/', { days }),
    
    // ✅ ✅ ✅ تصحيح دالة حذف سجل الاستعلام
    deleteQueryLog: (id) => api.delete(`/database/${id}/delete_query_log/`),
};

// ✅ دالة للحصول على رابط الصورة الكامل
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
  return `${baseUrl}${imagePath}`;
};


export default api;