// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import {
  Bell, User, ChevronDown, Cpu, Activity,
  LogOut, Zap, Search, Sun, Moon, Package,
  Home, Menu, Clock, Shield, Settings, Database,
  BarChart3, Globe, Cloud, Server, Battery, CpuIcon, Command,
  ShoppingBag, AlertTriangle, AlertCircle, Trash2
} from 'lucide-react';

// المكونات الأساسية
import Sidebar from './components/layout/Sidebar/Sidebar';
import CommandPalette from './components/shared/CommandPalette/CommandPalette';
import { SearchProvider, useSearch } from './contexts/SearchContext';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';

// ✅ استيراد AppearanceProvider
import { AppearanceProvider, useAppearance } from './contexts/AppearanceContext';

// الصفحات
import Dashboard from './pages/Dashboard/Dashboard';
import OrdersPage from './pages/Orders/OrdersPage';
import OrderDetailsPage from './pages/Orders/OrderDetailsPage';
import CustomersPage from './pages/Customers/CustomersPage';
import CustomerDetailsPage from './pages/Customers/CustomerDetailsPage';
import AnalyticsPage from './pages/Analytics/AnalyticsPage';
import ReportsPage from './pages/Reports/ReportsPage';
import RevenuePage from './pages/Marketing/RevenuePage';
import SettingsPage from './pages/Settings/SettingsPage';
import DatabasePage from './pages/Database/DatabasePage';
import SecurityPage from './pages/Security/SecurityPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import AddProductPage from './pages/Products/AddProductPage';
import CategoriesPage from './pages/Products/CategoriesPage';
import InventoryPage from './pages/Products/InventoryPage';
import LowStockPage from './pages/Products/LowStockPage';
import ProductList from './pages/Products/ProductList';
import PromotionsPage from './pages/Products/PromotionsPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import { CategoryProvider } from './contexts/CategoryContext';

function AppContent() {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [systemStats, setSystemStats] = useState({
    cpu: '12%',
    memory: '4.2/16GB',
    uptime: '99.8%',
    response: '32ms',
    database: '98.7%',
    network: '246ms'
  });
  
  // ✅ استخدام AppearanceContext بدلاً من darkMode المحلي
  const { config, updateConfig } = useAppearance();
  const darkMode = config.theme === 'dark';
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userStatus, setUserStatus] = useState('active');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const { globalSearch, handleGlobalSearch, toggleCommandPalette } = useSearch();
  const { 
    allNotifications,
    unreadCount, 
    showDropdown, 
    toggleDropdown,
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    viewAll
  } = useNotifications();

  // التحقق من المصادقة
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
      if (showDropdown && !event.target.closest('.notification-container')) {
        toggleDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu, showDropdown]);

  useEffect(() => {
    const simulateSystemMetrics = () => {
      setSystemStats(prev => ({
        ...prev,
        cpu: `${Math.floor(Math.random() * 20) + 8}%`,
        memory: `${(Math.random() * 2 + 3.8).toFixed(1)}/16GB`,
        response: `${Math.floor(Math.random() * 8) + 28}ms`,
        database: `${(Math.random() * 1.5 + 97.5).toFixed(1)}%`,
        network: `${Math.floor(Math.random() * 30) + 230}ms`
      }));
    };
    
    simulateSystemMetrics();
    const interval = setInterval(simulateSystemMetrics, 8000);
    return () => clearInterval(interval);
  }, []);

  // ✅ لم نعد بحاجة إلى useEffect للـ darkMode لأن AppearanceContext يديرها

  const handleSearchSubmit = () => {
    if (globalSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(globalSearch)}`);
    }
  };

  const handleUserMenuClick = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setShowUserMenu(false);
    navigate('/login');
  };

  // إذا لم يكن المستخدم مصادقاً، اعرض صفحات المصادقة
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage darkMode={darkMode} setDarkMode={(val) => updateConfig({ theme: val ? 'dark' : 'light' })} />} />
        <Route path="/register" element={<RegisterPage darkMode={darkMode} setDarkMode={(val) => updateConfig({ theme: val ? 'dark' : 'light' })} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage darkMode={darkMode} setDarkMode={(val) => updateConfig({ theme: val ? 'dark' : 'light' })} />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage darkMode={darkMode} setDarkMode={(val) => updateConfig({ theme: val ? 'dark' : 'light' })} />} />
        <Route path="*" element={<LoginPage darkMode={darkMode} setDarkMode={(val) => updateConfig({ theme: val ? 'dark' : 'light' })} />} />
      </Routes>
    );
  }

  // إذا كان المستخدم مصادقاً، اعرض لوحة التحكم
  return (
    <div className={`flex min-h-screen ${darkMode ? 'dark bg-neutral-950' : 'bg-[#f3f0feff]'}`}>
      <Sidebar 
        darkMode={darkMode} 
        onCollapseChange={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onMobileToggle={setMobileSidebarOpen}
      />
      
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
        sidebarCollapsed ?  'lg:ml-20' : 'lg:ml-64'}
      `}>
        
        {/* Professional Header */}
        <header className={`
          fixed top-0 right-0 z-30 transition-all duration-300                         
          shadow-[0_0_5px_rgba(88,65,156,0.3)]
          ${darkMode 
            ? 'bg-neutral-900/95 backdrop-blur-xl' 
            : 'bg-[#f3f0feff]' 
          }
          ${sidebarCollapsed ? 'lg:left-20' : 'lg:left-64'}
          sm:left-0
        `}>
          <div className="flex items-center justify-between h-20 px-8">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 transition-colors duration-200"
                aria-label="Toggle sidebar"
              >
                <Menu size={20} className={darkMode ? "text-neutral-300" : "text-neutral-700"} />
              </button>
              
              <div className="font-bold text-lg text-neutral-600">
                Dashboard
              </div>
            </div>
            
            {/* Glassmorphism Search Bar */}
            <div className="flex-1 max-w-xl mx-6">
              <div className="relative w-full">
                <div className={`
                  relative rounded-full transition-all duration-200 overflow-hidden
                  ${darkMode 
                    ? 'bg-neutral-700/40 backdrop-blur-md border border-neutral-800/50' 
                    : 'bg-white/60 backdrop-blur-md border border-purple-300/50'
                  }
                  shadow hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]
                `}>
                  <div className="flex items-center px-4 py-2.5">
                    <div className="mr-3 relative cursor-pointer select-none">
                      <div className={`
                        transition-all duration-300 shadow-lg hover:shadow-xl
                        ${darkMode 
                          ? 'shadow-neutral-900/30 hover:shadow-[#EE9C6C]/10' 
                          : 'shadow-orange-200/20 hover:shadow-[#EE9C6C]/20'
                        }
                        hover:scale-105 hover:-translate-y-0.5 active:scale-95
                      `}>
                        <div className={`
                          absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-transparent to-transparent
                          transition-all duration-500 pointer-events-none
                        `} />
                        <div className="relative">
                          <Search 
                            className={`
                              transition-all duration-300 drop-shadow-sm
                              ${darkMode 
                                ? 'text-[#EE9C6C] group-hover:text-[#F5B994]' 
                                : 'text-[#EE9C6C] group-hover:text-orange-500'
                              }
                              ${globalSearch && 'animate-bounce-subtle'}
                              pointer-events-none
                            `} 
                            size={18}
                            strokeWidth={2.5}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Search products, customers, orders..."
                      value={globalSearch}
                      onChange={(e) => handleGlobalSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearchSubmit();
                        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                          e.preventDefault();
                          toggleCommandPalette();
                        }
                      }}
                      className={`
                        flex-1 bg-transparent outline-none text-sm
                        min-w-0 w-full placeholder:font-normal
                        ${darkMode 
                          ? 'text-neutral-200 placeholder-neutral-500' 
                          : 'text-neutral-900 placeholder-neutral-400'
                        }
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Control Panel */}
            <div className="flex items-center gap-[30px]">
              {/* System Metrics */}
              <div className="hidden xl:flex items-center gap-3">
                <div className={`
                  flex items-center gap-3 px-3 py-1.5 rounded-lg transition-colors duration-200
                  ${darkMode 
                    ? 'bg-neutral-800/60 border border-neutral-700/50' 
                    : 'bg-white/60 border border-purple-100'
                  }
                  hover:border-opacity-80 shadow
                `}>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-gradient-to-br from-[#58419C]/10 to-[#58419C]/5">
                      <CpuIcon size={14} className="text-[#58419C]" />
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <span className={`text-xs font-medium ${darkMode ? "text-neutral-400" : "text-neutral-600"}`}>CPU</span>
                      <span className={`text-xs font-semibold ${darkMode ? "text-[#58419C]" : "text-[#58419C]"}`}>
                        {systemStats.cpu}
                      </span>
                    </div>
                  </div>
                  
                  <div className="h-4 w-px bg-orange-700/30 dark:bg-orage-600/30"></div>
                  
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-gradient-to-br from-[#EE9C6C]/10 to-[#EE9C6C]/5">
                      <Activity size={14} className="text-[#EE9C6C]" />
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <span className={`text-xs font-medium ${darkMode ? "text-neutral-400" : "text-neutral-600"}`}>RESP</span>
                      <span className={`text-xs font-semibold ${darkMode ? "text-[#EE9C6C]" : "text-[#EE9C6C]"}`}>
                        {systemStats.response}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-[10px]">
                {/* Theme Toggle */}
                <button
                  onClick={() => updateConfig({ theme: darkMode ? 'light' : 'dark' })}
                  className={`
                    p-2 rounded-[50px] transition-all duration-200
                    ${darkMode 
                      ? 'bg-neutral-800/60 hover:bg-neutral-700/80 text-amber-400 border border-neutral-700/50 hover:border-neutral-600/70' 
                      : 'bg-white hover:bg-purple-100 text-amber-600 border border-purple-200/50 hover:border-purple-300/70'
                    }
                    shadow
                  `}
                  aria-label="Toggle theme"
                >
                  {darkMode ? <Sun size={19} /> : <Moon size={19} />}
                </button>
                
                {/* Notifications Button with Dropdown */}
                <div className="relative notification-container">
                  <button
                    onClick={toggleDropdown}
                    className={`
                      p-2 rounded-[50px] relative transition-all duration-200 border
                      ${darkMode 
                        ? 'bg-neutral-800/60 border-neutral-700/50 hover:bg-neutral-700/80 hover:border-neutral-600/70' 
                        : 'bg-white border-purple-200/50 hover:bg-purple-100 hover:border-purple-300/70'
                      }
                      shadow
                    `}
                  >
                    {unreadCount > 0 ? (
                      <Bell size={19} className={darkMode ? "text-neutral-400" : "text-neutral-600"} />
                    ) : (
                      <Bell size={19} className={darkMode ? "text-neutral-500" : "text-neutral-400"} />
                    )}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showDropdown && (
                    <div className={`absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl shadow-2xl z-50 border ${darkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-200'}`}>
                      <div className={`p-3 border-b flex items-center justify-between sticky top-0 ${darkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-neutral-100'}`}>
                        <span className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-neutral-900'}`}>Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-xs text-[#8B7ABA] hover:underline">Mark all read</button>
                        )}
                      </div>
                      
                      {allNotifications.length === 0 ? (
                        <div className="p-6 text-center">
                          <Bell size={32} className="mx-auto text-neutral-400 mb-2" />
                          <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>No notifications</p>
                        </div>
                      ) : (
                        allNotifications.slice(0, 5).map((n) => {
                          const Icon = n.icon === 'ShoppingBag' ? ShoppingBag : 
                                      n.icon === 'AlertTriangle' ? AlertTriangle :
                                      n.icon === 'AlertCircle' ? AlertCircle :
                                      Clock;
                          return (
                            <div
                              key={n.id}
                              className={`p-3 border-b transition-colors ${darkMode ? 'border-neutral-700 hover:bg-neutral-700/50' : 'border-neutral-100 hover:bg-neutral-50'} ${!n.is_read ? (darkMode ? 'bg-neutral-700/30' : 'bg-purple-50') : ''}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg flex-shrink-0`} style={{ backgroundColor: `${n.color}20` }}>
                                  <Icon size={16} style={{ color: n.color }} />
                                </div>
                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => markAsRead(n.id)}>
                                  <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>{n.title}</p>
                                  <p className={`text-xs truncate ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>{n.message}</p>
                                  <p className={`text-[10px] mt-1 ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>{n.time_ago || 'Just now'}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {!n.is_read && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: n.color }} />}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(n.id);
                                    }}
                                    className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-400 hover:text-red-500"
                                    title="Delete notification"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      
                      <div className={`p-2 border-t ${darkMode ? 'border-neutral-700' : 'border-neutral-100'}`}>
                        <button 
                          onClick={viewAll}
                          className="w-full py-2 text-center text-sm text-[#8B7ABA] hover:underline"
                        >
                          View all notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* User Profile */}
              <div className="relative user-menu-container">
                <button 
                  onClick={handleUserMenuClick}
                  className={`
                    group flex items-center gap-[15px] transition-all duration-200
                    ${darkMode 
                      ? ' hover:bg-neutral-800/90' 
                      : ' hover:bg-white/90'
                    }
                    px-3 py-1.5 rounded-[50px] hover:shadow
                  `}
                >
                  <div className="relative flex items-center">
                    <div className={`
                      rounded-full flex items-center justify-center border overflow-hidden w-11 h-11
                      ${darkMode 
                        ? 'bg-neutral-800 border-neutral-700 group-hover:border-neutral-600' 
                        : 'bg-[#58419C]/80 border-purple-200/50 group-hover:border-purple-300/70'
                      }
                      transition-colors duration-200 shadow
                    `}>
                      <div className="w-8 rounded-full overflow-hidden pt-2">
                        <img 
                          src="/user.png"  
                          alt="User Avatar"
                          className="w-full h-full"   
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${darkMode ? 'text-neutral-200' : 'text-neutral-900'}`}>Admin</p>
                    <p className={`text-[11px] ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>Admin</p>
                  </div>
                  
                  <ChevronDown 
                    size={14} 
                    className={`
                      ml-1 p-1 w-6 h-6 rounded-[50px] transition-all duration-200 
                      ${showUserMenu ? 'rotate-180' : ''}
                      ${darkMode 
                        ? 'bg-neutral-800/60 border border-neutral-700/50 group-hover:border-neutral-600/70 text-neutral-400 group-hover:text-[#EE9C6C]' 
                        : ' bg-white border border-purple-300/50 group-hover:border-purple-400/70 text-[#EE9C6C] group-hover:text-[#F5B994]'
                      }
                    `} 
                  />
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className={`
                    absolute top-full right-0 mt-2 w-48 rounded-xl shadow-xl z-50
                    ${darkMode 
                      ? 'bg-neutral-800 border border-neutral-700' 
                      : 'bg-white border border-neutral-200'
                    }
                  `}>
                    <div className="py-2">
                      <div className={`px-4 py-3 border-b ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
                        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                          {JSON.parse(localStorage.getItem('user') || '{"name":"Admin"}').name}
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {JSON.parse(localStorage.getItem('user') || '{"email":"admin@vigilant.com"}').email}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <div className="h-16"></div>
        
        <main className="flex-1 overflow-auto">
          <div className={darkMode 
            ? 'bg-gradient-to-b from-neutral-950 to-neutral-900 min-h-[calc(100vh-4rem)]' 
            : 'bg-[#f3f0feff] min-h-[calc(100vh-4rem)]'
          }>
            <div className="px-6 lg:px-8 py-8 w-full">
              <Routes>
                <Route path="/" element={<Dashboard darkMode={darkMode} />} />
                <Route path="/dashboard" element={<Dashboard darkMode={darkMode} />} />
                <Route path="/products" element={<ProductList darkMode={darkMode} />} />
                <Route path="/add-product" element={<AddProductPage darkMode={darkMode} />} />
                <Route path="/categories" element={<CategoriesPage darkMode={darkMode} />} />
                <Route path="/inventory" element={<InventoryPage darkMode={darkMode} />} />
                <Route path="/low-stock" element={<LowStockPage darkMode={darkMode} />} />
                <Route path="/promotions" element={<PromotionsPage darkMode={darkMode} />} />
                <Route path="/orders" element={<OrdersPage darkMode={darkMode} />} />
                <Route path="/orders/:id" element={<OrderDetailsPage darkMode={darkMode} />} />
                <Route path="/customers" element={<CustomersPage darkMode={darkMode} />} />
                <Route path="/customers/:id" element={<CustomerDetailsPage darkMode={darkMode} />} />
                <Route path="/analytics" element={<AnalyticsPage darkMode={darkMode} />} />
                <Route path="/revenue" element={<RevenuePage darkMode={darkMode} />} />
                <Route path="/reports" element={<ReportsPage darkMode={darkMode} />} />
                <Route 
                  path="/settings" 
                  element={
                    <SettingsPage 
                      darkMode={darkMode} 
                      setDarkMode={(val) => updateConfig({ theme: val ? 'dark' : 'light' })}
                    />
                  } 
                />
                <Route path="/database" element={<DatabasePage darkMode={darkMode} />} />
                <Route path="/security" element={<SecurityPage darkMode={darkMode} />} />
                <Route path="/notifications" element={<NotificationsPage darkMode={darkMode} />} />
              </Routes>
            </div>
          </div>
        </main>
        
        {/* Professional Footer */}
        <footer className={`
          py-3 px-6
          ${darkMode 
            ? 'border-t border-neutral-800/30' 
            : 'border-t border-neutral-200/50'
          }
        `}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <div className="flex items-center gap-10">
              <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>© 2025 Vigilant</span>
              <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>All rights reserved</span>
              <div className="flex items-center gap-2">
                <div className={`w-1 h-1 rounded-full hidden sm:block ${darkMode ? 'bg-neutral-700' : 'bg-neutral-300'}`}></div>
                <span className={`text-xs hidden sm:block ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>Version 2.1.0</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
      
      <CommandPalette darkMode={darkMode} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <SearchProvider>
        <NotificationProvider>
          <CategoryProvider>
            <AppearanceProvider>
              <AppContent />
            </AppearanceProvider>
          </CategoryProvider>
        </NotificationProvider>
      </SearchProvider>
    </Router>
  );
}