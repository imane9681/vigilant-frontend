import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { 
  // ✅ أيقونات عامة
  Layers, Plus, Trash2, ChevronDown, ChevronRight,
  Filter, Package, ShoppingBag, TrendingUp, Grid,
  MoreHorizontal, Eye, Download, X, Check,
  Circle, Clock, BarChart3, FolderTree, Award, Tag, Star, Heart,
  FolderOpen, ChevronUp, Edit2, Save,
  
  // ✅ إلكترونيات
  Smartphone, Laptop, Watch, Headphones, Camera,
  Tablet, Monitor, Printer, Speaker, Gamepad2,
  Keyboard, Mouse, Tv,
  
  // ✅ ملابس
  Shirt, ShoppingBag as BagIcon,
  
  // ✅ منزل
  Home, Sofa, Lamp, Bath,
  
  // ✅ كتب
  BookOpen, Library,
  
  // ✅ رياضة
  Dumbbell, Bike,
  
  // ✅ صحة وجمال
  Sparkles, Flower2, Activity, Heart as HeartIcon, Pill, Syringe,
  
  // ✅ طعام
  Coffee, Utensils, Gift,
  
  // ✅ أسهم
  ArrowUpRight, ArrowDownRight,
  
  // ✅ أيقونات إضافية
  Loader2, RefreshCw, AlertCircle, CheckCircle, Info,
  Calendar, Clock as ClockIcon, Users, DollarSign,
  FileText, Settings, Shield, Database, Server,
  Globe, Mail, Phone, MapPin, User, Users as UsersIcon,
  List
} from 'lucide-react';
import FilterControls from '../../components/ui/FilterControls';
import MetricCard from '../Dashboard/components/MetricCard';
import { productService } from '../../services/api';
import { useCategories } from '../../contexts/CategoryContext';

// ✅ ألوان المشروع
const COLORS = {
  primary: '#8B7ABA',
  secondary: '#F08FAE',
  accent: '#EE9C6C',
  success: '#34D19C',
  gradient: 'linear-gradient(135deg, #8B7ABA 0%, #F08FAE 50%, #EE9C6C 100%)',
};

// ✅ خريطة الأيقونات (بدون تكرار)
const iconMap = {
  // أيقونات عامة
  'FolderTree': FolderTree,
  'FolderOpen': FolderOpen,
  'Package': Package,
  'Layers': Layers,
  'Grid': Grid,
  'Tag': Tag,
  'Award': Award,
  'Star': Star,
  'Heart': Heart,
  
  // إلكترونيات
  'Laptop': Laptop,
  'Smartphone': Smartphone,
  'Watch': Watch,
  'Headphones': Headphones,
  'Camera': Camera,
  'Tablet': Tablet,
  'Monitor': Monitor,
  'Printer': Printer,
  'Speaker': Speaker,
  'Keyboard': Keyboard,
  'Mouse': Mouse,
  'Tv': Tv,
  
  // ملابس
  'Shirt': Shirt,
  'ShoppingBag': ShoppingBag,
  
  // منزل
  'Home': Home,
  'Sofa': Sofa,
  'Lamp': Lamp,
  'Bath': Bath,
  
  // كتب
  'BookOpen': BookOpen,
  'Library': Library,
  
  // رياضة
  'Dumbbell': Dumbbell,
  'Bike': Bike,
  
  // صحة وجمال
  'Sparkles': Sparkles,
  'Flower2': Flower2,
  'Activity': Activity,
  'Pill': Pill,
  'Syringe': Syringe,
  
  // طعام
  'Coffee': Coffee,
  'Utensils': Utensils,
  'Gift': Gift,
  
  // ألعاب
  'Gamepad2': Gamepad2,
};

// ✅ قائمة الأيقونات المتاحة
const AVAILABLE_ICONS = [
  { name: 'FolderTree', label: 'Folder' },
  { name: 'FolderOpen', label: 'Open Folder' },
  { name: 'Package', label: 'Package' },
  { name: 'Layers', label: 'Layers' },
  { name: 'Grid', label: 'Grid' },
  { name: 'Tag', label: 'Tag' },
  { name: 'Award', label: 'Award' },
  { name: 'Star', label: 'Star' },
  { name: 'Heart', label: 'Heart' },
  { name: 'Laptop', label: 'Laptop' },
  { name: 'Smartphone', label: 'Phone' },
  { name: 'Watch', label: 'Watch' },
  { name: 'Headphones', label: 'Headphones' },
  { name: 'Camera', label: 'Camera' },
  { name: 'Tablet', label: 'Tablet' },
  { name: 'Monitor', label: 'Monitor' },
  { name: 'Printer', label: 'Printer' },
  { name: 'Speaker', label: 'Speaker' },
  { name: 'Gamepad2', label: 'Gamepad' },
  { name: 'Keyboard', label: 'Keyboard' },
  { name: 'Mouse', label: 'Mouse' },
  { name: 'Tv', label: 'TV' },
  { name: 'Shirt', label: 'Shirt' },
  { name: 'ShoppingBag', label: 'Shopping Bag' },
  { name: 'Home', label: 'Home' },
  { name: 'Sofa', label: 'Sofa' },
  { name: 'Lamp', label: 'Lamp' },
  { name: 'Bath', label: 'Bath' },
  { name: 'BookOpen', label: 'Book' },
  { name: 'Library', label: 'Library' },
  { name: 'Dumbbell', label: 'Dumbbell' },
  { name: 'Bike', label: 'Bike' },
  { name: 'Activity', label: 'Activity' },
  { name: 'Pill', label: 'Pill' },
  { name: 'Syringe', label: 'Syringe' },
  { name: 'Sparkles', label: 'Sparkles' },
  { name: 'Flower2', label: 'Flower' },
  { name: 'Coffee', label: 'Coffee' },
  { name: 'Utensils', label: 'Food' },
  { name: 'Gift', label: 'Gift' },
];

const getDefaultIcon = (categoryName) => {
  if (!categoryName) return 'FolderTree';
  const defaultIcons = {
    'Electronics': 'Laptop',
    'Clothing': 'Shirt',
    'Home & Garden': 'Home',
    'Books': 'BookOpen',
    'Sports': 'Dumbbell',
    'Health': 'Heart',
    'Beauty': 'Sparkles',
    'Other': 'Package',
    'Food & Beverages': 'Coffee',
    'Toys & Games': 'Gamepad2',
  };
  return defaultIcons[categoryName] || 'FolderTree';
};

// ✅ ✅ ✅ الألوان الموسعة للفئات
const CATEGORY_COLORS = [
  // الألوان الأساسية
  '#8B7ABA', '#F08FAE',, '#F6CDB5', '#99E7CD', '#EE9C6C', '#34D19C',
  
  // الأزرق والأرجواني
  '#3B82F6', '#6366F1', '#8B5CF6', '#7C3AED', '#4F46E5', '#2563EB',
  
  // الأخضر
  '#10B981', '#059669', '#34D399', '#06B6D4', '#0EA5E9', '#22D3EE',
  
  // الأصفر والبرتقالي
  '#F59E0B', '#F97316', '#FB923C', '#EAB308', '#D97706', '#FCD34D',
  
  // الأحمر والوردي
  '#EF4444', '#DC2626', '#EC4899', '#F43F5E', '#FB7185', '#BE185D',
  
  // البنفسجي
  '#A78BFA', '#C084FC', '#7C3AED',
  
  // البني
  '#78716C', '#92400E', '#B45309',
  
  // المحايد
  '#6B7280', '#4B5563', '#9CA3AF',
];

const CategoriesPage = ({ darkMode }) => {
  const { 
    categories: contextCategories, 
    loading: contextLoading,
    addCategory,
    deleteCategory: deleteCategoryFromContext,
    updateCategory,
    refresh: refreshCategories,
  } = useCategories();
  
  const [categories, setCategories] = useState([]);
  const [allCategoriesFlat, setAllCategoriesFlat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ 
    name: '', 
    description: '', 
    parent: '',
    color: COLORS.primary,
    icon: 'FolderTree',
    is_active: true
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // ✅ ✅ ✅ إضافة viewMode و setViewMode
  const [viewMode, setViewMode] = useState('grid');
  
  const [filter, setFilter] = useState('all');
  const [products, setProducts] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // ✅ State للتعديل
  const [editingCategory, setEditingCategory] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    parent: '',
    color: COLORS.primary,
    icon: 'FolderTree',
    is_active: true
  });
  const [showEditForm, setShowEditForm] = useState(false);

  const [showParentDropdown, setShowParentDropdown] = useState(false);
  const parentButtonRef = useRef(null);
  const [parentDropdownPosition, setParentDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const editParentButtonRef = useRef(null);
  const [showEditParentDropdown, setShowEditParentDropdown] = useState(false);
  const [editParentDropdownPosition, setEditParentDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // ✅ ✅ ✅ دالة للحصول على لون الفئة
  const getCategoryColor = (category, fallbackIndex = 0) => {
    // ✅ 1. إذا كان هناك لون محدد في الفئة، استخدمه
    if (category?.color) {
      // ✅ إذا كان اللون على شكل Hex (#...)
      if (category.color.startsWith('#')) {
        return category.color;
      }
      // ✅ إذا كان اللون هو اسم من الأسماء المعروفة
      const colorMap = {
        'primary': '#8B7ABA',
        'secondary': '#F08FAE',
        'accent': '#EE9C6C',
        'success': '#34D19C'
      };
      return colorMap[category.color] || '#8B7ABA';
    }
    
    // ✅ 2. إذا لم يكن هناك لون، استخدم من القائمة الموسعة
    return CATEGORY_COLORS[fallbackIndex % CATEGORY_COLORS.length];
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (contextCategories && contextCategories.length > 0 && products.length > 0) {
      processData(contextCategories, products);
    } else if (contextCategories && contextCategories.length > 0 && dataLoaded) {
      loadProducts();
    }
  }, [contextCategories]);

  useEffect(() => {
    if (products.length > 0 && contextCategories && contextCategories.length > 0) {
      processData(contextCategories, products);
    }
  }, [products]);

  // ✅ إغلاق القوائم
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showParentDropdown && parentButtonRef.current) {
        const dropdownElement = document.querySelector('.parent-dropdown');
        if (!parentButtonRef.current.contains(event.target) && 
            dropdownElement && !dropdownElement.contains(event.target)) {
          setShowParentDropdown(false);
        }
      }
      if (showEditParentDropdown && editParentButtonRef.current) {
        const dropdownElement = document.querySelector('.edit-parent-dropdown');
        if (!editParentButtonRef.current.contains(event.target) && 
            dropdownElement && !dropdownElement.contains(event.target)) {
          setShowEditParentDropdown(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showParentDropdown, showEditParentDropdown]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await refreshCategories();
      await loadProducts();
      setDataLoaded(true);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const productsResponse = await productService.getAll();
      let productsData = [];
      if (productsResponse.data) {
        if (Array.isArray(productsResponse.data)) {
          productsData = productsResponse.data;
        } else if (productsResponse.data.results && Array.isArray(productsResponse.data.results)) {
          productsData = productsResponse.data.results;
        }
      }
      setProducts(productsData);
      return productsData;
    } catch (error) {
      console.error('❌ Error loading products:', error);
      return [];
    }
  };

  // ✅ ✅ ✅ دالة معالجة البيانات المحسنة
  const processData = (categoriesData, productsData) => {
    if (!categoriesData || categoriesData.length === 0) return;

    console.log("📊 Processing categories data:", categoriesData);
    console.log("📦 Products data:", productsData);

    const categoryMap = {};
    const mainCategories = [];
    const allCategoriesFlatList = [];
    
    // ✅ 1. إنشاء خريطة للفئات
    categoriesData.forEach(cat => {
      if (!cat || !cat.id) return;
      
      categoryMap[cat.id] = {
        ...cat,
        productCount: 0,
        revenue: 0,
        icon: cat.icon || getDefaultIcon(cat.name),
        color: cat.color || COLORS.primary,
        subcategories: [],
        is_active: cat.is_active !== false,
        description: cat.description || `${cat.name} products`,
        parentId: cat.parent || null
      };
    });

    // ✅ 2. حساب عدد المنتجات والإيرادات لكل فئة (بما فيها الفرعية)
    productsData.forEach(product => {
      if (!product) return;
      
      let categoryId = product.category;
      
      if (typeof categoryId === 'object' && categoryId !== null) {
        categoryId = categoryId.id;
      }
      
      if (categoryId) {
        const catId = typeof categoryId === 'string' ? parseInt(categoryId) : categoryId;
        
        if (categoryMap[catId]) {
          const price = parseFloat(product.price) || 0;
          const quantity = product.quantity || 0;
          
          categoryMap[catId].productCount += 1;
          categoryMap[catId].revenue += price * quantity;
          
          console.log(`📦 Product "${product.name}" → ${categoryMap[catId].name}: +1 product, +$${price * quantity}`);
        }
      }
    });

    // ✅ 3. بناء هيكل الفئات (رئيسية وفرعية)
    Object.keys(categoryMap).forEach(id => {
      const cat = categoryMap[id];
      
      if (cat.parentId) {
        const parentId = typeof cat.parentId === 'object' ? cat.parentId.id : cat.parentId;
        if (categoryMap[parentId]) {
          categoryMap[parentId].subcategories.push(cat);
        } else {
          if (!cat._added) {
            mainCategories.push(cat);
            cat._added = true;
          }
        }
      } else {
        if (!cat._added) {
          mainCategories.push(cat);
          cat._added = true;
        }
      }
    });

    // ✅ 4. ترتيب الفئات
    mainCategories.sort((a, b) => a.name.localeCompare(b.name));
    
    mainCategories.forEach(cat => {
      if (cat.subcategories && cat.subcategories.length > 0) {
        cat.subcategories.sort((a, b) => a.name.localeCompare(b.name));
        cat.subcategories.forEach(sub => {
          allCategoriesFlatList.push({
            ...sub,
            parentName: cat.name,
            parentId: cat.id,
            isSubcategory: true
          });
        });
      }
      allCategoriesFlatList.push({
        ...cat,
        isSubcategory: false
      });
    });

    console.log("📊 Main Categories:", mainCategories);
    console.log("📊 All Categories Flat:", allCategoriesFlatList);

    setCategories(mainCategories);
    setAllCategoriesFlat(allCategoriesFlatList);
  };

  // ✅ فتح نافذة التعديل
  const openEditModal = (category) => {
    setEditingCategory(category);
    setEditForm({
      name: category.name || '',
      description: category.description || '',
      parent: category.parentId || category.parent || '',
      color: category.color || COLORS.primary,
      icon: category.icon || 'FolderTree',
      is_active: category.is_active !== false
    });
    setShowEditForm(true);
  };

  // ✅ حفظ التعديل
  const handleEditCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    
    if (!editForm.name || !editForm.name.trim()) {
      alert('❌ Please enter a category name');
      return;
    }

    try {
      setLoading(true);
      const parentId = editForm.parent ? parseInt(editForm.parent) : null;
      
      await updateCategory(editingCategory.id, {
        name: editForm.name.trim(),
        description: editForm.description || `${editForm.name} products`,
        parent: parentId,
        color: editForm.color || COLORS.primary,
        icon: editForm.icon || 'FolderTree',
        is_active: editForm.is_active !== false
      });
      
      await loadAllData();
      setShowEditForm(false);
      setEditingCategory(null);
      alert(`✅ Category "${editForm.name}" updated successfully!`);
    } catch (error) {
      console.error('Error updating category:', error);
      alert('❌ Failed to update category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name || !newCategory.name.trim()) {
      alert('❌ Please enter a category name');
      return;
    }
    try {
      setLoading(true);
      const exists = categories.some(c => c.name.toLowerCase() === newCategory.name.trim().toLowerCase());
      if (exists) {
        alert('❌ Category already exists!');
        setLoading(false);
        return;
      }
      const parentId = newCategory.parent ? parseInt(newCategory.parent) : null;
      await addCategory({
        name: newCategory.name.trim(),
        description: newCategory.description || `${newCategory.name} products`,
        parent: parentId,
        color: newCategory.color || COLORS.primary,
        icon: newCategory.icon || 'FolderTree',
        is_active: newCategory.is_active !== false
      });
      await loadAllData();
      setNewCategory({ 
        name: '', description: '', parent: '',
        color: COLORS.primary, icon: 'FolderTree', is_active: true
      });
      setShowAddForm(false);
      alert(`✅ Category "${newCategory.name}" added successfully!`);
    } catch (error) {
      console.error('Error adding category:', error);
      alert('❌ Failed to add category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategoryFromContext(categoryId);
      await loadAllData();
      alert('✅ Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('❌ Failed to delete category. Please try again.');
    }
  };

  const handleDeleteSubcategory = async (subcategoryId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return;
    try {
      await deleteCategoryFromContext(subcategoryId);
      await loadAllData();
      alert('✅ Subcategory deleted successfully!');
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      alert('❌ Failed to delete subcategory. Please try again.');
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const getColorClasses = (colorName, isDark) => {
    const colorMap = {
      primary: {
        light: { bg: 'bg-[#8B7ABA]/10', text: 'text-[#8B7ABA]', border: 'border-[#8B7ABA]/20', hover: 'hover:bg-[#8B7ABA]/20' },
        dark: { bg: 'bg-[#8B7ABA]/20', text: 'text-[#8B7ABA]', border: 'border-[#8B7ABA]/30', hover: 'hover:bg-[#8B7ABA]/30' }
      },
      secondary: {
        light: { bg: 'bg-[#F08FAE]/10', text: 'text-[#F08FAE]', border: 'border-[#F08FAE]/20', hover: 'hover:bg-[#F08FAE]/20' },
        dark: { bg: 'bg-[#F08FAE]/20', text: 'text-[#F08FAE]', border: 'border-[#F08FAE]/30', hover: 'hover:bg-[#F08FAE]/30' }
      },
      accent: {
        light: { bg: 'bg-[#EE9C6C]/10', text: 'text-[#EE9C6C]', border: 'border-[#EE9C6C]/20', hover: 'hover:bg-[#EE9C6C]/20' },
        dark: { bg: 'bg-[#EE9C6C]/20', text: 'text-[#EE9C6C]', border: 'border-[#EE9C6C]/30', hover: 'hover:bg-[#EE9C6C]/30' }
      },
      success: {
        light: { bg: 'bg-[#34D19C]/10', text: 'text-[#34D19C]', border: 'border-[#34D19C]/20', hover: 'hover:bg-[#34D19C]/20' },
        dark: { bg: 'bg-[#34D19C]/20', text: 'text-[#34D19C]', border: 'border-[#34D19C]/30', hover: 'hover:bg-[#34D19C]/30' }
      }
    };
    return colorMap[colorName]?.[isDark ? 'dark' : 'light'] || colorMap.primary[isDark ? 'dark' : 'light'];
  };

  const formatCurrency = (value) => {
    const numValue = typeof value === 'number' ? value : 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(numValue);
  };

  const getFilteredCategories = () => {
    if (!categories || categories.length === 0) return [];
    let result = categories.filter(cat => {
      if (!cat) return false;
      return cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()));
    });
    if (filter === 'active') {
      result = result.filter(cat => cat.is_active !== false);
    } else if (filter === 'inactive') {
      result = result.filter(cat => cat.is_active === false);
    }
    return result;
  };

  const getFilteredFlatCategories = () => {
    if (!allCategoriesFlat || allCategoriesFlat.length === 0) return [];
    let result = allCategoriesFlat.filter(cat => {
      if (!cat) return false;
      return cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()));
    });
    if (filter === 'active') {
      result = result.filter(cat => cat.is_active !== false);
    } else if (filter === 'inactive') {
      result = result.filter(cat => cat.is_active === false);
    }
    return result;
  };

  const filteredCategories = getFilteredCategories();
  const filteredFlatCategories = getFilteredFlatCategories();

  const getCategoryTypeBadge = (category) => {
    if (!category) return { label: 'Unknown', color: '', icon: null };
    const isTop = !category.parent || category.parent === null;
    return {
      label: isTop ? 'Top Level' : 'Subcategory',
      color: isTop 
        ? darkMode ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/30' 
                   : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
        : darkMode ? 'bg-purple-900/30 text-purple-400 border border-purple-800/30' 
                   : 'bg-purple-100 text-purple-800 border border-purple-200',
      icon: isTop ? <FolderTree size={12} /> : <Layers size={12} />
    };
  };

  // ✅ عرض الأيقونات في النموذج
  const renderIconGrid = (selectedIcon, onChange) => {
    return (
      <div className="grid grid-cols-6 gap-2">
        {AVAILABLE_ICONS.map((icon) => {
          const IconComponent = iconMap[icon.name];
          const isSelected = selectedIcon === icon.name;
          return (
            <button
              key={icon.name}
              type="button"
              onClick={() => onChange(icon.name)}
              className={`p-2.5 rounded-lg border-2 transition-all hover:scale-110
                ${isSelected 
                  ? 'border-[#8B7ABA] bg-[#8B7ABA]/10 shadow-lg shadow-[#8B7ABA]/20' 
                  : darkMode ? 'border-neutral-700 hover:border-neutral-600' : 'border-neutral-200 hover:border-neutral-300'
                }`}
              title={icon.label}
            >
              <IconComponent 
                size={20} 
                className={isSelected ? 'text-[#8B7ABA]' : darkMode ? 'text-neutral-400' : 'text-neutral-600'} 
              />
            </button>
          );
        })}
      </div>
    );
  };

  // ✅ ✅ ✅ عرض الفئات في شكل List View
  const renderListView = () => {
    return (
      <div className={`rounded-2xl overflow-hidden transition-all duration-300 ${darkMode ? 'bg-gradient-card-dark border border-neutral-800 hover:border-neutral-700 shadow-lg' : 'bg-gradient-card border border-neutral-200 hover:border-neutral-300 shadow-lg'}`}>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[800px] lg:min-w-full">
            <thead>
              <tr className={darkMode ? 'bg-neutral-900/50' : 'bg-primary-800/5'}>
                <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Category</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Type</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Products</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Revenue</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFlatCategories.map((category) => {
                if (!category || !category.name) return null;
                
                const Icon = iconMap[category.icon] || FolderTree;
                const colorStyle = getColorClasses(category.color || 'primary', darkMode);
                const isSubcategory = category.isSubcategory || false;
                const typeBadge = getCategoryTypeBadge(category);
                
                return (
                  <tr key={category.id} className={`border-t border-neutral-200 dark:border-neutral-800 transition-colors duration-200 ${darkMode ? 'hover:bg-neutral-800/50' : 'hover:bg-neutral-50'}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${colorStyle.bg}`}>
                          <Icon className="w-5 h-5" style={{ color: getCategoryColor(category) }} />
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                            {category.name}
                          </p>
                          {isSubcategory && (
                            <p className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                              Parent: {category.parentName}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${typeBadge.color}`}>
                        {typeBadge.icon}
                        {typeBadge.label}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {category.productCount || 0}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {formatCurrency(category.revenue || 0)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${category.is_active !== false ? darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-800' : darkMode ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-100 text-neutral-600'}`}>
                        {category.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openEditModal(category)}
                          className={`p-1.5 rounded-lg transition-all hover:scale-110 ${darkMode ? 'hover:bg-neutral-700 text-neutral-400 hover:text-primary-400' : 'hover:bg-neutral-100 text-neutral-600 hover:text-primary-600'}`}
                          title="Edit category"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={(e) => isSubcategory ? handleDeleteSubcategory(category.id, e) : handleDeleteCategory(category.id, e)}
                          className={`p-1.5 rounded-lg transition-all hover:scale-110 ${darkMode ? 'hover:bg-neutral-700 text-neutral-400 hover:text-red-400' : 'hover:bg-neutral-100 text-neutral-600 hover:text-red-600'}`}
                        >
                          <Trash2 size={14} />
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

  // ✅ ✅ ✅ عرض الفئات في شكل Grid View
  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFlatCategories.map((category) => {
          if (!category || !category.name) return null;
          
          const Icon = iconMap[category.icon] || FolderTree;
          const colorStyle = getColorClasses(category.color || 'primary', darkMode);
          const isExpanded = expandedCategory === category.id;
          const isSubcategory = category.isSubcategory || false;
          const typeBadge = getCategoryTypeBadge(category);

          return (
            <div
              key={category.id}
              className={`group relative rounded-2xl overflow-hidden transition-all duration-300 
                hover:shadow-2xl transform hover:-translate-y-1 cursor-pointer
                ${darkMode 
                  ? 'bg-neutral-800/50 border hover:border-neutral-600' 
                  : 'bg-white border hover:border-neutral-300'
                }
                ${isSubcategory 
                  ? 'border-t-4 border-t-[#EE9C6C]/80' 
                  : 'border-t-4 border-t-[#8B7ABA]/80'
                }
              `}
              onClick={() => toggleCategory(category.id)}
            >
              <div className="relative p-5">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${colorStyle.bg}`}>
                      <Icon className={`w-6 h-6 ${colorStyle.text}`} /> 
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                        {category.name}
                        {isSubcategory && (
                          <span className="ml-2 text-xs font-normal text-neutral-400 dark:text-neutral-500">
                            ({category.parentName})
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {category.description || `${category.name} products`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      category.is_active !== false
                        ? darkMode 
                          ? 'bg-[#34D19C]/20 text-[#34D19C] border border-[#34D19C]/30' 
                          : 'bg-[#34D19C]/10 text-[#34D19C] border border-[#34D19C]/20'
                        : darkMode 
                          ? 'bg-neutral-700 text-neutral-400' 
                          : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {category.is_active !== false ? 'active' : 'inactive'}
                    </span>
                    
                    <span className={`px-2 py-1 text-[10px] font-medium rounded-full flex items-center gap-1 ${typeBadge.color}`}>
                      {isSubcategory ? 'Sub' : 'Top'}
                    </span>
                    
                    {!isSubcategory && (
                      <ChevronDown 
                        className={`w-5 h-5 transition-transform duration-300 
                          ${isExpanded ? 'rotate-180' : ''} 
                          ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}
                      />
                    )}
                  </div>
                </div>

                <div className="mb-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-neutral-900/50 rounded-xl py-3 px-4 border border-neutral-100 dark:border-neutral-700 shadow-sm">
                      <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Products</p>
                        </div>
                        <p className="text-xl font-bold text-[#8B7ABA] dark:text-white">
                          {(category.productCount || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-neutral-900/50 rounded-xl py-3 px-4 border border-neutral-100 dark:border-neutral-700 shadow-sm">
                      <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Revenue</p>
                        </div>
                        <p className="text-xl font-bold text-[#EE9C6C] dark:text-white">
                          {formatCurrency(category.revenue || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? 'bg-neutral-900/50' : 'bg-neutral-50'}`}>
                  <div className="flex items-center gap-2">
                    <FolderOpen size={16} className={darkMode ? 'text-neutral-500' : 'text-neutral-400'} />
                    <span className={`text-sm font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      {isSubcategory ? '—' : (category.subcategories?.length || 0)} subcategories
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(category);
                      }}
                      className={`p-2 rounded-lg transition-all hover:scale-110
                        ${darkMode 
                          ? 'hover:bg-primary-900/30 text-primary-400 hover:text-primary-300' 
                          : 'hover:bg-primary-100 text-primary-600 hover:text-primary-800'}`}
                      title="Edit category"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={(e) => isSubcategory ? handleDeleteSubcategory(category.id, e) : handleDeleteCategory(category.id, e)}
                      className={`p-2 rounded-lg transition-all hover:scale-110
                        ${darkMode 
                          ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300' 
                          : 'hover:bg-red-100 text-red-600 hover:text-red-800'}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* الفئات الفرعية عند التوسيع */}
                {!isSubcategory && isExpanded && (
                  <div className={`border-t ${darkMode ? 'border-neutral-700' : 'border-neutral-200'} p-6`}>
                    <h4 className={`text-sm font-medium mb-4 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      Subcategories
                    </h4>
                    
                    <div className="space-y-3">
                      {category.subcategories && category.subcategories.length > 0 ? (
                        category.subcategories.map((sub) => {
                          const SubIcon = iconMap[sub.icon] || FolderOpen;
                          const subColor = getColorClasses(sub.color || 'primary', darkMode);
                          return (
                            <div
                              key={sub.id}
                              className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? 'bg-neutral-900/50' : 'bg-neutral-50'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${darkMode ? 'bg-neutral-800' : 'bg-white'}`}>
                                  <SubIcon className={`w-4 h-4 ${subColor.text}`} />
                                </div>
                                <div>
                                  <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                                    {sub.name}
                                  </h5>
                                  <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                                    {sub.productCount || 0} products • {formatCurrency(sub.revenue || 0)}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(sub);
                                  }}
                                  className={`p-1.5 rounded transition-colors hover:scale-110
                                    ${darkMode 
                                      ? 'hover:bg-primary-900/30 text-primary-400 hover:text-primary-300' 
                                      : 'hover:bg-primary-100 text-primary-600 hover:text-primary-800'}`}
                                  title="Edit subcategory"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button 
                                  onClick={(e) => handleDeleteSubcategory(sub.id, e)}
                                  className={`p-1.5 rounded transition-colors hover:scale-110
                                    ${darkMode 
                                      ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300' 
                                      : 'hover:bg-red-100 text-red-600 hover:text-red-800'}`}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className={`text-center py-4 ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                          <p className="text-sm">No subcategories yet</p>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewCategory({
                          ...newCategory,
                          parent: category.id.toString(),
                          name: '',
                          description: ''
                        });
                        setShowAddForm(true);
                      }}
                      className={`w-full mt-4 py-3 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2 group
                        ${darkMode 
                          ? 'border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800/50 text-neutral-400 hover:text-neutral-300' 
                          : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 text-neutral-500 hover:text-neutral-700'
                        }`}
                    >
                      <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                      <span className="text-sm font-medium">Add Subcategory</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 w-full bg-gradient-to-r from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700 rounded-2xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gradient-to-r from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gradient-to-r from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 mt-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Categories"
          value={categories.length.toString()}
          icon={<FolderTree size={20} />}
          variant="success"
          darkMode={darkMode}
          subtitle={`${categories.filter(c => c && c.is_active !== false).length} active`}
          lightBgOpacity={0.6}
        />
        <MetricCard
          title="Total Products"
          value={allCategoriesFlat.reduce((sum, cat) => sum + (cat?.productCount || 0), 0).toLocaleString()}
          icon={<Package size={20} />}
          variant="primary"
          darkMode={darkMode}
          subtitle="Across all categories"
          lightBgOpacity={0.6}
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(allCategoriesFlat.reduce((sum, cat) => sum + (cat?.revenue || 0), 0))}
          icon={<ShoppingBag size={20} />}
          variant="secondary"
          darkMode={darkMode}
          subtitle="Last 30 days"
        />
        <MetricCard
          title="Subcategories"
          value={allCategoriesFlat.filter(cat => cat.isSubcategory).length.toString()}
          icon={<Layers size={20} />}
          variant="warning"
          darkMode={darkMode}
          subtitle={`${categories.length} main categories`}
        />
      </div> 

      {/* ✅ ✅ ✅ Filters مع viewMode و setViewMode */}
      <FilterControls
        darkMode={darkMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Search categories by name or description..."
        filters={[
          {
            value: filter,
            onChange: setFilter,
            defaultValue: 'all',
            defaultLabel: 'All Categories',
            icon: 'filter',
            options: [
              { value: 'all', label: 'All Categories', icon: <Filter size={14} /> },
              { value: 'active', label: 'Active Categories', icon: <Check size={14} className="text-green-500" /> },
              { value: 'inactive', label: 'Inactive Categories', icon: <X size={14} className="text-neutral-400" /> }
            ]
          }
        ]}
        viewMode={viewMode}
        setViewMode={setViewMode}
        actionButton={{
          show: true,
          text: "Add Category",
          icon: <Plus size={18} />,
          onClick: () => setShowAddForm(true)
        }}
        filteredCount={filteredCategories.length}
        totalCount={categories.length}
        onReset={() => { setSearchTerm(''); setFilter('all'); }}
      />

      {/* ✅ ✅ ✅ عرض الفئات حسب viewMode */}
      {filteredFlatCategories.length === 0 ? (
        <div className={`rounded-xl border p-12 text-center ${darkMode ? 'bg-neutral-800/50 border-neutral-700' : 'bg-neutral-50 border-neutral-200'}`}>
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full ${darkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}>
              <FolderTree size={40} className={darkMode ? 'text-neutral-500' : 'text-neutral-400'} />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                No Categories Found
              </h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Get started by creating your first category'}
              </p>
            </div>
            {!searchTerm && filter === 'all' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-2 px-6 py-2.5 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
                style={{ background: COLORS.gradient }}
              >
                <Plus size={18} className="inline mr-2" />
                Add Category
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        renderGridView()
      ) : (
        renderListView()
      )}

      {/* Add Category Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div 
            className={`relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl
              ${darkMode ? 'bg-neutral-800' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-6 border-b ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl" style={{ background: COLORS.gradient }}>
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                    {newCategory.parent ? 'Add Subcategory' : 'Add New Category'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-neutral-700 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'}`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddCategory} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Category Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FolderTree className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`} />
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]
                      ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400'}`}
                    placeholder="e.g., Electronics, Fashion, Books"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Category Icon
                </label>
                {renderIconGrid(newCategory.icon, (icon) => setNewCategory({...newCategory, icon}))}
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Category Color
                </label>
                <div className="flex gap-3 flex-wrap">
                  {CATEGORY_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCategory({...newCategory, color: color})}
                      className={`w-10 h-10 rounded-full border-2 transition-all transform hover:scale-110
                        ${newCategory.color === color ? 'border-white ring-2 ring-[#8B7ABA] scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Parent Category (Optional)
                </label>
                <select
                  value={newCategory.parent}
                  onChange={(e) => setNewCategory({...newCategory, parent: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]
                    ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-300 text-neutral-900'}`}
                >
                  <option value="">No parent (Top level)</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Description
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#8B7ABA] resize-none
                    ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400'}`}
                  placeholder="Describe the category..."
                  rows="2"
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={newCategory.is_active !== false} onChange={() => setNewCategory({...newCategory, is_active: true})} className="w-4 h-4 accent-[#8B7ABA]" />
                    <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={newCategory.is_active === false} onChange={() => setNewCategory({...newCategory, is_active: false})} className="w-4 h-4 accent-red-500" />
                    <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Inactive</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${darkMode ? 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                  style={{ background: COLORS.gradient }}
                >
                  {newCategory.parent ? 'Create Subcategory' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditForm && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div 
            className={`relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl
              ${darkMode ? 'bg-neutral-800' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-6 border-b ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl" style={{ background: COLORS.gradient }}>
                    <Edit2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                    Edit Category
                  </h3>
                </div>
                <button
                  onClick={() => setShowEditForm(false)}
                  className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-neutral-700 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'}`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleEditCategory} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Category Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FolderTree className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`} />
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]
                      ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400'}`}
                    placeholder="e.g., Electronics, Fashion, Books"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Category Icon
                </label>
                {renderIconGrid(editForm.icon, (icon) => setEditForm({...editForm, icon}))}
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Category Color
                </label>
                <div className="flex gap-3 flex-wrap">
                  {CATEGORY_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEditForm({...editForm, color: color})}
                      className={`w-10 h-10 rounded-full border-2 transition-all transform hover:scale-110
                        ${editForm.color === color ? 'border-white ring-2 ring-[#8B7ABA] scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Parent Category (Optional)
                </label>
                <select
                  value={editForm.parent}
                  onChange={(e) => setEditForm({...editForm, parent: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]
                    ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-300 text-neutral-900'}`}
                >
                  <option value="">No parent (Top level)</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#8B7ABA] resize-none
                    ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400'}`}
                  placeholder="Describe the category..."
                  rows="2"
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={editForm.is_active !== false} onChange={() => setEditForm({...editForm, is_active: true})} className="w-4 h-4 accent-[#8B7ABA]" />
                    <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={editForm.is_active === false} onChange={() => setEditForm({...editForm, is_active: false})} className="w-4 h-4 accent-red-500" />
                    <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Inactive</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${darkMode ? 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                  style={{ background: COLORS.gradient }}
                >
                  <Save size={18} className="inline mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;