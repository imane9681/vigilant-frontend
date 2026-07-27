// frontend/src/pages/Database/components/BackupsTab.jsx
import React from 'react';
import { Archive, Loader2, Database, RotateCw, Download, Trash2 } from 'lucide-react';

const BackupsTab = ({ 
  darkMode, 
  backups, 
  onDeleteBackup, 
  onDownloadBackup, 
  onRestoreBackup 
}) => {
  return (
    <div className="space-y-3">
      {backups.length === 0 ? (
        <div className="text-center py-8">
          <Archive size={48} className="mx-auto mb-4 opacity-30" />
          <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>No backups available</p>
        </div>
      ) : (
        backups.map((backup) => (
          <div key={backup.id} className={`p-4 rounded-xl border ${darkMode ? 'border-neutral-700/50 hover:border-neutral-600/50' : 'border-neutral-200/50 hover:border-neutral-300/50'} transition-all hover:shadow-md`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${backup.type === 'full' ? 'bg-primary-500/20' : 'bg-success-500/20'}`}>
                  {backup.type === 'full' ? <Database size={16} className="text-primary-500" /> : <Archive size={16} className="text-success-500" />}
                </div>
                <div>
                  <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-neutral-900'}`}>{backup.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className={darkMode ? 'text-neutral-400' : 'text-neutral-500'}>{new Date(backup.created_at).toLocaleString()}</span>
                    <span className="text-neutral-400">•</span>
                    <span className={darkMode ? 'text-neutral-400' : 'text-neutral-500'}>{backup.size_display}</span>
                    <span className="text-neutral-400">•</span>
                    <span className={`capitalize ${backup.type === 'full' ? 'text-primary-500' : 'text-success-500'}`}>{backup.type}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  backup.status === 'completed' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : backup.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {backup.status}
                </span>
                
                {/* ✅ زر الاستعادة */}
                <button 
                  onClick={() => onRestoreBackup(backup.id)}
                  disabled={backup.status !== 'completed'}
                  className={`p-2 rounded-lg transition-all hover:scale-110 ${
                    darkMode ? 'hover:bg-neutral-700 text-neutral-400 hover:text-white' : 'hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700'
                  } ${backup.status !== 'completed' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Restore backup"
                >
                  <RotateCw size={14} />
                </button>
                
                {/* ✅ زر التحميل */}
                <button 
                  onClick={() => onDownloadBackup(backup)}
                  className={`p-2 rounded-lg transition-all hover:scale-110 ${
                    darkMode ? 'hover:bg-neutral-700 text-neutral-400 hover:text-white' : 'hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700'
                  }`}
                  title="Download backup"
                >
                  <Download size={14} />
                </button>
                
                {/* ✅ زر الحذف */}
                <button 
                  onClick={() => onDeleteBackup(backup.id)}
                  className={`p-2 rounded-lg transition-all hover:scale-110 ${
                    darkMode ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300' : 'hover:bg-red-100 text-red-500 hover:text-red-700'
                  }`}
                  title="Delete backup"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default BackupsTab;