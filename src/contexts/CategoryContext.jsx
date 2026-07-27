// frontend/src/contexts/CategoryContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { categoryService } from '../services/api';

const CategoryContext = createContext();

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within CategoryProvider');
  }
  return context;
};

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAll();
      
      let data = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          data = response.data.results;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else {
          data = [response.data];
        }
      }
      
      // ✅ تأكد من أن كل فئة لها id و name و parent
      const validCategories = data.filter(cat => cat && cat.id && cat.name);
      
      setCategories(validCategories);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ============================================
  // ✅ ✅ ✅ دوال الفئات الرئيسية والفرعية
  // ============================================

  // ✅ الحصول على الفئات الرئيسية (بدون parent)
  const getMainCategories = () => {
    return categories.filter(cat => !cat.parent || cat.parent === null || cat.parent === '');
  };

  // ✅ الحصول على الفئات الفرعية لفئة معينة
  const getSubCategories = (parentId) => {
    return categories.filter(cat => {
      if (!cat.parent) return false;
      const parentValue = typeof cat.parent === 'object' ? cat.parent.id : cat.parent;
      return String(parentValue) === String(parentId);
    });
  };

  // ✅ الحصول على جميع الفئات الفرعية
  const getAllSubCategories = () => {
    return categories.filter(cat => cat.parent && cat.parent !== null && cat.parent !== '');
  };

  // ✅ التحقق مما إذا كانت الفئة رئيسية
  const isMainCategory = (categoryId) => {
    const category = categories.find(c => String(c.id) === String(categoryId));
    if (!category) return false;
    return !category.parent || category.parent === null || category.parent === '';
  };

  // ✅ التحقق مما إذا كانت الفئة فرعية
  const isSubCategory = (categoryId) => {
    const category = categories.find(c => String(c.id) === String(categoryId));
    if (!category) return false;
    return category.parent && category.parent !== null && category.parent !== '';
  };

  // ✅ الحصول على الفئة الأم
  const getParentCategory = (categoryId) => {
    const category = categories.find(c => String(c.id) === String(categoryId));
    if (!category || !category.parent) return null;
    
    const parentId = typeof category.parent === 'object' ? category.parent.id : category.parent;
    return categories.find(c => String(c.id) === String(parentId)) || null;
  };

  // ✅ الحصول على اسم الفئة الأم
  const getParentCategoryName = (categoryId) => {
    const parent = getParentCategory(categoryId);
    return parent ? parent.name : null;
  };

  // ✅ الحصول على جميع المنتجات في فئة رئيسية (بما في ذلك الفئات الفرعية)
  const getProductsInMainCategory = (mainCategoryId, products) => {
    const subCategories = getSubCategories(mainCategoryId);
    const subCategoryIds = subCategories.map(cat => cat.id);
    const allCategoryIds = [mainCategoryId, ...subCategoryIds];
    
    return products.filter(p => {
      if (!p.category) return false;
      const categoryId = typeof p.category === 'object' ? p.category.id : p.category;
      return allCategoryIds.some(id => String(id) === String(categoryId));
    });
  };

  // ✅ حساب إحصائيات الفئة الرئيسية (من المنتجات)
  const getMainCategoryStats = (mainCategoryId, products) => {
    const categoryProducts = getProductsInMainCategory(mainCategoryId, products);
    const totalQuantity = categoryProducts.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const totalRevenue = categoryProducts.reduce((sum, p) => sum + (parseFloat(p.price) * (p.quantity || 0)), 0);
    const productCount = categoryProducts.length;
    
    return {
      totalQuantity,
      totalRevenue,
      productCount
    };
  };

  // ✅ الحصول على خيارات الفئات للتحديد (هرمي)
  const getCategoryOptions = () => {
    const mainCats = getMainCategories();
    const options = [];
    
    mainCats.forEach(main => {
      options.push({
        id: main.id,
        name: main.name,
        icon: main.icon || 'FolderTree',
        color: main.color || '#8B7ABA',
        isMain: true,
        level: 0
      });
      
      const subCats = getSubCategories(main.id);
      subCats.forEach(sub => {
        options.push({
          id: sub.id,
          name: sub.name,
          icon: sub.icon || 'Layers',
          color: sub.color || '#8B7ABA',
          isMain: false,
          parentId: main.id,
          parentName: main.name,
          level: 1
        });
      });
    });
    
    return options;
  };

  // ✅ دالة للحصول على أيقونة الفئة
  const getCategoryIcon = (categoryId, size = 20) => {
    const category = categories.find(c => String(c.id) === String(categoryId));
    if (!category) return { icon: 'FolderTree', color: '#8B7ABA' };
    
    return {
      icon: category.icon || (category.parent ? 'Layers' : 'FolderTree'),
      color: category.color || '#8B7ABA'
    };
  };

  // ✅ دالة للحصول على اسم الفئة
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => String(c.id) === String(categoryId));
    return category ? category.name : null;
  };

  // ✅ دالة للحصول على الفئة بالـ ID
  const getCategoryById = (id) => {
    return categories.find(c => String(c.id) === String(id)) || null;
  };

  // ✅ دالة للحصول على الفئة بالاسم
  const getCategoryByName = (name) => {
    return categories.find(c => c.name === name) || null;
  };

  // ✅ دوال CRUD
  const addCategory = async (categoryData) => {
    try {
      const response = await categoryService.create(categoryData);
      const newCategory = response.data;
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await categoryService.delete(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  const updateCategory = async (id, data) => {
    try {
      const response = await categoryService.update(id, data);
      const updatedCategory = response.data;
      setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat));
      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const value = {
    categories,
    loading,
    error,
    fetchCategories,
    
    // ✅ دوال الفئات الرئيسية والفرعية
    getMainCategories,
    getSubCategories,
    getAllSubCategories,
    isMainCategory,
    isSubCategory,
    getParentCategory,
    getParentCategoryName,
    getProductsInMainCategory,
    getMainCategoryStats,
    
    // ✅ دوال مساعدة
    getCategoryOptions,
    getCategoryIcon,
    getCategoryName,
    getCategoryById,
    getCategoryByName,
    
    // ✅ دوال CRUD
    addCategory,
    deleteCategory,
    updateCategory,
    refresh: fetchCategories
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};