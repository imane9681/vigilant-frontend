import React from 'react';
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from 'lucide-react';

const MetricCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  isPositive, 
  color, 
  subtitle, 
  delay, 
  variant = 'default',
  darkMode = false,
  lightBgOpacity = 1.0,  // ✅ قيمة شفافية الخلفية في الوضع الفاتح (0-1)
  darkBgOpacity = 1.0     // ✅ قيمة شفافية الخلفية في الوضع الداكن (0-1)
}) => {
  
  // ✅ اختيار شفافية الخلفية حسب الوضع
  const bgOpacity = darkMode ? darkBgOpacity : lightBgOpacity;

  // ✅ تحديد اللون المناسب حسب الـ variant
  const getColor = () => {
    switch(variant) {
      case 'success':
        return 'var(--success-color, #34D19C)';
      case 'secondary':
        return 'var(--primary-color, #8B7ABA)';
      case 'warning':
        return 'var(--secondary-color, #F08FAE)';
      case 'primary':
        return 'var(--accent-color, #EE9C6C)';
      case 'info':
        return 'var(--primary-color, #8B7ABA)';
      default:
        return 'var(--primary-color, #8B7ABA)';
    }
  };

  const bgColor = getColor();

  return (
    <div 
      className="relative rounded-2xl p-5 transition-all duration-300 hover:shadow-md hover:border-neutral-300 shadow-soft overflow-hidden"
      style={{ 
        backgroundColor: bgColor,
        opacity: bgOpacity
      }}
    >
      <img 
        src="/Group 34.png" 
        alt=""
        className="absolute -bottom-18 -right-16 h-[200px] w-auto object-contain pointer-events-none opacity-50"
      />
      <img 
        src="/Group 35.png" 
        alt=""
        className="absolute bottom-[45px] right-[169px] h-[150px] w-auto object-contain pointer-events-none opacity-30"
      />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl transition-all duration-300 bg-neutral-50/30 hover:scale-105">
            <div className={color || 'text-white'}>
              {icon}
            </div>
          </div>
          <p className="text-lg font-medium font-bold text-white">
            {title}
          </p>
        </div>
        
        <div className="mb-3">
          <p className="text-3xl font-bold text-white">
            {value}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          {subtitle && (
            <p className="text-sm text-white/80">
              {subtitle}
            </p>
          )}
          
          {change && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border ${
              isPositive ? 'bg-dynamic-success/20 border-dynamic-success/30' : 'bg-dynamic-secondary/20 border-dynamic-secondary/30'
            }`}>
              <span className={`text-xs font-bold flex items-center gap-1 ${
                isPositive ? 'text-dynamic-success' : 'text-dynamic-secondary'
              }`}>
                {isPositive ? (
                  <TrendingUpIcon size={14} />
                ) : (
                  <TrendingDownIcon size={14} />
                )}
                {change}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;