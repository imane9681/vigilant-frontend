// frontend/src/pages/Orders/OrderDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle,
  DollarSign, User, Mail, Phone, MapPin, Calendar,
  Edit2, Save, X, Printer, Download, CreditCard,
  ShoppingBag, Hash, Calendar as CalendarIcon, Building2,
  Check, AlertCircle, ChevronRight, Loader2, Trash2
} from 'lucide-react';
import { orderService } from '../../services/api';
import IconWrapper from '../../components/ui/IconWrapper';

const OrderDetailsPage = ({ darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [updatedStatus, setUpdatedStatus] = useState('');
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const colors = {
    primary: '#8B7ABA',
    secondary: '#F08FAE',
    accent: '#EE9C6C',
    success: '#34D19C'
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: Clock, color: colors.accent, bg: 'bg-amber-100 dark:bg-amber-900/30', textColor: 'text-amber-700 dark:text-amber-400' },
    { value: 'processing', label: 'Processing', icon: Package, color: colors.primary, bg: 'bg-purple-100 dark:bg-purple-900/30', textColor: 'text-purple-700 dark:text-purple-400' },
    { value: 'shipped', label: 'Shipped', icon: Truck, color: colors.success, bg: 'bg-emerald-100 dark:bg-emerald-900/30', textColor: 'text-emerald-700 dark:text-emerald-400' },
    { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: colors.success, bg: 'bg-emerald-100 dark:bg-emerald-900/30', textColor: 'text-emerald-700 dark:text-emerald-400' },
    { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: colors.secondary, bg: 'bg-rose-100 dark:bg-rose-900/30', textColor: 'text-rose-700 dark:text-rose-400' },
  ];

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderService.getById(id);
      setOrder(response.data);
      setUpdatedStatus(response.data.status);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      await orderService.updateStatus(id, updatedStatus);
      setOrder({ ...order, status: updatedStatus });
      setEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = async () => {
    setDeleting(true);
    try {
      await orderService.delete(id);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Failed to delete order');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getStatusIcon = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    if (option) {
      const Icon = option.icon;
      return <Icon size={18} style={{ color: option.color }} />;
    }
    return <Clock size={18} />;
  };

  const getStatusStyle = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option || statusOptions[0];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="space-y-6 mt-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-neutral-200 dark:bg-neutral-800 rounded-xl"></div>
          <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-40 bg-neutral-200 dark:bg-neutral-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-96 bg-neutral-200 dark:bg-neutral-800 rounded-2xl"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={`rounded-2xl p-12 text-center ${darkMode ? 'bg-neutral-800' : 'bg-white'} shadow-lg`}>
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        <h3 className="text-xl font-bold mb-2">Order Not Found</h3>
        <p className="text-neutral-500 mb-6">{error || 'The order you are looking for does not exist.'}</p>
        <button
          onClick={() => navigate('/orders')}
          className="px-6 py-2.5 rounded-lg text-white font-medium transition-all hover:-translate-y-0.5"
          style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const statusStyle = getStatusStyle(order.status);
  const customer = order.customer || {};

  return (
    <div className="space-y-6 mt-2 animate-fade-in-up">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-24 right-8 z-50 animate-slide-in-right">
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 shadow-lg">
            <CheckCircle size={20} className="text-emerald-500" />
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">
              {deleting ? 'Order deleted successfully!' : 'Order status updated successfully!'}
            </span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-neutral-800' : 'bg-white'}`}>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 size={28} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Order</h3>
              <p className="text-neutral-500 mb-6">Are you sure you want to delete this order? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg font-medium bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteOrder}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/orders')}
            className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 ${darkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <IconWrapper darkMode={darkMode} variant="primary" size={20}>
              <ShoppingBag />
            </IconWrapper>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                Order #{order.order_number}
              </h1>
              <p className={`text-sm mt-0.5 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Created on {formatDate(order.created_at)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${darkMode ? 'hover:bg-neutral-800 text-red-400' : 'hover:bg-neutral-100 text-red-500'}`}
          >
            <Trash2 size={18} />
          </button>
          <button className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${darkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}>
            <Printer size={18} />
          </button>
          <button className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${darkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}>
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Status Card */}
      <div className={`rounded-2xl p-6 transition-all duration-300 ${darkMode ? 'bg-neutral-800/90 border border-neutral-700' : 'bg-white border border-neutral-200 shadow-lg'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${statusStyle.bg}`}>
              {getStatusIcon(order.status)}
            </div>
            <div>
              <p className={`text-xs font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Current Status</p>
              <p className={`text-xl font-bold ${statusStyle.textColor}`}>
                {statusStyle.label}
              </p>
            </div>
          </div>
          
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: `linear-gradient(135deg, ${colors.primary})` }}
            >
              <Edit2 size={16} />
              Update Status
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <select
                value={updatedStatus}
                onChange={(e) => setUpdatedStatus(e.target.value)}
                className={`px-4 py-2.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#EE9C6C]/50 ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200 text-neutral-900'}`}
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="p-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all duration-300 disabled:opacity-50"
              >
                {updating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="p-2.5 rounded-xl bg-neutral-500 text-white hover:bg-neutral-600 transition-all duration-300"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>
        
        {/* Progress Timeline */}
        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            {statusOptions.filter(opt => opt.value !== 'cancelled').map((opt, index) => {
              const isCompleted = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status) >= index;
              const isCurrent = opt.value === order.status;
              const Icon = opt.icon;
              
              return (
                <div key={opt.value} className="flex-1 text-center">
                  <div className={`flex items-center justify-center mb-2 ${isCurrent ? 'scale-110' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-emerald-500 text-white' : darkMode ? 'bg-neutral-700 text-neutral-400' : 'bg-neutral-200 text-neutral-400'}`}>
                      {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                    </div>
                  </div>
                  <p className={`text-xs font-medium ${isCurrent ? 'text-emerald-500' : darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {opt.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Three Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information - مع رقم الهاتف */}
        <div className={`rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-neutral-800/90 border border-neutral-700' : 'bg-white border border-neutral-200 shadow-md'}`}>
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-neutral-200 dark:border-neutral-700">
            <div className="p-2 rounded-xl" style={{ background: `${colors.primary}15` }}>
              <User size={18} style={{ color: colors.primary }} />
            </div>
            <h3 className="font-semibold text-lg">Customer Information</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-neutral-500 mb-1">Full Name</p>
              <p className="font-medium">{order.customer_name || customer.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">Email Address</p>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-neutral-400" />
                <span>{order.customer_email || customer.email || 'N/A'}</span>
              </div>
            </div>
            {/* ✅ رقم الهاتف - تمت إضافته */}
            <div>
              <p className="text-sm text-neutral-500 mb-1">Phone Number</p>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-neutral-400" />
                <span>{customer.phone || order.customer_phone || 'No phone number'}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">Shipping Address</p>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-neutral-400 mt-0.5" />
                <span className="text-sm">{order.shipping_address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className={`rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-neutral-800/90 border border-neutral-700' : 'bg-white border border-neutral-200 shadow-md'}`}>
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-neutral-200 dark:border-neutral-700">
            <div className="p-2 rounded-xl" style={{ background: `${colors.success}15` }}>
              <DollarSign size={18} style={{ color: colors.success }} />
            </div>
            <h3 className="font-semibold text-lg">Order Summary</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-neutral-500">Subtotal</span>
              <span className="font-medium">{formatCurrency(order.total_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Shipping</span>
              <span className="text-emerald-500">Free</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Tax</span>
              <span className="font-medium">$0.00</span>
            </div>
            <div className="border-t pt-3 mt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span style={{ color: colors.primary }}>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
            <div className="flex justify-between text-sm pt-2">
              <span className="text-neutral-500">Payment Method</span>
              <div className="flex items-center gap-1">
                <CreditCard size={14} className="text-neutral-400" />
                <span>{order.payment_method || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <div className={`rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-neutral-800/90 border border-neutral-700' : 'bg-white border border-neutral-200 shadow-md'}`}>
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-neutral-200 dark:border-neutral-700">
            <div className="p-2 rounded-xl" style={{ background: `${colors.accent}15` }}>
              <CalendarIcon size={18} style={{ color: colors.accent }} />
            </div>
            <h3 className="font-semibold text-lg">Timeline</h3>
          </div>
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={14} className="text-emerald-500" />
              </div>
              <div>
                <p className="font-medium">Order Created</p>
                <p className="text-sm text-neutral-500">{formatDate(order.created_at)}</p>
              </div>
            </div>
            {order.status !== 'pending' && order.status !== 'cancelled' && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full" style={{ background: `${colors.primary}15` }}>
                  <Package size={14} style={{ color: colors.primary }} className="m-2" />
                </div>
                <div>
                  <p className="font-medium">Status Updated to {statusStyle.label}</p>
                  <p className="text-sm text-neutral-500">{formatDate(order.updated_at)}</p>
                </div>
              </div>
            )}
            {order.status === 'cancelled' && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                  <XCircle size={14} className="text-rose-500" />
                </div>
                <div>
                  <p className="font-medium text-rose-500">Order Cancelled</p>
                  <p className="text-sm text-neutral-500">{formatDate(order.updated_at)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items Table */}
      <div className={`rounded-2xl overflow-hidden transition-all duration-300 ${darkMode ? 'bg-neutral-800/90 border border-neutral-700' : 'bg-white border border-neutral-200 shadow-lg'}`}>
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: `${colors.secondary}15` }}>
              <Package size={18} style={{ color: colors.secondary }} />
            </div>
            <h3 className="font-semibold text-lg">Order Items</h3>
            <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-neutral-700 text-neutral-300' : 'bg-neutral-100 text-neutral-600'}`}>
              {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[600px]">
            <thead className={darkMode ? 'bg-neutral-700/50' : 'bg-neutral-50'}>
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-500">Product</th>
                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-500">Quantity</th>
                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-500">Unit Price</th>
                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-500">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {order.items?.map((item, index) => (
                <tr key={index} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                        <Package size={16} className="text-neutral-400" />
                      </div>
                      <span className="font-medium">{item.product_name}</span>
                    </div>
                   </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-700 font-medium">
                      {item.quantity}
                    </span>
                    </td>
                  <td className="py-4 px-6">{formatCurrency(item.price)}</td>
                  <td className="py-4 px-6 font-semibold" style={{ color: colors.primary }}>
                    {formatCurrency(item.quantity * parseFloat(item.price))}
                    </td>
                 </tr>
              ))}
            </tbody>
            <tfoot className={darkMode ? 'bg-neutral-700/30' : 'bg-neutral-50'}>
              <tr>
                <td colSpan="3" className="py-4 px-6 text-right font-bold text-lg">Grand Total</td>
                <td className="py-4 px-6">
                  <span className="text-xl font-bold" style={{ color: colors.primary }}>
                    {formatCurrency(order.total_amount)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
        <button
          onClick={() => navigate('/orders')}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${darkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'}`}
        >
          Back to Orders
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 text-white bg-red-500 hover:bg-red-600 flex items-center justify-center gap-2"
        >
          <Trash2 size={18} />
          Delete Order
        </button>
        <button
          className="px-6 py-3 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(135deg, ${colors.primary})` }}
        >
          <Printer size={18} />
          Print Invoice
        </button>
      </div>
    </div>
  );
};

export default OrderDetailsPage;