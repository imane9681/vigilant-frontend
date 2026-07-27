// components/ui/WidgetButtons.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  Calendar, CalendarDays, CalendarRange, 
  ChevronDown, Download, Settings, RefreshCw,
  Filter, MoreVertical, FileText, Camera, X
} from 'lucide-react';

const WidgetButtons = ({ 
  darkMode,
  type = 'default',
  timeRange,
  onTimeChange,
  onSettingsClick,
  onRefresh,
  onDownload,
  onMoreClick,
  isLoading = false,
  customButtons = [],
  position = 'right'
}) => {
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [error, setError] = useState(null);
  const timeDropdownRef = useRef(null);
  const moreMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      try {
        if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target)) {
          setShowTimeDropdown(false);
        }
        if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
          setShowMoreMenu(false);
        }
      } catch (err) {
        console.error('Error in handleClickOutside:', err);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const timeOptions = [
    { value: 'day', icon: Calendar, label: 'Day' },
    { value: 'week', icon: CalendarDays, label: 'Week' },
    { value: 'month', icon: Calendar, label: 'Month' },
    { value: 'quarter', icon: CalendarRange, label: 'Quarter' },
    { value: 'year', icon: Calendar, label: 'Year' },
    { value: 'all', icon: CalendarRange, label: 'All Time' }
  ];

  const buttonClass = `p-2 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 ${
    darkMode 
      ? 'bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700' 
      : 'bg-white hover:bg-neutral-50 border border-neutral-300 shadow-sm'
  }`;

  const iconClass = darkMode 
    ? 'text-neutral-400 hover:text-primary-400' 
    : 'text-neutral-600 hover:text-primary-600';

  // معالج تغيير الوقت مع التحقق من الأمان
  const handleTimeSelect = useCallback((value) => {
    try {
      setShowTimeDropdown(false);
      if (onTimeChange && typeof onTimeChange === 'function') {
        onTimeChange(value);
      }
    } catch (err) {
      console.error('Error in handleTimeSelect:', err);
      setError('Failed to change time range');
    }
  }, [onTimeChange]);

  // معالج النقر على خيارات more
  const handleMoreOptionClick = useCallback((action) => {
    try {
      setShowMoreMenu(false);
      if (onMoreClick && typeof onMoreClick === 'function') {
        onMoreClick(action);
      }
    } catch (err) {
      console.error('Error in handleMoreOptionClick:', err);
      setError('Failed to execute action');
    }
  }, [onMoreClick]);

  // زر الفلتر الزمني
  const TimeFilterButton = () => (
    <div className="relative" ref={timeDropdownRef}>
      <button
        onClick={() => setShowTimeDropdown(prev => !prev)}
        className={buttonClass}
        title="Change time range"
        aria-label="Change time range"
        type="button"
      >
        <Filter size={16} className={iconClass} />
      </button>
      
      {showTimeDropdown && (
        <div className={`absolute top-full mt-2 right-0 z-50 rounded-xl shadow-2xl border-0 overflow-hidden min-w-[160px] backdrop-blur-sm ${
          darkMode 
            ? 'bg-neutral-900/95 border border-neutral-700/50' 
            : 'bg-white/95 border border-neutral-200/50'
        }`}>
          <div className="p-2">
            <p className={`text-xs font-semibold px-3 py-1.5 mb-1 rounded-md ${
              darkMode ? 'text-neutral-400 bg-neutral-800/50' : 'text-neutral-500 bg-neutral-100'
            }`}>
              Time Range
            </p>
            {timeOptions.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => handleTimeSelect(value)}
                className={`w-full text-left px-3 py-2.5 text-sm capitalize transition-all duration-200 flex items-center gap-2 rounded-lg ${
                  timeRange === value
                    ? darkMode
                      ? 'bg-gradient-to-r from-primary-900/30 to-primary-800/20 text-primary-400'
                      : 'bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700'
                    : darkMode
                      ? 'hover:bg-neutral-800/70 text-neutral-300 hover:text-white'
                      : 'hover:bg-neutral-100 text-neutral-700 hover:text-neutral-900'
                }`}
                type="button"
              >
                <div className={`p-1.5 rounded-md ${
                  timeRange === value
                    ? darkMode ? 'bg-primary-900/30' : 'bg-primary-100'
                    : darkMode ? 'bg-neutral-800' : 'bg-neutral-100'
                }`}>
                  <Icon size={14} />
                </div>
                <span className="font-medium">{label}</span>
                {timeRange === value && (
                  <div className={`ml-auto w-1.5 h-1.5 rounded-full ${
                    darkMode ? 'bg-primary-400' : 'bg-primary-500'
                  }`} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // زر النقاط الثلاث (More) مع القائمة المنسدلة
  const MoreButton = () => (
    <div className="relative" ref={moreMenuRef}>
      <button
        onClick={() => setShowMoreMenu(prev => !prev)}
        className={buttonClass}
        title="More options"
        aria-label="More options"
        type="button"
      >
        <MoreVertical size={16} className={iconClass} />
      </button>
      
      {showMoreMenu && (
        <div className={`absolute top-full mt-2 right-0 z-50 rounded-xl shadow-2xl border-0 overflow-hidden min-w-[250px] backdrop-blur-sm ${
          darkMode 
            ? 'bg-neutral-900/95 border border-neutral-700/50' 
            : 'bg-white/95 border border-neutral-200/50'
        }`}>
          <div className="p-2">
            {/* Settings */}
            <button 
              onClick={() => handleMoreOptionClick('settings')}
              className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-3 group"
              type="button"
            >
              <div className={`p-1.5 rounded-md ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'} group-hover:scale-110 transition-transform`}>
                <Settings size={14} className={darkMode ? 'text-neutral-300' : 'text-neutral-600'} />
              </div>
              <div>
                <span className="font-medium block dark:text-white">Settings</span>
                <span className="text-xs text-neutral-500">Customize thresholds & colors</span>
              </div>
            </button>

            {/* Refresh */}
            <button 
              onClick={() => handleMoreOptionClick('refresh')}
              className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-3 group"
              type="button"
            >
              <div className={`p-1.5 rounded-md ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'} group-hover:scale-110 transition-transform`}>
                <RefreshCw size={14} className={`${isLoading ? 'animate-spin' : ''} ${darkMode ? 'text-neutral-300' : 'text-neutral-600'}`} />
              </div>
              <div>
                <span className="font-medium block dark:text-white">Refresh</span>
                <span className="text-xs text-neutral-500">Replay animation</span>
              </div>
            </button>

            {/* Divider */}
            <div className="border-t my-1 dark:border-neutral-700"></div>

            {/* Export as PDF */}
            <button 
              onClick={() => handleMoreOptionClick('exportPDF')}
              className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-3 group"
              type="button"
            >
              <div className={`p-1.5 rounded-md ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'} group-hover:scale-110 transition-transform`}>
                <Download size={14} className={darkMode ? 'text-neutral-300' : 'text-neutral-600'} />
              </div>
              <div>
                <span className="font-medium block dark:text-white">Export as PDF</span>
                <span className="text-xs text-neutral-500">Save report with chart</span>
              </div>
            </button>

            {/* Export as CSV */}
            <button 
              onClick={() => handleMoreOptionClick('exportCSV')}
              className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-3 group"
              type="button"
            >
              <div className={`p-1.5 rounded-md ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'} group-hover:scale-110 transition-transform`}>
                <FileText size={14} className={darkMode ? 'text-neutral-300' : 'text-neutral-600'} />
              </div>
              <div>
                <span className="font-medium block dark:text-white">Export as CSV</span>
                <span className="text-xs text-neutral-500">Download raw data</span>
              </div>
            </button>

            {/* Export as Image */}
            <button 
              onClick={() => handleMoreOptionClick('exportImage')}
              className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-3 group"
              type="button"
            >
              <div className={`p-1.5 rounded-md ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'} group-hover:scale-110 transition-transform`}>
                <Camera size={14} className={darkMode ? 'text-neutral-300' : 'text-neutral-600'} />
              </div>
              <div>
                <span className="font-medium block dark:text-white">Export as Image</span>
                <span className="text-xs text-neutral-500">Save chart as PNG</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // زر الإعدادات (اختياري)
  const SettingsButton = () => (
    <button
      onClick={onSettingsClick}
      className={buttonClass}
      title="Widget settings"
      aria-label="Widget settings"
      type="button"
    >
      <Settings size={16} className={iconClass} />
    </button>
  );

  // زر التحميل (اختياري)
  const DownloadButton = () => (
    <button
      onClick={() => onDownload?.('pdf')}
      className={buttonClass}
      title="Export as PDF"
      aria-label="Export as PDF"
      type="button"
    >
      <Download size={16} className={iconClass} />
    </button>
  );

  // زر التحديث (اختياري)
  const RefreshButton = () => (
    <button
      onClick={onRefresh}
      className={`${buttonClass} ${isLoading ? 'animate-spin' : ''}`}
      title="Refresh"
      aria-label="Refresh"
      disabled={isLoading}
      type="button"
    >
      <RefreshCw size={16} className={iconClass} />
    </button>
  );

  // تجميع الأزرار حسب النوع
  const renderButtons = () => {
    try {
      if (type === 'mixed' && customButtons.length > 0) {
        return customButtons.map((btn, idx) => {
          switch(btn) {
            case 'timeFilter': return <TimeFilterButton key={`btn-${idx}`} />;
            case 'more': return <MoreButton key={`btn-${idx}`} />;
            case 'settings': return <SettingsButton key={`btn-${idx}`} />;
            case 'download': return <DownloadButton key={`btn-${idx}`} />;
            case 'refresh': return <RefreshButton key={`btn-${idx}`} />;
            default: return null;
          }
        });
      }

      switch(type) {
        case 'timeFilter':
          return <TimeFilterButton />;
        case 'more':
          return <MoreButton />;
        case 'settings':
          return <SettingsButton />;
        case 'download':
          return <DownloadButton />;
        case 'refresh':
          return <RefreshButton />;
        default:
          return (
            <>
              <TimeFilterButton />
              <MoreButton />
            </>
          );
      }
    } catch (err) {
      console.error('Error rendering buttons:', err);
      return null;
    }
  };

  return (
    <div className={`flex items-center gap-1 sm:gap-2 ${position === 'left' ? 'justify-start' : 'justify-end'}`}>
      {renderButtons()}
      {error && (
        <div className={`text-xs ${darkMode ? 'text-red-400' : 'text-red-500'} ml-2`}>
          {error}
        </div>
      )}
    </div>
  );
};

WidgetButtons.propTypes = {
  darkMode: PropTypes.bool,
  type: PropTypes.oneOf(['default', 'timeFilter', 'more', 'settings', 'download', 'refresh', 'mixed']),
  timeRange: PropTypes.string,
  onTimeChange: PropTypes.func,
  onSettingsClick: PropTypes.func,
  onRefresh: PropTypes.func,
  onDownload: PropTypes.func,
  onMoreClick: PropTypes.func,
  isLoading: PropTypes.bool,
  customButtons: PropTypes.arrayOf(PropTypes.oneOf(['timeFilter', 'more', 'settings', 'download', 'refresh'])),
  position: PropTypes.oneOf(['left', 'right'])
};

export default WidgetButtons;