// src/pages/Settings/components/ToggleSwitch.jsx
import React from 'react';

const ToggleSwitch = ({ 
  checked, 
  onChange, 
  label, 
  description, 
  darkMode,
  disabled = false,
  size = 'default',
  color = 'success' // success, primary, accent, secondary
}) => {
  
  const getSizeClasses = () => {
    switch(size) {
      case 'small':
        return {
          wrapper: 'w-8 h-4',
          dot: 'w-3 h-3',
          translate: 'translate-x-4'
        };
      case 'large':
        return {
          wrapper: 'w-14 h-7',
          dot: 'w-5 h-5',
          translate: 'translate-x-7'
        };
      default:
        return {
          wrapper: 'w-12 h-6',
          dot: 'w-4 h-4',
          translate: 'translate-x-6'
        };
    }
  };

  const getColorClasses = () => {
    switch(color) {
      case 'success':
        return checked ? 'bg-success' : (darkMode ? 'bg-neutral-600' : 'bg-neutral-300');
      case 'primary':
        return checked ? 'bg-primary' : (darkMode ? 'bg-neutral-600' : 'bg-neutral-300');
      case 'accent':
        return checked ? 'bg-accent' : (darkMode ? 'bg-neutral-600' : 'bg-neutral-300');
      case 'secondary':
        return checked ? 'bg-secondary-custom' : (darkMode ? 'bg-neutral-600' : 'bg-neutral-300');
      default:
        return checked ? 'bg-success' : (darkMode ? 'bg-neutral-600' : 'bg-neutral-300');
    }
  };

  const sizeClasses = getSizeClasses();
  const colorClasses = getColorClasses();

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg transition-all
                    ${darkMode ? 'bg-neutral-700/30 hover:bg-neutral-700/50' : 'bg-neutral-50 hover:bg-neutral-100'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
         onClick={() => !disabled && onChange(!checked)}
    >
      <div>
        {label && (
          <p className={`font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
            {label}
          </p>
        )}
        {description && (
          <p className={`text-xs mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            {description}
          </p>
        )}
      </div>
      
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div className={`${sizeClasses.wrapper} rounded-full transition-all duration-300 ${colorClasses}`}>
          <div className={`absolute top-0.5 left-0.5 ${sizeClasses.dot} bg-white rounded-full 
                        transition-all duration-300 shadow-md
                        ${checked ? sizeClasses.translate : ''}`} />
        </div>
      </div>
    </div>
  );
};

export default ToggleSwitch;