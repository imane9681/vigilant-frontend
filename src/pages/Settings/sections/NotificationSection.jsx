// src/pages/Settings/sections/NotificationSection.jsx
import React from 'react';

const NotificationSection = ({ darkMode, notificationSettings, handleInputChange }) => {
  // تعريف الإعدادات مع وصفها
  const notificationOptions = [
    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
    { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive push notifications' },
    { key: 'desktopNotifications', label: 'Desktop Notifications', description: 'Show desktop notifications' },
    { key: 'orderAlerts', label: 'Order Alerts', description: 'Get notified about new orders' },
    { key: 'stockAlerts', label: 'Stock Alerts', description: 'Get notified about low stock' },
    { key: 'customerAlerts', label: 'Customer Alerts', description: 'Get notified about new customers' },
    { key: 'systemAlerts', label: 'System Alerts', description: 'Get notified about system events' },
    { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive marketing emails' },
    { key: 'dailySummary', label: 'Daily Summary', description: 'Receive daily summary' },
    { key: 'weeklyReport', label: 'Weekly Report', description: 'Receive weekly report' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notificationOptions.map(({ key, label, description }) => (
          <div key={key} className={`flex items-center justify-between p-4 rounded-lg
                                    ${darkMode ? 'bg-neutral-700/30' : 'bg-neutral-50'}`}>
            <div>
              <p className={`font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                {label}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                {description}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings[key]}
                onChange={(e) => handleInputChange('notifications', key, e.target.checked)}
                className="sr-only"
              />
              <div className={`w-12 h-6 rounded-full transition-all duration-300
                            ${notificationSettings[key] 
                              ? 'bg-success' 
                              : darkMode ? 'bg-neutral-600' : 'bg-neutral-300'}`}>
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full 
                              transition-all duration-300 shadow-md
                              ${notificationSettings[key] ? 'translate-x-6' : ''}`} />
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationSection;