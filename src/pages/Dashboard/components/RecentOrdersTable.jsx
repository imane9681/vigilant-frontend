// src/pages/Dashboard/components/RecentOrdersTable.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, Clock, CheckCircle, Eye, ExternalLink, Download, ShoppingBag,
  Loader2, RefreshCw, AlertCircle
} from 'lucide-react';
import IconWrapper from '../../../components/ui/IconWrapper';
import { orderService } from '../../../services/api';

const RecentOrdersTable = ({ recentOrders: initialRecentOrders, darkMode }) => {
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const DISPLAY_COUNT = 8; // ✅ عرض 8 طلبات فقط

  // ✅ جلب الطلبات الحقيقية
  const fetchRecentOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await orderService.getAll({
        limit: DISPLAY_COUNT,
        ordering: '-created_at'
      });
      
      const orders = response.data.results || response.data;
      
      // ✅ تنسيق الطلبات (أخذ أول 8 فقط)
      const formattedOrders = orders.slice(0, DISPLAY_COUNT).map(order => ({
        id: order.id,
        order_number: order.order_number || `#${order.id}`,
        customer: order.customer_name || order.customer?.name || 'Unknown',
        email: order.customer_email || order.customer?.email || '',
        amount: parseFloat(order.total_amount).toLocaleString(),
        status: order.status || 'pending',
        date: new Date(order.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        time: new Date(order.created_at).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        items: order.items?.length || 0,
        payment: order.payment_method || 'N/A',
        created_at: order.created_at
      }));
      
      setRecentOrders(formattedOrders);
      setLastUpdated(new Date().toLocaleString());
      
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      setError('Failed to load orders');
      
      // ✅ استخدام البيانات المرسلة من props إذا كانت موجودة
      if (initialRecentOrders && initialRecentOrders.length > 0) {
        setRecentOrders(initialRecentOrders.slice(0, DISPLAY_COUNT));
      }
    } finally {
      setLoading(false);
    }
  }, [initialRecentOrders]);

  useEffect(() => {
    fetchRecentOrders();
  }, [fetchRecentOrders]);

  // ✅ دالة الحصول على لون الحالة
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return { 
          bg: darkMode ? 'bg-emerald-900/30 border-emerald-800/30' : 'bg-emerald-100 border-emerald-200', 
          text: darkMode ? 'text-emerald-300' : 'text-emerald-800',
          icon: <CheckCircle size={12} className="text-emerald-500" />
        };
      case 'pending':
        return { 
          bg: darkMode ? 'bg-amber-900/30 border-amber-800/30' : 'bg-amber-100 border-amber-200', 
          text: darkMode ? 'text-amber-300' : 'text-amber-800',
          icon: <Clock size={12} className="text-amber-500" />
        };
      case 'processing':
        return { 
          bg: darkMode ? 'bg-blue-900/30 border-blue-800/30' : 'bg-blue-100 border-blue-200', 
          text: darkMode ? 'text-blue-300' : 'text-blue-800',
          icon: <Clock size={12} className="text-blue-500" />
        };
      case 'shipped':
        return { 
          bg: darkMode ? 'bg-purple-900/30 border-purple-800/30' : 'bg-purple-100 border-purple-200', 
          text: darkMode ? 'text-purple-300' : 'text-purple-800',
          icon: <Clock size={12} className="text-purple-500" />
        };
      case 'cancelled':
        return { 
          bg: darkMode ? 'bg-rose-900/30 border-rose-800/30' : 'bg-rose-100 border-rose-200', 
          text: darkMode ? 'text-rose-300' : 'text-rose-800',
          icon: <AlertCircle size={12} className="text-rose-500" />
        };
      default:
        return { 
          bg: darkMode ? 'bg-neutral-800/50 border-neutral-700/50' : 'bg-neutral-100 border-neutral-300', 
          text: darkMode ? 'text-neutral-300' : 'text-neutral-700',
          icon: <Clock size={12} className="text-neutral-500" />
        };
    }
  };

  // ✅ حالة التحميل
  if (loading) {
    return (
      <div className={`rounded-xl overflow-hidden transition-all duration-300 min-h-[280px] flex items-center justify-center ${
        darkMode 
          ? 'bg-gradient-card-dark border border-neutral-800' 
          : 'bg-gradient-card border border-neutral-200 shadow-lg'
      }`}>
        <div className="text-center">
          <Loader2 size={28} className="animate-spin mx-auto mb-3 text-primary-500" />
          <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  // ✅ حالة الخطأ
  if (error && recentOrders.length === 0) {
    return (
      <div className={`rounded-xl overflow-hidden transition-all duration-300 min-h-[280px] flex items-center justify-center ${
        darkMode 
          ? 'bg-gradient-card-dark border border-neutral-800' 
          : 'bg-gradient-card border border-neutral-200 shadow-lg'
      }`}>
        <div className="text-center">
          <AlertCircle size={28} className="mx-auto mb-3 text-amber-500" />
          <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            {error}
          </p>
          <button
            onClick={fetchRecentOrders}
            className="mt-3 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ✅ حالة عدم وجود طلبات
  if (recentOrders.length === 0 && !loading) {
    return (
      <div className={`rounded-xl overflow-hidden transition-all duration-300 ${
        darkMode 
          ? 'bg-gradient-card-dark border border-neutral-800' 
          : 'bg-gradient-card border border-neutral-200 shadow-lg'
      }`}>
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <IconWrapper darkMode={darkMode} variant="primary" size={18}>
                <ShoppingBag />
              </IconWrapper>
              <div>
                <h3 className={`font-bold text-base ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                  Recent Orders
                </h3>
                <p className={`text-[11px] mt-0.5 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  No orders yet
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="py-10 text-center">
          <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
          <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            No orders available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden transition-all duration-300 ${
      darkMode 
            ? 'bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-800 hover:border-primary-500/30' 
            : 'bg-gradient-to-br from-white to-neutral-50 border-neutral-200/80 hover:border-primary-200 shadow-lg hover:shadow-2xl'
        }`}>
      
      {/* Header Section */}
      <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <IconWrapper darkMode={darkMode} variant="primary" size={18}>
              <ShoppingBag />
            </IconWrapper>
            
            <div>
              <h3 className={`font-bold text-base ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                Recent Orders
              </h3>
              <p className={`text-[11px] mt-0.5 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Latest {recentOrders.length} orders
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              to="/orders"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 ${
                darkMode 
                  ? 'bg-primary-800/80 hover:bg-primary-800/70 text-white border border-primary-800/80' 
                  : 'bg-primary-800/80 hover:bg-primary-800/90 text-white border border-primary-800/80'
              }`}
            >
              View All
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[790px]">
          <thead>
            <tr className={darkMode ? 'bg-neutral-900/50' : 'bg-primary-800/5'}>
              <th className="text-left py-3 px-4 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                Order
              </th>
              <th className="text-left py-3 px-3 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                Customer
              </th>
              <th className="text-left py-3 px-3 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                Amount
              </th>
              <th className="text-left py-3 px-3 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                Status
              </th>
              <th className="text-left py-3 px-3 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                Date
              </th>
              <th className="text-left py-3 px-3 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => {
              const statusColors = getStatusColor(order.status);
              return (
                <tr 
                  key={order.id}
                  className={`border-t border-neutral-200 dark:border-neutral-800 transition-colors duration-200 ${
                    darkMode 
                      ? 'hover:bg-neutral-800/50' 
                      : 'hover:bg-neutral-50'
                  }`}
                >
                  {/* Order ID Cell */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        darkMode ? 'bg-neutral-800' : 'bg-neutral-100'
                      }`}>
                        <ShoppingBag size={18} className={darkMode ? "text-neutral-300" : "text-neutral-600"} />
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-neutral-700'}`}>
                          {order.order_number}
                        </p>
                        <p className={`text-[10px] mt-0.5 ${darkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                          {order.items} {order.items === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Customer Cell */}
                  <td className="py-3.5 px-3">
                    <div>
                      <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {order.customer.length > 15 ? order.customer.substring(0, 15) + '...' : order.customer}
                      </p>
                      <p className={`text-[10px] mt-0.5 truncate max-w-[120px] ${darkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                        {order.email}
                      </p>
                    </div>
                  </td>

                  {/* Amount Cell */}
                  <td className="py-3.5 px-3">
                    <p className={`font-bold text-base ${darkMode ? 'text-white' : 'text-neutral-700'}`}>
                      ${order.amount}
                    </p>
                  </td>

                  {/* Status Cell */}
                  <td className="py-3.5 px-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${statusColors.bg} ${statusColors.text}`}>
                      {statusColors.icon}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>

                  {/* Date Cell */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col">
                      <span className={`text-xs ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        {order.date}
                      </span>
                      <span className={`text-[10px] ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        {order.time}
                      </span>
                    </div>
                  </td>

                  {/* Action Cell */}
                  <td className="py-3.5 px-3">
                    <button 
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 ${
                        darkMode 
                          ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700' 
                          : 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 shadow-sm'
                      }`}
                    >
                      <Eye size={14} />
                      Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className={`px-5 py-4 border-t ${darkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
        <div className="flex items-center justify-between">
          <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Showing {recentOrders.length} orders
          </p>
          {lastUpdated && (
            <p className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
              Updated: {lastUpdated}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentOrdersTable;