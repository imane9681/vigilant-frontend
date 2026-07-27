// src/pages/Dashboard/components/SalesChart.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
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
import { Calendar, CalendarDays, CalendarRange, ChevronDown, Download, BarChart3, TrendingUp, FileText, PlusCircle, PieChart as PieChartIcon, Settings } from 'lucide-react';
import IconWrapper from '../../../components/ui/IconWrapper';
import WidgetButtons from '../../../components/ui/WidgetButtons';
import WidgetSettings from '../../../components/ui/WidgetSettings';

const SalesChart = ({ 
  darkMode, 
  salesData, 
  onTimeRangeChange, 
  currentTimeRange,
  onOrderStatusChange,
  currentOrderStatus,
  onRefresh,        // ✅ دالة Refresh من parent
  isRefreshing      // ✅ حالة التحديث من parent
}) => {
  const [chartData, setChartData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [timeRange, setTimeRange] = useState(currentTimeRange || 'month');
  const [chartType, setChartType] = useState('area');
  const [isLoading, setIsLoading] = useState(true);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showChartDropdown, setShowChartDropdown] = useState(false);
  const [orderStatus, setOrderStatus] = useState(currentOrderStatus || 'all');
  const [growthData, setGrowthData] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('Just now');
  const timeDropdownRef = useRef(null);
  const chartDropdownRef = useRef(null);
  
  // ✅ ✅ ✅ State لإعدادات الويدجت - مع قيمة أولية من currentOrderStatus
  const [showSettings, setShowSettings] = useState(false);
  const [widgetSettings, setWidgetSettings] = useState({
    showAllOrders: currentOrderStatus !== 'delivered', // ✅ إذا كان currentOrderStatus = delivered، يكون false
    animationSpeed: 800,
    showLegend: true,
    showStats: true,
  });

  const colors = {
    primary: '#8B7ABA',
    secondary: '#F08FAE',
    accent: '#EE9C6C',
    success: '#34D19C'
  };

  // ✅ ✅ ✅ تحديث widgetSettings عند تغيير currentOrderStatus من الخارج
  useEffect(() => {
    if (currentOrderStatus) {
      setWidgetSettings(prev => ({
        ...prev,
        showAllOrders: currentOrderStatus !== 'delivered'
      }));
    }
  }, [currentOrderStatus]);

  // ✅ تحديث timeRange عندما يتغير من الخارج
  useEffect(() => {
    if (currentTimeRange && currentTimeRange !== timeRange) {
      setTimeRange(currentTimeRange);
    }
  }, [currentTimeRange]);

  // ✅ تحديث orderStatus عندما يتغير من الخارج
  useEffect(() => {
    if (currentOrderStatus && currentOrderStatus !== orderStatus) {
      setOrderStatus(currentOrderStatus);
    }
  }, [currentOrderStatus]);

  // ✅ تحديث البيانات عند تغيير salesData
  useEffect(() => {
    
    if (!salesData) {
      console.warn('⚠️ salesData is null/undefined');
      setChartData([]);
      setGrowthData(0);
      setIsLoading(false);
      return;
    }
    
    let dataArray = [];
    let growthValue = 0;
    
    // ✅ استخراج البيانات - { data: [...], growth: ... }
    if (salesData.data && Array.isArray(salesData.data)) {
      dataArray = salesData.data;
      growthValue = salesData.growth || 0;
    } 
    // ✅ استخراج البيانات - مصفوفة مباشرة
    else if (Array.isArray(salesData)) {
      dataArray = salesData;
      
      // ✅ حساب النمو من البيانات كـ fallback
      if (dataArray.length >= 2) {
        const midPoint = Math.floor(dataArray.length / 2);
        const firstHalf = dataArray.slice(0, midPoint);
        const secondHalf = dataArray.slice(midPoint);
        
        const firstAvg = firstHalf.reduce((sum, item) => sum + (item.sales || 0), 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, item) => sum + (item.sales || 0), 0) / secondHalf.length;
        
        if (firstAvg > 0 && secondAvg > 0) {
          growthValue = ((secondAvg - firstAvg) / firstAvg) * 100;
        }
      }
    } 
    else {
      console.warn('⚠️ salesData is in unknown format:', typeof salesData);
      setChartData([]);
      setGrowthData(0);
      setIsLoading(false);
      return;
    }
    
    
    setChartData(dataArray);
    setGrowthData(growthValue);
    setLastUpdated(new Date().toLocaleString());
    setIsLoading(false);
    
  }, [salesData]);

  // ✅ تصفية البيانات حسب الفترة الزمنية وحالة الطلبات
  useEffect(() => {
    let data = chartData;
    setFilteredData(data);
  }, [chartData]);

  // ✅ إغلاق القوائم عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target)) {
        setShowTimeDropdown(false);
      }
      if (chartDropdownRef.current && !chartDropdownRef.current.contains(event.target)) {
        setShowChartDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ✅ معالج تغيير الفترة الزمنية
  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
    if (onTimeRangeChange) {
      onTimeRangeChange(newRange);
    }
    setShowTimeDropdown(false);
  };

  // ✅ ✅ ✅ معالج تغيير حالة الطلبات من الإعدادات - محسّن
  const handleOrderStatusChange = useCallback((newStatus) => {
    setOrderStatus(newStatus);
    
    // ✅ ✅ ✅ تحديث widgetSettings بشكل متزامن
    setWidgetSettings(prev => ({
      ...prev,
      showAllOrders: newStatus !== 'delivered'
    }));
    
    // ✅ إعلام الـ parent بتغيير الحالة
    if (onOrderStatusChange) {
      onOrderStatusChange(newStatus, true);
    }
  }, [onOrderStatusChange]);

  // ✅ ✅ ✅ حفظ إعدادات الويدجت - محسّن
  const handleSaveSettings = useCallback((newSettings) => {
    // ✅ ✅ ✅ تحديث widgetSettings
    setWidgetSettings(prev => ({
      ...prev,
      ...newSettings
    }));
    
    // ✅ ✅ ✅ تحديث حالة الطلبات بناءً على الإعداد الجديد
    const status = newSettings.showAllOrders ? 'all' : 'delivered';
    handleOrderStatusChange(status);
    
    // ✅ إغلاق نافذة الإعدادات
    setShowSettings(false);
    
    console.log('✅ Settings saved:', { showAllOrders: newSettings.showAllOrders, status });
  }, [handleOrderStatusChange]);

  // ✅ معالج WidgetButtons - مع إضافة Settings
  const handleMoreClick = (action) => {
    switch(action) {
      case 'refresh':
        if (onRefresh) {
          onRefresh();
        }
        break;
      case 'settings':
        setShowSettings(true);
        break;
      case 'exportPDF':
        exportToPDF();
        break;
      case 'exportCSV':
        break;
      case 'exportImage':
        break;
      default:
        break;
    }
  };

  // ✅ حساب البيانات الإجمالية
  const totalSales = filteredData.reduce((sum, item) => sum + (item.sales || 0), 0);
  const totalOrders = filteredData.reduce((sum, item) => sum + (item.orders || 0), 0);
  
  // ✅ النمو المحسوب
  const growth = growthData || 0;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  // ✅ حساب التيكس تلقائياً
  const getMaxValue = (data, key) => {
    if (!data || data.length === 0) return 100;
    const max = Math.max(...data.map(item => item[key] || 0));
    return Math.ceil(max * 1.1);
  };

  const maxSales = getMaxValue(filteredData, 'sales');
  const maxOrders = getMaxValue(filteredData, 'orders');

  const buildTicks = (max) => {
    if (max <= 0) return [0];
    const step = Math.ceil(max / 5);
    const ticks = [];
    for (let i = 0; i <= max; i += step) {
      ticks.push(i);
    }
    return ticks;
  };

  const leftTicks = buildTicks(maxSales);
  const rightTicks = buildTicks(maxOrders);

  // ✅ بيانات المخطط الدائري
  const getPieChartData = () => {
    if (filteredData.length === 0) return [];
    return filteredData.map(item => ({
      name: item.date || 'N/A',
      value: item.sales || 0,
      orders: item.orders || 0,
      percentage: totalSales > 0 ? Math.round((item.sales / totalSales) * 100) : 0
    }));
  };

  const pieData = getPieChartData();

  const PIE_COLORS = [
    '#EE9C6C', '#8B7ABA', '#fb8a39', '#a855f7', 
    '#fb923c', '#c4b5fd', '#fdba74', '#d8b4fe',
    '#fed7aa', '#e9d5ff', '#ffedd5', '#f3e8ff'
  ];

  // ✅ Tooltips
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const sales = payload.find(p => p.dataKey === 'sales')?.value || 0;
      const orders = payload.find(p => p.dataKey === 'orders')?.value || 0;
      
      return (
        <div className={`min-w-[200px] rounded-2xl shadow-2xl overflow-hidden ${
          darkMode 
            ? 'bg-neutral-900/95 border border-neutral-700/50 backdrop-blur-xl' 
            : 'bg-white/95 border border-neutral-200/50 backdrop-blur-xl'
        }`}>
          <div className="px-5 py-3" style={{ 
            background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}10)` 
          }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.accent }} />
              <span className={`text-xs font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                {label}
              </span>
            </div>
          </div>
          
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.accent }} />
                <span className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Revenue
                </span>
              </div>
              <span className={`text-base font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                {formatCurrency(sales)}
              </span>
            </div>
            
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.primary }} />
                <span className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Orders
                </span>
              </div>
              <span className={`text-base font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                {orders}
              </span>
            </div>
            
            <div className={`pt-3 border-t ${darkMode ? 'border-neutral-700/50' : 'border-neutral-200/50'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  Avg Order Value
                </span>
                <span className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                  {sales > 0 && orders > 0 ? formatCurrency(sales / orders) : '$0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const PieCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`min-w-[180px] rounded-2xl shadow-2xl overflow-hidden ${
          darkMode 
            ? 'bg-neutral-900/95 border border-neutral-700/50 backdrop-blur-xl' 
            : 'bg-white/95 border border-neutral-200/50 backdrop-blur-xl'
        }`}>
          <div className="px-4 py-2.5" style={{ 
            background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}10)` 
          }}>
            <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              {data.name}
            </span>
          </div>
          
          <div className="px-4 py-3 space-y-2.5">
            <div className="flex items-center justify-between gap-6">
              <span className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Sales
              </span>
              <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                {formatCurrency(data.value)}
              </span>
            </div>
            
            <div className="flex items-center justify-between gap-6">
              <span className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Orders
              </span>
              <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                {data.orders}
              </span>
            </div>
            
            <div className={`pt-2 border-t ${darkMode ? 'border-neutral-700/50' : 'border-neutral-200/50'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  Share
                </span>
                <span className={`text-xs font-semibold`} style={{ color: colors.primary }}>
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

  // ✅ تصدير PDF
  const exportToPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const chartContainer = document.querySelector('.recharts-wrapper');
      let chartImage = null;
      
      if (chartContainer) {
        try {
          const canvas = await html2canvas(chartContainer, {
            scale: 2,
            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
            useCORS: true,
            logging: false,
          });
          chartImage = canvas.toDataURL('image/png');
        } catch (error) {
          console.warn('Failed to capture chart image:', error);
        }
      }
      
      // Header
      doc.setFillColor(darkMode ? 30 : 249, darkMode ? 41 : 115, darkMode ? 59 : 22);
      doc.rect(0, 0, 210, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Sales Analytics Report', 105, 15, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`, 105, 22, { align: 'center' });
      
      let yPos = 35;
      
      doc.setDrawColor(darkMode ? 249 : 249, darkMode ? 115 : 115, darkMode ? 22 : 22);
      doc.setLineWidth(0.5);
      doc.roundedRect(15, yPos, 180, 32, 3, 3, 'S');
      
      doc.setTextColor(darkMode ? 249 : 249, darkMode ? 115 : 115, darkMode ? 22 : 22);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Report Summary', 25, yPos + 8);
      
      doc.setTextColor(darkMode ? 100 : 50, darkMode ? 100 : 50, darkMode ? 100 : 50);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      // ✅ ✅ ✅ إضافة معلومات حالة الطلبات من الإعدادات
      const statusLabel = widgetSettings.showAllOrders ? 'All Orders' : 'Delivered Only';
      doc.text(`• Period: ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}`, 25, yPos + 15);
      doc.text(`• Status Filter: ${statusLabel}`, 105, yPos + 15);
      doc.text(`• Total Sales: ${formatCurrency(totalSales)}`, 25, yPos + 21);
      doc.text(`• Total Orders: ${totalOrders.toLocaleString()}`, 105, yPos + 21);
      doc.text(`• Data Points: ${filteredData.length}`, 25, yPos + 27);
      
      yPos += 45;
      
      if (chartImage) {
        doc.setTextColor(darkMode ? 220 : 50, darkMode ? 220 : 50, darkMode ? 220 : 50);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Visualization Chart', 105, yPos, { align: 'center' });
        
        yPos += 10;
        
        let imgWidth, imgHeight;
        if (chartType === 'pie') {
          imgWidth = 80;
          imgHeight = 60;
        } else {
          imgWidth = 160;
          imgHeight = 80;
        }
        const imgX = (210 - imgWidth) / 2;
        doc.addImage(chartImage, 'PNG', imgX, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 15;
      }
      
      // Data Table
      doc.setTextColor(darkMode ? 220 : 50, darkMode ? 220 : 50, darkMode ? 220 : 50);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Detailed Data', 105, yPos, { align: 'center' });
      
      yPos += 10;
      
      const headers = ['Period', 'Sales', 'Orders'];
      const tableData = filteredData.map(item => [
        item.date,
        formatCurrency(item.sales),
        item.orders.toString()
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [headers],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: darkMode ? [59, 130, 246] : [249, 115, 22],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10
        },
        bodyStyles: {
          textColor: darkMode ? [220, 220, 220] : [50, 50, 50],
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: darkMode ? [30, 41, 59, 0.5] : [243, 244, 246]
        },
        margin: { left: 20, right: 20 }
      });
      
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : yPos + 100;
      
      doc.setTextColor(darkMode ? 150 : 100, darkMode ? 150 : 100, darkMode ? 150 : 100);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Confidential Business Document • For Internal Use Only', 105, finalY, { align: 'center' });
      
      const fileName = `Sales_Report_${timeRange}_${widgetSettings.showAllOrders ? 'all' : 'delivered'}_${new Date().toISOString().slice(0,10)}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  // ✅ ✅ ✅ الحصول على نص حالة التصفية الحالية - دالة محسّنة
  const getFilterStatusText = useCallback(() => {
    return widgetSettings.showAllOrders ? 'All Orders' : 'Delivered Only';
  }, [widgetSettings.showAllOrders]);

  // ✅ ✅ ✅ الحصول على لون النقطة - دالة محسّنة
  const getFilterDotColor = useCallback(() => {
    return widgetSettings.showAllOrders ? '#8B7ABA' : '#34D19C';
  }, [widgetSettings.showAllOrders]);

  // ✅ حالة التحميل
  if (isLoading) {
    return (
      <div className={`rounded-2xl p-6 ${darkMode 
        ? 'bg-neutral-900/50 border border-neutral-800' 
        : 'bg-white border border-neutral-200'}`}>
        <div className="animate-pulse space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className={`h-7 w-48 rounded ${darkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`}></div>
              <div className={`h-4 w-64 rounded ${darkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`}></div>
            </div>
            <div className="flex gap-2">
              <div className={`h-10 w-32 rounded-lg ${darkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`}></div>
              <div className={`h-10 w-32 rounded-lg ${darkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`}></div>
            </div>
          </div>
          <div className={`h-80 w-full rounded-lg ${darkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`}></div>
        </div>
      </div>
    );
  }

  // ✅ حالة عدم وجود بيانات
  if (!filteredData || filteredData.length === 0) {
    return (
      <div className={`relative rounded-2xl p-12 text-center overflow-hidden ${
        darkMode 
          ? 'bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border border-neutral-800' 
          : 'bg-gradient-to-br from-white to-neutral-50/90 border border-neutral-200/80'
      } shadow-lg hover:shadow-xl transition-all duration-300`}>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className={`p-5 rounded-2xl ${
              darkMode ? 'bg-neutral-800/50' : 'bg-neutral-100/50'
            } border ${darkMode ? 'border-neutral-700/50' : 'border-neutral-200/50'}`}>
              <BarChart3 size={56} style={{ color: colors.primary }} strokeWidth={1.5} />
            </div>
          </div>
          
          <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
            No Sales Data Available
          </h3>
          
          <p className={`text-base max-w-md mx-auto ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Start adding orders to see your sales trends and analytics.
          </p>
          
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => window.location.href = '/orders'}
              className={`px-6 py-2.5 rounded-lg text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-95`}
              style={{ background: `linear-gradient(135deg, ${colors.primary})` }}
            >
              <div className="flex items-center gap-2">
                <PlusCircle size={18} />
                Add Your First Order
              </div>
            </button>
            
            <WidgetButtons
              darkMode={darkMode}
              type="mixed"
              customButtons={['more']}
              onMoreClick={(action) => {
                if (action === 'refresh' && onRefresh) {
                  onRefresh();
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`rounded-2xl p-5 ${darkMode 
            ? 'bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-800 hover:border-primary-500/30' 
            : 'bg-gradient-to-br from-white to-neutral-50 border-neutral-200/80 hover:border-primary-200 shadow-lg hover:shadow-2xl'
        }`}>
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3 mb-2">
            <IconWrapper darkMode={darkMode} variant="primary" size={20}>
              <AiOutlineLineChart />
            </IconWrapper>
            
            <div>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-700'}`}>
                Sales & Orders Trend
              </h3>
              <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Updated: {lastUpdated}
              </p>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap">

            {/* Chart Type Toggle */}
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
                  className={`px-3 py-1.5 rounded-md text-sm transition-all duration-200 flex items-center gap-1.5 ${
                    chartType === type.value
                      ? darkMode 
                        ? 'bg-primary-300 text-white shadow-sm' 
                        : 'bg-primary-300 text-white shadow-sm'
                      : darkMode 
                        ? 'text-neutral-300 hover:text-white hover:bg-neutral-700/80' 
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-white'
                  }`}
                >
                  {type.icon}
                  <span className="font-medium">{type.label}</span>
                </button>
              ))}
            </div>

            {/* Time Range Filter */}
            <div className="relative" ref={timeDropdownRef}>
              <button
                onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all duration-200 flex items-center gap-2 ${
                  darkMode
                    ? 'bg-neutral-800/50 text-neutral-200 hover:bg-neutral-700/50 border border-neutral-700/50'
                    : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200/70'
                } shadow-sm hover:shadow-md`}
              >
                <Calendar size={14} />
                <span className="font-medium">{timeRange}</span>
                <ChevronDown size={14} className={`transition-transform ${showTimeDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showTimeDropdown && (
                <div className={`absolute top-full mt-1 right-0 z-30 rounded-xl shadow-2xl overflow-hidden min-w-[120px] ${
                  darkMode 
                    ? 'bg-neutral-900/95 border border-neutral-700/50' 
                    : 'bg-white/95 border border-neutral-200/50'
                }`}>
                  <div className="p-1">
                    {[
                      { value: 'week', icon: <CalendarDays size={14} />, label: 'Week' },
                      { value: 'month', icon: <Calendar size={14} />, label: 'Month' },
                      { value: 'year', icon: <CalendarRange size={14} />, label: 'Year' }
                    ].map(({ value, icon, label }) => (
                      <button
                        key={value}
                        onClick={() => handleTimeRangeChange(value)}
                        className={`w-full text-left px-3 py-2 text-sm capitalize transition-all duration-200 flex items-center gap-2 rounded-lg ${
                          timeRange === value
                            ? darkMode
                              ? 'bg-orange-900/30 text-orange-400'
                              : 'bg-orange-100 text-orange-700'
                            : darkMode
                              ? 'hover:bg-neutral-800/70 text-neutral-300'
                              : 'hover:bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {icon}
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ✅ ✅ ✅ WidgetButtons مع إضافة Settings */}
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
                data={filteredData}
                margin={{ top: 20, right: 20, left: 20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorSalesBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.4}/>
                  </linearGradient>
                  <linearGradient id="colorOrdersBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={darkMode ? '#374151' : '#e5e7eb'}
                  strokeOpacity={0.7}
                  horizontal={true}
                  vertical={false}
                />
                
                <XAxis 
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ 
                    fill: darkMode ? '#9ca3af' : '#6b7280',
                    fontSize: 11,
                  }}
                  tickMargin={15}
                  height={50}
                  interval={0}
                />
                
                <YAxis 
                  yAxisId="left"
                  orientation="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ 
                    fill: '#EE9C6C',
                    fontSize: 10,
                  }}
                  tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value.toString()}
                  domain={[0, Math.max(...leftTicks)]}
                  ticks={leftTicks}
                  interval={0}
                  tickMargin={20} 
                  width={60} 
                />
                
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ 
                    fill: '#8b5cf6',
                    fontSize: 10,
                  }}
                  allowDecimals={false}
                  domain={[0, Math.max(...rightTicks)]}
                  ticks={rightTicks}
                  interval={0}
                  tickMargin={20} 
                  width={60}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                {chartType === 'area' && (
                  <>
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="sales"
                      stroke="#EE9C6C"
                      strokeWidth={2}
                      fill="url(#colorSales)"
                      fillOpacity={0.5}
                      activeDot={{ r: 6 }}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="url(#colorOrders)"
                      fillOpacity={0.5}
                      activeDot={{ r: 6 }}
                    />
                  </>
                )}

                {chartType === 'bar' && (
                  <>
                    <Bar
                      yAxisId="left"
                      dataKey="sales"
                      fill="url(#colorSalesBar)"
                      fillOpacity={0.8}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="orders"
                      fill="url(#colorOrdersBar)"
                      fillOpacity={0.8}
                      radius={[4, 4, 0, 0]}
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full py-4 px-5 gap-6">
              {/* Pie Chart */}
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
                      fontWeight="500"
                    >
                      Total Sales
                    </text>
                    <text 
                      x="50%" 
                      y="60%" 
                      textAnchor="middle" 
                      fill={darkMode ? "#EE9C6C" : "#EE9C6C"}
                      fontSize="20"
                      fontWeight="bold"
                    >
                      {formatCurrency(totalSales)}
                    </text>
                    
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
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
                    
                    <Tooltip content={<PieCustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend */}
              <div className="w-1/2 h-full overflow-y-auto pr-2">
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
                          <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                            {item.orders} orders
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
          )}
        </div>

        {/* Stats Cards */}
        <div className={`flex items-center justify-between p-2.5 mx-5 rounded-xl ${
          darkMode 
            ? 'bg-neutral-900/50 border border-neutral-800' 
            : 'bg-neutral-100/20 border border-neutral-200'
        }`}>
          <div className="text-center flex-1">
            <p className={`text-xs font-semibold ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Total Revenue
            </p>
            <p className="text-sm font-bold text-[#EE9C6C]">
              {formatCurrency(totalSales)}
            </p>
          </div>
          
          <div className="w-px h-8 mx-4 bg-neutral-300 dark:bg-neutral-700"></div>
          
          <div className="text-center flex-1">
            <p className={`text-xs font-semibold ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Total Orders
            </p>
            <p className="text-sm font-bold text-[#8B7ABA]">
              {totalOrders.toLocaleString()}
            </p>
          </div>
          
          <div className="w-px h-8 mx-4 bg-neutral-300 dark:bg-neutral-700"></div>
          
          <div className="text-center flex-1">
            <p className={`text-xs font-semibold ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Growth
            </p>
            <div className="flex items-center justify-center gap-1">
              <p className={`text-sm font-bold ${parseFloat(growth) >= 0 ? 'text-[#34D19C]' : 'text-red-500'}`}>
                {parseFloat(growth).toFixed(1)}%
              </p>
              <span className={`text-sm ${parseFloat(growth) >= 0 ? 'text-[#34D19C]' : 'text-red-500'}`}>
                {parseFloat(growth) >= 0 ? '↑' : '↓'}
              </span>
            </div>
          </div>
          
          <div className="w-px h-8 mx-4 bg-neutral-300 dark:bg-neutral-700"></div>
          
          <div className="text-center flex-1">
            <p className={`text-xs font-semibold ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Data Points
            </p>
            <p className="text-sm font-bold text-green-600 dark:text-green-400">
              {filteredData.length}
            </p>
          </div>
        </div>

        {/* ✅ ✅ ✅ Legend - مع نص ديناميكي يتغير حسب الإعدادات */}
        <div className="flex items-center justify-center mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">

          {/* ✅ ✅ ✅ عرض حالة التصفية الحالية - تتغير ديناميكياً */}
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
              Sales Revenue
            </span>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <div className="w-2 h-2 rounded-full bg-[#8b5cf6]/80"></div>
            <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Orders Count
            </span>
          </div>
        </div>
      </div>

      {/* ✅ ✅ ✅ Widget Settings Modal - مع تمرير الإعدادات الحالية */}
      <WidgetSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
        settings={widgetSettings}
        darkMode={darkMode}
        title="Sales Chart Settings"
        description="Customize the sales chart display"
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

export default SalesChart;