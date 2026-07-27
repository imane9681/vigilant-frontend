// components/ui/IconWrapper.jsx
import React from 'react';

const IconWrapper = ({ 
  children, 
  size = 20, 
  darkMode = false, 
  isHovered = false,
  variant = 'default', // default, primary, success, warning, danger
  className = '' 
}) => {
  
  // تعريف أنماط الخلفيات المختلفة حسب الوضع والـ variant
  const getBgClasses = () => {
    if (darkMode) {
      switch(variant) {
        case 'primary':
          return 'bg-gradient-to-br from-purple-900/20 to-purple-800/10 shadow-inner';
        case 'success':
          return 'bg-gradient-to-br from-green-900/20 to-green-800/10 shadow-inner';
        case 'warning':
          return 'bg-gradient-to-br from-amber-900/20 to-amber-800/10 shadow-inner';
        case 'danger':
          return 'bg-gradient-to-br from-red-900/20 to-red-800/10 shadow-inner';
        default:
          return 'bg-gradient-to-br from-purple-900/20 to-purple-800/10 shadow-inner';
      }
    } else {
      switch(variant) {
        case 'primary':
          return 'bg-primary-100 shadow-sm';
        case 'success':
          return 'bg-green-100 shadow-sm';
        case 'warning':
          return 'bg-amber-100 shadow-sm';
        case 'danger':
          return 'bg-red-100 shadow-sm';
        default:
          return 'bg-primary-100 shadow-sm';
      }
    }
  };

  // تعريف ألوان الأيقونة حسب الوضع والـ variant
  const getIconColorClasses = () => {
    if (darkMode) {
      switch(variant) {
        case 'primary':
          return 'text-purple-400';
        case 'success':
          return 'text-green-400';
        case 'warning':
          return 'text-amber-400';
        case 'danger':
          return 'text-red-400';
        default:
          return 'text-purple-400';
      }
    } else {
      switch(variant) {
        case 'primary':
          return 'text-primary-800/80';
        case 'success':
          return 'text-green-800/80';
        case 'warning':
          return 'text-amber-800/80';
        case 'danger':
          return 'text-red-800/80';
        default:
          return 'text-primary-800/80';
      }
    }
  };

  return (
    <div className={`
      p-2.5 rounded-xl transition-all duration-300
      ${getBgClasses()}
      ${isHovered ? 'scale-110' : ''}
      ${className}
    `}>
      {React.cloneElement(children, {
        size,
        className: getIconColorClasses()
      })}
    </div>
  );
};

export default IconWrapper;