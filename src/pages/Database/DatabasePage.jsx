// frontend/src/pages/Database/DatabasePage.jsx
import React, { useState } from 'react';
import { useDatabaseData } from './hooks/useDatabaseData';
import DatabaseHeader from './components/DatabaseHeader';
import DatabaseStats from './components/DatabaseStats';
import DatabaseTabs from './components/DatabaseTabs';
import OverviewTab from './components/OverviewTab';
import TablesTab from './components/TablesTab';
import BackupsTab from './components/BackupsTab';
import QueriesTab from './components/QueriesTab';
import { AlertTriangle, Loader2, RefreshCw, Save } from 'lucide-react';
import { databaseService } from '../../services/api';

const DatabasePage = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { loading, refreshing, error, dbStats, tables, backups, queryStats, recentQueries, fetchAllData } = useDatabaseData();
  const [creatingBackup, setCreatingBackup] = useState(false);

  const colors = {
    primary: '#8B7ABA',
    secondary: '#F08FAE',
    accent: '#EE9C6C',
    success: '#34D19C'
  };

  // ✅ دالة إنشاء نسخة احتياطية
  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    try {
      await databaseService.createBackup();
      await fetchAllData(true);
      alert('✅ Backup created successfully!');
    } catch (err) {
      console.error('Error creating backup:', err);
      alert('❌ Failed to create backup');
    } finally {
      setCreatingBackup(false);
    }
  };

  // ✅ دالة حذف نسخة احتياطية
  const handleDeleteBackup = async (backupId) => {
    if (!window.confirm('Are you sure you want to delete this backup?')) return;
    try {
      // ✅ استدعاء API الحذف
      await databaseService.deleteBackup(backupId);
      await fetchAllData(true);
      alert('✅ Backup deleted successfully!');
    } catch (err) {
      console.error('Error deleting backup:', err);
      alert('❌ Failed to delete backup');
    }
  };

  // ✅ دالة تحميل نسخة احتياطية
  const handleDownloadBackup = async (backup) => {
    try {
      // ✅ استدعاء API التحميل
      const response = await databaseService.downloadBackup(backup.id);
      
      // ✅ إنشاء رابط التحميل
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${backup.name}.sql`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert('✅ Backup downloaded successfully!');
    } catch (err) {
      console.error('Error downloading backup:', err);
      alert('❌ Failed to download backup');
    }
  };

  // ✅ دالة استعادة نسخة احتياطية
  const handleRestoreBackup = async (backupId) => {
    if (!window.confirm('Are you sure you want to restore this backup?')) return;
    try {
      await databaseService.restoreBackup(backupId);
      await fetchAllData(true);
      alert('✅ Backup restored successfully!');
    } catch (err) {
      console.error('Error restoring backup:', err);
      alert('❌ Failed to restore backup');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 size={40} className="animate-spin text-primary-500" /></div>;
  if (error) return (
    <div className={`rounded-2xl p-8 text-center ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
      <AlertTriangle size={48} className="mx-auto mb-4 text-red-500" />
      <p className="text-red-600 dark:text-red-400">{error}</p>
      <button onClick={() => fetchAllData(true)} className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg">Try Again</button>
    </div>
  );

  return (
    <div className="space-y-6 mt-2">
      <DatabaseHeader darkMode={darkMode} refreshing={refreshing} onRefresh={() => fetchAllData(true)} />
      <DatabaseStats darkMode={darkMode} dbStats={dbStats} />
      <DatabaseTabs darkMode={darkMode} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className={`rounded-2xl p-6 transition-all duration-300 ${darkMode ? 'bg-gradient-to-br from-neutral-800/90 to-neutral-900/90 border border-neutral-700/50' : 'bg-gradient-to-br from-white to-neutral-50/90 border border-neutral-200/50 shadow-xl'}`}>
        {activeTab === 'overview' && <OverviewTab darkMode={darkMode} dbStats={dbStats} backups={backups} />}
        {activeTab === 'tables' && <TablesTab darkMode={darkMode} tables={tables} />}
        {activeTab === 'backups' && (
          <BackupsTab 
            darkMode={darkMode} 
            backups={backups}
            onDeleteBackup={handleDeleteBackup}
            onDownloadBackup={handleDownloadBackup}
            onRestoreBackup={handleRestoreBackup}
          />
        )}
        {activeTab === 'queries' && <QueriesTab darkMode={darkMode} queryStats={queryStats} recentQueries={recentQueries} onRefresh={() => fetchAllData(true)} />}
      </div>

      {/* ✅ زر الرفرش و Backup Now في الأسفل */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => fetchAllData(true)}
          disabled={refreshing}
          className="group relative overflow-hidden px-6 py-3 rounded-lg text-white text-base font-semibold shadow-xl hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          style={{ background: colors.primary }}
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
        
        {/* ✅ زر Backup Now - موجود فقط في الأسفل */}
       {activeTab === 'backups' && (
    <button
      onClick={handleCreateBackup}
      disabled={creatingBackup}
      className="group relative overflow-hidden px-6 py-3 rounded-lg text-white text-base font-semibold shadow-xl hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      style={{ background: colors.success }}
    >
      <Save size={18} />
      <span>{creatingBackup ? 'Creating...' : 'Backup Now'}</span>
    </button>
  )}
      </div>
    </div>
  );
};

export default DatabasePage;