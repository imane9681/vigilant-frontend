import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService, categoryService } from '../../services/api';
import ProductGrid from "./components/ProductGrid";
import ProductListView from "./components/ProductListView";
import ProductEditModal from "./components/ProductEditModal";
import MetricCard from '../Dashboard/components/MetricCard';
import FilterControls from '../../components/ui/FilterControls';
import { useCategories } from '../../contexts/CategoryContext';

import { 
  Plus, 
  AlertCircle, 
  Package, 
  PackageIcon, 
  DollarSign, 
  Star, 
  Clock, 
  AlertTriangle,
  Filter,
  CheckCircle,
  X,
  Download,
  Eye,
  Edit2,
  Trash2,
  Grid,
  List,
  Layers,
  SlidersHorizontal,
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  Shirt,
  ShoppingBag,
  Home,
  Sofa,
  BookOpen,
  Library,
  Dumbbell,
  Bike,
  Heart,
  Activity,
  Sparkles,
  Flower2,
  Box,
  PackageOpen,
  Watch,
  Headphones,
  Camera,
  Gamepad2,
  FolderTree,
  Award,
  Tag
} from 'lucide-react';

const ProductList = ({ darkMode }) => {
  const navigate = useNavigate();
  const { categories: contextCategories, getCategoryById } = useCategories();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categoriesWithIcons, setCategoriesWithIcons] = useState({});
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [categoriesList, setCategoriesList] = useState([]);
  
  // ✅ قائمة الفئات مع أيقوناتها وألوانها (كـ fallback)
  const categories = [
    { id: 'electronics', name: 'Electronics', icon: Laptop, color: 'purple', subCategories: ['Laptops', 'Smartphones', 'Tablets', 'Cameras'] },
    { id: 'clothing', name: 'Clothing', icon: Shirt, color: 'pink', subCategories: ["Men's", "Women's", "Kids", "Accessories"] },
    { id: 'home-garden', name: 'Home & Garden', icon: Home, color: 'orange', subCategories: ['Furniture', 'Decor', 'Kitchen', 'Garden'] },
    { id: 'books', name: 'Books', icon: BookOpen, color: 'blue', subCategories: ['Fiction', 'Non-Fiction', 'Educational', 'Children'] },
    { id: 'sports', name: 'Sports', icon: Dumbbell, color: 'green', subCategories: ['Fitness', 'Outdoor', 'Team Sports', 'Equipment'] },
    { id: 'health', name: 'Health', icon: Heart, color: 'red', subCategories: ['Supplements', 'Personal Care', 'Medical', 'Wellness'] },
    { id: 'beauty', name: 'Beauty', icon: Sparkles, color: 'pink', subCategories: ['Makeup', 'Skincare', 'Hair Care', 'Fragrances'] },
    { id: 'other', name: 'Other', icon: Box, color: 'neutral', subCategories: [] }
  ];

  // ✅ خريطة الأيقونات
  const iconMap = {
    FolderTree: FolderTree,
    Package: Package,
    Laptop: Laptop,
    Shirt: Shirt,
    Home: Home,
    BookOpen: BookOpen,
    Heart: Heart,
    Star: Star,
    Award: Award,
    Tag: Tag,
    Layers: Layers,
    Grid: Grid,
    ShoppingBag: ShoppingBag,
    Watch: Watch,
    Headphones: Headphones,
    Camera: Camera,
    Dumbbell: Dumbbell,
    Sparkles: Sparkles
  };

  // ✅ دالة للحصول على اسم الفئة من الـ id
  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'Uncategorized';
    
    // ✅ البحث في Context
    const category = getCategoryById(categoryId);
    if (category && category.name) {
      return category.name;
    }
    
    // ✅ البحث في القائمة المحلية (fallback)
    const found = categories.find(c => c.id === categoryId);
    if (found) return found.name;
    
    // ✅ إذا كان الرقم مطابق لاسم فئة معروف
    const categoryNames = {
      '1': 'Electronics',
      '2': 'Clothing',
      '3': 'Books',
      '4': 'Home & Garden',
      '5': 'Sports',
      '6': 'Health',
      '7': 'Beauty',
    };
    
    return categoryNames[categoryId] || `Category ${categoryId}`;
  };

  // ✅ دالة للحصول على أيقونة الفئة من الـ id
  const getCategoryIcon = (categoryId, size = 14) => {
    // ✅ البحث في Context
    const category = getCategoryById(categoryId);
    if (category) {
      const IconComponent = iconMap[category.icon] || FolderTree;
      return <IconComponent size={size} style={{ color: category.color || '#8B7ABA' }} />;
    }
    
    // ✅ البحث في القائمة المحلية (fallback)
    const found = categories.find(c => c.id === categoryId);
    if (found) {
      const IconComponent = found.icon;
      const colorMap = {
        purple: '#8B7ABA',
        pink: '#F08FAE',
        orange: '#EE9C6C',
        blue: '#34D19C',
        green: '#3B82F6',
        red: '#EF4444',
        neutral: '#6B7280'
      };
      return <IconComponent size={size} style={{ color: colorMap[found.color] || '#8B7ABA' }} />;
    }
    
    return <FolderTree size={size} style={{ color: '#8B7ABA' }} />;
  };

  // ✅ دالة للحصول على لون الفئة للـ badge
  const getCategoryColorClass = (categoryId) => {
    // ✅ البحث في Context
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
    
    // ✅ البحث في القائمة المحلية (fallback)
    const found = categories.find(c => c.id === categoryId);
    if (found) {
      const colorMap = {
        purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        neutral: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
      };
      return colorMap[found.color] || 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300';
    }
    
    return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300';
  };

  // Edit modal states
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingProductData, setEditingProductData] = useState(null);
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

  // Image states for editing
  const [currentProductImage, setCurrentProductImage] = useState(null);
  const [currentImagesList, setCurrentImagesList] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStock: 0,
    featured: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0
  });

  // Skeleton loading state
  const [showSkeleton, setShowSkeleton] = useState(true);

  // ✅ جلب الفئات من API
  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ دالة جلب الفئات المحسنة
  const fetchCategories = async () => {
    try {
      // جلب الفئات من API
      const response = await categoryService.getAll();
      let apiCategories = [];
      
      // ✅ التعامل مع هيكل البيانات بشكل صحيح
      if (response.data) {
        if (Array.isArray(response.data)) {
          apiCategories = response.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          apiCategories = response.data.results;
        }
      }
      
      
      const apiCategoryNames = apiCategories.map(cat => cat.name);
      
      // جلب المنتجات للحصول على الفئات الإضافية
      const productsResponse = await productService.getAll();
      let productsData = [];
      if (productsResponse.data) {
        if (Array.isArray(productsResponse.data)) {
          productsData = productsResponse.data;
        } else if (productsResponse.data.results && Array.isArray(productsResponse.data.results)) {
          productsData = productsResponse.data.results;
        }
      }
      
      // ✅ استخراج أسماء الفئات من المنتجات (قد تكون أرقام أو نصوص)
      const productCategories = productsData
        .map(p => p.category)
        .filter(Boolean)
        .filter(cat => typeof cat === 'string' && isNaN(cat)); // فقط الأسماء النصية
      
      // دمج الفئات
      const allCategories = [...new Set([...apiCategoryNames, ...productCategories])];
      allCategories.sort();
      
      setCategoriesList(allCategories);
      
      // ✅ تخزين أيقونات الفئات من API
      const iconsMap = {};
      apiCategories.forEach(cat => {
        iconsMap[cat.id] = {
          icon: cat.icon || 'FolderTree',
          color: cat.color || '#8B7ABA',
          name: cat.name
        };
      });
      setCategoriesWithIcons(iconsMap);
      
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoriesList(['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports', 'Health', 'Beauty', 'Other']);
    }
  };

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  // Update stats when products change
  useEffect(() => {
    if (products.length > 0) {
      const inStock = products.filter(p => p.quantity > 0).length;
      const featured = products.filter(p => p.featured).length;
      const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.price) * parseInt(p.quantity)), 0);
      const lowStock = products.filter(p => p.quantity <= 10 && p.quantity > 0).length;
      const outOfStock = products.filter(p => p.quantity === 0).length;
      
      setStats({
        totalProducts: products.length,
        inStock,
        featured,
        totalValue,
        lowStock,
        outOfStock
      });
      setShowSkeleton(false);
    }
  }, [products]);

  // Filter and sort when dependencies change
  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, sortBy, selectedCategory, selectedStatus]);

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCategoryName(product.category)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category (مقارنة بالاسم)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => {
        const categoryName = getCategoryName(product.category);
        return categoryName === selectedCategory;
      });
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      switch (selectedStatus) {
        case 'in_stock':
          filtered = filtered.filter(p => p.quantity > 10);
          break;
        case 'low_stock':
          filtered = filtered.filter(p => p.quantity <= 10 && p.quantity > 0);
          break;
        case 'out_of_stock':
          filtered = filtered.filter(p => p.quantity === 0);
          break;
      }
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'name':
          return a.name?.localeCompare(b.name);
        case 'quantity':
          return b.quantity - a.quantity;
        case 'featured':
          return (b.featured || false) - (a.featured || false);
        default: // 'newest'
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    setFilteredProducts(filtered);
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      setShowSkeleton(true);
      const response = await productService.getAll();
      
      let productsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          productsData = response.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          productsData = response.data.results;
        }
      }
      
      const normalizedProducts = productsData.map(product => ({
        ...product,
        tags: Array.isArray(product.tags) 
          ? product.tags.join(', ')
          : (product.tags || ''),
        warranty_months: product.warranty_months || 0,
        name: product.name || '',
        description: product.description || '',
        price: product.price !== undefined && product.price !== null 
          ? (typeof product.price === 'string' ? parseFloat(product.price) : product.price) 
          : 0,
        quantity: product.quantity || 0,
        category: product.category || null, // قد يكون id (رقم) أو اسم (نص)
        sku: product.sku || '',
        weight: product.weight || '',
        dimensions: product.dimensions || '',
        manufacturer: product.manufacturer || '',
        featured: product.featured || false,
        in_stock: product.in_stock !== false,
        images: Array.isArray(product.images) ? product.images : (product.image ? [product.image] : [])
      }));
      
      setProducts(normalizedProducts);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.delete(id);
        await fetchProducts();
        await fetchCategories();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  // Edit product functions
  const handleEditClick = (product) => {
    setEditingProduct(product.id);
    setEditingProductData(product);
    
    setEditForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      quantity: product.quantity || 0,
      category: product.category || '',
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
      in_stock: product.in_stock !== false
    });
    
    const images = [];
    if (product.images && Array.isArray(product.images)) {
      images.push(...product.images);
    } else if (product.image && typeof product.image === 'string') {
      images.push(product.image);
    }
    setCurrentImagesList(images);
    setCurrentProductImage(product.image || null);
    setNewImages([]);
    setNewImagePreviews([]);
    setImagesToDelete([]);
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
      await fetchProducts();
      await fetchCategories();
      
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
    setCurrentProductImage(null);
    setCurrentImagesList([]);
    setNewImages([]);
    setNewImagePreviews([]);
    setImagesToDelete([]);
  };

  // Loading state with skeleton
  if (loading && showSkeleton) {
    return (
      <div className="space-y-8 animate-fade-in-up mt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-48"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-64"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded-xl w-40"></div>
            <div className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded-xl w-12"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`rounded-xl p-5 animate-pulse ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-20"></div>
                  <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-16"></div>
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-32"></div>
                </div>
                <div className="h-10 w-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`rounded-xl overflow-hidden animate-pulse ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
              <div className="h-40 w-full bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 dark:from-neutral-700 dark:via-neutral-800 dark:to-neutral-700 shimmer-effect"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
                <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-16"></div>
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`rounded-xl p-6 shadow-lg animate-fade-in-up mt-6 ${darkMode 
        ? 'bg-gradient-to-r from-red-900/20 to-red-800/10 border-red-800/30' 
        : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'}`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
            <AlertCircle className="text-red-500" size={28} />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-red-300' : 'text-red-800'}`}>Error Loading Products</h3>
            <p className={`mt-1 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-4 px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
                       text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 stagger-animation mt-2">
      {/* Stats with MetricCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          darkMode={darkMode}
          title="Total Products"
          value={stats.totalProducts}
          icon={<PackageIcon size={20} />}
          subtitle={`${stats.inStock} in stock`}
          variant="success"
          lightBgOpacity={0.6}
        />
        
        <MetricCard
          darkMode={darkMode}
          title="Inventory Value"
          value={`$${stats.totalValue.toLocaleString()}`}
          icon={<DollarSign size={20} />}
          subtitle="Total stock value"
          variant="primary"
          lightBgOpacity={0.6}
        />
        
        <MetricCard
          darkMode={darkMode}
          title="Featured Items"
          value={stats.featured}
          icon={<Star size={20} />}
          subtitle={`${((stats.featured / stats.totalProducts) * 100).toFixed(1)}% of total`}
          variant="secondary"
        />
        
        <MetricCard
          darkMode={darkMode}
          title="Low Stock Alert"
          value={stats.lowStock}
          icon={<AlertTriangle size={20} />}
          subtitle={`${stats.outOfStock} out of stock`}
          variant="warning"
        />
      </div>

      {/* FilterControls مع الفئات الديناميكية */}
      <FilterControls
        darkMode={darkMode}
        title="Filter & Controls"
        description="Search, filter and manage your products"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Search products by name, SKU, or category..."
        filters={[
          {
            value: selectedCategory,
            onChange: setSelectedCategory,
            defaultValue: 'all',
            defaultLabel: 'All Categories',
            icon: 'category',
            options: [
              { value: 'all', label: 'All Categories', icon: <Filter size={14} className="text-neutral-400" /> },
              ...categoriesList.map(cat => ({
                value: cat,
                label: cat,
                icon: <FolderTree size={14} style={{ color: '#8B7ABA' }} />
              }))
            ]
          },
          {
            value: selectedStatus,
            onChange: setSelectedStatus,
            defaultValue: 'all',
            defaultLabel: 'All Status',
            icon: 'status',
            options: [
              { value: 'all', label: 'All Status', icon: <Filter size={14} className="text-neutral-400" /> },
              { value: 'in_stock', label: 'In Stock', icon: <CheckCircle size={14} className="text-green-500" /> },
              { value: 'low_stock', label: 'Low Stock', icon: <AlertTriangle size={14} className="text-yellow-500" /> },
              { value: 'out_of_stock', label: 'Out of Stock', icon: <X size={14} className="text-red-500" /> }
            ]
          }
        ]}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOptions={[
          { value: 'newest', label: 'Newest', icon: <Clock size={14} className="text-blue-500" /> },
          { value: 'price-low', label: 'Price: Low to High', icon: <DollarSign size={14} className="text-green-500" /> },
          { value: 'price-high', label: 'Price: High to Low', icon: <DollarSign size={14} className="text-red-500" /> },
          { value: 'name', label: 'Name', icon: <Package size={14} className="text-neutral-500" /> },
          { value: 'quantity', label: 'Stock', icon: <Package size={14} className="text-purple-500" /> },
          { value: 'featured', label: 'Featured', icon: <Star size={14} className="text-yellow-500" /> }
        ]}
        viewMode={viewMode}
        setViewMode={setViewMode}
        actionButton={{
          show: true,
          text: "Add Product",
          icon: <Plus size={18} />,
          onClick: () => navigate('/add-product')
        }}
        extraButtons={[
          {
            text: "Export",
            icon: <Download size={16} />,
            onClick: () => console.log('Export products')
          }
        ]}
        filteredCount={filteredProducts.length}
        totalCount={products.length}
        onReset={() => {
          setSearchTerm('');
          setSelectedCategory('all');
          setSelectedStatus('all');
          setSortBy('newest');
        }}
      />
      
      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <div className={`rounded-xl border p-8 text-center ${darkMode 
          ? 'bg-gradient-to-br from-neutral-800 to-neutral-900 border-neutral-700' 
          : 'bg-gradient-to-br from-neutral-50 to-neutral-100 border-neutral-200'}`}>
          <div className={`w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 float-animation
                       ${darkMode 
                         ? 'bg-gradient-to-r from-primary-800/20 to-primary-800/20' 
                         : 'bg-gradient-to-r from-primary-100 to-primary-100'}`}>
            <Package className={darkMode ? "text-primary-300" : "text-primary-300"} size={32} />
          </div>
          <h3 className={`text-lg font-bold ${darkMode ? 'text-neutral-300' : 'text-neutral-800'}`}>No products found</h3>
          <p className={`mt-1 max-w-md mx-auto text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            {searchTerm ? `No products match your search for "${searchTerm}"` : 'Get started by adding your first product'}
          </p>
          {!searchTerm && (
            <Link
              to="/add-product"
              className="group relative overflow-hidden inline-flex items-center gap-2 mt-4 px-5 py-2.5 
                       bg-primary-300 hover:bg-primary-300/80 
                       text-white font-medium rounded-lg shadow-lg hover:shadow-xl 
                       transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              Add New Product
            </Link>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <ProductGrid 
          darkMode={darkMode}
          products={filteredProducts}
          handleEditClick={handleEditClick}
          handleDelete={handleDelete}
          getCategoryName={getCategoryName}
          getCategoryIcon={getCategoryIcon}
          getCategoryColorClass={getCategoryColorClass}
        />
      ) : (
        <ProductListView 
          darkMode={darkMode}
          products={filteredProducts}
          handleEditClick={handleEditClick}
          handleDelete={handleDelete}
          getCategoryName={getCategoryName}
          getCategoryIcon={getCategoryIcon}
          getCategoryColorClass={getCategoryColorClass}
        />
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <ProductEditModal 
          darkMode={darkMode}
          editingProduct={editingProductData}
          editForm={editForm}
          currentProductImage={currentProductImage}
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
          setCurrentProductImage={setCurrentProductImage}
          categoriesList={categoriesList}
        />
      )}
    </div>
  );
};

export default ProductList;