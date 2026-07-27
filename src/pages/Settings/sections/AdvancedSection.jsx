// src/pages/Settings/sections/AdvancedSection.jsx
import React from 'react';
import { Database, Activity, Check } from 'lucide-react';

const AdvancedSection = ({ 
  darkMode, 
  advancedSettings, 
  handleInputChange,
  DropdownTrigger,
  Dropdown,
  DropdownItem,
  DropdownHeader
}) => {
  const sessionStorageOptions = [
    { value: 'memory', label: 'Memory' },
    { value: 'redis', label: 'Redis' },
    { value: 'database', label: 'Database' }
  ];

  const logLevelOptions = [
    { value: 'debug', label: 'Debug' },
    { value: 'info', label: 'Info' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Error' }
  ];

  const advancedOptions = [
    { key: 'compression', label: 'Enable Compression', description: 'Compress assets for faster loading' },
    { key: 'minifyAssets', label: 'Minify Assets', description: 'Minify CSS and JavaScript' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Rate Limit */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
            API Rate Limit (requests/hour)
          </label>
          <input
            type="number"
            value={advancedSettings.apiRateLimit}
            onChange={(e) => handleInputChange('advanced', 'apiRateLimit', e.target.value)}
            className={`w-full px-4 py-2.5 rounded-lg border transition-all
              focus:outline-none focus:ring-2 focus:ring-primary
              ${darkMode 
                ? 'bg-neutral-700/50 border-neutral-600 text-white' 
                : 'bg-neutral-50 border-neutral-200 text-neutral-900'}`}
          />
        </div>

        {/* Cache Duration */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
            Cache Duration (seconds)
          </label>
          <input
            type="number"
            value={advancedSettings.cacheDuration}
            onChange={(e) => handleInputChange('advanced', 'cacheDuration', e.target.value)}
            className={`w-full px-4 py-2.5 rounded-lg border transition-all
              focus:outline-none focus:ring-2 focus:ring-primary
              ${darkMode 
                ? 'bg-neutral-700/50 border-neutral-600 text-white' 
                : 'bg-neutral-50 border-neutral-200 text-neutral-900'}`}
          />
        </div>

        {/* Session Storage */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
            Session Storage
          </label>
          <Dropdown
            trigger={
              <DropdownTrigger
                label="Select Storage"
                value={sessionStorageOptions.find(s => s.value === advancedSettings.sessionStorage)?.label || advancedSettings.sessionStorage}
                icon={Database}
                darkMode={darkMode}
              />
            }
            align="left"
            width="full"
            darkMode={darkMode}
          >
            <DropdownHeader darkMode={darkMode}>Session Storage</DropdownHeader>
            {sessionStorageOptions.map((option) => (
              <DropdownItem
                key={option.value}
                onClick={() => handleInputChange('advanced', 'sessionStorage', option.value)}
                darkMode={darkMode}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option.label}</span>
                  {advancedSettings.sessionStorage === option.value && (
                    <Check size={14} className="text-success" />
                  )}
                </div>
              </DropdownItem>
            ))}
          </Dropdown>
        </div>

        {/* Log Level */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
            Log Level
          </label>
          <Dropdown
            trigger={
              <DropdownTrigger
                label="Select Log Level"
                value={logLevelOptions.find(l => l.value === advancedSettings.logLevel)?.label || advancedSettings.logLevel}
                icon={Activity}
                darkMode={darkMode}
              />
            }
            align="left"
            width="full"
            darkMode={darkMode}
          >
            <DropdownHeader darkMode={darkMode}>Log Level</DropdownHeader>
            {logLevelOptions.map((option) => (
              <DropdownItem
                key={option.value}
                onClick={() => handleInputChange('advanced', 'logLevel', option.value)}
                darkMode={darkMode}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option.label}</span>
                  {advancedSettings.logLevel === option.value && (
                    <Check size={14} className="text-success" />
                  )}
                </div>
              </DropdownItem>
            ))}
          </Dropdown>
        </div>

        {/* Log Retention */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
            Log Retention (days)
          </label>
          <input
            type="number"
            value={advancedSettings.logRetention}
            onChange={(e) => handleInputChange('advanced', 'logRetention', e.target.value)}
            className={`w-full px-4 py-2.5 rounded-lg border transition-all
              focus:outline-none focus:ring-2 focus:ring-primary
              ${darkMode 
                ? 'bg-neutral-700/50 border-neutral-600 text-white' 
                : 'bg-neutral-50 border-neutral-200 text-neutral-900'}`}
          />
        </div>

        {/* Max File Upload */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
            Max File Upload (MB)
          </label>
          <input
            type="number"
            value={advancedSettings.maxFileUpload}
            onChange={(e) => handleInputChange('advanced', 'maxFileUpload', e.target.value)}
            className={`w-full px-4 py-2.5 rounded-lg border transition-all
              focus:outline-none focus:ring-2 focus:ring-primary
              ${darkMode 
                ? 'bg-neutral-700/50 border-neutral-600 text-white' 
                : 'bg-neutral-50 border-neutral-200 text-neutral-900'}`}
          />
        </div>

        {/* Allowed File Types */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
            Allowed File Types
          </label>
          <input
            type="text"
            value={advancedSettings.allowedFileTypes}
            onChange={(e) => handleInputChange('advanced', 'allowedFileTypes', e.target.value)}
            className={`w-full px-4 py-2.5 rounded-lg border transition-all
              focus:outline-none focus:ring-2 focus:ring-primary
              ${darkMode 
                ? 'bg-neutral-700/50 border-neutral-600 text-white' 
                : 'bg-neutral-50 border-neutral-200 text-neutral-900'}`}
            placeholder="jpg,png,pdf,doc"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        {advancedOptions.map(({ key, label, description }) => (
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
                checked={advancedSettings[key]}
                onChange={(e) => handleInputChange('advanced', key, e.target.checked)}
                className="sr-only"
              />
              <div className={`w-12 h-6 rounded-full transition-all duration-300
                            ${advancedSettings[key] 
                              ? 'bg-success' 
                              : darkMode ? 'bg-neutral-600' : 'bg-neutral-300'}`}>
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full 
                              transition-all duration-300 shadow-md
                              ${advancedSettings[key] ? 'translate-x-6' : ''}`} />
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdvancedSection;