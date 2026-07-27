// frontend/src/pages/Database/components/OverviewTab.jsx
import React from 'react';
import { Server, Clock, BarChart3, CheckCircle } from 'lucide-react';

const OverviewTab = ({ darkMode, dbStats, backups }) => {
  const colors = { primary: '#8B7ABA', secondary: '#F08FAE', accent: '#EE9C6C', success: '#34D19C' };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Database Information */}
      <div className={`p-5 rounded-xl ${darkMode ? 'bg-neutral-700/30' : 'bg-neutral-50/80'} border ${darkMode ? 'border-neutral-700/50' : 'border-neutral-200/50'}`}>
        <h4 className={`font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
          <Server size={18} className="text-primary-500" /> Database Information
        </h4>
        <div className="space-y-3">
          {[
            { label: 'Version', value: 'SQLite 3' },
            { label: 'Engine', value: 'SQLite' },
            { label: 'Collation', value: 'UTF-8' },
            { label: 'Total Size', value: dbStats.size },
            { label: 'Active Connections', value: dbStats.connections },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center py-1 border-b border-dashed border-neutral-200 dark:border-neutral-700 last:border-0">
              <span className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{item.label}</span>
              <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Backup Schedule */}
      <div className={`p-5 rounded-xl ${darkMode ? 'bg-neutral-700/30' : 'bg-neutral-50/80'} border ${darkMode ? 'border-neutral-700/50' : 'border-neutral-200/50'}`}>
        <h4 className={`font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
          <Clock size={18} className="text-primary-500" /> Backup Schedule
        </h4>
        <div className="space-y-3">
          {[
            { label: 'Last Backup', value: dbStats.lastBackup, icon: CheckCircle, color: colors.success },
            { label: 'Next Backup', value: dbStats.nextBackup, icon: Clock, color: colors.accent },
            { label: 'Auto Backup', value: 'Enabled', color: colors.success },
            { label: 'Total Backups', value: backups.length },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center py-1 border-b border-dashed border-neutral-200 dark:border-neutral-700 last:border-0">
              <span className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{item.label}</span>
              <span className={`text-sm font-medium flex items-center gap-1.5`} style={{ color: item.color || (darkMode ? '#fff' : '#111') }}>
                {item.icon && <item.icon size={14} />} {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className={`lg:col-span-2 p-5 rounded-xl ${darkMode ? 'bg-neutral-700/30' : 'bg-neutral-50/80'} border ${darkMode ? 'border-neutral-700/50' : 'border-neutral-200/50'}`}>
        <h4 className={`font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
          <BarChart3 size={18} className="text-primary-500" /> Performance at a Glance
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {[
            { label: 'Cache Hit Ratio', value: dbStats.cacheHit, color: colors.success, width: parseFloat(dbStats.cacheHit) || 0 },
            { label: 'Query Performance', value: '92%', color: colors.primary, width: 92 },
            { label: 'Index Usage', value: '87%', color: colors.secondary, width: 87 },
            { label: 'Connection Usage', value: '8%', color: colors.accent, width: 8 },
          ].map((metric, idx) => (
            <div key={idx} className="text-center">
              <div className="flex justify-between text-sm mb-3">
                <span className={darkMode ? 'text-neutral-400' : 'text-neutral-600'}>{metric.label}</span>
                <span className={`font-medium`} style={{ color: metric.color }}>{metric.value}</span>
              </div>
              <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${metric.width}%`, backgroundColor: metric.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;