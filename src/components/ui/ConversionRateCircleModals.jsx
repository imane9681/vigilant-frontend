// src/components/ui/ConversionRateCircleModals.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  X, BarChart3, TrendingUp, Users, ShoppingCart, Target,
  Award, Clock, Calendar, ChevronRight, Download, AlertCircle,
  TrendingDown, Activity, PieChart, ArrowUpRight, ArrowDownRight,
  CheckCircle2, Info, Settings, Zap, Star, Rocket, Palette,
  Eye, EyeOff, Bell, BellOff, Globe, Moon, Sun, Sliders,
  Gauge, Filter, Layers, Save, RefreshCw, HelpCircle,
  Maximize2, Minimize2, Move, Plus, Minus, Volume2, VolumeX
} from 'lucide-react';

// ========== CONSTANTS ==========
const BRAND_COLORS = {
  primary: '#8B7ABA',
  secondary: '#F08FAE',
  accent: '#EE9C6C',
  success: '#34D19C'
};

const STATUS_GRADIENTS = {
  excellent: 'from-[#34D19C] to-[#8B7ABA]',
  great: 'from-[#8B7ABA] to-[#EE9C6C]',
  good: 'from-[#EE9C6C] to-[#F08FAE]',
  needsWork: 'from-[#F08FAE] to-[#EE9C6C]'
};

const levelColors = {
  excellent: BRAND_COLORS.success,
  great: BRAND_COLORS.primary,
  good: BRAND_COLORS.accent,
  needsWork: BRAND_COLORS.secondary
};

// ========== DETAILS MODAL ==========
export const DetailsModal = ({ isOpen, onClose, details, darkMode }) => {
  if (!isOpen) return null;

  const {
    current,
    status,
    statusIcon,
    statusColor,
    target,
    thresholds,
    metrics
  } = details;

  const difference = current - target;
  const isAboveTarget = difference > 0;
  const percentOfTarget = (current / target) * 100;

  const getNextLevel = () => {
    if (current < thresholds.good) return { name: 'Good', threshold: thresholds.good, color: BRAND_COLORS.accent };
    if (current < thresholds.great) return { name: 'Great', threshold: thresholds.great, color: BRAND_COLORS.primary };
    if (current < thresholds.excellent) return { name: 'Excellent', threshold: thresholds.excellent, color: BRAND_COLORS.success };
    return null;
  };

  const nextLevel = getNextLevel();

  const weeklyData = [65, 72, 68, 75, 82, 78, 85];
  const maxValue = Math.max(...weeklyData);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      <div 
        className={`relative w-full max-w-2xl rounded-3xl shadow-2xl transform transition-all duration-500 scale-100 opacity-100 overflow-hidden ${
          darkMode 
            ? 'bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800' 
            : 'bg-gradient-to-br from-white via-white to-neutral-50'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* خلفية زخرفية */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full" style={{ background: `radial-gradient(circle, ${BRAND_COLORS.primary}40 0%, transparent 70%)` }} />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full" style={{ background: `radial-gradient(circle, ${BRAND_COLORS.success}40 0%, transparent 70%)` }} />
        </div>

        {/* Header */}
        <div className="relative">
          <div 
            className="absolute inset-0 opacity-10"
            style={{ 
              background: `linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.secondary}, ${BRAND_COLORS.accent})` 
            }} 
          />
          
          <div className="relative p-8 border-b border-neutral-200/20 dark:border-neutral-700/20">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="p-4 rounded-2xl shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${BRAND_COLORS.primary}20, ${BRAND_COLORS.secondary}10)`,
                    boxShadow: `0 10px 30px -10px ${BRAND_COLORS.primary}40`
                  }}
                >
                  <BarChart3 size={28} style={{ color: BRAND_COLORS.primary }} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold dark:text-white">Conversion Analytics</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2 mt-1">
                    <Activity size={14} style={{ color: BRAND_COLORS.primary }} />
                    Detailed performance breakdown
                  </p>
                </div>
              </div>
              
              <button 
                onClick={onClose} 
                className={`p-3 rounded-xl transition-all duration-300 hover:rotate-90 ${
                  darkMode 
                    ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' 
                    : 'hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Current Status Card */}
          <div 
            className="relative p-6 rounded-2xl overflow-hidden"
            style={{ 
              background: darkMode 
                ? `linear-gradient(135deg, ${BRAND_COLORS.primary}10, ${BRAND_COLORS.secondary}05)` 
                : `linear-gradient(135deg, ${BRAND_COLORS.primary}05, ${BRAND_COLORS.secondary}02)`,
              border: `1px solid ${BRAND_COLORS.primary}20`
            }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <div className="absolute inset-0" style={{ background: `radial-gradient(circle, ${BRAND_COLORS.primary} 0%, transparent 70%)` }} />
            </div>

            <div className="relative grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-2">
                  <Target size={14} style={{ color: BRAND_COLORS.primary }} />
                  Current Status
                </p>
                <div className="flex items-center gap-4">
                  <div 
                    className="p-3 rounded-xl"
                    style={{ background: `${BRAND_COLORS.primary}15` }}
                  >
                    {statusIcon || <Gauge size={24} style={{ color: BRAND_COLORS.primary }} />}
                  </div>
                  <div>
                    <div className="text-4xl font-bold" style={{ color: BRAND_COLORS.primary }}>
                      {current.toFixed(1)}%
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-sm font-medium ${statusColor}`}>{status}</span>
                      <div 
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: BRAND_COLORS.primary }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-2">
                  <Award size={14} style={{ color: BRAND_COLORS.success }} />
                  Industry Benchmark
                </p>
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold" style={{ color: BRAND_COLORS.success }}>
                      {target.toFixed(1)}%
                    </span>
                    <span className="text-sm text-neutral-400">target</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 ${
                      isAboveTarget ? 'bg-[#34D19C]20 text-[#34D19C]' : 'bg-[#F08FAE]20 text-[#F08FAE]'
                    }`}>
                      {isAboveTarget ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      {isAboveTarget ? '+' : ''}{difference.toFixed(1)}% vs target
                    </div>
                    
                    <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${Math.min(percentOfTarget, 100)}%`,
                          background: `linear-gradient(90deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.success})`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Next Level Card */}
          {nextLevel && (
            <div 
              className="relative p-6 rounded-2xl overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-[1.02]"
              style={{ 
                background: darkMode 
                  ? `linear-gradient(135deg, ${nextLevel.color}15, transparent)` 
                  : `linear-gradient(135deg, ${nextLevel.color}08, transparent)`,
                border: `1px solid ${nextLevel.color}30`
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at 30% 50%, ${nextLevel.color} 0%, transparent 70%)` }}
              />
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110"
                    style={{ background: `${nextLevel.color}20` }}
                  >
                    <Rocket size={24} style={{ color: nextLevel.color }} />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Next Achievement</p>
                    <h4 className="text-xl font-bold" style={{ color: nextLevel.color }}>
                      {nextLevel.name} Level
                    </h4>
                    <p className="text-sm text-neutral-500 mt-1">
                      {nextLevel.threshold.toFixed(1)}% conversion rate
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: nextLevel.color }}>
                    {(nextLevel.threshold - current).toFixed(1)}%
                  </div>
                  <p className="text-sm text-neutral-500">remaining</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-neutral-500 mb-2">
                  <span>Current: {current.toFixed(1)}%</span>
                  <span>Target: {nextLevel.threshold.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${(current / nextLevel.threshold) * 100}%`,
                      background: `linear-gradient(90deg, ${nextLevel.color}, ${BRAND_COLORS.primary})`,
                      boxShadow: `0 0 20px ${nextLevel.color}`
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          {metrics && (metrics.visitors || metrics.customers) && (
            <div className="grid grid-cols-2 gap-4">
              {metrics.visitors && (
                <div 
                  className={`p-5 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                    darkMode ? 'bg-neutral-800/30' : 'bg-neutral-100/30'
                  }`}
                  style={{ borderLeft: `4px solid ${BRAND_COLORS.primary}` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Users size={20} style={{ color: BRAND_COLORS.primary }} />
                    <span className="text-xs text-neutral-400">Total</span>
                  </div>
                  <p className="text-2xl font-bold dark:text-white">{metrics.visitors.toLocaleString()}</p>
                  <p className="text-sm text-neutral-500 mt-1">Unique Visitors</p>
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="text-[#34D19C]">+12.5%</span>
                    <span className="text-neutral-400">vs last month</span>
                  </div>
                </div>
              )}
              
              {metrics.customers && (
                <div 
                  className={`p-5 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                    darkMode ? 'bg-neutral-800/30' : 'bg-neutral-100/30'
                  }`}
                  style={{ borderLeft: `4px solid ${BRAND_COLORS.success}` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <ShoppingCart size={20} style={{ color: BRAND_COLORS.success }} />
                    <span className="text-xs text-neutral-400">Converted</span>
                  </div>
                  <p className="text-2xl font-bold dark:text-white">{metrics.customers.toLocaleString()}</p>
                  <p className="text-sm text-neutral-500 mt-1">New Customers</p>
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="text-[#EE9C6C]">+8.3%</span>
                    <span className="text-neutral-400">vs last month</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Weekly Performance Chart */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold dark:text-white flex items-center gap-2">
                <Activity size={16} style={{ color: BRAND_COLORS.primary }} />
                Weekly Performance
              </h4>
              <button 
                className="text-sm flex items-center gap-1 hover:gap-2 transition-all duration-300"
                style={{ color: BRAND_COLORS.primary }}
              >
                View Details <ChevronRight size={14} />
              </button>
            </div>

            <div className="flex items-end justify-between h-32 gap-2">
              {weeklyData.map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                  <div 
                    className="w-full rounded-t-lg transition-all duration-300 group-hover:scale-105"
                    style={{ 
                      height: `${(value / maxValue) * 100}%`,
                      background: `linear-gradient(180deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.secondary})`,
                      opacity: 0.7 + (value / maxValue) * 0.3,
                      boxShadow: `0 0 20px ${BRAND_COLORS.primary}40`
                    }}
                  />
                  <span className="text-xs text-neutral-500">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                  </span>
                  <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: BRAND_COLORS.primary }}
                  >
                    {value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg" style={{ background: `${BRAND_COLORS.success}15` }}>
                <CheckCircle2 size={16} style={{ color: BRAND_COLORS.success }} />
              </div>
              <div>
                <p className="text-sm font-medium dark:text-white">Peak Hours</p>
                <p className="text-xs text-neutral-500">2PM - 5PM performs best</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg" style={{ background: `${BRAND_COLORS.accent}15` }}>
                <Info size={16} style={{ color: BRAND_COLORS.accent }} />
              </div>
              <div>
                <p className="text-sm font-medium dark:text-white">Mobile vs Desktop</p>
                <p className="text-xs text-neutral-500">68% mobile conversion</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="relative p-6 border-t border-neutral-200/20 dark:border-neutral-700/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Clock size={14} style={{ color: BRAND_COLORS.primary }} />
              <span>Last updated 5 mins ago</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={onClose}
                className="px-5 py-2.5 text-sm rounded-xl transition-all duration-300 hover:scale-105"
                style={{ 
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  color: darkMode ? '#fff' : '#000'
                }}
              >
                Close
              </button>
              
              <button 
                className="px-5 py-2.5 text-sm text-white rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 group"
                style={{ 
                  background: `linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.secondary})`,
                  boxShadow: `0 10px 20px -10px ${BRAND_COLORS.primary}`
                }}
              >
                <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

DetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  details: PropTypes.shape({
    current: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    statusIcon: PropTypes.node,
    statusColor: PropTypes.string,
    target: PropTypes.number.isRequired,
    thresholds: PropTypes.object.isRequired,
    metrics: PropTypes.object
  }).isRequired,
  darkMode: PropTypes.bool
};

// ========== SETTINGS MODAL ==========
export const SettingsModal = ({ isOpen, onClose, onSave, settings, darkMode, sections }) => {
  if (!isOpen) return null;

  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState('thresholds');

  // ✅ تحديث الإعدادات المحلية عند تغيير الـ props
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleThresholdChange = (level, value) => {
    setLocalSettings(prev => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [level]: parseFloat(value)
      }
    }));
  };

  const handleToggle = (key) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(localSettings);
    }
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(settings);
  };

  const tabs = [
    { id: 'thresholds', label: 'Thresholds', icon: <Target size={18} /> },
    { id: 'display', label: 'Display', icon: <Eye size={18} /> },
    { id: 'advanced', label: 'Advanced', icon: <Settings size={18} /> }
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'thresholds':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold dark:text-white mb-4 flex items-center gap-2">
                <Target size={18} style={{ color: BRAND_COLORS.primary }} />
                Conversion Rate Thresholds
              </h4>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                Set the percentage levels for each performance category (0% - 100%)
              </p>

              <div className="space-y-6">
                {/* Excellent Threshold */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BRAND_COLORS.success }} />
                      <span className="font-medium dark:text-white">Excellent</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: BRAND_COLORS.success }}>
                      {localSettings.thresholds.excellent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={localSettings.thresholds.excellent}
                    onChange={(e) => handleThresholdChange('excellent', e.target.value)}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(90deg, ${BRAND_COLORS.success} 0%, ${BRAND_COLORS.success} ${(localSettings.thresholds.excellent/100)*100}%, #e5e7eb ${(localSettings.thresholds.excellent/100)*100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>

                {/* Great Threshold */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BRAND_COLORS.primary }} />
                      <span className="font-medium dark:text-white">Great</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: BRAND_COLORS.primary }}>
                      {localSettings.thresholds.great}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={localSettings.thresholds.great}
                    onChange={(e) => handleThresholdChange('great', e.target.value)}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(90deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primary} ${(localSettings.thresholds.great/100)*100}%, #e5e7eb ${(localSettings.thresholds.great/100)*100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>

                {/* Good Threshold */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BRAND_COLORS.accent }} />
                      <span className="font-medium dark:text-white">Good</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: BRAND_COLORS.accent }}>
                      {localSettings.thresholds.good}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={localSettings.thresholds.good}
                    onChange={(e) => handleThresholdChange('good', e.target.value)}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(90deg, ${BRAND_COLORS.accent} 0%, ${BRAND_COLORS.accent} ${(localSettings.thresholds.good/100)*100}%, #e5e7eb ${(localSettings.thresholds.good/100)*100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>

                {/* Needs Work Threshold */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BRAND_COLORS.secondary }} />
                      <span className="font-medium dark:text-white">Needs Work</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: BRAND_COLORS.secondary }}>
                      {localSettings.thresholds.needsWork}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={localSettings.thresholds.needsWork}
                    onChange={(e) => handleThresholdChange('needsWork', e.target.value)}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(90deg, ${BRAND_COLORS.secondary} 0%, ${BRAND_COLORS.secondary} ${(localSettings.thresholds.needsWork/100)*100}%, #e5e7eb ${(localSettings.thresholds.needsWork/100)*100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Industry Benchmark */}
            <div className="pt-6 border-t border-neutral-200/20 dark:border-neutral-700/20">
              <h4 className="text-lg font-semibold dark:text-white mb-4 flex items-center gap-2">
                <Award size={18} style={{ color: BRAND_COLORS.success }} />
                Industry Benchmark
              </h4>
              
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">Target Rate</span>
                    <span className="font-bold" style={{ color: BRAND_COLORS.success }}>{localSettings.industryAverage}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={localSettings.industryAverage}
                    onChange={(e) => handleChange('industryAverage', parseFloat(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(90deg, ${BRAND_COLORS.success} 0%, ${BRAND_COLORS.success} ${(localSettings.industryAverage/100)*100}%, #e5e7eb ${(localSettings.industryAverage/100)*100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
                <div className="p-3 rounded-xl" style={{ background: `${BRAND_COLORS.success}15` }}>
                  <TrendingUp size={20} style={{ color: BRAND_COLORS.success }} />
                </div>
              </div>
            </div>
          </div>
        );

      case 'display':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold dark:text-white mb-4 flex items-center gap-2">
                <Eye size={18} style={{ color: BRAND_COLORS.primary }} />
                Display Options
              </h4>

              <div className="space-y-4">
                {/* Show Monthly Growth Toggle */}
                <div 
                  className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                    darkMode ? 'hover:bg-neutral-800/50' : 'hover:bg-neutral-100'
                  }`}
                  onClick={() => handleToggle('showMonthlyGrowth')}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ background: `${BRAND_COLORS.primary}15` }}>
                      <TrendingUp size={18} style={{ color: BRAND_COLORS.primary }} />
                    </div>
                    <div>
                      <p className="font-medium dark:text-white">Monthly Growth</p>
                      <p className="text-sm text-neutral-500">Show monthly growth trends</p>
                    </div>
                  </div>
                  <div 
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${
                      localSettings.showMonthlyGrowth ? 'bg-[#8B7ABA]' : 'bg-neutral-300 dark:bg-neutral-600'
                    }`}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full bg-white transform transition-all duration-300 mt-1 ${
                        localSettings.showMonthlyGrowth ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </div>
                </div>

                {/* Live Indicator Toggle */}
                <div 
                  className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                    darkMode ? 'hover:bg-neutral-800/50' : 'hover:bg-neutral-100'
                  }`}
                  onClick={() => handleToggle('showLiveIndicator')}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ background: `${BRAND_COLORS.accent}15` }}>
                      <Zap size={18} style={{ color: BRAND_COLORS.accent }} />
                    </div>
                    <div>
                      <p className="font-medium dark:text-white">Live Indicator</p>
                      <p className="text-sm text-neutral-500">Show real-time updates</p>
                    </div>
                  </div>
                  <div 
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${
                      localSettings.showLiveIndicator ? 'bg-[#EE9C6C]' : 'bg-neutral-300 dark:bg-neutral-600'
                    }`}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full bg-white transform transition-all duration-300 mt-1 ${
                        localSettings.showLiveIndicator ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </div>
                </div>

                {/* Compact Mode Toggle */}
                <div 
                  className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                    darkMode ? 'hover:bg-neutral-800/50' : 'hover:bg-neutral-100'
                  }`}
                  onClick={() => handleToggle('compactMode')}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ background: `${BRAND_COLORS.secondary}15` }}>
                      <Maximize2 size={18} style={{ color: BRAND_COLORS.secondary }} />
                    </div>
                    <div>
                      <p className="font-medium dark:text-white">Compact Mode</p>
                      <p className="text-sm text-neutral-500">Optimize for mobile devices</p>
                    </div>
                  </div>
                  <div 
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${
                      localSettings.compactMode ? 'bg-[#F08FAE]' : 'bg-neutral-300 dark:bg-neutral-600'
                    }`}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full bg-white transform transition-all duration-300 mt-1 ${
                        localSettings.compactMode ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold dark:text-white mb-4 flex items-center gap-2">
                <Settings size={18} style={{ color: BRAND_COLORS.primary }} />
                Animation Settings
              </h4>

              <div className="space-y-6">
                {/* Animation Speed Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">Animation Speed</span>
                    <span className="font-bold" style={{ color: BRAND_COLORS.primary }}>{localSettings.animationSpeed}ms</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="3000"
                    step="100"
                    value={localSettings.animationSpeed}
                    onChange={(e) => handleChange('animationSpeed', parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(90deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primary} ${((localSettings.animationSpeed-500)/2500)*100}%, #e5e7eb ${((localSettings.animationSpeed-500)/2500)*100}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-neutral-500 mt-2">
                    <span>⚡ Fast (500ms)</span>
                    <span>🐢 Slow (3000ms)</span>
                  </div>
                </div>

                {/* Custom Colors Section */}
                <div className="pt-6 border-t border-neutral-200/20 dark:border-neutral-700/20">
                  <h4 className="text-lg font-semibold dark:text-white mb-4 flex items-center gap-2">
                    <Palette size={18} style={{ color: BRAND_COLORS.accent }} />
                    Theme Colors
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(levelColors).map(([level, color]) => (
                      <div key={level} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${color}10` }}>
                        <div 
                          className="w-8 h-8 rounded-lg cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        />
                        <div>
                          <p className="text-sm font-medium dark:text-white capitalize">{level}</p>
                          <p className="text-xs" style={{ color }}>{color}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      <div 
        className={`relative w-full max-w-2xl rounded-3xl shadow-2xl transform transition-all duration-500 scale-100 overflow-hidden ${
          darkMode 
            ? 'bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800' 
            : 'bg-gradient-to-br from-white via-white to-neutral-50'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* خلفية زخرفية */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full" style={{ background: `radial-gradient(circle, ${BRAND_COLORS.primary} 0%, transparent 70%)` }} />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full" style={{ background: `radial-gradient(circle, ${BRAND_COLORS.success} 0%, transparent 70%)` }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full" style={{ background: `radial-gradient(circle, ${BRAND_COLORS.secondary} 0%, transparent 70%)` }} />
        </div>

        {/* Header */}
        <div className="relative">
          <div 
            className="absolute inset-0"
            style={{ 
              background: `linear-gradient(135deg, ${BRAND_COLORS.primary}15, ${BRAND_COLORS.secondary}15, ${BRAND_COLORS.accent}15, ${BRAND_COLORS.success}15)`
            }} 
          />
          
          <div className="relative p-8 border-b border-neutral-200/20 dark:border-neutral-700/20">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="p-4 rounded-2xl shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${BRAND_COLORS.primary}20, ${BRAND_COLORS.secondary}10)`,
                    boxShadow: `0 10px 30px -10px ${BRAND_COLORS.primary}80`
                  }}
                >
                  <Sliders size={28} style={{ color: BRAND_COLORS.primary }} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold dark:text-white">Widget Settings</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2 mt-1">
                    <Zap size={14} style={{ color: BRAND_COLORS.accent }} />
                    Customize your conversion rate widget
                  </p>
                </div>
              </div>
              
              <button 
                onClick={onClose} 
                className={`p-3 rounded-xl transition-all duration-300 hover:rotate-90 ${
                  darkMode 
                    ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' 
                    : 'hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'text-white shadow-lg'
                      : darkMode
                        ? 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                  style={activeTab === tab.id ? {
                    background: `linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.secondary})`,
                    boxShadow: `0 10px 20px -10px ${BRAND_COLORS.primary}`
                  } : {}}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>

        {/* Footer Actions */}
        <div className="relative p-6 border-t border-neutral-200/20 dark:border-neutral-700/20">
          <div className="flex items-center justify-between">
            <button
              onClick={handleReset}
              className="px-6 py-3 text-sm rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              style={{ 
                background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                color: darkMode ? '#fff' : '#000'
              }}
            >
              <RefreshCw size={16} />
              Reset
            </button>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-3 text-sm rounded-xl transition-all duration-300 hover:scale-105"
                style={{ 
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  color: darkMode ? '#fff' : '#000'
                }}
              >
                Cancel
              </button>
              
              <button 
                onClick={handleSave}
                className="px-6 py-3 text-sm text-white rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 group"
                style={{ 
                  background: `linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.secondary})`,
                  boxShadow: `0 10px 20px -10px ${BRAND_COLORS.primary}`
                }}
              >
                <Save size={16} className="group-hover:scale-110 transition-transform" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

SettingsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  darkMode: PropTypes.bool,
  sections: PropTypes.array
};

// ========== CONFIRMATION MODAL ==========
export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  darkMode
}) => {
  if (!isOpen) return null;

  const getTypeConfig = () => {
    switch(type) {
      case 'danger':
        return {
          icon: <AlertCircle size={24} />,
          gradient: `linear-gradient(135deg, ${BRAND_COLORS.secondary}, ${BRAND_COLORS.accent})`,
          color: BRAND_COLORS.secondary
        };
      case 'warning':
        return {
          icon: <AlertCircle size={24} />,
          gradient: `linear-gradient(135deg, ${BRAND_COLORS.accent}, ${BRAND_COLORS.primary})`,
          color: BRAND_COLORS.accent
        };
      default:
        return {
          icon: <Info size={24} />,
          gradient: `linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.success})`,
          color: BRAND_COLORS.primary
        };
    }
  };

  const config = getTypeConfig();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className={`relative w-full max-w-md rounded-3xl shadow-2xl transform transition-all duration-500 scale-100 overflow-hidden ${
          darkMode 
            ? 'bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800' 
            : 'bg-gradient-to-br from-white via-white to-neutral-50'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="absolute inset-0 opacity-5"
          style={{ background: `radial-gradient(circle at 30% 50%, ${config.color} 0%, transparent 70%)` }}
        />

        <div className="relative p-8 text-center">
          <div 
            className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center transform transition-all duration-500 hover:scale-110 hover:rotate-3"
            style={{ 
              background: `${config.color}15`,
              color: config.color,
              boxShadow: `0 20px 40px -15px ${config.color}`
            }}
          >
            {config.icon}
          </div>

          <h3 className="text-2xl font-bold mb-3 dark:text-white">{title}</h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed">
            {message}
          </p>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105"
              style={{ 
                background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                color: darkMode ? '#fff' : '#000'
              }}
            >
              {cancelText}
            </button>
            
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 px-6 py-3.5 text-sm font-medium text-white rounded-xl transition-all duration-300 hover:scale-105"
              style={{ 
                background: config.gradient,
                boxShadow: `0 10px 20px -10px ${config.color}`
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  type: PropTypes.oneOf(['info', 'warning', 'danger']),
  darkMode: PropTypes.bool
};

// إضافة CSS للـ scrollbar المخصص
const style = document.createElement('style');
style.textContent = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: ${BRAND_COLORS.primary}40;
    border-radius: 20px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: ${BRAND_COLORS.primary}60;
  }
`;
if (!document.getElementById('custom-scrollbar-style')) {
  style.id = 'custom-scrollbar-style';
  document.head.appendChild(style);
}