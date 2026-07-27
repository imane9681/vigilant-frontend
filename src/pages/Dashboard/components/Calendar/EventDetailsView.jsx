// src/pages/Dashboard/components/Calendar/EventDetailsView.jsx
import React, { memo } from 'react';
import { 
  Calendar, 
  Package, 
  DollarSign, 
  User, 
  BarChart, 
  Edit, 
  Trash2 
} from 'lucide-react';
import { formatDate } from './utils/dateHelpers';
import { getEventIcon, getEventTextColor, getPriorityColor, getPriorityBgColor } from './utils/eventHelpers';

const EventDetailsView = ({ 
  event,
  darkMode,
  onEditEvent,
  onDeleteEvent
}) => {
  return (
    <div className="space-y-6">
      {/* Event Type & Priority */}
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm ${darkMode 
          ? 'bg-black/30 text-neutral-300' 
          : 'bg-white/80 text-neutral-700'}`}>
          {event.type.replace('-', ' ')}
        </span>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getPriorityBgColor(event.priority)} ${getPriorityColor(event.priority)}`}>
          {event.priority} Priority
        </span>
      </div>

      {/* Event Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-neutral-800/50' : 'bg-neutral-100'} animate-fade-in-up`}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className={darkMode ? 'text-neutral-400' : 'text-neutral-500'} />
            <span className={`text-sm font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Date</span>
          </div>
          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
            {formatDate(event.date, 'MMMM d, yyyy')}
          </p>
        </div>
        
        {event.quantity > 0 && (
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-neutral-800/50' : 'bg-neutral-100'} animate-fade-in-up`}>
            <div className="flex items-center gap-2 mb-2">
              <Package size={16} className={darkMode ? 'text-neutral-400' : 'text-neutral-500'} />
              <span className={`text-sm font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Quantity</span>
            </div>
            <p className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              {event.quantity} units
            </p>
          </div>
        )}
        
        {event.cost > 0 && (
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-neutral-800/50' : 'bg-neutral-100'} animate-fade-in-up`}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className={darkMode ? 'text-neutral-400' : 'text-neutral-500'} />
              <span className={`text-sm font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Cost</span>
            </div>
            <p className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              ${event.cost.toLocaleString()}
            </p>
          </div>
        )}
        
        {event.supplier && (
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-neutral-800/50' : 'bg-neutral-100'} animate-fade-in-up`}>
            <div className="flex items-center gap-2 mb-2">
              <User size={16} className={darkMode ? 'text-neutral-400' : 'text-neutral-500'} />
              <span className={`text-sm font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Supplier</span>
            </div>
            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              {event.supplier}
            </p>
          </div>
        )}
      </div>
      
      {/* Description */}
      {event.description && (
        <div className="animate-fade-in-up">
          <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
            Description
          </h4>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-neutral-800/50' : 'bg-neutral-100'}`}>
            <p className={darkMode ? 'text-neutral-300' : 'text-neutral-700'}>
              {event.description}
            </p>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default memo(EventDetailsView);