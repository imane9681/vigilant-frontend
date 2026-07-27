// frontend/src/pages/Customers/CustomersPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserPlus, Mail, Phone, MapPin, Calendar,
  TrendingUp, Filter, Search, Download, Star, CreditCard,
  Eye, Edit2, Trash2, MoreVertical, ChevronLeft, ChevronRight,
  X, CheckCircle, AlertCircle, Plus, DollarSign, ShoppingBag,
  Sun, CalendarDays, CalendarRange, BarChart3
} from 'lucide-react';
import MetricCard from '../Dashboard/components/MetricCard';
import IconWrapper from './../../components/ui/IconWrapper';
import FilterControls from '../../components/ui/FilterControls';
import { customerService, orderService } from '../../services/api';

const CustomersPage = ({ darkMode }) => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerType, setCustomerType] = useState('all');
  const [customerStatus, setCustomerStatus] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    premium: 0,
    totalRevenue: 0,
    averageOrderValue: 0  // ✅ إضافة
  });
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const colors = {
    primary: '#8B7ABA',
    secondary: '#F08FAE',
    accent: '#EE9C6C',
    success: '#34D19C'
  };

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm, customerType, customerStatus, dateFilter]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getAll();
      const customersData = response.data.results || response.data;
      setCustomers(customersData);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await customerService.getStats();
      setStats({
        total: response.data.total || 0,
        active: response.data.active || response.data.total || 0,
        premium: response.data.premium || 0,
        totalRevenue: response.data.totalRevenue || 0,
        averageOrderValue: response.data.averageOrderValue || 0  // ✅ إضافة
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const filterCustomers = () => {
    let filtered = [...customers];

    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (customerType !== 'all') {
      filtered = filtered.filter(customer => customer.type === customerType);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate = new Date();
      switch(dateFilter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          break;
      }
      filtered = filtered.filter(customer => new Date(customer.created_at) >= startDate);
    }

    setFilteredCustomers(filtered);
    setCurrentPage(1);
  };

  const handleAddCustomer = async () => {
    if (!formData.name || !formData.email) {
      alert('Name and email are required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await customerService.create(formData);
      if (response.status === 201 || response.status === 200) {
        window.dispatchEvent(new Event('notification-updated'));
        setSuccessMessage('Customer added successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        await fetchCustomers();
        await fetchStats();
        setShowAddModal(false);
        setFormData({ name: '', email: '', phone: '', address: '', city: '', country: '' });
      }
    } catch (err) {
      console.error('Error adding customer:', err);
      alert('Failed to add customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return;

    setSubmitting(true);
    try {
      await customerService.update(editingCustomer.id, formData);
      setSuccessMessage('Customer updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchCustomers();
      await fetchStats();
      setShowEditModal(false);
      setEditingCustomer(null);
      setFormData({ name: '', email: '', phone: '', address: '', city: '', country: '' });
    } catch (err) {
      console.error('Error updating customer:', err);
      alert('Failed to update customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    setSubmitting(true);
    try {
      await customerService.delete(selectedCustomer.id);
      setSuccessMessage('Customer deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchCustomers();
      await fetchStats();
      setShowDeleteConfirm(false);
      setSelectedCustomer(null);
    } catch (err) {
      console.error('Error deleting customer:', err);
      alert('Failed to delete customer');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      country: customer.country || ''
    });
    setShowEditModal(true);
  };

  const openDeleteConfirm = (customer) => {
    setSelectedCustomer(customer);
    setShowDeleteConfirm(true);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCustomerType('all');
    setCustomerStatus('all');
    setDateFilter('all');
  };

  const goToCustomerDetails = (customerId) => {
    navigate(`/customers/${customerId}`);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxVisiblePages; i++) pageNumbers.push(i);
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) pageNumbers.push(i);
      }
    }
    return pageNumbers;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl p-8 text-center ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button onClick={fetchCustomers} className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-2">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-24 right-8 z-50 animate-slide-in-right">
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 shadow-lg">
            <CheckCircle size={20} className="text-emerald-500" />
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* ✅ 4 Cards - الأكثر أولوية في صفحة العملاء */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1️⃣ Total Customers */}
        <MetricCard
          title="Total Customers"
          value={stats.total}
          icon={<Users size={20} />}
          subtitle="All registered customers"
          darkMode={darkMode}
          variant="success"
          lightBgOpacity={0.6}
        />
        
        {/* 2️⃣ Active Customers */}
        <MetricCard
          title="Active Customers"
          value={stats.active}
          icon={<TrendingUp size={20} />}
          subtitle={`${stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(1) : 0}% active rate`}
          darkMode={darkMode}
          variant="primary"
          lightBgOpacity={0.6}
        />
        
        {/* 3️⃣ Total Revenue */}
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={<DollarSign size={20} />}
          subtitle="From all customers"
          darkMode={darkMode}
          variant="secondary"
        />
        
        {/* 4️⃣ Average Order Value */}
        <MetricCard
          title="Avg. Order Value"
          value={formatCurrency(stats.averageOrderValue)}
          icon={<BarChart3 size={20} />}
          subtitle="Per transaction"
          darkMode={darkMode}
          variant="warning"
        />
      </div>

      {/* Filters Section */}
      <FilterControls
        darkMode={darkMode}
        title="Filter & Controls"
        description="Search, filter and manage your customers"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Search customers by name, email, or phone..."
        filters={[
          {
            value: customerType,
            onChange: setCustomerType,
            defaultValue: 'all',
            defaultLabel: 'All Types',
            icon: 'users',
            options: [
              { value: 'all', label: 'All Types', icon: <Users size={14} /> },
              { value: 'premium', label: 'Premium', icon: <Star size={14} className="text-purple-500" /> },
              { value: 'regular', label: 'Regular', icon: <Users size={14} className="text-blue-500" /> }
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
              { value: 'week', label: 'Week', icon: <CalendarDays size={14} /> },
              { value: 'month', label: 'Month', icon: <CalendarRange size={14} /> }
            ]
          }
        ]}
        actionButton={{
          show: true,
          text: "Add Customer",
          icon: <UserPlus size={18} />,
          onClick: () => setShowAddModal(true)
        }}
        extraButtons={[
          { text: "Export", icon: <Download size={16} />, onClick: () => console.log('Export') }
        ]}
        filteredCount={filteredCustomers.length}
        totalCount={customers.length}
        onReset={handleResetFilters}
      />
     
      {/* Customers Table */}
      <div className={`rounded-2xl overflow-hidden transition-all duration-300 ${darkMode ? 'bg-gradient-card-dark border border-neutral-800 hover:border-neutral-700 shadow-lg' : 'bg-gradient-card border border-neutral-200 hover:border-neutral-300 shadow-lg'}`}>
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <IconWrapper darkMode={darkMode} variant="primary" size={20}>
              <Users />
            </IconWrapper>
            <div>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                Customer Directory ({filteredCustomers.length})
              </h3>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Manage your customer relationships
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[800px] lg:min-w-full">
            <thead>
              <tr className={darkMode ? 'bg-neutral-900/50' : 'bg-primary-800/5'}>
                <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Customer</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Contact</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Location</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Orders/Spent</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Joined</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCustomers.map((customer) => (
                <tr 
                  key={customer.id} 
                  className={`border-t border-neutral-200 dark:border-neutral-800 transition-colors duration-200 ${darkMode ? 'hover:bg-neutral-800/50' : 'hover:bg-neutral-50'}`}
                >
                  <td className="py-4 px-6">
                    <div 
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => goToCustomerDetails(customer.id)}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                        <Users size={18} className={darkMode ? "text-neutral-300" : "text-neutral-600"} />
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-neutral-900'} hover:text-primary-400 transition-colors`}>
                          {customer.name}
                        </p>
                        <p className={`text-xs mt-0.5 ${darkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                          ID: #{customer.id.toString().padStart(5, '0')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail size={12} className={darkMode ? "text-neutral-500" : "text-neutral-500"} />
                        <span className={`text-xs truncate max-w-[150px] ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`} title={customer.email}>
                          {customer.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={12} className={darkMode ? "text-neutral-500" : "text-neutral-500"} />
                        <span className={`text-xs ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                          {customer.phone || 'No phone'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className={darkMode ? "text-neutral-500" : "text-neutral-500"} />
                      <span className={`text-xs truncate max-w-[120px] ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`} title={customer.city}>
                        {customer.city || customer.country || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ShoppingBag size={12} className={darkMode ? "text-neutral-500" : "text-neutral-500"} />
                        <span className={`text-xs ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                          {customer.total_orders || 0} orders
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign size={12} className={darkMode ? "text-neutral-500" : "text-neutral-500"} />
                        <span className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                          {formatCurrency(customer.total_spent || 0)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className={darkMode ? "text-neutral-500" : "text-neutral-500"} />
                      <span className={`text-xs ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        {formatDate(customer.created_at)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(customer)}
                        className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-neutral-700 text-neutral-400 hover:text-primary-400' : 'hover:bg-neutral-100 text-neutral-600 hover:text-primary-600'}`}
                        title="Edit customer"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(customer)}
                        className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-neutral-700 text-neutral-400 hover:text-red-400' : 'hover:bg-neutral-100 text-neutral-600 hover:text-red-600'}`}
                        title="Delete customer"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={async () => {
                          if (customer.total_orders === 1) {
                            try {
                              const response = await orderService.getAll({ customer: customer.id, limit: 1 });
                              const orders = response.data.results || response.data;
                              if (orders && orders.length > 0) {
                                navigate(`/orders/${orders[0].id}`);
                              } else {
                                navigate(`/orders?customer=${customer.id}`);
                              }
                            } catch (err) {
                              console.error('Error fetching orders:', err);
                              navigate(`/orders?customer=${customer.id}`);
                            }
                          } else if (customer.total_orders > 1) {
                            navigate(`/orders?customer=${customer.id}`);
                          }
                        }}
                        disabled={!customer.total_orders || customer.total_orders === 0}
                        className={`p-1.5 rounded-lg transition-colors ${!customer.total_orders || customer.total_orders === 0 
                          ? 'opacity-40 cursor-not-allowed' 
                          : darkMode ? 'hover:bg-neutral-700 text-neutral-400 hover:text-emerald-400' : 'hover:bg-neutral-100 text-neutral-600 hover:text-emerald-600'
                        }`}
                        title={customer.total_orders === 1 ? 'View order details' : customer.total_orders > 1 ? 'View all orders' : 'No orders yet'}
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="py-16 text-center">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-primary-900/30' : 'bg-primary-100'}`}>
              <Users className={darkMode ? "text-primary-600" : "text-primary-400"} size={40} />
            </div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>No customers found</h3>
            <p className={`mt-2 max-w-md mx-auto text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              {searchTerm ? `No customers match your search for "${searchTerm}"` : 'No customers available in the system'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-5 py-2.5 bg-primary-800/80 hover:bg-primary-800/90 text-white rounded-lg font-medium transition-all duration-200"
            >
              Add New Customer
            </button>
          </div>
        )}

        {/* Pagination */}
        {filteredCustomers.length > 0 && (
          <div className={`px-6 py-5 border-t ${darkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs sm:text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-neutral-800 text-neutral-300 border-neutral-700' : 'bg-white text-neutral-700 border-neutral-300'} border focus:outline-none`}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <span className={`text-xs sm:text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>entries</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-1.5 rounded ${currentPage === 1 ? (darkMode ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed') : (darkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-white hover:bg-neutral-50 text-neutral-700 border')}`}
                >
                  <ChevronLeft size={14} />
                </button>
                
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium ${currentPage === pageNum ? (darkMode ? 'bg-primary-800/80 text-white' : 'bg-primary-800/80 text-white') : (darkMode ? 'hover:bg-neutral-800 text-neutral-300' : 'hover:bg-neutral-100 text-neutral-700')}`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-1.5 rounded ${currentPage === totalPages ? (darkMode ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed') : (darkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-white hover:bg-neutral-50 text-neutral-700 border')}`}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-xs sm:text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCustomers.length)} of {filteredCustomers.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl ${darkMode ? 'bg-neutral-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ background: `${colors.primary}15` }}>
                  <UserPlus size={22} style={{ color: colors.primary }} />
                </div>
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>Add New Customer</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100'}`}>
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200'}`}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200'}`}
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200'}`}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200'}`}
                  placeholder="123 Main St"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200'}`}
                  />
                </div>
              </div>
            </div>
            
            <div className={`flex justify-end gap-3 p-6 border-t ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg font-medium bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">
                Cancel
              </button>
              <button onClick={handleAddCustomer} disabled={submitting} className="px-4 py-2 rounded-lg font-medium text-white transition-all hover:scale-105 disabled:opacity-50" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                {submitting ? 'Adding...' : 'Add Customer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl ${darkMode ? 'bg-neutral-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ background: `${colors.primary}15` }}>
                  <Edit2 size={22} style={{ color: colors.primary }} />
                </div>
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>Edit Customer</h2>
              </div>
              <button onClick={() => setShowEditModal(false)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100'}`}>
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200'}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200'}`}
                  />
                </div>
              </div>
            </div>
            
            <div className={`flex justify-end gap-3 p-6 border-t ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-lg font-medium bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">
                Cancel
              </button>
              <button onClick={handleUpdateCustomer} disabled={submitting} className="px-4 py-2 rounded-lg font-medium text-white transition-all hover:scale-105 disabled:opacity-50" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-neutral-800' : 'bg-white'}`}>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 size={28} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Customer</h3>
              <p className="text-neutral-500 mb-6">
                Are you sure you want to delete <span className="font-semibold">{selectedCustomer.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2 rounded-lg font-medium bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDeleteCustomer} disabled={submitting} className="flex-1 px-4 py-2 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50">
                  {submitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;