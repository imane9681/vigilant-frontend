// frontend/src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import {
  DollarSign, ShoppingBag, Users, Database,
  AlertTriangle, Star, BarChart3, Clock,
  TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon,
  BarChart as BarChartIcon, Calendar, Filter,
  Download, Eye, ExternalLink, Package, Bell,
  CheckCircle, Target
} from 'lucide-react';

import MetricCard from './components/MetricCard';
import SystemMetricCard from './components/SystemMetricCard';
import ConversionRateCircle from './components/ConversionRateCircle';
import SalesChart from './components/SalesChart';
import RecentOrdersTable from './components/RecentOrdersTable';
import ProductCalendar from './components/Calendar/ProductCalendar';
import PieChartComponent from './components/PieChartComponent';
import StockAlerts from './components/StockAlerts';
import UpdatesWidget from './components/UpdatesWidget';
import TopProductsWidget from './components/TopProductsWidget';
import { analyticsService, productService, orderService, customerService, categoryService } from '../../services/api';

const Dashboard = ({ darkMode }) => {
  const [metrics, setMetrics] = useState({
    totalRevenue: '0',
    totalOrders: 0,
    newCustomers: 0,
    conversionRate: '0%',
    avgOrderValue: '0',
    inventoryValue: '0'
  });
  const [salesData, setSalesData] = useState({ data: [], growth: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [orderStatus, setOrderStatus] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // ✅ ألوان المشروع
  const colors = {
    primary: '#8B7ABA',
    secondary: '#F08FAE',
    accent: '#EE9C6C',
    success: '#34D19C'
  };

  // ✅ ✅ ✅ دالة للحصول على لون الفئة (من API أو fallback)
  const getCategoryColor = (category) => {
    // ✅ 1. إذا كان هناك لون محدد في الفئة، استخدمه
    if (category?.color) {
      // ✅ إذا كان اللون على شكل Hex (#...)
      if (category.color.startsWith('#')) {
        return category.color;
      }
      // ✅ إذا كان اللون هو اسم من الأسماء المعروفة
      const colorMap = {
        'primary': '#8B7ABA',
        'secondary': '#F08FAE',
        'accent': '#EE9C6C',
        'success': '#34D19C'
      };
      return colorMap[category.color] || '#8B7ABA';
    }
    
    // ✅ 2. إذا لم يكن هناك لون، استخدم fallback
    const fallbackColors = ['#8B7ABA', '#F08FAE', '#EE9C6C', '#34D19C', '#3B82F6', '#EF4444', '#F59E0B', '#10B981'];
    const index = Math.floor(Math.random() * fallbackColors.length);
    return fallbackColors[index % fallbackColors.length];
  };

  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
        setRefreshKey(prev => prev + 1);
      }
      
      console.log('📊 Dashboard: Fetching data...', { forceRefresh, timeRange, orderStatus });

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
      // ✅ حساب المقاييس الشهرية
      // ============================================
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const monthlyOrders = orders.filter(o => {
        const date = new Date(o.created_at);
        return isWithinInterval(date, { start: monthStart, end: monthEnd });
      });

      const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      const monthlyOrdersCount = monthlyOrders.length;
      const monthlyNewCustomers = customers.filter(c => {
        const date = new Date(c.created_at);
        return isWithinInterval(date, { start: monthStart, end: monthEnd });
      }).length;

      const inventoryValue = products.reduce((sum, p) => sum + (parseFloat(p.price) * (p.quantity || 0)), 0);
      const conversionRate = monthlyOrdersCount > 0 && customers.length > 0 
        ? (monthlyOrdersCount / customers.length) * 100 
        : 0;
      const avgOrderValue = monthlyOrdersCount > 0 ? monthlyRevenue / monthlyOrdersCount : 0;

      setMetrics({
        totalRevenue: monthlyRevenue.toLocaleString(),
        totalOrders: monthlyOrdersCount,
        newCustomers: monthlyNewCustomers,
        conversionRate: `${conversionRate.toFixed(1)}%`,
        avgOrderValue: avgOrderValue.toFixed(2),
        inventoryValue: inventoryValue.toLocaleString()
      });

      // ============================================
      // ✅ الطلبات الأخيرة
      // ============================================
      const formattedOrders = orders.slice(0, 5).map(order => ({
        id: order.id,
        order_number: order.order_number,
        customer: order.customer_name || 'Unknown',
        amount: `$${parseFloat(order.total_amount).toLocaleString()}`,
        status: order.status,
        date: new Date(order.created_at).toLocaleDateString(),
        items: order.items?.length || 0
      }));
      setRecentOrders(formattedOrders);

      // ============================================
      // ✅ أفضل المنتجات
      // ============================================
      const topProductsList = products
        .sort((a, b) => (b.sold_count || b.quantity || 0) - (a.sold_count || a.quantity || 0))
        .slice(0, 5)
        .map((p, index) => ({
          id: p.id,
          name: p.name,
          sales: p.sold_count || p.quantity || 0,
          revenue: `$${(parseFloat(p.price) * (p.sold_count || p.quantity || 0)).toLocaleString()}`,
          growth: '+12%',
          stock: p.quantity,
          category: p.category,
          rank: index + 1
        }));
      setTopProducts(topProductsList);

      // ============================================
      // ✅ تنبيهات المخزون
      // ============================================
      const lowStockProducts = products.filter(p => p.quantity <= 10 && p.quantity > 0);
      const outOfStockProducts = products.filter(p => p.quantity === 0);
      setStockAlerts([
        ...lowStockProducts.slice(0, 3).map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          current: p.quantity,
          threshold: 10,
          status: 'warning',
          daysLeft: Math.ceil(p.quantity / 5),
          salesTrend: -12
        })),
        ...outOfStockProducts.slice(0, 2).map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          current: 0,
          threshold: 10,
          status: 'out-of-stock',
          daysLeft: 0,
          salesTrend: -45
        }))
      ]);

      // ============================================
      // ✅ ✅ ✅ تحليل الفئات - النسبة من الإيرادات (النظام الاحترافي)
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
        // ✅ ✅ ✅ تخزين لون الفئة من API
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
            // ✅ ✅ ✅ تخزين لون الفئة من API
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
          return; // تخطي هذه الفئة
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
              return; // تخطي هذه الفئة الفرعية
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
              color: subColor, // ✅ استخدام لون الفئة من API
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
          color: categoryColor, // ✅ استخدام لون الفئة من API
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
          // ✅ إضافة الفرق إلى الفئة الأعلى إيراداً
          categoriesList[0].value += diff;
          categoriesList[0].value = Math.round(categoriesList[0].value);
        }
      }

      console.log('📊 FINAL CATEGORIES (by Revenue, with colors from API):', categoriesList);

      setCategories(categoriesList);
      setLastUpdated(new Date().toLocaleString());

    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [timeRange, orderStatus]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchDashboardData(true);
    }
  }, [timeRange, orderStatus]);

  const handleTimeRangeChange = (newRange, forceRefresh = false) => {
    setTimeRange(newRange);
    if (forceRefresh) {
      fetchDashboardData(true);
    }
  };

  const handleOrderStatusChange = (newStatus, forceRefresh = false) => {
    setOrderStatus(newStatus);
    if (forceRefresh) {
      fetchDashboardData(true);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  if (loading) {
    return (
      <div className="space-y-8 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`rounded-2xl p-6 animate-pulse ${darkMode ? 'bg-neutral-900/50' : 'bg-neutral-100'}`}>
              <div className="space-y-4">
                <div className={`h-4 rounded ${darkMode ? 'bg-neutral-800' : 'bg-neutral-200'} w-24`}></div>
                <div className={`h-10 rounded ${darkMode ? 'bg-neutral-800' : 'bg-neutral-200'} w-32`}></div>
              </div>
            </div>
          ))}
        </div>
        <div className="h-96 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl p-8 text-center ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
        <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button onClick={() => fetchDashboardData(true)} className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${metrics.totalRevenue}`}
          icon={<DollarSign size={20} />}
          isPositive={true}
          variant="success"
          subtitle="Monthly revenue"
          darkMode={darkMode}
          lightBgOpacity={0.6}
        />
        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders}
          icon={<ShoppingBag size={20} />}
          isPositive={true}
          variant="primary"
          subtitle="This month"
          darkMode={darkMode}
          lightBgOpacity={0.6}
        />
        <MetricCard
          title="New Customers"
          value={metrics.newCustomers}
          icon={<Users size={20} />}
          isPositive={true}
          variant="secondary"
          subtitle="This month"
          darkMode={darkMode}
        />
        <MetricCard
          title="Inventory Value"
          value={`$${metrics.inventoryValue}`}
          icon={<Database size={20} />}
          isPositive={true}
          variant="warning"
          subtitle="Current stock value"
          darkMode={darkMode}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
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
            <ConversionRateCircle metrics={metrics} darkMode={darkMode} />
            <PieChartComponent 
              darkMode={darkMode} 
              initialCategories={categories} 
            />
          </div>
          <RecentOrdersTable darkMode={darkMode} recentOrders={recentOrders} />
          <TopProductsWidget darkMode={darkMode} topProducts={topProducts} />
        </div>
        <div className="space-y-6">
          <ProductCalendar darkMode={darkMode} products={[]} />
          <SystemMetricCard darkMode={darkMode} asWidget={true} />
          <StockAlerts darkMode={darkMode} stockAlerts={stockAlerts} />
          <UpdatesWidget darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;