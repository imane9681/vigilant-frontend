// frontend/src/pages/Database/components/DatabaseHeader.jsx
import React from 'react';
import { Database, RefreshCw } from 'lucide-react';

const DatabaseHeader = ({ darkMode, refreshing, onRefresh }) => {
  return (
    <div className="flex items-center gap-3">
      <div className={`p-2.5 rounded-xl ${darkMode ? 'bg-primary-900/30' : 'bg-primary-300'}`}>
        <Database size={24} className="text-white dark:text-primary-400" />
      </div>
      <div>
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
          Database Management
        </h1>
        <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
          Manage your database, run queries, and monitor performance
        </p>
      </div>
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
        style={{ background: darkMode ? '#374151' : '#f3f4f6', color: darkMode ? '#fff' : '#374151' }}
      >
        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        Refresh
      </button>
    </div>
  );
};

export default DatabaseHeader;