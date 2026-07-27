// src/pages/Dashboard/components/Calendar/utils/dateHelpers.js

// Helper functions for date operations
export const formatDate = (date, formatStr = 'MMMM yyyy') => {
  if (!date) return '';
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const weekday = date.getDay();
  
  switch(formatStr) {
    case 'MMMM yyyy':
      return `${months[month]} ${year}`;
    case 'MMM d':
      return `${shortMonths[month]} ${day}`;
    case 'd':
      return day.toString();
    case 'EEEE, MMMM d, yyyy':
      return `${weekdays[weekday]}, ${months[month]} ${day}, ${year}`;
    case 'MMMM d, yyyy':
      return `${months[month]} ${day}, ${year}`;
    default:
      return `${months[month]} ${day}, ${year}`;
  }
};

export const isToday = (date) => {
  if (!date) return false;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

export const getMonthDays = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  
  const days = [];
  
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  
  return days;
};

export const addMonths = (date, months) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

export const subMonths = (date, months) => {
  return addMonths(date, -months);
};