// src/pages/Marketing/components/TopProductsTable.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, TrendingUp, TrendingDown, Eye, Clock, 
  Package, ArrowUpRight, Star, Truck
} from 'lucide-react';
import IconWrapper from '../../../components/ui/IconWrapper';
import ProductViewModal from '../../Products/components/ProductViewModal';
import ReorderModal from '../../Products/components/ReorderModal';

const TopProductsTable = ({ darkMode, topProducts, onRefresh }) => {
  const navigate = useNavigate();
  
  // ✅ ✅ ✅ ألوان المشروع
  const colors = {
    primary: '#8B7ABA',
    secondary: '#F08FAE',
    accent: '#EE9C6C',
    success: '#34D19C'
  };

  // ✅ ✅ ✅ ألوان شريط التقدم حسب النسبة
  const getProgressColor = (performance) => {
    if (performance >= 80) return colors.success;      // أخضر
    if (performance >= 60) return colors.primary;      // بنفسجي
    if (performance >= 40) return colors.accent;       // برتقالي
    if (performance >= 20) return colors.secondary;    // وردي
    return '#EF4444'; // أحمر (في حالة أقل من 20%)
  };

  // ✅ ✅ ✅ لون النص حسب النسبة
  const getTextColor = (performance) => {
    if (performance >= 80) return colors.success;
    if (performance >= 60) return colors.primary;
    if (performance >= 40) return colors.accent;
    if (performance >= 20) return colors.secondary;
    return '#EF4444';
  };

  const [viewingProduct, setViewingProduct] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [reorderProduct, setReorderProduct] = useState(null);
  const [showReorderModal, setShowReorderModal] = useState(false);

  // ✅ ✅ ✅ دالة مساعدة للحصول على رابط الصورة
const getImageUrl = useCallback((image) => {
  if (!image) return null;
  if (typeof image === 'string') {
    if (image.startsWith('http')) return image;
    // ✅ استخدام VITE_API_URL من متغيرات البيئة
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const BASE_URL = API_URL.replace('/api', '');
    if (image.startsWith('/media/')) {
      return `${BASE_URL}${image}`;
    }
    return `${BASE_URL}/media/${image}`;
  }
  return null;
}, []);

  // ✅ ✅ ✅ دالة للحصول على صورة المنتج من مصادر متعددة
  const getProductImage = (product) => {
    if (product.image) {
      const url = getImageUrl(product.image);
      if (url) return url;
    }
    
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const url = getImageUrl(product.images[0]);
      if (url) return url;
    }
    
    if (product.image_url) {
      const url = getImageUrl(product.image_url);
      if (url) return url;
    }
    
    return null;
  };

  // ✅ تشخيص البيانات عند الاستلام
  useEffect(() => {
    if (topProducts && topProducts.length > 0) {
      console.log('📊 TopProductsTable received data:', topProducts);
    }
  }, [topProducts]);

  // ============================================
  // ✅ دوال الفتح والإغلاق
  // ============================================
  
  const handleViewProduct = (product) => {
    const imageUrl = getProductImage(product);
    
    const productData = {
      id: product.id,
      name: product.name,
      price: typeof product.revenue === 'number' 
        ? product.revenue / (product.sold_count || product.sales || 1) 
        : 0,
      quantity: product.stock || 0,
      category: product.category || 'Uncategorized',
      description: product.description || '',
      sku: product.sku || `SKU-${product.id}`,
      images: product.images || [],
      image: imageUrl,
      supplier: product.supplier || 'Unknown',
      manufacturer: product.manufacturer || '',
      weight: product.weight || '',
      dimensions: product.dimensions || '',
      warranty_months: product.warranty_months || '',
      tags: product.tags || '',
      featured: product.featured || false,
      in_stock: (product.stock || 0) > 0,
      currentStock: product.stock || 0,
      maxStock: Math.max(100, (product.stock || 0) * 1.5),
      stockPercentage: Math.min(100, ((product.stock || 0) / Math.max(100, (product.stock || 0) * 1.5)) * 100),
      value: typeof product.revenue === 'number' ? product.revenue : 0,
      lastUpdated: product.lastUpdated || new Date().toISOString().split('T')[0],
      monthlySales: product.sold_count || product.sales || 0,
      growth: product.growth || '0%'
    };
    
    setViewingProduct(productData);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingProduct(null);
  };

  const handleEditProduct = (product) => {
    navigate(`/products?edit=${product.id}`);
    setShowViewModal(false);
  };

  // ============================================
  // ✅ دوال إعادة الطلب (Reorder)
  // ============================================
  
  const openReorderModal = (product) => {
    const imageUrl = getProductImage(product);
    
    const productData = {
      id: product.id,
      name: product.name,
      price: typeof product.revenue === 'number' 
        ? product.revenue / (product.sold_count || product.sales || 1) 
        : 0,
      currentStock: product.stock || 0,
      supplier: product.supplier || 'Unknown Supplier',
      sku: product.sku || `SKU-${product.id}`,
      image: imageUrl,
      images: product.images || [],
      description: product.description || '',
      category: product.category || 'Uncategorized',
      manufacturer: product.manufacturer || '',
      weight: product.weight || '',
      dimensions: product.dimensions || '',
      warranty_months: product.warranty_months || '',
      tags: product.tags || '',
      featured: product.featured || false,
      value: typeof product.revenue === 'number' ? product.revenue : 0
    };
    
    setReorderProduct(productData);
    setShowReorderModal(true);
  };

  const handleReorderConfirm = async (orderData) => {
    alert(`✅ Order placed successfully for ${orderData.product.name}!`);
    
    if (onRefresh) {
      onRefresh();
    }
  };

  const closeReorderModal = () => {
    setShowReorderModal(false);
    setReorderProduct(null);
  };

  // ============================================
  // ✅ ✅ ✅ حساب النمو (Growth)
  // ============================================
  
  const calculateGrowth = (product) => {
    const currentSales = product.current_sales || product.sales || 0;
    const previousSales = product.previous_sales || 0;
    
    if (product.growth !== undefined && product.growth !== null && product.growth !== '') {
      const growthStr = String(product.growth).replace(/[+%]/g, '').trim();
      const growthNum = parseFloat(growthStr);
      if (!isNaN(growthNum) && growthNum !== 0) {
        return growthNum;
      }
    }
    
    if (previousSales === 0) {
      if (currentSales > 0) return 100;
      return 0;
    }
    
    const growth = ((currentSales - previousSales) / previousSales) * 100;
    return Math.round(growth * 10) / 10;
  };

  // ============================================
  // ✅ ✅ ✅ حساب الأداء (Performance)
  // ============================================
  
  const calculatePerformance = (product) => {
    let revenue = 0;
    
    if (typeof product.revenue === 'number') {
      revenue = product.revenue;
    } else if (typeof product.revenue === 'string') {
      revenue = parseFloat(product.revenue.replace(/[$,]/g, '')) || 0;
    } else if (product.revenue) {
      revenue = parseFloat(String(product.revenue).replace(/[$,]/g, '')) || 0;
    }
    
    const maxRevenue = topProducts.reduce((max, p) => {
      let pRevenue = 0;
      if (typeof p.revenue === 'number') {
        pRevenue = p.revenue;
      } else if (typeof p.revenue === 'string') {
        pRevenue = parseFloat(p.revenue.replace(/[$,]/g, '')) || 0;
      } else if (p.revenue) {
        pRevenue = parseFloat(String(p.revenue).replace(/[$,]/g, '')) || 0;
      }
      return Math.max(max, pRevenue);
    }, 0);
    
    if (maxRevenue === 0) return 0;
    return Math.round((revenue / maxRevenue) * 100);
  };

  const getRankIcon = (index) => {
    switch(index) {
      case 0: return <Star size={14} className="fill-amber-400 text-amber-400" />;
      case 1: return <Star size={14} className="fill-neutral-400 text-neutral-400" />;
      case 2: return <Star size={14} className="fill-orange-400 text-orange-400" />;
      default: return <span className="text-xs font-bold">{index + 1}</span>;
    }
  };

  const getRankColor = (index) => {
    switch(index) {
      case 0: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 1: return 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20';
      case 2: return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      default: return darkMode ? 'text-neutral-500 bg-neutral-800/50 border-neutral-700' : 'text-neutral-400 bg-neutral-100 border-neutral-200';
    }
  };

  const formatCurrency = (value) => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    if (typeof value === 'string' && value.startsWith('$')) return value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(value) || 0);
  };

  // ✅ إذا لم توجد بيانات
  if (!topProducts || topProducts.length === 0) {
    return (
      <div className={`rounded-2xl p-8 text-center ${darkMode ? 'bg-neutral-900/50 border border-neutral-800' : 'bg-white border border-neutral-200 shadow-lg'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
            <ShoppingBag size={32} className={darkMode ? 'text-neutral-600' : 'text-neutral-400'} />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>No Products Data</h3>
            <p className={`text-sm mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Add orders with products to see top products</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`rounded-2xl transition-all duration-300 ${darkMode ? 'bg-gradient-card-dark border border-neutral-800 hover:border-neutral-700 shadow-lg' : 'bg-gradient-card border border-neutral-200 hover:border-neutral-300 shadow-lg'}`}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconWrapper darkMode={darkMode} variant="primary" size={20}>
                <ShoppingBag />
              </IconWrapper>
              <div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>Top Products by Revenue</h3>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  {topProducts.length} products • Highest revenue generating
                </p>
              </div>
            </div>
            <button onClick={() => navigate('/products')} className="group flex items-center gap-2 px-5 py-2.5 bg-primary-800/80 hover:bg-primary-800/90 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
              <Eye size={16} className="group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm font-medium">View All</span>
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className={darkMode ? 'bg-neutral-900/50' : 'bg-primary-800/5'}>
                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Product</th>
                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Revenue</th>
                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Growth</th>
                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Performance</th>
                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => {
                const growthValue = calculateGrowth(product);
                const isPositive = growthValue >= 0;
                const performance = calculatePerformance(product);
                const progressColor = getProgressColor(performance);
                const textColor = getTextColor(performance);
                const rankIcon = getRankIcon(index);
                const rankColor = getRankColor(index);
                const salesCount = product.sold_count || product.sales || 0;
                
                // ✅ الحصول على الصورة
                const imageUrl = getProductImage(product);
                
                return (
                  <tr key={product.id || index} className={`border-t border-neutral-200 dark:border-neutral-800 transition-colors duration-200 ${darkMode ? 'hover:bg-neutral-800/50' : 'hover:bg-neutral-50'}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${rankColor} flex-shrink-0`}>
                          {rankIcon}
                        </div>
                        {/* ✅ صورة المنتج */}
                        {imageUrl ? (
                          <div className="w-10 h-10 p-1 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 bg-neutral-100 dark:bg-neutral-800">
                            <img 
                              key={`${product.id}-${imageUrl}`}
                              src={imageUrl} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.warn(`Failed to load image for ${product.name}:`, imageUrl);
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                            <Package size={18} className={darkMode ? "text-neutral-400" : "text-neutral-500"} />
                          </div>
                        )}
                        <div>
                          <p className={`font-semibold text-sm truncate max-w-[150px] ${darkMode ? 'text-white' : 'text-neutral-900'}`}>{product.name}</p>
                          <p className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>{salesCount} sales</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-neutral-600'}`}>{formatCurrency(product.revenue)}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${isPositive ? darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700' : darkMode ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-700'}`}>
                        {isPositive ? <TrendingUp size={12} className="text-emerald-500" /> : <TrendingDown size={12} className="text-rose-500" />}
                        {isPositive ? '+' : ''}{growthValue.toFixed(1)}%
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`flex-1 h-1.5 rounded-full ${darkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}>
                          {/* ✅ ✅ ✅ شريط التقدم بألوان المشروع */}
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${performance}%`,
                              backgroundColor: progressColor,
                              boxShadow: `0 0 8px ${progressColor}40`
                            }} 
                          />
                        </div>
                        {/* ✅ ✅ ✅ النص بلون المشروع */}
                        <span 
                          className={`text-xs font-medium min-w-[40px] text-right`}
                          style={{ color: textColor }}
                        >
                          {performance}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewProduct(product)}
                          className="group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
                          style={{ background: darkMode ? 'rgba(139, 122, 186, 0.15)' : 'rgba(139, 122, 186, 0.08)', color: darkMode ? '#A598D4' : colors.primary, border: `1px solid ${darkMode ? 'rgba(139, 122, 186, 0.2)' : 'rgba(139, 122, 186, 0.15)'}` }}
                        >
                          <Eye size={14} className="group-hover:scale-110 transition-transform duration-300" />
                          <span>View</span>
                        </button>
                        <button 
                          onClick={() => openReorderModal(product)}
                          className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
                          style={{ background: darkMode ? 'rgba(238, 156, 108, 0.15)' : 'rgba(238, 156, 108, 0.08)', color: darkMode ? '#EE9C6C' : colors.accent, border: `1px solid ${darkMode ? 'rgba(238, 156, 108, 0.2)' : 'rgba(238, 156, 108, 0.15)'}` }}
                        >
                          <Truck size={14} className="group-hover:scale-110 transition-transform duration-300" />
                          <span>Order</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className={`px-6 py-4 border-t flex items-center justify-between flex-wrap gap-2 ${darkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
          <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Showing <span className="font-semibold">{topProducts.length}</span> top products by revenue</p>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
              <Clock size={12} />
              <span>Updated: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Product View Modal */}
      {showViewModal && viewingProduct && (
        <ProductViewModal
          darkMode={darkMode}
          product={viewingProduct}
          onClose={handleCloseViewModal}
          onEdit={() => handleEditProduct(viewingProduct)}
        />
      )}

      {/* ✅ Reorder Modal */}
      <ReorderModal
        darkMode={darkMode}
        isOpen={showReorderModal}
        product={reorderProduct}
        onClose={closeReorderModal}
        onConfirm={handleReorderConfirm}
      />
    </>
  );
};

export default TopProductsTable;