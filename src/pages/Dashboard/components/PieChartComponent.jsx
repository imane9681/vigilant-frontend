// src/pages/Dashboard/components/PieChartComponent.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  PieChart as PieChartIcon, 
  TrendingUp, 
  TrendingDown, 
  Smartphone,
  Headphones,
  Briefcase,
  Home,
  Clock,
  ChevronDown,
  Eye,
  X,
  Shirt,
  BookOpen,
  Dumbbell,
  Heart,
  Sparkles,
  Package,
  Laptop,
  Watch,
  Camera,
  Layers,
  FolderTree,
  FolderOpen,
  Gamepad2,
  Utensils,
  Coffee
} from 'lucide-react';
import IconWrapper from '../../../components/ui/IconWrapper';
import WidgetButtons from '../../../components/ui/WidgetButtons';
import WidgetSettings from '../../../components/ui/WidgetSettings';
import { useWidgetTimeRange } from '../../../hooks/useWidgetTimeRange';
import { useWidgetExport } from '../../../hooks/useWidgetExport';

// ✅ خريطة الأيقونات - تستخدم لتحويل اسم الأيقونة إلى مكون React
const categoryIcons = {
  'Electronics': Laptop,
  'Clothing': Shirt,
  'Books': BookOpen,
  'Home & Garden': Home,
  'Sports': Dumbbell,
  'Health': Heart,
  'Beauty': Sparkles,
  'Accessories': Headphones,
  'Office': Briefcase,
  'Other': Package,
  'Smartphones': Smartphone,
  'Laptops': Laptop,
  'Watches': Watch,
  'Cameras': Camera,
  'FolderTree': FolderTree,
  'Layers': Layers,
  'FolderOpen': FolderOpen,
  'Food & Beverages': Coffee,
  'Health & Beauty': Heart,
  'Toys & Games': Gamepad2,
  'Coffee': Coffee,
  'Gamepad2': Gamepad2,
  'Utensils': Utensils,
};

// ✅ ✅ ✅ الألوان الاحتياطية (فقط في حالة عدم وجود لون محدد)
const FALLBACK_COLORS = [
  '#8B7ABA', '#F08FAE', '#EE9C6C', '#34D19C', '#3B82F6',
  '#EF4444', '#F59E0B', '#10B981', '#6366F1', '#EC4899',
];

const PieChartComponent = ({ darkMode, initialCategories }) => {
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [expandedModalCategories, setExpandedModalCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showAllModal, setShowAllModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('Just now');
  
  const [settings, setSettings] = useState({
    showAllCategories: false,
    animationSpeed: 1200,
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const widgetRef = useRef(null);

  const { timeRange, setTimeRange } = useWidgetTimeRange('month');
  const { exportToPDF, exportToCSV, exportToImage } = useWidgetExport({
    widgetRef,
    fileName: 'sales_by_category_report',
    darkMode
  });

  // ✅ ✅ ✅ دالة الحصول على لون الفئة (من API أو fallback)
  const getCategoryColor = (category, index = 0) => {
    // ✅ 1. إذا كان هناك لون محدد في الفئة، استخدمه
    if (category?.color) {
      // ✅ إذا كان اللون على شكل اسم (primary, secondary, etc.)
      const colorMap = {
        'primary': '#8B7ABA',
        'secondary': '#F08FAE',
        'accent': '#EE9C6C',
        'success': '#34D19C'
      };
      // ✅ إذا كان اللون هو Hex (#...)
      if (category.color.startsWith('#')) {
        return category.color;
      }
      // ✅ إذا كان اللون هو اسم من الأسماء المعروفة
      return colorMap[category.color] || '#8B7ABA';
    }
    
    // ✅ 2. إذا لم يكن هناك لون، استخدم fallback
    return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
  };

  // ✅ ✅ ✅ دالة الحصول على الأيقونة من API فقط
  const getCategoryIconComponent = (category) => {
    // ✅ استخدام الأيقونة من API
    if (category?.icon && categoryIcons[category.icon]) {
      return categoryIcons[category.icon];
    }
    
    // ✅ إذا كان هناك اسم فئة، حاول العثور على أيقونة
    if (category?.name && categoryIcons[category.name]) {
      return categoryIcons[category.name];
    }
    
    // ✅ الأيقونة الافتراضية
    return FolderTree;
  };

  const toggleSubCategories = (categoryId) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleModalSubCategories = (categoryId) => {
    setExpandedModalCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // ✅ استخدام البيانات من Dashboard
  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      // ✅ ✅ ✅ تصفية الفئات الفارغة (التي ليس لها منتجات)
      const filteredCategories = initialCategories.filter(cat => {
        // ✅ استبعاد الفئات الرئيسية الفارغة
        if (cat.isMain && cat.productCount === 0 && cat.revenue === '$0') {
          return false;
        }
        
        // ✅ تصفية الفئات الفرعية الفارغة
        if (cat.subCategories && cat.subCategories.length > 0) {
          cat.subCategories = cat.subCategories.filter(sub => 
            sub.sales > 0 || sub.revenue !== '$0'
          );
        }
        
        return true;
      });

      const correctedCategories = filteredCategories.map(cat => {
        if (cat.isMain && cat.subCategories && cat.subCategories.length > 0) {
          const correctedSubs = cat.subCategories.map(sub => {
            const subPercentage = cat.sales > 0 && sub.sales > 0
              ? Math.round((sub.sales / cat.sales) * cat.value)
              : 0;
            return { ...sub, value: subPercentage };
          });
          return { ...cat, subCategories: correctedSubs };
        }
        return cat;
      });
      
      setCategories(correctedCategories);
      setLastUpdated(new Date().toLocaleString());
    } else {
      setCategories([]);
    }
  }, [initialCategories]);

  // ✅ ✅ ✅ الفئات المعروضة أسفل الدائرة (مع استبعاد الفارغة وترتيب حسب الإيرادات)
  const getDisplayedCategories = () => {
    let filtered = [...categories];
    // ✅ استبعاد الفئات التي ليس لها منتجات
    filtered = filtered.filter(cat => cat.productCount > 0 || cat.sales > 0);
    // ✅ ✅ ✅ ترتيب تنازلي حسب الإيرادات (وليس المبيعات)
    filtered.sort((a, b) => {
      const revenueA = parseFloat(String(a.revenue || '0').replace(/[$,]/g, ''));
      const revenueB = parseFloat(String(b.revenue || '0').replace(/[$,]/g, ''));
      return revenueB - revenueA;
    });
    return filtered.slice(0, 2);
  };

  // ✅ ✅ ✅ جميع الفئات للقائمة المنبثقة (مع استبعاد الفارغة وترتيب حسب الإيرادات)
  const getAllCategoriesForModal = () => {
    let allCats = [];
    categories.forEach(main => {
      // ✅ استبعاد الفئات الرئيسية الفارغة
      if (main.productCount === 0 && main.revenue === '$0') {
        return;
      }
      
      allCats.push({ 
        ...main, 
        isMain: true, 
        level: 0,
        isSub: false,
        isExpandedInModal: expandedModalCategories.includes(main.id)
      });
      
      if (expandedModalCategories.includes(main.id)) {
        main.subCategories?.forEach(sub => {
          // ✅ استبعاد الفئات الفرعية الفارغة
          if (sub.sales === 0 && sub.revenue === '$0') {
            return;
          }
          allCats.push({ 
            ...sub, 
            isMain: false, 
            level: 1, 
            parentName: main.name,
            isSub: true
          });
        });
      }
    });
    
    // ✅ ✅ ✅ ترتيب تنازلي حسب الإيرادات
    allCats.sort((a, b) => {
      const revenueA = parseFloat(String(a.revenue || '0').replace(/[$,]/g, ''));
      const revenueB = parseFloat(String(b.revenue || '0').replace(/[$,]/g, ''));
      return revenueB - revenueA;
    });
    
    return allCats;
  };

  // ✅ ✅ ✅ الفئات الرئيسية للقائمة المنبثقة (مع استبعاد الفارغة وترتيب حسب الإيرادات)
  const getMainCategoriesForModal = () => {
    const filtered = categories.filter(cat => 
      cat.isMain === true && 
      (cat.productCount > 0 || cat.sales > 0)
    );
    
    // ✅ ✅ ✅ ترتيب تنازلي حسب الإيرادات
    filtered.sort((a, b) => {
      const revenueA = parseFloat(String(a.revenue || '0').replace(/[$,]/g, ''));
      const revenueB = parseFloat(String(b.revenue || '0').replace(/[$,]/g, ''));
      return revenueB - revenueA;
    });
    
    return filtered;
  };

  const displayedCategories = getDisplayedCategories();
  const allCategoriesForModal = getAllCategoriesForModal();
  const mainCategoriesForModal = getMainCategoriesForModal();

  // ✅ حساب Total Sales
  const totalSales = categories.reduce((sum, cat) => {
    let total = sum + (cat.sales || 0);
    if (cat.subCategories && cat.subCategories.length > 0) {
      cat.subCategories.forEach(sub => {
        total += (sub.sales || 0);
      });
    }
    return total;
  }, 0);

  // ✅ دوال Settings
  const handleSaveSettings = (newSettings) => {
    setSettings({ ...settings, ...newSettings });
    setShowSettings(false);
  };

  const handleCancelSettings = () => {
    setShowSettings(false);
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  // ✅ معالج الوقت
  const handleTimeChange = useCallback((range) => {
    if (range && typeof range === 'string') {
      setTimeRange(range);
    }
  }, [setTimeRange]);

  // ✅ معالج WidgetButtons
  const handleMoreClick = useCallback((action) => {
    try {
      switch(action) {
        case 'settings':
          handleOpenSettings();
          break;
        case 'exportPDF':
          exportToPDF({
            timeRange,
            categories: categories.map(cat => ({
              name: cat.name,
              value: cat.value,
              sales: cat.sales,
              revenue: cat.revenue,
              trend: cat.trend
            })),
            totalSales: totalSales
          }, 'Sales by Category Report');
          break;
        case 'exportCSV':
          exportToCSV(categories.map(cat => ({
            Category: cat.name,
            Percentage: cat.value + '%',
            Sales: cat.sales,
            Revenue: cat.revenue,
            Trend: cat.trend
          })));
          break;
        case 'exportImage':
          exportToImage();
          break;
        case 'refresh':
          setCategories(categories);
          setLastUpdated(new Date().toLocaleString());
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error in handleMoreClick:', err);
    }
  }, [categories, timeRange, totalSales, exportToPDF, exportToCSV, exportToImage]);

  // ✅ ✅ ✅ رسم المخطط الدائري (مع استخدام ألوان الفئات من API)
  const renderPieChart = () => {
    let chartCategories = [];
    
    if (settings.showAllCategories) {
      const allCats = [];
      let colorIndex = 0;
      
      categories.forEach(main => {
        // ✅ ✅ ✅ استبعاد الفئات التي ليس لها منتجات أو إيرادات
        if (main.productCount === 0 && main.revenue === '$0') {
          return; // تخطي هذه الفئة
        }
        
        // ✅ ✅ ✅ استخدام لون الفئة من API
        const categoryColor = getCategoryColor(main, colorIndex);
        
        allCats.push({ 
          ...main, 
          isMain: true, 
          level: 0,
          color: categoryColor
        });
        colorIndex++;
        
        main.subCategories?.forEach(sub => {
          // ✅ ✅ ✅ استبعاد الفئات الفرعية الفارغة
          if (sub.sales === 0 && sub.revenue === '$0') {
            return; // تخطي هذه الفئة الفرعية
          }
          
          // ✅ ✅ ✅ استخدام لون الفئة الفرعية من API
          const subColor = getCategoryColor(sub, colorIndex);
          colorIndex++;
          
          allCats.push({ 
            ...sub, 
            isMain: false, 
            level: 1,
            color: subColor,
            icon: sub.icon || null
          });
        });
      });
      
      chartCategories = allCats.filter(cat => cat.value > 0);
    } else {
      // ✅ ✅ ✅ استبعاد الفئات الرئيسية الفارغة
      chartCategories = categories.filter(cat => 
        cat.isMain === true && 
        cat.value > 0 && 
        cat.productCount > 0
      );
      
      // ✅ ✅ ✅ تعيين الألوان من API للفئات الرئيسية
      chartCategories = chartCategories.map((cat, index) => ({
        ...cat,
        color: getCategoryColor(cat, index)
      }));
    }

    if (!chartCategories || chartCategories.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[220px]">
          <div className={`p-4 rounded-full ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'} mb-3`}>
            <PieChartIcon size={32} className={darkMode ? 'text-neutral-600' : 'text-neutral-400'} />
          </div>
          <p className={`text-sm font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            No categories available
          </p>
        </div>
      );
    }

    const size = 220;
    const radius = 80;
    const strokeWidth = 28;
    
    const pieData = chartCategories.map((cat, index) => ({
      ...cat,
      color: cat.color || getCategoryColor(cat, index),
      angle: (cat.value / 100) * 360,
      offset: chartCategories.slice(0, index).reduce((sum, c) => sum + (c.value / 100) * 360, 0)
    }));
    
    return (
      <div className="relative mx-auto" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {pieData.map((slice, index) => {
            const circumference = 2 * Math.PI * radius;
            const strokeDasharray = `${(slice.value / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -(slice.offset / 360) * circumference;
            
            return (
              <circle
                key={`slice-${slice.id}-${index}`}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300"
                style={{
                  opacity: activeCategory === slice.id ? 1 : activeCategory ? 0.3 : 1,
                  filter: activeCategory === slice.id ? `drop-shadow(0 0 8px ${slice.color})` : 'none',
                }}
                onMouseEnter={() => setActiveCategory(slice.id)}
                onMouseLeave={() => setActiveCategory(null)}
              />
            );
          })}
          
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth / 2}
            fill={darkMode ? '#1f2937' : '#ffffff'}
          />
        </svg>
        
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="font-bold text-[2.3rem]" style={{ color: '#8B7ABA' }}>
            {totalSales}
          </div>
          <div className={`text-sm font-bold mt-1 ${darkMode ? 'text-primary-300' : 'text-primary-300'}`}>
            Total Sales
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className={`relative rounded-2xl p-6 text-center min-h-[500px] flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border border-neutral-800' : 'bg-gradient-to-br from-white to-neutral-50 border border-neutral-200'}`}>
        <div>
          <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-500'}`}>{error}</p>
          <button onClick={() => setCategories([])} className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={widgetRef}
      className={`relative rounded-2xl p-4 sm:p-5 border transition-all duration-300 min-h-[500px] ${
          darkMode 
            ? 'bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-800 hover:border-primary-500/30' 
            : 'bg-gradient-to-br from-white to-neutral-50 border-neutral-200/80 hover:border-primary-200 shadow-lg hover:shadow-2xl'
        }`}      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-label="Sales by category visualization"
    >
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <IconWrapper darkMode={darkMode} isHovered={isHovered} variant="primary" size={20}>
            <PieChartIcon />
          </IconWrapper>
          <div>
            <h3 className={`font-bold text-base sm:text-lg ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              Sales by Category
            </h3>
            <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              {settings.showAllCategories ? 'All Categories' : 'Main Categories'}
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

      <div className="flex items-center justify-center mb-5">
        {renderPieChart()}
      </div>

      {/* ✅ فئتين فقط أسفل الدائرة (مرتبة حسب الإيرادات وبألوانها من API) */}
      <div className="space-y-3">
        {displayedCategories.map((category) => {
          const Icon = getCategoryIconComponent(category);
          const hasSubCategories = category.subCategories && category.subCategories.length > 0;
          const isExpanded = expandedCategories.includes(category.id);
          const isSub = category.isSub || false;
          // ✅ ✅ ✅ استخدام لون الفئة من API
          const categoryColor = getCategoryColor(category);
          
          return (
            <div key={`category-${category.id}`}>
              <div
                className={`relative rounded-xl px-4 py-3 transition-all duration-300 group ${
                  darkMode 
                    ? 'bg-gradient-to-r from-neutral-900/50 to-neutral-800/30 border border-neutral-700/30 hover:border-neutral-600/50' 
                    : 'bg-gradient-to-r from-white to-neutral-50 border border-neutral-200/50 hover:border-neutral-300 shadow-sm hover:shadow-md'
                } ${activeCategory === category.id ? 'ring-1 ring-opacity-30' : ''}`}
                style={{
                  paddingLeft: isSub ? '0' : '1rem',
                  marginLeft: isSub ? '3rem' : '0',
                  borderColor: activeCategory === category.id ? `${categoryColor}50` : undefined,
                  borderLeft: isSub ? `3px solid ${categoryColor}40` : 'none',
                  boxShadow: activeCategory === category.id ? `0 4px 16px ${categoryColor}15` : undefined
                }}
                onMouseEnter={() => setActiveCategory(category.id)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className={`p-2 rounded-lg transition-all duration-300 group-hover:scale-110 ${
                        darkMode ? 'bg-neutral-800/50' : 'bg-white shadow-sm'
                      }`}
                      style={{
                        background: darkMode ? `${categoryColor}20` : `${categoryColor}20`,
                        boxShadow: `0 4px 12px ${categoryColor}20`,
                        border: `1px solid ${categoryColor}${darkMode ? '50' : '40'}`,
                      }}
                    >
                      <Icon size={20} style={{ color: categoryColor }} />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-neutral-600'}`}>
                          {category.name}
                        </h4>
                        {category.isMain ? (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            darkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-100 text-primary-600'
                          }`}>
                            Main
                          </span>
                        ) : (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            darkMode ? 'bg-neutral-700 text-neutral-400' : 'bg-neutral-200 text-neutral-500'
                          }`}>
                            {category.parentName}
                          </span>
                        )}
                        {hasSubCategories && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            darkMode ? 'bg-neutral-700 text-neutral-400' : 'bg-neutral-200 text-neutral-500'
                          }`}>
                            {category.subCategories.length} sub
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`font-semibold ${darkMode ? 'text-neutral-400' : 'text-neutral-400'}`}>
                          {category.sales || 0} sales
                        </span>
                        <div className="w-1 h-1 rounded-full bg-neutral-400/40"></div>
                        <span className={`font-semibold ${darkMode ? 'text-neutral-300' : 'text-neutral-400'}`}>
                          {category.revenue || '$0'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div 
                      className="text-lg font-bold transition-all duration-300 group-hover:scale-110"
                      style={{ color: categoryColor }}
                    >
                      {category.value}%
                    </div>
                    
                    {hasSubCategories && (
                      <button
                        onClick={() => toggleSubCategories(category.id)}
                        className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                          darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100'
                        }`}
                      >
                        <ChevronDown 
                          size={16} 
                          className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                          style={{ color: categoryColor }}
                        />
                      </button>
                    )}
                  </div>
                </div>
                
                {activeCategory === category.id && (
                  <div 
                    className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-full transition-all duration-300"
                    style={{ backgroundColor: categoryColor }}
                  />
                )}
              </div>

              {/* ✅ الفئات الفرعية (مع استبعاد الفارغة واستخدام ألوانها من API) */}
              {isExpanded && hasSubCategories && (
                <div className="ml-11 mt-1 space-y-1.5 border-l-2 border-dashed border-neutral-300 dark:border-neutral-700 pl-4">
                  {category.subCategories
                    .filter(sub => sub.sales > 0 || sub.revenue !== '$0')
                    .map((sub) => {
                    const SubIcon = getCategoryIconComponent(sub);
                    // ✅ ✅ ✅ استخدام لون الفئة الفرعية من API
                    const subColor = getCategoryColor(sub);
                    
                    return (
                      <div
                        key={sub.id}
                        className={`relative rounded-lg px-3 py-2 transition-all duration-200 group ${
                          darkMode 
                            ? 'bg-neutral-800/30 hover:bg-neutral-700/30 border border-neutral-700/20' 
                            : 'bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/50'
                        }`}
                        style={{
                          borderLeft: `3px solid ${subColor}40`,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="p-1.5 rounded-lg"
                              style={{
                                background: darkMode ? `${subColor}20` : `${subColor}20`,
                              }}
                            >
                              <SubIcon size={14} style={{ color: subColor }} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                                  {sub.name}
                                </span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                                  darkMode ? 'bg-neutral-700 text-neutral-400' : 'bg-neutral-200 text-neutral-500'
                                }`}>
                                  {sub.parentName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px]">
                                <span className={`font-semibold ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                  {sub.sales || 0} sales
                                </span>
                              </div>
                            </div>
                          </div>
                          <div 
                            className="text-sm font-bold"
                            style={{ color: subColor }}
                          >
                            {sub.value}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ✅ زر "View All Categories" (مع استبعاد الفارغة) */}
      {categories.filter(cat => cat.productCount > 0 || cat.sales > 0).length > 2 && (
        <button
          onClick={() => {
            setShowAllModal(true);
            const allMainIds = categories
              .filter(cat => cat.isMain && (cat.productCount > 0 || cat.sales > 0))
              .map(cat => cat.id);
            setExpandedModalCategories(allMainIds);
          }}
          className={`w-full mt-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
            darkMode 
              ? 'bg-primary-800/80 hover:bg-primary-800/90 text-white border border-primary-800/80' 
              : 'bg-primary-800/80 hover:bg-primary-800/90 text-white border border-primary-800/80'
          }`}
        >
          <Eye size={16} />
          View All Categories ({mainCategoriesForModal.length})
        </button>
      )}

      <div className={`border-t mt-[1.15rem] pt-4 ${darkMode ? 'border-neutral-700/50' : 'border-neutral-200'}`}>
        <div className={`flex items-center justify-center gap-2 text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            <Clock size={12}  />
            <span>Updated: {lastUpdated}</span>
        </div>
      </div>

      {/* ✅ القائمة المنبثقة (مع استبعاد الفارغة وترتيب حسب الإيرادات واستخدام الألوان من API) */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div 
            className={`relative w-full max-w-md rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden ${
              darkMode ? 'bg-neutral-800' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                All Categories ({allCategoriesForModal.length})
              </h3>
              <button
                onClick={() => {
                  setShowAllModal(false);
                  setExpandedModalCategories([]);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100'
                }`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-2">
              {allCategoriesForModal.map((category) => {
                const Icon = getCategoryIconComponent(category);
                const isMain = category.isMain;
                const isSub = category.isSub;
                const hasSubCategories = !isSub && category.subCategories && category.subCategories.length > 0;
                const isExpandedInModal = expandedModalCategories.includes(category.id);
                // ✅ ✅ ✅ استخدام لون الفئة من API
                const categoryColor = getCategoryColor(category);
                
                return (
                  <div
                    key={category.id}
                    className={`relative rounded-xl px-4 py-3 transition-all duration-300 group ${
                      darkMode 
                        ? 'bg-gradient-to-r from-neutral-900/50 to-neutral-800/30 border border-neutral-700/30 hover:border-neutral-600/50' 
                        : 'bg-gradient-to-r from-white to-neutral-50 border border-neutral-200/50 hover:border-neutral-300 shadow-sm hover:shadow-md'
                    }`}
                    style={{
                      paddingLeft: isSub ? '2.5rem' : '1rem',
                      borderColor: activeCategory === category.id ? `${categoryColor}50` : undefined,
                      borderLeft: isSub ? `3px solid ${categoryColor}40` : 'none',
                      marginTop: isSub ? '2px' : '4px'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className={`p-2 rounded-lg transition-all duration-300 group-hover:scale-110 ${
                            darkMode ? 'bg-neutral-800/50' : 'bg-white shadow-sm'
                          }`}
                          style={{
                            background: darkMode ? `${categoryColor}20` : `${categoryColor}20`,
                            border: `1px solid ${categoryColor}${darkMode ? '50' : '40'}`,
                            marginLeft: isSub ? '0.5rem' : '0'
                          }}
                        >
                          <Icon size={18} style={{ color: categoryColor }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-neutral-700'}`}>
                              {category.name}
                            </h4>
                            {isMain ? (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                                darkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-100 text-primary-600'
                              }`}>
                                Main
                              </span>
                            ) : (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                                darkMode ? 'bg-neutral-700 text-neutral-400' : 'bg-neutral-200 text-neutral-500'
                              }`}>
                                {category.parentName}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px]">
                            <span className={`font-semibold ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                              {category.sales || 0} sales
                            </span>
                            {isSub && (
                              <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                                darkMode ? 'bg-neutral-700 text-neutral-400' : 'bg-neutral-200 text-neutral-500'
                              }`}>
                                Sub
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="text-base font-bold"
                          style={{ color: categoryColor }}
                        >
                          {category.value}%
                        </div>
                        {isMain && hasSubCategories && (
                          <button
                            onClick={() => toggleModalSubCategories(category.id)}
                            className={`p-1 rounded-lg transition-all duration-200 hover:scale-110 ${
                              darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100'
                            }`}
                          >
                            <ChevronDown 
                              size={14} 
                              className={`transition-transform duration-300 ${isExpandedInModal ? 'rotate-180' : ''}`}
                              style={{ color: categoryColor }}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className={`p-3 border-t ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
              <button
                onClick={() => {
                  setShowAllModal(false);
                  setExpandedModalCategories([]);
                }}
                className="w-full py-2 rounded-lg font-medium bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Settings Modal */}
      <WidgetSettings
        isOpen={showSettings}
        onClose={handleCancelSettings}
        onSave={handleSaveSettings}
        settings={settings}
        darkMode={darkMode}
        title="Category Display Settings"
        description="Customize how categories are displayed"
        sections={[
          {
            id: 'categoryDisplay',
            type: 'categoryDisplay',
            title: 'Category Display',
            description: 'Choose which categories to show in the chart'
          }
        ]}
      />
    </div>
  );
};

export default PieChartComponent;