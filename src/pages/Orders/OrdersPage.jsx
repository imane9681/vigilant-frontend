// frontend/src/pages/Orders/OrdersPage.jsx
import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Filter, Search, Download, Plus,
  CheckCircle, Clock, AlertCircle, Calendar,
  DollarSign, Package, Eye, Truck,
  BarChart3, Sun, CalendarDays, CalendarRange,
  PackageCheck, RefreshCw, CreditCard,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../Dashboard/components/MetricCard';
import IconWrapper from './../../components/ui/IconWrapper';
import FilterControls from '../../components/ui/FilterControls';
import { orderService } from '../../services/api';
import CreateOrderModal from './components/CreateOrderModal';
import { useSearchParams } from 'react-router-dom';

const OrdersPage = ({ darkMode }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false); 

  const [searchParams] = useSearchParams();
  const customerId = searchParams.get('customer');
  
  // ✅ Stats state
  const [stats, setStats] = useState({
    total: 0,
    totalRevenue: 0,
    delivered: 0,
    deliveredRevenue: 0,
    pending: 0,
    pendingRevenue: 0,
    processing: 0,
    shipped: 0,
    completionRate: 0
  });

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [customerId]);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter, dateFilter, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const statusDropdown = document.querySelector('[data-status-dropdown]');
      const dateDropdown = document.querySelector('[data-date-dropdown]');
      
      if (statusDropdown && !statusDropdown.contains(event.target)) {
        setShowStatusDropdown(false);
      }
      
      if (dateDropdown && !dateDropdown.contains(event.target)) {
        setShowDateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const response = await orderService.getStats();
      const data = response.data;
      
      setStats({
        total: data.total || 0,
        totalRevenue: data.totalRevenue || 0,
        delivered: data.delivered || 0,
        deliveredRevenue: data.deliveredRevenue || 0,
        pending: data.pending || 0,
        pendingRevenue: data.pendingRevenue || 0,
        processing: data.processing || 0,
        shipped: data.shipped || 0,
        completionRate: data.completionRate || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (customerId) {
        params.customer = customerId;
      }

      const response = await orderService.getAll(params);
      const ordersData = response.data.results || response.data;
      
      const formattedOrders = ordersData.map(order => ({
        id: order.id,
        order_number: order.order_number,
        customer_id: order.customer,
        customer: order.customer_name || order.customer?.name || 'Unknown',
        email: order.customer_email || order.customer?.email || '',
        amount: `$${parseFloat(order.total_amount).toLocaleString()}`,
        status: order.status,
        date: new Date(order.created_at).toISOString().split('T')[0],
        items: order.items?.length || 0,
        payment: order.payment_method || 'N/A'
      }));
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (customerId) {
      filtered = filtered.filter(order => order.customer_id === parseInt(customerId) || order.customer?.id === parseInt(customerId));
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(order => order.date === today);
    } else if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(order => new Date(order.date) >= weekAgo);
    } else if (dateFilter === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= startOfMonth && orderDate <= endOfMonth;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm)
      );
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return { bg: darkMode ? 'bg-emerald-900/30 border-emerald-800/30' : 'bg-emerald-100 border-emerald-200', text: darkMode ? 'text-emerald-300' : 'text-emerald-800' };
      case 'pending': return { bg: darkMode ? 'bg-amber-900/30 border-amber-800/30' : 'bg-amber-100 border-amber-200', text: darkMode ? 'text-amber-300' : 'text-amber-800' };
      case 'processing': return { bg: darkMode ? 'bg-blue-900/30 border-blue-800/30' : 'bg-blue-100 border-blue-200', text: darkMode ? 'text-blue-300' : 'text-blue-800' };
      case 'shipped': return { bg: darkMode ? 'bg-violet-900/30 border-violet-800/30' : 'bg-violet-100 border-violet-200', text: darkMode ? 'text-violet-300' : 'text-violet-800' };
      case 'delivered': return { bg: darkMode ? 'bg-emerald-900/30 border-emerald-800/30' : 'bg-emerald-100 border-emerald-200', text: darkMode ? 'text-emerald-300' : 'text-emerald-800' };
      default: return { bg: darkMode ? 'bg-neutral-800/50 border-neutral-700/50' : 'bg-neutral-100 border-neutral-300', text: darkMode ? 'text-neutral-300' : 'text-neutral-700' };
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxVisiblePages; i++) {
          pageNumbers.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }
    return pageNumbers;
  };

  const handleOrderCreated = () => {
    fetchOrders();
    fetchStats();
  };

  if (loading) {
    return (
      <div className="space-y-6 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-2">
      {/* ✅ 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {/* 1️⃣ Total Orders - الأولوية الأولى */}
    <MetricCard
        title="Total Orders"
        value={stats.total}
        icon={<ShoppingBag size={20} />}
        subtitle="All time orders"
        variant="success"
        darkMode={darkMode}
        lightBgOpacity={0.6}
    />
    
    {/* 2️⃣ Total Revenue */}
    <MetricCard
        title="Total Revenue"
        value={`$${stats.totalRevenue.toLocaleString()}`}
        icon={<DollarSign size={20} />}
        subtitle="All orders"
        variant="primary"
        darkMode={darkMode}
        lightBgOpacity={0.6}
    />
    
    {/* 3️⃣ Delivered Revenue */}
    <MetricCard
        title="Delivered Revenue"
        value={`$${stats.deliveredRevenue.toLocaleString()}`}
        icon={<CheckCircle size={20} />}
        subtitle={`${stats.completionRate}% completed`}
        variant="secondary"
        darkMode={darkMode}
    />
    
    {/* 4️⃣ Pending Orders - تحتاج متابعة */}
    <MetricCard
        title="Pending Orders"
        value={stats.pending}
        icon={<Clock size={20} />}
        subtitle={`$${stats.pendingRevenue.toLocaleString()} awaiting`}
        variant="warning"
        darkMode={darkMode}
    />
</div>

      {/* Filters Section */}
      <FilterControls
        darkMode={darkMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Search orders by customer, email, or ID..."
        filters={[
          {
            value: statusFilter,
            onChange: setStatusFilter,
            defaultValue: 'all',
            defaultLabel: 'All Status',
            icon: 'status',
            options: [
              { value: 'all', label: 'All Status', icon: <Filter size={14} /> },
              { value: 'delivered', label: 'Delivered', icon: <CheckCircle size={14} className="text-green-500" /> },
              { value: 'pending', label: 'Pending', icon: <Clock size={14} className="text-yellow-500" /> },
              { value: 'processing', label: 'Processing', icon: <RefreshCw size={14} className="text-blue-500" /> },
              { value: 'shipped', label: 'Shipped', icon: <Truck size={14} className="text-purple-500" /> }
            ]
          },
          {
            value: dateFilter,
            onChange: setDateFilter,
            defaultValue: 'all',
            defaultLabel: 'All Time',
            icon: 'calendar',
            options: [
              { value: 'all', label: 'All Time', icon: <Calendar size={14} /> },
              { value: 'today', label: 'Today', icon: <Sun size={14} /> },
              { value: 'week', label: 'Last 7 Days', icon: <CalendarDays size={14} /> },
              { value: 'month', label: 'This Month', icon: <CalendarRange size={14} /> }
            ]
          }
        ]}
        actionButton={{
          show: true,
          text: "New Order",
          icon: <Plus size={18} />,
          onClick: () => setShowCreateModal(true)
        }}
        extraButtons={[
          { text: "Export", icon: <Download size={16} />, onClick: () => console.log('Export') }
        ]}
        filteredCount={filteredOrders.length}
        totalCount={orders.length}
        onReset={() => {
          setSearchTerm('');
          setStatusFilter('all');
          setDateFilter('all');
        }}
      />

      {/* Orders Table */}
      <div className={`rounded-2xl overflow-hidden transition-all duration-300 ${darkMode ? 'bg-gradient-card-dark border border-neutral-800 hover:border-neutral-700 shadow-lg' : 'bg-gradient-card border border-neutral-200 hover:border-neutral-300 shadow-lg'}`}>
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconWrapper darkMode={darkMode} variant="primary" size={20}>
                <ShoppingBag />
              </IconWrapper>
              <div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                  All Orders ({filteredOrders.length})
                </h3>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  Showing all customer orders
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[800px] lg:min-w-full">
            <thead>
              <tr className={darkMode ? 'bg-neutral-900/50' : 'bg-primary-800/5'}>
                <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Order ID</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Customer</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Amount</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Date</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Items</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Payment</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => {
                const statusColors = getStatusColor(order.status);
                return (
                  <tr key={order.id} className={`border-t border-neutral-200 dark:border-neutral-800 transition-colors duration-200 ${darkMode ? 'hover:bg-neutral-800/50' : 'hover:bg-neutral-50'}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                          <ShoppingBag size={16} className={darkMode ? "text-neutral-300" : "text-neutral-600"} />
                        </div>
                        <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                          {order.order_number || `#${order.id.toString().padStart(5, '0')}`}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-neutral-900'}`}>{order.customer.split(' ')[0]}</p>
                      <p className={`text-xs mt-0.5 ${darkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>{order.email.substring(0, 12)}...</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-neutral-900'}`}>{order.amount}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${statusColors.bg} ${statusColors.text}`}>
                        {order.status === 'delivered' && <CheckCircle size={10} />}
                        {order.status === 'pending' && <Clock size={10} />}
                        {order.status === 'processing' && <Clock size={10} />}
                        {order.status === 'shipped' && <Package size={10} />}
                        <span className="hidden sm:inline">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                        <span className="sm:hidden">{order.status.charAt(0).toUpperCase()}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className={darkMode ? "text-neutral-500" : "text-neutral-500"} />
                        <p className={`text-xs ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>{order.date.split('-').slice(0).join('/')}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        <Package size={12} className={darkMode ? "text-neutral-500" : "text-neutral-500"} />
                        <p className={`text-xs font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>{order.items}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${darkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-700'}`}>
                        <CreditCard size={10} className={darkMode ? "text-neutral-500" : "text-neutral-500"} />
                        <span className="hidden md:inline">{order.payment}</span>
                        <span className="md:hidden">{order.payment === 'Credit Card' ? 'CC' : order.payment === 'PayPal' ? 'PP' : 'ST'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/orders/${order.id}`)} 
                          className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${darkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300'}`}>
                          <Eye size={12} />
                          <span className="hidden sm:inline">View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="py-16 text-center">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-primary-900/30' : 'bg-primary-100'}`}>
              <ShoppingBag className={darkMode ? "text-primary-600" : "text-primary-400"} size={40} />
            </div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>No orders found</h3>
            <p className={`mt-2 max-w-md mx-auto text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              {searchTerm ? `No orders match your search for "${searchTerm}"` : 'No orders available in the system'}
            </p>
            <button onClick={() => setShowCreateModal(true)} className="mt-4 px-5 py-2.5 bg-primary-800/80 hover:bg-primary-800/90 text-white rounded-lg font-medium transition-all duration-200">
              Create New Order
            </button>
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className={`px-6 py-5 border-t ${darkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs sm:text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Show</span>
                <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-neutral-800 text-neutral-300 border-neutral-700' : 'bg-white text-neutral-700 border-neutral-300'} border focus:outline-none`}>
                  <option value="5">5</option>
                  <option value="8">8</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
                <span className={`text-xs sm:text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>entries</span>
              </div>

              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`p-1.5 rounded ${currentPage === 1 ? (darkMode ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed') : (darkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-white hover:bg-neutral-50 text-neutral-700 border')}`}>
                  <ChevronLeft size={14} />
                </button>
                
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((pageNum) => (
                    <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium ${currentPage === pageNum ? (darkMode ? 'bg-primary-800/80 text-white' : 'bg-primary-800/80 text-white') : (darkMode ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-700')}`}>
                      {pageNum}
                    </button>
                  ))}
                </div>
                
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`p-1.5 rounded ${currentPage === totalPages ? (darkMode ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed') : (darkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-white hover:bg-neutral-50 text-neutral-700 border')}`}>
                  <ChevronRight size={14} />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-xs sm:text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <CreateOrderModal
          darkMode={darkMode}
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleOrderCreated}
        />
      )}
    </div>
  );
};

export default OrdersPage;