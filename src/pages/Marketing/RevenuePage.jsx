// src/pages/Marketing/RevenuePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, TrendingUp, CreditCard,
  Download, ShoppingBag
} from 'lucide-react';
import MetricCard from '../Dashboard/components/MetricCard';
import RevenueTrendChart from './components/RevenueTrendChart';
import PaymentMethodsChart from './components/PaymentMethodsChart';
import TopProductsTable from './components/TopProductsTable';
import { orderService, analyticsService, productService } from '../../services/api';
import { startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';

const RevenuePage = ({ darkMode }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState({});
  const [ordersData, setOrdersData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ✅ ✅ ✅ جلب أفضل المنتجات من API
  const fetchTopProducts = useCallback(async () => {
    try {
      
      // ✅ ✅ ✅ استدعاء الـ API الصحيح
      const response = await productService.getTopSellingWithGrowth({ limit: 5 });
      
      
      // ✅ التأكد من البيانات
      if (response.data && Array.isArray(response.data)) {
        // ✅ تحويل البيانات إلى الشكل المطلوب لـ TopProductsTable
        const formattedProducts = response.data.map(product => ({
          id: product.id,
          name: product.name,
          revenue: product.revenue || 0,
          sales: product.sold_count || product.sales || 0,
          sold_count: product.sold_count || 0,
          current_sales: product.current_sales || 0,
          previous_sales: product.previous_sales || 0,
          growth: product.growth || 0,
          stock: product.quantity || 0,
          category: product.category || 'Uncategorized',
          image: product.image || null,
          images: product.images || [],
          supplier: product.supplier || 'Unknown',
          sku: product.sku || '',
          description: product.description || '',
          manufacturer: product.manufacturer || '',
          weight: product.weight || '',
          dimensions: product.dimensions || '',
          warranty_months: product.warranty_months || '',
          tags: product.tags || '',
          featured: product.featured || false,
          lastUpdated: new Date().toISOString().split('T')[0]
        }));
        
        setTopProductsData(formattedProducts);
      } else {
        console.warn("⚠️ No products data received");
        setTopProductsData([]);
      }
    } catch (error) {
      console.error("❌ Error fetching top products:", error);
      setTopProductsData([]);
    }
  }, []);

  // ✅ دالة جلب البيانات الرئيسية
  const fetchRevenueData = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      }
      
      
      const ordersResponse = await orderService.getAll({ page_size: 200 });
      const orders = ordersResponse.data.results || ordersResponse.data;
      
      
      setOrdersData(orders);
      setLastUpdated(new Date().toLocaleString());
      
      if (forceRefresh) {
        setRefreshTrigger(prev => prev + 1);
      }
      
      // ✅ ✅ ✅ جلب أفضل المنتجات
      await fetchTopProducts();
      
      // ============================================
      // ✅ حساب الإيرادات
      // ============================================
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      
      const currentMonthOrders = orders.filter(o => {
        const date = new Date(o.created_at);
        return isWithinInterval(date, { start: monthStart, end: monthEnd });
      });
      
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));
      
      const lastMonthOrders = orders.filter(o => {
        const date = new Date(o.created_at);
        return isWithinInterval(date, { start: lastMonthStart, end: lastMonthEnd });
      });
      
      const allOrders = orders.filter(o => o.status !== 'cancelled');
      
      const currentRevenue = currentMonthOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      const totalRevenue = allOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      const totalOrders = allOrders.length;
      
      const monthlyGrowth = lastMonthRevenue > 0 
        ? ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;
      
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // ============================================
      // ✅ طرق الدفع
      // ============================================
      const paymentMethods = {};
      allOrders.forEach(o => {
        const method = o.payment_method || 'Unknown';
        if (!paymentMethods[method]) {
          paymentMethods[method] = { amount: 0, count: 0 };
        }
        paymentMethods[method].amount += parseFloat(o.total_amount || 0);
        paymentMethods[method].count += 1;
      });
      
      const totalAmount = Object.values(paymentMethods).reduce((sum, p) => sum + p.amount, 0);
      const paymentMethodsData = Object.entries(paymentMethods).map(([method, data]) => ({
        method: method,
        amount: data.amount,
        percentage: totalAmount > 0 ? Math.round((data.amount / totalAmount) * 100) : 0,
        color: ['#8B7ABA', '#F08FAE', '#EE9C6C', '#34D19C'][Math.floor(Math.random() * 4)]
      }));
      
      // ============================================
      // ✅ أفضل المنتجات من الطلبات (طريقة بديلة)
      // ============================================
      const productRevenue = {};
      allOrders.forEach(o => {
        if (o.items) {
          o.items.forEach(item => {
            const name = item.product_name || 'Unknown';
            if (!productRevenue[name]) {
              productRevenue[name] = 0;
            }
            productRevenue[name] += parseFloat(item.price || 0) * (item.quantity || 1);
          });
        }
      });
      
      const fallbackTopProducts = Object.entries(productRevenue)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, revenue]) => ({
          name: name,
          revenue: revenue,
          sales: 0,
          growth: 0
        }));
      
      setRevenueData({
        totalRevenue: totalRevenue,
        monthlyRevenue: currentRevenue,
        monthlyGrowth: monthlyGrowth,
        averageOrderValue: avgOrderValue,
        paymentMethods: paymentMethodsData,
        topProducts: fallbackTopProducts,
        monthlyComparison: {
          current: currentRevenue,
          previous: lastMonthRevenue,
          growth: monthlyGrowth
        }
      });
      
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchTopProducts]);

  // ✅ جلب البيانات عند التحميل
  useEffect(() => {
    fetchRevenueData();
  }, []);

  // ✅ معالج التحديث
  const handleTimeRangeChange = (newRange, forceRefresh = false) => {
    setTimeRange(newRange);
    if (forceRefresh) {
      fetchRevenueData(true);
    }
  };

  const handleRefresh = () => {
    fetchRevenueData(true);
  };

  if (loading) {
    return (
      <div className="space-y-6 mt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-48"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-64"></div>
          </div>
          <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-neutral-200 dark:bg-neutral-700 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 stagger-animation mt-2">
      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${revenueData.totalRevenue?.toLocaleString() || '0'}`}
          subtitle="All time revenue"
          icon={<DollarSign size={20} />}
          variant="success"
          darkMode={darkMode}
          lightBgOpacity={0.6}
        />
        <MetricCard
          title="Monthly Revenue"
          value={`$${revenueData.monthlyComparison?.current?.toLocaleString() || '0'}`}
          subtitle={`Previous month: $${revenueData.monthlyComparison?.previous?.toLocaleString() || '0'}`}
          icon={<CreditCard size={20} />}
          variant="primary"
          darkMode={darkMode}
          lightBgOpacity={0.6}
        />
        <MetricCard
          title="Revenue Growth"
          value={`${revenueData.monthlyGrowth?.toFixed(1) || '0'}%`}
          subtitle="vs last month"
          icon={<TrendingUp size={20} />}
          variant="secondary"
          darkMode={darkMode}
        />
        <MetricCard
          title="Average Order Value"
          value={`$${revenueData.averageOrderValue?.toFixed(2) || '0'}`}
          subtitle="Per transaction"
          icon={<ShoppingBag size={20} />}
          variant="warning"
          darkMode={darkMode}
        />
      </div>

      {/* Main Content Grid */}
      <div className="h-full grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="h-full col-span-3">
          <RevenueTrendChart
            key={`chart-${refreshTrigger}`}
            darkMode={darkMode}
            ordersData={ordersData}
            timeRange={timeRange}
            onTimeRangeChange={handleTimeRangeChange}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            monthlyGrowth={revenueData.monthlyGrowth}
            monthlyComparison={revenueData.monthlyComparison}
            lastUpdated={lastUpdated}
          />
        </div>
        <div className="h-full col-span-2">
          <PaymentMethodsChart
            darkMode={darkMode}
            paymentMethods={revenueData.paymentMethods}
          />
        </div>
      </div>

      {/* ✅ Top Products - يستخدم البيانات الحقيقية */}
      <TopProductsTable
        darkMode={darkMode}
        topProducts={topProductsData.length > 0 ? topProductsData : revenueData.topProducts || []}
        onRefresh={handleRefresh}
      />
    </div>
  );
};

export default RevenuePage;