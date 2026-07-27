// src/pages/Dashboard/components/Calendar/EventList.jsx
import React, { memo, useState } from 'react';
import { 
  Eye, 
  Calendar, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle, 
  ChevronRight,
  Clock,
  Tag,
  DollarSign,
  Layers,
  Star,
  ShoppingBag,
  User
} from 'lucide-react';

// الألوان المخصصة مع تدرجات وتأثيرات
const colors = {
  order: { 
    primary: '#8B7ABA', 
    secondary: '#6B5A9A',
    light: '#A598D4',
    bg: '#8B7ABA12',
    gradient: 'linear-gradient(145deg, #8B7ABA20, #6B5A9A10)'
  },
  restock: { 
    primary: '#34D19C', 
    secondary: '#14B17C',
    light: '#B3F0DD',
    bg: '#34D19C12',
    gradient: 'linear-gradient(145deg, #34D19C20, #14B17C10)'
  },
  launch: { 
    primary: '#8B7ABA', 
    secondary: '#6B5A9A',
    light: '#A598D4',
    bg: '#8B7ABA12',
    gradient: 'linear-gradient(145deg, #8B7ABA20, #6B5A9A10)'
  },
  'low-stock': { 
    primary: '#F08FAE', 
    secondary: '#D06F8E',
    light: '#F5A9C2',
    bg: '#F08FAE12',
    gradient: 'linear-gradient(145deg, #F08FAE20, #D06F8E10)'
  },
  inventory: { 
    primary: '#EE9C6C', 
    secondary: '#CE7C4C',
    light: '#FADECF',
    bg: '#EE9C6C12',
    gradient: 'linear-gradient(145deg, #EE9C6C20, #CE7C4C10)'
  },
  customer: { 
    primary: '#EE9C6C', 
    secondary: '#CE7C4C',
    light: '#FADECF',
    bg: '#EE9C6C12',
    gradient: 'linear-gradient(145deg, #EE9C6C20, #CE7C4C10)'
  }
};

// أيقونات الأحداث
const eventIcons = {
  order: ShoppingBag,
  restock: Package,
  launch: TrendingUp,
  'low-stock': AlertTriangle,
  inventory: Layers,
  customer: User
};

// تنسيق النقاط الكثيرة
const formatNumber = (num) => {
  if (num >= 1000) return `${(num/1000).toFixed(1)}k`;
  return num.toString();
};

// مكون حدث واحد
const EventItem = memo(({ event, darkMode, onClick, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const eventColor = colors[event.type] || colors.restock;
  const IconComponent = eventIcons[event.type] || Calendar;

  return (
    <div 
      className={`animate-slide-in`}
      style={{ animationDelay: `${index * 60}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`relative rounded-xl transition-all duration-300 cursor-pointer
          ${isHovered ? 'scale-[1.02] shadow-lg' : 'shadow-sm'}
          ${darkMode 
            ? 'bg-neutral-800/90 hover:bg-neutral-800 border border-neutral-700/50' 
            : 'bg-white hover:bg-neutral-50/80 border border-neutral-200/80'}`}
        style={{
          boxShadow: isHovered && !darkMode ? `0 4px 12px ${eventColor.primary}30` : '',
          backdropFilter: 'blur(8px)',
        }}
        onClick={() => onClick(event)}
      >
        {/* شريط جانبي متدرج */}
        <div 
          className={`absolute -left-1.5 top-3 bottom-3 w-1 rounded-r-xl transition-all duration-300
            ${isHovered ? 'shadow-lg' : ''}`}
          style={{ 
            background: `linear-gradient(180deg, ${eventColor.primary}, ${eventColor.secondary})`,
            boxShadow: isHovered ? `0 0 12px ${eventColor.primary}` : 'none',
            width: isHovered ? '5px' : '4px'
          }}
        />

        {/* خلفية متدرجة تظهر عند التمرير */}
        <div 
          className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            background: eventColor.gradient,
          }}
        />

        <div className="relative p-3">
          <div className="flex items-center gap-3">
            {/* حاوية الأيقونة مع تأثيرات */}
            <div className="relative">
              <div 
                className={`absolute inset-0 rounded-lg blur-md transition-all duration-300 ${
                  isHovered ? 'opacity-10 scale-110' : 'opacity-0'
                }`}
                style={{ background: eventColor.primary }}
              />
              <div 
                className={`relative p-2.5 rounded-lg transition-all duration-300`}
                style={{ 
                  backgroundColor: eventColor.bg,
                  color: eventColor.primary,
                  boxShadow: isHovered ? `0 2px 4px ${eventColor.primary}40` : 'none',
                  border: isHovered ? `1.5px solid ${eventColor.primary}40` : '1px solid transparent'

                }}
              >
                <IconComponent size={18} />
              </div>

              {/* شارة الأولوية */}
              {event.priority === 'high' && (
                <div className="absolute -top-1 -right-1">
                  <div className="relative">
                    <Star size={8} className="text-amber-400 fill-amber-400" />
                    <span className="absolute inset-0 animate-ping rounded-full bg-amber-400 opacity-30" />
                  </div>
                </div>
              )}
              
              {event.priority === 'medium' && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                </div>
              )}
            </div>

            {/* المحتوى الرئيسي */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <h4 className={`text-sm font-medium truncate max-w-[180px] ${
                    darkMode ? 'text-white' : 'text-neutral-900'
                  }`}>
                    {event.name}
                  </h4>
                  
                  {/* نوع الحدث - شارة صغيرة */}
                  <span 
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap"
                    style={{ 
                      backgroundColor: `${eventColor.primary}15`,
                      color: eventColor.primary,
                      border: `1px solid ${eventColor.primary}30`
                    }}
                  >
                    {event.type === 'low-stock' ? 'stock' : event.type}
                  </span>
                </div>

                {/* سهم متحرك */}
                <ChevronRight 
                  size={14} 
                  className={`transition-all duration-300 ${
                    isHovered 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 -translate-x-2'
                  } ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}
                />
              </div>

              {/* بطاقات المعلومات المصغرة */}
              <div className="flex items-center gap-2 mt-1.5">
                {/* الكمية */}
                {event.quantity > 0 && (
                  <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px]
                    ${darkMode ? 'bg-neutral-700/50' : 'bg-neutral-100'}`}>
                    <Package size={10} className={darkMode ? 'text-neutral-400' : 'text-neutral-500'} />
                    <span className={`font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
                      {formatNumber(event.quantity)}
                    </span>
                  </div>
                )}

                {/* التكلفة */}
                {event.cost > 0 && (
                  <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px]
                    ${darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                    <DollarSign size={10} className="text-emerald-500" />
                    <span className="font-medium text-emerald-500">
                      {formatNumber(event.cost)}
                    </span>
                  </div>
                )}

                {/* المورد (مختصر) */}
                {event.supplier && (
                  <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] truncate max-w-[60px]
                    ${darkMode ? 'bg-neutral-700/50' : 'bg-neutral-100'}`}>
                    <Tag size={10} className={darkMode ? 'text-neutral-400' : 'text-neutral-500'} />
                    <span className={`truncate ${darkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
                      {event.supplier.split(' ')[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

EventItem.displayName = 'EventItem';

// المكون الرئيسي
const EventList = ({ 
  darkMode, 
  events, 
  onEventClick,
  onViewAll,
  maxItems = 4,
  emptyMessage = "No events scheduled"
}) => {
  const displayedEvents = events.slice(0, maxItems);
  const hasMoreEvents = events.length > maxItems;

  if (events.length === 0) {
    return (
      <div className={`relative rounded-xl p-[1.14rem] text-center overflow-hidden ${
        darkMode ? 'bg-neutral-800/30' : 'bg-neutral-50'
      }`}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Calendar size={32} className="animate-pulse-slow" />
          </div>
        </div>
        
        <div className="relative">
          <p className={`text-xs mb-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            {emptyMessage}
          </p>
          <p className={`text-[10px] ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Click a date to add events
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        {displayedEvents.map((event, index) => (
          <EventItem
            key={event.id}
            event={event}
            darkMode={darkMode}
            onClick={onEventClick}
            index={index}
          />
        ))}
      </div>
      
      {/* زر عرض المزيد */}
      {hasMoreEvents && (
        <button
          onClick={onViewAll}
          className={`w-full mt-3 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-300
            group relative overflow-hidden
            ${darkMode 
              ? 'bg-neutral-800/80 text-neutral-300 hover:text-white border border-neutral-700' 
              : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-neutral-200'}`}
        >
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            style={{ 
              background: 'linear-gradient(90deg, #8B7ABA, #F08FAE, #EE9C6C, #34D19C)'
            }}
          />
          <span className="relative flex items-center justify-center gap-1.5">
            <Eye size={12} />
            <span>View {events.length - maxItems} more</span>
            <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </button>
      )}
    </div>
  );
};

// أنماط CSS
const styles = `
  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-slide-in {
    animation: slide-in 0.25s cubic-bezier(0.2, 0, 0, 1) forwards;
  }

  .animate-pulse-slow {
    animation: pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

export default memo(EventList);