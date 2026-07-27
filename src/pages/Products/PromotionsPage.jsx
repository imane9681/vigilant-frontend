// frontend/src/pages/Products/PromotionsPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Tag, Percent, Calendar, Users, TrendingUp, Clock,
  Plus, Edit2, Trash2, Eye, Filter, Search, Download,
  CheckCircle, AlertTriangle, Zap, BarChart3, DollarSign,
  Copy, Share2, Bell, Target, Star, Gift, X, ChevronDown,
  SlidersHorizontal, MoreVertical, Settings, 
} from 'lucide-react';
import MetricCard from '../Dashboard/components/MetricCard';
import IconWrapper from './../../components/ui/IconWrapper';
import FilterControls from '../../components/ui/FilterControls';
import { promotionService } from '../../services/api';

const PromotionsPage = ({ darkMode }) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [newPromotion, setNewPromotion] = useState({
    name: '',
    type: 'percentage',
    value: '',
    code: '',
    startDate: '',
    endDate: '',
    minPurchase: '',
    maxUses: '',
    description: ''
  });

  const colors = {
    primary: '#8B7ABA',
    secondary: '#F08FAE',
    accent: '#EE9C6C',
    success: '#34D19C'
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await promotionService.getAll();
      const promotionsData = response.data.results || response.data;
      setPromotions(promotionsData);
    } catch (err) {
      console.error('Error fetching promotions:', err);
      setError('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePromotion = async () => {
    if (!selectedPromotion) return;
    
    setSubmitting(true);
    try {
      await promotionService.delete(selectedPromotion.id);
      setSuccessMessage('Promotion deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchPromotions();
      setShowDeleteConfirm(false);
      setSelectedPromotion(null);
    } catch (err) {
      console.error('Error deleting promotion:', err);
      alert('Failed to delete promotion');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setSuccessMessage(`✅ Copied: ${code}`);
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const handleSavePromotion = async () => {
    if (!newPromotion.name || !newPromotion.code) {
      alert('Please fill in required fields (Name and Code)');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        name: newPromotion.name,
        code: newPromotion.code.toUpperCase(),
        discount_type: newPromotion.type,
        discount_value: parseFloat(newPromotion.value) || 0,
        min_purchase: parseFloat(newPromotion.minPurchase) || 0,
        max_uses: parseInt(newPromotion.maxUses) || 1000,
        start_date: newPromotion.startDate,
        end_date: newPromotion.endDate,
        description: newPromotion.description,
        status: new Date(newPromotion.startDate) > new Date() ? 'scheduled' : 'active'
      };
      
      if (editingPromotion) {
        await promotionService.update(editingPromotion.id, data);
        setSuccessMessage('Promotion updated successfully!');
      } else {
        await promotionService.create(data);
        setSuccessMessage('Promotion created successfully!');
      }
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchPromotions();
      setShowCreateForm(false);
      setEditingPromotion(null);
      setNewPromotion({
        name: '',
        type: 'percentage',
        value: '',
        code: '',
        startDate: '',
        endDate: '',
        minPurchase: '',
        maxUses: '',
        description: ''
      });
    } catch (err) {
      console.error('Error saving promotion:', err);
      alert('Failed to save promotion');
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setEditingPromotion(null);
    setNewPromotion({
      name: '',
      type: 'percentage',
      value: '',
      code: '',
      startDate: '',
      endDate: '',
      minPurchase: '',
      maxUses: '',
      description: ''
    });
    setShowCreateForm(true);
  };

  const openEditModal = (promo) => {
    setEditingPromotion(promo);
    setNewPromotion({
      name: promo.name,
      type: promo.discount_type,
      value: promo.discount_value,
      code: promo.code,
      startDate: promo.start_date ? promo.start_date.split('T')[0] : '',
      endDate: promo.end_date ? promo.end_date.split('T')[0] : '',
      minPurchase: promo.min_purchase,
      maxUses: promo.max_uses,
      description: promo.description || ''
    });
    setShowCreateForm(true);
  };

  const filteredPromotions = promotions.filter(promo => {
    if (filter !== 'all' && promo.status !== filter) return false;
    if (searchQuery && 
        !promo.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !promo.code?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !promo.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    const statusOrder = { active: 3, scheduled: 2, expired: 1 };
    return (statusOrder[b.status] - statusOrder[a.status]) || 
           (new Date(b.start_date) - new Date(a.start_date));
  });

  const getStatusStyle = (status) => {
    switch(status) {
      case 'active':
        return {
          bg: darkMode ? 'bg-emerald-900/20' : 'bg-emerald-50',
          text: colors.success,
          icon: CheckCircle,
          label: 'Active'
        };
      case 'scheduled':
        return {
          bg: darkMode ? 'bg-purple-900/20' : 'bg-purple-50',
          text: colors.primary,
          icon: Clock,
          label: 'Scheduled'
        };
      case 'expired':
        return {
          bg: darkMode ? 'bg-neutral-800' : 'bg-neutral-100',
          text: darkMode ? '#9CA3AF' : '#6B7280',
          icon: Calendar,
          label: 'Expired'
        };
      default:
        return {
          bg: darkMode ? 'bg-neutral-800' : 'bg-neutral-100',
          text: darkMode ? '#9CA3AF' : '#6B7280',
          icon: Tag,
          label: 'Unknown'
        };
    }
  };

  const getPerformanceColor = (usagePercentage) => {
    if (usagePercentage >= 70) return colors.success;
    if (usagePercentage >= 40) return colors.primary;
    if (usagePercentage >= 20) return colors.accent;
    return darkMode ? '#9CA3AF' : '#6B7280';
  };

  const getPerformanceLabel = (usagePercentage) => {
    if (usagePercentage >= 70) return 'Excellent';
    if (usagePercentage >= 40) return 'Good';
    if (usagePercentage >= 20) return 'Average';
    return 'Low';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading) {
    return (
      <div className="space-y-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl p-8 text-center ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
        <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button onClick={fetchPromotions} className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg">
          Try Again
        </button>
      </div>
    );
  }

  const activePromotions = promotions.filter(p => p.status === 'active').length;
  const totalRevenue = promotions.reduce((sum, p) => sum + (p.revenue_generated || 0), 0);
  const totalUses = promotions.reduce((sum, p) => sum + (p.total_uses || 0), 0);
  const avgDiscount = promotions.reduce((sum, p) => sum + (p.discount_value || 0), 0) / (promotions.length || 1);

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Promotions"
          value={activePromotions}
          icon={<Tag size={20} />}
          subtitle="Currently running"
          variant="success"
          darkMode={darkMode}
          lightBgOpacity={0.6}
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign size={20} />}
          subtitle="From promotions"
          variant="primary"
          darkMode={darkMode}
          lightBgOpacity={0.6}
        />
        <MetricCard
          title="Total Uses"
          value={totalUses}
          icon={<Users size={20} />}
          subtitle="Codes redeemed"
          variant="secondary"
          darkMode={darkMode}
        />
        <MetricCard
          title="Avg. Discount"
          value={`${avgDiscount.toFixed(0)}%`}
          icon={<Percent size={20} />}
          subtitle="Average value"
          variant="warning"
          darkMode={darkMode}
        />
      </div>

      {/* Filters Section */}
      <FilterControls
        darkMode={darkMode}
        title="Filter & Controls"
        description="Search, filter and manage your promotions"
        searchTerm={searchQuery}
        setSearchTerm={setSearchQuery}
        searchPlaceholder="Search by name, code, or description..."
        filters={[
          {
            value: filter,
            onChange: setFilter,
            defaultValue: 'all',
            defaultLabel: 'All Status',
            icon: 'status',
            options: [
              { value: 'all', label: 'All Status', icon: <Filter size={14} /> },
              { value: 'active', label: 'Active', icon: <CheckCircle size={14} className="text-emerald-500" /> },
              { value: 'scheduled', label: 'Scheduled', icon: <Clock size={14} className="text-purple-500" /> },
              { value: 'expired', label: 'Expired', icon: <X size={14} className="text-neutral-400" /> }
            ]
          }
        ]}
        viewMode={viewMode}
        setViewMode={setViewMode}
        actionButton={{
          show: true,
          text: "Create Promotion",
          icon: <Plus size={18} />,
          onClick: openCreateModal
        }}
        extraButtons={[
          { text: "Export", icon: <Download size={16} />, onClick: () => console.log('Export') }
        ]}
        filteredCount={filteredPromotions.length}
        totalCount={promotions.length}
        onReset={() => {
          setSearchQuery('');
          setFilter('all');
        }}
      />

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPromotions.map((promo) => {
          const statusStyle = getStatusStyle(promo.status);
          const StatusIcon = statusStyle.icon;
          const daysRemaining = getDaysRemaining(promo.end_date);
          const usagePercentage = promo.max_uses > 0 ? (promo.total_uses / promo.max_uses) * 100 : 0;
          const isActive = promo.status === 'active';
          const performanceColor = getPerformanceColor(usagePercentage);
          const performanceLabel = getPerformanceLabel(usagePercentage);
          
          return (
            <div 
              key={promo.id}
              className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div 
                className="absolute inset-0"
                style={{ 
                  background: darkMode 
                    ? `linear-gradient(145deg, ${statusStyle.text}15, transparent)`
                    : 'white',
                  boxShadow: darkMode 
                    ? 'none' 
                    : '0 10px 40px -15px rgba(0,0,0,0.1)'
                }}
              />
              
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{ 
                  boxShadow: `0 0 30px ${statusStyle.text}40`,
                  border: `1px solid ${statusStyle.text}30`
                }}
              />
              
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div 
                        className="relative p-3 rounded-xl overflow-hidden flex items-center justify-center"
                        style={{ 
                          border: `2px solid ${statusStyle.text}30`,
                          background: `${statusStyle.text}20`
                        }}
                      >
                        {promo.discount_type === 'percentage' ? (
                          <Percent size={26} style={{ color: statusStyle.text }} />
                        ) : promo.discount_type === 'fixed' ? (
                          <DollarSign size={26} style={{ color: statusStyle.text }} />
                        ) : (
                          <Tag size={26} style={{ color: statusStyle.text }} />
                        )}
                      </div>
                      
                      <div 
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-white dark:border-neutral-900 flex items-center justify-center"
                        style={{ 
                          background: `${statusStyle.text}90`,
                          boxShadow: `0 4px 10px ${statusStyle.text}60`
                        }}
                      >
                        <StatusIcon size={12} className="text-white" />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                          {promo.name}
                        </h3>
                        
                        <div 
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide whitespace-nowrap"
                          style={{ 
                            background: `${statusStyle.text}15`,
                            color: statusStyle.text,
                            border: `1px solid ${statusStyle.text}25`
                          }}
                        >
                          {statusStyle.label}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                          <span className={`text-xs font-mono ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                            {promo.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(promo.code)}
                            className="hover:bg-neutral-200 dark:hover:bg-neutral-700 p-0.5 rounded transition-colors"
                          >
                            <Copy size={12} className="text-neutral-400" />
                          </button>
                        </div>
                        <span className="text-xs text-neutral-400">•</span>
                        <span className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {promo.discount_type === 'percentage' ? `${promo.discount_value}% OFF` : 
                           promo.discount_type === 'fixed' ? `$${promo.discount_value} OFF` : 
                           'Free Shipping'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEditModal(promo)}
                      className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedPromotion(promo);
                        setShowDeleteConfirm(true);
                      }}
                      className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'} mb-6 line-clamp-2`}>
                  {promo.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div 
                    className="p-4 rounded-xl transition-all duration-300 group-hover:scale-[1.02]"
                    style={{ 
                      background: darkMode ? 'rgba(255,255,255,0.03)' : `${colors.primary}05`,
                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : `${colors.primary}15`}`
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        Validity Period
                      </span>
                      {isActive && daysRemaining > 0 && (
                        <span className="text-xs font-medium" style={{ color: colors.accent }}>
                          {daysRemaining} days left
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className={darkMode ? 'text-neutral-500' : 'text-neutral-400'} />
                        <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                          {new Date(promo.start_date).toLocaleDateString()} - {new Date(promo.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      {promo.min_purchase > 0 && (
                        <div className="flex items-center gap-2">
                          <DollarSign size={14} className={darkMode ? 'text-neutral-500' : 'text-neutral-400'} />
                          <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                            Min. purchase: ${promo.min_purchase}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div 
                    className="p-4 rounded-xl transition-all duration-300 group-hover:scale-[1.02]"
                    style={{ 
                      background: darkMode ? 'rgba(255,255,255,0.03)' : `${colors.secondary}05`,
                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : `${colors.secondary}15`}`
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        Usage
                      </span>
                      <span className={`text-xs font-medium`} style={{ color: performanceColor }}>
                        {performanceLabel}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                          {promo.total_uses || 0} / {promo.max_uses}
                        </span>
                        <span className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {usagePercentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="relative h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
                          style={{ 
                            width: `${Math.min(100, usagePercentage)}%`,
                            background: `linear-gradient(90deg, ${colors.primary}, ${statusStyle.text})`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Performance
                    </p>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${colors.primary}15` }}
                      >
                        <BarChart3 size={16} style={{ color: colors.primary }} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                          {performanceLabel}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          Performance rating
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Revenue
                    </p>
                    <div 
                      className="p-3 rounded-xl"
                      style={{ 
                        background: `${colors.accent}10`,
                        border: `1px solid ${colors.accent}20`
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                          {formatCurrency(promo.revenue_generated || 0)}
                        </span>
                      </div>
                      <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        Generated from sales
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    className="flex-1 group/btn relative overflow-hidden rounded-lg"
                    disabled={promo.status !== 'active'}
                  >
                    <div
                      className={`relative py-3 px-4 rounded-lg font-medium transition-all duration-300 
                               hover:-translate-y-0.5 flex items-center justify-center gap-2
                               ${promo.status !== 'active' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ 
                        background: promo.status === 'active' ? `${colors.primary}15` : `${darkMode ? '#374151' : '#e5e7eb'}`,
                        color: promo.status === 'active' ? colors.primary : (darkMode ? '#6B7280' : '#9CA3AF'),
                        border: `1px solid ${promo.status === 'active' ? `${colors.primary}25` : 'transparent'}`
                      }}
                    >
                      <Share2 size={18} className="group-hover/btn:scale-110 transition-transform" />
                      <span>Share</span>
                    </div>
                  </button>
                  
                  <button 
                    className="flex-1 group/btn relative overflow-hidden rounded-lg flex-1"
                    disabled={promo.status !== 'active'}
                  >
                    <div
                      className={`relative py-3 px-4 rounded-lg font-medium transition-all duration-300 
                               hover:-translate-y-0.5 flex items-center justify-center gap-2
                               ${promo.status !== 'active' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ 
                        background: promo.status === 'active' ? `${colors.secondary}15` : `${darkMode ? '#374151' : '#e5e7eb'}`,
                        color: promo.status === 'active' ? colors.secondary : (darkMode ? '#6B7280' : '#9CA3AF'),
                        border: `1px solid ${promo.status === 'active' ? `${colors.secondary}25` : 'transparent'}`
                      }}
                    >
                      <Bell size={18} className="group-hover/btn:scale-110 transition-transform" />
                      <span>Notify</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Empty State */}
      {filteredPromotions.length === 0 && (
        <div 
          className="relative overflow-hidden rounded-2xl p-16 text-center"
          style={{ 
            background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
          }}
        >
          <div className="absolute inset-0 opacity-5"
               style={{
                 background: `radial-gradient(circle at 20% 50%, ${colors.primary} 0%, transparent 50%)`
               }}
          />
          
          <div className="relative z-10">
            <div 
              className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ background: `${colors.primary}20` }}
            >
              <Gift size={40} style={{ color: colors.primary }} />
            </div>
            
            <h3 className={`text-2xl font-semibold mb-3 ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              No Promotions Found
            </h3>
            
            <p className={`text-lg ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {searchQuery ? 'No promotions match your search. Try different keywords.' : 'Create your first promotion to get started.'}
            </p>
            
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                }}
                className="mt-6 px-6 py-2.5 rounded-lg text-white font-medium shadow-lg
                         hover:shadow-xl transition-all hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                }}
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={openCreateModal}
                className="mt-6 px-6 py-2.5 rounded-lg text-white font-medium shadow-lg
                         hover:shadow-xl transition-all hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                }}
              >
                <Plus size={18} className="inline mr-2" />
                Create First Promotion
              </button>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Promotion Modal */}
      {(showCreateForm || editingPromotion) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${darkMode ? 'bg-neutral-800' : 'bg-white'}`}>
            <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${darkMode ? 'border-neutral-700' : 'border-neutral-200'} bg-inherit`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ background: `${colors.primary}15` }}>
                  {editingPromotion ? <Edit2 size={22} style={{ color: colors.primary }} /> : <Plus size={22} style={{ color: colors.primary }} />}
                </div>
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                  {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingPromotion(null);
                }}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100'}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Promotion Name *
                </label>
                <input
                  type="text"
                  value={newPromotion.name}
                  onChange={(e) => setNewPromotion({...newPromotion, name: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200'}`}
                  placeholder="Summer Sale 2024"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Discount Code *
                  </label>
                  <input
                    type="text"
                    value={newPromotion.code}
                    onChange={(e) => setNewPromotion({...newPromotion, code: e.target.value.toUpperCase()})}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200'}`}
                    placeholder="SUMMER24"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Discount Type
                  </label>
                  <select
                    value={newPromotion.type}
                    onChange={(e) => setNewPromotion({...newPromotion, type: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200'}`}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Discount Value *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={newPromotion.value}
                      onChange={(e) => setNewPromotion({...newPromotion, value: e.target.value})}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200'}`}
                      placeholder={newPromotion.type === 'percentage' ? "20" : "10"}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                      {newPromotion.type === 'percentage' ? '%' : '$'}
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Minimum Purchase ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPromotion.minPurchase}
                    onChange={(e) => setNewPromotion({...newPromotion, minPurchase: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200'}`}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={newPromotion.startDate}
                    onChange={(e) => setNewPromotion({...newPromotion, startDate: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={newPromotion.endDate}
                    onChange={(e) => setNewPromotion({...newPromotion, endDate: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Maximum Uses
                  </label>
                  <input
                    type="number"
                    value={newPromotion.maxUses}
                    onChange={(e) => setNewPromotion({...newPromotion, maxUses: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200'}`}
                    placeholder="1000"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Description
                </label>
                <textarea
                  value={newPromotion.description}
                  onChange={(e) => setNewPromotion({...newPromotion, description: e.target.value})}
                  rows="3"
                  className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 resize-none ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200'}`}
                  placeholder="Describe the promotion..."
                />
              </div>
            </div>

            <div className={`sticky bottom-0 flex justify-end gap-3 p-6 border-t ${darkMode ? 'border-neutral-700' : 'border-neutral-200'} bg-inherit`}>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingPromotion(null);
                }}
                className="px-4 py-2 rounded-lg font-medium bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePromotion}
                disabled={submitting}
                className="px-6 py-2 rounded-lg text-white font-medium transition-all hover:scale-105 disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
              >
                {submitting ? 'Saving...' : (editingPromotion ? 'Update Promotion' : 'Create Promotion')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedPromotion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-neutral-800' : 'bg-white'}`}>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 size={28} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Promotion</h3>
              <p className="text-neutral-500 mb-6">
                Are you sure you want to delete <span className="font-semibold">{selectedPromotion.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2 rounded-lg font-medium bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDeletePromotion} disabled={submitting} className="flex-1 px-4 py-2 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50">
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

export default PromotionsPage;