// src/pages/Analytics/components/GaugeChartComponent.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Gauge, Target, TrendingUp, TrendingDown,
  Zap, Settings, Info,
  Star, Activity, Download, ChevronDown,
  Clock, X, Circle, Loader2, RefreshCw, AlertCircle
} from 'lucide-react';
import Chart from 'react-apexcharts';
import IconWrapper from '../../../components/ui/IconWrapper';
import WidgetButtons from '../../../components/ui/WidgetButtons';
import { useWidgetTimeRange } from '../../../hooks/useWidgetTimeRange';
import { useWidgetExport } from '../../../hooks/useWidgetExport';
import { analyticsService } from '../../../services/api';

// ✅ ألوان المشروع
const COLORS = {
  primary: '#8B7ABA',
  secondary: '#F08FAE',
  accent: '#EE9C6C',
  success: '#34D19C'
};

const GaugeChartComponent = ({ darkMode }) => {
  const [activeGauge, setActiveGauge] = useState('performance');
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('Just now');
  const widgetRef = useRef(null);

  // ✅ بيانات حقيقية
  const [gaugeData, setGaugeData] = useState({
    performance: {
      id: 'performance',
      title: 'Performance Score',
      value: 0,
      min: 0,
      max: 100,
      target: 85,
      unit: '%',
      icon: <Zap size={18} />,
      status: 'Loading...',
      trend: '+0%',
      thresholds: [
        { value: 0, color: '#F08FAE', label: 'Critical' },
        { value: 40, color: '#EE9C6C', label: 'Warning' },
        { value: 60, color: '#8B7ABA', label: 'Good' },
        { value: 80, color: '#34D19C', label: 'Excellent' },
        { value: 100, color: '#34D19C', label: 'Excellent' }
      ]
    },
    efficiency: {
      id: 'efficiency',
      title: 'Resource Efficiency',
      value: 0,
      min: 0,
      max: 10,
      target: 8.5,
      unit: '/10',
      icon: <Activity size={18} />,
      status: 'Loading...',
      trend: '+0',
      thresholds: [
        { value: 0, color: '#F08FAE', label: 'Critical' },
        { value: 4, color: '#EE9C6C', label: 'Warning' },
        { value: 6, color: '#8B7ABA', label: 'Good' },
        { value: 8, color: '#34D19C', label: 'Excellent' },
        { value: 10, color: '#34D19C', label: 'Excellent' }
      ]
    }
  });

  // ✅ جلب البيانات الحقيقية من API
  const fetchGaugeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await analyticsService.getDashboardMetrics();
      const data = response.data;


      // ✅ استخراج البيانات من الهيكل الاحترافي
      const performance = data.performance || {};
      const financial = data.financial || {};
      const efficiency = data.efficiency || {};
      const metrics = data.metrics || {};

      // ✅ 1. Performance Score
      const performanceScore = performance.score || 0;

      // ✅ 2. النمو - استخدم performance.growth (جميع الطلبات) وليس financial.growth (الطلبات المسلمة فقط)
      // هذا هو السلوك الاحترافي للمتاجر الكبرى
      const revenueGrowth = performance.growth?.revenue || 0;
      const ordersGrowth = performance.growth?.orders || 0;

      // ✅ 3. Resource Efficiency
      const efficiencyScore = efficiency.score || 0;

      

      // ✅ تحديث الحالة
      setGaugeData({
        performance: {
          id: 'performance',
          title: 'Performance Score',
          value: Math.min(Math.max(performanceScore, 0), 100),
          min: 0,
          max: 100,
          target: 85,
          unit: '%',
          icon: <Zap size={18} />,
          status: performanceScore >= 80 ? 'Excellent' : 
                  performanceScore >= 60 ? 'Good' : 
                  performanceScore >= 40 ? 'Warning' : 'Critical',
          trend: revenueGrowth > 0 ? `+${revenueGrowth.toFixed(1)}%` : `${revenueGrowth.toFixed(1)}%`,
          thresholds: [
            { value: 0, color: '#F08FAE', label: 'Critical' },
            { value: 40, color: '#EE9C6C', label: 'Warning' },
            { value: 60, color: '#8B7ABA', label: 'Good' },
            { value: 80, color: '#34D19C', label: 'Excellent' },
            { value: 100, color: '#34D19C', label: 'Excellent' }
          ]
        },
        efficiency: {
          id: 'efficiency',
          title: 'Resource Efficiency',
          value: parseFloat(efficiencyScore.toFixed(1)),
          min: 0,
          max: 10,
          target: 8.5,
          unit: '/10',
          icon: <Activity size={18} />,
          status: efficiencyScore >= 8 ? 'Excellent' : 
                  efficiencyScore >= 6 ? 'Good' : 
                  efficiencyScore >= 4 ? 'Warning' : 'Critical',
          trend: ordersGrowth > 0 ? `+${ordersGrowth.toFixed(1)}` : `${ordersGrowth.toFixed(1)}`,
          thresholds: [
            { value: 0, color: '#F08FAE', label: 'Critical' },
            { value: 4, color: '#EE9C6C', label: 'Warning' },
            { value: 6, color: '#8B7ABA', label: 'Good' },
            { value: 8, color: '#34D19C', label: 'Excellent' },
            { value: 10, color: '#34D19C', label: 'Excellent' }
          ]
        }
      });

      setLastUpdated(new Date().toLocaleString());

    } catch (err) {
      console.error('❌ Error fetching gauge data:', err);
      setError('Failed to load gauge data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGaugeData();
  }, []);

  // ✅ استخدام hooks
  const { timeRange, setTimeRange } = useWidgetTimeRange('month');
  const { exportToPDF, exportToCSV, exportToImage } = useWidgetExport({
    widgetRef,
    fileName: 'performance_gauge_report',
    darkMode
  });

  const currentGauge = gaugeData[activeGauge];
  
  const calculateGaugePercentage = (value) => {
    return ((value - currentGauge.min) / (currentGauge.max - currentGauge.min)) * 100;
  };
  
  const gaugePercentage = calculateGaugePercentage(currentGauge.value);

  const calculateProgress = (value) => {
    return Math.min((value / currentGauge.target) * 100, 100);
  };
  
  const progress = calculateProgress(currentGauge.value);

  const getCurrentColorFromThresholds = () => {
    const value = currentGauge.value;
    const thresholds = currentGauge.thresholds;
    
    if (!thresholds || thresholds.length === 0) {
      return '#8B7ABA';
    }
    
    for (let i = thresholds.length - 2; i >= 0; i--) {
      if (value >= thresholds[i].value) {
        return thresholds[i].color;
      }
    }
    return thresholds[0]?.color || '#8B7ABA';
  };

  const getCurrentStatusFromThresholds = () => {
    const value = currentGauge.value;
    const thresholds = currentGauge.thresholds;
    
    if (!thresholds || thresholds.length === 0) {
      return 'Unknown';
    }
    
    for (let i = thresholds.length - 2; i >= 0; i--) {
      if (value >= thresholds[i].value) {
        return thresholds[i].label;
      }
    }
    return thresholds[0]?.label || 'Unknown';
  };

  const currentColor = getCurrentColorFromThresholds();
  const currentStatus = getCurrentStatusFromThresholds();

  const handleTimeChange = useCallback((range) => {
    if (range && typeof range === 'string') {
      setTimeRange(range);
      fetchGaugeData();
    }
  }, [setTimeRange, fetchGaugeData]);

  const handleMoreClick = useCallback((action) => {
    switch(action) {
      case 'exportPDF':
        exportToPDF({
          timeRange,
          gauge: currentGauge.title,
          value: currentGauge.value,
          unit: currentGauge.unit,
          target: currentGauge.target,
          status: currentStatus,
          trend: currentGauge.trend,
          thresholds: currentGauge.thresholds
        }, `Gauge Report - ${currentGauge.title}`);
        break;
      case 'exportCSV':
        exportToCSV([{
          Metric: currentGauge.title,
          Value: currentGauge.value,
          Unit: currentGauge.unit,
          Target: currentGauge.target,
          Status: currentStatus,
          Trend: currentGauge.trend
        }]);
        break;
      case 'exportImage':
        exportToImage();
        break;
      case 'settings':
        setShowSettings(true);
        break;
      case 'refresh':
        fetchGaugeData();
        break;
      default:
        break;
    }
  }, [currentGauge, currentStatus, timeRange, exportToPDF, exportToCSV, exportToImage, fetchGaugeData]);

  // ✅ حالة التحميل
  if (loading) {
    return (
      <div className={`rounded-xl p-5 border transition-colors min-h-[500px] flex items-center justify-center ${
        darkMode 
          ? 'bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-800' 
          : 'bg-gradient-to-br from-white to-neutral-50 border-neutral-200/80 shadow-lg'
      }`}>
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto mb-3 text-primary-500" />
          <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Loading performance data...
          </p>
        </div>
      </div>
    );
  }

  // ✅ حالة الخطأ
  if (error) {
    return (
      <div className={`rounded-xl p-5 border transition-colors min-h-[500px] flex items-center justify-center ${
        darkMode 
          ? 'bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-800' 
          : 'bg-gradient-to-br from-white to-neutral-50 border-neutral-200/80 shadow-lg'
      }`}>
        <div className="text-center">
          <AlertCircle size={32} className="mx-auto mb-3 text-amber-500" />
          <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>{error}</p>
          <button
            onClick={fetchGaugeData}
            className="mt-3 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ✅ حالة عدم وجود بيانات
  if (currentGauge.value === 0 && currentGauge.status === 'Loading...') {
    return (
      <div className={`rounded-xl p-5 border transition-colors min-h-[500px] flex items-center justify-center ${
        darkMode 
          ? 'bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-800' 
          : 'bg-gradient-to-br from-white to-neutral-50 border-neutral-200/80 shadow-lg'
      }`}>
        <div className="text-center">
          <div className={`p-4 rounded-full ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'} mx-auto mb-4`}>
            <Gauge size={40} className={darkMode ? 'text-neutral-600' : 'text-neutral-400'} />
          </div>
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
            No Performance Data Available
          </h3>
          <p className={`text-sm mt-2 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Add orders to see performance metrics
          </p>
          <button
            onClick={fetchGaugeData}
            className="mt-3 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // ✅ رسم Gauge باستخدام ApexCharts
  const renderFullGauge = () => {
    const percentage = (currentGauge.value / currentGauge.max) * 100;
    
    const displayValue = currentGauge.unit === '%' 
      ? `${currentGauge.value}%` 
      : `${currentGauge.value}${currentGauge.unit}`;
    
    const options = {
      chart: {
        type: 'radialBar',
        offsetY: -20,
        sparkline: { enabled: true },
        background: 'transparent'
      },
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          track: {
            background: darkMode ? '#262626' : '#F3F4F6',
            strokeWidth: '97%',
            margin: 5,
            dropShadow: { enabled: false }
          },
          dataLabels: {
            name: { show: false },
            value: {
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: currentColor,
              offsetY: 10,
              formatter: function(val) {
                return displayValue;
              }
            }
          },
          hollow: {
            margin: 15,
            size: '55%',
            background: 'transparent'
          }
        }
      },
      fill: {
        colors: [currentColor],
        gradient: {
          shade: 'light',
          type: 'horizontal',
          shadeIntensity: 0.5,
          gradientToColors: [currentColor],
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.9,
          stops: [0, 100]
        }
      },
      stroke: {
        lineCap: 'round'
      },
      states: {
        hover: { filter: { type: 'none' } },
        active: { filter: { type: 'none' } }
      }
    };

    const series = [percentage];

    return (
      <div className="relative w-full h-32 mb-6 flex justify-center items-center">
        <div className="w-full h-full">
          <Chart 
            options={options} 
            series={series} 
            type="radialBar" 
            height={280} 
          />
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={widgetRef}
      className={`rounded-xl p-5 border transition-colors ${
        darkMode 
            ? 'bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-800 hover:border-primary-500/30' 
            : 'bg-gradient-to-br from-white to-neutral-50 border-neutral-200/80 hover:border-primary-200 shadow-lg hover:shadow-2xl'
        }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-2">
          <IconWrapper 
            darkMode={darkMode} 
            variant="primary"
            size={20}
          >
            <Gauge />
          </IconWrapper>
          
          <div>
            <h3 className={`font-bold text-base ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              Performance Gauge
            </h3>
            <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              {currentGauge.title} 
            </p>
          </div>
        </div>
        
        <WidgetButtons
          darkMode={darkMode}
          type="mixed"
          customButtons={['timeFilter', 'more']}
          timeRange={timeRange}
          onTimeChange={handleTimeChange}
          onMoreClick={handleMoreClick}
        />
      </div>

      {/* Gauge Display */}
      <div className="mb-4">
        {renderFullGauge()}
        
        {/* Current Status */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div 
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ 
                backgroundColor: darkMode ? `${currentColor}20` : `${currentColor}10`,
                color: currentColor
              }}
            >
              {currentStatus}
            </div>
            <div className={`text-sm flex items-center gap-1 ${
              currentGauge.trend.includes('+')
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}>
              {currentGauge.trend.includes('+') ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {currentGauge.trend}
            </div>
          </div>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="flex gap-2 px-5 mb-6">
        {Object.values(gaugeData).map((gauge) => {
          const getGaugeColor = (value, thresholds) => {
            if (!thresholds || thresholds.length === 0) return '#8B7ABA';
            for (let i = thresholds.length - 2; i >= 0; i--) {
              if (value >= thresholds[i].value) {
                return thresholds[i].color;
              }
            }
            return thresholds[0]?.color || '#8B7ABA';
          };
          
          const gaugeColor = getGaugeColor(gauge.value, gauge.thresholds);
          const isActive = activeGauge === gauge.id;
          
          return (
            <button
              key={gauge.id}
              onClick={() => setActiveGauge(gauge.id)}
              className={`flex-1 relative py-2.5 px-3 rounded-lg transition-all ${
                isActive
                  ? darkMode
                    ? 'bg-neutral-800 ring-1 ring-purple-500/50'
                    : 'bg-white shadow-sm ring-1 ring-primary-800/20'
                  : darkMode
                    ? 'bg-neutral-800/50 hover:bg-neutral-800'
                    : 'bg-neutral-100 hover:bg-neutral-200/80'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <div 
                  className="transition-all"
                  style={{ 
                    color: isActive ? gaugeColor : darkMode ? '#9CA3AF' : '#6B7280',
                  }}
                >
                  {React.cloneElement(gauge.icon, { size: 14 })}
                </div>
                <span className={`text-xs font-medium ${
                  isActive
                    ? darkMode ? 'text-white' : 'text-neutral-900'
                    : darkMode ? 'text-neutral-400' : 'text-neutral-600'
                }`}>
                  {gauge.title.split(' ')[0]}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Performance Metrics */}
      <div className="space-y-3 px-5 mb-6">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Current Value 
          </span>
          <span className="text-sm font-medium" style={{ color: currentColor }}>
            {currentGauge.value}{currentGauge.unit}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Target 
          </span>
          <span className="text-sm font-medium text-[#8B7ABA]">
            {currentGauge.target}{currentGauge.unit}
          </span>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-semibold pb-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Progress to target 
            </span>
            <span className="text-sm font-medium" style={{ color: currentColor }}>
              {progress.toFixed(0)}%
            </span>
          </div>
          <div className={`h-1.5 w-full rounded-full ${darkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`}>
            <div 
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ 
                width: `${progress}%`,
                backgroundColor: currentColor
              }}
            />
          </div>
        </div>
      </div>

      {/* Threshold Legend */}
      <div className={`p-3 rounded-lg mb-4 ${
        darkMode ? 'bg-neutral-800/30 border border-neutral-700' : 'bg-neutral-50 border border-neutral-200'
      }`}>
        <div className="grid grid-cols-4 gap-2">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F08FAE' }} />
              <span className="text-xs font-medium">Critical</span>
            </div>
            <div className="text-xs text-neutral-500 text-center">
              0 - {currentGauge.id === 'efficiency' ? '4' : '40'}{currentGauge.unit}
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EE9C6C' }} />
              <span className="text-xs font-medium">Warning</span>
            </div>
            <div className="text-xs text-neutral-500 text-center">
              {currentGauge.id === 'efficiency' ? '4' : '40'} - {currentGauge.id === 'efficiency' ? '6' : '60'}{currentGauge.unit}
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8B7ABA' }} />
              <span className="text-xs font-medium">Good</span>
            </div>
            <div className="text-xs text-neutral-500 text-center">
              {currentGauge.id === 'efficiency' ? '6' : '60'} - {currentGauge.id === 'efficiency' ? '8' : '80'}{currentGauge.unit}
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#34D19C' }} />
              <span className="text-xs font-medium">Excellent</span>
            </div>
            <div className="text-xs text-neutral-500 text-center">
              {currentGauge.id === 'efficiency' ? '8' : '80'}+{currentGauge.unit}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`pt-4 border-t ${darkMode ? 'border-neutral-700/50' : 'border-neutral-200'}`}>
        <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <Clock size={12} />
          <span>Updated: {lastUpdated}</span>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`relative w-full max-w-sm rounded-xl shadow-xl ${
            darkMode 
              ? 'bg-neutral-800 border border-neutral-700' 
              : 'bg-white border border-neutral-200'
          }`}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                  Gauge Settings
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg"
                >
                  <X size={20} className={darkMode ? 'text-neutral-400' : 'text-neutral-600'} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Auto-refresh
                  </label>
                  <select className={`w-full p-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-neutral-700 border-neutral-600 text-white' 
                      : 'bg-white border-neutral-300 text-neutral-900'
                  }`}>
                    <option>Off</option>
                    <option>30 seconds</option>
                    <option selected>1 minute</option>
                    <option>5 minutes</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium dark:text-neutral-300">Show thresholds</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer 
                      peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] 
                      after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full 
                      after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium dark:text-neutral-300">Show target marker</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer 
                      peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] 
                      after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full 
                      after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 py-2.5 rounded-lg font-medium border border-neutral-300 dark:border-neutral-700 
                    hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 py-2.5 rounded-lg font-medium bg-[#8B7ABA] text-white 
                    hover:bg-[#7A6AA9] transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GaugeChartComponent;