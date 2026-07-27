// frontend/src/pages/Database/components/TablesTab.jsx
import React, { useState } from 'react';
import { Layers, Eye } from 'lucide-react';
import { databaseService } from '../../../services/api';
import TableDetailsModal from './TableDetailsModal';

const TablesTab = ({ darkMode, tables }) => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tableDetails, setTableDetails] = useState(null);

  // ✅ دالة عرض تفاصيل الجدول - مع الـ API الصحيح
  const handleViewTable = async (table) => {
    try {
      setLoading(true);
      setSelectedTable(table);
      
      console.log(`🔍 Fetching details for table: ${table.table_name}`);
      
      // ✅ ✅ ✅ استخدام الـ API الصحيح
      const response = await databaseService.getTableDetails(table.table_name);
      console.log('📊 Table details response:', response.data);
      
      setTableDetails(response.data);
      
    } catch (error) {
      console.error('Error fetching table details:', error);
      
      // ✅ عرض بيانات أساسية في حالة الخطأ
      setTableDetails({
        name: table.table_name,
        rows: table.row_count || 0,
        column_count: 0,
        columns: [],
        engine: table.engine || 'SQLite',
        collation: table.collation || 'UTF-8',
        size: table.size_display || 'N/A',
        last_updated: table.last_updated
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedTable(null);
    setTableDetails(null);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`text-xs font-semibold ${darkMode ? 'bg-neutral-800/50 text-neutral-400' : 'bg-neutral-100/50 text-neutral-600'}`}>
              <th className="text-left py-3 px-4 rounded-l-lg">Table Name</th>
              <th className="text-left py-3 px-4">Rows</th>
              <th className="text-left py-3 px-4">Size</th>
              <th className="text-left py-3 px-4">Indexes</th>
              <th className="text-left py-3 px-4">Engine</th>
              <th className="text-left py-3 px-4 rounded-r-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tables.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-neutral-500">No tables found</td>
              </tr>
            ) : (
              tables.map((table, index) => (
                <tr key={index} className={`border-t ${darkMode ? 'border-neutral-800/50 hover:bg-neutral-800/20' : 'border-neutral-200/50 hover:bg-neutral-100/30'} transition-colors`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Layers size={14} className="text-primary-500" />
                      <span className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-neutral-900'}`}>{table.table_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">{table.row_count?.toLocaleString() || 0}</td>
                  <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">{table.size_display || '0 B'}</td>
                  <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">{table.index_size || 0}</td>
                  <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-400">{table.engine || 'SQLite'}</td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => handleViewTable(table)}
                      className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
                      title="View table details"
                      disabled={loading}
                    >
                      <Eye size={14} className="text-neutral-500" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      

      {/* ✅ Modal عرض تفاصيل الجدول */}
      {selectedTable && (
        <TableDetailsModal
          darkMode={darkMode}
          table={tableDetails || selectedTable}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default TablesTab;