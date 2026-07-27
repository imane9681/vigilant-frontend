// hooks/useWidgetTimeRange.js
import { useState, useCallback, useMemo } from 'react';  


export const TIME_RANGES = {
  day: { label: 'Day', value: 'day', multiplier: 1, format: 'HH:mm' },
  week: { label: 'Week', value: 'week', multiplier: 7, format: 'EEE' },
  month: { label: 'Month', value: 'month', multiplier: 30, format: 'MMM d' },
  quarter: { label: 'Quarter', value: 'quarter', multiplier: 90, format: 'MMM' },
  year: { label: 'Year', value: 'year', multiplier: 365, format: 'yyyy' },
  all: { label: 'All Time', value: 'all', multiplier: 9999, format: 'yyyy' }
};

export const useWidgetTimeRange = (initialRange = 'month') => {
  const [timeRange, setTimeRange] = useState(initialRange);
  const [customRange, setCustomRange] = useState(null);
  const [isCustom, setIsCustom] = useState(false);

  const rangeConfig = useMemo(() => TIME_RANGES[timeRange] || TIME_RANGES.month, [timeRange]);

  const getDateRange = useCallback(() => {
    if (isCustom && customRange) {
      return customRange;
    }

    const end = new Date();
    const start = new Date();
    
    switch(timeRange) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
      case 'all':
        start.setFullYear(2000);
        break;
      default:
        start.setMonth(start.getMonth() - 1);
    }

    return { start, end };
  }, [timeRange, isCustom, customRange]);

  const setCustomDateRange = useCallback((start, end) => {
    setCustomRange({ start, end });
    setIsCustom(true);
  }, []);

  const resetToPreset = useCallback((range) => {
    setTimeRange(range);
    setIsCustom(false);
    setCustomRange(null);
  }, []);

  return {
    timeRange,
    setTimeRange,
    isCustom,
    customRange,
    setCustomDateRange,
    resetToPreset,
    getDateRange,
    rangeConfig,
    availableRanges: TIME_RANGES
  };
};