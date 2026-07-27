// src/pages/Settings/sections/BackupSection.jsx
import React from 'react';
import { Clock, Database, Download, Upload, Check } from 'lucide-react';

const BackupSection = ({ 
  darkMode, 
  backupSettings, 
  handleInputChange,
  DropdownTrigger,
  Dropdown,
  DropdownItem,
  DropdownHeader
}) => {
  const backupFrequencyOptions = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const backupLocationOptions = [
    { value: 'local', label: 'Local Storage' },
    { value: 'cloud', label: 'Cloud Storage' },
    { value: 'both', label: 'Both' }
  ];

  const backupOptions = [
    { key: 'autoBackup', label: 'Auto Backup', description: 'Automatically backup data' },
    { key: 'includeMedia', label: 'Include Media', description: 'Backup media files' },
    { key: 'includeDatabase', label: 'Include Database', description: 'Backup database' },
    { key: 'includeConfigs', label: 'Include Configs', description: 'Backup configuration files' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Frequency */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
            Backup Frequency
          </label>
          <Dropdown
            trigger={
              <DropdownTrigger
                label="Select Frequency"
                value={backupFrequencyOptions.find(b => b.value === backupSettings.backupFrequency)?.label || backupSettings.backupFrequency}
                icon={Clock}
                darkMode={darkMode}
              />
            }
            align="left"
            width="full"
            darkMode={darkMode}
          >
            <DropdownHeader darkMode={darkMode}>Backup Frequency</DropdownHeader>
            {backupFrequencyOptions.map((option) => (
              <DropdownItem
                key={option.value}
                onClick={() => handleInputChange('backup', 'backupFrequency', option.value)}
                darkMode={darkMode}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option.label}</span>
                  {backupSettings.backupFrequency === option.value && (
                    <Check size={14} className="text-success" />
                  )}
                </div>
              </DropdownItem>
            ))}
          </Dropdown>
        </div>

        {/* Backup Time */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
            Backup Time
          </label>
          <input
            type="time"
            value={backupSettings.backupTime}
            onChange={(e) => handleInputChange('backup', 'backupTime', e.target.value)}
            className={`w-full px-4 py-2.5 rounded-lg border transition-all
              focus:outline-none focus:ring-2 focus:ring-primary
              ${darkMode 
                ? 'bg-neutral-700/50 border-neutral-600 text-white' 
                : 'bg-neutral-50 border-neutral-200 text-neutral-900'}`}
          />
        </div>

        {/* Retention Days */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
            Retention Days
          </label>
          <input
            type="number"
            value={backupSettings.retentionDays}
            onChange={(e) => handleInputChange('backup', 'retentionDays', e.target.value)}
            className={`w-full px-4 py-2.5 rounded-lg border transition-all
              focus:outline-none focus:ring-2 focus:ring-primary
              ${darkMode 
                ? 'bg-neutral-700/50 border-neutral-600 text-white' 
                : 'bg-neutral-50 border-neutral-200 text-neutral-900'}`}
            min="1"
            max="365"
          />
        </div>

        {/* Backup Location */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
            Backup Location
          </label>
          <Dropdown
            trigger={
              <DropdownTrigger
                label="Select Location"
                value={backupLocationOptions.find(b => b.value === backupSettings.backupLocation)?.label || backupSettings.backupLocation}
                icon={Database}
                darkMode={darkMode}
              />
            }
            align="left"
            width="full"
            darkMode={darkMode}
          >
            <DropdownHeader darkMode={darkMode}>Backup Location</DropdownHeader>
            {backupLocationOptions.map((option) => (
              <DropdownItem
                key={option.value}
                onClick={() => handleInputChange('backup', 'backupLocation', option.value)}
                darkMode={darkMode}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option.label}</span>
                  {backupSettings.backupLocation === option.value && (
                    <Check size={14} className="text-success" />
                  )}
                </div>
              </DropdownItem>
            ))}
          </Dropdown>
        </div>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        {backupOptions.map(({ key, label, description }) => (
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
                checked={backupSettings[key]}
                onChange={(e) => handleInputChange('backup', key, e.target.checked)}
                className="sr-only"
              />
              <div className={`w-12 h-6 rounded-full transition-all duration-300
                            ${backupSettings[key] 
                              ? 'bg-success' 
                              : darkMode ? 'bg-neutral-600' : 'bg-neutral-300'}`}>
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full 
                              transition-all duration-300 shadow-md
                              ${backupSettings[key] ? 'translate-x-6' : ''}`} />
              </div>
            </label>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-all hover:scale-105 btn-primary"
        >
          <Download size={16} />
          <span>Download Backup</span>
        </button>
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-lg
                   bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300
                   border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all hover:scale-105"
        >
          <Upload size={16} />
          <span>Restore Backup</span>
        </button>
      </div>
    </div>
  );
};

export default BackupSection;