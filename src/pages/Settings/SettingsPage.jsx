// src/pages/Settings/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Settings, User, Bell, Shield, Globe, Moon, Sun,
  Mail, Lock, Eye, EyeOff, Save, RefreshCw,
  ChevronRight, ChevronLeft, AlertCircle, CheckCircle,
  Database, Clock, FileText, HardDrive, Server,
  Users, Activity, Zap, Smartphone, Monitor,
  Palette, Type, Volume2, Languages, LogOut,
  Trash2, Download, Upload, Key, Fingerprint,
  Check, ChevronDown, Globe2, Calendar, Clock3,
  Loader2
} from 'lucide-react';

// ✅ استيراد الأجزاء
import GeneralSection from './sections/GeneralSection';
import NotificationSection from './sections/NotificationSection';
import SecuritySection from './sections/SecuritySection';
import AppearanceSection from './sections/AppearanceSection';
import BackupSection from './sections/BackupSection';
import AdvancedSection from './sections/AdvancedSection';

// ✅ استيراد الـ Context
import { useAppearance } from '../../contexts/AppearanceContext';
import { settingsService } from '../../services/settingsService';

// ✅ استيراد مكونات مساعدة
import Dropdown, { DropdownItem, DropdownDivider, DropdownHeader } from '../components/Dropdown/Dropdown';

const SettingsPage = ({ darkMode, setDarkMode }) => {
  const { config, updateConfig, resetConfig, updateColor, updateSidebarColor } = useAppearance();
  
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ إعدادات كل قسم
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Vigilant Admin',
    siteDescription: 'Admin Dashboard for Vigilant',
    adminEmail: 'admin@vigilant.com',
    timezone: 'UTC+3',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    language: 'en',
    maintenanceMode: false,
    debugMode: false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    desktopNotifications: false,
    orderAlerts: true,
    stockAlerts: true,
    customerAlerts: false,
    systemAlerts: true,
    marketingEmails: false,
    dailySummary: true,
    weeklyReport: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    maxLoginAttempts: '5',
    passwordExpiry: '90',
    requireStrongPassword: true,
    ipWhitelisting: false,
    loginNotifications: true,
    allowMultipleSessions: false,
    sessionControl: 'strict'
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    retentionDays: '30',
    backupLocation: 'cloud',
    includeMedia: true,
    includeDatabase: true,
    includeConfigs: true
  });

  const [advancedSettings, setAdvancedSettings] = useState({
    apiRateLimit: '1000',
    cacheDuration: '3600',
    sessionStorage: 'redis',
    logLevel: 'info',
    logRetention: '30',
    maxFileUpload: '10',
    allowedFileTypes: 'jpg,png,pdf,doc',
    compression: true,
    minifyAssets: true
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'backup', label: 'Backup', icon: Database },
    { id: 'advanced', label: 'Advanced', icon: Server }
  ];

  
// ✅ ✅ ✅ دالة معالجة الإدخال المحسنة
const handleInputChange = (section, field, value) => {
  // ✅ التحقق من ألوان السايدبار
  if (field && field.startsWith('sidebar_')) {
    const colorKey = field.replace('sidebar_', '');
    console.log(`🎨 Sidebar color changed: ${colorKey} = ${value}`);
    updateSidebarColor(colorKey, value);
    return;
  }
  
  // ✅ التحقق من ألوان النظام
  if (field && field.startsWith('color_')) {
    const colorKey = field.replace('color_', '');
    console.log(`🎨 System color changed: ${colorKey} = ${value}`);
    updateColor(colorKey, value);
    return;
  }
  
  // ✅ باقي الأقسام
  switch(section) {
    case 'general':
      setGeneralSettings(prev => ({ ...prev, [field]: value }));
      break;
    case 'notifications':
      setNotificationSettings(prev => ({ ...prev, [field]: value }));
      break;
    case 'security':
      setSecuritySettings(prev => ({ ...prev, [field]: value }));
      break;
    case 'appearance':
      updateConfig({ [field]: value });
      break;
    case 'backup':
      setBackupSettings(prev => ({ ...prev, [field]: value }));
      break;
    case 'advanced':
      setAdvancedSettings(prev => ({ ...prev, [field]: value }));
      break;
    default:
      break;
  }
};

  const handleThemeChange = (theme) => {
    updateConfig({ theme });
    if (setDarkMode) {
      setDarkMode(theme === 'dark');
    }
  };

  // ✅ جلب البيانات
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      const [generalRes, notificationRes, securityRes] = await Promise.all([
        settingsService.getGeneralSettings(),
        settingsService.getNotificationSettings(),
        settingsService.getSecuritySettings(),
      ]);
      
      if (generalRes.data) {
        setGeneralSettings({
          siteName: generalRes.data.site_name || 'Vigilant Admin',
          siteDescription: generalRes.data.site_description || 'Admin Dashboard for Vigilant',
          adminEmail: generalRes.data.admin_email || 'admin@vigilant.com',
          timezone: generalRes.data.timezone || 'UTC+3',
          dateFormat: generalRes.data.date_format || 'YYYY-MM-DD',
          timeFormat: generalRes.data.time_format || '24h',
          language: generalRes.data.language || 'en',
          maintenanceMode: generalRes.data.maintenance_mode || false,
          debugMode: generalRes.data.debug_mode || false,
        });
      }
      
      if (notificationRes.data) {
        setNotificationSettings({
          emailNotifications: notificationRes.data.email_notifications !== undefined ? notificationRes.data.email_notifications : true,
          pushNotifications: notificationRes.data.push_notifications !== undefined ? notificationRes.data.push_notifications : true,
          desktopNotifications: notificationRes.data.desktop_notifications !== undefined ? notificationRes.data.desktop_notifications : false,
          orderAlerts: notificationRes.data.order_alerts !== undefined ? notificationRes.data.order_alerts : true,
          stockAlerts: notificationRes.data.stock_alerts !== undefined ? notificationRes.data.stock_alerts : true,
          customerAlerts: notificationRes.data.customer_alerts !== undefined ? notificationRes.data.customer_alerts : false,
          systemAlerts: notificationRes.data.system_alerts !== undefined ? notificationRes.data.system_alerts : true,
          marketingEmails: notificationRes.data.marketing_emails !== undefined ? notificationRes.data.marketing_emails : false,
          dailySummary: notificationRes.data.daily_summary !== undefined ? notificationRes.data.daily_summary : true,
          weeklyReport: notificationRes.data.weekly_report !== undefined ? notificationRes.data.weekly_report : true,
        });
      }
      
      if (securityRes.data) {
        setSecuritySettings({
          twoFactorAuth: securityRes.data.two_factor_auth || false,
          sessionTimeout: securityRes.data.session_timeout?.toString() || '30',
          maxLoginAttempts: securityRes.data.max_login_attempts?.toString() || '5',
          passwordExpiry: securityRes.data.password_expiry?.toString() || '90',
          requireStrongPassword: securityRes.data.require_strong_password !== undefined ? securityRes.data.require_strong_password : true,
          ipWhitelisting: securityRes.data.ip_whitelisting || false,
          loginNotifications: securityRes.data.login_notifications !== undefined ? securityRes.data.login_notifications : true,
          allowMultipleSessions: securityRes.data.allow_multiple_sessions || false,
          sessionControl: securityRes.data.session_control || 'strict',
        });
      }
      
    } catch (err) {
      console.error('❌ Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // ✅ حفظ البيانات
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      await settingsService.updateGeneralSettings({
        site_name: generalSettings.siteName,
        site_description: generalSettings.siteDescription,
        admin_email: generalSettings.adminEmail,
        timezone: generalSettings.timezone,
        date_format: generalSettings.dateFormat,
        time_format: generalSettings.timeFormat,
        language: generalSettings.language,
        maintenance_mode: generalSettings.maintenanceMode,
        debug_mode: generalSettings.debugMode,
      });
      
      await settingsService.updateNotificationSettings({
        email_notifications: notificationSettings.emailNotifications,
        push_notifications: notificationSettings.pushNotifications,
        desktop_notifications: notificationSettings.desktopNotifications,
        order_alerts: notificationSettings.orderAlerts,
        stock_alerts: notificationSettings.stockAlerts,
        customer_alerts: notificationSettings.customerAlerts,
        system_alerts: notificationSettings.systemAlerts,
        marketing_emails: notificationSettings.marketingEmails,
        daily_summary: notificationSettings.dailySummary,
        weekly_report: notificationSettings.weeklyReport,
      });
      
      await settingsService.updateSecuritySettings({
        two_factor_auth: securitySettings.twoFactorAuth,
        session_timeout: parseInt(securitySettings.sessionTimeout) || 30,
        max_login_attempts: parseInt(securitySettings.maxLoginAttempts) || 5,
        password_expiry: parseInt(securitySettings.passwordExpiry) || 90,
        require_strong_password: securitySettings.requireStrongPassword,
        ip_whitelisting: securitySettings.ipWhitelisting,
        login_notifications: securitySettings.loginNotifications,
        allow_multiple_sessions: securitySettings.allowMultipleSessions,
        session_control: securitySettings.sessionControl,
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      console.error('❌ Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      resetConfig();
      fetchSettings();
    }
  };

  // ✅ مكون DropdownTrigger
  const DropdownTrigger = ({ label, value, icon: Icon, darkMode }) => (
    <div className={`
      w-full px-4 py-2.5 rounded-lg border transition-all
      flex items-center justify-between cursor-pointer
      ${darkMode 
        ? 'bg-neutral-700/50 border-neutral-600 text-white hover:bg-neutral-700' 
        : 'bg-neutral-50 border-neutral-200 text-neutral-900 hover:bg-neutral-100'}
    `}>
      <div className="flex items-center gap-2 truncate">
        {Icon && <Icon size={16} className={darkMode ? 'text-neutral-400 flex-shrink-0' : 'text-neutral-500 flex-shrink-0'} />}
        <span className="truncate">{value || label}</span>
      </div>
      <ChevronDown size={16} className={`flex-shrink-0 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`} />
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: 'var(--primary-color, #8B7ABA)' }} />
          <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  // ✅ تصيير المحتوى حسب التبويب النشط
  const renderContent = () => {
    switch(activeTab) {
      case 'general':
        return (
          <GeneralSection
            darkMode={darkMode}
            generalSettings={generalSettings}
            handleInputChange={handleInputChange}
            DropdownTrigger={DropdownTrigger}
            Dropdown={Dropdown}
            DropdownItem={DropdownItem}
            DropdownHeader={DropdownHeader}
          />
        );
      case 'notifications':
        return (
          <NotificationSection
            darkMode={darkMode}
            notificationSettings={notificationSettings}
            handleInputChange={handleInputChange}
          />
        );
      case 'security':
        return (
          <SecuritySection
            darkMode={darkMode}
            securitySettings={securitySettings}
            handleInputChange={handleInputChange}
            DropdownTrigger={DropdownTrigger}
            Dropdown={Dropdown}
            DropdownItem={DropdownItem}
            DropdownHeader={DropdownHeader}
          />
        );
      case 'appearance':
        return (
          <AppearanceSection
            darkMode={darkMode}
            config={config}
            handleInputChange={handleInputChange}
            handleThemeChange={handleThemeChange}
            setDarkMode={setDarkMode}
            setSuccess={setSuccess}
            DropdownTrigger={DropdownTrigger}
            Dropdown={Dropdown}
            DropdownItem={DropdownItem}
            DropdownHeader={DropdownHeader}
          />
        );
      case 'backup':
        return (
          <BackupSection
            darkMode={darkMode}
            backupSettings={backupSettings}
            handleInputChange={handleInputChange}
            DropdownTrigger={DropdownTrigger}
            Dropdown={Dropdown}
            DropdownItem={DropdownItem}
            DropdownHeader={DropdownHeader}
          />
        );
      case 'advanced':
        return (
          <AdvancedSection
            darkMode={darkMode}
            advancedSettings={advancedSettings}
            handleInputChange={handleInputChange}
            DropdownTrigger={DropdownTrigger}
            Dropdown={Dropdown}
            DropdownItem={DropdownItem}
            DropdownHeader={DropdownHeader}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 mt-2">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${darkMode ? 'bg-primary-900/30' : 'bg-primary-300'}`}>
          <Settings size={24} className="text-white dark:text-primary-400" />
        </div>
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
            Settings
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-2xl blur-xl"></div>
        
        <div className={`relative p-1.5 rounded-2xl backdrop-blur-sm
                        ${darkMode 
                          ? 'bg-neutral-800/50 border border-neutral-700/50' 
                          : 'bg-white/50 border border-neutral-200/50 shadow-sm'}`}>
          
          <div className="absolute inset-y-1.5 left-1.5 w-[calc((100%-12px)/4)] 
                          bg-primary-300 rounded-xl 
                          transition-all duration-500 ease-out"
               style={{
                 transform: `translateX(${tabs.findIndex(t => t.id === activeTab) * 100}%)`,
                 width: `calc((100% - ${tabs.length * 2}px)/${tabs.length})`
               }}>
          </div>

          <div className="relative flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative flex-1 flex items-center justify-center gap-2 
                    px-4 py-3 rounded-xl font-medium text-sm
                    transition-all duration-300 overflow-hidden group
                    ${isActive 
                      ? 'text-white' 
                      : darkMode
                        ? 'text-neutral-400 hover:text-neutral-200'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }
                  `}
                >
                  <div className={`
                    absolute inset-0 opacity-0 group-hover:opacity-100 
                    transition-opacity duration-300 rounded-xl
                    ${darkMode 
                      ? 'bg-white/5' 
                      : 'bg-neutral-900/5'
                    }
                  `}></div>

                  <div className={`
                    relative transition-all duration-300
                    ${isActive ? 'scale-110' : 'group-hover:scale-110'}
                  `}>
                    <Icon 
                      size={18} 
                      className={`
                        transition-all duration-300
                        ${isActive 
                          ? 'text-white drop-shadow-lg' 
                          : darkMode
                            ? 'text-neutral-400 group-hover:text-neutral-200'
                            : 'text-neutral-500 group-hover:text-neutral-700'
                        }
                      `} 
                    />
                  </div>

                  <span className={`
                    relative hidden sm:inline-block
                    transition-all duration-300
                    ${isActive 
                      ? 'tracking-wide font-semibold' 
                      : 'group-hover:tracking-wide'
                    }
                  `}>
                    {tab.label}
                  </span>

                  <span className={`
                    sm:hidden absolute -bottom-1 left-1/2 transform -translate-x-1/2
                    w-1 h-1 rounded-full transition-all duration-300
                    ${isActive 
                      ? 'bg-white scale-100' 
                      : 'scale-0'
                    }
                  `}></span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`
        rounded-2xl transition-all duration-500 ease-out transform
        ${darkMode 
          ? 'bg-gradient-to-br from-neutral-800/90 to-neutral-900/90 border border-neutral-700/50 shadow-2xl' 
          : 'bg-gradient-to-br from-white to-neutral-50/90 border border-neutral-200/50 shadow-xl'
        }
        hover:shadow-2xl hover:scale-[1.02] transition-all duration-500
      `}>
        <div className="p-6 backdrop-blur-sm">
          {/* Content header */}
          <div className="flex items-center gap-4 mb-6 pb-4 border-b 
                          border-neutral-200 dark:border-neutral-800
                          transform transition-all duration-500
                          hover:translate-x-1">
            
            <div className={`
              relative p-3 rounded-xl overflow-hidden
              transition-all duration-500 group
              ${darkMode 
                ? 'bg-primary-500/20 ' 
                : 'bg-primary-100 '
              }
            `}>
              {activeTab === 'general' && <Settings size={24} className="relative z-10 text-primary-800/80 dark:text-primary-400 transform group-hover:rotate-12 transition-transform duration-500" />}
              {activeTab === 'notifications' && <Bell size={24} className="relative z-10 text-primary-800/80 dark:text-primary-400 transform group-hover:rotate-12 transition-transform duration-500" />}
              {activeTab === 'security' && <Shield size={24} className="relative z-10 text-primary-800/80 dark:text-primary-400 transform group-hover:rotate-12 transition-transform duration-500" />}
              {activeTab === 'appearance' && <Palette size={24} className="relative z-10 text-primary-800/80 dark:text-primary-400 transform group-hover:rotate-12 transition-transform duration-500" />}
              {activeTab === 'backup' && <Database size={24} className="relative z-10 text-primary-800/80 dark:text-primary-400 transform group-hover:rotate-12 transition-transform duration-500" />}
              {activeTab === 'advanced' && <Server size={24} className="relative z-10 text-primary-800/80 dark:text-primary-400 transform group-hover:rotate-12 transition-transform duration-500" />}
            </div>

            <div className="flex-1">
              <h3 className={`
                text-xl font-bold transition-all duration-300
                ${darkMode ? 'text-white' : 'text-neutral-900'}
                hover:translate-x-1
              `}>
                {tabs.find(t => t.id === activeTab)?.label} Settings
              </h3>
              <p className={`
                text-sm mt-1 transition-all duration-300
                ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}
              `}>
                {activeTab === 'general' && 'Configure your site name, timezone, and other general settings'}
                {activeTab === 'notifications' && 'Manage your notification preferences and alerts'}
                {activeTab === 'security' && 'Control security settings and access policies'}
                {activeTab === 'appearance' && 'Customize the look and feel of your dashboard'}
                {activeTab === 'backup' && 'Configure backup schedules and storage options'}
                {activeTab === 'advanced' && 'Adjust advanced system settings and configurations'}
              </p>
            </div>
          </div>

          {/* ✅ المحتوى الديناميكي */}
          {renderContent()}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        {success && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 
                        border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle size={16} className="text-[#34D19C]" />
            <span className="text-sm text-green-700 dark:text-green-400">Saved successfully!</span>
          </div>
        )}
        
        {error && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 
                        border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle size={16} className="text-[#F08FAE]" />
            <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
          </div>
        )}

        <button
          onClick={handleReset}
          className="group flex items-center gap-2 px-6 py-3 rounded-lg 
                   text-base font-semibold shadow-lg
                   bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300
                   border border-neutral-200 dark:border-neutral-700
                   hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
        >
          <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-300" />
          <span className="text-sm font-medium">Reset</span>
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="group relative overflow-hidden px-6 py-3 rounded-lg 
                   text-white text-base font-semibold shadow-xl hover:shadow-xl
                   transition-all hover:-translate-y-0.5 active:scale-95
                   disabled:opacity-50 disabled:cursor-not-allowed
                   btn-primary"
        >
          <span className="relative z-10 flex items-center gap-2">
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Changes</span>
              </>
            )}
          </span>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                        bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full"
               style={{ transition: 'transform 0.5s' }} />
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;