// src/pages/Customers/CustomerDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, MapPin, Calendar,
  ShoppingBag, DollarSign, Loader2,
  AlertCircle, RefreshCw
} from 'lucide-react';
import { customerService } from '../../services/api';
import IconWrapper from '../../components/ui/IconWrapper';

const CustomerDetailsPage = ({ darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const colors = {
    primary: '#8B7ABA',
    secondary: '#F08FAE',
    accent: '#EE9C6C',
    success: '#34D19C'
  };

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await customerService.getById(id);
      setCustomer(response.data);
      
    } catch (err) {
      console.error('Error fetching customer:', err);
      setError('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // ✅ حالة التحميل
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto mb-4 text-primary-500" />
          <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Loading customer details...
          </p>
        </div>
      </div>
    );
  }

  // ✅ حالة الخطأ
  if (error || !customer) {
    return (
      <div className={`rounded-2xl p-12 text-center ${darkMode ? 'bg-neutral-800' : 'bg-white'} shadow-lg`}>
        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
        <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
          Customer Not Found
        </h3>
        <p className={`text-sm mb-6 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
          {error || 'The customer you are looking for does not exist.'}
        </p>
        <button
          onClick={() => navigate('/customers')}
          className="px-6 py-2.5 rounded-lg text-white font-medium transition-all hover:-translate-y-0.5"
          style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
        >
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-2 animate-fade-in-up">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/customers')}
            className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 ${darkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-primary-900/30' : 'bg-primary-100'}`}>
              <User size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                {customer.name}
              </h1>
              <p className={`text-sm mt-0.5 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Customer since {formatDate(customer.created_at)}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchCustomerData}
          className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${darkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Customer Info */}
      <div className={`rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-neutral-800/90 border border-neutral-700' : 'bg-white border border-neutral-200 shadow-md'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Personal Information */}
          <div>
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Personal Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'} mb-1`}>Full Name</p>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>{customer.name}</p>
              </div>
              <div>
                <p className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'} mb-1`}>Email Address</p>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-neutral-400" />
                  <span className={darkMode ? 'text-neutral-300' : 'text-neutral-700'}>{customer.email}</span>
                </div>
              </div>
              <div>
                <p className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'} mb-1`}>Phone Number</p>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-neutral-400" />
                  <span className={darkMode ? 'text-neutral-300' : 'text-neutral-700'}>{customer.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Address & Stats */}
          <div>
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Address & Statistics
            </h3>
            <div className="space-y-4">
              <div>
                <p className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'} mb-1`}>Address</p>
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-neutral-400 mt-0.5" />
                  <span className={darkMode ? 'text-neutral-300' : 'text-neutral-700'}>
                    {customer.address || 'Not provided'}
                    {customer.city && `, ${customer.city}`}
                    {customer.country && `, ${customer.country}`}
                  </span>
                </div>
              </div>
              <div>
                <p className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'} mb-1`}>Member Since</p>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-neutral-400" />
                  <span className={darkMode ? 'text-neutral-300' : 'text-neutral-700'}>{formatDate(customer.created_at)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className={`p-3 rounded-xl ${darkMode ? 'bg-neutral-700/30' : 'bg-neutral-50'}`}>
                  <p className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>Total Orders</p>
                  <div className="flex items-center gap-2 mt-1">
                    <ShoppingBag size={14} style={{ color: colors.primary }} />
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>{customer.total_orders || 0}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${darkMode ? 'bg-neutral-700/30' : 'bg-neutral-50'}`}>
                  <p className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>Total Spent</p>
                  <div className="flex items-center gap-2 mt-1">
                    <DollarSign size={14} style={{ color: colors.success }} />
                    <span className={`font-bold`} style={{ color: colors.success }}>
                      {formatCurrency(customer.total_spent || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate('/customers')}
          className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
            darkMode ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
          }`}
        >
          Back to Customers
        </button>
      </div>
    </div>
  );
};

export default CustomerDetailsPage;