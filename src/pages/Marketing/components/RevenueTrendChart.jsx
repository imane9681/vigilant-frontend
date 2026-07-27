// src/pages/Marketing/components/RevenueTrendChart.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  ComposedChart, 
  Area, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { AiOutlineLineChart } from "react-icons/ai";
import { Calendar, CalendarDays, CalendarRange, ChevronDown, BarChart3, TrendingUp, PieChart as PieChartIcon, Clock, DollarSign, Settings } from 'lucide-react';
import IconWrapper from "../../../components/ui/IconWrapper";
import WidgetButtons from "../../../components/ui/WidgetButtons";
import WidgetSettings from "../../../components/ui/WidgetSettings";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, subMonths } from 'date-fns';

// ✅ دالة لتجميع الطلبات حسب الفترة
const groupOrdersByPeriod = (orders, timeRange) => {
  if (!orders || orders.length === 0) {
    return [];
  }

  const now = new Date();
  const result = [];
  const sortedOrders = [...orders].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  
  if (timeRange === 'week') {
    const dayMap = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      dayMap[key] = {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: 0
      };
    }
    
    sortedOrders.forEach(order => {
      const date = new Date(order.created_at);
      const key = date.toISOString().split('T')[0];
      if (dayMap[key]) {
        dayMap[key].revenue += parseFloat(order.total_amount) || 0;
      }
    });
    
    Object.values(dayMap).forEach(day => {
      result.push({
        date: day.date,
        revenue: Math.round(day.revenue)
      });
    });
    
  } else if (timeRange === 'month') {
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const weeks = [];
    let currentWeek = [];
    
    daysInMonth.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === daysInMonth.length - 1) {
        weeks.push({
          start: currentWeek[0],
          end: currentWeek[currentWeek.length - 1],
          weekNumber: weeks.length + 1
        });
        currentWeek = [];
      }
    });
    
    weeks.forEach((week, index) => {
      result.push({
        date: `W${index + 1}`,
        revenue: 0
      });
    });
    
    sortedOrders.forEach(order => {
      const date = new Date(order.created_at);
      if (date >= monthStart && date <= monthEnd) {
        for (const week of weeks) {
          if (date >= week.start && date <= week.end) {
            const weekIndex = weeks.indexOf(week);
            result[weekIndex].revenue += parseFloat(order.total_amount) || 0;
            break;
          }
        }
      }
    });
    
    result.forEach(week => {
      week.revenue = Math.round(week.revenue);
    });
    
  } else {
    const monthMap = {};
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(now, i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthMap[key] = {
        date: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: 0
      };
    }
    
    sortedOrders.forEach(order => {
      const date = new Date(order.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap[key]) {
        monthMap[key].revenue += parseFloat(order.total_amount) || 0;
      }
    });
    
    Object.values(monthMap).forEach(month => {
      result.push({
        date: month.date,
        revenue: Math.round(month.revenue)
      });
    });
  }
  
  return result;
};

// ✅ حساب النمو
const calculateGrowth = (data) => {
  if (!data || data.length < 2) return 0;
  
  const mid = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, mid);
  const secondHalf = data.slice(mid);
  
  const firstAvg = firstHalf.reduce((sum, item) => sum + item.revenue, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, item) => sum + item.revenue, 0) / secondHalf.length;
  
  if (firstAvg === 0) return 0;
  return ((secondAvg - firstAvg) / firstAvg) * 100;
};

// ✅ دالة لحساب التيكس بشكل نظيف
const generateNiceTicks = (maxValue) => {
  if (maxValue <= 0) return [0, 100];
  
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
  let step = magnitude;
  
  const possibleSteps = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10];
  
  for (const multiplier of possibleSteps) {
    const testStep = multiplier * magnitude;
    const tickCount = Math.floor(maxValue / testStep) + 1;
    if (tickCount >= 4 && tickCount <= 6) {
      step = testStep;
      break;
    }
  }
  
  const ticks = [];
  const maxTick = Math.ceil(maxValue / step) * step;
  for (let i = 0; i * step <= maxTick; i++) {
    ticks.push(Math.round(i * step));
  }
  
  if (ticks.length > 0 && ticks[ticks.length - 1] < maxValue) {
    ticks.push(ticks[ticks.length - 1] + step);
  }
  
  return ticks;
};

// ✅ Tooltip مخصص
const CustomTooltip = ({ active, payload, label, darkMode }) => {
  if (active && payload && payload.length) {
    const revenue = payload.find(p => p.dataKey === 'revenue')?.value || 0;
    
    return (
      <div className={`min-w-[200px] rounded-2xl shadow-2xl overflow-hidden ${
        darkMode 
          ? 'bg-neutral-900/95 border border-neutral-700/50 backdrop-blur-xl' 
          : 'bg-white/95 border border-neutral-200/50 backdrop-blur-xl'
      }`}>
        <div className="px-5 py-3" style={{ 
          background: `linear-gradient(135deg, #8B7ABA20, #EE9C6C10)` 
        }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EE9C6C' }} />
            <span className={`text-xs font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {label}
            </span>
          </div>
        </div>
        
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#EE9C6C' }} />
              <span className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Revenue
              </span>
            </div>
            <span className={`text-base font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              ${revenue.toLocaleString()}
            </span>
          </div>
          
          <div className={`pt-3 border-t ${darkMode ? 'border-neutral-700/50' : 'border-neutral-200/50'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                {label}
              </span>
              <span className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                {revenue > 0 ? `${((revenue / 1000).toFixed(1))}k` : '$0'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// ✅ Tooltip للمخطط الدائري
const PieCustomTooltip = ({ active, payload, darkMode }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={`min-w-[180px] rounded-2xl shadow-2xl overflow-hidden ${
        darkMode 
          ? 'bg-neutral-900/95 border border-neutral-700/50 backdrop-blur-xl' 
          : 'bg-white/95 border border-neutral-200/50 backdrop-blur-xl'
      }`}>
        <div className="px-4 py-2.5" style={{ 
          background: `linear-gradient(135deg, #8B7ABA20, #EE9C6C10)` 
        }}>
          <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
            {data.name}
          </span>
        </div>
        
        <div className="px-4 py-3 space-y-2.5">
          <div className="flex items-center justify-between gap-6">
            <span className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Revenue
            </span>
            <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              ${data.value.toLocaleString()}
            </span>
          </div>
          
          <div className={`pt-2 border-t ${darkMode ? 'border-neutral-700/50' : 'border-neutral-200/50'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Share
              </span>
              <span className={`text-xs font-semibold`} style={{ color: '#8B7ABA' }}>
                {data.percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const RevenueTrendChart = ({ 
  darkMode, 
  ordersData = [],
  timeRange: externalTimeRange,
  onTimeRangeChange,
  onRefresh,
  isRefreshing = false,
  monthlyGrowth: externalMonthlyGrowth,
  monthlyComparison,
  lastUpdated: externalLastUpdated
}) => {
  const [internalTimeRange, setInternalTimeRange] = useState('month');
  const [chartType, setChartType] = useState('area');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const timeDropdownRef = useRef(null);
  const chartRef = useRef(null);
  
  // ✅ ✅ ✅ إعدادات الويدجت
  const [showSettings, setShowSettings] = useState(false);
  const [widgetSettings, setWidgetSettings] = useState({
    showAllOrders: true,        // ✅ true = جميع الطلبات, false = delivered فقط
    animationSpeed: 800,
    showLegend: true,
    showStats: true,
  });

  const timeRange = externalTimeRange || internalTimeRange;

  // ✅ ✅ ✅ تحديث widgetSettings عند تغيير externalTimeRange
  useEffect(() => {
    // ✅ إذا كان هناك وقت محدد من الخارج
    if (externalTimeRange) {
      setInternalTimeRange(externalTimeRange);
    }
  }, [externalTimeRange]);

  // ✅ تحديث chartData عند تغيير ordersData أو timeRange
  useEffect(() => {
    // ✅ ✅ ✅ تصفية الطلبات حسب الإعدادات
    let filteredOrders = [...ordersData];
    
    if (!widgetSettings.showAllOrders) {
      // ✅ إذا كان showAllOrders = false، اعرض delivered فقط
      filteredOrders = ordersData.filter(order => order.status === 'delivered');
      console.log(`📊 Filtering: Showing only delivered orders (${filteredOrders.length} of ${ordersData.length})`);
    } else {
      // ✅ استبعاد الطلبات الملغاة من جميع الطلبات
      filteredOrders = ordersData.filter(order => order.status !== 'cancelled');
      console.log(`📊 Filtering: Showing all orders except cancelled (${filteredOrders.length} of ${ordersData.length})`);
    }
    
    const groupedData = groupOrdersByPeriod(filteredOrders, timeRange);
    setChartData(groupedData);
    setFilteredData(groupedData);
  }, [ordersData, timeRange, widgetSettings.showAllOrders]);

  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const growth = externalMonthlyGrowth || (chartData.length > 0 ? calculateGrowth(chartData) : 0);

  // ✅ ✅ ✅ حفظ إعدادات الويدجت
  const handleSaveSettings = useCallback((newSettings) => {
    setWidgetSettings(prev => ({ ...prev, ...newSettings }));
    setShowSettings(false);
    
    // ✅ ✅ ✅ تحديث حالة الطلبات في الـ parent
    // إذا كان showAllOrders = false، نمرر 'delivered' كحالة
    if (onTimeRangeChange && newSettings.showAllOrders !== undefined) {
      // ✅ إعلام الـ parent بتغيير الفلتر
      const status = newSettings.showAllOrders ? 'all' : 'delivered';
      console.log(`📊 RevenueTrend: Status filter changed to: ${status}`);
    }
  }, [onTimeRangeChange]);

  // ✅ معالج WidgetButtons - مع إضافة Settings
  const handleMoreClick = useCallback((action) => {
    switch(action) {
      case 'exportPDF':
        handleExportPDF();
        break;
      case 'exportCSV':
        handleExportCSV();
        break;
      case 'exportImage':
        handleExportImage();
        break;
      case 'refresh':
        if (onRefresh) {
          onRefresh();
        }
        break;
      case 'settings':
        setShowSettings(true);
        break;
      default:
        break;
    }
  }, [onRefresh]);

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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // ✅ دوال التصدير
  const handleExportPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const chartElement = chartRef.current?.querySelector('.recharts-wrapper');
      let chartImage = null;
      
      if (chartElement) {
        const canvas = await html2canvas(chartElement, {
          scale: 2,
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        });
        chartImage = canvas.toDataURL('image/png');
      }
      
      doc.setFillColor(darkMode ? 30 : 249, darkMode ? 41 : 115, darkMode ? 59 : 22);
      doc.rect(0, 0, 297, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Revenue Trend Report', 148.5, 12, { align: 'center' });
      
      if (chartImage) {
        doc.addImage(chartImage, 'PNG', 20, 25, 257, 100);
      }
      
      doc.save(`Revenue_Report_${timeRange}_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Period', 'Revenue'];
    const rows = chartData.map(item => [item.date, item.revenue]);
    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Revenue_Data_${timeRange}_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportImage = async () => {
    try {
      const chartElement = chartRef.current?.querySelector('.recharts-wrapper');
      if (chartElement) {
        const { default: html2canvas } = await import('html2canvas');
        const canvas = await html2canvas(chartElement, {
          scale: 2,
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        });
        const link = document.createElement('a');
        link.download = `Revenue_Chart_${timeRange}_${new Date().toISOString().slice(0,10)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch (error) {
      console.error('Image export failed:', error);
    }
  };

  // ✅ معالج تغيير الفترة
  const handleTimeRangeChange = (newRange) => {
    if (onTimeRangeChange) {
      onTimeRangeChange(newRange);
    } else {
      setInternalTimeRange(newRange);
    }
    setShowTimeDropdown(false);
  };

  // ✅ ✅ ✅ الحصول على نص حالة التصفية الحالية
  const getFilterStatusText = useCallback(() => {
    return widgetSettings.showAllOrders ? 'All Orders' : 'Delivered Only';
  }, [widgetSettings.showAllOrders]);

  // ✅ ✅ ✅ الحصول على لون النقطة
  const getFilterDotColor = useCallback(() => {
    return widgetSettings.showAllOrders ? '#8B7ABA' : '#34D19C';
  }, [widgetSettings.showAllOrders]);

  const getPieChartData = () => {
    if (chartData.length === 0) return [];
    const total = chartData.reduce((sum, item) => sum + item.revenue, 0);
    return chartData.map(item => ({
      name: item.date,
      value: item.revenue,
      percentage: total > 0 ? Math.round((item.revenue / total) * 100) : 0
    }));
  };

  const PIE_COLORS = [
    '#EE9C6C', '#8b5cf6', '#f97316', '#a855f7', 
    '#fb923c', '#c4b5fd', '#fdba74', '#d8b4fe',
    '#fed7aa', '#e9d5ff', '#ffedd5', '#f3e8ff'
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.3;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill={darkMode ? "white" : "#ffffff"} 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="10"
        fontWeight="500"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const maxRevenue = Math.max(...chartData.map(d => d.revenue || 0), 1);
  const maxY = Math.ceil(maxRevenue * 1.2);
  let yTicks = generateNiceTicks(maxY);
  
  if (yTicks.length > 0 && yTicks[yTicks.length - 1] < maxY) {
    const lastTick = yTicks[yTicks.length - 1];
    const step = yTicks.length > 1 ? yTicks[1] - yTicks[0] : lastTick;
    yTicks.push(lastTick + step);
  }

  const pieData = getPieChartData();

  if (chartData.length === 0) {
    return (
      <div className={`rounded-2xl p-8 text-center ${darkMode 
        ? 'bg-neutral-900/50 border border-neutral-800' 
        : 'bg-white border border-neutral-200'}`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
            <BarChart3 size={32} className={darkMode ? 'text-neutral-600' : 'text-neutral-400'} />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              No Revenue Data Available
            </h3>
            <p className={`text-sm mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Add orders to see revenue trends
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={chartRef} className={`rounded-2xl p-5 ${darkMode 
        ? 'bg-neutral-900/50 border border-neutral-800' 
        : 'bg-white border border-neutral-200'}`}>
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3 mb-2">
            <IconWrapper 
              darkMode={darkMode} 
              variant="primary"
              size={20}
            >
              <AiOutlineLineChart />
            </IconWrapper>
            
            <div>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-700'}`}>
                Revenue Trend
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Updated: {externalLastUpdated || 'Just now'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 p-0.5 rounded-lg ${
              darkMode 
                ? 'bg-neutral-800/50 border border-neutral-700' 
                : 'bg-neutral-100 border border-neutral-200'
            }`}>
              {[
                { value: 'area', label: 'Area', icon: <TrendingUp size={14} /> },
                { value: 'bar', label: 'Bar', icon: <BarChart3 size={14} /> },
                { value: 'pie', label: 'Pie', icon: <PieChartIcon size={14} /> }
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setChartType(type.value)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-all duration-200 flex items-center gap-1.5 group ${
                    chartType === type.value
                      ? darkMode 
                        ? 'bg-primary-300 text-white shadow-sm' 
                        : 'bg-primary-300 text-white shadow-sm'
                      : darkMode 
                        ? 'text-neutral-300 hover:text-white hover:bg-neutral-700/80' 
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-white'
                  }`}
                >
                  <div className={`rounded group-hover:scale-110 transition-transform`}>
                    {type.icon}
                  </div>
                  <span className="font-medium">{type.label}</span>
                </button>
              ))}
            </div>
            
            <div className="relative" ref={timeDropdownRef}>
              <button
                onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                className={`px-4 py-2 rounded-lg text-sm capitalize transition-all duration-200 flex items-center gap-2 group ${
                  darkMode
                    ? 'bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 text-neutral-200 hover:from-neutral-700/50 hover:to-neutral-800/50 border border-neutral-700/50 hover:border-neutral-600/50'
                    : 'bg-gradient-to-br from-white to-neutral-50 text-neutral-700 hover:from-neutral-50 hover:to-neutral-100 border border-neutral-200/70 hover:border-neutral-300/70'
                } shadow-sm hover:shadow-md active:scale-[0.98]`}
              >
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="opacity-70" />
                  <span className="font-medium capitalize">{timeRange}</span>
                </div>
                
                <ChevronDown 
                  size={14} 
                  className={`transform transition-all duration-300 group-hover:scale-110 ${
                    showTimeDropdown ? 'rotate-180' : ''
                  } ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}
                />
              </button>
              
              {showTimeDropdown && (
                <div className={`absolute top-full mt-2 right-0 z-30 rounded-xl shadow-2xl border-0 overflow-hidden min-w-[140px] backdrop-blur-sm ${
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
                    {[
                      { value: 'week', icon: <CalendarDays size={14} /> },
                      { value: 'month', icon: <Calendar size={14} /> },
                      { value: 'year', icon: <CalendarRange size={14} /> }
                    ].map(({ value, icon }) => (
                      <button
                        key={value}
                        onClick={() => handleTimeRangeChange(value)}
                        className={`w-full text-left px-3 py-2.5 text-sm capitalize transition-all duration-200 flex items-center gap-2 rounded-lg group ${
                          timeRange === value
                            ? darkMode
                              ? 'bg-gradient-to-r from-orange-900/30 to-orange-800/20 text-orange-400'
                              : 'bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700'
                            : darkMode
                              ? 'hover:bg-neutral-800/70 text-neutral-300 hover:text-white'
                              : 'hover:bg-neutral-100 text-neutral-700 hover:text-neutral-900'
                        }`}
                      >
                        <div className={`p-1.5 rounded-md ${
                          timeRange === value
                            ? darkMode ? 'bg-orange-900/30' : 'bg-orange-100'
                            : darkMode ? 'bg-neutral-800' : 'bg-neutral-100'
                        }`}>
                          {icon}
                        </div>
                        <span className="font-medium capitalize">{value}</span>
                        {timeRange === value && (
                          <div className={`ml-auto w-1.5 h-1.5 rounded-full ${
                            darkMode ? 'bg-orange-400' : 'bg-orange-500'
                          }`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <WidgetButtons
              darkMode={darkMode}
              type="mixed"
              customButtons={['more']}
              onMoreClick={handleMoreClick}
              isLoading={isRefreshing}
            />
          </div>
        </div>

        {/* Chart */}
        <div className="h-72 mb-2">
          {chartType !== 'pie' ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorRevenueBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={darkMode ? '#374151' : '#e5e7eb'}
                  strokeOpacity={0.5}
                  horizontal={true}
                  vertical={false}
                />
                
                <XAxis 
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ 
                    fill: darkMode ? '#9ca3af' : '#6b7280',
                    fontSize: 12,
                  }}
                  tickMargin={15}
                  height={50}
                  interval={0}
                />
                
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ 
                    fill: '#EE9C6C',
                    fontSize: 11,
                  }}
                  tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value.toString()}
                  domain={[0, yTicks[yTicks.length - 1] || maxY]}
                  ticks={yTicks}
                  interval={0}
                  tickMargin={20} 
                  width={60} 
                />
                
                <Tooltip 
                  content={<CustomTooltip darkMode={darkMode} />}
                  cursor={{ 
                    stroke: darkMode ? '#374151' : '#e5e7eb',
                    strokeWidth: 1,
                    strokeDasharray: '3 3'
                  }}
                />
                
                {chartType === 'area' && (
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#EE9C6C"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                    fillOpacity={0.5}
                    activeDot={{ 
                      r: 6,
                      strokeWidth: 2,
                      stroke: darkMode ? '#1f2937' : '#ffffff',
                      fill: '#EE9C6C'
                    }}
                  />
                )}

                {chartType === 'bar' && (
                  <Bar
                    dataKey="revenue"
                    fill="url(#colorRevenueBar)"
                    fillOpacity={0.8}
                    radius={[4, 4, 0, 0]}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full py-4 px-5 gap-6">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={darkMode ? "#000" : "#9ca3af"} floodOpacity="0.2" />
                      </filter>
                      <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={darkMode ? "#1f2937" : "#f9fafb"} />
                        <stop offset="100%" stopColor={darkMode ? "#111827" : "#f3f4f6"} />
                      </linearGradient>
                    </defs>
                    
                    <circle cx="50%" cy="50%" r="70" fill="url(#centerGradient)" />
                    <text 
                      x="50%" 
                      y="45%" 
                      textAnchor="middle" 
                      fill={darkMode ? "#d1d5db" : "#4b5563"}
                      fontSize="15"
                      fontWeight="700"
                    >
                      Total Revenue
                    </text>
                    <text 
                      x="50%" 
                      y="60%" 
                      textAnchor="middle" 
                      fill={darkMode ? "#EE9C6C" : "#EE9C6C"}
                      fontSize="20"
                      fontWeight="bold"
                    >
                      {formatCurrency(totalRevenue)}
                    </text>
                    
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={120}
                      innerRadius={75}
                      paddingAngle={1}
                      cornerRadius={6}
                      stroke={darkMode ? "#374151" : "#ffffff"}
                      strokeWidth={1.5}
                      dataKey="value"
                      filter="url(#shadow)"
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                          opacity={0.9}
                        />
                      ))}
                    </Pie>
                    
                    <Tooltip 
                      content={<PieCustomTooltip darkMode={darkMode} />}
                      wrapperStyle={{ outline: 'none' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="w-1/2 h-full">
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto pr-2">
                    <div className="space-y-2">
                      {pieData.map((item, index) => (
                        <div 
                          key={index}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all hover:scale-[1.01] ${
                            darkMode 
                              ? 'bg-neutral-800/30 hover:bg-neutral-800/50' 
                              : 'bg-neutral-50 hover:bg-neutral-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                            />
                            <div>
                              <p className={`font-medium ${darkMode ? 'text-neutral-200' : 'text-neutral-800'}`}>
                                {item.name}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className={`font-bold ${darkMode ? 'text-[#EE9C6C]' : 'text-[#EE9C6C]'}`}>
                              {formatCurrency(item.value)}
                            </p>
                            <p className={`text-sm font-semibold ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                              {item.percentage}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className={`flex items-center justify-between p-2.5 mx-5 rounded-xl ${
          darkMode 
            ? 'bg-neutral-900/50 border border-neutral-800' 
            : 'bg-neutral-100/20 border border-neutral-200'
        }`}>
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-1">
              <p className={`text-xs font-semibold ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Total Revenue
              </p>
            </div>
            <p className="text-sm font-bold text-[#EE9C6C]">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
          
          <div className="w-px h-8 mx-4 bg-neutral-300 dark:bg-neutral-700"></div>
          
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-1">
              <p className={`text-xs font-semibold ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Growth
              </p>
            </div>
            <div className="flex items-center justify-center gap-1">
              <p className={`text-sm font-bold ${growth >= 0 ? 'text-[#34D19C]' : 'text-[#F08FAE]'}`}>
                {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
              </p>
              <span className={`text-sm ${growth >= 0 ? 'text-[#34D19C]' : 'text-[#F08FAE]'}`}>
                {growth >= 0 ? '↑' : '↓'}
              </span>
            </div>
          </div>
          
          <div className="w-px h-8 mx-4 bg-neutral-300 dark:bg-neutral-700"></div>
          
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-1">
              <p className={`text-xs font-semibold ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                Data Points
              </p>
            </div>
            <p className="text-sm font-bold text-green-600 dark:text-green-400">
              {chartData.length}
            </p>
          </div>
        </div>

        {/* ✅ ✅ ✅ Legend مع حالة التصفية الحالية */}
        <div className="flex items-center justify-center mt-4 pt-5 border-t border-neutral-200 dark:border-neutral-800">
          
          
          {/* ✅ ✅ ✅ عرض حالة التصفية الحالية */}
          <div className="mr-6 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300"
               style={{ 
                 borderColor: darkMode ? '#374151' : '#e5e7eb',
                 color: darkMode ? '#9ca3af' : '#6b7280'
               }}>
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300`}
                    style={{ backgroundColor: getFilterDotColor() }}></span>
              <span className="transition-colors duration-300">
                {getFilterStatusText()}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#EE9C6C]"></div>
            <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Revenue
            </span>
          </div>

          
        </div>
      </div>

      {/* ✅ ✅ ✅ Widget Settings Modal */}
      <WidgetSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
        settings={widgetSettings}
        darkMode={darkMode}
        title="Revenue Chart Settings"
        description="Customize the revenue chart display"
        sections={[
          {
            id: 'orderFilter',
            type: 'toggles',
            title: 'Order Filter',
            options: [
              {
                key: 'showAllOrders',
                label: 'Show All Orders',
                description: 'Display all orders including pending, processing, shipped, delivered, and cancelled',
                icon: <BarChart3 size={16} />
              }
            ]
          },
          {
            id: 'display',
            type: 'toggles',
            title: 'Display Options',
            options: [
              {
                key: 'showLegend',
                label: 'Show Legend',
                description: 'Display chart legend',
                icon: <TrendingUp size={16} />
              },
              {
                key: 'showStats',
                label: 'Show Statistics',
                description: 'Display stats cards below chart',
                icon: <BarChart3 size={16} />
              }
            ]
          },
          {
            id: 'animation',
            type: 'slider',
            title: 'Animation Speed',
            description: 'Control the animation speed of the chart',
            key: 'animationSpeed',
            min: 500,
            max: 3000,
            step: 100,
            unit: 'ms',
            minLabel: '⚡ Fast',
            maxLabel: '🐢 Slow'
          }
        ]}
      />
    </>
  );
};

export default RevenueTrendChart;