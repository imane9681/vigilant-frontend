// frontend/src/pages/Database/components/QueriesTab.jsx
import React, { useState } from 'react';
import { Terminal, Play, Loader2, XCircle, Clock, CheckCircle, AlertCircle, RefreshCw, Database, Activity, Trash2 } from 'lucide-react';
import { databaseService } from '../../../services/api';

const QueriesTab = ({ darkMode, queryStats, recentQueries, onRefresh }) => {
  const [queryInput, setQueryInput] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [queryHistory, setQueryHistory] = useState([]);
  const [showQueryHistory, setShowQueryHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const handleExecuteQuery = async () => {
    if (!queryInput.trim()) return alert('Please enter a SQL query');

    const dangerousKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE'];
    const hasDangerous = dangerousKeywords.some(kw => queryInput.toUpperCase().includes(kw));
    if (hasDangerous && !window.confirm(`⚠️ WARNING: Your query contains dangerous operations.\n\nQuery: ${queryInput}\n\nContinue?`)) return;

    setExecuting(true);
    setQueryResult(null);
    try {
      const response = await databaseService.executeQuery(queryInput);
      setQueryResult(response.data);
      setQueryHistory(prev => [{ id: Date.now(), query: queryInput, timestamp: new Date().toLocaleString(), status: 'success', rows: response.data.row_count }, ...prev].slice(0, 20));
      onRefresh();
    } catch (err) {
      setQueryResult({ error: err.response?.data?.error || err.message, status: 'error' });
      setQueryHistory(prev => [{ id: Date.now(), query: queryInput, timestamp: new Date().toLocaleString(), status: 'error', error: err.response?.data?.error || err.message }, ...prev].slice(0, 20));
    } finally {
      setExecuting(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  // ✅ دالة حذف سجل استعلام
  const handleDeleteQueryLog = async (logId) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this query log?')) return;
    
    setDeleting(logId);
    try {
      await databaseService.deleteQueryLog(logId);
      await onRefresh();
      alert('✅ Query log deleted successfully!');
    } catch (error) {
      console.error('Error deleting query log:', error);
      alert('❌ Failed to delete query log');
    } finally {
      setDeleting(null);
    }
  };

  // ✅ دالة مسح جميع السجلات
  const handleClearAllLogs = async () => {
    const days = prompt('Delete logs older than how many days? (default: 30)', '30');
    if (!days) return;
    
    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 0) {
      alert('❌ Please enter a valid number');
      return;
    }
    
    if (!window.confirm(`⚠️ This will delete all logs older than ${daysNum} days. Continue?`)) return;
    
    try {
      await databaseService.clearLogs(daysNum);
      await onRefresh();
      alert(`✅ Logs older than ${daysNum} days deleted successfully!`);
    } catch (error) {
      console.error('Error clearing logs:', error);
      alert('❌ Failed to clear logs');
    }
  };

  return (
    <div className="space-y-4">
      {/* ✅ أداة تنفيذ الاستعلام */}
      <div className={`p-5 rounded-xl ${darkMode ? 'bg-neutral-700/30' : 'bg-neutral-50/80'} border ${darkMode ? 'border-neutral-700/50' : 'border-neutral-200/50'}`}>
        <div className="flex items-center justify-between mb-4">
          <h4 className={`font-semibold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
            <Terminal size={18} className="text-primary-500" /> SQL Query Executor
          </h4>
          {/* ✅ أزرار History و Refresh - تصميم مميز */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowQueryHistory(!showQueryHistory)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95 ${
                darkMode 
                ? 'bg-[#8B7ABA]/20 border border-[#8B7ABA]/30 text-[#8B7ABA] hover:bg-[#8B7ABA]/30' 
                : 'bg-[#8B7ABA]/10 border border-[#8B7ABA]/20 text-[#8B7ABA] hover:bg-[#8B7ABA]/20'
              }`}
            >
              <Clock size={16} />
              History ({queryHistory.length})
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95 ${
                darkMode 
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30' 
                  : 'bg-emerald-100 border border-emerald-200 text-emerald-500 hover:bg-emerald-200'
              } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <textarea value={queryInput} onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Enter SQL query (e.g., SELECT * FROM products_product LIMIT 10)"
              className={`flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm
                ${darkMode ? 'bg-neutral-800 border-neutral-600 text-white placeholder-neutral-400' : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400'}`}
              rows="3" onKeyDown={(e) => { if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); handleExecuteQuery(); } }}
            />
            <div className="flex flex-col gap-2">
              <button onClick={handleExecuteQuery} disabled={executing || !queryInput.trim()}
                className="px-6 py-3 rounded-lg text-white font-medium transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2"
                style={{ background: '#8B7ABA' }}>
                {executing ? <><Loader2 size={16} className="animate-spin" /> Running...</> : <><Play size={16} /> Run</>}
              </button>
              <button onClick={() => setQueryInput('')} className={`px-6 py-3 rounded-lg font-medium transition-all hover:scale-105
                ${darkMode 
                  ? 'bg-[#8B7ABA]/20 border border-[#8B7ABA]/30 text-[#8B7ABA] hover:bg-[#8B7ABA]/30' 
                  : 'bg-[#8B7ABA]/10 border border-[#8B7ABA]/20 text-[#8B7ABA] hover:bg-[#8B7ABA]/20' }`}>
                <XCircle size={16} className="inline mr-1" /> Clear
              </button>
            </div>
          </div>
          <div className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
            💡 Press <kbd className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}>Shift + Enter</kbd> to execute
          </div>
        </div>

        {/* ✅ نتيجة الاستعلام */}
        {queryResult && queryResult.status !== 'error' && (
          <div className={`mt-4 p-4 rounded-xl ${
              darkMode ? 'bg-neutral-800/50 border border-neutral-700' : 'bg-white border border-neutral-200'
          }`}>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-[#34D19C]" />
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                        {queryResult.row_count} rows returned
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        ({queryResult.execution_time} ms)
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                        darkMode ? 'bg-neutral-700 text-neutral-300' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                        {queryResult.columns?.length || 0} columns
                    </span>
                    {queryResult.row_count > 50 && (
                        <span className={`text-xs px-2 py-1 rounded ${
                            darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'
                        }`}>
                            Showing 50 of {queryResult.row_count}
                        </span>
                    )}
                </div>
            </div>
            
            {/* ✅ حاوية الجدول مع تمرير أفقي ورأسي محسّن */}
            <div className={`overflow-x-auto overflow-y-auto max-h-[500px] custom-scrollbar rounded-lg border ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
                <div className="w-full max-w-[20rem]">
                <table className="w-full text-sm border-collapse table-auto">
                    <thead className="sticky top-0 z-10">
                        <tr className={`${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
                            {/* ✅ عمود رقم الصف - ثابت عند التمرير */}
                            <th className={`text-left py-2 px-3 font-semibold text-xs sticky left-0 z-20 ${
                                darkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-700'
                            } border-r ${darkMode ? 'border-neutral-700' : 'border-neutral-200'} min-w-[40px]`}>
                                #
                            </th>
                            {queryResult.columns.map((col, i) => (
                                <th 
                                    key={i} 
                                    className={`text-left py-2 px-3 font-semibold text-xs whitespace-nowrap ${
                                        darkMode ? 'text-neutral-300' : 'text-neutral-700'
                                    } ${i === 0 ? 'min-w-[150px]' : 'min-w-[120px]'}`}
                                    title={col}
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {queryResult.rows?.slice(0, 50).map((row, i) => (
                            <tr key={i} className={`border-t ${
                                darkMode ? 'border-neutral-700 hover:bg-neutral-800/50' : 'border-neutral-200 hover:bg-neutral-50'
                            } transition-colors`}>
                                {/* ✅ رقم الصف - ثابت عند التمرير */}
                                <td className={`py-2 px-3 text-xs text-center font-mono sticky left-0 ${
                                    darkMode ? 'bg-neutral-900 text-neutral-500' : 'bg-white text-neutral-400'
                                } border-r ${darkMode ? 'border-neutral-700' : 'border-neutral-200'} min-w-[40px]`}>
                                    {i + 1}
                                </td>
                                {row.map((cell, j) => (
                                    <td 
                                        key={j} 
                                        className={`py-2 px-3 text-xs font-mono max-w-[200px] truncate ${
                                            darkMode ? 'text-neutral-300' : 'text-neutral-700'
                                        }`}
                                        title={cell !== null ? String(cell) : 'NULL'}
                                    >
                                        {cell !== null ? String(cell) : <span className="text-neutral-400 italic">NULL</span>}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
            
            {/* ✅ حالة عدم وجود بيانات */}
            {queryResult.rows?.length === 0 && (
                <div className="text-center py-6">
                    <div className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        No data returned
                    </div>
                </div>
            )}
          </div>
        )}

        {/* ✅ حالة الخطأ */}
        {queryResult && queryResult.status === 'error' && (
          <div className={`mt-4 p-4 rounded-xl ${darkMode ? 'bg-red-900/20 border border-red-800/50' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-700'}`}>Error</p>
                <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>{queryResult.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* ✅ تاريخ الاستعلامات - مع زر حذف */}
        {showQueryHistory && queryHistory.length > 0 && (
          <div className={`mt-4 p-4 rounded-xl ${darkMode ? 'bg-neutral-800/50' : 'bg-neutral-50'} border ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <h5 className={`font-semibold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                <Clock size={14} /> Query History
              </h5>
              <button
                onClick={handleClearAllLogs}
                className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-all hover:scale-105 ${
                  darkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
              >
                Clear All
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto overflow-x-hidden space-y-2">
              {queryHistory.map((item) => (
                <div key={item.id} 
                  className={`p-3 rounded-lg transition-all hover:scale-[1.01] ${item.status === 'success' ? darkMode ? 'bg-green-900/20 border border-green-800/30' : 'bg-green-50 border border-green-200' : darkMode ? 'bg-red-900/20 border border-red-800/30' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => setQueryInput(item.query)}>
                      <code className={`text-xs font-mono truncate max-w-md ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        {item.query.length > 60 ? item.query.substring(0, 60) + '...' : item.query}
                      </code>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>{item.timestamp}</span>
                        {item.status === 'success' ? (
                          <span className="text-xs text-green-500">{item.rows} rows</span>
                        ) : (
                          <span className="text-xs text-red-500">Failed</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteQueryLog(item.id)}
                      disabled={deleting === item.id}
                      className={`p-1.5 rounded-lg transition-all hover:scale-110 ${
                        darkMode ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300' : 'hover:bg-red-100 text-red-500 hover:text-red-700'
                      } ${deleting === item.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Delete this log"
                    >
                      {deleting === item.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ✅ إحصائيات الاستعلامات */}
      <div className={`flex flex-wrap items-center gap-6 p-4 rounded-xl border ${darkMode ? 'border-neutral-700/50 bg-neutral-800/20' : 'border-neutral-200/50 bg-neutral-50/30'}`}>
        {/* ✅ Total Queries */}
        <div className="flex items-center gap-3 flex-1 min-w-[150px]">
          <div className={`p-2.5 rounded-lg ${darkMode ? 'bg-primary-500/20' : 'bg-primary-100'}`}>
            <Database size={16} className={darkMode ? 'text-primary-300' : 'text-primary-300'} />
          </div>
          <div>
            <p className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>Total Queries</p>
            <p className={`text-base font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              {queryStats?.total_queries?.toLocaleString() || 0}
            </p>
          </div>
        </div>

        <div className={`w-px h-10 ${darkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}></div>

        {/* ✅ Slow Queries */}
        <div className="flex items-center gap-3 flex-1 min-w-[150px]">
          <div className={`p-2.5 rounded-lg ${darkMode ? 'bg-amber-500/20' : 'bg-amber-100/60'}`}>
            <Clock size={16} className={darkMode ? 'text-amber-400' : 'text-amber-600'} />
          </div>
          <div>
            <p className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>Slow Queries</p>
            <p className={`text-base font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              {queryStats?.slow_queries || 0}
            </p>
          </div>
        </div>

        <div className={`w-px h-10 ${darkMode ? 'bg-neutral-700' : 'bg-neutral-200'}`}></div>

        {/* ✅ Avg Query Time */}
        <div className="flex items-center gap-3 flex-1 min-w-[150px]">
          <div className={`p-2.5 rounded-lg ${darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100/70'}`}>
            <Activity size={16} className={darkMode ? 'text-emerald-400' : 'text-emerald-600'} />
          </div>
          <div>
            <p className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>Avg Query Time</p>
            <div className="flex items-end gap-0.5">
              <span className={`text-base font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                {queryStats?.avg_query_time || 0}
              </span>
              <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'} mb-0.5`}>ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ سجلات الاستعلامات الأخيرة - مع زر حذف */}
      <div className={`p-4 rounded-xl ${darkMode ? 'bg-neutral-700/30' : 'bg-neutral-50/80'} border ${darkMode ? 'border-neutral-700/50' : 'border-neutral-200/50'}`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-neutral-800'}`}>Recent Queries</h4>
          <div className="flex items-center gap-2">
            {recentQueries.length > 0 && (
              <button
                onClick={handleClearAllLogs}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95 ${
                  darkMode ? 'bg-red-900/30 border border-red-900 text-red-500 hover:bg-red-900/50' : 'bg-red-100 border border-red-200 text-red-400 hover:bg-red-200'
                }`}
              >
                <Trash2 size={16} />
                Clear All
              </button>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95 ${
                darkMode 
                  ? 'bg-[#8B7ABA]/20 border border-[#8B7ABA]/30 text-[#8B7ABA] hover:bg-[#8B7ABA]/30' 
                  : 'bg-[#8B7ABA]/10 border border-[#8B7ABA]/20 text-[#8B7ABA] hover:bg-[#8B7ABA]/20'
              } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
        {recentQueries.length === 0 ? (
          <div className="text-center py-6"><Terminal size={32} className="mx-auto mb-2 opacity-30" /><p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>No queries executed yet. Run a query above!</p></div>
        ) : (
          <div className={`overflow-x-auto overflow-y-auto max-h-[400px] custom-scrollbar rounded-lg border ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
            <table className="w-full text-sm border-collapse min-w-[700px]">
              <thead className="sticky top-0 z-10 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800">
                <tr className={`${darkMode ? 'bg-neutral-800/50' : 'bg-neutral-100/50'}`}>
                  <th className={`text-left py-2 px-3 font-semibold text-xs sticky left-0 z-20 ${
                    darkMode ? 'bg-neutral-800/50 text-neutral-300' : 'bg-neutral-100/50 text-neutral-700'
                  } border-r ${darkMode ? 'border-neutral-700' : 'border-neutral-200'} min-w-[80px]`}>
                    User
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-xs whitespace-nowrap min-w-[200px]">
                    Query
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-xs whitespace-nowrap min-w-[80px]">
                    Time
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-xs whitespace-nowrap min-w-[100px]">
                    Status
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-xs whitespace-nowrap min-w-[150px]">
                    Date
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-xs whitespace-nowrap min-w-[60px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentQueries.map((query) => (
                  <tr key={query.id} className={`border-t ${darkMode ? 'border-neutral-700' : 'border-neutral-200'} hover:${darkMode ? 'bg-neutral-700/50' : 'bg-neutral-50'}`}>
                    <td className={`py-2 px-3 text-xs truncate max-w-[80px] sticky left-0 ${
                      darkMode ? 'bg-neutral-900/80 text-neutral-300' : 'bg-white/80 text-neutral-700'
                    } border-r ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
                      {query.user_name || 'Anonymous'}
                    </td>
                    <td className="py-2 px-3 text-xs min-w-[200px] max-w-[300px]">
                      <code className={`text-xs font-mono truncate block ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        {query.query?.substring(0, 60)}{query.query?.length > 60 ? '...' : ''}
                      </code>
                    </td>
                    <td className="py-2 px-3 text-xs whitespace-nowrap">
                      <span className={`${query.execution_time > 1000 ? 'text-red-500' : 'text-green-500'}`}>
                        {query.execution_time} ms
                      </span>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${query.status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {query.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-xs truncate max-w-[150px]">
                      <span className={darkMode ? 'text-neutral-400' : 'text-neutral-500'}>
                        {new Date(query.created_at).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-xs whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteQueryLog(query.id)}
                        disabled={deleting === query.id}
                        className={`p-1.5 rounded-lg transition-all hover:scale-110 ${
                          darkMode ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300' : 'hover:bg-red-100 text-red-500 hover:text-red-700'
                        } ${deleting === query.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Delete this log"
                      >
                        {deleting === query.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueriesTab;