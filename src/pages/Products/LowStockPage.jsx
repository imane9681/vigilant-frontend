// src/pages/Products/LowStockPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Package, Bell, Truck, Zap,
  Filter, Search, Download, X, AlertCircle, TrendingUp,
  TrendingDown, BarChart3, Info, DollarSign, Calendar,
  Check, Mail, MessageSquare, CheckCircle, ChevronDown,
  Settings,
  MoreVertical, SlidersHorizontal, FileText, Eye, Edit2,
  List, Grid
} from 'lucide-react';
import MetricCard from '../Dashboard/components/MetricCard';
import IconWrapper from './../../components/ui/IconWrapper';
import FilterControls from '../../components/ui/FilterControls';
import { productService } from '../../services/api';
import ReorderModal from './components/ReorderModal';

const LowStockPage = ({ darkMode }) => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [restockNotes, setRestockNotes] = useState({});
  const [filter, setFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('urgency');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ Reorder Modal States
  const [reorderProduct, setReorderProduct] = useState(null);
  const [showReorderModal, setShowReorderModal] = useState(false);

  // ✅ ألوان المشروع
  const colors = {
    primary: '#8B7ABA',
    secondary: '#F08FAE',
    accent: '#EE9C6C',
    success: '#34D19C'
  };

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  const fetchLowStockItems = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll();
      const products = response.data.results || response.data;
      
      const lowStockProducts = products.filter(product => {
        const quantity = product.quantity || 0;
        return quantity <= 10;
      });
      
      const lowStockItems = lowStockProducts.map(product => {
        const quantity = product.quantity || 0;
        const price = parseFloat(product.price) || 0;
        
        let status = 'warning';
        let urgency = 'medium';
        
        if (quantity === 0) {
          status = 'out-of-stock';
          urgency = 'high';
        } else if (quantity <= 3) {
          status = 'critical';
          urgency = 'high';
        } else if (quantity <= 5) {
          urgency = 'high';
        } else if (quantity <= 10) {
          urgency = 'medium';
        }
        
        const daysOfStock = quantity > 0 ? Math.max(1, Math.ceil(quantity / 5)) : 0;
        const restockSuggestion = Math.max(10, Math.ceil(quantity * 1.5));
        
        // ✅ دالة للحصول على رابط الصورة
        const getImageUrl = (image) => {
          if (!image) return null;
          if (typeof image === 'string') {
            if (image.startsWith('http')) return image;
            if (image.startsWith('/media/')) return `http://localhost:8000${image}`;
            return `http://localhost:8000/media/${image}`;
          }
          return null;
        };
        
        // ✅ الحصول على الصورة
        let imageUrl = null;
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
          imageUrl = getImageUrl(product.images[0]);
        }
        if (!imageUrl && product.image) {
          imageUrl = getImageUrl(product.image);
        }
        
        return {
          id: product.id,
          name: product.name,
          sku: product.sku || `SKU-${product.id}`,
          category: product.category || 'Uncategorized',
          currentStock: quantity,
          minStock: 5,
          idealStock: 20,
          daysOfStock: daysOfStock,
          status: status,
          lastSold: 'Recently',
          supplier: product.manufacturer || 'Unknown Supplier',
          leadTime: '3-5 days',
          unitCost: price,
          totalValue: price * quantity,
          monthlySales: Math.floor(Math.random() * 50) + 10,
          urgency: urgency,
          restockSuggestion: restockSuggestion,
          image: imageUrl,
          price: price,
          description: product.description || '',
          manufacturer: product.manufacturer || '',
          weight: product.weight || '',
          dimensions: product.dimensions || '',
          warranty_months: product.warranty_months || '',
          tags: product.tags || '',
          featured: product.featured || false,
          images: product.images || []
        };
      });
      
      lowStockItems.sort((a, b) => {
        const urgencyOrder = { high: 3, medium: 2, low: 1 };
        return (urgencyOrder[b.urgency] - urgencyOrder[a.urgency]) || 
               (a.currentStock - b.currentStock);
      });
      
      setLowStockItems(lowStockItems);
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      setError('Failed to load low stock data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ فلترة البيانات
  useEffect(() => {
    let filtered = lowStockItems.filter(item => {
      if (filter !== 'all' && item.status !== filter) return false;
      if (urgencyFilter !== 'all' && item.urgency !== urgencyFilter) return false;
      if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !item.sku.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'urgency') {
        const urgencyOrder = { high: 3, medium: 2, low: 1 };
        return (urgencyOrder[b.urgency] - urgencyOrder[a.urgency]) || (a.daysOfStock - b.daysOfStock);
      } else if (sortBy === 'stock') {
        return a.currentStock - b.currentStock;
      } else if (sortBy === 'value') {
        return b.totalValue - a.totalValue;
      } else if (sortBy === 'sales') {
        return b.monthlySales - a.monthlySales;
      }
      return 0;
    });
    
    setFilteredItems(filtered);
  }, [lowStockItems, filter, urgencyFilter, searchTerm, sortBy]);

  // ============================================
  // ✅ دوال إعادة الطلب (Reorder)
  // ============================================
  const openReorderModal = (product) => {
    setReorderProduct(product);
    setShowReorderModal(true);
  };

  const handleReorderConfirm = async (orderData) => {
    alert(`✅ Order placed successfully for ${orderData.product.name}!`);
    await fetchLowStockItems();
  };

  const closeReorderModal = () => {
    setShowReorderModal(false);
    setReorderProduct(null);
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const handleRestockSelected = () => {
    if (selectedItems.length === 0) {
      alert('Please select items to restock');
      return;
    }
    
    const selectedNames = lowStockItems
      .filter(item => selectedItems.includes(item.id))
      .map(item => item.name)
      .join(', ');
    
    alert(`Initiating restock for: ${selectedNames}`);
  };

  const handleSendReminder = (supplier) => {
    alert(`Sending reminder to ${supplier}`);
  };

  const getUrgencyStyle = (urgency) => {
    switch(urgency) {
      case 'high':
        return {
          bg: darkMode ? 'bg-[#F08FAE]/20' : 'bg-[#F08FAE]/10',
          text: colors.secondary,
          border: darkMode ? 'border-[#F08FAE]/30' : 'border-[#F08FAE]/20',
          badge: darkMode 
            ? 'bg-[#F08FAE]/20 text-[#F08FAE] border border-[#F08FAE]/30' 
            : 'bg-[#F08FAE]/10 text-[#F08FAE] border border-[#F08FAE]/20'
        };
      case 'medium':
        return {
          bg: darkMode ? 'bg-[#EE9C6C]/20' : 'bg-[#EE9C6C]/10',
          text: colors.accent,
          border: darkMode ? 'border-[#EE9C6C]/30' : 'border-[#EE9C6C]/20',
          badge: darkMode 
            ? 'bg-[#EE9C6C]/20 text-[#EE9C6C] border border-[#EE9C6C]/30' 
            : 'bg-[#EE9C6C]/10 text-[#EE9C6C] border border-[#EE9C6C]/20'
        };
      case 'low':
        return {
          bg: darkMode ? 'bg-[#34D19C]/20' : 'bg-[#34D19C]/10',
          text: colors.success,
          border: darkMode ? 'border-[#34D19C]/30' : 'border-[#34D19C]/20',
          badge: darkMode 
            ? 'bg-[#34D19C]/20 text-[#34D19C] border border-[#34D19C]/30' 
            : 'bg-[#34D19C]/10 text-[#34D19C] border border-[#34D19C]/20'
        };
      default:
        return {
          bg: darkMode ? 'bg-[#8B7ABA]/20' : 'bg-[#8B7ABA]/10',
          text: colors.primary,
          border: darkMode ? 'border-[#8B7ABA]/30' : 'border-[#8B7ABA]/20',
          badge: darkMode 
            ? 'bg-[#8B7ABA]/20 text-[#8B7ABA] border border-[#8B7ABA]/30' 
            : 'bg-[#8B7ABA]/10 text-[#8B7ABA] border border-[#8B7ABA]/20'
        };
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'critical':
        return {
          bg: darkMode ? 'bg-[#F08FAE]/20' : 'bg-[#F08FAE]/10',
          text: colors.secondary,
          icon: AlertCircle,
          label: 'Critical'
        };
      case 'warning':
        return {
          bg: darkMode ? 'bg-[#EE9C6C]/20' : 'bg-[#EE9C6C]/10',
          text: colors.accent,
          icon: AlertTriangle,
          label: 'Warning'
        };
      case 'out-of-stock':
        return {
          bg: darkMode ? 'bg-neutral-700' : 'bg-neutral-100',
          text: darkMode ? '#9CA3AF' : '#6B7280',
          icon: Package,
          label: 'Out of Stock'
        };
      default:
        return {
          bg: darkMode ? 'bg-[#8B7ABA]/20' : 'bg-[#8B7ABA]/10',
          text: colors.primary,
          icon: Package,
          label: 'Low Stock'
        };
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // ============================================
  // ✅ عرض القائمة (List View) مع الصور
  // ============================================
  const renderListView = () => {
    return (
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const urgencyStyle = getUrgencyStyle(item.urgency);
          const statusStyle = getStatusStyle(item.status);
          const StatusIcon = statusStyle.icon;
          const isSelected = selectedItems.includes(item.id);
          const stockPercentage = (item.currentStock / item.idealStock) * 100;
          
          return (
            <div 
              key={item.id}
              className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
                isSelected ? 'ring-2 ring-[#8B7ABA]' : ''
              } hover:-translate-y-0.5 hover:shadow-lg`}
              style={{ 
                background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${isSelected ? colors.primary : (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)')}`
              }}
            >
              <div className="relative p-4">
                <div className="flex items-center gap-4">
                  {/* ✅ Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectItem(item.id)}
                    className="w-4 h-4 rounded flex-shrink-0"
                    style={{ accentColor: colors.primary }}
                  />
                  
                  {/* ✅ صورة المنتج */}
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${urgencyStyle.text}20` }}
                    >
                      <Package size={20} style={{ color: urgencyStyle.text }} />
                    </div>
                  )}
                  
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-7 gap-2 items-center">
                    {/* اسم المنتج */}
                    <div className="col-span-2">
                      <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {item.name}
                      </h4>
                      <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        {item.sku}
                      </p>
                    </div>
                    
                    {/* الحالة */}
                    <div>
                      <div 
                        className={`px-2 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 ${statusStyle.bg}`}
                        style={{ color: statusStyle.text }}
                      >
                        <StatusIcon size={10} />
                        <span>{statusStyle.label}</span>
                      </div>
                    </div>
                    
                    {/* المخزون */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                          {item.currentStock}
                        </span>
                        <span className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          / {item.idealStock}
                        </span>
                      </div>
                      <div className="w-24 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${Math.min(100, stockPercentage)}%`,
                            background: `linear-gradient(90deg, ${colors.primary}, ${urgencyStyle.text})`
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* المورد */}
                    <div className="hidden sm:block">
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {item.supplier}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        {item.leadTime}
                      </p>
                    </div>
                    
                    {/* القيمة */}
                    <div className="hidden sm:block">
                      <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {formatCurrency(item.totalValue)}
                      </p>
                    </div>
                    
                    {/* الأزرار */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openReorderModal(item)}
                        className={`p-2 rounded-lg transition-colors`}
                        style={{ background: `${colors.primary}20`, color: colors.primary }}
                        title="Order this product"
                      >
                        <Truck size={16} />
                      </button>
                      <button 
                        className={`p-2 rounded-lg transition-colors`}
                        style={{ background: `${colors.secondary}20`, color: colors.secondary }}
                        title="Contact supplier"
                      >
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ============================================
  // ✅ عرض الشبكة (Grid View)
  // ============================================
  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredItems.map((item) => {
          const urgencyStyle = getUrgencyStyle(item.urgency);
          const statusStyle = getStatusStyle(item.status);
          const StatusIcon = statusStyle.icon;
          const isSelected = selectedItems.includes(item.id);
          const stockPercentage = (item.currentStock / item.idealStock) * 100;
          const isLowStock = item.status === 'critical' || item.status === 'out-of-stock';
          
          return (
            <div 
              key={item.id}
              className={`group relative overflow-hidden rounded-2xl transition-all duration-500 ${
                isSelected ? 'ring-2 ring-[#8B7ABA]' : ''
              } hover:-translate-y-2 hover:shadow-2xl`}
            >
              <div 
                className="absolute inset-0"
                style={{ 
                  background: darkMode 
                    ? `linear-gradient(145deg, ${urgencyStyle.text}15, transparent)`
                    : 'white',
                  boxShadow: darkMode 
                    ? 'none' 
                    : '0 10px 40px -15px rgba(0,0,0,0.1)'
                }}
              />
              
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{ 
                  boxShadow: `0 0 30px ${urgencyStyle.text}40`,
                  border: `1px solid ${urgencyStyle.text}30`
                }}
              />
              
              <div 
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-500"
                style={{ 
                  background: `radial-gradient(circle, ${urgencyStyle.text} 0%, transparent 70%)`,
                }}
              />
              <div 
                className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-500"
                style={{ 
                  background: `radial-gradient(circle, ${urgencyStyle.text} 0%, transparent 70%)`,
                }}
              />
              
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div 
                        className="absolute inset-0 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity"
                        style={{ background: urgencyStyle.text }}
                      />
                      <div 
                        className="relative w-18 h-18 rounded-xl overflow-hidden"
                        style={{ 
                          boxShadow: `0 10px 20px -5px ${urgencyStyle.text}40`,
                          border: `2px solid ${urgencyStyle.text}30`
                        }}
                      >
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: `${urgencyStyle.text}20` }}
                          >
                            <Package size={28} style={{ color: urgencyStyle.text }} />
                          </div>
                        )}
                      </div>
                      
                      <div 
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-white dark:border-neutral-900 flex items-center justify-center"
                        style={{ 
                          background: urgencyStyle.text,
                          boxShadow: `0 4px 10px ${urgencyStyle.text}60`
                        }}
                      >
                        <StatusIcon size={12} className="text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                          {item.name}
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
                      <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        {item.sku} • {item.category}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div 
                      className={`relative w-5 h-5 rounded transition-all duration-300 ${
                        isSelected ? 'scale-110' : ''
                      }`}
                      style={{ 
                        background: isSelected ? colors.primary : 'transparent',
                        border: `2px solid ${isSelected ? 'transparent' : (darkMode ? '#4B5563' : '#D1D5DB')}`
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectItem(item.id)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {isSelected && (
                        <svg className="w-5 h-5 text-white p-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
                
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
                        Stock Level
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                          {item.currentStock}
                        </span>
                        <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                          / {item.idealStock}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mb-2">
                      <div 
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 group-hover:scale-x-105"
                        style={{ 
                          width: `${Math.min(100, stockPercentage)}%`,
                          background: `linear-gradient(90deg, ${colors.primary}, ${urgencyStyle.text})`
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={darkMode ? 'text-neutral-400' : 'text-neutral-500'}>
                        Min: {item.minStock}
                      </span>
                      <span 
                        className="font-medium"
                        style={{ color: urgencyStyle.text }}
                      >
                        {item.daysOfStock} days left
                      </span>
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
                        Monthly Sales
                      </span>
                      <div className="flex items-center gap-1">
                        <TrendingUp size={14} style={{ color: colors.secondary }} />
                        <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                          {item.monthlySales}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className={darkMode ? 'text-neutral-400' : 'text-neutral-500'}>
                          Value
                        </span>
                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                          {formatCurrency(item.totalValue)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={darkMode ? 'text-neutral-400' : 'text-neutral-500'}>
                          Last sold
                        </span>
                        <span className={darkMode ? 'text-neutral-300' : 'text-neutral-700'}>
                          {item.lastSold}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Supplier
                    </p>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${colors.primary}15` }}
                      >
                        <Package size={16} style={{ color: colors.primary }} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                          {item.supplier}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          Lead time: {item.leadTime}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Restock Suggestion
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
                          {item.restockSuggestion}
                        </span>
                        <span className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          units
                        </span>
                      </div>
                      <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        Est. cost: {formatCurrency(item.unitCost * item.restockSuggestion)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => openReorderModal(item)}
                    className="flex-1 group/btn relative overflow-hidden rounded-lg"
                  >
                    <div 
                      className="absolute inset-0 rounded-xl blur-md opacity-50 group-hover/btn:opacity-70 transition-opacity"
                      style={{ 
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                      }}
                    />
                    <div
                      className="relative py-3 px-4 rounded-lg font-medium transition-all duration-300 
                               hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      style={{ 
                        background: `${colors.primary}`,
                        color: 'white',
                        boxShadow: `0 10px 20px -5px ${colors.primary}60`
                      }}
                    >
                      <Truck size={18} className="group-hover/btn:animate-bounce" />
                      <span>Order Now</span>
                    </div>
                  </button>
                  
                  <button 
                    className="group/btn relative overflow-hidden rounded-lg flex-1"
                  >
                    <div
                      className="relative py-3 px-4 rounded-lg font-medium transition-all duration-300 
                               hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      style={{ 
                        background: `${colors.secondary}15`,
                        color: colors.secondary,
                        border: `1px solid ${colors.secondary}25`
                      }}
                    >
                      <MessageSquare size={18} className="group-hover/btn:scale-110 transition-transform" />
                      <span>Contact</span>
                    </div>
                  </button>
                </div>
                
                <div className="mt-4">
                  <textarea
                    placeholder="Add restock notes..."
                    value={restockNotes[item.id] || ''}
                    onChange={(e) => setRestockNotes({...restockNotes, [item.id]: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 
                             resize-none focus:ring-2"
                    style={{ 
                      background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      color: darkMode ? 'white' : 'neutral-900',
                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                      ringColor: colors.primary
                    }}
                    rows="2"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ✅ حساب الإحصائيات
  const criticalCount = lowStockItems.filter(item => item.status === 'critical').length;
  const warningCount = lowStockItems.filter(item => item.status === 'warning').length;
  const outOfStockCount = lowStockItems.filter(item => item.status === 'out-of-stock').length;
  const totalValueAtRisk = lowStockItems.reduce((sum, item) => sum + item.totalValue, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className={`rounded-2xl p-6 animate-pulse ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl ${darkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}></div>
            <div className="space-y-2 flex-1">
              <div className={`h-6 w-48 rounded ${darkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}></div>
              <div className={`h-4 w-64 rounded ${darkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`rounded-2xl p-5 animate-pulse ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className={`h-4 w-20 rounded ${darkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}></div>
                  <div className={`h-8 w-16 rounded ${darkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}></div>
                  <div className={`h-3 w-24 rounded ${darkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}></div>
                </div>
                <div className={`h-12 w-12 rounded-lg ${darkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}></div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`rounded-2xl overflow-hidden animate-pulse ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl ${darkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}></div>
                  <div className="space-y-2 flex-1">
                    <div className={`h-5 w-40 rounded ${darkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}></div>
                    <div className={`h-4 w-32 rounded ${darkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`h-4 w-full rounded ${darkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}></div>
                  <div className={`h-4 w-full rounded ${darkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl p-8 text-center ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button onClick={fetchLowStockItems} className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-2">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Critical Items"
          value={criticalCount.toString()}
          icon={<AlertCircle size={20} />}
          subtitle="Need immediate action"
          variant="success"
          lightBgOpacity={0.6}
          darkMode={darkMode}
        />
        <MetricCard
          title="Warning Items"
          value={warningCount.toString()}
          icon={<AlertTriangle size={20} />}
          subtitle="Plan restock soon"
          variant="primary"
          lightBgOpacity={0.6}
          darkMode={darkMode}
        />
        <MetricCard
          title="Out of Stock"
          value={outOfStockCount.toString()}
          icon={<Package size={20} />}
          subtitle="Urgent restock needed"
          variant="secondary"
          darkMode={darkMode}
        />
        <MetricCard
          title="Value at Risk"
          value={formatCurrency(totalValueAtRisk)}
          icon={<DollarSign size={20} />}
          subtitle="Total inventory value"
          variant="warning"
          darkMode={darkMode}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="group relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          style={{ 
            background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
          }}
        >
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ 
              background: `linear-gradient(135deg, ${colors.primary}10, transparent)`,
            }}
          />
          <div className="relative flex items-center gap-4">
            <div 
              className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110"
              style={{ background: `${colors.primary}20` }}
            >
              <Truck size={24} style={{ color: colors.primary }} />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                Quick Restock
              </h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Restock selected items
              </p>
            </div>
          </div>
          <div className="relative mt-4">
            <button
              onClick={handleRestockSelected}
              disabled={selectedItems.length === 0}
              className="relative w-full"
            >
              <div
                className={`w-full py-3 rounded-lg font-medium transition-all duration-300 
                  ${selectedItems.length > 0 
                    ? 'hover:-translate-y-0.5 hover:shadow-lg' 
                    : 'cursor-not-allowed'}`}
                style={{ 
                  background: selectedItems.length > 0 
                    ? `${colors.primary}15`
                    : darkMode 
                      ? '#1F2937' 
                      : '#F3F4F6',
                  color: selectedItems.length > 0 ? `${colors.primary}` : (darkMode ? '#6B7280' : '#9CA3AF'),
                  border: selectedItems.length > 0 ? `1px solid ${colors.primary}25` : `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <Truck size={20} />
                  <span>Restock Selected ({selectedItems.length})</span>
                </span>
              </div>
            </button>
          </div>
        </div>
        
        <div 
          className="group relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          style={{ 
            background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
          }}
        >
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ 
              background: `linear-gradient(135deg, ${colors.secondary}10, transparent)`,
            }}
          />
          <div className="relative flex items-center gap-4">
            <div 
              className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110"
              style={{ background: `${colors.secondary}20` }}
            >
              <Bell size={24} style={{ color: colors.secondary }} />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                Supplier Alerts
              </h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Send reminders to suppliers
              </p>
            </div>
          </div>
          <div className="relative mt-4 flex gap-3">
            <button
              onClick={() => handleSendReminder('All Suppliers')}
              className="flex-1"
            >
              <div
                className="flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                style={{ 
                  background: `${colors.secondary}15`,
                  color: colors.secondary,
                  border: `1px solid ${colors.secondary}25`
                }}
              >
                <Mail size={18} className="inline mr-2" />
                Email All
              </div>
            </button>
            <button
              className="py-3 px-4 rounded-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              style={{ 
                background: `${colors.secondary}15`,
                color: colors.secondary,
                border: `1px solid ${colors.secondary}25`
              }}
            >
              <MessageSquare size={18} />
            </button>
          </div>
        </div>
        
        <div 
          className="group relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          style={{ 
            background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
          }}
        >
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ 
              background: `linear-gradient(135deg, ${colors.accent}10, transparent)`,
            }}
          />
          <div className="relative flex items-center gap-4">
            <div 
              className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110"
              style={{ background: `${colors.accent}20` }}
            >
              <Zap size={24} style={{ color: colors.accent }} />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                Auto-Restock
              </h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Set up automatic reordering
              </p>
            </div>
          </div>
          <div className="relative mt-4">
            <button className="w-full">
              <div
                className="w-full py-3 rounded-lg font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ 
                  background: `${colors.accent}15`,
                  color: colors.accent,
                  border: `1px solid ${colors.accent}25`
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <Settings size={16} className="group-hover:rotate-90 transition-transform" />
                  <span>Configure Rules</span>
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* FilterControls */}
      <FilterControls
        darkMode={darkMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Search by product name or SKU..."
        filters={[
          {
            value: filter,
            onChange: setFilter,
            defaultValue: 'all',
            defaultLabel: 'All Status',
            icon: 'status',
            options: [
              { value: 'all', label: 'All Status', icon: <Filter size={14} /> },
              { value: 'critical', label: 'Critical', icon: <AlertCircle size={14} className="text-red-500" /> },
              { value: 'warning', label: 'Warning', icon: <AlertCircle size={14} className="text-yellow-500" /> },
              { value: 'out-of-stock', label: 'Out of Stock', icon: <X size={14} className="text-neutral-400" /> }
            ]
          },
          {
            value: urgencyFilter,
            onChange: setUrgencyFilter,
            defaultValue: 'all',
            defaultLabel: 'All Urgency',
            icon: 'sliders',
            options: [
              { value: 'all', label: 'All Urgency', icon: <Filter size={14} /> },
              { value: 'high', label: 'High Urgency', icon: <AlertCircle size={14} className="text-red-500" /> },
              { value: 'medium', label: 'Medium Urgency', icon: <AlertCircle size={14} className="text-yellow-500" /> },
              { value: 'low', label: 'Low Urgency', icon: <Check size={14} className="text-green-500" /> }
            ]
          }
        ]}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOptions={[
          { value: 'urgency', label: 'Sort by Urgency', icon: <AlertCircle size={14} /> },
          { value: 'stock', label: 'Sort by Stock', icon: <Package size={14} /> },
          { value: 'value', label: 'Sort by Value', icon: <DollarSign size={14} /> },
          { value: 'sales', label: 'Sort by Sales', icon: <TrendingUp size={14} /> }
        ]}
        viewMode={viewMode}
        setViewMode={setViewMode}
        extraButtons={[
          {
            text: "Export",
            icon: <Download size={16} />,
            onClick: () => console.log('Export')
          }
        ]}
        filteredCount={filteredItems.length}
        totalCount={lowStockItems.length}
        onReset={() => {
          setSearchTerm('');
          setFilter('all');
          setUrgencyFilter('all');
          setSortBy('urgency');
        }}
      />

      {/* Items Grid/List */}
      {filteredItems.length === 0 ? (
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
              style={{ background: `${colors.success}20` }}
            >
              <CheckCircle size={40} style={{ color: colors.success }} />
            </div>
            <h3 className={`text-2xl font-semibold mb-3 ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              No Low Stock Items Found
            </h3>
            <p className={`text-lg ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              All inventory levels are healthy. Great job!
            </p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                  setUrgencyFilter('all');
                }}
                className="mt-6 px-6 py-2.5 rounded-lg text-white font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        renderGridView()
      ) : (
        renderListView()
      )}

      {/* ✅ Reorder Modal */}
      <ReorderModal
        darkMode={darkMode}
        isOpen={showReorderModal}
        product={reorderProduct}
        onClose={closeReorderModal}
        onConfirm={handleReorderConfirm}
      />
    </div>
  );
};

export default LowStockPage;