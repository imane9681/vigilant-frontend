// src/pages/Dashboard/components/Calendar/AllEventsView.jsx
import React, { memo } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { formatDate } from './utils/dateHelpers';
import { getEventIcon, getEventColor, getEventTextColor, getPriorityColor, getPriorityBgColor } from './utils/eventHelpers';

const AllEventsView = ({ 
  events,
  darkMode,
  onViewDetails,
  onEditEvent,
  onDeleteEvent
}) => {
  // ترتيب الأحداث حسب التاريخ (من الأحدث إلى الأقدم)
  const sortedEvents = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
          All Scheduled Events ({events.length})
        </h4>
      </div>
      
      {sortedEvents.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {sortedEvents.map((event) => (
            <div 
              key={event.id}
              className={`p-4 rounded-xl transition-all duration-200 cursor-pointer hover:scale-[1.02] animate-fade-in-up ${darkMode 
                ? 'bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700' 
                : 'bg-neutral-50 hover:bg-neutral-100 border border-neutral-200'}`}
              onClick={() => onViewDetails(event)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getEventColor(event.type)} bg-opacity-20`}>
                    <div className={getEventTextColor(event.type)}>
                      {getEventIcon(event.type)}
                    </div>
                  </div>
                  <div>
                    <h5 className={`font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                      {event.name}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        {formatDate(event.date, 'MMM d')}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${getPriorityBgColor(event.priority)} ${getPriorityColor(event.priority)}`}>
                        {event.priority}
                      </span>
                      <span className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        {event.type.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditEvent(event);
                    }}
                    className={`p-2 rounded-lg transition-colors duration-200 ${darkMode 
                      ? 'hover:bg-neutral-700 text-neutral-400' 
                      : 'hover:bg-neutral-200 text-neutral-600'}`}
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEvent(event.id);
                    }}
                    className={`p-2 rounded-lg transition-colors duration-200 ${darkMode 
                      ? 'hover:bg-error-900/30 text-error-400' 
                      : 'hover:bg-error-100 text-error-600'}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-6 rounded-lg ${darkMode ? 'bg-neutral-800/30' : 'bg-neutral-50'}`}>
          <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            No events scheduled yet
          </p>
        </div>
      )}
    </div>
  );
};

export default memo(AllEventsView);