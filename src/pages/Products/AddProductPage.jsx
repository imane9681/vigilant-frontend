import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { productService, categoryService } from '../../services/api';
import { useCategories } from '../../contexts/CategoryContext';
import { 
  ArrowLeft, Save, Upload, X, Image as ImageIcon,
  Package, DollarSign, Hash, Tag, FileText, AlertCircle, CheckCircle,
  Plus, Globe, Shield, Weight, Ruler, Factory, Award,
  Zap, TrendingUp, Users, ShoppingBag, Sparkles,
  Loader2, Heart, Star, Clock, Eye, Share2, Download,
  Laptop, Shirt, Home, BookOpen, Activity, Sparkle,
  Gift, Coffee, Watch, Camera, Headphones, Smartphone,
  Cpu, Monitor, Tablet, Printer, Speaker, Gamepad,
  Keyboard, Mouse, Tv, AirVent, Refrigerator, Microwave,
  Utensils, Bed, Sofa, Lamp, Bath, Wifi, Battery,
  Wind, Flower, Scissors, Droplet, Syringe, Pill,
  Thermometer, Baby, Dog, Cat, Fish, Bird, Car,
  Bike, Plane, Train, Bus, Ship, Tent, Compass,
  Map, MapPin, ChevronRight, ChevronLeft, ChevronDown,
  RefreshCw, Image, FolderTree, Layers, Grid, Dumbbell, Check 
} from 'lucide-react';

const AddProductPage = ({ darkMode }) => {
  const { getCategoryOptions } = useCategories();
  const categoriesList = getCategoryOptions();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [categoriesWithIcons, setCategoriesWithIcons] = useState({});
  const [dashboardHeaderHeight, setDashboardHeaderHeight] = useState(72);
  const [formData, setFormData] = useState({
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
  
  const [images, setImages] = useState([]); // مصفوفة للصور المتعددة
  const [errors, setErrors] = useState({});
  const [previewUrls, setPreviewUrls] = useState([]); // مصفوفة للمعاينات
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);  
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // الألوان المحددة - البنفسجي هو اللون الأساسي
  const colors = {
    primary: '#8B7ABA',
    secondary: '#F08FAE',
    accent: '#EE9C6C',
    success: '#34D19C',
    gradient: 'linear-gradient(135deg, #8B7ABA 0%, #F08FAE 50%, #EE9C6C 100%)'
  };

  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports', 'Health', 'Beauty', 'Other'];

  // أضف هذه الـ Refs مع الـ States الأخرى
const categoryButtonRef = useRef(null);
const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

// أضف useEffect لحساب موضع الزر عند فتح القائمة
// ✅ حساب موضع الزر عند فتح القائمة وأثناء التمرير
useEffect(() => {
  if (showCategoryDropdown && categoryButtonRef.current) {
    const updatePosition = () => {
      const rect = categoryButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    };
    
    // حساب الموضع الأولي
    updatePosition();
    
    // تحديث الموضع عند التمرير أو تغيير حجم النافذة
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }
}, [showCategoryDropdown]);

// ✅ إغلاق القائمة عند النقر خارجها
useEffect(() => {
  const handleClickOutside = (event) => {
    if (showCategoryDropdown && categoryButtonRef.current) {
      // تحقق إذا كان النقر خارج الزر وخارج القائمة
      const dropdownElement = document.querySelector('.category-dropdown');
      if (!categoryButtonRef.current.contains(event.target) && 
          dropdownElement && !dropdownElement.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showCategoryDropdown]);


  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // دالة محسنة لرفع عدة صور
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // التحقق من العدد الأقصى (5 صور)
    if (files.length + images.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    const newImages = [...images];
    const newPreviews = [...previewUrls];

    files.forEach(file => {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return;
      }

      // التحقق من الحجم (5MB كحد أقصى)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`);
        return;
      }

      newImages.push(file);
      
      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        setPreviewUrls([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });

    setImages(newImages);
  };

  // دالة لحذف صورة من القائمة
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviewUrls(newPreviews);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (formData.price && parseFloat(formData.price) <= 0) newErrors.price = 'Price must be greater than 0';
    if (formData.quantity && parseInt(formData.quantity) < 0) newErrors.quantity = 'Quantity cannot be negative';
    if (formData.warranty_months && parseInt(formData.warranty_months) < 0) newErrors.warranty_months = 'Warranty cannot be negative';
    
    return newErrors;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setLoading(true);
  setSuccess(false);
  setUploadProgress(0);
  
  try {
    const formDataToSend = new FormData();
    
    // إضافة بيانات النموذج مع معالجة خاصة للتاجات
    Object.keys(formData).forEach(key => {
      if (formData[key] !== '' && formData[key] !== null) {
        if (key === 'tags') {
          // ✅ معالجة التاجات بشكل مختلف
          if (formData[key]) {
            const tagsArray = formData[key].split(',').map(tag => tag.trim()).filter(tag => tag);
            tagsArray.forEach(tag => {
              formDataToSend.append('tags', tag);
            });
          } else {
            formDataToSend.append('tags', JSON.stringify([]));
          }
        } else if (key === 'featured' || key === 'in_stock') {
          formDataToSend.append(key, formData[key]);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }
    });
    
    // إضافة جميع الصور بنفس المفتاح 'images'
    images.forEach((image) => {
      formDataToSend.append('images', image);
    });
    
    // محاكاة تقدم الرفع
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    await productService.create(formDataToSend);
    
    clearInterval(progressInterval);
    setUploadProgress(100);
    
    setSuccess(true);
    
    // ✅ ✅ ✅ إطلاق الأحداث بعد نجاح الإضافة
    window.dispatchEvent(new Event('inventory-updated'));
    window.dispatchEvent(new Event('product-updated')); // ✅ أضف هذا السطر

    setTimeout(() => {
      navigate('/products');
    }, 2000);
    
  } catch (error) {
    console.error('Error adding product:', error);
    setErrors({ 
      submit: `Failed to add product: ${error.response?.data?.detail || error.message}` 
    });
  } finally {
    setLoading(false);
  }
};

  const handleReset = () => {
    setFormData({
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
    setImages([]);
    setPreviewUrls([]);
    setErrors({});
    setSuccess(false);
    setUploadProgress(0);
  };

  const handleBack = () => {
    navigate('/products');
  };

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

  // ✅ دالة للحصول على أيقونة الفئة من الـ API
const getCategoryIcon = (categoryName, size = 20) => {
  // الأيقونات الافتراضية للفئات المعروفة
  const defaultIcons = {
    'Electronics': { icon: Laptop, color: '#8B7ABA' },
    'Clothing': { icon: Shirt, color: '#F08FAE' },
    'Home & Garden': { icon: Home, color: '#EE9C6C' },
    'Books': { icon: BookOpen, color: '#34D19C' },
    'Sports': { icon: Dumbbell, color: '#3B82F6' },
    'Health': { icon: Heart, color: '#EF4444' },
    'Beauty': { icon: Sparkles, color: '#EC4899' },
    'Other': { icon: Package, color: '#6B7280' }
  };
  
  // ✅ استخدام الأيقونة من API إذا كانت موجودة
  let iconData = categoriesWithIcons[categoryName];
  let IconComponent;
  let color;
  
  if (iconData) {
    IconComponent = iconMap[iconData.icon] || FolderTree;
    color = iconData.color || '#8B7ABA';
  } else if (defaultIcons[categoryName]) {
    IconComponent = defaultIcons[categoryName].icon;
    color = defaultIcons[categoryName].color;
  } else {
    // للفئات الجديدة غير المعروفة
    IconComponent = Layers;
    const colors = ['#8B7ABA', '#F08FAE', '#EE9C6C', '#34D19C', '#3B82F6', '#EF4444', '#F59E0B', '#10B981'];
    color = colors[Math.floor(Math.random() * colors.length)];
  }
  
  return <IconComponent size={size} style={{ color: color }} />;
};

  const calculateFilledFields = () => {
    let count = 0;
    
    if (formData.name) count++;
    if (formData.description) count++;
    if (formData.price) count++;
    if (formData.quantity) count++;
    if (formData.category) count++;
    if (formData.sku) count++;
    if (formData.weight) count++;
    if (formData.dimensions) count++;
    if (formData.manufacturer) count++;
    if (formData.warranty_months) count++;
    if (formData.tags) count++;
    if (formData.featured) count++;
    count += images.length; // عد الصور المرفوعة
    
    return count;
  };

  const validateBeforeSubmit = () => {
    if (!formData.name) return "Product name is required";
    if (!formData.price) return "Price is required";
    if (formData.price && parseFloat(formData.price) <= 0) return "Price must be greater than 0";
    if (images.length === 0) return "At least one product image is required";
    if (formData.quantity && parseInt(formData.quantity) < 0) return "Quantity cannot be negative";
    if (formData.warranty_months && parseInt(formData.warranty_months) < 0) return "Warranty cannot be negative";
    
    return null;
  };

  return (
    <>
      {/* Toast Error Message */}
      {showError && (
        <div className="fixed top-24 right-8 z-50 animate-slide-in-right">
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl
                        bg-red-50 dark:bg-red-900/20 
                        border border-red-200 dark:border-red-800
                        shadow-2xl backdrop-blur-md
                        min-w-[320px] max-w-md">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-md bg-red-500/30 animate-pulse" />
              <AlertCircle size={24} className="text-red-500 dark:text-red-400 relative" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-700 dark:text-red-300">Validation Error</h4>
              <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
            </div>
            <button 
              onClick={() => setShowError(false)}
              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-800/50 transition-colors"
            >
              <X size={16} className="text-red-500" />
            </button>
          </div>
        </div>
      )}
    
      {/* Header */}
      <header 
        className={`
          fixed z-10 -mt-4
          backdrop-blur-xl border-b
          transition-all duration-300
          ${darkMode 
            ? 'bg-neutral-900/80 border-neutral-800' 
            : 'bg-white/80 border-neutral-200'
          }
          left-[23px]             
          lg:left-[288px]  
          right-[25px]  
          lg:right-[32px]    
        `}
      >
        <div className={`
          py-3 
          ${darkMode 
            ? 'bg-neutral-950 ' 
            : 'bg-[#f3f0feff]'
          }
        `}>
        </div>

        <div className="px-6 ">  
          <div className="mx-auto w-full">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-2 sm:gap-4">
                <button 
                  onClick={handleBack}
                  className="group flex items-center gap-1 sm:gap-2 py-2 pl-2 pr-3 
                             rounded-xl transition-all duration-300
                             hover:bg-[#58419C]/5 dark:hover:bg-purple-900/20
                             text-neutral-700 dark:text-neutral-300
                             hover:text-[#58419C] 
                             border border-transparent hover:border-[#58419C]/20 dark:hover:border-[#58419C]/80"
                >
                  <ArrowLeft size={20} className="transition-transform duration-300 
                                                   group-hover:-translate-x-1" />
                  <span className="hidden sm:inline font-medium">Back</span>
                </button>
                
                <div className={`h-6 w-px hidden lg:block ${darkMode ? 'bg-neutral-700' : 'bg-neutral-300'}`} />
                
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 rounded-xl blur-xl opacity-50 animate-pulse"
                         style={{ background: colors.gradient }} />
                    <div className="relative p-2.5 sm:p-2 rounded-xl"
                         style={{ background: colors.primary }}>
                      <Package size={22} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-base sm:text-lg lg:text-xl font-bold truncate text-neutral-700 dark:text-neutral-300">
                      Add New Product
                    </h1>
                    <p className="text-xs hidden sm:block lg:hidden xl:block text-neutral-700 dark:text-neutral-300">
                      Create a new product
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <FileText size={16} style={{ color: colors.primary }} />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    {calculateFilledFields()}/13
                  </span>
                </div>
                <div className="hidden lg:flex items-center group cursor-default">
                  <div className={`
                    relative overflow-hidden rounded-2xl transition-all duration-500
                    ${formData.name && formData.price && images.length > 0
                      ? 'bg-[#34D19C] shadow-sm shadow-[#34D19C]/30' 
                      : 'bg-[#EE9C6C] shadow-sm shadow-[#EE9C6C]/30'
                    }
                  `}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                                    translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    
                    <div className="relative flex items-center gap-2 px-4 py-2">
                      {formData.name && formData.price && images.length > 0 ? (
                        <CheckCircle size={14} className="text-white" />
                      ) : (
                        <AlertCircle size={14} className="text-white" />
                      )}
                      <span className="text-xs font-bold text-white">
                        {formData.name && formData.price && images.length > 0 
                          ? 'Ready to save' 
                          : 'Required fields & image'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={`min-h-screen mt-2 pt-18 transition-all duration-500 ${
        darkMode 
          ? 'bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900' 
          : 'bg-gradient-to-br from-neutral-50 via-white to-purple-50/30'
      }`}>
        
        {/* Progress Bar */}
        {loading && uploadProgress > 0 && (
          <div className="container mx-auto px-6 pt-6">
            <div className={`relative rounded-2xl p-6 overflow-hidden border ${
              darkMode 
                ? 'bg-neutral-800/50 border-neutral-700' 
                : 'bg-white border-neutral-200'
            }`}>
              <div className="absolute inset-0 opacity-10"
                   style={{ background: colors.gradient }} />
              <div className="relative flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl blur-md animate-pulse"
                       style={{ background: colors.primary }} />
                  <div className="relative p-3 rounded-xl bg-white/90 backdrop-blur-sm"
                       style={{ color: colors.primary }}>
                    <Loader2 size={28} className="animate-spin" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                    {uploadProgress < 100 ? 'Uploading Product' : 'Upload Complete!'}
                  </h3>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    {uploadProgress < 100 
                      ? `Uploading ${images.length} image${images.length > 1 ? 's' : ''}...` 
                      : 'Redirecting to products page...'}
                  </p>
                  <div className="w-full mt-4">
                    <div className={`h-2 rounded-full ${darkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}>
                      <div 
                        className="h-full rounded-full transition-all duration-300 relative overflow-hidden"
                        style={{ 
                          width: `${uploadProgress}%`,
                          background: colors.gradient
                        }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                      </div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                        Processing...
                      </span>
                      <span className={`text-xs font-bold`} style={{ color: colors.primary }}>
                        {uploadProgress}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="container mx-auto px-6 pt-6">
            <div className={`relative rounded-2xl p-6 overflow-hidden border ${
              darkMode 
                ? 'bg-neutral-800/50 border-neutral-700' 
                : 'bg-white border-neutral-200'
            }`}>
              <div className="absolute inset-0 opacity-10"
                   style={{ background: colors.gradient }} />
              <div className="relative flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl blur-md animate-pulse"
                       style={{ background: colors.success }} />
                  <div className="relative p-3 rounded-xl bg-white/90 backdrop-blur-sm"
                       style={{ color: colors.success }}>
                    <CheckCircle size={28} />
                  </div>
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                    Product Added Successfully!
                  </h3>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    Your product has been created. Redirecting to products page...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="container mx-auto px-6 pt-6">
            <div className={`relative rounded-2xl p-6 overflow-hidden border ${
              darkMode 
                ? 'bg-neutral-800/50 border-neutral-700' 
                : 'bg-white border-neutral-200'
            }`}>
              <div className="absolute inset-0 opacity-10"
                   style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }} />
              <div className="relative flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl blur-md animate-pulse bg-red-500" />
                  <div className="relative p-3 rounded-xl bg-white/90 backdrop-blur-sm text-red-500">
                    <AlertCircle size={28} />
                  </div>
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                    Error
                  </h3>
                  <p className={`text-sm mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    {errors.submit}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <main className="container mx-auto px-6 py-8">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Card */}
            <div className={`group relative rounded-3xl overflow-hidden transition-all duration-500 
                          hover:shadow-2xl hover:-translate-y-1
                          ${darkMode 
                            ? 'bg-neutral-800/90 border border-neutral-700/50 backdrop-blur-sm' 
                            : 'bg-white border border-neutral-200/50 backdrop-blur-sm'}`}>
              
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                            bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
              
              <div className="relative p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl blur-md opacity-50"
                         style={{ background: colors.primary }} />
                    <div className="relative p-3 rounded-xl bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm"
                         style={{ color: colors.primary }}>
                      <Package size={24} />
                    </div>
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                      Basic Information
                    </h2>
                    <p className={`mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      Essential details about your product
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Product Name */}
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 rounded-xl transition-all duration-300 
                                hover:scale-[1.02] focus:scale-[1.02] outline-none
                                ${darkMode 
                                  ? 'bg-neutral-700/50 border-neutral-600 text-white placeholder-neutral-500' 
                                  : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400'}
                                border focus:ring-2`}
                      style={{ '--tw-ring-color': colors.primary }}
                      placeholder="Enter product name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* SKU */}
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      <div className="flex items-center gap-2">
                        <Hash size={16} style={{ color: colors.primary }} />
                        SKU
                      </div>
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 rounded-xl transition-all duration-300 
                                hover:scale-[1.02] focus:scale-[1.02] outline-none
                                ${darkMode 
                                  ? 'bg-neutral-700/50 border-neutral-600 text-white placeholder-neutral-500' 
                                  : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400'}
                                border focus:ring-2`}
                      style={{ '--tw-ring-color': colors.primary }}
                      placeholder="e.g., PROD-001"
                    />
                  </div>

                  {/* Category */}
{/* ===== حقل اختيار الفئة مع أيقونات ===== */}
<div>
  <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
    <div className="flex items-center gap-2">
      <Tag size={16} style={{ color: colors.secondary }} />
      Category
    </div>
  </label>
  
  <div className="relative">
    {/* زر الفتح */}
    <button
      type="button"
      ref={categoryButtonRef}
      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
      className={`w-full px-5 py-4 rounded-xl transition-all duration-300 
                hover:scale-[1.02] focus:scale-[1.02] 
                flex items-center justify-between
                ${darkMode 
                  ? 'bg-neutral-700/50 border-neutral-600 text-white' 
                  : 'bg-neutral-50 border-neutral-200 text-neutral-900'}
                border focus:ring-2 relative`}
      style={{ '--tw-ring-color': colors.primary }}
    >
      <div className="flex items-center gap-3">
        {formData.category ? (
          <>
            {getCategoryIcon(
              categoriesList.find(c => c.id === formData.category)?.name || '', 
              20
            )}
            <span>
              {categoriesList.find(c => c.id === formData.category)?.name || 'Unknown'}
            </span>
          </>
        ) : (
          <span className="text-neutral-400">Select Category</span>
        )}
      </div>
      <ChevronDown size={20} className={`transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
    </button>
  </div>
</div>

{/* ✅ القائمة المنسدلة خارج الحاوية باستخدام Portal */}

{showCategoryDropdown && ReactDOM.createPortal(
  <div 
    className="category-dropdown fixed rounded-xl shadow-2xl overflow-hidden"
    style={{
      top: dropdownPosition.top,
      left: dropdownPosition.left,
      width: dropdownPosition.width,
      maxHeight: '250px',
      background: darkMode ? '#1f2937' : '#ffffff',
      border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb'
    }}
  >
    <div className="max-h-60 overflow-y-auto custom-scrollbar py-2">
      <button
        type="button"
        onClick={() => {
          setFormData({...formData, category: ''});
          setShowCategoryDropdown(false);
        }}
        className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all
          ${!formData.category 
            ? darkMode ? 'bg-neutral-700' : 'bg-neutral-100'
            : darkMode ? 'hover:bg-neutral-700/50' : 'hover:bg-neutral-50'}`}
      >
        <span className={darkMode ? 'text-neutral-400' : 'text-neutral-400'}>No category</span>
        {!formData.category && (
          <Check size={16} className="ml-auto text-[#34D19C]" />
        )}
      </button>
      
      {categoriesList.map((category) => {
        // ✅ تأكد من أن category له id و name
        const categoryId = category.id;
        const categoryName = category.name || `Category ${categoryId}`;
        return (
          <button
            key={categoryId}
            type="button"
            onClick={() => {
              setFormData({...formData, category: categoryId});
              setShowCategoryDropdown(false);
            }}
            className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all
              ${formData.category === categoryId
                ? darkMode ? 'bg-neutral-700' : 'bg-neutral-100'
                : darkMode ? 'hover:bg-neutral-700/50' : 'hover:bg-neutral-50'}`}
          >
            {getCategoryIcon(categoryName, 20)}
            <span className={darkMode ? 'text-white' : 'text-neutral-900'}>{categoryName}</span>
            {formData.category === categoryId && (
              <Check size={16} className="ml-auto text-[#34D19C]" />
            )}
          </button>
        );
      })}
    </div>
  </div>,
  document.body
)}
</div>
</div>
</div>

            {/* Product Images Card - محسنة لدعم عدة صور */}
            <div className={`group relative rounded-3xl overflow-hidden transition-all duration-500 
                          hover:shadow-2xl hover:-translate-y-1
                          ${darkMode 
                            ? 'bg-neutral-800/90 border border-neutral-700/50 backdrop-blur-sm' 
                            : 'bg-white border border-neutral-200/50 backdrop-blur-sm'}`}>
              
              <div className="relative p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl blur-md opacity-50"
                         style={{ background: colors.secondary }} />
                    <div className="relative p-3 rounded-xl bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm"
                         style={{ color: colors.secondary }}>
                      <ImageIcon size={24} />
                    </div>
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                      Product Images
                    </h2>
                    <p className={`mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      Upload high-quality product images (Max 5 images)
                    </p>
                  </div>
                </div>
                
                {/* Image Upload Area - مع دعم عدة صور */}
                <div className="mb-8">
                  <div 
                    className={`relative border-3 border-dashed rounded-2xl p-12 text-center 
                              transition-all duration-500 hover:scale-[1.02] cursor-pointer
                              group/upload overflow-hidden
                              ${darkMode 
                                ? 'border-neutral-700 hover:border-[#8B7ABA] bg-gradient-to-br from-neutral-800/50 to-neutral-900/50' 
                                : 'border-neutral-300 hover:border-[#8B7ABA] bg-gradient-to-br from-neutral-50 to-white'}`}
                    onClick={() => document.getElementById('image-upload').click()}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover/upload:opacity-100 transition-opacity duration-500
                                  bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                    
                    <div className="relative">
                      <div className="flex justify-center gap-4 mb-4">
                        <Image size={32} className={darkMode ? 'text-neutral-600' : 'text-neutral-400'} />
                        <Upload size={32} className={darkMode ? 'text-neutral-600' : 'text-neutral-400'} />
                        <ImageIcon size={32} className={darkMode ? 'text-neutral-600' : 'text-neutral-400'} />
                      </div>
                      <p className={`text-xl font-medium mb-2 ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                        Drag & drop images or click to browse
                      </p>
                      <p className={`mb-2 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        Supports JPG, PNG, GIF • Max 5MB per image
                      </p>
                      <p className={`mb-6 text-sm ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        You can select multiple images at once
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <div className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-white font-bold
                                    transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                           style={{ background: colors.primary }}>
                        <Upload size={20} />
                        Browse Files
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Previews - عرض شبكي للصور المرفوعة */}
                {previewUrls.length > 0 && (
                  <div className="animate-fade-in-up">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                        Image Previews
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium
                                     ${darkMode ? 'bg-neutral-700 text-neutral-300' : 'bg-neutral-100 text-neutral-700'}`}>
                        {previewUrls.length} / 5
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="group/image relative animate-fade-in-up"
                             style={{ animationDelay: `${index * 0.1}s` }}>
                          <div className="relative rounded-xl overflow-hidden aspect-square">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover transition-transform duration-500 
                                       group-hover/image:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent 
                                          opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
                            
                            {/* رقم الصورة */}
                            <div className="absolute top-2 left-2 px-2 py-1 rounded-lg
                                          bg-black/50 backdrop-blur-sm text-white text-xs
                                          opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                              #{index + 1}
                            </div>
                            
                            {/* زر الحذف */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 text-white
                                       opacity-0 group-hover/image:opacity-100 transition-all duration-300
                                       hover:scale-110 active:scale-95 hover:bg-red-600"
                            >
                              <X size={14} />
                            </button>
                            
                            {/* معلومات الصورة */}
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className="px-2 py-1 bg-black/60 text-white text-xs rounded text-center
                                           opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                                {images[index]?.name?.substring(0, 15) || `Image ${index + 1}`}
                                {images[index]?.name?.length > 15 ? '...' : ''}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* مكان لإضافة صور إضافية */}
                      {previewUrls.length < 5 && (
                        <div 
                          onClick={() => document.getElementById('image-upload').click()}
                          className={`border-2 border-dashed rounded-xl aspect-square
                                    flex flex-col items-center justify-center gap-2
                                    cursor-pointer transition-all duration-300
                                    hover:scale-105 hover:border-[#8B7ABA]
                                    ${darkMode 
                                      ? 'border-neutral-700 hover:bg-neutral-800/50' 
                                      : 'border-neutral-300 hover:bg-neutral-50'}`}
                        >
                          <Plus size={24} className={darkMode ? 'text-neutral-600' : 'text-neutral-400'} />
                          <span className={`text-xs font-medium ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                            Add More
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* رسالة تأكيد العدد */}
                    {previewUrls.length === 5 && (
                      <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 
                                    border border-green-200 dark:border-green-800
                                    flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                          Maximum number of images reached (5 images)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Pricing & Inventory Card */}
            <div className={`group relative rounded-3xl overflow-hidden transition-all duration-500 
                          hover:shadow-2xl hover:-translate-y-1
                          ${darkMode 
                            ? 'bg-neutral-800/90 border border-neutral-700/50 backdrop-blur-sm' 
                            : 'bg-white border border-neutral-200/50 backdrop-blur-sm'}`}>
              
              <div className="relative p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl blur-md opacity-50"
                         style={{ background: colors.success }} />
                    <div className="relative p-3 rounded-xl bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm"
                         style={{ color: colors.success }}>
                      <DollarSign size={24} />
                    </div>
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                      Pricing & Inventory
                    </h2>
                    <p className={`mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      Set pricing and stock information
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Price */}
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      Price ($) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg
                                     ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                        $
                      </span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-5 py-4 rounded-xl transition-all duration-300 
                                  hover:scale-[1.02] focus:scale-[1.02] outline-none
                                  ${darkMode 
                                    ? 'bg-neutral-700/50 border-neutral-600 text-white' 
                                    : 'bg-neutral-50 border-neutral-200 text-neutral-900'}
                                  border focus:ring-2`}
                        style={{ '--tw-ring-color': colors.primary }}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.price}
                      </p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      <div className="flex items-center gap-2">
                        <Package size={16} style={{ color: colors.accent }} />
                        Quantity
                      </div>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 rounded-xl transition-all duration-300 
                                hover:scale-[1.02] focus:scale-[1.02] outline-none
                                ${darkMode 
                                  ? 'bg-neutral-700/50 border-neutral-600 text-white' 
                                  : 'bg-neutral-50 border-neutral-200 text-neutral-900'}
                                border focus:ring-2`}
                      style={{ '--tw-ring-color': colors.primary }}
                      placeholder="0"
                      min="0"
                    />
                    {errors.quantity && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.quantity}
                      </p>
                    )}
                  </div>

                  {/* Toggles */}
                  <div className="md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* In Stock Toggle */}
                      <div className={`relative overflow-hidden rounded-xl p-6 transition-all duration-300
                                    ${darkMode ? 'bg-neutral-700/30' : 'bg-neutral-50'}`}>
                        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500
                                      bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.success}15` }}>
                              <CheckCircle size={20} style={{ color: colors.success }} />
                            </div>
                            <div>
                              <label htmlFor="in_stock" className={`font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                                In Stock
                              </label>
                              <p className={`text-sm mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                                Product is available for purchase
                              </p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              id="in_stock"
                              name="in_stock"
                              checked={formData.in_stock}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            <div className={`w-14 h-7 rounded-full transition-all duration-300
                                          ${formData.in_stock 
                                            ? 'bg-emerald-500' 
                                            : darkMode ? 'bg-neutral-600' : 'bg-neutral-300'}`}>
                              <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full 
                                            transition-all duration-300 shadow-md
                                            ${formData.in_stock ? 'translate-x-7' : ''}`} />
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Featured Toggle */}
                      <div className={`relative overflow-hidden rounded-xl p-6 transition-all duration-300
                                    ${darkMode ? 'bg-neutral-700/30' : 'bg-neutral-50'}`}>
                        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500
                                      bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.accent}15` }}>
                              <Award size={20} style={{ color: colors.accent }} />
                            </div>
                            <div>
                              <label htmlFor="featured" className={`font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                                Featured Product
                              </label>
                              <p className={`text-sm mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                                Highlight this product
                              </p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              id="featured"
                              name="featured"
                              checked={formData.featured}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            <div className={`w-14 h-7 rounded-full transition-all duration-300
                                          ${formData.featured 
                                            ? 'bg-amber-500' 
                                            : darkMode ? 'bg-neutral-600' : 'bg-neutral-300'}`}>
                              <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full 
                                            transition-all duration-300 shadow-md
                                            ${formData.featured ? 'translate-x-7' : ''}`} />
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details Card */}
            <div className={`group relative rounded-3xl overflow-hidden transition-all duration-500 
                          hover:shadow-2xl hover:-translate-y-1
                          ${darkMode 
                            ? 'bg-neutral-800/90 border border-neutral-700/50 backdrop-blur-sm' 
                            : 'bg-white border border-neutral-200/50 backdrop-blur-sm'}`}>
              
              <div className="relative p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl blur-md opacity-50"
                         style={{ background: colors.accent }} />
                    <div className="relative p-3 rounded-xl bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm"
                         style={{ color: colors.accent }}>
                      <FileText size={24} />
                    </div>
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                      Product Details
                    </h2>
                    <p className={`mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      Additional specifications and information
                    </p>
                  </div>
                </div>
                
                <div className="space-y-8">
                  {/* Description */}
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 rounded-xl transition-all duration-300 
                                hover:scale-[1.02] focus:scale-[1.02] outline-none min-h-[150px]
                                ${darkMode 
                                  ? 'bg-neutral-700/50 border-neutral-600 text-white placeholder-neutral-500' 
                                  : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400'}
                                border focus:ring-2`}
                      style={{ '--tw-ring-color': colors.primary }}
                      placeholder="Enter detailed product description..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Manufacturer */}
                    <div>
                      <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        <div className="flex items-center gap-2">
                          <Factory size={16} style={{ color: colors.primary }} />
                          Manufacturer
                        </div>
                      </label>
                      <input
                        type="text"
                        name="manufacturer"
                        value={formData.manufacturer}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl transition-all duration-300 
                                  hover:scale-[1.02] focus:scale-[1.02] outline-none
                                  ${darkMode 
                                    ? 'bg-neutral-700/50 border-neutral-600 text-white placeholder-neutral-500' 
                                    : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400'}
                                  border focus:ring-2`}
                        style={{ '--tw-ring-color': colors.primary }}
                        placeholder="Brand name"
                      />
                    </div>

                    {/* Weight */}
                    <div>
                      <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        <div className="flex items-center gap-2">
                          <Weight size={16} style={{ color: colors.success }} />
                          Weight (kg)
                        </div>
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl transition-all duration-300 
                                  hover:scale-[1.02] focus:scale-[1.02] outline-none
                                  ${darkMode 
                                    ? 'bg-neutral-700/50 border-neutral-600 text-white placeholder-neutral-500' 
                                    : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400'}
                                  border focus:ring-2`}
                        style={{ '--tw-ring-color': colors.primary }}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>

                    {/* Dimensions */}
                    <div>
                      <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        <div className="flex items-center gap-2">
                          <Ruler size={16} style={{ color: colors.accent }} />
                          Dimensions
                        </div>
                      </label>
                      <input
                        type="text"
                        name="dimensions"
                        value={formData.dimensions}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl transition-all duration-300 
                                  hover:scale-[1.02] focus:scale-[1.02] outline-none
                                  ${darkMode 
                                    ? 'bg-neutral-700/50 border-neutral-600 text-white placeholder-neutral-500' 
                                    : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400'}
                                  border focus:ring-2`}
                        style={{ '--tw-ring-color': colors.primary }}
                        placeholder="L×W×H"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information Card */}
            <div className={`group relative rounded-3xl overflow-hidden transition-all duration-500 
                          hover:shadow-2xl hover:-translate-y-1
                          ${darkMode 
                            ? 'bg-neutral-800/90 border border-neutral-700/50 backdrop-blur-sm' 
                            : 'bg-white border border-neutral-200/50 backdrop-blur-sm'}`}>
              
              <div className="relative p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl blur-md opacity-50"
                         style={{ background: colors.secondary }} />
                    <div className="relative p-3 rounded-xl bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm"
                         style={{ color: colors.secondary }}>
                      <Tag size={24} />
                    </div>
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                      Additional Information
                    </h2>
                    <p className={`mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      Tags, warranty and other details
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Tags */}
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 rounded-xl transition-all duration-300 
                                hover:scale-[1.02] focus:scale-[1.02] outline-none
                                ${darkMode 
                                  ? 'bg-neutral-700/50 border-neutral-600 text-white placeholder-neutral-500' 
                                  : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400'}
                                border focus:ring-2`}
                      style={{ '--tw-ring-color': colors.primary }}
                      placeholder="e.g., premium, wireless, new-arrival"
                    />
                    <p className={`text-sm mt-3 ${darkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
                      Separate tags with commas. These help customers find your product.
                    </p>
                  </div>

                  {/* Warranty */}
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      <div className="flex items-center gap-2">
                        <Shield size={16} style={{ color: colors.accent }} />
                        Warranty (months)
                      </div>
                    </label>
                    <input
                      type="number"
                      name="warranty_months"
                      value={formData.warranty_months}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl transition-all duration-300 
                                hover:scale-[1.02] focus:scale-[1.02] outline-none
                                ${darkMode 
                                  ? 'bg-neutral-700/50 border-neutral-600 text-white placeholder-neutral-500' 
                                  : 'bg-neutral-50 border-neutral-200 text-neutral-900 placeholder-neutral-400'}
                                border focus:ring-2`}
                      style={{ '--tw-ring-color': colors.primary }}
                      placeholder="12"
                      min="0"
                    />
                    {errors.warranty_months && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.warranty_months}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 mt-8 border-t
                          animate-fade-in-up" style={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
              
              <button
                type="button"
                onClick={handleReset}
                className={`group relative overflow-hidden w-full md:w-auto px-6 py-3 font-bold rounded-xl 
                          transition-all duration-300 hover:scale-105 active:scale-95
                          ${darkMode 
                            ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' 
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
                disabled={loading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <RefreshCw size={18} className="transition-transform group-hover:rotate-180" />
                  Reset Form
                </span>
              </button>
              
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleBack}
                  className={`group relative overflow-hidden w-full md:w-auto px-6 py-3 font-bold rounded-xl 
                            transition-all duration-300 hover:scale-105 active:scale-95 border-2
                            ${darkMode 
                              ? 'border-neutral-700 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800/50' 
                              : 'border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50'}`}
                  disabled={loading}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <X size={18} />
                    Cancel
                  </span>
                </button>
                
                <button
                  type="submit"
                  onClick={(e) => {
                    const error = validateBeforeSubmit();
                    if (error) {
                      e.preventDefault();
                      setErrorMessage(error);
                      setShowError(true);
                      setTimeout(() => setShowError(false), 5000);
                    }
                  }}
                  className="group relative overflow-hidden w-full md:w-auto px-6 py-3 font-bold rounded-xl
                           text-white transition-all duration-300 hover:scale-105 active:scale-95
                           disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  style={{ background: colors.primary }}
                  disabled={loading}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Save size={20} className="transition-transform group-hover:rotate-12" />
                        <span>Add Product</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </form>
        </main>

        {/* Footer */}
        <footer className={`mt-12 py-8 border-t transition-all duration-300
                         ${darkMode 
                           ? 'border-neutral-800 bg-gradient-to-r from-neutral-900/50 to-neutral-800/50' 
                           : 'border-neutral-200 bg-gradient-to-r from-neutral-50 to-white'}`}>
          <div className="container mx-auto px-6 text-center">
            <p className={`font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Fill in all required fields (*) and ensure information accuracy before submitting.
            </p>
            <p className={`text-sm mt-2 ${darkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
              You can upload up to 5 images. All product information will be stored securely in the database.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default AddProductPage;