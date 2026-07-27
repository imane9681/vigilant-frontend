// src/pages/Dashboard/components/Calendar/utils/eventHelpers.js
import React from 'react';
import { 
  Calendar, 
  Package, 
  AlertTriangle, 
  TrendingUp,
  CheckCircle,
  ShoppingBag,
  User
} from 'lucide-react';

// ✅ ألوان المشروع
const COLORS = {
  primary: '#8B7ABA',
  secondary: '#F08FAE',
  accent: '#EE9C6C',
  success: '#34D19C'
};

// Get event color based on type
export const getEventColor = (type) => {
  switch(type) {
    case 'order': return COLORS.primary;
    case 'restock': return COLORS.success;
    case 'launch': return COLORS.primary;
    case 'low-stock': return COLORS.secondary;
    case 'inventory': return COLORS.accent;
    case 'customer': return COLORS.accent;
    default: return COLORS.primary;
  }
};

// Get event text color based on type
export const getEventTextColor = (type) => {
  const color = getEventColor(type);
  return color;
};

// Get event icon based on type
export const getEventIcon = (type) => {
  switch(type) {
    case 'order': return <ShoppingBag size={16} />;
    case 'restock': return <Package size={16} />;
    case 'launch': return <TrendingUp size={16} />;
    case 'low-stock': return <AlertTriangle size={16} />;
    case 'inventory': return <Package size={16} />;
    case 'customer': return <User size={16} />;
    default: return <Calendar size={16} />;
  }
};

// Get priority color
export const getPriorityColor = (priority) => {
  switch(priority) {
    case 'high': return 'text-error-500 dark:text-error-400';
    case 'medium': return 'text-warning-500 dark:text-warning-400';
    case 'low': return 'text-success-500 dark:text-success-400';
    default: return 'text-neutral-500 dark:text-neutral-400';
  }
};

// Get priority background color
export const getPriorityBgColor = (priority) => {
  switch(priority) {
    case 'high': return 'bg-error-100 dark:bg-error-900/30';
    case 'medium': return 'bg-warning-100 dark:bg-warning-900/30';
    case 'low': return 'bg-success-100 dark:bg-success-900/30';
    default: return 'bg-neutral-100 dark:bg-neutral-900/30';
  }
};

// Filter events by date
export const getEventsForDate = (events, date, isSameDayFunc) => {
  if (!date) return [];
  return events.filter(event => isSameDayFunc(event.date, date));
};

// Get today's events
export const getTodayEvents = (events, isSameDayFunc) => {
  const today = new Date();
  return getEventsForDate(events, today, isSameDayFunc);
};