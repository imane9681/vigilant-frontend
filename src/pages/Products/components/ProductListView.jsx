import React from 'react';
import { 
  Trash2, 
  Edit2, 
  Package, 
  Star,
  X,
  AlertCircle,
  CheckCircle,
  Tag,
  Hash,
  Globe,
  Scale,
  ShieldCheck,
  Calendar,
  Laptop,
  Shirt,
  Home,
  BookOpen,
  Activity,
  Heart,
  Sparkle,
  Layers,
  Award,
  FolderTree
} from 'lucide-react';

const ProductListView = ({ 
  darkMode, 
  products, 
  handleEditClick, 
  handleDelete,
  getCategoryName,
  getCategoryIcon,
  getCategoryColorClass 
}) => {
  // الألوان المحددة
  const colors = {
    primary: '#8B7ABA',
    secondary: '#F08FAE',
    accent: '#EE9C6C',
    success: '#34D19C'
  };

  // ✅ ✅ ✅ صور افتراضية حسب الفئة
  const getFallbackImage = (category) => {
    const fallbackImages = {
      'Electronics': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=100&h=100&fit=crop',
      'Clothing': 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=100&h=100&fit=crop',
      'Home & Garden': 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=100&h=100&fit=crop',
      'Books': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=100&h=100&fit=crop',
      'Sports': 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=100&h=100&fit=crop',
      'Health': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=100&h=100&fit=crop',
      'Beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop',
      'Other': 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&h=100&fit=crop'
    };
    
    const getCategoryName = (cat) => {
      if (typeof cat === 'string' && cat.match(/^\d+$/)) {
        const names = { '1': 'Electronics', '2': 'Clothing', '3': 'Books',
                        '4': 'Home & Garden', '5': 'Sports', '6': 'Health', '7': 'Beauty' };
        return names[cat] || 'Other';
      }
      return cat || 'Other';
    };
    
    return fallbackImages[getCategoryName(category)] || fallbackImages['Other'];
  };

  // دالة للحصول على اسم الفئة
  const getCategoryNameDisplay = (categoryId) => {
    if (getCategoryName) {
      const name = getCategoryName(categoryId);
      if (name) return name;
    }
    
    if (typeof categoryId === 'string' && !categoryId.match(/^\d+$/)) {
      return categoryId;
    }
    
    const categoryNames = {
      '1': 'Electronics',
      '2': 'Clothing',
      '3': 'Books',
      '4': 'Home & Garden',
      '5': 'Sports',
      '6': 'Health',
      '7': 'Beauty'
    };
    
    return categoryNames[categoryId] || 'Other';
  };

  // دالة للحصول على أيقونة الفئة
  const getCategoryIconComponent = (categoryId, size = 16) => {
    if (getCategoryIcon) {
      const icon = getCategoryIcon(categoryId, size);
      if (icon) return icon;
    }
    
    const icons = {
      'Electronics': <Laptop size={size} style={{ color: colors.primary }} />,
      'Clothing': <Shirt size={size} style={{ color: colors.secondary }} />,
      'Home & Garden': <Home size={size} style={{ color: colors.accent }} />,
      'Books': <BookOpen size={size} style={{ color: colors.success }} />,
      'Sports': <Activity size={size} style={{ color: colors.primary }} />,
      'Health': <Heart size={size} style={{ color: colors.secondary }} />,
      'Beauty': <Sparkle size={size} style={{ color: colors.accent }} />,
      'Other': <Package size={size} style={{ color: colors.success }} />
    };
    
    if (typeof categoryId === 'string') {
      return icons[categoryId] || <FolderTree size={size} style={{ color: colors.primary }} />;
    }
    
    const categoryNames = {
      '1': 'Electronics',
      '2': 'Clothing',
      '3': 'Books',
      '4': 'Home & Garden',
      '5': 'Sports',
      '6': 'Health',
      '7': 'Beauty'
    };
    
    return icons[categoryNames[categoryId]] || <FolderTree size={size} style={{ color: colors.primary }} />;
  };

  // دالة للحصول على لون الفئة
  const getCategoryColorDisplay = (categoryId) => {
    if (getCategoryColorClass) {
      const color = getCategoryColorClass(categoryId);
      if (color) return color;
    }
    
    const colors = {
      'Electronics': darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700',
      'Clothing': darkMode ? 'bg-pink-900/30 text-pink-400' : 'bg-pink-100 text-pink-700',
      'Home & Garden': darkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700',
      'Books': darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
      'Sports': darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700',
      'Health': darkMode ? 'bg-pink-900/30 text-pink-400' : 'bg-pink-100 text-pink-700',
      'Beauty': darkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700',
      'Other': darkMode ? 'bg-neutral-800/30 text-neutral-400' : 'bg-neutral-100 text-neutral-700'
    };
    
    if (typeof categoryId === 'string') {
      return colors[categoryId] || colors['Other'];
    }
    
    const categoryNames = {
      '1': 'Electronics',
      '2': 'Clothing',
      '3': 'Books',
      '4': 'Home & Garden',
      '5': 'Sports',
      '6': 'Health',
      '7': 'Beauty'
    };
    
    return colors[categoryNames[categoryId]] || colors['Other'];
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { 
      text: 'Out of Stock', 
      badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      icon: <X size={14} className="text-red-500" />
    };
    if (quantity <= 10) return { 
      text: 'Low Stock', 
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      icon: <AlertCircle size={14} className="text-amber-500" />
    };
    return { 
      text: 'In Stock', 
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      icon: <CheckCircle size={14} className="text-emerald-500" />
    };
  };

  const formatPrice = (price) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(Number(price) || 0);
    } catch {
      return '$0.00';
    }
  };

  // ✅ ✅ ✅ الدالة الرئيسية لبناء رابط الصورة (محسنة)
  const getImageUrl = (product) => {
    // دالة مساعدة لتنسيق مسار الصورة
    const formatImage = (path) => {
      if (!path) return null;
      
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }
      
      if (path.startsWith('data:')) {
        return path;
      }
      
      let cleanPath = path;
      if (cleanPath.startsWith('/media/')) {
        cleanPath = cleanPath.substring(6);
      } else if (cleanPath.startsWith('media/')) {
        cleanPath = cleanPath.substring(6);
      }
      cleanPath = cleanPath.replace(/^\/+/, '');
      
      // ✅ استخدام الـ Backend URL مباشرة
      const baseUrl = 'https://vigilant-backend-8owb.onrender.com';
      return `${baseUrl}/media/${cleanPath}`;
    };
    
    // ✅ البحث عن الصورة في images فقط (أول صورة)
    const imagePath = product?.images?.[0];
    
    if (imagePath) {
      const formatted = formatImage(imagePath);
      if (formatted) return formatted;
    }
    
    // ✅ إذا لم توجد صورة، استخدم الصورة الافتراضية
    return getFallbackImage(product?.category);
  };

  if (!products || products.length === 0) {
    return (
      <div className={`rounded-2xl border p-16 text-center ${
        darkMode 
          ? 'bg-neutral-800/90 border-neutral-700' 
          : 'bg-white border-neutral-200'
      }`}>
        <Package size={48} className="mx-auto mb-4 opacity-30" style={{ color: colors.primary }} />
        <p className={`text-lg ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>No products to display</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-lg ${
      darkMode 
        ? 'bg-neutral-800/90 border-neutral-700/50' 
        : 'bg-white border-neutral-200/50'
    }`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={darkMode ? 'bg-neutral-900/50' : 'bg-neutral-50'}>
              <th className={`py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Product
              </th>
              <th className={`py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Category
              </th>
              <th className={`py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Price
              </th>
              <th className={`py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Stock
              </th>
              <th className={`py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Status
              </th>
              <th className={`py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-neutral-700' : 'divide-neutral-200'}`}>
            {products.map((product, index) => {
              const stockStatus = getStockStatus(product.quantity);
              const imageUrl = getImageUrl(product);
              const categoryName = getCategoryNameDisplay(product.category);
              const categoryIcon = getCategoryIconComponent(product.category, 16);
              const categoryColor = getCategoryColorDisplay(product.category);
              
              return (
                <tr 
                  key={product.id} 
                  className={`transition-all duration-300 hover:shadow-md group
                    ${darkMode 
                      ? 'hover:bg-neutral-700/30' 
                      : 'hover:bg-neutral-50'
                    }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className={`relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0
                        ${darkMode ? 'bg-neutral-700' : 'bg-gradient-to-br from-neutral-100 to-neutral-200'}`}>
                        <img 
                          src={imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = getFallbackImage(product?.category);
                          }}
                        />
                        
                        {product.featured && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-lg"
                               style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.secondary})` }}>
                            <Award size={10} className="text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className={`font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                          {product.name}
                          {product.featured && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          {product.sku && (
                            <div className={`flex items-center gap-1 text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                              <Hash size={10} />
                              <span className="font-mono">{product.sku}</span>
                            </div>
                          )}
                          <div className={`flex items-center gap-1 text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                            <Calendar size={10} />
                            <span>
                              {new Date(product.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${categoryColor} rounded-lg text-sm font-medium`}>
                      {categoryIcon}
                      <span>{categoryName}</span>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className={`text-lg font-bold`} style={{ color: colors.primary }}>
                      {formatPrice(product.price)}
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {product.quantity}
                      </div>
                      <div className={`w-16 h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}>
                        <div 
                          className={`h-full transition-all duration-500 ${
                            product.quantity > 20 ? 'bg-emerald-500' : 
                            product.quantity > 10 ? 'bg-amber-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((product.quantity / 50) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${stockStatus.badge} rounded-lg text-sm font-medium`}>
                      {stockStatus.icon}
                      <span>{stockStatus.text}</span>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="p-2.5 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 group/btn
                                 bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm hover:shadow-md"
                        style={{ color: colors.primary }}
                        aria-label={`Edit ${product.name}`}
                        title="Edit product"
                      >
                        <Edit2 size={16} className="transition-transform group-hover/btn:rotate-12" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2.5 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 group/btn
                                 bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm hover:shadow-md"
                        style={{ color: colors.secondary }}
                        aria-label={`Delete ${product.name}`}
                        title="Delete product"
                      >
                        <Trash2 size={16} className="transition-transform group-hover/btn:rotate-12" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductListView;