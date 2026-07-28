import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, Package, ExternalLink, TrendingUp, 
  Loader2, RefreshCw, AlertCircle, ShoppingBag,
  ChevronDown, Calendar, TrendingDown
} from 'lucide-react';
import IconWrapper from '../../../components/ui/IconWrapper';
import { productService } from '../../../services/api';

const TopProductsWidget = ({ darkMode, topProducts: initialTopProducts }) => {
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const DISPLAY_COUNT = 5;

  // ✅ خيارات الفترة الزمنية
  const periodOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'Last 3 Months' },
    { value: 'year', label: 'This Year' },
  ];

  // ✅ ✅ ✅ دالة مساعدة للحصول على رابط الصورة
  const getImageUrl = useCallback((image) => {
    if (!image) return null;
    if (typeof image === 'string') {
      if (image.startsWith('http')) return image;
      if (image.startsWith('/media/')) return `http://localhost:8000${image}`;
      return `http://localhost:8000/media/${image}`;
    }
    return null;
  }, []);

  // ✅ ✅ ✅ دالة معالجة الصورة مع محاولة عدة مصادر
  const getProductImage = useCallback((product) => {
    // ✅ 1. حاول استخدام image
    if (product.image) {
      const url = getImageUrl(product.image);
      if (url) return url;
    }
    
    // ✅ 2. حاول استخدام أول صورة من images
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const url = getImageUrl(product.images[0]);
      if (url) return url;
    }
    
    // ✅ 3. حاول استخدام image_url
    if (product.image_url) {
      const url = getImageUrl(product.image_url);
      if (url) return url;
    }
    
    return null;
  }, [getImageUrl]);

  // ✅ جلب أفضل المنتجات
  const fetchTopProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productService.getTopSellingWithGrowth({
        limit: DISPLAY_COUNT
      });
      
      const products = response.data;
      
      const formattedProducts = products.map((product, index) => {
        const soldCount = product.sold_count || 0;
        const price = parseFloat(product.price) || 0;
        const revenue = soldCount * price;
        const growth = product.growth || 0;
        const isPositive = growth > 0;
        
        // ✅ ✅ ✅ الحصول على الصورة باستخدام الدالة المحسّنة
        const imageUrl = getProductImage(product);
        
        return {
          id: product.id,
          name: product.name,
          sales: soldCount,
          revenue: `$${revenue.toLocaleString()}`,
          growth: `${isPositive ? '+' : ''}${growth.toFixed(1)}%`,
          growthValue: growth,
          stock: product.quantity || 0,
          category: product.category || 'Uncategorized',
          image: imageUrl, // ✅ الصورة المعالجة
          rank: index + 1,
          isPositive: isPositive,
          currentSales: product.current_sales || 0,
          previousSales: product.previous_sales || 0,
          // ✅ ✅ ✅ حفظ مصادر الصورة الأصلية للتحديث
          rawImage: product.image,
          rawImages: product.images,
        };
      });
      
      setTopProducts(formattedProducts);
      setLastUpdated(new Date().toLocaleString());
      
    } catch (err) {
      console.error('❌ Error fetching top products:', err);
      setError('Failed to load top products');
      
      if (initialTopProducts && initialTopProducts.length > 0) {
        setTopProducts(initialTopProducts.slice(0, DISPLAY_COUNT));
      }
    } finally {
      setLoading(false);
    }
  }, [initialTopProducts, DISPLAY_COUNT, getProductImage]);

  useEffect(() => {
    fetchTopProducts();
  }, [fetchTopProducts]);



useEffect(() => {
  const handleProductUpdate = () => {
    console.log('🔄 Product updated, refreshing top products...');
    fetchTopProducts();
  };
  
  window.addEventListener('product-updated', handleProductUpdate);
  window.addEventListener('inventory-updated', handleProductUpdate);
  
  return () => {
    window.removeEventListener('product-updated', handleProductUpdate);
    window.removeEventListener('inventory-updated', handleProductUpdate);
  };
}, [fetchTopProducts]);

  // ✅ الحصول على لون الرتبة
  const getRankColor = (rank) => {
    switch(rank) {
      case 1: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 2: return 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20';
      case 3: return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      default: return darkMode ? 'text-neutral-500 bg-neutral-800/50 border-neutral-700' : 'text-neutral-400 bg-neutral-100 border-neutral-200';
    }
  };

  // ✅ الحصول على أيقونة الرتبة
  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return <Star size={14} className="fill-amber-400 text-amber-400" />;
      case 2: return <Star size={14} className="fill-neutral-400 text-neutral-400" />;
      case 3: return <Star size={14} className="fill-orange-400 text-orange-400" />;
      default: return <span className="text-xs font-bold">{rank}</span>;
    }
  };

  // ✅ حالة التحميل
  if (loading) {
    return (
      <div className={`rounded-xl p-6 transition-all duration-300 min-h-[350px] flex items-center justify-center ${darkMode ? 'bg-gradient-card-dark border border-neutral-800' : 'bg-gradient-card border border-neutral-200 shadow-xl'}`}>
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-3 text-primary-500" />
          <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Loading top products...</p>
        </div>
      </div>
    );
  }

  // ✅ حالة الخطأ
  if (error && topProducts.length === 0) {
    return (
      <div className={`rounded-xl p-6 transition-all duration-300 min-h-[350px] flex items-center justify-center ${darkMode ? 'bg-gradient-card-dark border border-neutral-800' : 'bg-gradient-card border border-neutral-200 shadow-xl'}`}>
        <div className="text-center">
          <AlertCircle size={32} className="mx-auto mb-3 text-amber-500" />
          <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>{error}</p>
          <button onClick={fetchTopProducts} className="mt-3 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 mx-auto">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-6 transition-all duration-300 ${
          darkMode 
            ? 'bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-800 hover:border-primary-500/30' 
            : 'bg-gradient-to-br from-white to-neutral-50 border-neutral-200/80 hover:border-primary-200 shadow-lg hover:shadow-2xl'
        }`}      >
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <IconWrapper darkMode={darkMode} variant="primary" size={20}>
            <Star />
          </IconWrapper>
          
          <div>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-neutral-900'}`}>Top Products</h3>
            <p className={`text-xs mt-0.5 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Best selling products</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* ✅ زر Refresh */}
          <button
            onClick={fetchTopProducts}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${darkMode ? 'hover:bg-neutral-700 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'}`}
            title="Refresh top products"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          
          <Link
            to="/products"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${darkMode ? 'bg-primary-800/80 hover:bg-primary-800/70 text-white border border-primary-800/80' : 'bg-primary-800/80 hover:bg-primary-800/90 text-white border border-primary-800/80 shadow-md hover:shadow-lg'}`}
          >
            View All
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      {/* ✅ قائمة المنتجات */}
      <div className="space-y-3">
        {topProducts.length > 0 ? (
          topProducts.map((product) => {
            // ✅ ✅ ✅ استخدام الصورة المعالجة
            const imageUrl = product.image;
            
            return (
              <div 
                key={product.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 hover:shadow-md ${darkMode ? 'bg-neutral-900/40 border border-neutral-800 hover:bg-neutral-800/60 hover:border-neutral-700' : 'bg-white border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 shadow-sm'}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* ✅ الرتبة */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${getRankColor(product.rank)} flex-shrink-0`}>
                    {getRankIcon(product.rank)}
                  </div>
                  
                  {/* ✅ صورة المنتج - مع مفتاح لإعادة التصيير */}
                  {imageUrl ? (
                    <div className="w-10 h-10 p-1 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-100 dark:bg-neutral-800">
                      <img 
                        key={`${product.id}-${imageUrl}`} // ✅ مفتاح فريد لإعادة التصيير عند تغيير الصورة
                        src={imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          console.warn(`Failed to load image for ${product.name}:`, imageUrl);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                      <Package size={18} className={darkMode ? "text-neutral-400" : "text-neutral-500"} />
                    </div>
                  )}
                  
                  {/* ✅ معلومات المنتج */}
                  <div className="min-w-0 flex-1">
                    <h4 className={`font-semibold text-sm truncate ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${darkMode ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-100 text-neutral-600'}`}>
                        {product.category}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {product.growthValue > 0 ? (
                          <>
                            <TrendingUp size={11} className="text-emerald-500" />
                            <span className={`text-[10px] font-semibold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                              {product.growth}
                            </span>
                          </>
                        ) : product.growthValue < 0 ? (
                          <>
                            <TrendingDown size={11} className="text-rose-500" />
                            <span className={`text-[10px] font-semibold ${darkMode ? 'text-rose-400' : 'text-rose-600'}`}>
                              {product.growth}
                            </span>
                          </>
                        ) : (
                          <span className={`text-[10px] font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                            {product.growth}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* ✅ الإحصائيات */}
                <div className="text-right flex-shrink-0 ml-3">
                  <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-neutral-700'}`}>
                    {product.revenue}
                  </p>
                  <div className="flex items-center justify-end gap-2 mt-0.5">
                    <span className={`text-[10px] font-medium ${product.stock > 20 ? darkMode ? 'text-emerald-400' : 'text-emerald-600' : product.stock > 10 ? darkMode ? 'text-amber-400' : 'text-amber-600' : darkMode ? 'text-rose-400' : 'text-rose-600'}`}>
                      {product.stock} in stock
                    </span>
                    <span className={`text-[10px] font-medium ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                      {product.sales} sold
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>No products available</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`mt-4 pt-3 border-t ${darkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
        <div className="flex items-center justify-between">
          <p className={`text-[11px] ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Top {topProducts.length} products
          </p>
          {lastUpdated && (
            <p className={`text-[10px] ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
              Updated: {lastUpdated}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopProductsWidget;