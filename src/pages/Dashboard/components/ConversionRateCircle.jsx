// src/pages/Dashboard/components/ConversionRateCircle.jsx
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { 
  Target, TrendingUp, TrendingDown, Zap, RefreshCw, Star, Award, Rocket,
  Info, AlertCircle, ChevronRight, Clock, CheckCircle2, XCircle,
  TrendingUp as TrendingUpIcon, BarChart3, Users, ShoppingCart, Loader2
} from 'lucide-react';

// استيراد القوائم المنبثقة
import { DetailsModal, SettingsModal, ConfirmationModal } from '../../../components/ui/ConversionRateCircleModals';
import IconWrapper from '../../../components/ui/IconWrapper';
import WidgetButtons from '../../../components/ui/WidgetButtons';
import { useWidgetData } from '../../../hooks/useWidgetData';
import { useWidgetTimeRange } from '../../../hooks/useWidgetTimeRange';
import { useWidgetExport } from '../../../hooks/useWidgetExport';
import { analyticsService } from '../../../services/api';

// ========== CONSTANTS ==========
const CONVERSION_COLORS = {
  excellent: { 
    start: '#34D19C', 
    end: '#34D19C',
    glow: '#34D19C40',
    bg: 'from-emerald-500/10 to-emerald-600/5',
    icon: <Award size={16} />,
    statusColor: 'text-[#34D19C]',
    label: 'Excellent',
    threshold: 70
  },
  great: { 
    start: '#8B7ABA', 
    end: '#8B7ABA',
    glow: '#8B7ABA40',
    bg: 'from-purple-500/10 to-purple-600/5',
    icon: <Star size={16} />,
    statusColor: 'text-[#8B7ABA]',
    label: 'Great',
    threshold: 50
  },
  good: { 
    start: '#EE9C6C', 
    end: '#EE9C6C',
    glow: '#EE9C6C40',
    bg: 'from-amber-500/10 to-amber-600/5',
    icon: <Rocket size={16} />,
    statusColor: 'text-[#EE9C6C]',
    label: 'Good',
    threshold: 30
  },
  needsWork: { 
    start: '#F08FAE', 
    end: '#F08FAE',
    glow: '#F08FAE40',
    bg: 'from-rose-500/10 to-rose-600/5',
    icon: <TrendingDown size={16} />,
    statusColor: 'text-[#F08FAE]',
    label: 'Needs Work',
    threshold: 0
  }
};

// ========== MAIN COMPONENT ==========
const ConversionRateCircle = ({ 
  metrics: initialMetrics,
  darkMode = false, 
  onDetailsClick,
  onSettingsChange,
  onRefresh,
  isRefreshing = false,
  thresholds: initialThresholds = {
    excellent: 70,
    great: 50,
    good: 30,
    needsWork: 0
  },
  industryAverage: initialIndustryAverage = 4.5,
  showMonthlyGrowth: initialShowMonthlyGrowth = true,
  isLoading: externalLoading = false,
  error: externalError = null,
  lastUpdated: initialLastUpdated = 'Just now'
}) => {
  const widgetRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(initialLastUpdated);
  
  // ✅ بيانات حقيقية من API
  const [realMetrics, setRealMetrics] = useState({
    conversionRate: 0,
    visitors: 0,
    customers: 0,
    customersWithOrders: 0,
    totalOrders: 0
  });
  const [isLoadingData, setIsLoadingData] = useState(true); // ✅ start loading true
  const [errorData, setErrorData] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);

  // ✅ إعدادات الويدجت
  const [settings, setSettings] = useState({
    thresholds: initialThresholds,
    industryAverage: initialIndustryAverage,
    showMonthlyGrowth: initialShowMonthlyGrowth,
    animationSpeed: 1200,
    showLiveIndicator: true,
    compactMode: false,
    customColors: {}
  });

  // ✅ استخدام hooks
  const { timeRange, setTimeRange } = useWidgetTimeRange('month');
  const { exportToPDF, exportToCSV, exportToImage } = useWidgetExport({
    widgetRef,
    fileName: 'conversion_report',
    darkMode
  });

  const responsive = useResponsive();

  // ✅ دالة جلب البيانات
  const fetchConversionData = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoadingData(true);
      setErrorData(null);
      
      
      const response = await analyticsService.getDashboardMetrics();
      const data = response.data;
      
      
      const performance = data.performance || {};
      const metrics = data.metrics || {};
      
      const totalCustomers = metrics.total_customers || 0;
      const activeCustomers = performance.active_customers || 0;
      const totalOrders = performance.orders || 0;
      
      const conversionRate = totalCustomers > 0 
        ? (activeCustomers / totalCustomers) * 100 
        : 0;
      
      const visitors = totalCustomers + Math.round(totalCustomers * 0.3);
      
      setRealMetrics({
        conversionRate: Math.min(Math.max(conversionRate, 0), 100),
        visitors: visitors || 0,
        customers: totalCustomers || 0,
        customersWithOrders: activeCustomers || 0,
        totalOrders: totalOrders || 0
      });
      
      setLastUpdated(new Date().toLocaleString());
      setDataFetched(true);
      
    } catch (err) {
      console.error('❌ Error fetching conversion data:', err);
      setErrorData(err.message || 'Failed to load conversion data');
      setDataFetched(true);
      
      if (initialMetrics && initialMetrics.conversionRate) {
        const rate = parseFloat(initialMetrics.conversionRate) || 0;
        setRealMetrics({
          conversionRate: Math.min(Math.max(rate, 0), 100),
          visitors: parseInt(initialMetrics.visitors) || 0,
          customers: parseInt(initialMetrics.customers) || 0,
          customersWithOrders: 0,
          totalOrders: 0
        });
      }
    } finally {
      setIsLoadingData(false);
    }
  }, [initialMetrics]);

  // ✅ جلب البيانات عند التحميل
  useEffect(() => {
    fetchConversionData();
  }, []);

  // ✅ تحديث البيانات عند تغيير initialMetrics
  useEffect(() => {
    if (initialMetrics && Object.keys(initialMetrics).length > 0 && !dataFetched) {
      const rate = parseFloat(initialMetrics.conversionRate) || 0;
      setRealMetrics({
        conversionRate: Math.min(Math.max(rate, 0), 100),
        visitors: parseInt(initialMetrics.visitors) || 0,
        customers: parseInt(initialMetrics.customers) || 0,
        customersWithOrders: 0,
        totalOrders: 0
      });
      setDataFetched(true);
    }
  }, [initialMetrics, dataFetched]);

  // ✅ تحديث الإعدادات
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      thresholds: initialThresholds,
      industryAverage: initialIndustryAverage,
      showMonthlyGrowth: initialShowMonthlyGrowth
    }));
  }, [initialThresholds, initialIndustryAverage, initialShowMonthlyGrowth]);

  // ✅ استخدام useAnimatedValue - يتم تشغيله فقط عندما تكون البيانات جاهزة
  const percentage = realMetrics.conversionRate || 0;
  const { animatedValue, resetAnimation, isAnimating } = useAnimatedValue(
    dataFetched ? percentage : 0, 
    settings.animationSpeed
  );

  const isLoading = externalLoading || isLoadingData;
  const error = externalError || errorData;

  // ✅ دالة اختيار الألوان
  const gradientColors = useCallback((percent) => {
    const levels = [
      { key: 'excellent', ...CONVERSION_COLORS.excellent, threshold: settings.thresholds.excellent },
      { key: 'great', ...CONVERSION_COLORS.great, threshold: settings.thresholds.great },
      { key: 'good', ...CONVERSION_COLORS.good, threshold: settings.thresholds.good },
      { key: 'needsWork', ...CONVERSION_COLORS.needsWork, threshold: settings.thresholds.needsWork }
    ];
    
    const sortedLevels = [...levels].sort((a, b) => b.threshold - a.threshold);
    
    for (const level of sortedLevels) {
      if (percent >= level.threshold) {
        const start = settings.customColors[level.key]?.start || level.start;
        const end = settings.customColors[level.key]?.end || level.end;
        return { ...level, start, end, glow: start + '40' };
      }
    }
    
    const fallback = CONVERSION_COLORS.needsWork;
    const start = settings.customColors.needsWork?.start || fallback.start;
    const end = settings.customColors.needsWork?.end || fallback.end;
    return { ...fallback, start, end, glow: start + '40' };
  }, [settings.thresholds, settings.customColors]);

  const currentColors = gradientColors(percentage);
  const circumference = 2 * Math.PI * 40;
  const strokeDasharray = `${(animatedValue / 100) * circumference} ${circumference}`;
  
  const handleOpenDetails = () => {
    const details = {
      current: percentage,
      status: currentColors.label,
      statusIcon: currentColors.icon,
      statusColor: currentColors.statusColor,
      target: settings.industryAverage,
      thresholds: settings.thresholds,
      metrics: {
        visitors: realMetrics.visitors,
        customers: realMetrics.customers,
        customersWithOrders: realMetrics.customersWithOrders,
        totalOrders: realMetrics.totalOrders
      }
    };
    
    if (onDetailsClick) {
      onDetailsClick(details);
    } else {
      setIsDetailsModalOpen(true);
    }
  };

  const handleOpenSettings = () => {
    setIsSettingsModalOpen(true);
  };

  const handleSaveSettings = (newSettings) => {
    setSettings({ ...settings, ...newSettings });
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
    resetAnimation();
    setIsSettingsModalOpen(false);
  };

  const handleCancelSettings = () => {
    setIsSettingsModalOpen(false);
  };

  // ✅ معالج الوقت
  const handleTimeChange = (range) => {
    setTimeRange(range);
    fetchConversionData(true);
  };

  // ✅ معالج WidgetButtons
  const handleMoreClick = (action) => {
    switch(action) {
      case 'settings':
        handleOpenSettings();
        break;
      case 'refresh':
        if (onRefresh) {
          onRefresh();
        } else {
          fetchConversionData(true);
        }
        break;
      case 'exportPDF':
        exportToPDF({
          conversionRate: percentage,
          status: currentColors.label,
          visitors: realMetrics.visitors,
          customers: realMetrics.customers,
          customersWithOrders: realMetrics.customersWithOrders,
          totalOrders: realMetrics.totalOrders
        }, 'Conversion Rate Report');
        break;
      case 'exportCSV':
        exportToCSV([{
          conversionRate: percentage,
          status: currentColors.label,
          visitors: realMetrics.visitors,
          customers: realMetrics.customers,
          customersWithOrders: realMetrics.customersWithOrders,
          totalOrders: realMetrics.totalOrders
        }]);
        break;
      case 'exportImage':
        exportToImage();
        break;
      default:
        break;
    }
  };

  const isCompactMode = settings.compactMode && responsive.isMobile;

  // ✅ إذا لم تكن البيانات جاهزة بعد
  if (!dataFetched || isLoading) {
    return (
      <div className={`relative rounded-2xl p-4 sm:p-5 min-h-[500px] ${
        darkMode 
          ? 'bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border border-neutral-800' 
          : 'bg-gradient-to-br from-white to-neutral-50 border border-neutral-200/80 shadow-lg'
      }`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 size={40} className="animate-spin mx-auto mb-4 text-primary-500" />
            <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Loading conversion data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ حالة الخطأ
  if (error) {
    return (
      <div className={`relative rounded-2xl p-6 text-center ${
        darkMode 
          ? 'bg-gradient-to-br from-rose-900/20 to-rose-800/10 border border-rose-800/30' 
          : 'bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-200'
      }`}>
        <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2 dark:text-white">Error Loading Data</h3>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">{error}</p>
        <button 
          onClick={() => fetchConversionData(true)}
          className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  // ✅ حالة عدم وجود بيانات
  const hasNoData = realMetrics.customers === 0 && realMetrics.totalOrders === 0 && realMetrics.visitors === 0;

  if (hasNoData) {
    return (
      <div className={`relative rounded-2xl p-4 sm:p-5 min-h-[500px] ${
        darkMode 
          ? 'bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border border-neutral-800' 
          : 'bg-gradient-to-br from-white to-neutral-50 border border-neutral-200/80 shadow-lg'
      }`}>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className={`p-4 rounded-full ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'} mb-4`}>
            <Target size={48} className={darkMode ? 'text-neutral-600' : 'text-neutral-400'} />
          </div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
            No Conversion Data Yet
          </h3>
          <p className={`text-sm mt-2 max-w-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Add orders and customers to see your conversion rate
          </p>
          <button 
            onClick={() => fetchConversionData(true)}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        ref={widgetRef}
        className={`relative rounded-2xl p-4 sm:p-5 border transition-all duration-300 ${
          darkMode 
            ? 'bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-800 hover:border-primary-500/30' 
            : 'bg-gradient-to-br from-white to-neutral-50 border-neutral-200/80 hover:border-primary-200 shadow-lg hover:shadow-2xl'
        }`}
        style={{ minHeight: isCompactMode ? '400px' : '500px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="region"
        aria-label={`Conversion rate visualization: ${animatedValue}% - ${currentColors.label}`}
      >
        {/* Card Header */}
        <div className={`relative z-10 flex items-center justify-between ${isCompactMode ? 'mb-4' : 'mb-8 sm:mb-10'}`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <IconWrapper 
              darkMode={darkMode} 
              isHovered={isHovered}
              variant="primary"
              size={20}
            >
              <Target />
            </IconWrapper>
            <div>
              <h3 className={`font-bold ${isCompactMode ? 'text-sm' : 'text-base sm:text-lg'} ${
                darkMode ? 'text-white' : 'text-neutral-900'
              }`}>
                Conversion Rate
              </h3>
              <p className={`text-xs  ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                 Visitor to customer ratio
              </p>
            </div>
          </div>
          
          {/* Widget Buttons */}
          <WidgetButtons
            darkMode={darkMode}
            type="mixed"
            customButtons={['timeFilter', 'more']}
            timeRange={timeRange}
            onTimeChange={handleTimeChange}
            onMoreClick={handleMoreClick}
            isLoading={isAnimating || isRefreshing}
          />
        </div>

        {/* Central Circle */}
        <div className={`relative flex items-center justify-center ${isCompactMode ? 'mb-3' : 'mb-4 sm:mb-6'}`}>
          <div className="relative" style={{ 
            width: isCompactMode ? '8rem' : responsive.isMobile ? '10rem' : '13rem',
            height: isCompactMode ? '8rem' : responsive.isMobile ? '10rem' : '13rem'
          }}>
            {isHovered && (
              <div 
                className="absolute inset-0 rounded-full blur-xl transition-all duration-500 opacity-40"
                style={{ background: `radial-gradient(circle, ${currentColors.start}40 0%, transparent 70%)` }}
              />
            )}
            
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke={darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"} strokeWidth="13" />
              <circle 
                cx="50" cy="50" r="40" fill="none" stroke="url(#conversionGradient)" strokeWidth="11"
                strokeLinecap="round" strokeDasharray={strokeDasharray} strokeDashoffset="0"
                transform="rotate(-90 50 50)" className="transition-all duration-1000 ease-out-expo"
                style={{ filter: isHovered ? `drop-shadow(0 0 10px ${currentColors.start}60)` : 'none' }}
              />
              <defs>
                <linearGradient id="conversionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={currentColors.start} />
                  <stop offset="100%" stopColor={currentColors.end} />
                </linearGradient>
              </defs>
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-bold"
                style={{
                  fontSize: isCompactMode ? '1.8rem' : responsive.isMobile ? '2.2rem' : '2.3rem',
                  backgroundImage: `linear-gradient(135deg, ${currentColors.start}, ${currentColors.end})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                  textShadow: isHovered ? `0 0 20px ${currentColors.start}40` : 'none'
                }}
              >
                {animatedValue.toFixed(1)}%
              </div>
              <div className="font-bold"
                style={{
                  fontSize: isCompactMode ? '0.75rem' : responsive.isMobile ? '0.8rem' : '1rem',
                  backgroundImage: `linear-gradient(135deg, ${currentColors.start}, ${currentColors.end})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                  textShadow: isHovered ? `0 0 20px ${currentColors.start}40` : 'none'
                }}
              >
                of target
              </div>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-center mb-10">
          <button
            onClick={handleOpenDetails}
            className={`group relative flex items-center gap-2 px-3 sm:px-3 py-1.5 rounded-full transition-all duration-300 ${
              darkMode 
                ? 'bg-gradient-to-r from-neutral-800/80 to-neutral-900/60 border border-neutral-700/50 hover:border-neutral-600/70' 
                : 'bg-gradient-to-r from-white/90 to-white/70 border border-neutral-200/70 hover:border-neutral-300 shadow-sm hover:shadow-md'
            }`}
          >
            <div className={`p-2 rounded-full transition-transform duration-300 group-hover:scale-110 ${
              darkMode ? 'bg-neutral-700/50' : 'bg-neutral-100'
            }`} style={{ color: currentColors.end }}>
              {currentColors.icon}
            </div>
            <div className="text-left">
              <div className={`font-semibold text-sm ${currentColors.statusColor}`}>
                {currentColors.label}
              </div>
              <div className="text-[10px] opacity-70 dark:text-neutral-400">
                {realMetrics.customers > 0 && realMetrics.visitors > 0 
                  ? `${realMetrics.customers} / ${realMetrics.visitors} converted`
                  : realMetrics.customers > 0 
                    ? `${realMetrics.customers} total customers`
                    : 'No data available'}
              </div>
            </div>
            <div className={`ml-2 p-1.5 rounded-full transition-all duration-300 ${
              darkMode 
                ? 'bg-neutral-700 group-hover:bg-neutral-500/20' 
                : 'bg-neutral-100 group-hover:bg-neutral-200'
            } group-hover:translate-x-1`}>
              <ChevronRight size={14} style={{ color: currentColors.end }} />
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 group-hover:w-3/4 transition-all duration-300"
              style={{
                background: `linear-gradient(to right, transparent, ${currentColors.start}, ${currentColors.end}, transparent)`
              }}
            />
          </button>
        </div>

        {/* Metrics Cards */}
        {!isCompactMode && (
          <div className="relative mb-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* بطاقة الزوار */}
              <div 
                className={`p-3 sm:p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden ${
                  darkMode 
                    ? 'bg-gradient-to-br from-neutral-800/40 to-neutral-800/20 border border-neutral-700/30 hover:border-neutral-600/50' 
                    : 'bg-gradient-to-br from-neutral-100/60 to-white border border-neutral-200/60 hover:border-neutral-300'
                }`}
              >
                <div className="absolute -right-3 -top-3 sm:-right-4 sm:-top-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full opacity-10 hover:opacity-20 transition-opacity duration-500"
                  style={{ background: '#8B5CF6' }}
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-1.5 mb-1 sm:mb-2">
                    <Users className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-primary-800/80 dark:text-primary-800/80" />
                    <div className="text-lg sm:text-xl font-bold text-primary-800/80 dark:text-primary-800/80">
                      {realMetrics.visitors > 0 ? realMetrics.visitors.toLocaleString() : 0}
                    </div>
                  </div>
                  <div className={`text-xs font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    Total Visitors
                  </div>
                  <div className="mt-1 sm:mt-2.5 text-[10px] font-medium text-neutral-400">
                    {realMetrics.customers > 0 && realMetrics.visitors > 0 
                      ? `${((realMetrics.customers / realMetrics.visitors) * 100).toFixed(1)}% conversion rate`
                      : realMetrics.customers > 0 
                        ? `${realMetrics.customers} total customers`
                        : 'No conversion data'}
                  </div>
                </div>
              </div>

              {/* بطاقة العملاء */}
              <div className={`p-3 sm:p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden ${
                darkMode 
                  ? 'bg-gradient-to-br from-neutral-800/40 to-neutral-800/20 border border-neutral-700/30 hover:border-neutral-600/50' 
                  : 'bg-gradient-to-br from-neutral-100/60 to-white border border-neutral-200/60 hover:border-neutral-300'
              }`}>
                <div className="absolute -right-3 -top-3 sm:-right-4 sm:-top-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full opacity-10 hover:opacity-20 transition-opacity duration-500"
                  style={{ background: '#10B981' }}
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-2">
                    <ShoppingCart className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                    <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {realMetrics.customers > 0 ? realMetrics.customers.toLocaleString() : 0}
                    </div>
                  </div>
                  <div className={`text-xs font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    Total Customers
                  </div>
                  <div className="mt-1 sm:mt-2.5 text-[10px] font-medium text-neutral-400">
                    {realMetrics.customersWithOrders > 0 
                      ? `${realMetrics.customersWithOrders} customers with orders`
                      : realMetrics.totalOrders > 0
                        ? `${realMetrics.totalOrders} total orders`
                        : 'No orders yet'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isCompactMode && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="text-center p-2 rounded-lg bg-neutral-100/50 dark:bg-neutral-800/50">
              <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Visitors</div>
              <div className="text-lg font-bold text-primary-800/80 dark:text-primary-400">
                {realMetrics.visitors > 0 ? realMetrics.visitors.toLocaleString() : 0}
              </div>
            </div>
            <div className="text-center p-2 rounded-lg bg-neutral-100/50 dark:bg-neutral-800/50">
              <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Customers</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {realMetrics.customers > 0 ? realMetrics.customers.toLocaleString() : 0}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={`border-t mt-5 border-neutral-200 dark:border-neutral-700/50 ${isCompactMode ? 'pt-3' : ''}`}>
          <div className="flex items-center justify-center text-xs mt-4 gap-2 text-neutral-500 dark:text-neutral-400">
            <Clock size={12} />
            <span>Updated: {lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* ✅ Details Modal */}
      <DetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        details={{
          current: percentage,
          status: currentColors.label,
          statusIcon: currentColors.icon,
          statusColor: currentColors.statusColor,
          target: settings.industryAverage,
          thresholds: settings.thresholds,
          metrics: {
            visitors: realMetrics.visitors,
            customers: realMetrics.customers,
            customersWithOrders: realMetrics.customersWithOrders,
            totalOrders: realMetrics.totalOrders
          }
        }}
        darkMode={darkMode}
      />

      {/* ✅ Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={handleCancelSettings}
        onSave={handleSaveSettings}
        settings={settings}
        darkMode={darkMode}
        sections={[
          {
            id: 'thresholds',
            type: 'thresholds',
            title: 'Conversion Rate Thresholds',
            description: 'Set the percentage levels for each performance category',
            min: 0,
            max: 100,
            step: 0.1,
            unit: '%'
          },
          {
            id: 'display',
            type: 'toggles',
            title: 'Display Options',
            options: [
              {
                key: 'showMonthlyGrowth',
                label: 'Monthly Growth',
                description: 'Show monthly growth trends',
                icon: <TrendingUp size={16} />
              },
              {
                key: 'showLiveIndicator',
                label: 'Live Indicator',
                description: 'Show real-time updates',
                icon: <Zap size={16} />
              },
              {
                key: 'compactMode',
                label: 'Compact Mode',
                description: 'Optimize for mobile devices',
                icon: <Zap size={16} />
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

// ========== CUSTOM HOOKS ==========
const useAnimatedValue = (targetValue, duration = 1200) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const animationRef = useRef(null);
  const timeoutRef = useRef(null);

  const animate = useCallback((start, end, duration, onComplete) => {
    const startTime = performance.now();
    
    const updateAnimation = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentValue = start + (end - start) * easeOutExpo;
      
      setAnimatedValue(Number(currentValue.toFixed(1)));
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(updateAnimation);
      } else {
        if (onComplete) onComplete();
      }
    };
    
    animationRef.current = requestAnimationFrame(updateAnimation);
  }, []);

  useEffect(() => {
    if (targetValue > 0) {
      animate(0, targetValue, duration);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [targetValue, duration, animate]);

  const resetAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setAnimatedValue(0);
    
    timeoutRef.current = setTimeout(() => {
      if (targetValue > 0) {
        animate(0, targetValue, 800);
      }
    }, 50);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [targetValue, animate]);

  return { animatedValue, resetAnimation, isAnimating: animatedValue < targetValue };
};

const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isXSmall: windowSize.width < 380,
    isMobile: windowSize.width < 640,
    isTablet: windowSize.width >= 640 && windowSize.width < 1024,
    isDesktop: windowSize.width >= 1024,
    windowSize
  };
};

// ========== PROP TYPES ==========
ConversionRateCircle.propTypes = {
  metrics: PropTypes.shape({
    conversionRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    visitors: PropTypes.number,
    customers: PropTypes.number
  }),
  darkMode: PropTypes.bool,
  onDetailsClick: PropTypes.func,
  onSettingsChange: PropTypes.func,
  onRefresh: PropTypes.func,
  isRefreshing: PropTypes.bool,
  thresholds: PropTypes.shape({
    excellent: PropTypes.number,
    great: PropTypes.number,
    good: PropTypes.number,
    needsWork: PropTypes.number
  }),
  industryAverage: PropTypes.number,
  showMonthlyGrowth: PropTypes.bool,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  lastUpdated: PropTypes.string
};

ConversionRateCircle.defaultProps = {
  darkMode: false,
  thresholds: {
    excellent: 70,
    great: 50,
    good: 30,
    needsWork: 0
  },
  industryAverage: 4.5,
  showMonthlyGrowth: true,
  isLoading: false,
  error: null,
  isRefreshing: false,
  lastUpdated: 'Just now'
};

export default memo(ConversionRateCircle);