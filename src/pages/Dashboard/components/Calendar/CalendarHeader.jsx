// src/components/Calendar/CalendarHeader.jsx
import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from './utils/dateHelpers';

const CalendarHeader = ({ 
  darkMode, 
  currentDate, 
  onPrevMonth, 
  onNextMonth 
}) => {
  return (
    <div className="flex items-center pl-2.5 justify-between mb-3">
      
        <span className={`font-bold  min-w-28  text-lg ${darkMode ? 'text-white' : 'text-neutral-600'}`}>
          {formatDate(currentDate, 'MMMM yyyy')}
        </span>
        <div className="space-x-1">
        <button 
          onClick={onPrevMonth}
          className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-105 ${darkMode 
            ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' 
            : 'hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900'}`}
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>
        
        <button 
          onClick={onNextMonth}
          className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-105 ${darkMode 
            ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' 
            : 'hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900'}`}
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
        </div>
      
    </div>
  );
};

// استخدام React.memo لمنع إعادة التصيير غير الضرورية
export default React.memo(CalendarHeader);