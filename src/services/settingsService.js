// src/services/settingsService.js
import api from './api';

export const settingsService = {
  // ========== الإعدادات العامة ==========
  
  /**
   * الحصول على الإعدادات العامة
   */
  getGeneralSettings: async () => {
    try {
      const response = await api.get('/settings/general/');
      // ✅ إذا كانت النتيجة مصفوفة، خذ أول عنصر
      if (Array.isArray(response.data) && response.data.length > 0) {
        return { data: response.data[0] };
      }
      return response;
    } catch (error) {
      console.error('Error fetching general settings:', error);
      throw error;
    }
  },
  
  /**
   * تحديث الإعدادات العامة
   */
  updateGeneralSettings: async (data) => {
    try {
      // ✅ جلب الإعدادات الحالية
      const response = await api.get('/settings/general/');
      let settings = response.data;
      
      // ✅ إذا كانت النتيجة مصفوفة، خذ أول عنصر
      if (Array.isArray(settings) && settings.length > 0) {
        settings = settings[0];
      }
      
      // ✅ إذا كان هناك إعدادات موجودة، قم بتحديثها
      if (settings && settings.id) {
        return await api.patch(`/settings/general/${settings.id}/`, data);
      } else {
        // ✅ إذا لم تكن موجودة، قم بإنشائها
        return await api.post('/settings/general/', data);
      }
    } catch (error) {
      console.error('Error updating general settings:', error);
      throw error;
    }
  },
  
  // ========== إعدادات الإشعارات ==========
  
  /**
   * الحصول على إعدادات الإشعارات للمستخدم الحالي
   */
  getNotificationSettings: async () => {
    try {
      const response = await api.get('/settings/notifications/my_settings/');
      return response;
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      throw error;
    }
  },
  
  /**
   * تحديث إعدادات الإشعارات
   */
  updateNotificationSettings: async (data) => {
    try {
      // ✅ جلب الإعدادات الحالية
      const response = await api.get('/settings/notifications/my_settings/');
      const settings = response.data;
      
      if (settings && settings.id) {
        return await api.patch(`/settings/notifications/${settings.id}/`, data);
      } else {
        // ✅ إذا لم تكن موجودة، قم بإنشائها
        return await api.post('/settings/notifications/', data);
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  },
  
  // ========== إعدادات الأمان ==========
  
  /**
   * الحصول على إعدادات الأمان للمستخدم الحالي
   */
  getSecuritySettings: async () => {
    try {
      const response = await api.get('/settings/security/my_settings/');
      return response;
    } catch (error) {
      console.error('Error fetching security settings:', error);
      throw error;
    }
  },
  
  /**
   * تحديث إعدادات الأمان
   */
  updateSecuritySettings: async (data) => {
    try {
      // ✅ جلب الإعدادات الحالية
      const response = await api.get('/settings/security/my_settings/');
      const settings = response.data;
      
      if (settings && settings.id) {
        return await api.patch(`/settings/security/${settings.id}/`, data);
      } else {
        // ✅ إذا لم تكن موجودة، قم بإنشائها
        return await api.post('/settings/security/', data);
      }
    } catch (error) {
      console.error('Error updating security settings:', error);
      throw error;
    }
  },
};