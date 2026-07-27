import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// إنشاء Context
const SearchContext = createContext();

// Provider Component
export const SearchProvider = ({ children }) => {
  const navigate = useNavigate();
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    'laptop',
    'wireless headphones',
    'smart watch',
    'low stock',
    'recent orders'
  ]);

  // تحميل تاريخ البحث من localStorage عند التحميل
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error parsing search history:', error);
      }
    }
  }, []);

  // حفظ تاريخ البحث في localStorage
  const saveToHistory = (query) => {
    if (query.trim().length < 2) return;
    
    const newHistory = [
      query.trim(),
      ...searchHistory.filter(q => q.toLowerCase() !== query.trim().toLowerCase())
    ].slice(0, 10);
    
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // دالة البحث الرئيسية
  const handleGlobalSearch = (query) => {
    setGlobalSearch(query);
    
    // إذا كان البحث فارغاً، لا نحفظ في التاريخ
    if (query.trim().length > 1) {
      saveToHistory(query);
    }
  };

  // تنفيذ البحث والانتقال لصفحة النتائج
  const executeSearch = (query = null) => {
    const searchQuery = query || globalSearch;
    
    if (searchQuery.trim()) {
      // حفظ في التاريخ
      saveToHistory(searchQuery);
      
      // الانتقال لصفحة نتائج البحث
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      
      // إغلاق Command Palette إذا كان مفتوحاً
      setShowCommandPalette(false);
    }
  };

  // دالة فتح/إغلاق Command Palette
  const toggleCommandPalette = () => {
    setShowCommandPalette(prev => !prev);
  };

  // إغلاق Command Palette
  const closeCommandPalette = () => {
    setShowCommandPalette(false);
  };

  // فتح Command Palette
  const openCommandPalette = () => {
    setShowCommandPalette(true);
  };

  // مسح تاريخ البحث
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  // إزالة بحث معين من التاريخ
  const removeFromHistory = (query) => {
    const newHistory = searchHistory.filter(q => q !== query);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // القيمة التي سيوفرها Context
  const value = {
    globalSearch,
    setGlobalSearch,
    handleGlobalSearch,
    executeSearch,
    searchHistory,
    recentSearches,
    showCommandPalette,
    toggleCommandPalette,
    closeCommandPalette,
    openCommandPalette,
    clearSearchHistory,
    removeFromHistory
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

// Custom Hook لاستخدام SearchContext
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};