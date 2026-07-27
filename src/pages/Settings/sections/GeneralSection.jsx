// src/pages/Settings/sections/GeneralSection.jsx
import React from 'react';
import { Mail, Globe2, Calendar, Clock3, Languages, Check } from 'lucide-react';

const GeneralSection = ({ 
  darkMode, 
  generalSettings, 
  handleInputChange,
  DropdownTrigger,
  Dropdown,
  DropdownItem,
  DropdownHeader
}) => {
  // خيارات القوائم المنسدلة
  const timezoneOptions = [
    { value: 'UTC-12', label: 'UTC-12' },
    { value: 'UTC-11', label: 'UTC-11' },
    { value: 'UTC-10', label: 'UTC-10' },
    { value: 'UTC-9', label: 'UTC-9' },
    { value: 'UTC-8', label: 'UTC-8' },
    { value: 'UTC-7', label: 'UTC-7' },
    { value: 'UTC-6', label: 'UTC-6' },
    { value: 'UTC-5', label: 'UTC-5' },
    { value: 'UTC-4', label: 'UTC-4' },
    { value: 'UTC-3', label: 'UTC-3' },
    { value: 'UTC-2', label: 'UTC-2' },
    { value: 'UTC-1', label: 'UTC-1' },
    { value: 'UTC+0', label: 'UTC+0' },
    { value: 'UTC+1', label: 'UTC+1' },
    { value: 'UTC+2', label: 'UTC+2' },
    { value: 'UTC+3', label: 'UTC+3' },
    { value: 'UTC+4', label: 'UTC+4' },
    { value: 'UTC+5', label: 'UTC+5' },
    { value: 'UTC+6', label: 'UTC+6' },
    { value: 'UTC+7', label: 'UTC+7' },
    { value: 'UTC+8', label: 'UTC+8' },
    { value: 'UTC+9', label: 'UTC+9' },
    { value: 'UTC+10', label: 'UTC+10' },
    { value: 'UTC+11', label: 'UTC+11' },
    { value: 'UTC+12', label: 'UTC+12' }
  ];

  const dateFormatOptions = [
    { value: 'YYYY-MM-DD', label: 'yyyy-mm-dd' },
    { value: 'DD/MM/YYYY', label: 'dd/mm/yyyy' },
    { value: 'MM/DD/YYYY', label: 'mm/dd/yyyy' },
    { value: 'DD-MM-YYYY', label: 'dd-mm-yyyy' },
    { value: 'MM-DD-YYYY', label: 'mm-dd-yyyy' }
  ];

  const timeFormatOptions = [
    { value: '24h', label: '24-hour (14:30)' },
    { value: '12h', label: '12-hour (2:30 PM)' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'ar', label: 'Arabic', flag: '🇸🇦' },
    { value: 'fr', label: 'French', flag: '🇫🇷' },
    { value: 'es', label: 'Spanish', flag: '🇪🇸' },
    { value: 'de', label: 'German', flag: '🇩🇪' },
    { value: 'zh', label: 'Chinese', flag: '🇨🇳' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* العمود الأيسر */}
        <div className="space-y-4">
          {/* Site Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Site Name
            </label>
            <input
              type="text"
              value={generalSettings.siteName}
              onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border transition-all
                focus:outline-none focus:ring-2 focus:ring-primary
                ${darkMode 
                  ? 'bg-neutral-700/50 border-neutral-600 text-white' 
                  : 'bg-neutral-50 border-neutral-200 text-neutral-900'}`}
            />
          </div>

          {/* Site Description */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Site Description
            </label>
            <textarea
              value={generalSettings.siteDescription}
              onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
              rows="3"
              className={`w-full px-4 py-2.5 rounded-lg border transition-all
                focus:outline-none focus:ring-2 focus:ring-primary resize-none
                ${darkMode 
                  ? 'bg-neutral-700/50 border-neutral-600 text-white' 
                  : 'bg-neutral-50 border-neutral-200 text-neutral-900'}`}
            />
          </div>

          {/* Admin Email */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Admin Email
            </label>
            <div className="relative">
              <Mail size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`} />
              <input
                type="email"
                value={generalSettings.adminEmail}
                onChange={(e) => handleInputChange('general', 'adminEmail', e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all
                  focus:outline-none focus:ring-2 focus:ring-primary
                  ${darkMode 
                    ? 'bg-neutral-700/50 border-neutral-600 text-white' 
                    : 'bg-neutral-50 border-neutral-200 text-neutral-900'}`}
              />
            </div>
          </div>
        </div>

        {/* العمود الأيمن */}
        <div className="space-y-4">
          {/* Timezone */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Timezone
            </label>
            <Dropdown
              trigger={
                <DropdownTrigger
                  label="Select Timezone"
                  value={timezoneOptions.find(t => t.value === generalSettings.timezone)?.label || generalSettings.timezone}
                  icon={Globe2}
                  darkMode={darkMode}
                />
              }
              align="left"
              width="full"
              maxHeight="lg" 
              darkMode={darkMode}
            >
              <DropdownHeader darkMode={darkMode}>Select Timezone</DropdownHeader>
              {timezoneOptions.map((option) => (
                <DropdownItem
                  key={option.value}
                  onClick={() => handleInputChange('general', 'timezone', option.value)}
                  darkMode={darkMode}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    {generalSettings.timezone === option.value && (
                      <Check size={14} className="text-success" />
                    )}
                  </div>
                </DropdownItem>
              ))}
            </Dropdown>
          </div>

          {/* Date Format */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Date Format
            </label>
            <Dropdown
              trigger={
                <DropdownTrigger
                  label="Select Date Format"
                  value={dateFormatOptions.find(d => d.value === generalSettings.dateFormat)?.label || generalSettings.dateFormat}
                  icon={Calendar}
                  darkMode={darkMode}
                />
              }
              align="left"
              width="full"
              maxHeight="sm"
              darkMode={darkMode}
            >
              <DropdownHeader darkMode={darkMode}>Select Date Format</DropdownHeader>
              {dateFormatOptions.map((option) => (
                <DropdownItem
                  key={option.value}
                  onClick={() => handleInputChange('general', 'dateFormat', option.value)}
                  darkMode={darkMode}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    {generalSettings.dateFormat === option.value && (
                      <Check size={14} className="text-success" />
                    )}
                  </div>
                </DropdownItem>
              ))}
            </Dropdown>
          </div>

          {/* Time Format */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Time Format
            </label>
            <Dropdown
              trigger={
                <DropdownTrigger
                  label="Select Time Format"
                  value={timeFormatOptions.find(t => t.value === generalSettings.timeFormat)?.label || generalSettings.timeFormat}
                  icon={Clock3}
                  darkMode={darkMode}
                />
              }
              align="left"
              width="full"
              maxHeight="sm"
              darkMode={darkMode}
            >
              <DropdownHeader darkMode={darkMode}>Select Time Format</DropdownHeader>
              {timeFormatOptions.map((option) => (
                <DropdownItem
                  key={option.value}
                  onClick={() => handleInputChange('general', 'timeFormat', option.value)}
                  darkMode={darkMode}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    {generalSettings.timeFormat === option.value && (
                      <Check size={14} className="text-success" />
                    )}
                  </div>
                </DropdownItem>
              ))}
            </Dropdown>
          </div>

          {/* Language */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Language
            </label>
            <Dropdown
              trigger={
                <DropdownTrigger
                  label="Select Language"
                  value={languageOptions.find(l => l.value === generalSettings.language)?.label || generalSettings.language}
                  icon={Languages}
                  darkMode={darkMode}
                />
              }
              align="left"
              width="full"
              maxHeight="md"
              darkMode={darkMode}
            >
              <DropdownHeader darkMode={darkMode}>Select Language</DropdownHeader>
              {languageOptions.map((option) => (
                <DropdownItem
                  key={option.value}
                  onClick={() => handleInputChange('general', 'language', option.value)}
                  darkMode={darkMode}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span>{option.flag}</span>
                      <span>{option.label}</span>
                    </div>
                    {generalSettings.language === option.value && (
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
        {/* Maintenance Mode */}
        <div className={`flex items-center justify-between p-4 rounded-lg
                      ${darkMode ? 'bg-neutral-700/30' : 'bg-neutral-50'}`}>
          <div>
            <p className={`font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              Maintenance Mode
            </p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Put the site in maintenance mode
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={generalSettings.maintenanceMode}
              onChange={(e) => handleInputChange('general', 'maintenanceMode', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-12 h-6 rounded-full transition-all duration-300
                          ${generalSettings.maintenanceMode 
                            ? 'bg-success' 
                            : darkMode ? 'bg-neutral-600' : 'bg-neutral-300'}`}>
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full 
                            transition-all duration-300 shadow-md
                            ${generalSettings.maintenanceMode ? 'translate-x-6' : ''}`} />
            </div>
          </label>
        </div>

        {/* Debug Mode */}
        <div className={`flex items-center justify-between p-4 rounded-lg
                      ${darkMode ? 'bg-neutral-700/30' : 'bg-neutral-50'}`}>
          <div>
            <p className={`font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              Debug Mode
            </p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Enable debug information
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={generalSettings.debugMode}
              onChange={(e) => handleInputChange('general', 'debugMode', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-12 h-6 rounded-full transition-all duration-300
                          ${generalSettings.debugMode 
                            ? 'bg-accent' 
                            : darkMode ? 'bg-neutral-600' : 'bg-neutral-300'}`}>
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full 
                            transition-all duration-300 shadow-md
                            ${generalSettings.debugMode ? 'translate-x-6' : ''}`} />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default GeneralSection;