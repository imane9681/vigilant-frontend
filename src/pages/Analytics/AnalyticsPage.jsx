// frontend/src/pages/Analytics/AnalyticsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import {
  DollarSign, ShoppingBag, Users, Target,
  TrendingUp, TrendingDown, Calendar, Download,
  RefreshCw, Search, ChevronDown, MoreVertical,
  BarChart3, PieChart, LineChart, Activity,
  Globe, Mail, ExternalLink, Share2, Network,
  Smartphone, Headphones, Cpu, Timer, Eye,
  Package, Shield, Clock, ArrowUpRight,
  ArrowDownRight, Maximize2, Minimize2,
  Filter, Settings, AlertCircle, CheckCircle,
  Percent, ShoppingCart, Tag, Info,
  CalendarDays, CalendarRange, Award, Database,
  CreditCard, Layers, Zap, Star, Award as AwardIcon,
  ChevronRight, TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon, List, Grid
} from 'lucide-react';

// استيراد المكونات
import MetricCard from '../Dashboard/components/MetricCard';
import SalesChart from '../Dashboard/components/SalesChart';
import PieChartComponent from '../Dashboard/components/PieChartComponent';
import ConversionRateCircle from '../Dashboard/components/ConversionRateCircle';
import ComparisonLineChart from './components/ComparisonLineChart';
import SalesHeatmap from './components/SalesHeatmap';
import ScatterPlotComponent from './components/ScatterPlotComponent';
import GaugeChartComponent from './components/GaugeChartComponent';
import KeyMetricsPanel from './components/KeyMetricsPanel';
import TrafficSources from './components/TrafficSources';
import { analyticsService, productService, orderService, customerService, categoryService } from '../../services/api';

// ✅ ✅ ✅ ألوان المشروع
const COLORS = {
  primary: '#8B7ABA',
  secondary: '#F08FAE',
  accent: '#EE9C6C',
  success: '#34D19C',
  gradient: 'linear-gradient(135deg, #8B7ABA 0%, #F08FAE 50%, #EE9C6C 100%)',
};

// ✅ ✅ ✅ الألوان الموسعة للفئات (نفس Dashboard)
const CATEGORY_COLORS = [
  '#8B7ABA', '#F08FAE', '#EE9C6C', '#34D19C',
  '#3B82F6', '#6366F1', '#8B5CF6', '#7C3AED', '#4F46E5', '#2563EB',
  '#10B981', '#059669', '#34D399', '#06B6D4', '#0EA5E9', '#22D3EE',
  '#F59E0B', '#F97316', '#FB923C', '#EAB308', '#D97706', '#FCD34D',
  '#EF4444', '#DC2626', '#EC4899', '#F43F5E', '#FB7185', '#BE185D',
  '#A78BFA', '#C084FC', '#7C3AED',
  '#78716C', '#92400E', '#B45309',
  '#6B7280', '#4B5563', '#9CA3AF',
];

// ✅ ✅ ✅ دالة الحصول على لون الفئة
const getCategoryColor = (category, fallbackIndex = 0) => {
  if (category?.color) {
    if (category.color.startsWith('#')) {
      return category.color;
    }
    const colorMap = {
      'primary': '#8B7ABA',
      'secondary': '#F08FAE',
      'accent': '#EE9C6C',
      'success': '#34D19C'
    };
    return colorMap[category.color] || '#8B7ABA';
  }
  return CATEGORY_COLORS[fallbackIndex % CATEGORY_COLORS.length];
};

const AnalyticsPage = ({ darkMode }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [orderStatus, setOrderStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const [salesData, setSalesData] = useState({ data: [], growth: 0 });
  
  const [analyticsData, setAnalyticsData] = useState({
    metrics: {
      totalRevenue: '0',
      totalOrders: '0',
      avgOrderValue: '0',
      conversionRate: '0%',
      bounceRate: '0%',
      avgSession: '0m 0s',
      newCustomers: '0',
      returningCustomers: '0'
    },
    growth: {
      revenue: '+0%',
      orders: '+0%',
      conversion: '+0%',
      customers: '+0%',
      session: '+0s',
      bounce: '-0%'
    },
    categories: [],
    trafficSources: [],
    conversionMetrics: {
      conversionRate: '0%',
      visitors: 0,
      customers: 0
    },
    comparisonData: [],
    scatterData: [],
    gaugeMetrics: {
      performance: 0,
      satisfaction: 0,
      efficiency: 0
    },
    stackedData: []
  });

  const timeRangeOptions = [
    { value: 'week', label: 'This Week', icon: CalendarDays },
    { value: 'month', label: 'This Month', icon: Calendar },
    { value: 'quarter', label: 'This Quarter', icon: CalendarRange },
    { value: 'year', label: 'This Year', icon: Calendar },
    { value: 'all', label: 'All Time', icon: CalendarRange }
  ];

  // ✅ ✅ ✅ دالة جلب البيانات (محسنة مثل Dashboard)
  const fetchAnalyticsData = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
        setRefreshKey(prev => prev + 1);
      }

      console.log('📊 Analytics: Fetching data...', { forceRefresh, timeRange, orderStatus });

      const [dashboardMetrics, salesResponse, ordersResponse, productsResponse, customersResponse, categoriesResponse] = await Promise.all([
        analyticsService.getDashboardMetrics(),
        analyticsService.getSalesData({ period: timeRange, status: orderStatus }),
        orderService.getAll({ page_size: 100 }),
        productService.getAll(),
        customerService.getAll(),
        categoryService.getAll()
      ]);

      console.log('📊 Dashboard Metrics:', dashboardMetrics.data);
      console.log('📈 Sales Response:', salesResponse.data);

      // ✅ معالجة بيانات المبيعات
      let salesDataResult = { data: [], growth: 0 };
      
      if (salesResponse.data) {
        if (salesResponse.data.data && Array.isArray(salesResponse.data.data)) {
          salesDataResult = {
            data: salesResponse.data.data,
            growth: salesResponse.data.growth || 0
          };
        } else if (Array.isArray(salesResponse.data)) {
          salesDataResult = {
            data: salesResponse.data,
            growth: 0
          };
        }
      }
      
      setSalesData(salesDataResult);

      const products = productsResponse.data.results || productsResponse.data;
      const orders = ordersResponse.data.results || ordersResponse.data;
      const customers = customersResponse.data.results || customersResponse.data;
      
      let apiCategories = [];
      if (categoriesResponse.data) {
        if (Array.isArray(categoriesResponse.data)) {
          apiCategories = categoriesResponse.data;
        } else if (categoriesResponse.data.results && Array.isArray(categoriesResponse.data.results)) {
          apiCategories = categoriesResponse.data.results;
        }
      }

      // ============================================
      // ✅ حساب المقاييس (نفس Dashboard)
      // ============================================
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const monthlyOrders = orders.filter(o => {
        const date = new Date(o.created_at);
        return isWithinInterval(date, { start: monthStart, end: monthEnd });
      });

      const totalRevenue = monthlyOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      const totalOrders = monthlyOrders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      const newCustomers = customers.filter(c => {
        const date = new Date(c.created_at);
        return isWithinInterval(date, { start: monthStart, end: monthEnd });
      }).length;

      const conversionRate = totalOrders > 0 && customers.length > 0 
        ? (totalOrders / customers.length) * 100 
        : 0;

      // ✅ حساب النمو
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      
      const lastMonthOrders = orders.filter(o => {
        const date = new Date(o.created_at);
        return date >= lastMonthStart && date <= lastMonthEnd;
      });
      
      const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      
      const revenueGrowth = lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
      const ordersGrowth = lastMonthOrders.length > 0 ? ((totalOrders - lastMonthOrders.length) / lastMonthOrders.length) * 100 : 0;

      const bounceRate = orders.length > 0 
        ? (orders.filter(o => o.status === 'cancelled').length / orders.length) * 100 
        : 0;

      const avgSession = orders.length > 0 
        ? Math.floor(orders.reduce((sum, o) => sum + (o.items?.length || 1), 0) / orders.length * 2)
        : 0;

      // ============================================
      // ✅ ✅ ✅ تحليل الفئات - النسبة من الإيرادات (نفس Dashboard)
      // ============================================
      
      // ✅ حساب المبيعات لكل منتج
      const productSales = {};
      orders.forEach(order => {
        if (order.items && order.items.length > 0) {
          order.items.forEach(item => {
            const productName = item.product_name || 'Unknown';
            const quantity = item.quantity || 0;
            if (!productSales[productName]) {
              productSales[productName] = 0;
            }
            productSales[productName] += quantity;
          });
        }
      });

      // ✅ بناء خريطة الفئات
      const categoryMap = new Map();
      const categoryNameMap = {};
      const categoryParentMap = {};
      const categoryColorMap = {};

      apiCategories.forEach(cat => {
        categoryNameMap[cat.id] = cat.name;
        categoryParentMap[cat.id] = cat.parent;
        categoryColorMap[cat.id] = cat.color || null;
      });

      // ✅ إضافة جميع الفئات من API مع أيقوناتها وألوانها
      apiCategories.forEach(cat => {
        const categoryName = cat.name;
        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, {
            value: 0,
            count: 0,
            revenue: 0,
            products: [],
            parentId: cat.parent,
            isMain: !cat.parent,
            categoryId: cat.id,
            sales: 0,
            icon: cat.icon || null,
            color: cat.color || null
          });
        }
      });

      // ✅ تجميع المنتجات حسب الفئة
      products.forEach(p => {
        let categoryId = p.category;
        let categoryName = 'Uncategorized';
        let parentId = null;
        
        if (categoryId) {
          if (typeof categoryId === 'number' || (typeof categoryId === 'string' && !isNaN(categoryId))) {
            categoryName = categoryNameMap[categoryId] || `Category ${categoryId}`;
            parentId = categoryParentMap[categoryId] || null;
          } else if (typeof categoryId === 'object' && categoryId !== null) {
            categoryName = categoryId.name || categoryNameMap[categoryId.id] || `Category ${categoryId.id}`;
            parentId = categoryId.parent || categoryParentMap[categoryId.id] || null;
          } else if (typeof categoryId === 'string') {
            categoryName = categoryId;
            const foundCat = apiCategories.find(c => c.name === categoryId);
            if (foundCat) {
              parentId = foundCat.parent;
            }
          }
        }
        
        if (categoryName && categoryMap.has(categoryName)) {
          const existing = categoryMap.get(categoryName);
          const quantity = p.quantity || 0;
          const price = parseFloat(p.price) || 0;
          const revenue = price * quantity;
          
          existing.value += quantity;
          existing.count += 1;
          existing.revenue += revenue;
          existing.products.push(p);
          existing.sales += productSales[p.name] || 0;
          
          if (parentId && !existing.parentId) {
            existing.parentId = parentId;
          }
          categoryMap.set(categoryName, existing);
        }
      });

      // ✅ ✅ ✅ حساب إجمالي الإيرادات لكل فئة رئيسية
      const categoriesList = [];
      
      // ✅ الحصول على الفئات الرئيسية فقط
      const mainCategoriesList = Array.from(categoryMap.entries()).filter(([name, data]) => data.isMain);

      // ✅ ✅ ✅ حساب إجمالي الإيرادات الكلي (من جميع الفئات الرئيسية)
      const totalAllRevenue = mainCategoriesList.reduce((sum, [name, data]) => {
        return sum + (data.revenue || 0);
      }, 0);

      console.log(`📊 Total All Revenue: $${totalAllRevenue.toLocaleString()}`);

      mainCategoriesList.forEach(([name, data], index) => {
        // ✅ ✅ ✅ استبعاد الفئات التي ليس لها منتجات أو إيرادات
        if (data.count === 0 && data.revenue === 0) {
          console.log(`⏭️ Skipping empty category: ${name} (no products)`);
          return;
        }

        let totalValue = data.value;
        let totalSales = data.sales || 0;
        let totalRevenue = data.revenue || 0;
        const subCategories = [];
        
        // ✅ جمع الفئات الفرعية (مع استبعاد الفارغة)
        categoryMap.forEach((subData, subName) => {
          if (!subData.isMain && (subData.parentId === data.categoryId || subData.parentId === name)) {
            // ✅ ✅ ✅ استبعاد الفئات الفرعية التي ليس لها منتجات أو إيرادات
            if (subData.count === 0 && subData.revenue === 0) {
              return;
            }
            
            totalValue += subData.value;
            totalRevenue += subData.revenue || 0;
            
            // ✅ حساب النسبة المئوية للفئة الفرعية من إجمالي الإيرادات
            const subPercentage = totalAllRevenue > 0 && subData.revenue > 0 
              ? Math.round((subData.revenue / totalAllRevenue) * 100) 
              : 0;
            
            // ✅ ✅ ✅ استخدام لون الفئة الفرعية من API
            const subColor = getCategoryColor({
              color: subData.color,
              id: subData.categoryId
            });
            
            subCategories.push({
              id: `${index + 1}.${subCategories.length + 1}`,
              name: subName,
              value: subPercentage,
              color: subColor,
              parentId: data.categoryId,
              parentName: name,
              isMain: false,
              isSub: true,
              sales: subData.sales || 0,
              revenue: `$${subData.revenue.toLocaleString()}`,
              trend: '+5%',
              isPositive: true,
              icon: subData.icon || null
            });
          }
        });
        
        // ✅ ✅ ✅ حساب النسبة المئوية من الإيرادات الكلية (وليس المبيعات)
        const percentage = totalAllRevenue > 0 ? Math.round((totalRevenue / totalAllRevenue) * 100) : 0;
        
        // ✅ ✅ ✅ استخدام لون الفئة من API
        const categoryColor = getCategoryColor({
          color: data.color,
          id: data.categoryId
        });
        
        categoriesList.push({
          id: index + 1,
          name: name,
          value: percentage,
          color: categoryColor,
          sales: totalSales,
          revenue: `$${totalRevenue.toLocaleString()}`,
          trend: '+8%',
          isPositive: true,
          icon: data.icon || null,
          productCount: data.count,
          totalProducts: data.products.length,
          isMain: true,
          parentId: null,
          parentName: null,
          isSub: false,
          subCategories: subCategories,
          totalValue: totalValue,
          totalRevenue: totalRevenue
        });
      });

      // ✅ ✅ ✅ ترتيب تنازلي حسب الإيرادات (وليس المبيعات)
      categoriesList.sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0));

      // ✅ ✅ ✅ إعادة حساب النسب للفئات الفرعية بعد الترتيب
      categoriesList.forEach(mainCat => {
        if (mainCat.subCategories && mainCat.subCategories.length > 0) {
          mainCat.subCategories.forEach(sub => {
            const subPercentage = totalAllRevenue > 0 && sub.sales > 0 
              ? Math.round((sub.sales / totalAllRevenue) * 100) 
              : 0;
            sub.value = subPercentage;
          });
        }
      });

      // ✅ ✅ ✅ التأكد من أن المجموع = 100% (فقط إذا كانت هناك فئات)
      if (categoriesList.length > 0) {
        const totalPercentage = categoriesList.reduce((sum, cat) => sum + cat.value, 0);
        if (Math.abs(totalPercentage - 100) > 0.1) {
          const diff = 100 - totalPercentage;
          categoriesList[0].value += diff;
          categoriesList[0].value = Math.round(categoriesList[0].value);
        }
      }

      console.log('📊 FINAL CATEGORIES (by Revenue, with colors from API):', categoriesList);

      // ============================================
      // ✅ مصادر الزوار
      // ============================================
      const totalCustomers = customers.length;
      const sourceDistribution = {};
      customers.forEach(c => {
        const source = c.source || c.referrer || 'Direct Traffic';
        sourceDistribution[source] = (sourceDistribution[source] || 0) + 1;
      });

      if (Object.keys(sourceDistribution).length === 0) {
        sourceDistribution['Organic Search'] = Math.round(totalCustomers * 0.35);
        sourceDistribution['Social Media'] = Math.round(totalCustomers * 0.25);
        sourceDistribution['Email Marketing'] = Math.round(totalCustomers * 0.20);
        sourceDistribution['Direct Traffic'] = Math.round(totalCustomers * 0.20);
      }

      const colorMap = {
        'Organic Search': '#8B7ABA',
        'Social Media': '#F08FAE',
        'Email Marketing': '#EE9C6C',
        'Direct Traffic': '#34D19C'
      };

      const iconMap = {
        'Organic Search': Globe,
        'Social Media': Share2,
        'Email Marketing': Mail,
        'Direct Traffic': ExternalLink
      };

      const trafficSources = Object.entries(sourceDistribution).map(([source, count]) => {
        const percentage = totalCustomers > 0 ? Math.round((count / totalCustomers) * 100) : 0;
        return {
          source,
          visitors: count,
          percentage,
          change: percentage > 20 ? '+8%' : percentage > 10 ? '+5%' : '+2%',
          color: colorMap[source] || '#8B7ABA',
          icon: iconMap[source] || Globe
        };
      });

      // ✅ حساب Satisfaction
      const satisfaction = customers.length > 0 
        ? parseFloat((orders.filter(o => o.status === 'delivered').length / Math.max(orders.length, 1) * 10).toFixed(1))
        : 0;

      // ✅ تحديث الحالة
      setAnalyticsData({
        metrics: {
          totalRevenue: `$${totalRevenue.toLocaleString()}`,
          totalOrders: totalOrders.toLocaleString(),
          avgOrderValue: `$${avgOrderValue.toFixed(2)}`,
          conversionRate: `${conversionRate.toFixed(1)}%`,
          bounceRate: `${bounceRate.toFixed(1)}%`,
          avgSession: `${avgSession}m 0s`,
          newCustomers: newCustomers.toLocaleString(),
          returningCustomers: (customers.length - newCustomers).toLocaleString()
        },
        growth: {
          revenue: `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%`,
          orders: `${ordersGrowth >= 0 ? '+' : ''}${ordersGrowth.toFixed(1)}%`,
          conversion: '0%',
          customers: '0%',
          session: '0%',
          bounce: '0%'
        },
        categories: categoriesList,
        trafficSources: trafficSources,
        conversionMetrics: {
          conversionRate: `${conversionRate.toFixed(1)}%`,
          visitors: customers.length,
          customers: totalOrders
        },
        comparisonData: [],
        scatterData: [],
        gaugeMetrics: {
          performance: Math.min(Math.round((totalRevenue / 100000) * 100), 100),
          satisfaction: satisfaction,
          efficiency: Math.min(Math.round((totalOrders / 500) * 100), 100)
        },
        stackedData: []
      });

      setLastUpdated(new Date().toLocaleString());

    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please refresh the page.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [timeRange, orderStatus]);

  // ✅ جلب البيانات عند التحميل
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // ✅ تحديث المخطط عند تغيير الفلتر
  useEffect(() => {
    if (!loading && timeRange && orderStatus) {
      console.log('🔄 Analytics: Filter changed, updating data...');
      fetchAnalyticsData(true);
    }
  }, [timeRange, orderStatus]);

  const handleTimeRangeChange = (newRange, forceRefresh = false) => {
    console.log('📊 Analytics: Time range changed to:', newRange);
    setTimeRange(newRange);
    if (forceRefresh) {
      fetchAnalyticsData(true);
    }
  };

  const handleOrderStatusChange = (newStatus, forceRefresh = false) => {
    console.log('📊 Analytics: Order status changed to:', newStatus);
    setOrderStatus(newStatus);
    if (forceRefresh) {
      fetchAnalyticsData(true);
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Analytics: Manual refresh triggered');
    fetchAnalyticsData(true);
  };

  if (loading) {
    return (
      <div className="space-y-6 mt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded-xl w-48 animate-pulse"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-xl w-64 animate-pulse"></div>
          </div>
          <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-xl w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse"></div>
          <div className="h-96 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl p-8 text-center ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button onClick={() => fetchAnalyticsData(true)} className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-2">
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={analyticsData.metrics.totalRevenue}
          icon={<DollarSign size={20} />}
          isPositive={true}
          subtitle="This month"
          darkMode={darkMode}
          variant="success"
          lightBgOpacity={0.6}
        />

        <MetricCard
          title="Total Orders"
          value={analyticsData.metrics.totalOrders}
          icon={<ShoppingBag size={20} />}
          isPositive={true}
          subtitle="This month"
          darkMode={darkMode}
          variant="primary"
          lightBgOpacity={0.6}
        />

        <MetricCard
          title="New Customers"
          value={analyticsData.metrics.newCustomers}
          icon={<Users size={20} />}
          isPositive={true}
          subtitle="This month"
          darkMode={darkMode}
          variant="secondary"
        />

        <MetricCard
          title="Conversion Rate"
          value={analyticsData.metrics.conversionRate}
          icon={<Target size={20} />}
          isPositive={true}
          subtitle="Visitor to customer"
          darkMode={darkMode}
          variant="warning"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-full col-span-2">
          <SalesChart 
            key={`sales-chart-${refreshKey}`}
            darkMode={darkMode} 
            salesData={salesData}
            onTimeRangeChange={handleTimeRangeChange}
            currentTimeRange={timeRange}
            onOrderStatusChange={handleOrderStatusChange}
            currentOrderStatus={orderStatus}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </div>
        <div className="h-full">
          <KeyMetricsPanel darkMode={darkMode} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div className="h-full col-span-4">
          <ComparisonLineChart darkMode={darkMode} />
        </div>
        <div className="h-full col-span-3">
          <ScatterPlotComponent darkMode={darkMode} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-full">
          {/* ✅ ✅ ✅ استخدام PieChartComponent مع البيانات المحسوبة */}
          <PieChartComponent 
            darkMode={darkMode} 
            initialCategories={analyticsData.categories} 
          />
        </div>
        <div className="h-full">
          <ConversionRateCircle 
            metrics={analyticsData.conversionMetrics}
            darkMode={darkMode}
            thresholds={{
              excellent: 70,
              great: 50,
              good: 30,
              needsWork: 0
            }}
            industryAverage={4.5}
            showMonthlyGrowth={true}
            lastUpdated={lastUpdated || "just now"}
          />
        </div>
        <div className="h-full">
          <GaugeChartComponent darkMode={darkMode} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-full">
          <SalesHeatmap darkMode={darkMode} />
        </div>
        <div className="h-full">
          <TrafficSources darkMode={darkMode} data={analyticsData.trafficSources} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;