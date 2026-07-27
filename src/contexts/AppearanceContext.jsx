// src/contexts/AppearanceContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AppearanceContext = createContext();

export const useAppearance = () => {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error('useAppearance must be used within AppearanceProvider');
  }
  return context;
};

// ✅ دالة تحويل HEX إلى RGB
const hexToRgb = (hex) => {
    // ✅ إزالة أي مسافات أو أحرف غير ضرورية
    let cleanHex = hex.trim();
    
    // ✅ إذا كان اللون فارغاً، استخدم اللون الافتراضي
    if (!cleanHex) return '139, 122, 186';
    
    // ✅ دعم الألوان المختصرة (مثل #fff, #000)
    if (cleanHex.startsWith('#') && cleanHex.length === 4) {
        cleanHex = '#' + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2] + cleanHex[3] + cleanHex[3];
    }
    
    // ✅ دعم الألوان بدون # (مثل ffffff)
    if (!cleanHex.startsWith('#')) {
        cleanHex = '#' + cleanHex;
    }
    
    // ✅ التحقق من صحة اللون
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);
    
    if (result) {
        return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
    }
    
    // ✅ إذا كان اللون غير صالح، استخدم اللون الافتراضي
    return '139, 122, 186';
};

export const AppearanceProvider = ({ children }) => {
  // ✅ نظام ألوان متكامل - كل عنصر له لونه الخاص
  const [config, setConfig] = useState({
    // المظهر
    theme: 'light',
    denseMode: false,
    animations: true,
    fontSize: 'medium',
    borderRadius: 'medium',
    
    // ✅ ✅ ✅ الألوان الأصلية
    colors: {
      primary: '#8B7ABA',     // الأزرار الرئيسية
      accent: '#EE9C6C',      // الإطارات والأيقونات البارزة
      success: '#34D19C',     // أزرار التبديل (Toggles) والحالات الناجحة
      secondary: '#F08FAE',   // العناصر الثانوية
    },
    
    // ✅ ✅ ✅ ألوان السايدبار الأصلية
    sidebar: {
      background: '#58419C',              // ✅ اللون الأصلي للسايدبار
      backgroundDark: '#171717',          // ✅ اللون في الوضع المظلم
      text: '#ffffff',                    // ✅ لون النص العادي (غير المفعل)
      textSecondary: 'rgba(255,255,255,0.7)',
      icon: '#ffffff',
      iconActive: '#EE9C6C',              // ✅ اللون الأصلي للأيقونة النشطة
      textActive: '#EE9C6C',              // ✅ اللون الأصلي للنص النشط
      hoverBg: 'rgba(255, 167, 38, 0.1)',
      border: 'rgba(255, 255, 255, 0.1)',
      logo: '#EE9C6C',
      button: '#EE9C6C',                  // ✅ لون الأزرار الأصلي
    },
    
    showBreadcrumbs: true,
    showStatusBar: true,
    
    // اللغة
    language: 'en',
    
    // التواريخ
    timezone: 'UTC+3',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
  });

  // ✅ تحميل الإعدادات من localStorage
  useEffect(() => {
    const saved = localStorage.getItem('appConfig');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to load config:', e);
      }
    }
  }, []);

  // ✅ حفظ وتطبيق الإعدادات
  useEffect(() => {
    localStorage.setItem('appConfig', JSON.stringify(config));
    applyConfig(config);
  }, [config]);

  // ✅ ✅ ✅ تطبيق الألوان
  const applyConfig = (cfg) => {
    const html = document.documentElement;
    const colors = cfg.colors || config.colors;
    const sidebar = cfg.sidebar || config.sidebar;
    
    // 1️⃣ المظهر (Light/Dark)
    if (cfg.theme === 'dark') {
      html.classList.add('dark');
      localStorage.setItem('admin-theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('admin-theme', 'light');
    }

    // 2️⃣ الوضع المكثف
    if (cfg.denseMode) {
      html.classList.add('dense-mode');
    } else {
      html.classList.remove('dense-mode');
    }

    // 3️⃣ الحركات
    if (!cfg.animations) {
      html.classList.add('reduce-motion');
    } else {
      html.classList.remove('reduce-motion');
    }

    // 4️⃣ حجم الخط
    html.classList.remove('text-small', 'text-medium', 'text-large');
    html.classList.add(`text-${cfg.fontSize}`);

    // 5️⃣ استدارة الزوايا
    html.classList.remove('radius-small', 'radius-medium', 'radius-large');
    html.classList.add(`radius-${cfg.borderRadius}`);

    // 6️⃣ تطبيق الألوان
    const primaryColor = colors.primary || '#8B7ABA';
    html.style.setProperty('--primary-color', primaryColor);
    html.style.setProperty('--primary-color-rgb', hexToRgb(primaryColor));
    
    const accentColor = colors.accent || '#EE9C6C';
    html.style.setProperty('--accent-color', accentColor);
    html.style.setProperty('--accent-color-rgb', hexToRgb(accentColor));
    
    const successColor = colors.success || '#34D19C';
    html.style.setProperty('--success-color', successColor);
    html.style.setProperty('--success-color-rgb', hexToRgb(successColor));
    
    const secondaryColor = colors.secondary || '#F08FAE';
    html.style.setProperty('--secondary-color', secondaryColor);
    html.style.setProperty('--secondary-color-rgb', hexToRgb(secondaryColor));

    // 7️⃣ ألوان السايدبار الأصلية
    html.style.setProperty('--sidebar-bg', sidebar.background || '#58419C');
    html.style.setProperty('--sidebar-bg-dark', sidebar.backgroundDark || '#1f2937');
    html.style.setProperty('--sidebar-text', sidebar.text || '#ffffff');
    html.style.setProperty('--sidebar-text-secondary', sidebar.textSecondary || 'rgba(255,255,255,0.7)');
    html.style.setProperty('--sidebar-icon', sidebar.icon || '#ffffff');
    html.style.setProperty('--sidebar-icon-active', sidebar.iconActive || '#EE9C6C');
    html.style.setProperty('--sidebar-text-active', sidebar.textActive || '#EE9C6C');
    html.style.setProperty('--sidebar-hover-bg', sidebar.hoverBg || 'rgba(255,167,38,0.1)');
    html.style.setProperty('--sidebar-border', sidebar.border || 'rgba(255,255,255,0.1)');
    html.style.setProperty('--sidebar-logo', sidebar.logo || '#EE9C6C');
    html.style.setProperty('--sidebar-button', sidebar.button || '#EE9C6C');

    // 8️⃣ مسار التنقل
    if (cfg.showBreadcrumbs) {
      html.classList.remove('hide-breadcrumbs');
    } else {
      html.classList.add('hide-breadcrumbs');
    }

    // 9️⃣ شريط الحالة
    if (cfg.showStatusBar) {
      html.classList.remove('hide-statusbar');
    } else {
      html.classList.add('hide-statusbar');
    }

    // 🔟 اللغة
    const lang = cfg.language || 'en';
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('app-language', lang);
    
    // إرسال حدث للتحديث
    window.dispatchEvent(new Event('app-config-changed'));
    
    console.log('✅ Colors applied:', {
      primary: colors.primary,
      accent: colors.accent,
      success: colors.success,
      secondary: colors.secondary,
      sidebar: sidebar,
    });
  };

  // ✅ دالة تحديث لون معين
  const updateColor = (colorKey, value) => {
    setConfig(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      }
    }));
  };

  // ✅ دالة تحديث لون السايدبار
  const updateSidebarColor = (colorKey, value) => {
    setConfig(prev => ({
      ...prev,
      sidebar: {
        ...prev.sidebar,
        [colorKey]: value,
      }
    }));
  };

  const updateConfig = (newConfig) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const resetConfig = () => {
    const defaults = {
      theme: 'light',
      denseMode: false,
      animations: true,
      fontSize: 'medium',
      borderRadius: 'medium',
      colors: {
        primary: '#8B7ABA',
        accent: '#EE9C6C',
        success: '#34D19C',
        secondary: '#F08FAE',
      },
      sidebar: {
        background: '#58419C',
        backgroundDark: '#1f2937',
        text: '#ffffff',
        textSecondary: 'rgba(255,255,255,0.7)',
        icon: '#ffffff',
        iconActive: '#EE9C6C',
        textActive: '#EE9C6C',
        hoverBg: 'rgba(255,167,38,0.1)',
        border: 'rgba(255,255,255,0.1)',
        logo: '#EE9C6C',
        button: '#EE9C6C',
      },
      showBreadcrumbs: true,
      showStatusBar: true,
      language: 'en',
      timezone: 'UTC+3',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
    };
    setConfig(defaults);
    applyConfig(defaults);
  };

  return (
    <AppearanceContext.Provider value={{ 
      config, 
      updateConfig, 
      updateColor, 
      updateSidebarColor,
      resetConfig 
    }}>
      {children}
    </AppearanceContext.Provider>
  );
};

export default AppearanceProvider;