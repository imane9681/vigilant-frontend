// src/pages/Dashboard/components/StockAlerts.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Package, 
  Database, 
  TrendingDown,
  AlertCircle,
  Clock,
  ShoppingCart,
  ExternalLink,
  Loader2,
  RefreshCw,
  Eye,
  X,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  Truck
} from 'lucide-react';
import IconWrapper from '../../../components/ui/IconWrapper';
import { productService } from '../../../services/api';
import ReorderModal from '../../Products/components/ReorderModal';

const StockAlerts = ({ darkMode, stockAlerts: initialStockAlerts }) => {
  const navigate = useNavigate();
  const [stockAlerts, setStockAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showAllModal, setShowAllModal] = useState(false);
  
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

  // ✅ جلب بيانات المخزون الحقيقية
  const fetchStockAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productService.getAll();
      const products = response.data.results || response.data;
      
      const lowStockProducts = products.filter(p => {
        const quantity = p.quantity || 0;
        return quantity <= 10;
      });
      
      const alerts = lowStockProducts.map(product => {
        const quantity = product.quantity || 0;
        
        let status = 'warning';
        if (quantity === 0) {
          status = 'critical';
        } else if (quantity <= 3) {
          status = 'critical';
        } else if (quantity <= 5) {
          status = 'warning';
        }
        
        const daysLeft = quantity > 0 ? Math.max(1, Math.ceil(quantity / 2)) : 0;
        const salesTrend = quantity > 0 ? -Math.floor(Math.random() * 30 + 5) : -45;
        
        return {
          id: product.id,
          name: product.name,
          category: product.category || 'Uncategorized',
          currentStock: quantity,
          threshold: 10,
          status: status,
          daysLeft: daysLeft,
          salesTrend: salesTrend,
          image: product.image || product.images?.[0] || null,
          price: parseFloat(product.price) || 0,
          supplier: product.manufacturer || 'Unknown Supplier',
          sku: product.sku || `SKU-${product.id}`,
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
      
      alerts.sort((a, b) => {
        const priority = { critical: 3, warning: 2 };
        return (priority[b.status] || 0) - (priority[a.status] || 0);
      });
      
      setStockAlerts(alerts);
      setLastUpdated(new Date().toLocaleString());
      
    } catch (err) {
      console.error('❌ Error fetching stock alerts:', err);
      setError('Failed to load stock alerts');
      
      if (initialStockAlerts && initialStockAlerts.length > 0) {
        setStockAlerts(initialStockAlerts);
      }
    } finally {
      setLoading(false);
    }
  }, [initialStockAlerts]);

  useEffect(() => {
    fetchStockAlerts();
  }, [fetchStockAlerts]);

  // ============================================
  // ✅ دوال إعادة الطلب (Reorder)
  // ============================================
  const openReorderModal = (product) => {
    setReorderProduct(product);
    setShowReorderModal(true);
  };

  const handleReorderConfirm = async (orderData) => {
    alert(`✅ Order placed successfully for ${orderData.product.name}!`);
    await fetchStockAlerts();
  };

  const closeReorderModal = () => {
    setShowReorderModal(false);
    setReorderProduct(null);
  };

  const criticalCount = stockAlerts.filter(p => p.status === 'critical').length;
  const warningCount = stockAlerts.filter(p => p.status === 'warning').length;
  const totalAlerts = stockAlerts.length;

  // ✅ عرض أول 4 تنبيهات
  const visibleAlerts = stockAlerts.slice(0, 4);
  const remainingAlerts = stockAlerts.slice(4);
  const remainingCount = remainingAlerts.length;

  // ✅ حالة التحميل
  if (loading) {
    return (
      <div className={`rounded-2xl p-5 transition-all duration-200 min-h-[300px] flex items-center justify-center ${darkMode ? 'bg-neutral-900/50 border border-neutral-800' : 'bg-white border border-neutral-200 shadow-sm'}`}>
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-3 text-primary-500" />
          <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Loading stock alerts...</p>
        </div>
      </div>
    );
  }

  // ✅ حالة الخطأ
  if (error && stockAlerts.length === 0) {
    return (
      <div className={`rounded-2xl p-5 transition-all duration-200 min-h-[300px] flex items-center justify-center ${darkMode ? 'bg-neutral-900/50 border border-neutral-800' : 'bg-white border border-neutral-200 shadow-sm'}`}>
        <div className="text-center">
          <AlertCircle size={32} className="mx-auto mb-3 text-amber-500" />
          <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>{error}</p>
          <button onClick={fetchStockAlerts} className="mt-3 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 mx-auto">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  // ✅ حالة عدم وجود تنبيهات
  if (stockAlerts.length === 0 && !loading) {
    return (
      <div className={`rounded-2xl p-5 transition-all duration-200 ${darkMode ? 'bg-neutral-900/50 border border-neutral-800' : 'bg-white border border-neutral-200 shadow-sm'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <IconWrapper darkMode={darkMode} variant="success" size={20}>
              <Package />
            </IconWrapper>
            <div>
              <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-neutral-900'}`}>Stock Alerts</h3>
              <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>All stock levels are healthy</p>
            </div>
          </div>
        </div>
        <div className="text-center py-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <p className={`text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>No stock alerts</p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>All products are well stocked</p>
        </div>
        <div className="mt-4 border-t border-neutral-200 dark:border-neutral-800 pt-4">
          <button onClick={() => setShowAllModal(true)} className={`flex items-center justify-center gap-3 py-2.5 rounded-lg font-medium transition-all duration-200 w-full ${darkMode ? 'bg-primary-800/80 hover:bg-primary-800/70 text-white' : 'bg-primary-800/80 hover:bg-primary-800/90 text-white border border-primary-800/80 shadow-sm'}`}>
            <Database size={18} /> View All Stock Reports <ExternalLink size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`rounded-2xl p-5 transition-all duration-200 ${
        darkMode 
            ? 'bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-800 hover:border-primary-500/30' 
            : 'bg-gradient-to-br from-white to-neutral-50 border-neutral-200/80 hover:border-primary-200 shadow-lg hover:shadow-2xl'
        }`}>
        
        {/* العنوان */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <IconWrapper darkMode={darkMode} variant="warning" size={20}>
              <AlertTriangle />
            </IconWrapper>
            <div>
              <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-neutral-900'}`}>Stock Alerts</h3>
              <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{totalAlerts} low stock items</p>
            </div>
          </div>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-error-900/30 text-error-400' : 'bg-error-100 text-error-700'}`}>
                {criticalCount} Critical
              </span>
            )}
            {warningCount > 0 && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-warning-900/30 text-warning-400' : 'bg-warning-100 text-warning-700'}`}>
                {warningCount} Warning
              </span>
            )}
          </div>
        </div>

        {/* عرض 4 تنبيهات - محسّن للاستجابة */}
        <div className="space-y-3">
          {visibleAlerts.map((product) => (
            <StockAlertItem 
              key={product.id} 
              product={product} 
              darkMode={darkMode} 
              colors={colors}
              onReorder={openReorderModal}
            />
          ))}
        </div>

        {/* زر View All Stock Reports */}
        <div className="mt-4">
          <button onClick={() => setShowAllModal(true)} className={`flex items-center justify-center gap-3 py-2.5 rounded-lg font-medium transition-all duration-200 w-full ${darkMode ? 'bg-primary-800/80 hover:bg-primary-800/70 text-white' : 'bg-primary-800/80 hover:bg-primary-800/90 text-white border border-primary-800/80 shadow-sm'}`}>
            <Database size={18} />
            <div>View All Stock Reports {remainingCount > 0 && (<span className="text-sm px-1 font-bold">({remainingCount})</span>)}</div>
          </button>
        </div>

        {/* وقت التحديث */}
        {lastUpdated && (
          <div className="mt-3 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-center">
            <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>Updated: {lastUpdated}</span>
          </div>
        )}
      </div>

      {/* ✅ القائمة المنبثقة لعرض جميع التنبيهات مع زر Reorder */}
      {showAllModal && (
        <AllAlertsModal
          alerts={stockAlerts}
          darkMode={darkMode}
          colors={colors}
          onClose={() => setShowAllModal(false)}
          onReorder={openReorderModal}
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

// ========== مكون عنصر التنبيه - محسّن للاستجابة ==========
const StockAlertItem = ({ product, darkMode, colors, onReorder }) => {
  const isCritical = product.status === 'critical';
  const stockPercentage = Math.min(100, (product.currentStock / product.threshold) * 100);
  const isLowStock = isCritical || product.status === 'warning';

  return (
    <div className={`p-3 rounded-xl transition-all duration-200 ${darkMode ? isCritical ? 'bg-error-900/20 border border-error-800/30' : 'bg-warning-900/20 border border-warning-800/30' : isCritical ? 'bg-error-50 border border-error-200' : 'bg-warning-50 border border-warning-200'}`}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        {/* الجزء الأيسر - معلومات المنتج */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg flex-shrink-0 ${darkMode ? 'bg-neutral-800/50' : 'bg-white shadow-xs'}`}>
              <Package size={18} className={isCritical ? "text-error-500" : "text-warning-500"} />
            </div>
            
            <div className="flex-1 min-w-0">
              {/* ✅ صف المنتج مع زر Order Now - محسّن */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                {/* اسم المنتج مع التحذير */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <h4 className={`font-semibold text-base truncate ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                    {product.name}
                  </h4>
                  {isCritical && (
                    <AlertCircle size={14} className="text-error-500 animate-pulse flex-shrink-0" />
                  )}
                </div>
                
                {/* ✅ زر Order Now - محسّن للاستجابة */}
                <button 
                  onClick={() => onReorder(product)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 whitespace-nowrap flex-shrink-0
                    ${isCritical 
                      ? darkMode 
                        ? 'bg-error-900/40 text-error-300 hover:bg-error-800' 
                        : 'bg-error-100 text-error-700 hover:bg-error-200'
                      : darkMode 
                        ? 'bg-warning-900/40 text-warning-300 hover:bg-warning-800' 
                        : 'bg-warning-100 text-warning-700 hover:bg-warning-200'
                    }`}
                >
                  <Truck size={14} />
                  <span className="hidden sm:inline">Order Now</span>
                  <span className="sm:hidden">Order</span>
                </button>
              </div>

              {/* ✅ صف المعلومات - محسّن للاستجابة */}
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className={`flex items-center gap-1 text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  <Package size={12} />
                  {product.currentStock}/{product.threshold} units
                </span>
                <span className={`flex items-center gap-1 text-xs ${isCritical ? darkMode ? 'text-error-400' : 'text-error-600' : darkMode ? 'text-warning-400' : 'text-warning-600'}`}>
                  <Clock size={12} />
                  {product.daysLeft}d left
                </span>
                <span className={`flex items-center gap-1 text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  <TrendingDown size={12} />
                  {product.salesTrend}%
                </span>
              </div>
            </div>
          </div>

          {/* ✅ شريط التقدم - محسّن */}
          <div className="mt-2 ml-11">
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`}>
              <div className={`h-full transition-all duration-500 ${isCritical ? 'bg-error-500' : 'bg-warning-500'}`} style={{ width: `${Math.min(stockPercentage, 100)}%` }} />
            </div>
            <div className="flex justify-between text-[10px] mt-0.5">
              <span className={darkMode ? 'text-neutral-400' : 'text-neutral-600'}>{product.currentStock} units remaining</span>
              <span className={isCritical ? darkMode ? 'text-error-400' : 'text-error-600' : darkMode ? 'text-warning-400' : 'text-warning-600'}>
                {isCritical ? 'Urgent' : 'Low'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== مكون القائمة المنبثقة ==========
const AllAlertsModal = ({ alerts, darkMode, colors, onClose, onReorder }) => {
  const navigate = useNavigate();
  
  const sortedAlerts = [...alerts].sort((a, b) => {
    const priority = { critical: 3, warning: 2 };
    return (priority[b.status] || 0) - (priority[a.status] || 0);
  });

  const criticalCount = sortedAlerts.filter(p => p.status === 'critical').length;
  const warningCount = sortedAlerts.filter(p => p.status === 'warning').length;

  const goToLowStock = () => {
    navigate('/low-stock');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className={`relative w-full max-w-xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden ${
          darkMode 
            ? 'bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-800 hover:border-primary-500/30' 
            : 'bg-gradient-to-br from-white to-neutral-50 border-neutral-200/80 hover:border-primary-200 shadow-lg hover:shadow-2xl'
        }`}         
        onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${darkMode ? 'border-neutral-700' : 'border-neutral-200'} ${darkMode ? 'bg-neutral-900/95' : 'bg-white/95'} backdrop-blur-sm`}>
          <div className="flex items-center gap-3">
            <IconWrapper darkMode={darkMode} variant="warning" size={20}>
              <AlertTriangle />
            </IconWrapper>
            <div>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>All Stock Alerts ({alerts.length})</h3>
              <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>{criticalCount} critical • {warningCount} warning</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100'}`}>
            <X size={20} className={darkMode ? 'text-neutral-400' : 'text-neutral-500'} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[55vh] space-y-3">
          {sortedAlerts.map((product) => (
            <ModalAlertItem 
              key={product.id} 
              product={product} 
              darkMode={darkMode} 
              colors={colors}
              onReorder={onReorder}
            />
          ))}
        </div>

        {/* Footer */}
        <div className={`sticky bottom-0 p-4 border-t flex items-center justify-between gap-3 ${darkMode ? 'border-neutral-700' : 'border-neutral-200'} ${darkMode ? 'bg-neutral-900/95' : 'bg-white/95'} backdrop-blur-sm`}>
          <button onClick={goToLowStock} className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${darkMode ? 'bg-error-900/30 hover:bg-error-800/40 text-error-400 border border-error-800/30' : 'bg-error-100 hover:bg-error-200 text-error-700 border border-error-200'}`}>
            <AlertTriangle size={16} /> View Low Stock Products <ArrowRight size={14} />
          </button>
          <button onClick={onClose} className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${darkMode ? 'bg-neutral-700 hover:bg-neutral-600 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'}`}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ========== مكون عنصر التنبيه في القائمة المنبثقة - محسّن ==========
const ModalAlertItem = ({ product, darkMode, colors, onReorder }) => {
  const isCritical = product.status === 'critical';
  const stockPercentage = Math.min(100, (product.currentStock / product.threshold) * 100);
  const isLowStock = isCritical || product.status === 'warning';

  return (
    <div className={`p-3 rounded-xl transition-all duration-200 ${darkMode ? isCritical ? 'bg-error-900/20 border border-error-800/30' : 'bg-warning-900/20 border border-warning-800/30' : isCritical ? 'bg-error-50 border border-error-200' : 'bg-warning-50 border border-warning-200'}`}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg flex-shrink-0 ${darkMode ? 'bg-neutral-800/50' : 'bg-white shadow-xs'}`}>
              <Package size={18} className={isCritical ? "text-error-500" : "text-warning-500"} />
            </div>
            
            <div className="flex-1 min-w-0">
              {/* ✅ صف المنتج مع زر Order Now - محسّن */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <h4 className={`font-semibold text-base truncate ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                    {product.name}
                  </h4>
                  {isCritical && (
                    <AlertCircle size={14} className="text-error-500 animate-pulse flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${isCritical ? darkMode ? 'bg-error-900/40 text-error-300' : 'bg-error-100 text-error-700' : darkMode ? 'bg-warning-900/40 text-warning-300' : 'bg-warning-100 text-warning-700'}`}>
                    {isCritical ? 'Critical' : 'Warning'}
                  </span>
                  <button 
                    onClick={() => onReorder(product)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 whitespace-nowrap
                      ${isCritical 
                        ? darkMode 
                          ? 'bg-error-900/40 text-error-300 hover:bg-error-800' 
                          : 'bg-error-100 text-error-700 hover:bg-error-200'
                        : darkMode 
                          ? 'bg-warning-900/40 text-warning-300 hover:bg-warning-800' 
                          : 'bg-warning-100 text-warning-700 hover:bg-warning-200'
                      }`}
                  >
                    <Truck size={12} />
                    <span className="hidden sm:inline">Order Now</span>
                    <span className="sm:hidden">Order</span>
                  </button>
                </div>
              </div>

              {/* ✅ صف المعلومات - محسّن */}
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className={`flex items-center gap-1 text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  <Package size={12} />
                  {product.currentStock}/{product.threshold} units
                </span>
                <span className={`flex items-center gap-1 text-xs ${isCritical ? darkMode ? 'text-error-400' : 'text-error-600' : darkMode ? 'text-warning-400' : 'text-warning-600'}`}>
                  <Clock size={12} />
                  {product.daysLeft}d left
                </span>
                <span className={`flex items-center gap-1 text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  <TrendingDown size={12} />
                  {product.salesTrend}%
                </span>
              </div>
            </div>
          </div>

          {/* ✅ شريط التقدم - محسّن */}
          <div className="mt-2 ml-11">
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`}>
              <div className={`h-full transition-all duration-500 ${isCritical ? 'bg-error-500' : 'bg-warning-500'}`} style={{ width: `${Math.min(stockPercentage, 100)}%` }} />
            </div>
            <div className="flex justify-between text-[10px] mt-0.5">
              <span className={darkMode ? 'text-neutral-400' : 'text-neutral-600'}>{product.currentStock} units remaining</span>
              <span className={isCritical ? darkMode ? 'text-error-400' : 'text-error-600' : darkMode ? 'text-warning-400' : 'text-warning-600'}>
                {isCritical ? 'Urgent' : 'Low'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAlerts;