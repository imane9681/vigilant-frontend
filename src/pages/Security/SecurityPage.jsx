// src/pages/Security/SecurityPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Shield, Lock, Key, Fingerprint, Eye, EyeOff, Unlock,
  Users, Activity, AlertTriangle, CheckCircle,
  Clock, Calendar, Filter, Search, Download,
  RefreshCw, MoreVertical, User, UserCheck,
  UserX, LogOut, Globe, Smartphone, Monitor,
  Mail, Phone, Shield as ShieldIcon, ShieldAlert,
  ShieldCheck, Key as KeyIcon, Fingerprint as FingerprintIcon,
  Gauge, Server, Cpu, BarChart3, Table2, Archive,
  Zap, Save, RotateCw, Eye as EyeIcon, Loader2,
  Star, Award, TrendingUp, TrendingDown,
  Trash2, Database, Settings, AlertCircle
} from 'lucide-react';
import MetricCard from '../Dashboard/components/MetricCard';
import { securityService } from '../../services/securityService';

const SecurityPage = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [cleaning, setCleaning] = useState(false);
  const [cleaningLogs, setCleaningLogs] = useState(false);

  
  const [securityStats, setSecurityStats] = useState({
    total_users: 0,
    active_users: 0,
    locked_users: 0,
    admin_users: 0,
    two_factor_enabled: 0,
    strong_passwords: 0,
    secure_sessions: 0,
    active_sessions: 0,
    failed_logins_today: 0,
    failed_logins_week: 0,
  });
  
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logsStats, setLogsStats] = useState(null);
  
  const [showPassword, setShowPassword] = useState({});

  const colors = {
    primary: '#8B7ABA',
    secondary: '#F08FAE',
    accent: '#EE9C6C',
    success: '#34D19C'
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Gauge },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'sessions', label: 'Sessions', icon: Activity },
    { id: 'logs', label: 'Security Logs', icon: ShieldAlert },
    { id: '2fa', label: '2FA', icon: Fingerprint }
  ];

  const calculateSecurityScore = (stats) => {
    let score = 0;
    
    const activeRatio = stats.total_users > 0 ? stats.active_users / stats.total_users : 0;
    score += activeRatio * 20;
    
    const twoFARatio = stats.total_users > 0 ? stats.two_factor_enabled / stats.total_users : 0;
    score += twoFARatio * 25;
    
    const strongPasswordRatio = stats.total_users > 0 ? stats.strong_passwords / stats.total_users : 0;
    score += strongPasswordRatio * 15;
    
    const secureSessionsRatio = stats.total_users > 0 ? stats.secure_sessions / stats.total_users : 0;
    score += secureSessionsRatio * 15;
    
    const lockedPenalty = stats.total_users > 0 ? (stats.locked_users / stats.total_users) * 15 : 0;
    score -= lockedPenalty;
    
    const failedPenalty = Math.min(stats.failed_logins_today / 10, 10);
    score -= failedPenalty;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const getSecurityGrade = (score) => {
    if (score >= 80) return { label: 'Excellent', color: colors.success, icon: Award };
    if (score >= 60) return { label: 'Good', color: colors.primary, icon: ShieldCheck };
    if (score >= 40) return { label: 'Fair', color: colors.accent, icon: AlertTriangle };
    return { label: 'Needs Improvement', color: colors.secondary, icon: ShieldAlert };
  };

  const securityScore = calculateSecurityScore(securityStats);
  const securityGrade = getSecurityGrade(securityScore);

  // ✅ تنظيف الجلسات المنتهية وغير النشطة
  const handleCleanupSessions = async () => {
    if (!window.confirm('🧹 This will remove all expired and inactive sessions. Continue?')) return;
    
    setCleaning(true);
    try {
      const response = await securityService.cleanupSessions();
      alert(`✅ Cleaned up ${response.data.total_removed} sessions`);
      await fetchAllData(true);
    } catch (error) {
      console.error('Cleanup failed:', error);
      alert('❌ Failed to cleanup sessions');
    } finally {
      setCleaning(false);
    }
  };

  // ✅ حذف جميع جلسات المستخدم الحالي
  const handleClearMySessions = async () => {
    if (!window.confirm('⚠️ This will delete ALL your sessions (including current). You will be logged out. Continue?')) return;
    
    setCleaning(true);
    try {
      await securityService.clearUserSessions();
      alert('✅ All your sessions have been cleared');
      localStorage.clear();
      window.location.href = '/login';
    } catch (error) {
      console.error('Clear sessions failed:', error);
      alert('❌ Failed to clear sessions');
      setCleaning(false);
    }
  };



 // ✅ تنظيف سجلات الأمان القديمة
const handleCleanupLogs = async () => {
  const days = prompt('Delete logs older than how many days? (default: 30)\n⚠️ Enter 0 to delete ALL logs', '30');
  if (!days) return;
  
  const daysNum = parseInt(days);
  if (isNaN(daysNum) || daysNum < 0) {
    alert('❌ Please enter a valid number (0 or greater)');
    return;
  }
  
  // ✅ تحذير إضافي إذا كان 0
  if (daysNum === 0) {
    if (!window.confirm('⚠️⚠️⚠️ ARE YOU SURE? This will delete ALL security logs permanently! ⚠️⚠️⚠️\n\nThis action cannot be undone. Continue?')) {
      return;
    }
  } else {
    if (!window.confirm(`⚠️ This will delete all logs older than ${daysNum} days. Continue?`)) {
      return;
    }
  }
  
  setCleaningLogs(true);
  try {
    const response = await securityService.cleanupLogs(daysNum);
    console.log('📥 Response:', response.data);
    
    // ✅ ✅ ✅ معالجة رسالة warning من الـ API
    if (response.data.status === 'warning') {
      // ✅ إذا كان تحذير، نطلب تأكيد إضافي
      if (window.confirm(response.data.message + '\n\n⚠️ This will delete ALL logs. Continue?')) {
        // ✅ إرسال طلب ثانٍ للتأكيد
        const confirmResponse = await securityService.cleanupLogs(0);
        alert(`✅ Deleted ${confirmResponse.data.deleted_count} logs`);
      } else {
        alert('❌ Operation cancelled');
      }
    } else {
      // ✅ نجاح عادي
      alert(`✅ Deleted ${response.data.deleted_count} logs`);
    }
    
    await fetchAllData(true);
  } catch (error) {
    console.error('❌ Cleanup logs failed:', error);
    alert('❌ Failed to cleanup logs');
  } finally {
    setCleaningLogs(false);
  }
};

  // ✅ جلب جميع البيانات
  const fetchAllData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const [statsRes, usersRes, sessionsRes, logsRes, logsStatsRes] = await Promise.all([
        securityService.getLatestStats(),
        securityService.getUsers(),
        securityService.getSessions(),
        securityService.getLogs(),
        securityService.getLogsStats(),
      ]);
      
      setSecurityStats(statsRes.data);
      setUsers(usersRes.data.results || usersRes.data);
      setSessions(sessionsRes.data.results || sessionsRes.data);
      setLogs(logsRes.data.results || logsRes.data);
      setLogsStats(logsStatsRes.data);
      
    } catch (err) {
      console.error('❌ Error fetching security data:', err);
      setError('Failed to load security data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleRefresh = async () => {
    await fetchAllData(true);
  };

  const handleLockUser = async (userId) => {
    try {
      await securityService.lockUser(userId);
      await fetchAllData(true);
    } catch (err) {
      console.error('Error locking user:', err);
      alert('Failed to lock user');
    }
  };

  const handleUnlockUser = async (userId) => {
    try {
      await securityService.unlockUser(userId);
      await fetchAllData(true);
    } catch (err) {
      console.error('Error unlocking user:', err);
      alert('Failed to unlock user');
    }
  };

  const handleTerminateSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to terminate this session?')) return;
    
    try {
      await securityService.terminateSession(sessionId);
      await fetchAllData(true);
    } catch (err) {
      console.error('Error terminating session:', err);
      alert('Failed to terminate session');
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return { bg: darkMode ? 'bg-[#F08FAE]/20' : 'bg-[#F08FAE]/10', text: '#F08FAE' };
      case 'warning': return { bg: darkMode ? 'bg-[#EE9C6C]/20' : 'bg-[#EE9C6C]/10', text: '#EE9C6C' };
      case 'info': return { bg: darkMode ? 'bg-[#8B7ABA]/20' : 'bg-[#8B7ABA]/10', text: '#8B7ABA' };
      default: return { bg: darkMode ? 'bg-neutral-800' : 'bg-neutral-100', text: darkMode ? '#9CA3AF' : '#6B7280' };
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return { bg: darkMode ? 'bg-[#34D19C]/20' : 'bg-[#34D19C]/10', text: '#34D19C' };
      case 'inactive': return { bg: darkMode ? 'bg-neutral-800' : 'bg-neutral-100', text: darkMode ? '#9CA3AF' : '#6B7280' };
      case 'locked': return { bg: darkMode ? 'bg-[#F08FAE]/20' : 'bg-[#F08FAE]/10', text: '#F08FAE' };
      default: return { bg: darkMode ? 'bg-neutral-800' : 'bg-neutral-100', text: darkMode ? '#9CA3AF' : '#6B7280' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto mb-4 text-primary-500" />
          <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Loading security data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl p-8 text-center ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
        <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button onClick={handleRefresh} className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-2">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${darkMode ? 'bg-primary-900/30' : 'bg-primary-300'}`}>
            <Shield size={24} className="text-white dark:text-primary-400" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              Security Center
            </h1>
            <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Manage security settings and monitor activity
            </p>
          </div>
        </div>
        
        {/* ✅ Header فارغ من الأزرار (لا يوجد Refresh هنا) */}
      </div>

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Sessions"
          value={securityStats.active_sessions || 0}
          icon={<Activity size={20} />}
          subtitle="Currently logged in"
          variant="success"
           darkMode={darkMode}
          lightBgOpacity={0.6}
        />

        <MetricCard
          title="Failed Logins"
          value={securityStats.failed_logins_today || 0}
          icon={<AlertTriangle size={20} />}
          subtitle={`${securityStats.failed_logins_week || 0} this week`}
          variant="primary"
          darkMode={darkMode}
          lightBgOpacity={0.6}
        />

        <MetricCard
          title="Total Users"
          value={securityStats.total_users || 0}
          icon={<Users size={20} />}
          subtitle={`${securityStats.admin_users || 0} admins`}
          variant="secondary"
          darkMode={darkMode}
        />

        <MetricCard
          title="Locked Accounts"
          value={securityStats.locked_users || 0}
          icon={<ShieldAlert size={20} />}
          subtitle="Need attention"
          variant="warning"
          darkMode={darkMode}
        />
      </div>

      {/* ===== TABS ===== */}
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-2xl blur-xl"></div>
        <div className={`relative p-1.5 rounded-2xl backdrop-blur-sm
          ${darkMode
            ? 'bg-neutral-800/50 border border-neutral-700/50'
            : 'bg-white/50 border border-neutral-200/50 shadow-sm'}`}
        >
          <div
            className="absolute inset-y-1.5 left-1.5 bg-primary-300 rounded-xl transition-all duration-500 ease-out"
            style={{
              transform: `translateX(${tabs.findIndex(t => t.id === activeTab) * 100}%)`,
              width: `calc((100% - ${tabs.length * 2}px)/${tabs.length})`
            }}
          />

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
                    ${darkMode ? 'bg-white/5' : 'bg-neutral-900/5'}
                  `}></div>
                  <div className={`relative transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    <Icon size={18} className={`transition-all duration-300 ${isActive ? 'text-white drop-shadow-lg' : darkMode ? 'text-neutral-400 group-hover:text-neutral-200' : 'text-neutral-500 group-hover:text-neutral-700'}`} />
                  </div>
                  <span className={`relative hidden sm:inline-block transition-all duration-300 ${isActive ? 'tracking-wide font-semibold' : 'group-hover:tracking-wide'}`}>
                    {tab.label}
                  </span>
                  <span className={`sm:hidden absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full transition-all duration-300 ${isActive ? 'bg-white scale-100' : 'scale-0'}`}></span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== CONTENT AREA ===== */}
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
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800 transform transition-all duration-500 hover:translate-x-1">
            <div className={`
              relative p-3 rounded-xl overflow-hidden transition-all duration-500 group
              ${darkMode ? 'bg-primary-500/20' : 'bg-primary-100'}
            `}>
              {activeTab === 'overview' && <Gauge size={24} className="relative z-10 text-primary-800/80 dark:text-primary-400 transform group-hover:rotate-12 transition-transform duration-500" />}
              {activeTab === 'users' && <Users size={24} className="relative z-10 text-primary-800/80 dark:text-primary-400 transform group-hover:rotate-12 transition-transform duration-500" />}
              {activeTab === 'sessions' && <Activity size={24} className="relative z-10 text-primary-800/80 dark:text-primary-400 transform group-hover:rotate-12 transition-transform duration-500" />}
              {activeTab === 'logs' && <ShieldAlert size={24} className="relative z-10 text-primary-800/80 dark:text-primary-400 transform group-hover:rotate-12 transition-transform duration-500" />}
              {activeTab === '2fa' && <Fingerprint size={24} className="relative z-10 text-primary-800/80 dark:text-primary-400 transform group-hover:rotate-12 transition-transform duration-500" />}
            </div>
            <div className="flex-1">
              <h3 className={`text-xl font-bold transition-all duration-300 ${darkMode ? 'text-white' : 'text-neutral-900'} hover:translate-x-1`}>
                {activeTab === 'overview' && 'Security Overview'}
                {activeTab === 'users' && 'User Management'}
                {activeTab === 'sessions' && 'Active Sessions'}
                {activeTab === 'logs' && 'Security Events'}
                {activeTab === '2fa' && 'Two-Factor Authentication'}
              </h3>
              <p className={`text-sm mt-1 transition-all duration-300 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                {activeTab === 'overview' && 'Current security status and recommendations'}
                {activeTab === 'users' && 'Manage user accounts and permissions'}
                {activeTab === 'sessions' && 'Currently logged in users and devices'}
                {activeTab === 'logs' && 'Monitor security-related events'}
                {activeTab === '2fa' && 'Manage 2FA settings for users'}
              </p>
            </div>
          </div>

          {/* ===== OVERVIEW TAB ===== */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Security Score */}
              <div className={`p-6 rounded-2xl transition-all duration-300 hover:shadow-xl
                ${darkMode 
                  ? 'bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 border border-neutral-700/50' 
                  : 'bg-gradient-to-br from-white to-neutral-50/80 border border-neutral-200/50 shadow-md'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2.5 rounded-xl`} style={{ backgroundColor: `${colors.primary}20` }}>
                    <Shield size={20} style={{ color: colors.primary }} />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                      Security Score
                    </h4>
                    <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Overall security health
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="relative w-44 h-44">
                    <svg className="w-full h-full" viewBox="0 -10 120 130">
                      <circle
                        className="text-neutral-200 dark:text-neutral-700"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="55"
                        cy="55"
                      />
                      <circle
                        className="transition-all duration-1000"
                        strokeWidth="10"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="55"
                        cy="55"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - (securityScore / 100))}`}
                        transform="rotate(-90 55 55)"
                        style={{ color: securityGrade.color }}
                      />
                      <text x="55" y="50" textAnchor="middle" dy=".3em" 
                        className="text-3xl font-bold"
                        style={{ fill: securityGrade.color }}
                      >
                        {securityScore}
                      </text>
                      <text x="55" y="75" textAnchor="middle" 
                        className={`text-[10px] font-semibold ${darkMode ? 'fill-neutral-400' : 'fill-neutral-400'}`}
                      >
                        out of 100
                      </text>
                    </svg>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-7">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: securityGrade.color }} />
                    <span className={`text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                      Status: <span style={{ color: securityGrade.color, fontWeight: 'bold' }}>{securityGrade.label}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-10 mt-1">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1 gap-1.5">
                        <Users size={14} style={{ color: colors.primary }} />
                        <p className={`text-xs font-semibold ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Active</p>
                      </div>
                      <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-neutral-600'}`}>
                        {Math.round((securityStats.total_users > 0 ? (securityStats.active_users / securityStats.total_users) * 100 : 0))}%
                      </p>
                    </div>
                    <div className="w-px h-8" style={{ backgroundColor: darkMode ? '#374151' : '#e5e7eb' }}></div>
                    <div className="text-center">
                      <div className="flex items-center justify-cente mb-1 gap-1.5">
                        <Fingerprint size={14} style={{ color: colors.success }} />
                        <p className={`text-xs font-semibold ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>2FA</p>
                      </div>
                      <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-neutral-600'}`}>
                        {Math.round((securityStats.total_users > 0 ? (securityStats.two_factor_enabled / securityStats.total_users) * 100 : 0))}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Recommendations */}
              <div className={`p-6 rounded-2xl transition-all duration-300 hover:shadow-xl
                ${darkMode 
                  ? 'bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 border border-neutral-700/50' 
                  : 'bg-gradient-to-br from-white to-neutral-50/80 border border-neutral-200/50 shadow-md'
                }`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2.5 rounded-xl`} style={{ backgroundColor: `${colors.primary}20` }}>
                    <AlertTriangle size={20} style={{ color: colors.primary}} />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                      Security Recommendations
                    </h4>
                    <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      Action items to improve security
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* 2FA Status */}
                  <div className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 hover:scale-[1.01]
                    ${darkMode 
                      ? 'bg-neutral-700/30 hover:bg-neutral-700/50 border border-neutral-700/30' 
                      : 'bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${securityStats.two_factor_enabled > 0 ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                        {securityStats.two_factor_enabled > 0 ? (
                          <CheckCircle size={16} style={{ color: colors.success }} />
                        ) : (
                          <AlertCircle size={16} style={{ color: colors.accent }} />
                        )}
                      </div>
                      <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        {securityStats.two_factor_enabled} users with 2FA
                      </span>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${securityStats.two_factor_enabled > 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
                      {securityStats.two_factor_enabled > 0 ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {/* Active Users */}
                  <div className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 hover:scale-[1.01]
                    ${darkMode 
                      ? 'bg-neutral-700/30 hover:bg-neutral-700/50 border border-neutral-700/30' 
                      : 'bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${colors.success}20` }}>
                        <Users size={16} style={{ color: colors.success }} />
                      </div>
                      <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        {securityStats.active_users} active users
                      </span>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full text-emerald-500 bg-emerald-500/10">
                      Active
                    </span>
                  </div>
                  
                  {/* Locked Accounts */}
                  <div className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 hover:scale-[1.01]
                    ${darkMode 
                      ? 'bg-neutral-700/30 hover:bg-neutral-700/50 border border-neutral-700/30' 
                      : 'bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${securityStats.locked_users === 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                        {securityStats.locked_users === 0 ? (
                          <CheckCircle size={16} style={{ color: colors.success }} />
                        ) : (
                          <Lock size={16} style={{ color: colors.secondary }} />
                        )}
                      </div>
                      <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        {securityStats.locked_users} locked accounts
                      </span>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${securityStats.locked_users === 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                      {securityStats.locked_users === 0 ? 'Clear' : 'Attention'}
                    </span>
                  </div>
                  
                  {/* Failed Logins */}
                  <div className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 hover:scale-[1.01]
                    ${darkMode 
                      ? 'bg-neutral-700/30 hover:bg-neutral-700/50 border border-neutral-700/30' 
                      : 'bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${securityStats.failed_logins_today === 0 ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                        {securityStats.failed_logins_today === 0 ? (
                          <CheckCircle size={16} style={{ color: colors.success }} />
                        ) : (
                          <AlertTriangle size={16} style={{ color: colors.accent }} />
                        )}
                      </div>
                      <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        {securityStats.failed_logins_today} failed attempts today
                      </span>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${securityStats.failed_logins_today === 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
                      {securityStats.failed_logins_today === 0 ? 'Safe' : 'Alert'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== USERS TAB ===== */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`text-xs font-semibold ${darkMode ? 'bg-neutral-800/50 text-neutral-400' : 'bg-neutral-100/50 text-neutral-600'}`}>
                    <th className="text-left py-3 px-4 rounded-l-lg">User</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Last Login</th>
                    <th className="text-left py-3 px-4 rounded-r-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const statusColors = getStatusColor(user.is_active ? 'active' : 'locked');
                    return (
                      <tr key={user.id} className={`border-t ${darkMode ? 'border-neutral-800/50 hover:bg-neutral-800/20' : 'border-neutral-200/50 hover:bg-neutral-100/30'} transition-colors`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}>
                              <User size={14} className={darkMode ? 'text-neutral-400' : 'text-neutral-600'} />
                            </div>
                            <div>
                              <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-neutral-900'}`}>{user.username}</p>
                              <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                            {user.is_superuser ? 'Admin' : user.is_staff ? 'Staff' : 'User'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${statusColors.bg}`} style={{ color: statusColors.text }}>
                            {user.is_active ? <UserCheck size={10} /> : <UserX size={10} />}
                            {user.is_active ? 'Active' : 'Locked'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                            {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {user.is_active ? (
                              <button 
                                onClick={() => handleLockUser(user.id)}
                                className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors text-amber-500"
                                title="Lock user"
                              >
                                <Lock size={14} />
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleUnlockUser(user.id)}
                                className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors text-emerald-500"
                                title="Unlock user"
                              >
                                <Unlock size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ===== SESSIONS TAB ===== */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              {/* قائمة الجلسات */}
              {sessions.map((session) => (
                <div key={session.id} className={`p-4 rounded-xl border ${darkMode ? 'border-neutral-700/50 hover:border-neutral-600/50' : 'border-neutral-200/50 hover:border-neutral-300/50'} transition-all hover:shadow-md`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-primary-500/20' : 'bg-primary-100'}`}>
                        {session.device_type === 'Mobile' ? (
                          <Smartphone size={16} className="text-primary-500" />
                        ) : session.device_type === 'Tablet' ? (
                          <Tablet size={16} className="text-primary-500" />
                        ) : (
                          <Monitor size={16} className="text-primary-500" />
                        )}
                      </div>
                      <div>
                        <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-neutral-900'}`}>{session.user_name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs">
                          <span className={darkMode ? 'text-neutral-400' : 'text-neutral-600'}>{session.device_type}</span>
                          <span className="text-neutral-400">•</span>
                          <span className={darkMode ? 'text-neutral-400' : 'text-neutral-600'}>{session.ip_address}</span>
                          <span className="text-neutral-400">•</span>
                          <span className={darkMode ? 'text-neutral-400' : 'text-neutral-600'}>{session.location || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        {session.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <button 
                        onClick={() => handleTerminateSession(session.id)}
                        className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors text-red-500"
                        title="Terminate session"
                      >
                        <LogOut size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ===== SECURITY LOGS TAB ===== */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              {logs.map((log) => {
                const severityColors = getSeverityColor(log.severity);
                return (
                  <div key={log.id} className={`p-4 rounded-xl border ${darkMode ? 'border-neutral-700/50' : 'border-neutral-200/50'}`}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ background: severityColors.bg }}>
                          {log.severity === 'critical' && <ShieldAlert size={16} style={{ color: severityColors.text }} />}
                          {log.severity === 'warning' && <AlertTriangle size={16} style={{ color: severityColors.text }} />}
                          {log.severity === 'info' && <ShieldCheck size={16} style={{ color: severityColors.text }} />}
                        </div>
                        <div>
                          <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-neutral-900'}`}>{log.event_display}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs">
                            <span className={darkMode ? 'text-neutral-400' : 'text-neutral-600'}>{log.user_name}</span>
                            <span className="text-neutral-400">•</span>
                            <span className={darkMode ? 'text-neutral-400' : 'text-neutral-600'}>{log.ip_address || 'N/A'}</span>
                            <span className="text-neutral-400">•</span>
                            <span className={darkMode ? 'text-neutral-400' : 'text-neutral-600'}>{log.location || 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{log.time_ago}</span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium`} style={{ background: severityColors.bg, color: severityColors.text }}>
                          {log.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ===== 2FA TAB ===== */}
          {activeTab === '2fa' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-5 rounded-xl ${darkMode ? 'bg-neutral-700/30' : 'bg-neutral-50/80'} border ${darkMode ? 'border-neutral-700/50' : 'border-neutral-200/50'}`}>
                <h4 className={`font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-primary-500/20' : 'bg-primary-100'}`}>
                    <Fingerprint size={18} className="text-primary-500 dark:text-primary-400" />
                  </div>
                  2FA Statistics
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-1 border-b border-dashed border-neutral-200 dark:border-neutral-700">
                    <span className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Enabled</span>
                    <span className={`text-sm font-medium text-[#34D19C]`}>{securityStats.two_factor_enabled || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-dashed border-neutral-200 dark:border-neutral-700">
                    <span className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Disabled</span>
                    <span className={`text-sm font-medium text-[#EE9C6C]`}>{(securityStats.total_users || 0) - (securityStats.two_factor_enabled || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-dashed border-neutral-200 dark:border-neutral-700 last:border-0">
                    <span className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Total Users</span>
                    <span className={`text-sm font-medium text-[#8B7ABA]`}>{securityStats.total_users || 0}</span>
                  </div>
                </div>
              </div>

              <div className={`p-5 rounded-xl ${darkMode ? 'bg-neutral-700/30' : 'bg-neutral-50/80'} border ${darkMode ? 'border-neutral-700/50' : 'border-neutral-200/50'}`}>
                <h4 className={`font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-primary-500/20' : 'bg-primary-100'}`}>
                    <Key size={18} className="text-primary-500 dark:text-primary-400" />
                  </div>
                  2FA Methods
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-1 border-b border-dashed border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center gap-2">
                      <Fingerprint size={14} className="text-primary-500" />
                      <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Authenticator App</span>
                    </div>
                    <span className="text-sm font-medium text-[#34D19C]">98%</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-dashed border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-secondary-500" />
                      <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>Email</span>
                    </div>
                    <span className="text-sm font-medium text-[#34D19C]">45%</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-dashed border-neutral-200 dark:border-neutral-700 last:border-0">
                    <div className="flex items-center gap-2">
                      <Smartphone size={14} className="text-accent-500" />
                      <span className={`text-sm ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>SMS</span>
                    </div>
                    <span className="text-sm font-medium text-[#34D19C]">23%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

 {/* ===== ACTION BUTTONS ===== */}
<div className="flex items-center justify-end gap-3">
  
  {/* ✅ أزرار إدارة الجلسات - تظهر فقط في تبويب Sessions */}
  {activeTab === 'sessions' && (
    <>
      <button
        onClick={handleClearMySessions}
        disabled={cleaning}
        className="group relative overflow-hidden px-6 py-3 rounded-lg 
                 text-white text-base font-semibold shadow-xl hover:shadow-xl
                 transition-all hover:-translate-y-0.5 active:scale-95
                 disabled:opacity-50 disabled:cursor-not-allowed
                 flex items-center gap-2"
        style={{ background: colors.secondary }}
      >
        <span className="relative z-10 flex items-center gap-2">
          <LogOut size={18} />
          <span>Clear My Sessions</span>
        </span>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl"
             style={{ background: `linear-gradient(135deg, ${colors.secondary}80, ${colors.secondary})` }} />
      </button>

      <button
        onClick={handleCleanupSessions}
        disabled={cleaning}
        className="group relative overflow-hidden px-6 py-3 rounded-lg 
                 text-white text-base font-semibold shadow-xl hover:shadow-xl
                 transition-all hover:-translate-y-0.5 active:scale-95
                 disabled:opacity-50 disabled:cursor-not-allowed
                 flex items-center gap-2"
        style={{ background: colors.accent }}
      >
        <span className="relative z-10 flex items-center gap-2">
          <Trash2 size={18} className={cleaning ? 'animate-spin' : ''} />
          <span>{cleaning ? 'Cleaning...' : 'Cleanup Sessions'}</span>
        </span>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl"
             style={{ background: `linear-gradient(135deg, ${colors.accent}80, ${colors.accent})` }} />
      </button>
    </>
  )}

  {/* ✅ زر تنظيف السجلات - يظهر فقط في تبويب Logs */}
  {activeTab === 'logs' && (
    <button
      onClick={handleCleanupLogs}
      disabled={cleaningLogs}
      className="group relative overflow-hidden px-6 py-3 rounded-lg 
               text-white text-base font-semibold shadow-xl hover:shadow-xl
               transition-all hover:-translate-y-0.5 active:scale-95
               disabled:opacity-50 disabled:cursor-not-allowed
               flex items-center gap-2"
      style={{ background: colors.secondary }}
    >
      <span className="relative z-10 flex items-center gap-2">
        <Trash2 size={18} className={cleaningLogs ? 'animate-spin' : ''} />
        <span>{cleaningLogs ? 'Cleaning...' : 'Cleanup Old Logs'}</span>
      </span>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl"
           style={{ background: `linear-gradient(135deg, ${colors.secondary}80, ${colors.secondary})` }} />
    </button>
  )}

{/* ✅ زر Refresh - يظهر في جميع التبويبات */}
  <button
    onClick={handleRefresh}
    disabled={refreshing}
    className="group relative overflow-hidden px-6 py-3 rounded-lg 
             text-white text-base font-semibold shadow-xl hover:shadow-xl
             transition-all hover:-translate-y-0.5 active:scale-95
             disabled:opacity-50 disabled:cursor-not-allowed"
    style={{ background: colors.primary }}
  >
    <span className="relative z-10 flex items-center gap-2">
      <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
      <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
    </span>
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl"
         style={{ background: `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})` }} />
  </button>

</div>
    </div>
  );
};

export default SecurityPage;