// src/pages/Dashboard/components/UpdatesWidget.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, Clock, ExternalLink, TrendingUp, Package, Users,
  ShoppingBag, AlertTriangle, CheckCircle, Loader2,
  RefreshCw, AlertCircle, User, UserPlus, Award, DollarSign
} from 'lucide-react';
import IconWrapper from '../../../components/ui/IconWrapper';
import { notificationService } from '../../../services/api';

const UpdatesWidget = ({ darkMode }) => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchUpdates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await notificationService.getAll();
      const notifications = response.data;
      
      
      const formattedUpdates = notifications.slice(0, 3).map(notification => {
        let icon = Bell;
        let iconBg = 'primary';
        let badge = 'update';
        
        switch(notification.type) {
          case 'order':
            icon = ShoppingBag;
            iconBg = 'purple';
            badge = 'order';
            break;
          case 'stock':
            icon = notification.icon === 'AlertCircle' ? AlertCircle : Package;
            iconBg = notification.icon === 'AlertCircle' ? 'rose' : 'amber';
            badge = notification.icon === 'AlertCircle' ? 'critical' : 'warning';
            break;
          case 'system':
            if (notification.icon === 'UserPlus') {
              icon = UserPlus;
              iconBg = 'emerald';
              badge = 'new';
            } else if (notification.icon === 'User') {
              icon = User;
              iconBg = 'amber';
              badge = 'milestone';
            } else if (notification.icon === 'Award') {
              icon = Award;
              iconBg = 'emerald';
              badge = 'achieved';
            } else if (notification.icon === 'DollarSign') {
              icon = DollarSign;
              iconBg = 'amber';
              badge = 'achieved';
            } else if (notification.icon === 'TrendingUp') {
              icon = TrendingUp;
              iconBg = 'purple';
              badge = 'achieved';
            } else {
              icon = AlertCircle;
              iconBg = 'blue';
              badge = 'system';
            }
            break;
          case 'promotion':
            icon = TrendingUp;
            iconBg = 'emerald';
            badge = 'promotion';
            break;
          default:
            icon = Bell;
            iconBg = 'primary';
            badge = 'update';
        }
        
        const timeAgo = notification.time_ago || 'Just now';
        let linkUrl = notification.link || '#';
        if (linkUrl && !linkUrl.startsWith('/')) {
          linkUrl = `/${linkUrl}`;
        }
        
        return {
          id: notification.id,
          icon: icon,
          iconBg: iconBg,
          title: notification.title,
          description: notification.message,
          time: timeAgo,
          badge: badge,
          link: linkUrl,
          isRead: notification.is_read,
          type: notification.type,
          color: notification.color
        };
      });
      
      setUpdates(formattedUpdates);
      setLastUpdated(new Date().toLocaleString());
      
    } catch (err) {
      console.error('❌ Error fetching updates:', err);
      setError('Failed to load updates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  const newCount = updates.filter(u => !u.isRead).length;

  const getIconBgColor = (iconBg) => {
    switch(iconBg) {
      case 'emerald': return darkMode ? 'bg-emerald-900/30' : 'bg-emerald-100';
      case 'purple': return darkMode ? 'bg-purple-900/30' : 'bg-purple-100';
      case 'amber': return darkMode ? 'bg-amber-900/30' : 'bg-amber-100';
      case 'rose': return darkMode ? 'bg-rose-900/30' : 'bg-rose-100';
      case 'blue': return darkMode ? 'bg-blue-900/30' : 'bg-blue-100';
      default: return darkMode ? 'bg-primary-900/30' : 'bg-primary-100';
    }
  };

  const getIconTextColor = (iconBg) => {
    switch(iconBg) {
      case 'emerald': return 'text-emerald-600 dark:text-emerald-400';
      case 'purple': return 'text-purple-600 dark:text-purple-400';
      case 'amber': return 'text-amber-600 dark:text-amber-400';
      case 'rose': return 'text-rose-600 dark:text-rose-400';
      case 'blue': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-primary-600 dark:text-primary-400';
    }
  };

  const getBadgeColor = (badge) => {
    switch(badge) {
      case 'order': return darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700';
      case 'critical': return darkMode ? 'bg-rose-900/30 text-rose-400' : 'bg-rose-100 text-rose-700';
      case 'warning': return darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700';
      case 'promotion': return darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700';
      case 'system': return darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700';
      case 'new': return darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700';
      case 'milestone': return darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700';
      case 'achieved': return darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700';
      default: return darkMode ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-100 text-neutral-600';
    }
  };

  if (loading) {
    return (
      <div className={`rounded-xl p-6 transition-all duration-300 min-h-[350px] flex items-center justify-center ${darkMode ? 'bg-gradient-card-dark border border-neutral-800' : 'bg-gradient-card border border-neutral-200 shadow-xl'}`}>
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-3 text-primary-500" />
          <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Loading updates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-xl p-6 transition-all duration-300 min-h-[350px] flex items-center justify-center ${darkMode ? 'bg-gradient-card-dark border border-neutral-800' : 'bg-gradient-card border border-neutral-200 shadow-xl'}`}>
        <div className="text-center">
          <AlertCircle size={32} className="mx-auto mb-3 text-amber-500" />
          <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>{error}</p>
          <button onClick={fetchUpdates} className="mt-3 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 mx-auto">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-6 transition-all duration-300 ${
          darkMode 
            ? 'bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border-neutral-800 hover:border-primary-500/30' 
            : 'bg-gradient-to-br from-white to-neutral-50 border-neutral-200/80 hover:border-primary-200 shadow-lg hover:shadow-2xl'
        }`}      >
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <IconWrapper darkMode={darkMode} variant="primary" size={20}>
            <Bell />
          </IconWrapper>
          <div>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>Updates</h3>
            <p className={`text-xs mt-0.5 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              {newCount > 0 ? `${newCount} new notification${newCount > 1 ? 's' : ''}` : 'No new notifications'}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${newCount > 0 ? darkMode ? 'bg-primary-600/20 text-primary-400' : 'bg-primary-100 text-primary-700' : darkMode ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-100 text-neutral-500'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${newCount > 0 ? 'bg-primary-400 animate-pulse' : 'bg-neutral-400'}`}></div>
          {newCount > 0 ? `${newCount} New` : 'Up to date'}
        </div>
      </div>

      {/* Updates List */}
      <div className="space-y-3">
        {updates.length > 0 ? (
          updates.map((update) => {
            const Icon = update.icon;
            const iconBgColor = getIconBgColor(update.iconBg);
            const iconTextColor = getIconTextColor(update.iconBg);
            const badgeColor = getBadgeColor(update.badge);
            const linkUrl = update.link || '#';
            
            return (
              <Link
                key={update.id}
                to={linkUrl}
                className={`block p-3 rounded-lg transition-all duration-200 hover:shadow-sm ${darkMode ? 'bg-neutral-900/30 hover:bg-neutral-800/50 border border-neutral-800/50' : 'bg-white hover:bg-neutral-50 border border-neutral-200'} ${!update.isRead ? (darkMode ? 'border-primary-500/30 bg-primary-900/10' : 'border-primary-300/30 bg-primary-50/50') : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg ${iconBgColor}`}>
                    <Icon size={16} className={iconTextColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-semibold text-sm truncate ${darkMode ? 'text-white' : 'text-neutral-900'}`}>{update.title}</h4>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ${badgeColor}`}>{update.badge}</span>
                    </div>
                    <p className={`text-xs mb-1.5 line-clamp-2 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{update.description}</p>
                    <div className="flex items-center gap-1.5">
                      <div className={`p-1 rounded ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                        <Clock size={10} className={darkMode ? "text-neutral-500" : "text-neutral-400"} />
                      </div>
                      <span className={`text-[10px] ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>{update.time}</span>
                      {!update.isRead && <span className={`ml-1 w-1.5 h-1.5 rounded-full ${darkMode ? 'bg-primary-400' : 'bg-primary-500'}`}></span>}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-6">
            <Bell size={32} className="mx-auto mb-2 opacity-30" />
            <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>No updates available</p>
          </div>
        )}
      </div>

      {/* View All Button */}
      <div className={`mt-3`}>
        <Link to="/notifications" className={`flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-all duration-200 ${darkMode ? 'bg-primary-800/80 hover:bg-primary-800/70 text-white border border-primary-800/80 shadow-md hover:shadow-lg' : 'bg-primary-800/80 hover:bg-primary-800/90 text-white border border-primary-800/80 shadow-md hover:shadow-lg'}`}>
          View All <ExternalLink size={14} />
        </Link>
      </div>

      {lastUpdated && (
        <div className={`mt-4 pt-3 flex items-center justify-center text-xs gap-2 border-t ${darkMode ? 'border-neutral-800 text-neutral-500' : 'border-neutral-200 text-neutral-500'}`}>
          <Clock size={12} />
          <span>Updated: {lastUpdated}</span>
        </div>
      )}
    </div>
  );
};

export default UpdatesWidget;