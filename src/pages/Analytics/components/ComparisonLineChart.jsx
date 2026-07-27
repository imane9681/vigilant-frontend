// src/pages/Analytics/components/ComparisonLineChart.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Calendar, CalendarDays, CalendarRange, ChevronDown, TrendingUp, Target, Loader2 } from 'lucide-react';
import IconWrapper from '../../../components/ui/IconWrapper';
import WidgetButtons from '../../../components/ui/WidgetButtons';
import { analyticsService, orderService } from '../../../services/api';
import { startOfMonth, endOfMonth, isWithinInterval, subMonths, format } from 'date-fns';

// ✅ ألوان المشروع
const COLORS = {
  primary: '#8B7ABA',
  secondary: '#F08FAE',
  accent: '#EE9C6C',
  success: '#34D19C',
  gradient: 'linear-gradient(135deg, #8B7ABA 0%, #F08FAE 50%, #EE9C6C 100%)'
};

// ✅ ألوان الأعمدة
const BAR_COLORS = {
  current: '#EE9C6C',
  previous: '#8B7ABA',
  target: '#34D19C'
};

const ComparisonLineChart = ({ darkMode }) => {
  const [timeRange, setTimeRange] = useState('year');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [title, setTitle] = useState('Yearly Performance Comparison');
  const [description, setDescription] = useState('Current vs previous period with monthly targets and growth analysis');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('Just now');
  const timeDropdownRef = useRef(null);

  // ✅ جلب البيانات الحقيقية من API
  const fetchComparisonData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const ordersResponse = await orderService.getAll({ page_size: 200 });
      const orders = ordersResponse.data.results || ordersResponse.data;
      
      
      const now = new Date();
      let periods = [];
      let labels = [];
      
      if (timeRange === 'quarter') {
        for (let i = 2; i >= 0; i--) {
          const date = subMonths(now, i);
          periods.push(date);
          labels.push(format(date, 'MMM'));
        }
      } else if (timeRange === 'year') {
        for (let i = 11; i >= 0; i--) {
          const date = subMonths(now, i);
          periods.push(date);
          labels.push(format(date, 'MMM'));
        }
      } else {
        for (let i = 3; i >= 0; i--) {
          const date = subMonths(now, i * 12);
          periods.push(date);
          labels.push(format(date, 'yyyy'));
        }
      }
      
      const data = periods.map((period, index) => {
        const periodStart = startOfMonth(period);
        const periodEnd = endOfMonth(period);
        
        const currentOrders = orders.filter(o => {
          const date = new Date(o.created_at);
          return isWithinInterval(date, { start: periodStart, end: periodEnd });
        });
        
        const currentRevenue = currentOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
        const currentCount = currentOrders.length;
        
        const prevPeriod = new Date(period);
        prevPeriod.setFullYear(prevPeriod.getFullYear() - 1);
        const prevStart = startOfMonth(prevPeriod);
        const prevEnd = endOfMonth(prevPeriod);
        
        const prevOrders = orders.filter(o => {
          const date = new Date(o.created_at);
          return isWithinInterval(date, { start: prevStart, end: prevEnd });
        });
        
        const prevRevenue = prevOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
        const prevCount = prevOrders.length;
        
        const targetRevenue = currentRevenue > 0 ? currentRevenue * 1.1 : prevRevenue * 1.1;
        
        return {
          period: labels[index],
          current: Math.round(currentRevenue),
          previous: Math.round(prevRevenue),
          target: Math.round(targetRevenue),
          orders: currentCount,
          previousOrders: prevCount
        };
      });
      
      
      setChartData(data);
      setLastUpdated(new Date().toLocaleString());
      
      const periodLabels = {
        quarter: 'Quarterly',
        year: 'Yearly',
        all: 'Multi-Year'
      };
      setTitle(`${periodLabels[timeRange] || 'Performance'} Comparison`);
      setDescription(`${timeRange === 'year' ? new Date().getFullYear() : 'Current'} vs previous period with targets`);
      
    } catch (err) {
      console.error('❌ Error fetching comparison data:', err);
      setError('Failed to load comparison data');
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchComparisonData();
  }, [fetchComparisonData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target)) {
        setShowTimeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const totalCurrent = chartData.reduce((sum, item) => sum + item.current, 0);
  const totalPrevious = chartData.reduce((sum, item) => sum + item.previous, 0);
  const totalTarget = chartData.reduce((sum, item) => sum + item.target, 0);
  const growth = totalPrevious > 0 ? ((totalCurrent - totalPrevious) / totalPrevious * 100).toFixed(1) : 0;
  const targetAchievement = totalTarget > 0 ? ((totalCurrent / totalTarget) * 100).toFixed(1) : 0;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatYAxis = (value) => {
    if (value >= 1000000) return `$${(value/1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value/1000).toFixed(0)}k`;
    return `$${value}`;
  };

  // ✅ معالج WidgetButtons
  const handleMoreClick = (action) => {
    switch(action) {
      case 'refresh':
        fetchComparisonData();
        break;
      case 'exportPDF':
        break;
      case 'exportCSV':
        break;
      case 'exportImage':
        break;
      default:
        break;
    }
  };

  // ✅ Tooltip مخصص
  // ✅ Tooltip مخصص
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const current = payload.find(p => p.dataKey === 'current')?.value || 0;
    const previous = payload.find(p => p.dataKey === 'previous')?.value || 0;
    const target = payload.find(p => p.dataKey === 'target')?.value || 0;
    const diff = current - previous;
    const diffPercent = previous > 0 ? ((diff / previous) * 100).toFixed(1) : 0;
    
    // ✅ جلب عدد الطلبات من الـ payload مباشرة
    const orders = payload.find(p => p.dataKey === 'orders')?.payload?.orders || 0;
    const previousOrders = payload.find(p => p.dataKey === 'previousOrders')?.payload?.previousOrders || 0;
    
    return (
      <div className={`min-w-[220px] rounded-2xl shadow-2xl overflow-hidden ${
        darkMode 
          ? 'bg-neutral-900/95 border border-neutral-700/50 backdrop-blur-xl' 
          : 'bg-white/95 border border-neutral-200/50 backdrop-blur-xl'
      }`}>
        {/* Header */}
        <div className="px-5 py-3" style={{ 
          background: `linear-gradient(135deg, #8B7ABA20, #F08FAE10)` 
        }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EE9C6C' }} />
            <span className={`text-xs font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {label}
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-5 py-4 space-y-3">
          {/* Current Revenue */}
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#EE9C6C' }} />
              <span className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Revenue
              </span>
            </div>
            <span className={`text-base font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              ${current.toLocaleString()}
            </span>
          </div>
          
          {/* Previous */}
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#8B7ABA' }} />
              <span className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Previous
              </span>
            </div>
            <span className={`text-base font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              {previous > 0 ? `$${previous.toLocaleString()}` : 'No data'}
            </span>
          </div>
          
          {/* Target */}
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#34D19C' }} />
              <span className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Target
              </span>
            </div>
            <span className={`text-base font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              ${target.toLocaleString()}
            </span>
          </div>
          
          {/* Divider */}
          <div className={`pt-2 border-t ${darkMode ? 'border-neutral-700/50' : 'border-neutral-200/50'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Growth
              </span>
              <span className={`text-xs font-semibold ${parseFloat(diffPercent) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {parseFloat(diffPercent) >= 0 ? '↑' : '↓'} {Math.abs(diffPercent)}%
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Orders
              </span>
              <span className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                {orders || 0}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Previous Orders
              </span>
              <span className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                {previousOrders > 0 ? previousOrders : 'No data'}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Target Achievement
              </span>
              <span className={`text-xs font-semibold ${
                target > 0 && (current / target) >= 1 ? 'text-emerald-500' : 
                target > 0 && (current / target) >= 0.8 ? 'text-amber-500' : 'text-rose-500'
              }`}>
                {target > 0 ? ((current / target) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

  // ✅ حالة التحميل
  if (isLoading) {
    return (
      <div className={`rounded-2xl p-6 ${darkMode 
        ? 'bg-neutral-900/50 border border-neutral-800' 
        : 'bg-white border border-neutral-200'}`}>
        <div className="flex items-center justify-center h-80">
          <Loader2 size={40} className="animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  // ✅ حالة الخطأ
  if (error) {
    return (
      <div className={`rounded-2xl p-6 text-center ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button onClick={fetchComparisonData} className="mt-3 px-4 py-2 bg-primary-500 text-white rounded-lg">
          Retry
        </button>
      </div>
    );
  }

  // ✅ حالة عدم وجود بيانات
  if (chartData.length === 0) {
    return (
      <div className={`rounded-2xl p-12 text-center ${darkMode 
        ? 'bg-neutral-900/50 border border-neutral-800' 
        : 'bg-white border border-neutral-200'}`}>
        <div className={`p-4 rounded-full ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'} mx-auto mb-4`}>
          <TrendingUp size={32} className={darkMode ? 'text-neutral-600' : 'text-neutral-400'} />
        </div>
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
          No Comparison Data Available
        </h3>
        <p className={`text-sm mt-2 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
          Add orders to see performance comparison
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-6 ${darkMode 
            ? 'bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-800 hover:border-primary-500/30' 
            : 'bg-gradient-to-br from-white to-neutral-50 border-neutral-200/80 hover:border-primary-200 shadow-lg hover:shadow-2xl'
        }`}>
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <IconWrapper darkMode={darkMode} variant="primary" size={20}>
            <TrendingUp/>
          </IconWrapper>
      
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-600'}`}>
              {title}
            </h3>
            <p className={`text-xs mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              {description} • Updated: {lastUpdated}
            </p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Time Range Dropdown */}
          <div className="relative" ref={timeDropdownRef}>
            <button
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              className={`px-3 py-2 rounded-lg text-sm capitalize transition-all duration-200 flex items-center gap-2 group ${
                darkMode
                  ? 'bg-neutral-800/50 text-neutral-200 hover:bg-neutral-700/50 border border-neutral-700/50'
                  : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200/70'
              } shadow-sm hover:shadow-md active:scale-[0.98]`}
            >
              <Calendar size={14} className="opacity-70" />
              <span className="font-medium capitalize">{timeRange}</span>
              <ChevronDown 
                size={14} 
                className={`transform transition-all duration-300 ${
                  showTimeDropdown ? 'rotate-180' : ''
                } ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}
              />
            </button>
            
            {showTimeDropdown && (
              <div className={`absolute top-full mt-1 right-0 z-30 rounded-xl shadow-2xl border-0 overflow-hidden min-w-[140px] backdrop-blur-sm ${
                darkMode 
                  ? 'bg-neutral-900/95 border border-neutral-700/50' 
                  : 'bg-white/95 border border-neutral-200/50'
              }`}>
                <div className="p-1.5">
                  {[
                    { value: 'quarter', icon: <CalendarDays size={14} />, label: 'Quarter' },
                    { value: 'year', icon: <Calendar size={14} />, label: 'Year' },
                    { value: 'all', icon: <CalendarRange size={14} />, label: 'All Time' }
                  ].map(({ value, icon, label }) => (
                    <button
                      key={value}
                      onClick={() => {
                        setTimeRange(value);
                        setShowTimeDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm capitalize transition-all duration-200 flex items-center gap-2 rounded-lg ${
                        timeRange === value
                          ? darkMode
                            ? 'bg-[#EE9C6C]/20 text-[#EE9C6C]'
                            : 'bg-[#EE9C6C]/10 text-[#EE9C6C]'
                          : darkMode
                            ? 'hover:bg-neutral-800/70 text-neutral-300 hover:text-white'
                            : 'hover:bg-neutral-100 text-neutral-700 hover:text-neutral-900'
                      }`}
                    >
                      <div className={`p-1 rounded-md ${
                        timeRange === value
                          ? darkMode ? 'bg-[#EE9C6C]/20' : 'bg-[#EE9C6C]/10'
                          : darkMode ? 'bg-neutral-800' : 'bg-neutral-100'
                      }`}>
                        {icon}
                      </div>
                      <span className="font-medium">{label}</span>
                      {timeRange === value && (
                        <div className={`ml-auto w-1.5 h-1.5 rounded-full ${
                          darkMode ? 'bg-[#EE9C6C]' : 'bg-[#EE9C6C]'
                        }`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ✅ WidgetButtons - استيراد مباشر */}
          <WidgetButtons
            darkMode={darkMode}
            type="mixed"
            customButtons={['more']}
            onMoreClick={handleMoreClick}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 mb-5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 10, left: 10, bottom: 10 }}
            barGap={4}
            barSize={40}
            barCategoryGap={
              timeRange === 'quarter' ? 60 :
              timeRange === 'all' ? 80 :
              30
            }
          >
            <defs>
              <linearGradient id="colorCurrentBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={BAR_COLORS.current} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={BAR_COLORS.current} stopOpacity={0.4}/>
              </linearGradient>

              <linearGradient id="colorPreviousBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={BAR_COLORS.previous} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={BAR_COLORS.previous} stopOpacity={0.4}/>
              </linearGradient>

              <linearGradient id="colorTargetBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={BAR_COLORS.target} stopOpacity={0.9}/>
                <stop offset="95%" stopColor={BAR_COLORS.target} stopOpacity={0.5}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={darkMode ? '#374151' : '#e5e7eb'}
              strokeOpacity={0.5}
              vertical={false}
            />
            
            <XAxis 
              dataKey="period"
              axisLine={false}
              tickLine={false}
              tick={{ 
                fill: darkMode ? '#9ca3af' : '#6b7280',
                fontSize: 12,
                fontWeight: 500
              }}
              tickMargin={16}
              interval={0}
              height={40}
              scale="point"
              padding={{ 
                left: timeRange === 'quarter' ? 50 : timeRange === 'all' ? 50 : 4,
                right: timeRange === 'quarter' ? 70 : timeRange === 'all' ? 70 : 40
              }}
            />
            
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ 
                fill: darkMode ? '#9ca3af' : '#6b7280',
                fontSize: 11,
              }}
              tickFormatter={formatYAxis}
              width={70}
              domain={[0, 'auto']}
              allowDataOverflow={false}
              tickMargin={35}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Bar
              dataKey="current"
              name="Current"
              fill="url(#colorCurrentBar)"
              radius={[4, 4, 0, 0]}
              maxBarSize={
                timeRange === 'quarter' ? 40 :  
                timeRange === 'all' ? 50 :     
                35                               
              }
            />
            
            <Bar
              dataKey="previous"
              name="Previous"
              fill="url(#colorPreviousBar)"
              radius={[4, 4, 0, 0]}
              maxBarSize={
                timeRange === 'quarter' ? 40 :  
                timeRange === 'all' ? 50 :      
                35                               
              }
            />
            
            <Bar
              dataKey="target"
              name="Target"
              fill="url(#colorTargetBar)"
              radius={[4, 4, 0, 0]}
              maxBarSize={
                timeRange === 'quarter' ? 40 :  
                timeRange === 'all' ? 50 :      
                35                               
              }
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Cards */}
      <div className={`flex items-center justify-between p-4 rounded-xl ${
        darkMode 
          ? 'bg-neutral-900/50 border border-neutral-800' 
          : 'bg-neutral-100/20 border border-neutral-200'
      }`}>
        <div className="text-center flex-1">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: BAR_COLORS.current }} />
            <p className={`text-xs font-semibold ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              {timeRange === 'all' ? 'Total' : 'Current'} Revenue
            </p>
          </div>
          <p className="text-sm font-bold" style={{ color: BAR_COLORS.current }}>
            ${(totalCurrent/1000).toFixed(0)}k
          </p>
        </div>
        
        <div className="w-px h-8 mx-4 bg-neutral-300 dark:bg-neutral-700"></div>
        
        <div className="text-center flex-1">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div 
              className="w-1.5 h-1.5 rounded-full" 
              style={{ 
                backgroundColor: parseFloat(growth) >= 0 ? '#34D19C' : '#F08FAE'
              }} 
            />
            <p className={`text-xs font-semibold ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Growth
            </p>
          </div>
          <div className="flex items-center justify-center gap-1">
            <p className={`text-sm font-bold ${parseFloat(growth) >= 0 ? 'text-[#34D19C]' : 'text-[#F08FAE]'}`}>
              {growth}%
            </p>
            <span className={`text-sm ${parseFloat(growth) >= 0 ? 'text-[#34D19C]' : 'text-[#F08FAE]'}`}>
              {parseFloat(growth) >= 0 ? '↑' : '↓'}
            </span>
          </div>
        </div>
        
        <div className="w-px h-8 mx-4 bg-neutral-300 dark:bg-neutral-700"></div>
        
        <div className="text-center flex-1">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: BAR_COLORS.target }} />
            <p className={`text-xs font-semibold ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Target
            </p>
          </div>
          <p className="text-sm font-bold" style={{ color: BAR_COLORS.target }}>
            {targetAchievement}%
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BAR_COLORS.current }} />
          <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
            Current Period
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BAR_COLORS.previous }} />
          <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
            Previous Period
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: BAR_COLORS.target }} />
          <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
            Targets
          </span>
        </div>
      </div>
    </div>
  );
};

export default ComparisonLineChart;