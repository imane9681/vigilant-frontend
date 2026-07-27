import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RxDashboard } from "react-icons/rx";

import { useLocation, useNavigate } from 'react-router-dom';
import { useSearch } from "../../../contexts/SearchContext";
import { useAppearance } from "../../../contexts/AppearanceContext";

import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  ChevronRight,
  ChevronLeft,
  Store,
  LogOut,
  ChevronDown,
  PackageCheck,
  AlertTriangle,
  Activity,
  TrendingUp,
  PieChart,
  Server,
  Settings,
  Shield,
  List,
  Layers,
  Award,
  Sparkles,
  Zap,
  Clock,
  CheckCircle,
  BarChart3,
  CreditCard,
  FileText,
  Database,
  Bell,
  HelpCircle,
  User,
  Grid,
  ShoppingCart,
  Tag
} from 'lucide-react';

// نظام الأيقونات الموحد
const ICON_SIZE = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
};

// نظام الخطوط الموحد
const TYPOGRAPHY = {
  '2xs': 'text-2xs font-medium',
  xs: 'text-xs font-medium',
  sm: 'text-sm font-medium',
  base: 'text-base font-medium',
  lg: 'text-lg font-semibold',
  xl: 'text-xl font-semibold',
  '2xl': 'text-2xl font-bold',
};

// نظام المسافات الموحد
const SPACING = {
  xs: 'px-2 py-1',
  sm: 'px-3 py-1.5',
  md: 'px-4 py-2',
  lg: 'px-5 py-3',
  xl: 'px-6 py-4',
};

// نظام Gaps الموحد
const GAPS = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
  xl: 'gap-5',
};

// ============= مكونات فرعية =============
const MenuItemIcon = ({ icon, active, collapsed, darkMode, textColor, textActiveColor }) => (
  <div className={`
    transition-all duration-200
    ${active 
      ? 'scale-110 drop-shadow-[0_0_5px_rgba(var(--sidebar-icon-active-rgb,238,156,108),0.9)]'
      : 'group-hover:scale-105'
    }
    ${collapsed ? 'flex justify-center items-center w-full' : ''} 
  `}
  style={{
    color: active ? (textActiveColor || '#EE9C6C') : (textColor || '#ffffff'),
  }}>
    {icon}
  </div>
);

const Badge = ({ count, badge, active, darkMode, isUrgent, accentColor }) => {
  if (count) {
    return (
      <span className={`
        inline-flex items-center justify-center
        text-2xs px-1.5 py-0.5 rounded-full min-w-[20px] h-5
        font-semibold leading-none
        transition-all duration-200
        ${active 
          ? 'bg-white/20 text-white'
          : darkMode 
            ? 'bg-neutral-700 text-neutral-300 group-hover:bg-neutral-600'
            : 'bg-white/15 text-white group-hover:bg-white/20'
        }
      `}>
        {count}
      </span>
    );
  }
  
  if (badge) {
    return (
      <span className={`
        inline-flex items-center justify-center
        px-1.5 py-0.5 text-2xs font-semibold rounded-full h-4
        leading-none
        transition-all duration-200
        ${isUrgent
          ? 'bg-red-500/60 text-white border-0'
          : active 
            ? 'bg-sidebar-button text-white'
            : darkMode 
              ? 'bg-sidebar-button/20 text-sidebar-text/80 group-hover:bg-sidebar-button/30'
              : 'bg-sidebar-button/25 text-sidebar-text group-hover:bg-sidebar-button/35'
        }
      `}
      style={{
        backgroundColor: active ? accentColor : undefined,
      }}>
        {badge}
      </span>
    );
  }
  
  return null;
};

const SubmenuItem = ({ 
  subItem, 
  isSubActive, 
  darkMode, 
  onClick,
  accentColor,
  hoverBg,
  textColor,
  textActiveColor
}) => {
  const handleClick = useCallback((e) => {
    onClick(subItem, e);
  }, [onClick, subItem]);

  return (
    <div 
      onClick={handleClick}
      className={`
        flex items-center justify-between px-2 py-3 rounded-lg cursor-pointer 
        transition-all duration-200 group
        ${isSubActive
          ? `${darkMode 
              ? 'bg-neutral-800/60'
              : 'bg-white/5'
            }`
          : `${darkMode 
              ? 'hover:bg-neutral-800/40'
              : 'hover:bg-white/5'
            }`
        }
        border ${isSubActive ? 'border-white/5' : 'border-transparent'}
      `}
      aria-current={isSubActive ? "page" : undefined}
      style={{
        backgroundColor: isSubActive ? hoverBg : undefined,
      }}
    >
  <div className={`flex items-center ${GAPS.md}`}>
  {subItem.icon && (
    <div className={`
      transition-all duration-200
      ${isSubActive 
        ? 'text-sidebar-active-icon drop-shadow-[0_0_15px_rgba(var(--sidebar-icon-active-rgb,238,156,108),0.9)]'
        : 'group-hover:text-sidebar-active-icon'
      }
    `}
    style={{
  color: isSubActive ? (textActiveColor || '#EE9C6C') : (textColor || '#ffffff'),
    }}>
      {subItem.icon}
    </div>
  )}
  <span className={`
    text-xs font-medium
    transition-all duration-200
    ${isSubActive 
      ? 'text-sidebar-active-text'
      : 'group-hover:text-sidebar-active-text'
    }
  `}
  style={{
    color: isSubActive ? undefined : (textColor || '#ffffff'),
  }}>
    {subItem.label}
  </span>
</div>
      <div className="flex items-center gap-1">
        <Badge 
          count={subItem.count} 
          badge={subItem.badge} 
          active={isSubActive}
          darkMode={darkMode}
          isUrgent={subItem.urgent}
          accentColor={accentColor}
        />
      </div>
    </div>
  );
};

// ============= المكون الرئيسي =============
const Sidebar = ({ darkMode, onCollapseChange, mobileOpen, onMobileToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleCommandPalette } = useSearch();
  const { config } = useAppearance();
  
  // ✅ الحصول على ألوان السايدبار من الـ config
  const sidebarColors = config.sidebar || {
    background: '#58419C',
    backgroundDark: '#171717',
    text: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.7)',
    icon: '#ffffff',
    iconActive: '#EE9C6C',
    textActive: '#EE9C6C',
    hoverBg: 'rgba(255,167,38,0.1)',
    border: 'rgba(255,255,255,0.1)',
    logo: '#EE9C6C',
    button: '#EE9C6C',
  };
  
  const accentColor = config.colors?.accent || '#EE9C6C';
  const primaryColor = config.colors?.primary || '#8B7ABA';
  
  // ✅ اختيار خلفية السايدبار حسب الوضع
  const bgColor = darkMode ? sidebarColors.backgroundDark : sidebarColors.background;
  
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState([]);
  const [hoveredSubmenu, setHoveredSubmenu] = useState(null);
  const sidebarRef = useRef(null);
  const submenuTimerRef = useRef(null);
  const itemRefs = useRef({});

  const toggleCollapse = useCallback(() => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    if (newCollapsed) {
      setExpandedItems([]);
      setHoveredSubmenu(null);
    }
    if (onCollapseChange) onCollapseChange(newCollapsed);
  }, [collapsed, onCollapseChange]);

  const toggleSubmenu = useCallback((label, e) => {
    if (collapsed) {
      setHoveredSubmenu(label);
      return;
    }
    e?.stopPropagation();
    setExpandedItems(prev => prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]);
  }, [collapsed]);

  const handleMobileClose = useCallback(() => {
    if (onMobileToggle) onMobileToggle(false);
    setHoveredSubmenu(null);
  }, [onMobileToggle]);

  const isSubmenuItemActive = useCallback((submenuItems) => {
    if (!submenuItems) return false;
    return submenuItems.some(item => {
      if (!item.path) return false;
      const currentPath = location.pathname;
      if (item.path === '/') return currentPath === item.path;
      return currentPath === item.path || currentPath.startsWith(`${item.path}/`);
    });
  }, [location.pathname]);

  const isActive = useCallback((path, submenuItems) => {
    if (submenuItems && isSubmenuItemActive(submenuItems)) return true;
    if (!path) return false;
    const currentPath = location.pathname;
    if (path === '/') return currentPath === path;
    return currentPath === path || currentPath.startsWith(`${path}/`);
  }, [location.pathname, isSubmenuItemActive]);

  const menuItems = [
    {
      title: 'Main',
      items: [
        { 
          icon: <RxDashboard size={ICON_SIZE.md} />,
          label: 'Dashboard',
          path: '/',
          premium: true,
        },
        { 
          icon: <Package size={ICON_SIZE.md} />,
          label: 'Products', 
          path: null,
          hasSubmenu: true,
          submenu: [
            { 
              label: 'All Products', 
              path: '/products', 
              icon: <List size={ICON_SIZE.sm} />,
              efficiency: '95%',
            },
            { 
              label: 'Add Product', 
              path: '/add-product', 
              icon: <Award size={ICON_SIZE.sm} />,
            },
            { 
              label: 'Categories', 
              path: '/categories', 
              icon: <Layers size={ICON_SIZE.sm} />,
            },
            { 
              label: 'Inventory', 
              path: '/inventory', 
              icon: <PackageCheck size={ICON_SIZE.sm} />,
              updated: 'Just now',
            },
            { 
              label: 'Low Stock', 
              path: '/low-stock',  
              urgent: true,
              icon: <AlertTriangle size={ICON_SIZE.sm} />,
              warning: true,
            },
            { 
              label: 'Promotions', 
              path: '/promotions', 
              icon: <Tag size={ICON_SIZE.sm} />,
              trending: true,
            }
          ]
        },
        { 
          icon: <ShoppingBag size={ICON_SIZE.md} />,
          label: 'Orders', 
          path: '/orders',
          trending: true,
          revenue: '$4.2K',
        },
        { 
          icon: <Users size={ICON_SIZE.md} />,
          label: 'Customers', 
          path: '/customers',
          growth: '+12%',
        },
      ]
    },
    {
      title: 'ANALYTICS',
      items: [
        { 
          icon: <Activity size={ICON_SIZE.md} />,
          label: 'Analytics', 
          path: '/analytics',
          premium: true,
        },
        { 
          icon: <CreditCard size={ICON_SIZE.md} />,
          label: 'Revenue', 
          path: '/revenue',
          growth: '+24%',
        },
        { 
          icon: <FileText size={ICON_SIZE.md} />,
          label: 'Reports', 
          path: '/reports',
          updated: 'Today',
        },
      ]
    }
  ];

  const handleNavigation = useCallback((item, e) => {
    e?.stopPropagation();
    if (item.path) {
      navigate(item.path);
      handleMobileClose();
    }
  }, [navigate, handleMobileClose]);

  const handleSubmenuItemClick = useCallback((subItem, e) => {
    e.stopPropagation();
    navigate(subItem.path);
    handleMobileClose();
    setHoveredSubmenu(null);
  }, [navigate, handleMobileClose]);

  const handleMouseEnterItem = useCallback((item, label) => {
    if (item.hasSubmenu && collapsed) {
      if (submenuTimerRef.current) {
        clearTimeout(submenuTimerRef.current);
      }
      setHoveredSubmenu(label);
    }
  }, [collapsed]);

  const handleMouseLeaveItem = useCallback(() => {
    if (collapsed) {
      if (submenuTimerRef.current) {
        clearTimeout(submenuTimerRef.current);
      }
      submenuTimerRef.current = setTimeout(() => {
        setHoveredSubmenu(null);
      }, 300);
    }
  }, [collapsed]);

  const handleMouseEnterSubmenu = useCallback(() => {
    if (submenuTimerRef.current) {
      clearTimeout(submenuTimerRef.current);
    }
  }, []);

  const handleMouseLeaveSubmenu = useCallback(() => {
    if (submenuTimerRef.current) {
      clearTimeout(submenuTimerRef.current);
    }
    submenuTimerRef.current = setTimeout(() => {
      setHoveredSubmenu(null);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (submenuTimerRef.current) {
        clearTimeout(submenuTimerRef.current);
      }
    };
  }, []);

 const handleLogout = useCallback(() => {
  // ✅ تنظيف localStorage بالكامل
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('isAuthenticated');
  
  // ✅ إعادة التوجيه إلى صفحة تسجيل الدخول
  navigate('/login');
  
  // ✅ إغلاق السايدبار في الموبايل
  if (onMobileToggle) onMobileToggle(false);
  
  // ✅ إعادة تحميل الصفحة لتحديث حالة المصادقة
  // (هذا يضمن أن App.jsx سيعيد التحقق من localStorage)
  window.location.href = '/login';
}, [navigate, onMobileToggle]);


  // دالة مساعدة لتنسيق الأنماط
  const getItemStyles = useCallback((active) => ({
  background: active 
    ? darkMode 
      ? 'bg-neutral-800/60'
      : 'bg-white/5'
    : darkMode 
      ? 'hover:bg-neutral-800/30'
      : 'hover:bg-white/5',
  border: active ? 'border-white/10' : 'border-transparent',
  text: active 
    ? 'text-sidebar-active-text text-sm font-semibold drop-shadow-[0_0_10px_rgba(var(--sidebar-text-active-rgb,238,156,108),0.7)]'
    : 'text-sidebar-text text-sm font-semibold drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] group-hover:text-sidebar-active-text',
  shadow: active 
    ? 'shadow-[0_0_1px_rgba(var(--sidebar-icon-active-rgb,238,156,108),0.5)]'
    : ''
}), [darkMode]);

  return (
    <>
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden transition-all duration-300"
          onClick={handleMobileClose}
          aria-hidden="true"
        />
      )}

      <aside 
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-screen z-40 
          transition-all duration-300 ease-out
          ${collapsed ? 'w-20' : 'w-64 py-5 '} 
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
          border-r ${darkMode ? 'border-neutral-700' : 'border-white/20'}
          shadow-xl
          overflow-y-auto overflow-x-hidden
          custom-scrollbar
        `}
        style={{
          background: darkMode 
            ? `linear-gradient(180deg, ${bgColor} 0%, ${bgColor}dd 100%)`
            : `linear-gradient(180deg, ${bgColor} 0%, ${bgColor}dd 100%)`,
          borderColor: sidebarColors.border || (darkMode ? '#374151' : 'rgba(255,255,255,0.2)'),
        }}
        aria-label="Sidebar navigation"
      >
        
        <div className="relative flex-1 flex flex-col min-h-0">
          
          {/* الهيدر - الشعار وزر الطي */}
          <div className={`${collapsed ? 'pt-5 px-3 mb-8' : 'mb-5'} shrink-0 px-4`}>
            {!collapsed ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div 
                    className={`flex items-center ml-3.5 ${GAPS.sm} cursor-pointer group`}
                    onClick={() => {
                    navigate('/');
                    handleMobileClose();
                   }}
                   role="button"
                   tabIndex={0}
                   aria-label="Go to dashboard"
                   onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
                   >
                   
                    <div className="w-10 h-10 ">
                     <img 
                     src="/logo.png"  
                     alt="Vigilant Logo"
                     className="w-full h-full object-contain"   
                     />
                    </div>
                     <h1 className={`
                       ${TYPOGRAPHY['2xl']} 
                       ${darkMode ? 'text-white' : 'text-white'}
                       font-bold
                       tracking-tight
                       drop-shadow-[0_0_4px_rgba(255,255,255,0.1)]
                     `}
                     style={{ color: sidebarColors.text || '#ffffff' }}>
                       Vigilant
                     </h1>
                    
                  </div>

                  <button
                    onClick={toggleCollapse}
                    className={`
                      flex items-center justify-center w-6 h-6
                      rounded-lg transition-all duration-300
                      hover:scale-110 focus:ring-2 focus:ring-[#EE9C6C]/50
                      ${darkMode 
                        ? 'bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700' 
                        : 'bg-[var(--accent-color,#EE9C6C)]/3 text-white/50 hover:text-sidebar-active-text hover:bg-white/20'
                      }
                      border ${darkMode ? 'border-neutral-700' : 'border-white/10'}
                    `}
                    style={{
                      color: darkMode ? '#a19caf' : '#ffffff89',
                      borderColor: sidebarColors.border || (darkMode ? '#374151' : 'rgba(255, 255, 255, 0.78)'),
                    }}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  >
                    <ChevronLeft size={ICON_SIZE.sm} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div 
                  className="cursor-pointer group"
                  onClick={() => {
                    navigate('/');
                    handleMobileClose();
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Go to dashboard"
                  onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
                >
                  <div className="w-10 h-10 ">
                     <img 
                     src="/logo.png"  
                     alt="Vigilant Logo"
                     className="w-full h-full object-contain"   
                     />
                    </div>
                </div>
                
                <button
                  onClick={toggleCollapse}
                  className={`
                    flex items-center justify-center p-1 
                    rounded-lg transition-all duration-300
                    hover:scale-110 focus:ring-2 focus:ring-[#EE9C6C]/50
                    ${darkMode 
                      ? 'bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700' 
                      : 'bg-[var(--accent-color,#EE9C6C)]/3 text-white hover:text-sidebar-active-text hover:bg-white/20'
                    }
                    border ${darkMode ? 'border-neutral-700' : 'border-white/15'}
                  `}
                  style={{
                    color: darkMode ? '#a49caf' : sidebarColors.text,
                    borderColor: sidebarColors.border || (darkMode ? '#3d3751' : 'rgba(255,255,255,0.1)'),
                  }}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  <ChevronRight size={ICON_SIZE.sm} />
                </button>
              </div>
            )}
          </div>

          <div className={`
              h-px mb-5 
              ${darkMode 
                ? 'bg-gradient-to-r from-transparent via-neutral-700 to-transparent'
                : 'bg-gradient-to-r from-transparent via-white/10 to-transparent'
              }
            `} aria-hidden="true"></div>

          {/* القوائم الرئيسية */}
          <nav className={`
            flex-1 min-h-0
            ${collapsed ? 'px-1 pt-2.5' : ''} 
            overflow-y-auto overflow-x-hidden
          `} aria-label="Main navigation">
            <div className="space-y-5 ">
              {menuItems.map((section, sectionIndex) => (
                <div key={sectionIndex} className={`space-y-1 ${collapsed ? 'px-1' : 'px-3.5'}`}>
                  {/* عنوان القسم (يظهر فقط عندما تكون القائمة مفتوحة) */}
                  {!collapsed && section.title && (
                    <div className="px-7 py-1.5">
                      <h3 className={`
                        text-xs font-medium uppercase tracking-wider
                        ${darkMode ? 'text-neutral-400' : 'text-white/30'}
                      `}>
                        {section.title}
                      </h3>
                    </div>
                  )}
                  {section.items.map((item, itemIndex) => {
                    const active = isActive(item.path, item.submenu);
                    const isSubmenuExpanded = expandedItems.includes(item.label);
                    const isHoveredSubmenu = hoveredSubmenu === item.label;
                    const styles = getItemStyles(active);
                    
                    return (
                      <div key={itemIndex} className="relative">
                        <div className="relative px-2">
                          {active && !collapsed && (
  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-9 rounded-r-full" 
       aria-hidden="true"
       style={{ backgroundColor: sidebarColors.textActive || '#EE9C6C' }} />
)}
                          
                          <div
                            ref={el => itemRefs.current[item.label] = el}
                            onClick={(e) => {
                              if (item.hasSubmenu && !collapsed) {
                                toggleSubmenu(item.label, e);
                              } else if (item.path) {
                                handleNavigation(item, e);
                              }
                            }}
                            onMouseEnter={() => handleMouseEnterItem(item, item.label)}
                            onMouseLeave={handleMouseLeaveItem}
                            className={`
                              flex items-center cursor-pointer
                              transition-all duration-300
                              ${collapsed ? 'px-3 py-3 justify-center rounded-lg mb-1' : 'px-4 py-4 rounded-xl '}
                              ${styles.background}
                              ${styles.shadow}
                              group 
                              focus:outline-none focus:ring-2 focus:ring-sidebar-logo/50
                            `}
                            style={{
                              borderColor: active ? (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.1)') : 'transparent',
                              ringColor: accentColor,
                            }}
                            role="menuitem"
                            aria-haspopup={item.hasSubmenu}
                            aria-expanded={item.hasSubmenu ? isSubmenuExpanded : undefined}
                            aria-current={active ? "page" : undefined}
                          >
                            <div className="relative flex items-center gap-4 w-full">
                              <MenuItemIcon 
                                icon={item.icon}
  active={active}
  collapsed={collapsed}
  darkMode={darkMode}
  textColor={sidebarColors.text || '#ffffff'}
  textActiveColor={sidebarColors.textActive || '#EE9C6C'}
                              />
                              
                              {!collapsed && (
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className={`${TYPOGRAPHY.base} ${styles.text}`}
  style={{
    color: active ? (sidebarColors.textActive || '#EE9C6C') : (sidebarColors.text || '#ffffff'),
  }}>
  {item.label}
</span>
                                    </div>
                                    
                                    <div className={`flex items-center ${GAPS.xs}`}>
                                      <Badge 
                                        count={item.count} 
                                        badge={item.badge} 
                                        active={active}
                                        darkMode={darkMode}
                                        isUrgent={item.urgent}
                                        accentColor={accentColor}
                                      />
                                      {item.hasSubmenu && (
                                        <ChevronDown 
                                          size={ICON_SIZE.md} 
                                          className={`transition-all duration-300 ${isSubmenuExpanded ? 'rotate-180' : ''}
                                                    ${active 
                                                      ? 'text-sidebar-active-icon'
                                                      : 'text-neutral-500 group-hover:text-sidebar-active-icon'
                                                    }`}
                                          style={{
                                            color: active ? accentColor : (darkMode ? '#9ca3af' : '#ffffff44'),
                                          }}
                                          aria-hidden="true"
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* القائمة الفرعية في الوضع المفتوح */}
                        {item.hasSubmenu && !collapsed && isSubmenuExpanded && (
                          <div className={`
                            my-3 ml-3 space-y-1.5 
                            relative
                            before:absolute before:left-0 before:top-0 before:bottom-0 
                            before:w-0.5 before:border-dashed before:border-l-2 rounded-xl 
                            ${darkMode ? 'before:border-neutral-600 bg-neutral-800/30' : 'bg-white/5 before:border-white/20'}
                            max-h-80 overflow-y-auto p-3 w-[200px]
                            custom-scrollbar
                          `} role="menu">
                            {item.submenu.map((subItem, subIndex) => {
                              const isSubActive = isActive(subItem.path);
                              
                              return (
                                <div className="relative" key={subIndex}>
                                  {isSubActive && (
  <div className={`
    absolute -left-2 top-1/2 -translate-y-1/2
    w-1 h-6 rounded-r-full
    shadow-[0_0_8px_rgba(var(--sidebar-icon-active-rgb,238,156,108),0.5)]
  `}
  style={{ backgroundColor: sidebarColors.textActive || '#EE9C6C' }} />
)}
                                  
                                  <SubmenuItem
                                   subItem={subItem}
  isSubActive={isSubActive}
  darkMode={darkMode}
  onClick={handleSubmenuItemClick}
  accentColor={accentColor}
  hoverBg={sidebarColors.hoverBg || 'rgba(255,167,38,0.1)'}
  textColor={sidebarColors.text || '#ffffff'}
  textActiveColor={sidebarColors.textActive || '#EE9C6C'}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </nav>

          {/* قوائم الإعدادات */}
          <div className={` ${collapsed ? 'px-2 pb-6' : 'px-2 pb-3'} shrink-0`}>
            <div className={`
              h-px mb-4 
              ${darkMode 
                ? 'bg-gradient-to-r from-transparent via-neutral-700 to-transparent'
                : 'bg-gradient-to-r from-transparent via-[white]/10 to-transparent'
              }
            `} aria-hidden="true"></div>
            <div className={`px-2 ${collapsed ? 'flex flex-col items-center gap-2' : 'grid grid-cols-3 gap-2'}`} role="menu" aria-label="Settings menu">
              {[
                { 
                  icon: <Settings size={ICON_SIZE.md} />, 
                  label: 'Settings', 
                  path: '/settings',
                },
                { 
                  icon: <Database size={ICON_SIZE.md} />, 
                  label: 'Database', 
                  path: '/database',
                },
                { 
                  icon: <Shield size={ICON_SIZE.md} />,
                  label: 'Security', 
                  path: '/security',
                },
              ].map((item, itemIndex) => {
                const active = isActive(item.path);
                const styles = getItemStyles(active);
                
                return (
                  <div 
                    key={itemIndex} 
                    className="relative"
                  >
                    <div
                      onClick={(e) => handleNavigation(item, e)}
                      className={`
                        flex items-center cursor-pointer 
                        transition-all duration-300
                        ${collapsed 
                          ? 'flex-col  px-3 py-2.5 rounded-lg justify-center group'
                          : 'flex flex-col gap-1 items-center justify-center px-2.5 py-3 rounded-lg group'
                        }
                        ${styles.background}
                        border ${styles.border}
                        focus:outline-none focus:ring-2 focus:ring-sidebar-logo/50
                      `}
                      style={{
                        borderColor: active ? (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.1)') : 'transparent',
                        ringColor: accentColor,
                      }}
                      role="menuitem"
                      aria-current={active ? "page" : undefined}
                    >
                      <div className={`
  transition-all duration-200
  ${active 
    ? 'scale-110 drop-shadow-[0_0_15px_rgba(var(--sidebar-icon-active-rgb,238,156,108),0.9)]'
    : 'group-hover:scale-105'
  }
  ${collapsed ? 'flex justify-center items-center w-full' : ''} 
`}
style={{
  color: active ? (sidebarColors.textActive || '#EE9C6C') : (sidebarColors.text || '#ffffff'),
}}>
  {item.icon}
</div>
                      
                      {!collapsed && (
  <span className={`
    text-xs font-medium mt-1.5
    transition-all duration-300
    ${styles.text}
  `}
  style={{
    color: active ? (sidebarColors.textActive || '#EE9C6C') : (sidebarColors.text || '#ffffff'),
  }}>
    {item.label}
  </span>
)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* التذييل - زر تسجيل الخروج وحالة النظام */}
          <div className={` px-4`}>
            <div className={` 
              border-t ${darkMode ? 'border-neutral-700' : 'border-white/10'}
              ${collapsed ? 'px-2 py-6' : 'px-1 pt-6'}
              shrink-0 
            `}>
              {!collapsed ? (
                <div className="flex flex-col gap-4">
                  <button 
  onClick={handleLogout}  // ✅ الآن يعمل
  className={`
    w-full flex items-center justify-center gap-3 p-3 
    rounded-xl transition-all duration-300
    hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-sidebar-logo/50
    ${darkMode 
      ? 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700'
      : 'bg-white/10 text-white hover:bg-white/20'
    }
    border ${darkMode ? 'border-gray-700' : 'border-white/15'}
  `}
  style={{
    backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
    color: sidebarColors.text || '#ffffff',
    borderColor: sidebarColors.border || (darkMode ? '#374151' : 'rgba(255,255,255,0.1)'),
    ringColor: accentColor,
  }}
  aria-label="Sign out"
>
  <LogOut size={ICON_SIZE.sm} />
  <span className={`text-sm font-semibold`} style={{ color: sidebarColors.text || '#ffffff' }}>
    Sign Out
  </span>
</button>

                  <div className="flex items-center justify-between px-2">
                    <div className={`text-2xs ${darkMode ? 'text-neutral-500' : 'text-white/60'}`}>
                      v2.1.0
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className={`w-2.5 h-2.5 rounded-full ${darkMode ? 'bg-green-500' : 'bg-green-400'}`} 
                             aria-hidden="true" />
                        <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${darkMode ? 'bg-green-500' : 'bg-green-400'} animate-ping opacity-40`} 
                             aria-hidden="true" />
                      </div>
                      <span className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-white/60'}`}>
                        Online
                      </span>
                    </div>
                  </div>
                  
                </div>
                
              ) : (
                
                <div className="flex flex-col items-center gap-3">
                  <button 
  onClick={handleLogout}  // ✅ الآن يعمل
  className={`
    p-2.5 rounded-lg transition-all duration-300
    hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sidebar-logo/50
    ${darkMode 
      ? 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700' 
      : 'bg-white/10 text-white hover:bg-white/20'
    }
    border ${darkMode ? 'border-gray-700' : 'border-white/15'}
  `}
  style={{
    backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
    color: sidebarColors.text || '#ffffff',
    borderColor: sidebarColors.border || (darkMode ? '#374151' : 'rgba(255,255,255,0.1)'),
    ringColor: accentColor,
  }}
  aria-label="Sign out"
>
  <LogOut size={ICON_SIZE.sm} />
</button>
                  
                  <div className="relative">
                    <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-green-500' : 'bg-green-400'}`} 
                         aria-hidden="true" />
                    <div className={`absolute inset-0 w-2 h-2 rounded-full ${darkMode ? 'bg-green-500' : 'bg-green-400'} animate-ping opacity-40`} 
                         aria-hidden="true" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* القوائم المنبثقة في الوضع المصغر - خارج الـ aside تماماً */}
      {collapsed && hoveredSubmenu && (
        <div 
          className="fixed z-[9999]"
          style={{
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
          }}
        >
          {menuItems.map((section) =>
            section.items.map((item) => {
              if (item.hasSubmenu && hoveredSubmenu === item.label) {
                const itemElement = itemRefs.current[item.label];
                if (!itemElement) return null;
                
                const rect = itemElement.getBoundingClientRect();
                
                return (
                  <div
                    key={item.label}
                    style={{
                      position: 'absolute',
                      top: rect.top,
                      left: rect.right + 8,
                      pointerEvents: 'auto',
                    }}
                    onMouseEnter={handleMouseEnterSubmenu}
                    onMouseLeave={handleMouseLeaveSubmenu}
                  >
                    <div className={`
                      w-52 rounded-xl p-3 shadow-2xl backdrop-blur-lg
                      ${darkMode 
                        ? 'bg-neutral-900/95 border border-neutral-700' 
                        : 'bg-primary-800/95 border border-white/20'
                      }
                    `}
                    style={{
                      backgroundColor: darkMode ? '#1f2937' : bgColor,
                      borderColor: sidebarColors.border || (darkMode ? '#374151' : 'rgba(255,255,255,0.2)'),
                    }}>
                      <div className="mb-2 px-2 py-1.5">
  <div className={`font-semibold text-sm`}
    style={{
      color: sidebarColors.text || '#ffffff',
    }}>
    {item.label}
  </div>
</div>
                      
                      <div className="space-y-1.5" role="menu">
                        {item.submenu.map((subItem, subIndex) => {
                          const isSubActive = isActive(subItem.path);
                          
                          return (
                            <SubmenuItem
                              subItem={subItem}
  isSubActive={isSubActive}
  darkMode={darkMode}
  onClick={handleSubmenuItemClick}
  accentColor={accentColor}
  hoverBg={sidebarColors.hoverBg || 'rgba(255,167,38,0.1)'}
  textColor={sidebarColors.text || '#ffffff'}
  textActiveColor={sidebarColors.textActive || '#EE9C6C'}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })
          )}
        </div>
      )}
    </>
  );
};

export default Sidebar;