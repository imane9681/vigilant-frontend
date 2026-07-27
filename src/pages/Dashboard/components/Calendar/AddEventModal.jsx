// src/components/Calendar/AddEventModal.jsx
import React, { memo } from 'react';
import { Plus, X, Edit, Package, DollarSign, User, FileText } from 'lucide-react';
import { formatDate } from './utils/dateHelpers';

// ✅ ألوان المشروع
const COLORS = {
  primary: '#8B7ABA',
  secondary: '#F08FAE',
  accent: '#EE9C6C',
  success: '#34D19C',
  gradient: 'linear-gradient(135deg, #8B7ABA 0%, #F08FAE 50%, #EE9C6C 100%)'
};

const AddEventModal = ({ 
  darkMode,
  newEvent,
  editingEvent,
  isClosing,
  onClose,
  onSaveEvent,
  onNewEventChange
}) => {
  const handleClose = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleInputChange = (field, value) => {
    onNewEventChange({ ...newEvent, [field]: value });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
    >
      <div 
        className={`rounded-2xl w-full max-w-md transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'} ${
          darkMode 
            ? 'bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 shadow-2xl' 
            : 'bg-gradient-to-br from-white to-neutral-50 border border-neutral-200 shadow-2xl'
        }`}
      >
        {/* Modal Header */}
        <div className={`rounded-t-2xl p-6 border-b ${
          darkMode ? 'border-neutral-700' : 'border-neutral-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="p-3 rounded-xl backdrop-blur-sm"
                style={{ 
                  background: darkMode ? 'bg-neutral-800/50' : 'bg-white/80',
                  border: `1px solid ${COLORS.primary}30`
                }}
              >
                {editingEvent ? (
                  <Edit size={22} style={{ color: COLORS.primary }} />
                ) : (
                  <Plus size={22} style={{ color: COLORS.primary }} />
                )}
              </div>
              <div>
                <h3 className={`text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-neutral-900'
                }`}>
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h3>
                <p className={`text-sm mt-1 ${
                  darkMode ? 'text-neutral-400' : 'text-neutral-500'
                }`}>
                  {formatDate(newEvent.date, 'MMMM d, yyyy')}
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
        </div>

        {/* Modal Form */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="animate-fade-in-up">
            <label className={`text-sm font-semibold mb-2 block ${
              darkMode ? 'text-neutral-300' : 'text-neutral-700'
            }`}>
              Event Name *
            </label>
            <input
              type="text"
              value={newEvent.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-offset-2 ${
                darkMode 
                  ? 'bg-neutral-800/50 border-neutral-700 text-white focus:border-[#8B7ABA] focus:ring-[#8B7ABA]/30' 
                  : 'bg-white border-neutral-300 text-neutral-900 focus:border-[#8B7ABA] focus:ring-[#8B7ABA]/20'
              }`}
              placeholder="Enter event name"
              autoFocus
              style={{ '--tw-ring-color': COLORS.primary }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 animate-fade-in-up">
            <div>
              <label className={`text-sm font-semibold mb-2 block ${
                darkMode ? 'text-neutral-300' : 'text-neutral-700'
              }`}>
                Event Type
              </label>
              <select
                value={newEvent.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-offset-2 ${
                  darkMode 
                    ? 'bg-neutral-800/50 border-neutral-700 text-white focus:border-[#8B7ABA] focus:ring-[#8B7ABA]/30' 
                    : 'bg-white border-neutral-300 text-neutral-900 focus:border-[#8B7ABA] focus:ring-[#8B7ABA]/20'
                }`}
                style={{ '--tw-ring-color': COLORS.primary }}
              >
                <option value="restock">Restock</option>
                <option value="launch">Launch</option>
                <option value="low-stock">Low Stock</option>
                <option value="order">Order</option>
                <option value="inventory">Inventory</option>
              </select>
            </div>

            <div>
              <label className={`text-sm font-semibold mb-2 block ${
                darkMode ? 'text-neutral-300' : 'text-neutral-700'
              }`}>
                Priority
              </label>
              <select
                value={newEvent.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-offset-2 ${
                  darkMode 
                    ? 'bg-neutral-800/50 border-neutral-700 text-white focus:border-[#8B7ABA] focus:ring-[#8B7ABA]/30' 
                    : 'bg-white border-neutral-300 text-neutral-900 focus:border-[#8B7ABA] focus:ring-[#8B7ABA]/20'
                }`}
                style={{ '--tw-ring-color': COLORS.primary }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 animate-fade-in-up">
            <div>
              <label className={`text-sm font-semibold mb-2 block ${
                darkMode ? 'text-neutral-300' : 'text-neutral-700'
              }`}>
                Quantity
              </label>
              <input
                type="number"
                value={newEvent.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-offset-2 ${
                  darkMode 
                    ? 'bg-neutral-800/50 border-neutral-700 text-white focus:border-[#8B7ABA] focus:ring-[#8B7ABA]/30' 
                    : 'bg-white border-neutral-300 text-neutral-900 focus:border-[#8B7ABA] focus:ring-[#8B7ABA]/20'
                }`}
                placeholder="Enter quantity"
                style={{ '--tw-ring-color': COLORS.primary }}
              />
            </div>

            <div>
              <label className={`text-sm font-semibold mb-2 block ${
                darkMode ? 'text-neutral-300' : 'text-neutral-700'
              }`}>
                Cost ($)
              </label>
              <input
                type="number"
                value={newEvent.cost}
                onChange={(e) => handleInputChange('cost', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-offset-2 ${
                  darkMode 
                    ? 'bg-neutral-800/50 border-neutral-700 text-white focus:border-[#8B7ABA] focus:ring-[#8B7ABA]/30' 
                    : 'bg-white border-neutral-300 text-neutral-900 focus:border-[#8B7ABA] focus:ring-[#8B7ABA]/20'
                }`}
                placeholder="Enter cost"
                style={{ '--tw-ring-color': COLORS.primary }}
              />
            </div>
          </div>

          <div className="animate-fade-in-up">
            <label className={`text-sm font-semibold mb-2 block ${
              darkMode ? 'text-neutral-300' : 'text-neutral-700'
            }`}>
              Supplier
            </label>
            <input
              type="text"
              value={newEvent.supplier}
              onChange={(e) => handleInputChange('supplier', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-offset-2 ${
                darkMode 
                  ? 'bg-neutral-800/50 border-neutral-700 text-white focus:border-[#8B7ABA] focus:ring-[#8B7ABA]/30' 
                  : 'bg-white border-neutral-300 text-neutral-900 focus:border-[#8B7ABA] focus:ring-[#8B7ABA]/20'
              }`}
              placeholder="Enter supplier name"
              style={{ '--tw-ring-color': COLORS.primary }}
            />
          </div>

          <div className="animate-fade-in-up">
            <label className={`text-sm font-semibold mb-2 block ${
              darkMode ? 'text-neutral-300' : 'text-neutral-700'
            }`}>
              Description
            </label>
            <textarea
              value={newEvent.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows="3"
              className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-offset-2 resize-none ${
                darkMode 
                  ? 'bg-neutral-800/50 border-neutral-700 text-white focus:border-[#8B7ABA] focus:ring-[#8B7ABA]/30' 
                  : 'bg-white border-neutral-300 text-neutral-900 focus:border-[#8B7ABA] focus:ring-[#8B7ABA]/20'
              }`}
              placeholder="Enter event description"
              style={{ '--tw-ring-color': COLORS.primary }}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`sticky bottom-0 p-6 border-t backdrop-blur-sm ${
          darkMode 
            ? 'bg-neutral-900/95 border-neutral-700' 
            : 'bg-white/95 border-neutral-200'
        }`}>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className={`flex-1 py-3.5 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] animate-pop-in ${
                darkMode 
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700' 
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300'
              }`}
            >
              Cancel
            </button>
            <button 
              onClick={onSaveEvent}
              className={`flex-1 py-3.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 hover:scale-[1.02] animate-pop-in text-white`}
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                boxShadow: `0 10px 20px -10px ${COLORS.primary}`
              }}
            >
              {editingEvent ? (
                <>
                  <Edit size={18} />
                  Update Event
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Add Event
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(AddEventModal);