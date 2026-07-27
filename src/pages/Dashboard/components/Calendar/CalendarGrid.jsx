// src/components/Calendar/CalendarGrid.jsx
import React, { memo } from 'react';
import { isToday, formatDate } from './utils/dateHelpers';
import { getEventColor } from './utils/eventHelpers';

// مكون اليوم الواحد
const CalendarDay = memo(({ 
  day, 
  darkMode, 
  isSelected, 
  hasEvents, 
  eventType, 
  onClick,
  isCurrentMonth
}) => {
  if (!day) {
    return <div className="h-10" />;
  }
  
  const isCurrentDay = isToday(day);
  
  const textColorClass = !isCurrentMonth
    ? darkMode 
      ? 'text-neutral-600' 
      : 'text-neutral-400'
    : isSelected 
      ? 'text-primary-100 dark:text-primary-400'
      : isCurrentDay
        ? 'text-primary-600 dark:text-primary-400 font-bold'
        : darkMode 
          ? 'text-neutral-300' 
          : 'text-neutral-700';
  
  // ✅ لون النقطة
  const dotColor = eventType ? getEventColor(eventType) : '#8B7ABA';
  
  return (
    <div className="flex items-center justify-center h-11">
      <button
        onClick={() => onClick(day)}
        className={`relative h-10 w-10 rounded-full transition-all duration-200 flex items-center justify-center mx-auto
          ${isSelected 
            ? darkMode 
              ? 'bg-primary-900/40 border border-primary-700 shadow-inner-lg' 
              : 'bg-primary-800/80 shadow-inner-lg'
            : darkMode 
              ? 'hover:bg-neutral-800/50' 
              : 'hover:bg-neutral-100'}
          ${isCurrentDay && !isSelected && isCurrentMonth
            ? darkMode 
              ? 'border border-primary-500 shadow-sm' 
              : 'bg-primary-100 shadow-sm'
            : ''}
          ${!isCurrentMonth ? 'opacity-50' : ''}`}
        aria-label={`Date ${formatDate(day, 'MMMM d, yyyy')}`}
      >
        <span className={`text-sm font-medium ${textColorClass}`}>
          {formatDate(day, 'd')}
        </span>
        
        {/* ✅ نقطة الحدث - تظهر دائماً إذا كان هناك حدث */}
        {hasEvents && isCurrentMonth && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
            <div 
              className="w-1 h-1 rounded-full" 
              style={{ backgroundColor: dotColor }}
            />
          </div>
        )}
      </button>
    </div>
  );
});

CalendarDay.displayName = 'CalendarDay';

// المكون الرئيسي للشبكة
const CalendarGrid = ({ 
  darkMode, 
  currentDate, 
  selectedDate, 
  events, 
  onDateClick,
  getEventsForDate,
  isSameDay 
}) => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const calendarDays = React.useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    const startDate = new Date(year, month, 1 - firstDayOfWeek);
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  }, [currentDate]);

  const rows = [];
  for (let i = 0; i < 6; i++) {
    rows.push(calendarDays.slice(i * 7, (i + 1) * 7));
  }

  return (
    <div className="mb-5">
      {/* أيام الأسبوع */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {weekDays.map((day) => (
          <div 
            key={day}
            className={`text-center text-xs font-medium py-1 h-10 flex items-center justify-center ${darkMode 
              ? 'text-neutral-400' 
              : 'text-neutral-500'}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* أيام الشهر */}
      <div className="space-y-2">
        {rows.map((week, weekIndex) => (
          <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-0.5">
            {week.map((day, dayIndex) => {
              const dateEvents = getEventsForDate(day);
              const hasEvents = dateEvents.length > 0;
              // ✅ استخدام نوع الحدث الأول للنقطة
              const eventType = hasEvents ? dateEvents[0].type : null;
              
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              
              return (
                <CalendarDay
                  key={`day-${weekIndex}-${dayIndex}-${day.toISOString()}`}
                  day={day}
                  darkMode={darkMode}
                  isSelected={isSameDay(day, selectedDate)}
                  hasEvents={hasEvents}
                  eventType={eventType}
                  onClick={onDateClick}
                  isCurrentMonth={isCurrentMonth}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(CalendarGrid);