// frontend/src/pages/Products/InventoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService, categoryService } from '../../services/api';
import { 
  Package, AlertTriangle, CheckCircle, Clock, RefreshCw,
  Filter, Search, Download, Eye, Edit2, TrendingUp,
  TrendingDown, BarChart3, Check, AlertCircle, X,
  Grid, Plus, DollarSign, ShoppingBag, Truck,
  TrendingUp as TrendingUpIcon, FileText, Layers
} from 'lucide-react';
import MetricCard from '../Dashboard/components/MetricCard';
import IconWrapper from './../../components/ui/IconWrapper';
import FilterControls from '../../components/ui/FilterControls';
import ProductEditModal from './components/ProductEditModal';
import ProductViewModal from './components/ProductViewModal';
import ReorderModal from './components/ReorderModal';
import { useCategories } from '../../contexts/CategoryContext';

const InventoryPage = ({ darkMode }) => {
  const navigate = useNavigate();
  const { getCategoryById, getCategoryOptions } = useCategories();
  
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedView, setSelectedView] = useState('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Modal states
  const [viewingProduct, setViewingProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingProductData, setEditingProductData] = useState(null);
  const [reorderProduct, setReorderProduct] = useState(null);
  const [showReorderModal, setShowReorderModal] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
    sku: '',
    weight: '',
    dimensions: '',
    manufacturer: '',
    warranty_months: '',
    tags: '',
    featured: false,
    in_stock: true
  });
  const [currentImagesList, setCurrentImagesList] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0,
    totalItems: 0
  });

  // ✅ ألوان المشروع
  const colors = {
    primary: '#8B7ABA',
    secondary: '#F08FAE',
    accent: '#EE9C6C',
    success: '#34D19C'
  };

  // ✅ دالة حساب لون الشريط
  const getBarColor = (percentage, status) => {
    if (status === 'out-of-stock') return colors.secondary;
    if (status === 'low-stock') return colors.accent;
    if (status === 'medium-stock') return colors.primary;
    if (percentage > 70) return colors.success;
    if (percentage > 40) return colors.primary;
    return colors.accent;
  };

  // ✅ دالة للحصول على اسم الفئة
  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'Uncategorized';
    
    if (typeof categoryId === 'string' && !categoryId.match(/^\d+$/)) {
      return categoryId;
    }
    
    const category = getCategoryById(categoryId);
    if (category && category.name) {
      return category.name;
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
    
    return categoryNames[String(categoryId)] || `Category ${categoryId}`;
  };

  // ✅ دالة للحصول على لون الفئة
  const getCategoryColorClass = (categoryId) => {
    const category = getCategoryById(categoryId);
    if (category) {
      const colorMap = {
        '#8B7ABA': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        '#F08FAE': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        '#EE9C6C': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        '#34D19C': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        '#3B82F6': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        '#EF4444': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        '#6B7280': 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
      };
      return colorMap[category.color] || 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300';
    }
    return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300';
  };

  // ✅ جلب البيانات
  const fetchInventory = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      }
      
      setLoading(true);
      setError(null);
      
      const [productsResponse, categoriesResponse] = await Promise.all([
        productService.getAll(),
        categoryService.getAll()
      ]);
      
      const products = productsResponse.data.results || productsResponse.data;
      
      const categoriesMap = {};
      if (categoriesResponse.data) {
        const categoriesData = categoriesResponse.data.results || categoriesResponse.data;
        categoriesData.forEach(cat => {
          categoriesMap[cat.id] = cat.name;
        });
      }
      
      const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.price) * (p.quantity || 0)), 0);
      const lowStock = products.filter(p => p.quantity <= 10 && p.quantity > 0).length;
      const outOfStock = products.filter(p => p.quantity === 0).length;
      const totalItems = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
      
      setStats({
        totalProducts: products.length,
        totalValue: totalValue,
        lowStock: lowStock,
        outOfStock: outOfStock,
        totalItems: totalItems
      });
      
      const inventoryData = products.map(product => {
        const price = parseFloat(product.price) || 0;
        const quantity = product.quantity || 0;
        const totalValue = price * quantity;
        
        let categoryName = 'Uncategorized';
        if (product.category) {
          if (typeof product.category === 'number' || (typeof product.category === 'string' && !isNaN(product.category))) {
            categoryName = categoriesMap[product.category] || `Category ${product.category}`;
          } else if (typeof product.category === 'object' && product.category.name) {
            categoryName = product.category.name;
          } else if (typeof product.category === 'string') {
            categoryName = product.category;
          }
        }
        
        const maxStock = Math.max(100, quantity * 1.5);
        const stockPercentage = maxStock > 0 ? Math.min((quantity / maxStock) * 100, 100) : 0;
        
        let status = 'in-stock';
        if (quantity === 0) {
          status = 'out-of-stock';
        } else if (quantity <= 10) {
          status = 'low-stock';
        } else if (quantity <= 30) {
          status = 'medium-stock';
        } else {
          status = 'in-stock';
        }
        
        return {
          id: product.id,
          name: product.name,
          sku: product.sku || `SKU-${product.id}`,
          category: categoryName,
          categoryId: product.category,
          currentStock: quantity,
          minStock: 5,
          maxStock: Math.round(maxStock),
          stockPercentage: Math.round(stockPercentage),
          status: status,
          lastUpdated: product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          supplier: product.manufacturer || 'Unknown',
          price: price,
          value: totalValue,
          description: product.description || '',
          manufacturer: product.manufacturer || '',
          weight: product.weight || '',
          dimensions: product.dimensions || '',
          warranty_months: product.warranty_months || '',
          tags: product.tags || '',
          featured: product.featured || false,
          images: product.images || [],
          image: product.image || null
        };
      });
      
      setInventory(inventoryData);
      setLastUpdated(new Date().toLocaleString());
      
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleRefresh = () => {
    fetchInventory(true);
  };

  useEffect(() => {
    filterInventory();
  }, [inventory, filter, searchQuery, sortBy]);

  const filterInventory = () => {
    let filtered = [...inventory];

    if (filter !== 'all') {
      filtered = filtered.filter(item => item.status === filter);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'stock':
          return b.currentStock - a.currentStock;
        case 'value':
          return b.value - a.value;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredInventory(filtered);
  };

  // ============================================
  // ✅ دوال إعادة الطلب (Reorder)
  // ============================================
  const openReorderModal = (product) => {
    setReorderProduct(product);
    setShowReorderModal(true);
  };

  const handleReorderConfirm = async (orderData) => {
    alert(`✅ Order placed successfully for ${orderData.product.name}!`);
    await fetchInventory(true);
  };

  const closeReorderModal = () => {
    setShowReorderModal(false);
    setReorderProduct(null);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'in-stock': 
        return { 
          bg: darkMode ? 'bg-emerald-900/30' : 'bg-emerald-100', 
          text: darkMode ? 'text-emerald-400' : 'text-emerald-800', 
          icon: <CheckCircle size={12} /> 
        };
      case 'medium-stock': 
        return { 
          bg: darkMode ? 'bg-purple-900/30' : 'bg-purple-100', 
          text: darkMode ? 'text-purple-400' : 'text-purple-800', 
          icon: <Clock size={12} /> 
        };
      case 'low-stock': 
        return { 
          bg: darkMode ? 'bg-orange-900/30' : 'bg-orange-100', 
          text: darkMode ? 'text-orange-400' : 'text-orange-800', 
          icon: <AlertTriangle size={12} /> 
        };
      case 'out-of-stock': 
        return { 
          bg: darkMode ? 'bg-rose-900/30' : 'bg-rose-100', 
          text: darkMode ? 'text-rose-400' : 'text-rose-800', 
          icon: <AlertCircle size={12} /> 
        };
      default: 
        return { 
          bg: darkMode ? 'bg-neutral-800' : 'bg-neutral-100', 
          text: darkMode ? 'text-neutral-400' : 'text-neutral-600',
          icon: <Package size={12} />
        };
    }
  };

  const handleViewProduct = (product) => {
    setViewingProduct(product);
  };

  const handleCloseViewModal = () => {
    setViewingProduct(null);
  };

  // ✅ دالة التعديل
  const handleEditClick = (product) => {
    const categoryId = product.categoryId || product.category;
    
    setEditingProduct(product.id);
    setEditingProductData(product);
    
    setEditForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      quantity: product.currentStock || 0,
      category: categoryId || '',
      sku: product.sku || '',
      weight: product.weight || '',
      dimensions: product.dimensions || '',
      manufacturer: product.manufacturer || '',
      warranty_months: product.warranty_months !== undefined && product.warranty_months !== null 
        ? product.warranty_months 
        : '',
      tags: product.tags 
        ? (Array.isArray(product.tags) 
            ? product.tags.join(', ') 
            : String(product.tags))
        : '',
      featured: product.featured || false,
      in_stock: product.currentStock > 0
    });
    
    const images = [];
    if (product.images && Array.isArray(product.images)) {
      images.push(...product.images);
    } else if (product.image && typeof product.image === 'string') {
      images.push(product.image);
    }
    setCurrentImagesList(images);
    setNewImages([]);
    setNewImagePreviews([]);
    setImagesToDelete([]);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditingProductData(null);
    setEditForm({
      name: '',
      description: '',
      price: '',
      quantity: '',
      category: '',
      sku: '',
      weight: '',
      dimensions: '',
      manufacturer: '',
      warranty_months: '',
      tags: '',
      featured: false,
      in_stock: true
    });
    setCurrentImagesList([]);
    setNewImages([]);
    setNewImagePreviews([]);
    setImagesToDelete([]);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNewImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + currentImagesList.length - imagesToDelete.length + newImages.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    const newImagesArray = [...newImages];
    const newPreviewsArray = [...newImagePreviews];

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`);
        return;
      }

      newImagesArray.push(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviewsArray.push(reader.result);
        setNewImagePreviews([...newPreviewsArray]);
      };
      reader.readAsDataURL(file);
    });

    setNewImages(newImagesArray);
  };

  const handleRemoveCurrentImage = (index) => {
    const imageToRemove = currentImagesList[index];
    setImagesToDelete(prev => [...prev, imageToRemove]);
    const updatedImages = currentImagesList.filter((_, i) => i !== index);
    setCurrentImagesList(updatedImages);
  };

  const handleRemoveNewImage = (index) => {
    const newImagesArray = [...newImages];
    const newPreviewsArray = [...newImagePreviews];
    
    newImagesArray.splice(index, 1);
    newPreviewsArray.splice(index, 1);
    
    setNewImages(newImagesArray);
    setNewImagePreviews(newPreviewsArray);
  };


const handleUpdate = async (formData) => {
  if (!editingProduct) return;
  
  try {
    setLoading(true);
    const response = await productService.update(editingProduct, formData);
    
    // ✅ ✅ ✅ هنا - بعد نجاح التحديث
    if (response.status === 200 || response.status === 201 || response.data) {
      alert('✅ Product updated successfully!');
      handleCancelEdit();
      await fetchInventory(true);
      
      // ✅ ✅ ✅ إطلاق الأحداث
      window.dispatchEvent(new Event('product-updated'));
      window.dispatchEvent(new Event('inventory-updated'));
    }
  } catch (error) {
    console.error('Error updating product:', error);
    alert('❌ Failed to update product');
  } finally {
    setLoading(false);
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

  // ✅ حالة التحميل
  if (loading) {
    return (
      <div className="space-y-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl p-8 text-center ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button onClick={() => fetchInventory(true)} className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg">
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
          title="Total Products"
          value={stats.totalProducts}
          icon={<Package size={20} />}
          subtitle={`${stats.totalItems} total items`}
          variant="success"
          darkMode={darkMode}
          lightBgOpacity={0.6}
        />
        <MetricCard
          title="Inventory Value"
          value={formatCurrency(stats.totalValue)}
          icon={<DollarSign size={20} />}
          subtitle="Total stock value"
          variant="primary"
          darkMode={darkMode}
          lightBgOpacity={0.6}
        />
        <MetricCard
          title="Low Stock"
          value={stats.lowStock}
          icon={<AlertTriangle size={20} />}
          subtitle="Needs attention"
          variant="secondary"
          darkMode={darkMode}
        />
        <MetricCard
          title="Out of Stock"
          value={stats.outOfStock}
          icon={<Clock size={20} />}
          subtitle="Urgent restock needed"
          variant="warning"
          darkMode={darkMode}
        />
      </div>

      {/* Filters Section */}
      <FilterControls
        darkMode={darkMode}
        searchTerm={searchQuery}
        setSearchTerm={setSearchQuery}
        searchPlaceholder="Search by product name, SKU, or category..."
        filters={[
          {
            value: filter,
            onChange: setFilter,
            defaultValue: 'all',
            defaultLabel: 'All Status',
            icon: 'status',
            options: [
              { value: 'all', label: 'All Status', icon: <Filter size={14} /> },
              { value: 'in-stock', label: 'In Stock', icon: <CheckCircle size={14} className="text-emerald-500" /> },
              { value: 'medium-stock', label: 'Medium Stock', icon: <Clock size={14} className="text-purple-500" /> },
              { value: 'low-stock', label: 'Low Stock', icon: <AlertTriangle size={14} className="text-orange-500" /> },
              { value: 'out-of-stock', label: 'Out of Stock', icon: <X size={14} className="text-rose-500" /> }
            ]
          }
        ]}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOptions={[
          { value: 'name', label: 'Sort by Name', icon: <Package size={14} /> },
          { value: 'stock', label: 'Sort by Stock', icon: <BarChart3 size={14} /> },
          { value: 'value', label: 'Sort by Value', icon: <DollarSign size={14} /> }
        ]}
        viewMode={selectedView}
        setViewMode={setSelectedView}
        actionButton={{
          show: true,
          text: "Add Product",
          icon: <Plus size={18} />,
          onClick: () => navigate('/add-product')
        }}
        extraButtons={[
          { 
            text: "Refresh", 
            icon: <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />, 
            onClick: handleRefresh 
          },
          { text: "Export", icon: <Download size={16} />, onClick: () => console.log('Export') }
        ]}
        filteredCount={filteredInventory.length}
        totalCount={inventory.length}
        onReset={() => {
          setSearchQuery('');
          setFilter('all');
          setSortBy('name');
        }}
      />

      {/* Inventory Grid View */}
      {selectedView === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInventory.map((item) => {
            const statusColors = getStatusColor(item.status);
            const barColor = getBarColor(item.stockPercentage, item.status);
            const categoryColor = getCategoryColorClass(item.categoryId || item.category);
            const isLowStock = item.status === 'low-stock' || item.status === 'out-of-stock';
            
            return (
              <div
                key={item.id}
                className={`group relative rounded-xl overflow-hidden transition-all duration-300 
                  hover:shadow-xl hover:-translate-y-1
                  ${darkMode 
                    ? 'bg-neutral-800/80 border hover:border-primary-500/50' 
                    : 'bg-white border hover:border-primary-500/30'
                  }`}
                style={{ borderColor: `${barColor}40` }}
              >
                <div className="h-1.5 w-full absolute top-0 left-0" style={{ background: `${barColor}70` }} />
                
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110
                        ${darkMode ? 'bg-neutral-700/50' : 'bg-primary-100'}`}>
                        <Package size={20} style={{ color: colors.primary }} />
                      </div>
                      <div>
                        <h3 className={`text-base font-bold line-clamp-1 ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                          {item.name}
                        </h3>
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500">{item.sku}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap
                      ${statusColors.bg} ${statusColors.text}`}>
                      {item.status === 'in-stock' ? 'In Stock' : 
                       item.status === 'medium-stock' ? 'Medium' :
                       item.status === 'low-stock' ? 'Low' : 'Out'}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${categoryColor}`}>
                        {item.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-4">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className={darkMode ? 'text-neutral-400' : 'text-neutral-500'}>Stock Level</span>
                        <span className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-neutral-700'}`}>
                          {item.currentStock} / {item.maxStock}
                        </span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-neutral-700' : 'bg-neutral-100'}`}>
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.stockPercentage}%`, background: barColor }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`rounded-xl p-3 transition-all duration-200 group-hover:shadow-md
                        ${darkMode ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border border-neutral-100 shadow-sm'}`}>
                        <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">Price</p>
                        <p className={`text-lg font-bold tracking-tight ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className={`rounded-xl p-3 transition-all duration-200 group-hover:shadow-md
                        ${darkMode ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border border-neutral-100 shadow-sm'}`}>
                        <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">Value</p>
                        <p className="text-lg font-bold tracking-tight" style={{ color: colors.primary }}>
                          {formatCurrency(item.value)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-700">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleViewProduct(item)}
                        className={`p-2 rounded-lg transition-all duration-200
                          ${darkMode 
                            ? 'hover:bg-neutral-700 text-neutral-400 hover:text-white' 
                            : 'hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700'
                          }`}
                        title="View product details"
                      >
                        <Eye size={15} />
                      </button>
                      <button 
                        onClick={() => handleEditClick(item)}
                        className={`p-2 rounded-lg transition-all duration-200
                          ${darkMode 
                            ? 'hover:bg-neutral-700 text-neutral-400 hover:text-white' 
                            : 'hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700'
                          }`}
                        title="Edit product"
                      >
                        <Edit2 size={15} style={{ color: colors.primary }} />
                      </button>
                      <button 
                        onClick={() => openReorderModal(item)}
                        className={`p-2 rounded-lg transition-all duration-200
                          ${darkMode 
                            ? 'hover:bg-neutral-700 text-neutral-400 hover:text-white' 
                            : 'hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700'
                          }`}
                        title="Reorder this product"
                      >
                        <Truck 
                          size={15} 
                          style={{ 
                            color: isLowStock 
                              ? (darkMode ? colors.accent : colors.accent)
                              : (darkMode ? colors.primary : colors.primary)
                          }} 
                        />
                      </button>
                    </div>
                    <span className="text-[10px] text-neutral-400">Updated: {item.lastUpdated}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // ✅ Table View مع زر Reorder
        <div className={`rounded-2xl transition-all duration-300 overflow-hidden ${
          darkMode 
            ? 'bg-gradient-card-dark border border-neutral-800 hover:border-neutral-700 shadow-lg' 
            : 'bg-gradient-card border border-neutral-200 hover:border-neutral-300 shadow-lg'
        }`}>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className={darkMode ? 'bg-neutral-900/50' : 'bg-primary-800/5'}>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Product</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Category</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Price</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Stock</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Value</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const statusColors = getStatusColor(item.status);
                  const barColor = getBarColor(item.stockPercentage, item.status);
                  const categoryColor = getCategoryColorClass(item.categoryId || item.category);
                  const isLowStock = item.status === 'low-stock' || item.status === 'out-of-stock';
                  
                  return (
                    <tr key={item.id} className={`border-t border-neutral-200 dark:border-neutral-800 transition-colors duration-200 ${darkMode ? 'hover:bg-neutral-800/50' : 'hover:bg-neutral-50'}`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                            <Package size={16} className={darkMode ? "text-neutral-300" : "text-neutral-600"} />
                          </div>
                          <div>
                            <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                              {item.name}
                            </p>
                            <p className={`text-xs mt-0.5 ${darkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                              {item.sku}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${categoryColor}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                          {formatCurrency(item.price)}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                            {item.currentStock}
                          </span>
                          <div className="w-16 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${item.stockPercentage}%`, background: barColor }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                          {formatCurrency(item.value)}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                          {statusColors.icon}
                          {item.status === 'in-stock' ? 'In Stock' : 
                           item.status === 'medium-stock' ? 'Medium' :
                           item.status === 'low-stock' ? 'Low' : 'Out'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewProduct(item)}
                            className={`p-1.5 rounded-lg transition-colors 
                              ${darkMode 
                                ? 'hover:bg-neutral-700 text-neutral-400 hover:text-white' 
                                : 'hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700'
                              }`}
                            title="View details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleEditClick(item)}
                            className={`p-1.5 rounded-lg transition-colors 
                              ${darkMode 
                                ? 'hover:bg-neutral-700 text-neutral-400 hover:text-white' 
                                : 'hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700'
                              }`}
                            title="Edit product"
                          >
                            <Edit2 size={15} style={{ color: colors.primary }} />
                          </button>
                          <button
                            onClick={() => openReorderModal(item)}
                            className={`p-1.5 rounded-lg transition-colors 
                              ${darkMode 
                                ? 'hover:bg-neutral-700 text-neutral-400 hover:text-white' 
                                : 'hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700'
                              }`}
                            title="Reorder this product"
                          >
                            <Truck 
                              size={15} 
                              style={{ 
                                color: isLowStock 
                                  ? (darkMode ? colors.accent : colors.accent)
                                  : (darkMode ? colors.primary : colors.primary)
                              }} 
                            />
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
      )}

      {/* Product View Modal */}
      {viewingProduct && (
        <ProductViewModal
          darkMode={darkMode}
          product={viewingProduct}
          onClose={handleCloseViewModal}
          onEdit={handleEditClick}
        />
      )}

      {/* Product Edit Modal */}
      {editingProduct && editingProductData && (
        <ProductEditModal
          darkMode={darkMode}
          editingProduct={editingProductData}
          editForm={editForm}
          currentProductImage={null}
          currentImagesList={currentImagesList}
          newImagePreviews={newImagePreviews}
          handleInputChange={handleInputChange}
          handleNewImageUpload={handleNewImageUpload}
          handleRemoveCurrentImage={handleRemoveCurrentImage}
          handleRemoveNewImage={handleRemoveNewImage}
          handleUpdate={handleUpdate}
          handleCancelEdit={handleCancelEdit}
          setNewImages={setNewImages}
          setNewImagePreviews={setNewImagePreviews}
          setCurrentProductImage={() => {}}
          categoriesList={getCategoryOptions().map(cat => cat.name)}
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
    </div>
  );
};

export default InventoryPage;