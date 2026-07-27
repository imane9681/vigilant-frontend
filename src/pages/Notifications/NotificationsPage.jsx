// src/pages/Notifications/NotificationsPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, BellOff, ShoppingBag, AlertTriangle, AlertCircle, Clock,
  Trash2, CheckCircle, ArrowLeft, Calendar,
  User, UserPlus, Users, Award, DollarSign, TrendingUp
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import IconWrapper from '../../components/ui/IconWrapper';

const NotificationsPage = ({ darkMode }) => {
  const navigate = useNavigate();
  const { allNotifications, unreadCount, markAllAsRead, deleteNotification, clearAllNotifications } = useNotifications();

  const getIcon = (iconName, color) => {
    const icons = {
      ShoppingBag: <ShoppingBag size={20} style={{ color }} />,
      AlertTriangle: <AlertTriangle size={20} style={{ color }} />,
      AlertCircle: <AlertCircle size={20} style={{ color }} />,
      Clock: <Clock size={20} style={{ color }} />,
      User: <User size={20} style={{ color }} />,
      UserPlus: <UserPlus size={20} style={{ color }} />,
      Users: <Users size={20} style={{ color }} />,
      Award: <Award size={20} style={{ color }} />,
      DollarSign: <DollarSign size={20} style={{ color }} />,
      TrendingUp: <TrendingUp size={20} style={{ color }} />,
    };
    return icons[iconName] || <Bell size={20} style={{ color }} />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const handleNotificationClick = (notification) => {
    if (notification.link) {
      navigate(notification.link);
    }
    markAsRead(notification.id);
  };

  return (
    <div className="space-y-6 mt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 ${darkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <IconWrapper darkMode={darkMode} variant="primary" size={20}>
              <Bell />
            </IconWrapper>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                Notifications
              </h1>
              <p className={`text-sm mt-0.5 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                {allNotifications.length} notifications • {unreadCount} unread
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg, #8B7ABA, #F08FAE)` }}
            >
              <CheckCircle size={16} className="inline mr-2" />
              Mark All Read
            </button>
          )}
          {allNotifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
            >
              <Trash2 size={16} className="inline mr-2" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {allNotifications.length === 0 ? (
        <div className={`rounded-2xl p-12 text-center ${darkMode ? 'bg-neutral-800' : 'bg-white'} shadow-lg border ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
          <BellOff size={48} className="mx-auto mb-4 text-neutral-400" />
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>No notifications</h3>
          <p className={`mt-2 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>All caught up! You have no notifications.</p>
        </div>
      ) : (
        <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-neutral-800' : 'bg-white'} shadow-lg border ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {allNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 transition-colors cursor-pointer ${!notification.is_read ? (darkMode ? 'bg-purple-900/20' : 'bg-purple-50') : ''} hover:bg-neutral-50 dark:hover:bg-neutral-700/50`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${!notification.is_read ? 'ring-2 ring-purple-500/30' : ''}`} style={{ backgroundColor: `${notification.color}20` }}>
                    {getIcon(notification.icon, notification.color)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                          {notification.title}
                        </p>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                            <Clock size={12} className="inline mr-1" />
                            {notification.time_ago || 'Just now'}
                          </span>
                          {!notification.is_read && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: notification.color }} />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-400 hover:text-red-500"
                          title="Delete notification"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;