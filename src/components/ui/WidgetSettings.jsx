// components/ui/WidgetSettings.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Settings, Save, X, RefreshCw, 
  Eye, EyeOff, Zap, Palette, Moon, Sun,
  Layers, FolderTree
} from 'lucide-react';

const WidgetSettings = ({ 
  isOpen, 
  onClose, 
  onSave,
  settings,
  darkMode,
  sections = [],
  title = 'Widget Settings',
  description = 'Customize your widget display'
}) => {
  const [tempSettings, setTempSettings] = useState(settings);

  useEffect(() => {
    if (isOpen) {
      setTempSettings(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(tempSettings);
    onClose();
  };

  const handleReset = () => {
    setTempSettings(settings);
  };

  const renderSection = (section) => {
    switch(section.type) {
      case 'thresholds':
        return (
          <div key={section.id} className="space-y-4">
            <h4 className={`font-semibold dark:text-white flex items-center gap-2`}>
              <span>{section.title}</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(tempSettings.thresholds || {}).map(([key, value]) => (
                <div key={key} className={`p-3 rounded-lg ${
                  darkMode ? 'bg-neutral-800/50 border border-neutral-700' : 'bg-neutral-50 border border-neutral-200'
                }`}>
                  <label className="block text-sm font-medium mb-2 capitalize dark:text-neutral-300">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={section.min || 0}
                      max={section.max || 100}
                      step={section.step || 0.1}
                      value={value}
                      onChange={(e) => setTempSettings(prev => ({
                        ...prev,
                        thresholds: {
                          ...prev.thresholds,
                          [key]: parseFloat(e.target.value)
                        }
                      }))}
                      className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="w-16 text-sm font-semibold text-center px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-700 dark:text-white">
                      {value}{section.unit || '%'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      // ✅ ✅ ✅ قسم عرض الفئات (جديد)
      case 'categoryDisplay':
        return (
          <div key={section.id} className={`p-4 rounded-lg ${
            darkMode ? 'bg-neutral-800/50 border border-neutral-700' : 'bg-neutral-50 border border-neutral-200'
          }`}>
            <h4 className={`font-semibold dark:text-white mb-4 flex items-center gap-2`}>
              <FolderTree size={18} className="text-primary-500" />
              <span>{section.title}</span>
            </h4>
            
            <p className={`text-sm mb-4 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {section.description}
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {/* ✅ خيار الفئات الرئيسية فقط */}
              <button
                onClick={() => setTempSettings(prev => ({
                  ...prev,
                  showAllCategories: false
                }))}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                  tempSettings.showAllCategories === false
                    ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/10'
                    : darkMode 
                      ? 'border-neutral-700 hover:border-neutral-600' 
                      : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <FolderTree size={28} className={`mx-auto mb-2 ${
                  tempSettings.showAllCategories === false 
                    ? 'text-primary-500' 
                    : darkMode ? 'text-neutral-500' : 'text-neutral-400'
                }`} />
                <p className={`text-sm font-medium ${
                  tempSettings.showAllCategories === false
                    ? 'text-primary-500'
                    : darkMode ? 'text-neutral-300' : 'text-neutral-700'
                }`}>
                  Main Categories
                </p>
                <p className={`text-xs mt-1 ${
                  darkMode ? 'text-neutral-500' : 'text-neutral-400'
                }`}>
                  Top-level only
                </p>
              </button>
              
              {/* ✅ خيار جميع الفئات */}
              <button
                onClick={() => setTempSettings(prev => ({
                  ...prev,
                  showAllCategories: true
                }))}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                  tempSettings.showAllCategories === true
                    ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/10'
                    : darkMode 
                      ? 'border-neutral-700 hover:border-neutral-600' 
                      : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <Layers size={28} className={`mx-auto mb-2 ${
                  tempSettings.showAllCategories === true 
                    ? 'text-primary-500' 
                    : darkMode ? 'text-neutral-500' : 'text-neutral-400'
                }`} />
                <p className={`text-sm font-medium ${
                  tempSettings.showAllCategories === true
                    ? 'text-primary-500'
                    : darkMode ? 'text-neutral-300' : 'text-neutral-700'
                }`}>
                  All Categories
                </p>
                <p className={`text-xs mt-1 ${
                  darkMode ? 'text-neutral-500' : 'text-neutral-400'
                }`}>
                  Including sub-categories
                </p>
              </button>
            </div>
          </div>
        );

      case 'toggles':
        return (
          <div key={section.id} className={`p-4 rounded-lg ${
            darkMode ? 'bg-neutral-800/50 border border-neutral-700' : 'bg-neutral-50 border border-neutral-200'
          }`}>
            <h4 className={`font-semibold dark:text-white mb-4`}>{section.title}</h4>
            
            <div className="space-y-4">
              {section.options.map(option => (
                <label key={option.key} className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${
                      tempSettings[option.key] 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                        : 'bg-neutral-100 dark:bg-neutral-800'
                    }`}>
                      {option.icon || (tempSettings[option.key] ? 
                        <Eye size={16} className="text-emerald-600 dark:text-emerald-400" /> : 
                        <EyeOff size={16} className="text-neutral-500 dark:text-neutral-400" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-medium dark:text-neutral-300">{option.label}</span>
                      {option.description && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{option.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={tempSettings[option.key]}
                      onChange={(e) => setTempSettings(prev => ({
                        ...prev,
                        [option.key]: e.target.checked
                      }))}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-all duration-300 ${
                      tempSettings[option.key] 
                        ? 'bg-emerald-500' 
                        : 'bg-neutral-300 dark:bg-neutral-700'
                    } group-hover:shadow-lg group-hover:scale-105`}>
                      <div className={`w-5 h-5 rounded-full bg-white transform transition-all duration-300 ${
                        tempSettings[option.key] ? 'translate-x-7' : 'translate-x-1'
                      }`} style={{ marginTop: 2 }}></div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case 'slider':
        return (
          <div key={section.id} className={`p-4 rounded-lg ${
            darkMode ? 'bg-neutral-800/50 border border-neutral-700' : 'bg-neutral-50 border border-neutral-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className={`font-semibold dark:text-white`}>{section.title}</h4>
                {section.description && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{section.description}</p>
                )}
              </div>
              <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {tempSettings[section.key]}{section.unit}
              </span>
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min={section.min}
                max={section.max}
                step={section.step}
                value={tempSettings[section.key]}
                onChange={(e) => setTempSettings(prev => ({
                  ...prev,
                  [section.key]: section.type === 'number' ? parseFloat(e.target.value) : e.target.value
                }))}
                className="w-full h-2 bg-gradient-to-r from-emerald-500 via-primary-500 to-amber-500 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span>{section.minLabel || section.min}{section.unit}</span>
                <span>{section.maxLabel || section.max}{section.unit}</span>
              </div>
            </div>
          </div>
        );

      case 'colorPicker':
        return (
          <div key={section.id} className={`p-4 rounded-lg ${
            darkMode ? 'bg-neutral-800/50 border border-neutral-700' : 'bg-neutral-50 border border-neutral-200'
          }`}>
            <h4 className={`font-semibold dark:text-white mb-4`}>{section.title}</h4>
            
            <div className="grid grid-cols-6 gap-2">
              {section.colors.map(color => (
                <button
                  key={color}
                  className="w-8 h-8 rounded-lg border-2 border-transparent hover:border-white hover:scale-110 transition-all duration-200 shadow-lg"
                  style={{ background: color }}
                  onClick={() => setTempSettings(prev => ({
                    ...prev,
                    [section.key]: color
                  }))}
                />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl transform transition-all duration-300 max-h-[90vh] overflow-hidden ${
        darkMode 
          ? 'bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700' 
          : 'bg-gradient-to-br from-white to-neutral-50 border border-neutral-200'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200/50 dark:border-neutral-700/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-primary-900/20' : 'bg-primary-100'}`}>
              <Settings size={20} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className={`font-bold text-lg dark:text-white`}>{title}</h3>
              <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>{description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-neutral-700/50' : 'hover:bg-neutral-200/50'} transition-colors`}
          >
            <X size={20} className={darkMode ? 'text-neutral-400' : 'text-neutral-500'} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {sections.map(renderSection)}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-neutral-200/50 dark:border-neutral-700/50">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 text-neutral-600 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
          >
            <RefreshCw size={16} />
            Reset
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl"
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

WidgetSettings.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  darkMode: PropTypes.bool,
  sections: PropTypes.array,
  title: PropTypes.string,
  description: PropTypes.string
};

export default WidgetSettings;