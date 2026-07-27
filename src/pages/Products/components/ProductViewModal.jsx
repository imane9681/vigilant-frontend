import React, { useState, useEffect } from 'react';
import { 
  X, Package, DollarSign, Tag, Layers, Calendar, Hash, 
  AlertCircle, CheckCircle, Clock, TrendingUp, TrendingDown,
  ChevronLeft, ChevronRight, Image as ImageIcon, Edit2,
  Box, Truck, Shield, Weight, Ruler, Award, Star,
  ExternalLink, Info, ShoppingBag, TruckIcon
} from 'lucide-react';

const ProductViewModal = ({ darkMode, product, onClose, onEdit }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imagesList, setImagesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const images = [];
    
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      images.push(...product.images);
    } else if (product?.image && typeof product.image === 'string') {
      images.push(product.image);
    } else if (product?.image_url && typeof product.image_url === 'string') {
      images.push(product.image_url);
    }
    
    if (images.length === 0) {
      const defaultImages = {
        'Electronics': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&h=600&fit=crop',
        'Clothing': 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=600&fit=crop',
        'Home & Garden': 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&h=600&fit=crop',
        'Books': 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=600&fit=crop',
        'Sports': 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&h=600&fit=crop',
        'Health': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=600&fit=crop',
        'Beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop',
        'Other': 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=600&fit=crop'
      };
      images.push(defaultImages[product?.category] || defaultImages['Other']);
    }
    
    setImagesList(images);
    setActiveImageIndex(0);
    setIsLoading(true);
  }, [product]);

  if (!product) return null;

 const getImageUrl = (image) => {
  if (!image) return '';
  if (typeof image === 'string') {
    if (image.startsWith('http')) return image;
    if (image.startsWith('/media/')) {
      // ✅ غيرنا localhost إلى رابط Render
      return `https://vigilant-backend-8owb.onrender.com${image}`;
    }
    if (image.startsWith('data:')) return image;
    // ✅ غيرنا localhost إلى رابط Render
    return `https://vigilant-backend-8owb.onrender.com/media/${image.replace(/^\/+/, '')}`;
  }
  return '';
};

  const formatCurrency = (value) => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/[$,]/g, '')) : value;
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { 
      text: 'Out of Stock', 
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
      border: 'border-red-200 dark:border-red-800',
      icon: <X size={16} className="text-red-500" />,
      progress: 0,
      badge: 'red'
    };
    if (quantity <= 10) return { 
      text: 'Low Stock', 
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      border: 'border-amber-200 dark:border-amber-800',
      icon: <AlertCircle size={16} className="text-amber-500" />,
      progress: 25,
      badge: 'amber'
    };
    return { 
      text: 'In Stock', 
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: <CheckCircle size={16} className="text-emerald-500" />,
      progress: 100,
      badge: 'emerald'
    };
  };

  const stockStatus = getStockStatus(product.currentStock || product.quantity || 0);
  const stockPercentage = product.stockPercentage || 
    ((product.currentStock / product.maxStock) * 100) || 
    ((product.quantity / 100) * 100) || 0;

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % imagesList.length);
    setIsLoading(true);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
    setIsLoading(true);
  };

  const hasMultipleImages = imagesList.length > 1;

  const handleEditClick = () => {
    onClose();
    if (onEdit) {
      onEdit(product);
    }
  };

  // تحديد لون شارة الفئة
  const getCategoryColor = (category) => {
    const colors = {
      'Electronics': 'from-purple-500 to-indigo-500',
      'Clothing': 'from-pink-500 to-rose-500',
      'Home & Garden': 'from-orange-500 to-amber-500',
      'Books': 'from-emerald-500 to-teal-500',
      'Sports': 'from-blue-500 to-cyan-500',
      'Health': 'from-green-500 to-emerald-500',
      'Beauty': 'from-fuchsia-500 to-pink-500',
      'Other': 'from-neutral-500 to-neutral-600'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in-up">
      <div className={`rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col ${darkMode ? 'bg-neutral-900' : 'bg-white'}`}>
        
        {/* Header - Improved */}
        <div className={`sticky top-0 z-30 border-b px-6 py-5 flex-shrink-0 ${darkMode ? 'bg-neutral-900/95 border-neutral-800' : 'bg-white/95 border-neutral-200'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#8B7ABA] to-[#F08FAE] shadow-lg">
                <Package size={22} className="text-white" />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                  Product Details
                </h2>
                <p className={`text-sm mt-0.5 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  View complete product information and specifications
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-90
                ${darkMode ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-500'}`}
              aria-label="Close modal"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-6 py-6 space-y-8">
          
          {/* Product Images Section - Improved Carousel */}
          <div className="relative group" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            {/* Main Image Container */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 min-h-[400px] shadow-xl">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-[#8B7ABA] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              <img
                src={getImageUrl(imagesList[activeImageIndex])}
                alt={product.name}
                className="w-full h-[400px] object-contain transition-all duration-500 transform group-hover:scale-105"
                onLoad={() => setIsLoading(false)}
                onError={(e) => {
                  setIsLoading(false);
                  e.target.src = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=600&fit=crop';
                }}
              />
              
              {/* Navigation Buttons - Always visible on hover */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full
                             bg-black/70 backdrop-blur-md text-white
                             transition-all duration-300 hover:scale-110 hover:bg-black/90
                             ${isHovering ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                             focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]`}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full
                             bg-black/70 backdrop-blur-md text-white
                             transition-all duration-300 hover:scale-110 hover:bg-black/90
                             ${isHovering ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
                             focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]`}
                    aria-label="Next image"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
              
              {/* Image Counter Badge */}
              {hasMultipleImages && (
                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full
                              bg-black/70 backdrop-blur-md text-white text-xs font-medium
                              flex items-center gap-1.5">
                  <ImageIcon size={12} />
                  {activeImageIndex + 1} / {imagesList.length}
                </div>
              )}
              
              {/* Category Badge */}
              <div className="absolute top-4 left-4">
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold text-white
                              bg-gradient-to-r ${getCategoryColor(product.category)} shadow-lg`}>
                  {product.category || 'Uncategorized'}
                </div>
              </div>
            </div>
            
            {/* Thumbnails - Improved */}
            {hasMultipleImages && (
              <div className="flex justify-center gap-3 mt-5 overflow-x-auto pb-2 custom-scrollbar px-2">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImageIndex(idx);
                      setIsLoading(true);
                    }}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all duration-300
                      hover:scale-110 hover:shadow-xl
                      ${idx === activeImageIndex 
                        ? 'ring-3 ring-[#8B7ABA] scale-105 shadow-xl' 
                        : 'opacity-70 hover:opacity-100'}`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {idx === activeImageIndex && (
                      <div className="absolute inset-0 bg-[#8B7ABA]/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#8B7ABA]"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Name and Basic Info - Enhanced */}
          <div className="text-center border-b pb-5" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
            <h3 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              {product.name}
            </h3>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
                <Hash size={14} className={darkMode ? 'text-neutral-400' : 'text-neutral-500'} />
                <span className={`text-sm font-mono ${darkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
                  SKU: {product.sku}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
                <Tag size={14} className={darkMode ? 'text-neutral-400' : 'text-neutral-500'} />
                <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
                  {product.category || 'Uncategorized'}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge - Enhanced */}
          <div className="flex justify-center">
            <div className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-full ${stockStatus.bg} border-2 ${stockStatus.border} shadow-md`}>
              {stockStatus.icon}
              <span className={`font-bold text-base ${stockStatus.color}`}>{stockStatus.text}</span>
            </div>
          </div>

          {/* Main Info Grid - 2 Columns with better spacing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column */}
            <div className="space-y-6">
              {/* Pricing Card - Enhanced */}
              <div className={`rounded-2xl p-6 ${darkMode ? 'bg-neutral-800/50' : 'bg-neutral-50'} border-2 ${darkMode ? 'border-neutral-700' : 'border-neutral-200'} hover:shadow-lg transition-all`}>
                <h4 className={`text-lg font-bold mb-5 flex items-center gap-2.5 ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                  <div className="p-2 rounded-xl bg-gradient-to-br from-[#8B7ABA]/20 to-[#8B7ABA]/10">
                    <DollarSign size={20} style={{ color: '#8B7ABA' }} />
                  </div>
                  Pricing Information
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b-2" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                    <span className={`text-sm font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Unit Price:</span>
                    <span className={`text-2xl font-bold`} style={{ color: '#8B7ABA' }}>
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Total Inventory Value:</span>
                    <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                      {formatCurrency(product.value || product.price * (product.currentStock || 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inventory Card - Enhanced */}
              <div className={`rounded-2xl p-6 ${darkMode ? 'bg-neutral-800/50' : 'bg-neutral-50'} border-2 ${darkMode ? 'border-neutral-700' : 'border-neutral-200'} hover:shadow-lg transition-all`}>
                <h4 className={`text-lg font-bold mb-5 flex items-center gap-2.5 ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                  <div className="p-2 rounded-xl bg-gradient-to-br from-[#F08FAE]/20 to-[#F08FAE]/10">
                    <Layers size={20} style={{ color: '#F08FAE' }} />
                  </div>
                  Inventory Details
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="bg-white/50 dark:bg-neutral-700/30 rounded-xl p-3 text-center">
                      <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'} mb-1`}>Current Stock</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {product.currentStock || product.quantity || 0}
                      </p>
                      <p className="text-xs text-neutral-400">units</p>
                    </div>
                    <div className="bg-white/50 dark:bg-neutral-700/30 rounded-xl p-3 text-center">
                      <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'} mb-1`}>Stock Level</p>
                      <p className={`text-2xl font-bold ${stockStatus.color}`}>
                        {Math.round(stockPercentage)}%
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className={darkMode ? 'text-neutral-400' : 'text-neutral-500'}>Min: {product.minStock || 5}</span>
                      <span className={darkMode ? 'text-neutral-400' : 'text-neutral-500'}>Max: {product.maxStock || 100}</span>
                    </div>
                    <div className={`w-full h-3 rounded-full overflow-hidden ${darkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}>
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(100, stockPercentage)}%`,
                          background: `linear-gradient(90deg, #8B7ABA, #F08FAE)`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Product Details Card - Enhanced */}
              <div className={`rounded-2xl p-6 ${darkMode ? 'bg-neutral-800/50' : 'bg-neutral-50'} border-2 ${darkMode ? 'border-neutral-700' : 'border-neutral-200'} hover:shadow-lg transition-all`}>
                <h4 className={`text-lg font-bold mb-5 flex items-center gap-2.5 ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                  <div className="p-2 rounded-xl bg-gradient-to-br from-[#EE9C6C]/20 to-[#EE9C6C]/10">
                    <Box size={20} style={{ color: '#EE9C6C' }} />
                  </div>
                  Product Information
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                    <span className={`text-sm font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Manufacturer:</span>
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                      {product.supplier || product.manufacturer || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Monthly Sales:</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {product.monthlySales || 0}
                      </span>
                      <span className="text-xs text-neutral-400">units</span>
                      {(product.monthlySales > 30) && (
                        <div className="flex items-center gap-0.5 text-xs bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                          <TrendingUp size={12} className="text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">+12%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {product.featured && (
                    <div className="flex justify-between items-center pt-2">
                      <span className={`text-sm font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Status:</span>
                      <span className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-full">
                        <Star size={14} className="text-amber-500 fill-amber-500" />
                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400">Featured Product</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline Card - Enhanced */}
              <div className={`rounded-2xl p-6 ${darkMode ? 'bg-neutral-800/50' : 'bg-neutral-50'} border-2 ${darkMode ? 'border-neutral-700' : 'border-neutral-200'} hover:shadow-lg transition-all`}>
                <h4 className={`text-lg font-bold mb-5 flex items-center gap-2.5 ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                  <div className="p-2 rounded-xl bg-gradient-to-br from-[#34D19C]/20 to-[#34D19C]/10">
                    <Calendar size={20} style={{ color: '#34D19C' }} />
                  </div>
                  Timeline
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Last Updated:</span>
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                      {product.lastUpdated || new Date().toISOString().split('T')[0]}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Next Restock:</span>
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                      {product.restockDate || 'Not scheduled'}
                    </span>
                  </div>
                </div>
              </div>

           
            </div>
          </div>

          {/* Description - Enhanced */}
          {product.description && (
            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-neutral-800/50' : 'bg-neutral-50'} border-2 ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
              <h4 className={`text-lg font-bold mb-4 flex items-center gap-2.5 ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                <Info size={20} style={{ color: '#8B7ABA' }} />
                Description
              </h4>
              <p className={`text-base leading-relaxed ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                {product.description}
              </p>
            </div>
          )}

             {/* Specifications Card - Enhanced */}
              {(product.weight || product.dimensions || product.warranty_months) && (
                <div className={`rounded-2xl p-6 ${darkMode ? 'bg-neutral-800/50' : 'bg-neutral-50'} border-2 ${darkMode ? 'border-neutral-700' : 'border-neutral-200'} hover:shadow-lg transition-all`}>
                  <h4 className={`text-lg font-bold mb-5 flex items-center gap-2.5 ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                    <div className="p-2 rounded-xl bg-gradient-to-br from-[#8B7ABA]/20 to-[#8B7ABA]/10">
                      <Ruler size={20} style={{ color: '#8B7ABA' }} />
                    </div>
                    Specifications
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {product.weight && (
                      <div className="flex items-center gap-3 bg-white/50 dark:bg-neutral-700/30 rounded-xl p-3">
                        <Weight size={18} className={darkMode ? 'text-neutral-400' : 'text-neutral-500'} />
                        <div>
                          <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Weight</p>
                          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-neutral-800'}`}>{product.weight} kg</p>
                        </div>
                      </div>
                    )}
                    {product.dimensions && (
                      <div className="flex items-center gap-3 bg-white/50 dark:bg-neutral-700/30 rounded-xl p-3">
                        <Ruler size={18} className={darkMode ? 'text-neutral-400' : 'text-neutral-500'} />
                        <div>
                          <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Dimensions</p>
                          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-neutral-800'}`}>{product.dimensions}</p>
                        </div>
                      </div>
                    )}
                    {product.warranty_months && (
                      <div className="flex items-center gap-3 bg-white/50 dark:bg-neutral-700/30 rounded-xl p-3">
                        <Shield size={18} className={darkMode ? 'text-neutral-400' : 'text-neutral-500'} />
                        <div>
                          <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Warranty</p>
                          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-neutral-800'}`}>{product.warranty_months} months</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

          {/* Tags - Enhanced */}
          {product.tags && product.tags.length > 0 && (
            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-neutral-800/50' : 'bg-neutral-50'} border-2 ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
              <h4 className={`text-lg font-bold mb-4 flex items-center gap-2.5 ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                <Tag size={20} style={{ color: '#F08FAE' }} />
                Tags
              </h4>
              <div className="flex flex-wrap gap-3">
                {(Array.isArray(product.tags) ? product.tags : [product.tags]).map((tag, index) => (
                  <span 
                    key={index} 
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 hover:scale-105 hover:shadow-md
                      ${darkMode 
                        ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600' 
                        : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'}`}
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions - Enhanced */}
        <div className={`sticky bottom-0 border-t p-6 flex-shrink-0 ${darkMode ? 'bg-neutral-900/95 border-neutral-800' : 'bg-white/95 border-neutral-200'}`}>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3.5 font-bold rounded-xl transition-all duration-300 
                       hover:scale-105 active:scale-95 border-2
                       bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200
                       dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300 dark:border-neutral-700"
            >
              Close
            </button>
            <button
              onClick={handleEditClick}
              className="flex-1 px-6 py-3.5 font-bold rounded-xl transition-all duration-300 
                       hover:scale-105 active:scale-95
                       text-white shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5
                       bg-gradient-to-r from-[#8B7ABA] to-[#F08FAE] hover:from-[#7A6AA9] hover:to-[#E07E9D]"
            >
              <Edit2 size={18} />
              Edit Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ProductViewModal;