// src/pages/Analytics/components/SalesHeatmap.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Info,
  ChevronLeft,
  ChevronRight,
  Target,
  BarChart3,
  Zap,
  Clock,
  X,
  Loader2,
  RefreshCw
} from 'lucide-react';
import IconWrapper from '../../../components/ui/IconWrapper';
import WidgetButtons from '../../../components/ui/WidgetButtons';
import { useWidgetExport } from '../../../hooks/useWidgetExport';
import { orderService } from '../../../services/api';

const SalesHeatmap = ({ darkMode }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('Just now');
  const widgetRef = useRef(null);

  const { exportToPDF, exportToCSV, exportToImage } = useWidgetExport({
    widgetRef,
    fileName: 'sales_heatmap_report',
    darkMode
  });

  // ✅ جلب البيانات الحقيقية
  const fetchHeatmapData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await orderService.getAll({ page_size: 200 });
      const orders = response.data.results || response.data;


      // ✅ تصفية الطلبات حسب الشهر الحالي
      const filteredOrders = orders.filter(order => {
        const date = new Date(order.created_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });

      // ✅ تجميع المبيعات حسب اليوم
      const dailySales = {};
      filteredOrders.forEach(order => {
        const day = new Date(order.created_at).getDate();
        const amount = parseFloat(order.total_amount) || 0;
        if (!dailySales[day]) {
          dailySales[day] = { sales: 0, orders: 0 };
        }
        dailySales[day].sales += amount;
        dailySales[day].orders += 1;
      });

      const maxSales = Math.max(...Object.values(dailySales).map(d => d.sales), 0);

      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const data = [];
      let totalSales = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        const dayData = dailySales[day] || { sales: 0, orders: 0 };
        const sales = dayData.sales;
        const orders = dayData.orders;
        
        totalSales += sales;
        
        let intensity = 0;
        if (maxSales > 0) {
          const ratio = sales / maxSales;
          if (ratio > 0.75) intensity = 4;
          else if (ratio > 0.5) intensity = 3;
          else if (ratio > 0.25) intensity = 2;
          else if (ratio > 0) intensity = 1;
        }

        data.push({
          day,
          date,
          sales,
          orders,
          isWeekend,
          intensity,
          dayOfWeek,
          weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]
        });
      }

      const dataWithPercent = data.map(item => ({
        ...item,
        percentOfTotal: totalSales > 0 ? ((item.sales / totalSales) * 100).toFixed(1) : '0.0'
      }));

      setHeatmapData(dataWithPercent);
      setLastUpdated(new Date().toLocaleString());

    } catch (err) {
      console.error('❌ Error fetching heatmap data:', err);
      setError('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    fetchHeatmapData();
  }, [fetchHeatmapData]);

  const totalMonthSales = heatmapData.reduce((sum, day) => sum + day.sales, 0);
  const avgDailySales = heatmapData.length > 0 ? Math.round(totalMonthSales / heatmapData.length) : 0;
  
  const peakDayData = heatmapData.length > 0 ? 
    heatmapData.reduce((max, day) => day.sales > max.sales ? day : max, heatmapData[0]) : null;
  
  const bestWeekday = heatmapData.length > 0 ? 
    Object.entries(
      heatmapData.reduce((acc, day) => {
        if (!acc[day.weekday]) acc[day.weekday] = { total: 0, count: 0 };
        acc[day.weekday].total += day.sales;
        acc[day.weekday].count += 1;
        return acc;
      }, {})
    ).map(([weekday, data]) => ({
      weekday,
      avg: Math.round(data.total / data.count)
    })).reduce((best, curr) => curr.avg > best.avg ? curr : best) : null;

  const handleMoreClick = useCallback((action) => {
    switch(action) {
      case 'exportPDF':
        exportToPDF({
          month: months[currentMonth],
          year: currentYear,
          totalSales: totalMonthSales,
          avgDailySales,
          peakDay: peakDayData ? {
            day: peakDayData.day,
            sales: peakDayData.sales,
            orders: peakDayData.orders
          } : null,
          bestWeekday: bestWeekday?.weekday,
          data: heatmapData.map(d => ({
            day: d.day,
            date: d.date.toLocaleDateString(),
            sales: d.sales,
            orders: d.orders,
            intensity: d.intensity,
            percentOfTotal: d.percentOfTotal
          }))
        }, `Sales Heatmap - ${months[currentMonth]} ${currentYear}`);
        break;
      case 'exportCSV':
        exportToCSV(heatmapData.map(d => ({
          Date: d.date.toLocaleDateString(),
          Day: d.day,
          Weekday: d.weekday,
          Sales: d.sales,
          Orders: d.orders,
          Intensity: getIntensityLabel(d.intensity),
          'Percent of Total': d.percentOfTotal + '%'
        })));
        break;
      case 'exportImage':
        exportToImage();
        break;
      case 'refresh':
        fetchHeatmapData();
        break;
      default:
        break;
    }
  }, [currentMonth, currentYear, heatmapData, totalMonthSales, avgDailySales, peakDayData, bestWeekday, exportToPDF, exportToCSV, exportToImage, fetchHeatmapData]);

  const getIntensityColor = (intensity) => {
    const colors = [
      '#F5F0FF',
      '#E1D5F0',
      '#C2B0D9',
      '#A38FC2',
      '#8B7ABA'
    ];
    
    if (darkMode) {
      return [
        '#2D2540',
        '#4A3F60',
        '#6B5B8C',
        '#8B7ABA',
        '#9F8ED0'
      ][intensity];
    }
    
    return colors[intensity] || colors[0];
  };

  const getIntensityLabel = (intensity) => {
    const labels = ['No Sales', 'Low', 'Medium', 'High', 'Very High'];
    return labels[intensity] || 'N/A';
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCloseSelectedDay = () => {
    setSelectedDay(null);
  };

  // ✅ حالة التحميل
  if (loading) {
    return (
      <div className={`rounded-2xl p-6 min-h-[500px] flex items-center justify-center ${darkMode ? 'bg-neutral-900 border border-neutral-800' : 'bg-white border border-neutral-200 shadow-lg'}`}>
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto mb-3 text-[#8B7ABA]" />
          <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Loading sales data...</p>
        </div>
      </div>
    );
  }

  // ✅ حالة الخطأ
  if (error) {
    return (
      <div className={`rounded-2xl p-6 min-h-[500px] flex items-center justify-center ${darkMode ? 'bg-neutral-900 border border-neutral-800' : 'bg-white border border-neutral-200 shadow-lg'}`}>
        <div className="text-center">
          <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-500'}`}>{error}</p>
          <button onClick={fetchHeatmapData} className="mt-3 px-4 py-2 bg-[#8B7ABA] text-white rounded-lg text-sm hover:bg-[#7A6AA9] transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ✅ حالة عدم وجود بيانات - مع أزرار التنقل
  if (heatmapData.length === 0 || heatmapData.every(d => d.sales === 0)) {
    return (
      <div className={`relative rounded-2xl p-5 border transition-all duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-800 hover:border-purple-500/30' 
          : 'bg-gradient-to-br from-white to-neutral-50 border-neutral-200/80 hover:border-purple-200 shadow-lg hover:shadow-2xl'
      }`}>
        {/* Card Header - مع أزرار التنقل */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <IconWrapper darkMode={darkMode} variant="primary" size={20}>
              <Calendar />
            </IconWrapper>
            <div>
              <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                Sales Heatmap
              </h3>
              <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Daily sales intensity 
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* ✅ أزرار التنقل - موجودة دائماً */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  darkMode 
                    ? 'bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700' 
                    : 'bg-white hover:bg-neutral-50 border border-neutral-300 shadow-sm'
                }`}
              >
                <ChevronLeft size={18} className={darkMode ? 'text-neutral-400' : 'text-neutral-600'} />
              </button>
              
              <div className="text-center min-w-[140px]">
                <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                  {months[currentMonth]} {currentYear}
                </div>
              </div>
              
              <button
                onClick={handleNextMonth}
                disabled={currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  darkMode 
                    ? 'bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700' 
                    : 'bg-white hover:bg-neutral-50 border border-neutral-300 shadow-sm'
                } ${currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronRight size={18} className={darkMode ? 'text-neutral-400' : 'text-neutral-600'} />
              </button>
            </div>

            <WidgetButtons
              darkMode={darkMode}
              type="mixed"
              customButtons={['more']}
              onMoreClick={handleMoreClick}
            />
          </div>
        </div>

        {/* ✅ محتوى No Data */}
        <div className="min-h-[300px] flex flex-col items-center justify-center">
          
            <div className={`p-4 rounded-full ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'} mx-auto mb-4`}>
              <Calendar size={40} className={darkMode ? 'text-neutral-600' : 'text-neutral-400'} />
            </div>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              No Sales Data Available
            </h3>
            <p className={`text-sm mt-2 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              No orders found for {months[currentMonth]} {currentYear}
            </p>
            <button
              onClick={fetchHeatmapData}
              className="mt-3 px-4 py-2 font-medium text-sm bg-primary-300 text-white rounded-lg hover:bg-primary-800/80 transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          
        </div>

        {/* ✅ Legend - موجودة دائماً */}
        <div className="pt-4 mt-4 border-t border-neutral-200/50 dark:border-neutral-800/50">
          <div className="text-center">
            <div className={`text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Intensity Legend
            </div>
            <div className="flex items-center justify-center gap-1">
              {[0, 1, 2, 3, 4].map(intensity => (
                <div key={intensity} className="flex flex-col items-center">
                  <div
                    className="w-8 h-3 rounded"
                    style={{ backgroundColor: getIntensityColor(intensity) }}
                    title={getIntensityLabel(intensity)}
                  />
                  <span className="text-[10px] mt-1 text-neutral-500 dark:text-neutral-400">
                    {intensity === 0 ? 'None' : intensity === 4 ? 'High' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const totalCells = 42;
  const remainingDays = totalCells - (firstDayOfMonth + totalDaysInMonth);
  
  return (
    <div 
      ref={widgetRef}
      className={`relative rounded-2xl p-5 border transition-all duration-300 ${
        darkMode 
            ? 'bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-800 hover:border-primary-500/30' 
            : 'bg-gradient-to-br from-white to-neutral-50 border-neutral-200/80 hover:border-primary-200 shadow-lg hover:shadow-2xl'
        }`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <IconWrapper 
            darkMode={darkMode} 
            variant="primary"
            size={20}
          >
            <Calendar />
          </IconWrapper>
          
          <div>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              Sales Heatmap
            </h3>
            <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Daily sales intensity 
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                darkMode 
                  ? 'bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700' 
                  : 'bg-white hover:bg-neutral-50 border border-neutral-300 shadow-sm'
              }`}
            >
              <ChevronLeft size={18} className={darkMode ? 'text-neutral-400' : 'text-neutral-600'} />
            </button>
            
            <div className="text-center min-w-[140px]">
              <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                {months[currentMonth]} {currentYear}
              </div>
            </div>
            
            <button
              onClick={handleNextMonth}
              disabled={currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                darkMode 
                  ? 'bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700' 
                  : 'bg-white hover:bg-neutral-50 border border-neutral-300 shadow-sm'
              } ${currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ChevronRight size={18} className={darkMode ? 'text-neutral-400' : 'text-neutral-600'} />
            </button>
          </div>

          <WidgetButtons
            darkMode={darkMode}
            type="mixed"
            customButtons={['more']}
            onMoreClick={handleMoreClick}
          />
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="mb-8 px-1">
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className={`text-center py-2 text-xs font-medium rounded-lg ${
              darkMode ? 'text-neutral-400 bg-neutral-800/30' : 'text-neutral-500 bg-neutral-100'
            }`}>
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => {
            const prevMonthDate = new Date(currentYear, currentMonth, -firstDayOfMonth + idx + 1);
            return (
              <div 
                key={`prev-${idx}`} 
                className={`h-12 rounded-lg flex items-center justify-center ${
                  darkMode ? 'bg-neutral-800/20' : 'bg-neutral-100/30'
                }`}
              >
                <span className={`text-xs ${darkMode ? 'text-neutral-600' : 'text-neutral-300'}`}>
                  {prevMonthDate.getDate()}
                </span>
              </div>
            );
          })}
          
          {heatmapData.map(day => (
            <button
              key={day.day}
              onClick={() => setSelectedDay(selectedDay?.day === day.day ? null : day)}
              className={`relative h-12 rounded-lg transition-all duration-300 group ${
                selectedDay?.day === day.day 
                  ? 'ring-2 ring-offset-1 ring-primary-300 scale-105 z-10' 
                  : 'hover:scale-105 hover:z-10'
              } ${day.isWeekend ? 'ring-1 ring-purple-300 ring-opacity-40' : ''}`}
              style={{ 
                backgroundColor: getIntensityColor(day.intensity),
                borderColor: day.isWeekend ? (darkMode ? '#8B7ABA' : '#C2B0D9') : 'transparent',
                borderWidth: day.isWeekend ? '1px' : '0px'
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-xs font-bold ${
                  day.intensity > 2 ? 'text-white' : darkMode ? 'text-neutral-300' : 'text-neutral-700'
                }`}>
                  {day.day}
                </span>
                {day.sales > 0 && (
                  <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                    day.intensity > 2 ? 'bg-white/70' : darkMode ? 'bg-purple-300/50' : 'bg-purple-400/50'
                  }`}></div>
                )}
              </div>
              
              <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg shadow-xl z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap ${
                darkMode ? 'bg-neutral-900 text-white border border-neutral-700' : 'bg-white text-neutral-900 border border-neutral-200'
              }`}>
                <div className="font-bold mb-1 text-sm">{day.date.toLocaleDateString()}</div>
                <div className="text-xs space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-neutral-500">Sales:</span>
                    <span className="font-bold" style={{ color: '#34D19C' }}>{formatCurrency(day.sales)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-neutral-500">Orders:</span>
                    <span className="font-bold" style={{ color: '#8B7ABA' }}>{day.orders}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-neutral-500">Intensity:</span>
                    <span className="font-medium">{getIntensityLabel(day.intensity)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-neutral-500">Share:</span>
                    <span className="font-medium">{day.percentOfTotal}%</span>
                  </div>
                </div>
                
                <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 ${
                  darkMode ? 'bg-neutral-900 border-r border-b border-neutral-700' : 'bg-white border-r border-b border-neutral-200'
                }`}></div>
              </div>
            </button>
          ))}
          
          {Array.from({ length: remainingDays }).map((_, idx) => {
            const nextMonthDate = new Date(currentYear, currentMonth + 1, idx + 1);
            return (
              <div 
                key={`next-${idx}`} 
                className={`h-12 rounded-lg flex items-center justify-center ${
                  darkMode ? 'bg-neutral-800/20' : 'bg-neutral-100/30'
                }`}
              >
                <span className={`text-xs ${darkMode ? 'text-neutral-600' : 'text-neutral-300'}`}>
                  {nextMonthDate.getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <div className={`mb-6 rounded-xl transition-all duration-300 overflow-hidden ${
          darkMode 
            ? 'bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/50' 
            : 'bg-gradient-to-br from-purple-50 to-white border border-purple-200 shadow-lg'
        }`}>
          <div className={`px-5 py-3 flex items-center justify-between ${
            darkMode ? 'bg-purple-900/40' : 'bg-purple-100/50'
          }`}>
            <div className="flex items-center gap-2">
              <Calendar size={16} className={darkMode ? 'text-purple-400' : 'text-primary-800/80'} />
              <h5 className={`font-bold ${darkMode ? 'text-white' : 'text-neutral-600'}`}>
                {selectedDay.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h5>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                darkMode ? 'bg-purple-800/50 text-purple-300' : 'bg-purple-200 text-primary-300'
              }`}>
                {getIntensityLabel(selectedDay.intensity)}
              </div>
              <button
                onClick={handleCloseSelectedDay}
                className={`p-1 rounded-lg transition-all duration-200 hover:scale-110 ${
                  darkMode 
                    ? 'hover:bg-purple-700/50 text-purple-300 hover:text-white' 
                    : 'hover:bg-purple-200 text-primary-300 hover:text-primary-800/80'
                }`}
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          <div className="p-5">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: '#34D19C' }}>
                  {formatCurrency(selectedDay.sales)}
                </div>
                <div className={`text-xs mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Daily Sales
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: '#8B7ABA' }}>
                  {selectedDay.orders}
                </div>
                <div className={`text-xs mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Orders
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: '#EE9C6C' }}>
                  {selectedDay.percentOfTotal}%
                </div>
                <div className={`text-xs mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  of Monthly Total
                </div>
              </div>
            </div>
            
            <div className="px-4 mt-5">
              <div className="w-full bg-purple-200 dark:bg-purple-900/50 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-primary-800/40 to-primary-300"
                  style={{ width: `${selectedDay.percentOfTotal}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className={`flex items-center justify-between px-2 py-3 rounded-lg mb-6 ${
        darkMode 
          ? 'bg-neutral-900/50 border border-neutral-800' 
          : 'bg-neutral-100/20 border border-neutral-200'
      }`}>
        <div className="text-center flex-1">
          <div className="flex items-center justify-center gap-1 mb-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#8B7ABA' }}></div>
            <p className={`text-xs font-semibold ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Month Total
            </p>
          </div>
          <p className={`text-sm font-bold`} style={{ color: '#8B7ABA' }}>
            {formatCurrency(totalMonthSales)}
          </p>
        </div>
        
        <div className="w-px h-8 mx-2 bg-neutral-300 dark:bg-neutral-700"></div>
        
        <div className="text-center flex-1">
          <div className="flex items-center justify-center gap-1 mb-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#34D19C' }}></div>
            <p className={`text-xs font-semibold ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Daily Average
            </p>
          </div>
          <p className={`text-sm font-bold`} style={{ color: '#34D19C' }}>
            {formatCurrency(avgDailySales)}
          </p>
        </div>
        
        <div className="w-px h-8 mx-2 bg-neutral-300 dark:bg-neutral-700"></div>
        
        <div className="text-center flex-1">
          <div className="flex items-center justify-center gap-1 mb-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#EE9C6C' }}></div>
            <p className={`text-xs font-semibold ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Peak Day
            </p>
          </div>
          <p className={`text-sm font-bold`} style={{ color: '#EE9C6C' }}>
            {peakDayData ? `Day ${peakDayData.day}` : 'N/A'}
          </p>
        </div>
        
        <div className="w-px h-8 mx-2 bg-neutral-300 dark:bg-neutral-700"></div>
        
        <div className="text-center flex-1">
          <div className="flex items-center justify-center gap-1 mb-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#F08FAE' }}></div>
            <p className={`text-xs font-semibold ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Best Weekday
            </p>
          </div>
          <p className={`text-sm font-bold`} style={{ color: '#F08FAE' }}>
            {bestWeekday?.weekday || 'N/A'}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="pt-4 border-t border-neutral-200/50 dark:border-neutral-800/50">
        <div className="text-center">
          <div className={`text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
            Intensity Legend
          </div>
          <div className="flex items-center justify-center gap-1">
            {[0, 1, 2, 3, 4].map(intensity => (
              <div key={intensity} className="flex flex-col items-center">
                <div
                  className="w-8 h-3 rounded"
                  style={{ backgroundColor: getIntensityColor(intensity) }}
                  title={getIntensityLabel(intensity)}
                />
                <span className="text-[10px] mt-1 text-neutral-500 dark:text-neutral-400">
                  {intensity === 0 ? 'None' : intensity === 4 ? 'High' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesHeatmap;