// src/pages/Settings/components/DropdownTrigger.jsx
import React from 'react';
import { ChevronDown } from 'lucide-react';

const DropdownTrigger = ({ label, value, icon: Icon, darkMode, onClick, isOpen }) => {
  return (
    <div
      onClick={onClick}
      className={`
        w-full px-4 py-2.5 rounded-lg border transition-all
        flex items-center justify-between cursor-pointer
        ${darkMode 
          ? 'bg-neutral-700/50 border-neutral-600 text-white hover:bg-neutral-700' 
          : 'bg-neutral-50 border-neutral-200 text-neutral-900 hover:bg-neutral-100'}
        ${isOpen ? 'ring-2 ring-primary' : ''}
      `}
    >
      <div className="flex items-center gap-2 truncate">
        {Icon && (
          <Icon 
            size={16} 
            className={darkMode ? 'text-neutral-400 flex-shrink-0' : 'text-neutral-500 flex-shrink-0'} 
          />
        )}
        <span className="truncate">{value || label}</span>
      </div>
      <ChevronDown 
        size={16} 
        className={`flex-shrink-0 transition-transform duration-300 ${
          isOpen ? 'rotate-180' : ''
        } ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`} 
      />
    </div>
  );
};

export default DropdownTrigger;