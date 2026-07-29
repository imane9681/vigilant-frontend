import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  Edit2, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Globe, 
  Package, 
  Award,
  Tag,
  Calendar,
  ShieldCheck,
  Scale,
  Ruler,
  Heart,
  Sparkle,
  Laptop,
  Shirt,
  Home,
  BookOpen,
  Activity,
  Hash,
  Clock,
  Image,
  ChevronLeft,
  ChevronRight,
  FolderTree
} from 'lucide-react';

const ProductGrid = ({ 
  darkMode, 
  products, 
  handleEditClick, 
  handleDelete,
  getCategoryName,
  getCategoryIcon,
  getCategoryColorClass 
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState({});

  // تشخيص البيانات
  useEffect(() => {
    if (products && products.length > 0) {

      products.forEach((product, index) => {
        
      });
    }
  }, [products]);

  const colors = {
    primary: '#8B7ABA',
    secondary: '#F08FAE',
    accent: '#EE9C6C',
    success: '#34D19C',
    gradient: 'linear-gradient(135deg, #8B7ABA 0%, #F08FAE 50%, #EE9C6C 100%)'
  };

  const categoryImages = {
    'Electronics': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&h=600&fit=crop&auto=format',
    'Clothing': 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=600&fit=crop&auto=format',
    'Home & Garden': 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&h=600&fit=crop&auto=format',
    'Books': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=600&fit=crop&auto=format',
    'Sports': 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&h=600&fit=crop&auto=format',
    'Health': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=600&fit=crop&auto=format',
    'Beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop&auto=format',
    'Other': 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=600&fit=crop&auto=format'
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { 
      text: 'Out of Stock', 
      badge: 'bg-gradient-to-r from-red-500/10 to-red-600/5 text-red-600 dark:from-red-500/20 dark:to-red-600/10 dark:text-red-400',
      icon: <X size={12} className="text-red-500" />,
      progress: 0,
      color: '#ef4444'
    };
    if (quantity <= 10) return { 
      text: 'Low Stock', 
      badge: 'bg-gradient-to-r from-amber-500/10 to-amber-600/5 text-amber-600 dark:from-amber-500/20 dark:to-amber-600/10 dark:text-amber-400',
      icon: <AlertCircle size={12} className="text-amber-500" />,
      progress: 25,
      color: colors.accent
    };
    return { 
      text: 'In Stock', 
      badge: 'bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 text-emerald-600 dark:from-emerald-500/20 dark:to-emerald-600/10 dark:text-emerald-400',
      icon: <CheckCircle size={12} className="text-emerald-500" />,
      progress: 100,
      color: colors.success
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

  // دالة محسنة لجلب جميع صور المنتج
  const getProductImages = (product) => {
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    if (product?.image && typeof product.image === 'string') {
      return [product.image];
    }
    if (product?.image_url && typeof product.image_url === 'string') {
      return [product.image_url];
    }
    return [categoryImages[product?.category] || categoryImages['Other']];
  };

  // دالة محسنة لجلب URL الصورة
  const getImageUrl = (image, product) => {
    if (!image) {
      return categoryImages[product?.category] || categoryImages['Other'];
    }
    if (typeof image === 'string') {
      if (image.startsWith('http')) return image;
      if (image.startsWith('/media/')) {
        return `http://localhost:8000${image}`;
      }
      if (image.startsWith('data:')) return image;
      return `http://localhost:8000/media/${image.replace(/^\/+/, '')}`;
    }
    return categoryImages[product?.category] || categoryImages['Other'];
  };

  // ✅ دالة للحصول على أيقونة الفئة (محسنة)
  const getCategoryIconComponent = (categoryId, size = 16) => {
    // إذا كانت الدالة getCategoryIcon مرسلة من الخارج
    if (getCategoryIcon) {
      const icon = getCategoryIcon(categoryId, size);
      if (icon) return icon;
    }
    
    // fallback: استخدام الأيقونات الافتراضية
    const icons = {
      'Electronics': <Laptop size={size} className="transition-transform group-hover:rotate-12" />,
      'Clothing': <Shirt size={size} className="transition-transform group-hover:scale-110" />,
      'Home & Garden': <Home size={size} className="transition-transform group-hover:translate-y-[-2px]" />,
      'Books': <BookOpen size={size} className="transition-transform group-hover:rotate-[-5deg]" />,
      'Sports': <Activity size={size} className="transition-transform group-hover:scale-110" />,
      'Health': <Heart size={size} className="transition-transform group-hover:scale-110 group-hover:text-red-500" />,
      'Beauty': <Sparkle size={size} className="transition-transform group-hover:rotate-12 group-hover:scale-110" />,
      'Other': <Package size={size} className="transition-transform group-hover:translate-y-[-2px]" />
    };
    
    // ✅ استخدام اسم الفئة إذا كان categoryId هو اسم، أو البحث في الفئات
    if (typeof categoryId === 'string') {
      return icons[categoryId] || <FolderTree size={size} />;
    }
    return <FolderTree size={size} />;
  };

  // ✅ دالة للحصول على اسم الفئة (محسنة)
  const getCategoryNameDisplay = (categoryId) => {
    if (getCategoryName) {
      const name = getCategoryName(categoryId);
      if (name) return name;
    }
    
    // fallback: إذا كان categoryId هو اسم بالفعل
    if (typeof categoryId === 'string' && !categoryId.match(/^\d+$/)) {
      return categoryId;
    }
    
    // أسماء افتراضية للأرقام
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

  // ✅ دالة للحصول على لون الفئة (محسنة)
  const getCategoryColorDisplay = (categoryId) => {
    if (getCategoryColorClass) {
      const color = getCategoryColorClass(categoryId);
      if (color) return color;
    }
    
    // fallback: استخدام الألوان الافتراضية
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

  const getCategoryGradient = (category) => {
    const gradients = {
      'Electronics': `linear-gradient(135deg, ${colors.primary}20, ${colors.primary}05)`,
      'Clothing': `linear-gradient(135deg, ${colors.secondary}20, ${colors.secondary}05)`,
      'Home & Garden': `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}05)`,
      'Books': `linear-gradient(135deg, ${colors.success}20, ${colors.success}05)`,
      'Sports': `linear-gradient(135deg, ${colors.primary}20, ${colors.primary}05)`,
      'Health': `linear-gradient(135deg, ${colors.secondary}20, ${colors.secondary}05)`,
      'Beauty': `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}05)`,
      'Other': `linear-gradient(135deg, ${colors.success}20, ${colors.success}05)`
    };
    return gradients[category] || gradients['Other'];
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffTime = Math.abs(now - past);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // مكون الصورة مع التنقل
  const ProductImage = ({ product, categoryGradient }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imagesList, setImagesList] = useState([]);
    
    useEffect(() => {
      const images = getProductImages(product);
      setImagesList(images);
      setCurrentIndex(0);
    }, [product]);
    
    const imageCount = imagesList.length;
    const hasMultipleImages = imageCount > 1;
    const currentImage = imagesList[currentIndex];
    const imageUrl = getImageUrl(currentImage, product);
    
    const nextImage = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentIndex((prev) => (prev + 1) % imageCount);
      setIsLoading(true);
    };
    
    const prevImage = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentIndex((prev) => (prev - 1 + imageCount) % imageCount);
      setIsLoading(true);
    };
    
    const goToImage = (e, index) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentIndex(index);
      setIsLoading(true);
    };
    
    return (
      <div className="relative h-72 flex-shrink-0 overflow-hidden bg-gradient-to-br from-primary-300/20 to-primary-300/30 dark:from-neutral-800 dark:to-neutral-900">
        <div 
          className="absolute inset-0 opacity-30 transition-opacity duration-500 group-hover:opacity-50 z-10"
          style={{ background: categoryGradient }}
        />
        
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 z-20">
            <Package size={48} className="text-neutral-400 dark:text-neutral-600 animate-pulse" />
          </div>
        )}
        
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <img 
            src={imageUrl}
            alt={product.name}
            className="max-w-full max-h-full w-auto h-auto transition-all duration-700 
                     group-hover:scale-110 group-hover:rotate-1"
            style={{
              objectFit: 'contain',
              objectPosition: 'center'
            }}
            onLoad={() => {
              setIsLoading(false);
              setHasError(false);
            }}
            onError={(e) => {
              setIsLoading(false);
              setHasError(true);
              e.target.src = categoryImages[product?.category] || categoryImages['Other'];
            }}
            loading="lazy"
          />
        </div>
        
        {/* شارة Featured */}
        {product?.featured && (
          <div className="absolute top-4 left-4 z-30">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                          bg-yellow-500/90 text-white text-xs font-bold shadow-lg">
              <Award size={12} />
              <span>Featured</span>
            </div>
          </div>
        )}
        
        {/* أزرار التنقل */}
        {hasMultipleImages && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full
                       bg-black/40 backdrop-blur-sm text-white
                       opacity-0 group-hover:opacity-100 transition-all duration-300
                       hover:bg-black/60 hover:scale-110"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full
                       bg-black/40 backdrop-blur-sm text-white
                       opacity-0 group-hover:opacity-100 transition-all duration-300
                       hover:bg-black/60 hover:scale-110"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
        
        {/* مؤشرات الصور */}
        {hasMultipleImages && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-60 flex items-center gap-1.5
                        bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full">
            {Array.from({ length: Math.min(imageCount, 5) }).map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => goToImage(e, idx)}
                className={`transition-all duration-300 rounded-full
                          ${idx === currentIndex 
                            ? 'w-5 h-2 bg-white shadow-lg' 
                            : 'w-1.5 h-1.5 bg-white/60 hover:bg-white/90'}`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
            {imageCount > 5 && (
              <span className="text-[10px] text-white/80 ml-1 font-medium">
                +{imageCount - 5}
              </span>
            )}
          </div>
        )}

        {/* ✅ شارة الفئة - عرض اسم الفئة بدلاً من الرقم */}
        <div className="absolute top-4 right-4 z-30">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold
                        backdrop-blur-xl shadow-2xl border
                        ${darkMode 
                          ? 'bg-neutral-900/40 text-white border-white/10' 
                          : 'bg-white/40 text-neutral-900 border-white/20'}
                        ${getCategoryColorDisplay(product.category)}`}>
            <span className="relative">
              {getCategoryIconComponent(product.category, 16)}
            </span>
            <span className="relative">{getCategoryNameDisplay(product.category)}</span>
          </div>
        </div>
        
        {/* شريط تقدم المخزون */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 z-30">
          <div 
            className="h-full transition-all duration-500 ease-out"
            style={{ 
              width: `${getStockStatus(product.quantity).progress}%`,
              background: `linear-gradient(90deg, ${getStockStatus(product.quantity).color}, ${colors.primary})`
            }}
          />
        </div>
        
        {/* أزرار الإجراءات السريعة */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 z-40
                      opacity-0 group-hover:opacity-100 transition-all duration-500 
                      translate-y-8 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleEditClick(product);
            }}
            className="relative p-2.5 rounded-xl shadow-2xl transition-all duration-300 
                     hover:scale-110 active:scale-95 group/btn overflow-hidden
                     bg-white/95 backdrop-blur-md hover:bg-white"
            style={{ color: colors.primary }}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDelete(product.id);
            }}
            className="relative p-2.5 rounded-xl shadow-2xl transition-all duration-300 
                     hover:scale-110 active:scale-95 group/btn overflow-hidden
                     bg-white/95 backdrop-blur-md hover:bg-white"
            style={{ color: colors.secondary }}
          >
            <Trash2 size={16} />
          </button>
        </div>
        
        {/* مؤشر الوقت */}
        <div className="absolute bottom-4 left-4 z-30">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs
                        backdrop-blur-md shadow-lg
                        ${darkMode ? 'bg-black/30 text-neutral-300' : 'bg-white/30 text-neutral-700'}`}>
            <Clock size={10} />
            <span>{getTimeAgo(product.created_at)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full auto-rows-fr">
      {products.map((product, index) => {
        const categoryGradient = getCategoryGradient(product.category);
        
        return (
          <div 
            key={product.id} 
            className="group relative animate-fade-in-up h-full perspective-1000"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`relative rounded-3xl overflow-hidden transition-all duration-500 
                          hover:shadow-2xl hover:-translate-y-2 hover:rotate-1
                          h-full flex flex-col transform-gpu
                          ${darkMode 
                            ? 'bg-neutral-800/90 border border-neutral-700/50 backdrop-blur-sm' 
                            : 'bg-white border border-neutral-200/50 backdrop-blur-sm'}`}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
              </div>
              
              <ProductImage 
                product={product}
                categoryGradient={categoryGradient}
              />

              {/* باقي محتوى البطاقة */}
              <div className="p-6 flex-1 flex flex-col relative">
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-600" />
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-xl line-clamp-1 mb-1 
                                  ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                      {product.name}
                    </h3>
                    {product.sku && (
                      <div className={`flex items-center gap-1.5 text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                        <Hash size={12} className="opacity-50" />
                        <span className="font-mono tracking-wider">{product.sku}</span>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <div className="text-2xl font-bold" style={{ color: colors.primary }}>
                      {formatPrice(product.price)}
                    </div>
                    <div className={`text-[10px] text-right ${darkMode ? 'text-neutral-600' : 'text-neutral-400'}`}>
                      USD
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium 
                                shadow-sm ${getStockStatus(product.quantity).badge}`}>
                    <span className="relative">
                      {getStockStatus(product.quantity).icon}
                    </span>
                    <span>{getStockStatus(product.quantity).text}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                                  ${darkMode ? 'bg-neutral-700/30' : 'bg-neutral-100/50'}`}>
                      <Package size={12} className={darkMode ? 'text-neutral-500' : 'text-neutral-500'} />
                      <span className={`text-xs font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        <span className="opacity-50 mr-1">Qty:</span>
                        <span className="font-bold" style={{ color: getStockStatus(product.quantity).color }}>
                          {product.quantity}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {product.description && (
                  <div className="relative mb-4">
                    <div className={`text-sm leading-relaxed line-clamp-2 
                                  ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      {product.description}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-neutral-800 to-transparent pointer-events-none" />
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 mt-auto">
                  {/* Brand */}
                  <div className={`group/spec relative overflow-hidden rounded-xl p-3
                                transition-all duration-300 hover:shadow-md hover:-translate-y-0.5
                                ${darkMode ? 'bg-neutral-700/30 hover:bg-neutral-700/50' : 'bg-neutral-50 hover:bg-neutral-100'}`}>
                    <div className="flex flex-col items-center">
                      <div className="p-1.5 rounded-lg mb-1 transition-all duration-300 group-hover/spec:scale-110"
                           style={{ backgroundColor: `${colors.primary}15` }}>
                        <Globe size={14} style={{ color: colors.primary }} />
                      </div>
                      <span className={`text-[10px] font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        Brand
                      </span>
                      <span className={`text-xs font-bold truncate w-full text-center mt-0.5
                                     ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {product.manufacturer || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Weight */}
                  <div className={`group/spec relative overflow-hidden rounded-xl p-3
                                transition-all duration-300 hover:shadow-md hover:-translate-y-0.5
                                ${darkMode ? 'bg-neutral-700/30 hover:bg-neutral-700/50' : 'bg-neutral-50 hover:bg-neutral-100'}`}>
                    <div className="flex flex-col items-center">
                      <div className="p-1.5 rounded-lg mb-1 transition-all duration-300 group-hover/spec:scale-110"
                           style={{ backgroundColor: `${colors.success}15` }}>
                        <Scale size={14} style={{ color: colors.success }} />
                      </div>
                      <span className={`text-[10px] font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        Weight
                      </span>
                      <span className={`text-xs font-bold truncate w-full text-center mt-0.5
                                     ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {product.weight ? `${product.weight}kg` : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Warranty */}
                  <div className={`group/spec relative overflow-hidden rounded-xl p-3
                                transition-all duration-300 hover:shadow-md hover:-translate-y-0.5
                                ${darkMode ? 'bg-neutral-700/30 hover:bg-neutral-700/50' : 'bg-neutral-50 hover:bg-neutral-100'}`}>
                    <div className="flex flex-col items-center">
                      <div className="p-1.5 rounded-lg mb-1 transition-all duration-300 group-hover/spec:scale-110"
                           style={{ backgroundColor: `${colors.accent}15` }}>
                        <ShieldCheck size={14} style={{ color: colors.accent }} />
                      </div>
                      <span className={`text-[10px] font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        Warranty
                      </span>
                      <span className={`text-xs font-bold truncate w-full text-center mt-0.5
                                     ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {product.warranty_months || product.warranty_months === 0 ? `${product.warranty_months}m` : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div className={`group/spec relative overflow-hidden rounded-xl p-3
                                transition-all duration-300 hover:shadow-md hover:-translate-y-0.5
                                ${darkMode ? 'bg-neutral-700/30 hover:bg-neutral-700/50' : 'bg-neutral-50 hover:bg-neutral-100'}`}>
                    <div className="flex flex-col items-center">
                      <div className="p-1.5 rounded-lg mb-1 transition-all duration-300 group-hover/spec:scale-110"
                           style={{ backgroundColor: `${colors.secondary}15` }}>
                        <Ruler size={14} style={{ color: colors.secondary }} />
                      </div>
                      <span className={`text-[10px] font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        Dimensions
                      </span>
                      <span className={`text-xs font-bold truncate w-full text-center mt-0.5
                                     ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {product.dimensions || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(Array.isArray(product.tags) ? product.tags : [product.tags]).map((tag, index) => (
                      <span 
                        key={index} 
                        className={`group/tag relative px-2.5 py-1 text-[10px] font-medium rounded-full
                                  transition-all duration-300 hover:scale-105 hover:shadow-md
                                  ${darkMode 
                                    ? 'bg-neutral-700/50 text-neutral-300 hover:bg-neutral-700' 
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
                      >
                        <span className="relative z-10">#{tag}</span>
                      </span>
                    ))}
                  </div>
                )}

                <div className={`flex items-center justify-between pt-3 border-t 
                              ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
                  <div className={`flex items-center gap-2 text-xs group/date
                                ${darkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                    <Calendar size={12} className="transition-transform group-hover/date:rotate-12" />
                    <span>
                      {new Date(product.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className={`text-[10px] ${darkMode ? 'text-neutral-600' : 'text-neutral-400'}`}>
                      Active
                    </span>
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

export default ProductGrid;