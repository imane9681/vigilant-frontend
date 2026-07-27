import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

const Dropdown = ({ 
  trigger, 
  children, 
  align = 'left',
  width = 'auto',
  maxHeight = 'auto',
  darkMode,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideTrigger = dropdownRef.current && dropdownRef.current.contains(event.target);
      const clickedInsideMenu = menuRef.current && menuRef.current.contains(event.target);
      if (!clickedInsideTrigger && !clickedInsideMenu) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recalculate dropdown position on scroll/resize while open
  useEffect(() => {
    if (!isOpen) return;
    const update = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        // position: fixed => لا تضف scrollY/scrollX
        setPosition({
          top: rect.bottom,
          left: rect.left,
          width: rect.width
        });
      }
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen]);

  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 transform -translate-x-1/2'
  };

  const widthClasses = {
    auto: 'min-w-[180px] w-full',
    sm: 'w-48',
    md: 'w-64',
    lg: 'w-80',
    full: 'w-full'
  };

  const getMaxHeightClass = () => {
    switch(maxHeight) {
      case 'sm':
        return 'max-h-48';
      case 'md':
        return 'max-h-64';
      case 'lg':
        return 'max-h-96';
      case 'xl':
        return 'max-h-[32rem]';
      case 'auto':
        return 'max-h-[80vh]';
      default:
        return maxHeight;
    }
  };

  return (
    <div className={`relative inline-block w-full ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <div 
        ref={triggerRef}
        onClick={() => {
          const rect = triggerRef.current?.getBoundingClientRect();
          if (rect) {
            // position: fixed => استخدم إحداثيات viewport فقط
            setPosition({ top: rect.bottom, left: rect.left, width: rect.width });
          }
          setIsOpen(!isOpen);
        }}
        className="cursor-pointer w-full"
      >
        {trigger}
      </div>

      {/* Dropdown Menu - رفع z-index إلى 100 */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          {createPortal(
            <div 
              className="fixed inset-0 z-[990] lg:hidden"
              onClick={() => setIsOpen(false)}
            ></div>,
            document.body
          )}

          {/* Dropdown Content عبر بوابة في body لتجاوز أي stacking context */}
          {createPortal(
            <div
              ref={menuRef}
              className={`fixed z-[2000] animate-dropdown-slide`}
              style={{
                top: position.top,
                left: align === 'right' ? undefined : (align === 'center' ? position.left + position.width / 2 : position.left),
                right: align === 'right' ? Math.max(0, window.innerWidth - (position.left + position.width)) : undefined,
                width: width === 'full' ? position.width : undefined,
              }}
            >
              <div className={`${widthClasses[width]} ${align === 'center' ? 'transform -translate-x-1/2' : ''}`}>
                <div className={`
                  rounded-xl overflow-hidden w-full
                  transition-all duration-300
                  ${darkMode 
                    ? 'bg-neutral-800 border border-neutral-700 shadow-2xl' 
                    : 'bg-white border border-neutral-200 shadow-xl'
                  }
                `}>
                  {/* Content مع تحديد أقصى ارتفاع وإضافة scroll */}
                  <div className={`
                    py-1 w-full overflow-y-auto
                    ${getMaxHeightClass()}
                    scrollbar-thin scrollbar-thumb-neutral-400 scrollbar-track-transparent
                    ${darkMode 
                      ? 'scrollbar-thumb-neutral-600' 
                      : 'scrollbar-thumb-neutral-300'
                    }
                  `}>
                    {children}
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
};

// باقي الكود كما هو...
export const DropdownItem = ({ 
  icon: Icon, 
  children, 
  onClick, 
  variant = 'default',
  disabled = false,
  darkMode 
}) => {
  const variants = {
    default: {
      base: darkMode ? 'text-neutral-200' : 'text-neutral-700',
      hover: darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-50',
      icon: darkMode ? 'text-neutral-400' : 'text-neutral-500'
    },
    danger: {
      base: 'text-red-600',
      hover: darkMode ? 'hover:bg-red-500/10' : 'hover:bg-red-50',
      icon: 'text-red-500'
    },
    success: {
      base: 'text-green-600',
      hover: darkMode ? 'hover:bg-green-500/10' : 'hover:bg-green-50',
      icon: 'text-green-500'
    }
  };

  return (
    <button
      className={`
        w-full px-4 py-2.5 flex items-center gap-3 text-sm
        transition-all duration-200 group
        ${variants[variant].base}
        ${variants[variant].hover}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:pl-5'}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && (
        <div className={`
          transition-all duration-200
          ${variants[variant].icon}
          group-hover:scale-110
        `}>
          <Icon size={16} />
        </div>
      )}
      <span className="flex-1 text-left truncate">{children}</span>
      
      {/* Optional: Right arrow on hover */}
      <ChevronDown 
        size={14} 
        className={`
          opacity-0 -rotate-90 transition-all duration-200 flex-shrink-0
          group-hover:opacity-50 group-hover:translate-x-1
        `} 
      />
    </button>
  );
};

export const DropdownDivider = ({ darkMode }) => (
  <div className={`my-1 border-t w-full ${darkMode ? 'border-neutral-700' : 'border-neutral-100'}`}></div>
);

export const DropdownHeader = ({ children, darkMode }) => (
  <div className={`
    px-4 py-2 text-xs font-semibold uppercase tracking-wider w-full
    ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}
  `}>
    {children}
  </div>
);

export default Dropdown;