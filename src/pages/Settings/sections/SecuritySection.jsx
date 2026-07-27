// src/pages/Settings/sections/SecuritySection.jsx
import React from 'react';
import { Users, Check } from 'lucide-react';

const SecuritySection = ({ 
  darkMode, 
  securitySettings, 
  handleInputChange,
  DropdownTrigger,
  Dropdown,
  DropdownItem,
  DropdownHeader
}) => {
  const sessionControlOptions = [
    { value: 'strict', label: 'Strict - Single session only' },
    { value: 'moderate', label: 'Moderate - Limited sessions' },
    { value: 'loose', label: 'Loose - Multiple sessions allowed' }
  ];

  const securityOptions = [
    { key: 'twoFactorAuth', label: 'Two-Factor Authentication', description: 'Enable 2FA for additional security' },
    { key: 'requireStrongPassword', label: 'Require Strong Password', description: 'Enforce strong password policy' },
    { key: 'ipWhitelisting', label: 'IP Whitelisting', description: 'Restrict access to specific IPs' },
    { key: 'loginNotifications', label: 'Login Notifications', description: 'Get notified on new logins' },
    { key: 'allowMultipleSessions', label: 'Allow Multiple Sessions', description: 'Allow same user to login from multiple devices' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* العمود الأيسر */}
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={securitySettings.sessionTimeout}
              onChange={(e) => handleInputChange('security', 'sessionTimeout', e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border transition-all
                focus:outline-none focus:ring-2 focus:ring-primary
                ${darkMode 
                  ? 'bg-neutral-700/50 border-neutral-600 text-white' 
                  : 'bg-neutral-50 border-neutral-200 text-neutral-900'}`}
              min="1"
              max="1440"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Max Login Attempts
            </label>
            <input
              type="number"
              value={securitySettings.maxLoginAttempts}
              onChange={(e) => handleInputChange('security', 'maxLoginAttempts', e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border transition-all
                focus:outline-none focus:ring-2 focus:ring-primary
                ${darkMode 
                  ? 'bg-neutral-700/50 border-neutral-600 text-white' 
                  : 'bg-neutral-50 border-neutral-200 text-neutral-900'}`}
              min="1"
              max="10"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Password Expiry (days)
            </label>
            <input
              type="number"
              value={securitySettings.passwordExpiry}
              onChange={(e) => handleInputChange('security', 'passwordExpiry', e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border transition-all
                focus:outline-none focus:ring-2 focus:ring-primary
                ${darkMode 
                  ? 'bg-neutral-700/50 border-neutral-600 text-white' 
                  : 'bg-neutral-50 border-neutral-200 text-neutral-900'}`}
              min="0"
              max="365"
            />
          </div>
        </div>

        {/* العمود الأيمن */}
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Session Control
            </label>
            <Dropdown
              trigger={
                <DropdownTrigger
                  label="Select Session Control"
                  value={sessionControlOptions.find(s => s.value === securitySettings.sessionControl)?.label || securitySettings.sessionControl}
                  icon={Users}
                  darkMode={darkMode}
                />
              }
              align="left"
              width="full"
              darkMode={darkMode}
            >
              <DropdownHeader darkMode={darkMode}>Session Control</DropdownHeader>
              {sessionControlOptions.map((option) => (
                <DropdownItem
                  key={option.value}
                  onClick={() => handleInputChange('security', 'sessionControl', option.value)}
                  darkMode={darkMode}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    {securitySettings.sessionControl === option.value && (
                      <Check size={14} className="text-success" />
                    )}
                  </div>
                </DropdownItem>
              ))}
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        {securityOptions.map(({ key, label, description }) => (
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
                checked={securitySettings[key]}
                onChange={(e) => handleInputChange('security', key, e.target.checked)}
                className="sr-only"
              />
              <div className={`w-12 h-6 rounded-full transition-all duration-300
                            ${securitySettings[key] 
                              ? 'bg-success' 
                              : darkMode ? 'bg-neutral-600' : 'bg-neutral-300'}`}>
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full 
                              transition-all duration-300 shadow-md
                              ${securitySettings[key] ? 'translate-x-6' : ''}`} />
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecuritySection;