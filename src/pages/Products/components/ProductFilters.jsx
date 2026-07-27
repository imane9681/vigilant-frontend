import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import IconWrapper from '../../../components/ui/IconWrapper';

import { 
  Search,
  Filter,
  Grid,
  List,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  X,
  Laptop,
  Shirt,
  Home,
  BookOpen,
  Activity,
  Heart,
  Sparkle,
  Package,
  Check
} from 'lucide-react';

const ProductFilters = ({ 
  darkMode,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  products,
  filteredProducts,
  stats
}) => {
  // الألوان المحددة
  const colors = {
    primary: '#8B7ABA',
    secondary: '#F08FAE',
    accent: '#EE9C6C',
    success: '#34D19C'
  };

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const categoryButtonRef = useRef(null);
  const statusButtonRef = useRef(null);
  const [categoryDropdownPosition, setCategoryDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [statusDropdownPosition, setStatusDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  
  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports', 'Health', 'Beauty', 'Other'];
  
  // حساب عدد المنتجات لكل فئة
  const categoryCounts = useMemo(() => {
    const counts = {};
    categories.forEach(category => {
      if (Array.isArray(products)) {
        counts[category] = products.filter(p => 
          p && p.category && p.category.toLowerCase() === category.toLowerCase()
        ).length;
      } else {
        counts[category] = 0;
      }
    });
    return counts;
  }, [products]);

  // عدد المنتجات الكلي
  const totalProducts = Array.isArray(products) ? products.length : 0;
  const filteredCount = Array.isArray(filteredProducts) ? filteredProducts.length : 0;
  
  // تحديث موضع القائمة المنسدلة للفئات
  useEffect(() => {
    if (isCategoryOpen && categoryButtonRef.current) {
      const rect = categoryButtonRef.current.getBoundingClientRect();
      setCategoryDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isCategoryOpen]);

  // تحديث موضع القائمة المنسدلة للحالات
  useEffect(() => {
    if (isStatusOpen && statusButtonRef.current) {
      const rect = statusButtonRef.current.getBoundingClientRect();
      setStatusDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isStatusOpen]);

  // إغلاق القوائم عند التمرير
  useEffect(() => {
    const handleScroll = () => {
      if (isCategoryOpen) setIsCategoryOpen(false);
      if (isStatusOpen) setIsStatusOpen(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isCategoryOpen, isStatusOpen]);

  const getCategoryIcon = (category, className = "w-4 h-4", isSelected = false) => {
    // الأيقونات تحتفظ بلونها حتى في الوضع المفعل
    const iconColor = {
      'Electronics': colors.primary,
      'Clothing': colors.secondary,
      'Home & Garden': colors.accent,
      'Books': colors.success,
      'Sports': colors.primary,
      'Health': colors.secondary,
      'Beauty': colors.accent,
      'Other': colors.success
    }[category] || colors.primary;

    const icons = {
      'Electronics': <Laptop className={className} style={{ color: iconColor }} />,
      'Clothing': <Shirt className={className} style={{ color: iconColor }} />,
      'Home & Garden': <Home className={className} style={{ color: iconColor }} />,
      'Books': <BookOpen className={className} style={{ color: iconColor }} />,
      'Sports': <Activity className={className} style={{ color: iconColor }} />,
      'Health': <Heart className={className} style={{ color: iconColor }} />,
      'Beauty': <Sparkle className={className} style={{ color: iconColor }} />,
      'Other': <Package className={className} style={{ color: iconColor }} />
    };
    return icons[category] || <Package className={className} style={{ color: iconColor }} />;
  };

  // دالة للحصول على نص الحالة المحددة
  const getSelectedStatusText = () => {
    if (selectedStatus === 'all') return 'All Status';
    if (selectedStatus === 'in_stock') return 'In Stock';
    if (selectedStatus === 'low_stock') return 'Low Stock';
    return 'Out of Stock';
  };

  // دالة للحصول على لون الحالة المحددة
  const getSelectedStatusColor = () => {
    if (selectedStatus === 'in_stock') return colors.success;
    if (selectedStatus === 'low_stock') return colors.accent;
    if (selectedStatus === 'out_of_stock') return '#ef4444';
    return '#9ca3af';
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg border ${
      darkMode 
        ? 'bg-neutral-800 border-neutral-700' 
        : 'bg-white border-neutral-100'
    }`}>
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-neutral-200 dark:border-neutral-800">
        <IconWrapper 
          darkMode={darkMode} 
          variant="primary"
          size={20}
        >
          <Filter />
        </IconWrapper>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-neutral-700 dark:text-neutral-300">
            Filter & Controls
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Search, filter and manage your products
          </p>
        </div>
        <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-auto whitespace-nowrap">
          {filteredCount} / {totalProducts} products
        </span>
      </div>
      
      {/* Main Controls Row */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        {/* Search and Categories Row */}
        <div className="lg:flex-1 flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-2.5 rounded-full text-sm
                ${darkMode 
                  ? 'bg-neutral-900/50 border-neutral-700 text-white placeholder-neutral-500' 
                  : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400'
                }
                border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50`}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Categories Dropdown Button - بدون أعداد */}
          <div className="relative min-w-[170px]">
            <button
              ref={categoryButtonRef}
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg text-sm
                ${darkMode 
                  ? 'bg-neutral-900/50 border-neutral-700 text-white hover:bg-neutral-800' 
                  : 'bg-neutral-50 border-neutral-200 text-neutral-900 hover:bg-neutral-100'
                }
                border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 transition-all`}
            >
              <div className="flex items-center gap-2 truncate">
                {selectedCategory !== 'all' ? (
                  <>
                    {getCategoryIcon(selectedCategory, "w-4 h-4")}
                    <span className="truncate">{selectedCategory}</span>
                  </>
                ) : (
                  <>
                    <Filter size={16} className="text-neutral-400 flex-shrink-0" />
                    <span className="truncate">All Categories</span>
                  </>
                )}
              </div>
              <ChevronDown size={16} className={`flex-shrink-0 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Filters and Actions */}
        <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
          {/* Status Filter - Custom Dropdown بدون أعداد */}
          <div className="relative min-w-[130px]">
            <button
              ref={statusButtonRef}
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg text-sm
                ${darkMode 
                  ? 'bg-neutral-900/50 border-neutral-700 text-white hover:bg-neutral-800' 
                  : 'bg-neutral-50 border-neutral-200 text-neutral-900 hover:bg-neutral-100'
                }
                border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 transition-all`}
            >
              <div className="flex items-center gap-2 truncate">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getSelectedStatusColor() }} />
                <span className="truncate">{getSelectedStatusText()}</span>
              </div>
              <ChevronDown size={16} className={`flex-shrink-0 transition-transform duration-300 ${isStatusOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative min-w-[125px]">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg appearance-none cursor-pointer pl-10 text-sm
                ${darkMode 
                  ? 'bg-neutral-900/50 border-neutral-700 text-white' 
                  : 'bg-neutral-50 border-neutral-200 text-neutral-900'
                }
                border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50`}
              aria-label="Sort by"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price ↑</option>
              <option value="price-high">Price ↓</option>
              <option value="name">Name</option>
              <option value="quantity">Stock</option>
              <option value="featured">Featured</option>
            </select>
            <SlidersHorizontal size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.accent }} />
            <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
          </div>
          
          {/* View Toggle */}
          <div className={`flex items-center gap-1 p-1 rounded-lg ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' 
                ? darkMode ? 'bg-neutral-700 shadow-md' : 'bg-white shadow-md'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400'}`}
              aria-label="Grid view"
              title="Grid view"
            >
              <Grid size={18} style={{ color: viewMode === 'grid' ? colors.primary : undefined }} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' 
                ? darkMode ? 'bg-neutral-700 shadow-md' : 'bg-white shadow-md'
                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400'}`}
              aria-label="List view"
              title="List view"
            >
              <List size={18} style={{ color: viewMode === 'list' ? colors.secondary : undefined }} />
            </button>
          </div>
          
          {/* Add Button */}
          <Link 
            to="/add-product" 
            className="group relative overflow-hidden rounded-lg px-6 py-2.5 text-white font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95 text-sm whitespace-nowrap"
            style={{ background: ` ${colors.primary}` }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              <span>Add Product</span>
            </span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white to-transparent" />
          </Link>
        </div>
      </div>

      {/* Categories Dropdown Menu - بدون أعداد في القائمة */}
      {isCategoryOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
          <div 
            className="fixed z-50 rounded-lg shadow-xl overflow-hidden"
            style={{
              top: categoryDropdownPosition.top,
              left: categoryDropdownPosition.left,
              width: categoryDropdownPosition.width,
              maxHeight: '300px',
              overflowY: 'auto'
            }}
          >
            <div className={`${darkMode ? 'bg-neutral-800' : 'bg-white'}`}>
              {/* All Categories option - بدون أعداد */}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setIsCategoryOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all
                  ${selectedCategory === 'all'
                    ? darkMode 
                      ? 'bg-neutral-700 text-white' 
                      : 'bg-neutral-100 text-neutral-900'
                    : darkMode 
                      ? 'text-neutral-300 hover:bg-neutral-700/50' 
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Filter size={16} className="text-neutral-400" />
                  <span>All Categories</span>
                </div>
                {selectedCategory === 'all' && (
                  <Check size={14} className="text-green-500" />
                )}
              </button>

              {/* Category options - بدون أعداد */}
              {categories.map(category => {
                const isSelected = selectedCategory === category;
                
                return (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all
                      ${isSelected
                        ? darkMode 
                          ? 'bg-neutral-700 text-white' 
                          : 'bg-neutral-100 text-neutral-900'
                        : darkMode 
                          ? 'text-neutral-300 hover:bg-neutral-700/50' 
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(category, "w-4 h-4", isSelected)}
                      <span>{category}</span>
                    </div>
                    {isSelected && (
                      <Check size={14} className="text-green-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Status Dropdown Menu - بدون أعداد في القائمة */}
      {isStatusOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsStatusOpen(false)} />
          <div 
            className="fixed z-50 rounded-lg shadow-xl overflow-hidden"
            style={{
              top: statusDropdownPosition.top,
              left: statusDropdownPosition.left,
              width: statusDropdownPosition.width,
              maxHeight: '300px',
              overflowY: 'auto'
            }}
          >
            <div className={`${darkMode ? 'bg-neutral-800' : 'bg-white'}`}>
              {/* All Status option - بدون أعداد */}
              <button
                onClick={() => {
                  setSelectedStatus('all');
                  setIsStatusOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all
                  ${selectedStatus === 'all'
                    ? darkMode 
                      ? 'bg-neutral-700 text-white' 
                      : 'bg-neutral-100 text-neutral-900'
                    : darkMode 
                      ? 'text-neutral-300 hover:bg-neutral-700/50' 
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-neutral-400" />
                  <span>All Status</span>
                </div>
                {selectedStatus === 'all' && (
                  <Check size={14} className="text-green-500" />
                )}
              </button>

              {/* In Stock option - بدون أعداد */}
              <button
                onClick={() => {
                  setSelectedStatus('in_stock');
                  setIsStatusOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all
                  ${selectedStatus === 'in_stock'
                    ? darkMode 
                      ? 'bg-neutral-700 text-white' 
                      : 'bg-neutral-100 text-neutral-900'
                    : darkMode 
                      ? 'text-neutral-300 hover:bg-neutral-700/50' 
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.success }} />
                  <span>In Stock</span>
                </div>
                {selectedStatus === 'in_stock' && (
                  <Check size={14} className="text-green-500" />
                )}
              </button>

              {/* Low Stock option - بدون أعداد */}
              <button
                onClick={() => {
                  setSelectedStatus('low_stock');
                  setIsStatusOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all
                  ${selectedStatus === 'low_stock'
                    ? darkMode 
                      ? 'bg-neutral-700 text-white' 
                      : 'bg-neutral-100 text-neutral-900'
                    : darkMode 
                      ? 'text-neutral-300 hover:bg-neutral-700/50' 
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.accent }} />
                  <span>Low Stock</span>
                </div>
                {selectedStatus === 'low_stock' && (
                  <Check size={14} className="text-green-500" />
                )}
              </button>

              {/* Out of Stock option - بدون أعداد */}
              <button
                onClick={() => {
                  setSelectedStatus('out_of_stock');
                  setIsStatusOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all
                  ${selectedStatus === 'out_of_stock'
                    ? darkMode 
                      ? 'bg-neutral-700 text-white' 
                      : 'bg-neutral-100 text-neutral-900'
                    : darkMode 
                      ? 'text-neutral-300 hover:bg-neutral-700/50' 
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Out of Stock</span>
                </div>
                {selectedStatus === 'out_of_stock' && (
                  <Check size={14} className="text-green-500" />
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Active Filters - تبقى الأعداد هنا فقط */}
      {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' || sortBy !== 'newest') && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Active:</span>
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
                    style={{ backgroundColor: darkMode ? `${colors.primary}20` : `${colors.primary}10`, color: colors.primary }}>
                <Search size={10} style={{ color: colors.primary }} />
                "{searchTerm}"
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
                    style={{ backgroundColor: darkMode ? `${colors.secondary}20` : `${colors.secondary}10`, color: colors.secondary }}>
                {getCategoryIcon(selectedCategory, "w-3 h-3")}
                {selectedCategory}
              </span>
            )}
            {selectedStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
                    style={{ backgroundColor: darkMode ? `${colors.accent}20` : `${colors.accent}10`, color: colors.accent }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{
                  backgroundColor: selectedStatus === 'in_stock' ? colors.success :
                                 selectedStatus === 'low_stock' ? colors.accent : '#ef4444'
                }} />
                {selectedStatus === 'in_stock' ? 'In Stock' : 
                 selectedStatus === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;