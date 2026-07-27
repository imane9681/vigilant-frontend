// src/pages/Dashboard/components/Calendar/EventModal.jsx
import React, { memo } from 'react';
import { 
  X, 
  Calendar, 
  Eye,
  Package,
  ShoppingBag,
  User,
  DollarSign,
  Clock,
  Tag,
  Building2,
  FileText,
  Edit2,
  Trash2,
  BarChart3,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Truck,
  RefreshCw
} from 'lucide-react';
import { formatDate } from './utils/dateHelpers';
import { getEventIcon, getEventTextColor, getPriorityColor, getPriorityBgColor } from './utils/eventHelpers';
import EventDetailsView from './EventDetailsView';
import DayEventsView from './DayEventsView';
import AllEventsView from './AllEventsView';

// ✅ ألوان المشروع
const COLORS = {
  primary: '#8B7ABA',
  secondary: '#F08FAE',
  accent: '#EE9C6C',
  success: '#34D19C',
  gradient: 'linear-gradient(135deg, #8B7ABA 0%, #F08FAE 50%, #EE9C6C 100%)'
};

const EventModal = ({ 
  darkMode,
  selectedEvent,
  allEvents,
  selectedDateEvents,
  selectedDate,
  viewMode,
  isClosing,
  onClose,
  onViewAllEvents,
  onViewDetails,
  onEditEvent,
  onDeleteEvent,
  getEventColor
}) => {
  const handleClose = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getModalTitle = () => {
    if (selectedEvent) {
      return selectedEvent.name;
    } else if (viewMode === 'day') {
      return `${formatDate(selectedDate, 'MMMM d')} Events`;
    } else {
      return 'All Events';
    }
  };

  const getModalSubtitle = () => {
    if (selectedEvent) {
      return formatDate(selectedEvent.date, 'EEEE, MMMM d, yyyy');
    } else if (viewMode === 'day') {
      return 'Events for this day';
    } else {
      return 'All scheduled events';
    }
  };

  // ✅ الحصول على لون الحدث
  const getEventTypeColor = (type) => {
    switch(type) {
      case 'order': return COLORS.primary;
      case 'restock': return COLORS.success;
      case 'inventory': return COLORS.accent;
      case 'launch': return COLORS.secondary;
      case 'low-stock': return '#F08FAE';
      default: return COLORS.primary;
    }
  };

  // ✅ الحصول على أيقونة الحدث
  const getEventTypeIcon = (type) => {
    switch(type) {
      case 'order': return <ShoppingBag size={22} />;
      case 'restock': return <Package size={22} />;
      case 'inventory': return <RefreshCw size={22} />;
      case 'launch': return <Truck size={22} />;
      case 'low-stock': return <AlertCircle size={22} />;
      default: return <Calendar size={22} />;
    }
  };

  // ✅ الحصول على خلفية الحدث
  const getEventBgColor = (type) => {
    const color = getEventTypeColor(type);
    return `${color}15`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
    >
      <div 
        className={`rounded-2xl w-full max-w-lg transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'} ${
          darkMode 
            ? 'bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 shadow-2xl' 
            : 'bg-gradient-to-br from-white to-neutral-50 border border-neutral-200 shadow-2xl'
        }`}
      >
        {/* Modal Header مع تدرج لوني */}
        <div className={`rounded-t-2xl p-6 border-b ${
          darkMode ? 'border-neutral-700' : 'border-neutral-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="p-3 rounded-xl backdrop-blur-sm"
                style={{ 
                  background: selectedEvent 
                    ? getEventBgColor(selectedEvent.type)
                    : darkMode ? 'bg-neutral-800/50' : 'bg-white/80',
                  border: `1px solid ${selectedEvent ? getEventTypeColor(selectedEvent.type) : COLORS.primary}30`
                }}
              >
                {selectedEvent ? (
                  <div style={{ color: getEventTypeColor(selectedEvent.type) }}>
                    {getEventTypeIcon(selectedEvent.type)}
                  </div>
                ) : (
                  <Calendar size={22} style={{ color: COLORS.primary }} />
                )}
              </div>
              <div>
                <h3 className={`text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-neutral-900'
                }`}>
                  {getModalTitle()}
                </h3>
                <p className={`text-sm mt-1 ${
                  darkMode ? 'text-neutral-400' : 'text-neutral-500'
                }`}>
                  {getModalSubtitle()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 hover:rotate-90 ${
                darkMode 
                  ? 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700/50 hover:text-white' 
                  : 'bg-white/80 text-neutral-600 hover:bg-white hover:text-neutral-900 backdrop-blur-sm'
              }`}
            >
              <X size={20} />
            </button>
          </div>
          
          {/* ✅ شارة نوع الحدث */}
          {selectedEvent && (
            <div className="flex items-center gap-3">
              <span 
                className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                  darkMode ? 'bg-neutral-800/50 text-neutral-300' : 'bg-white/80 text-neutral-700'
                }`}
                style={{ 
                  border: `1px solid ${getEventTypeColor(selectedEvent.type)}30`
                }}
              >
                {selectedEvent.type.replace('-', ' ')}
              </span>
              <span 
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  getPriorityBgColor(selectedEvent.priority)
                } ${getPriorityColor(selectedEvent.priority)}`}
                style={{
                  border: `1px solid ${getPriorityColor(selectedEvent.priority)}30`
                }}
              >
                {selectedEvent.priority} Priority
              </span>
              {selectedEvent.quantity > 0 && (
                <span 
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    background: `${COLORS.accent}15`,
                    color: COLORS.accent,
                    border: `1px solid ${COLORS.accent}30`
                  }}
                >
                  {selectedEvent.quantity} units
                </span>
              )}
            </div>
          )}

          {/* ✅ عرض عدد الأحداث في وضع اليوم */}
          {viewMode === 'day' && (
            <div className="flex items-center gap-3">
              <span 
                className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
                  darkMode ? 'bg-neutral-800/50 text-neutral-300' : 'bg-white/80 text-neutral-700'
                }`}
              >
                All Days
              </span>
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ 
                  background: `${COLORS.primary}15`,
                  color: COLORS.primary,
                  border: `1px solid ${COLORS.primary}30`
                }}
              >
                {selectedDateEvents.length} Events
              </span>
            </div>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {selectedEvent ? (
            <EventDetailsView
              event={selectedEvent}
              darkMode={darkMode}
              onEditEvent={onEditEvent}
              onDeleteEvent={onDeleteEvent}
            />
          ) : viewMode === 'day' ? (
            <DayEventsView
              events={selectedDateEvents}
              date={selectedDate}
              darkMode={darkMode}
              onViewDetails={onViewDetails}
              onEditEvent={onEditEvent}
              onDeleteEvent={onDeleteEvent}
              onViewAllEvents={onViewAllEvents}
            />
          ) : (
            <AllEventsView
              events={allEvents}
              darkMode={darkMode}
              onViewDetails={onViewDetails}
              onEditEvent={onEditEvent}
              onDeleteEvent={onDeleteEvent}
            />
          )}
        </div>

        {/* ✅ Footer مع أزرار بتصميم جديد */}
        <div className={`p-6 border-t ${
          darkMode ? 'border-neutral-700' : 'border-neutral-200'
        }`}>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                darkMode 
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700' 
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200'
              }`}
            >
              Close
            </button>
            
            {/* ✅ زر عرض التفاصيل في وضع اليوم */}
            {viewMode === 'day' && selectedDateEvents.length >= 0 && (
              <button
                onClick={onViewAllEvents}
                className={`flex-1 py-3 rounded-xl font-medium text-white transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2`}
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                  boxShadow: `0 10px 20px -10px ${COLORS.primary}`
                }}
              >
                <Eye size={16} />
                View All
              </button>
            )}

            {/* ✅ زر تعديل في وضع التفاصيل */}
            {selectedEvent && (
              <>
                <button
                  onClick={() => onEditEvent(selectedEvent)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
                    darkMode 
                      ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700' 
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200'
                  }`}
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => onDeleteEvent(selectedEvent.id)}
                  className={`flex-1 py-3 rounded-xl font-medium text-white transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2`}
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.accent})`,
                    boxShadow: `0 10px 20px -10px ${COLORS.secondary}`
                  }}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(EventModal);