// src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const isFetching = useRef(false);

  // ✅ جلب التنبيهات عند التحميل وكل 30 ثانية
  useEffect(() => {
    fetchNotifications();
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    // ✅ الاستماع لأحداث تحديث التنبيهات
    const handleNotificationUpdate = () => {
      fetchNotifications();
    };
    window.addEventListener('notification-updated', handleNotificationUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('notification-updated', handleNotificationUpdate);
    };
  }, []);

  // تحديث عدد غير المقروءة
  useEffect(() => {
    const count = allNotifications.filter(n => !n.is_read).length;
    setUnreadCount(count);
  }, [allNotifications]);

  // جلب التنبيهات من API
  const fetchNotifications = async () => {
    if (isFetching.current) return;
    isFetching.current = true;

    try {
      const response = await notificationService.getAll();
      let data = response.data;

      if (data && typeof data === 'object' && !Array.isArray(data)) {
        if (Array.isArray(data.results)) {
          data = data.results;
        } else {
          data = [];
        }
      }

      if (!Array.isArray(data)) {
        data = [];
      }

      setAllNotifications(data);
      setNotifications(data.slice(0, 5));
      
      const count = data.filter(n => !n.is_read).length;
      setUnreadCount(count);
      
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setAllNotifications([]);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      isFetching.current = false;
    }
  };

  // ✅ دالة لتحديث التنبيهات يدوياً
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, []);

  // تحديد تنبيه كمقروء
  const markAsRead = async (id) => {
    try {
      await notificationService.markRead(id);
      
      const notification = allNotifications.find(n => n.id === id);
      
      setAllNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      
      setShowDropdown(false);
      
      if (notification?.link) {
        navigate(notification.link);
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // تحديد الكل كمقروء
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllRead();
      
      setAllNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  // حذف تنبيه
  const deleteNotification = async (id) => {
    try {
      await notificationService.delete(id);
      
      setAllNotifications(prev =>
        prev.filter(n => n.id !== id)
      );
      setNotifications(prev =>
        prev.filter(n => n.id !== id)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // حذف جميع التنبيهات
  const clearAllNotifications = async () => {
    try {
      await notificationService.clearAll();
      
      setAllNotifications([]);
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  // فتح/إغلاق القائمة المنسدلة
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      fetchNotifications();
    }
  };

  // عرض جميع التنبيهات
  const viewAll = () => {
    setShowDropdown(false);
    navigate('/notifications');
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      allNotifications,
      unreadCount,
      showDropdown,
      toggleDropdown,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAllNotifications,
      fetchNotifications,
      viewAll,
      refreshNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};