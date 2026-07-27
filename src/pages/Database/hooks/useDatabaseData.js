// frontend/src/pages/Database/hooks/useDatabaseData.js
import { useState, useEffect, useCallback } from 'react';
import { databaseService } from '../../../services/api';

export const useDatabaseData = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dbStats, setDbStats] = useState({
    size: '0 MB', tables: 0, records: '0', indexes: 0,
    queries: '0/s', connections: 0, cacheHit: '0%', uptime: '0%',
    lastBackup: 'Never', nextBackup: 'Scheduled'
  });
  const [tables, setTables] = useState([]);
  const [backups, setBackups] = useState([]);
  const [queryStats, setQueryStats] = useState(null);
  const [recentQueries, setRecentQueries] = useState([]);

  const fetchAllData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      
      const [statsRes, tablesRes, backupsRes, queryStatsRes] = await Promise.all([
        databaseService.getStats(),
        databaseService.getTables(),
        databaseService.getBackups(),
        databaseService.getQueryStats(),
      ]);
      
      const stats = statsRes.data;
      setDbStats({
        size: stats.size_display || '0 MB',
        tables: stats.tables || 0,
        records: (stats.records || 0).toLocaleString(),
        indexes: stats.indexes || 0,
        queries: `${stats.queries || 0}/s`,
        connections: stats.connections || 0,
        cacheHit: stats.cacheHit || '0%',
        uptime: stats.uptime || '0%',
        lastBackup: stats.lastBackup || 'Never',
        nextBackup: stats.nextBackup || 'Scheduled'
      });
      setTables(tablesRes.data || []);
      setBackups(backupsRes.data || []);
      setQueryStats(queryStatsRes.data);
      setRecentQueries(queryStatsRes.data?.recent_queries || []);
    } catch (err) {
      setError('Failed to load database data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  return { loading, refreshing, error, dbStats, tables, backups, queryStats, recentQueries, fetchAllData };
};