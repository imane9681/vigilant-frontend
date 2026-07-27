// frontend/src/pages/Database/components/TableDetailsModal.jsx
import React from 'react';
import { X, Table, Database, Layers, Hash, Calendar } from 'lucide-react';

const TableDetailsModal = ({ darkMode, table, onClose }) => {
    if (!table) return null;

    // ✅ استخدام column_count إذا كان موجوداً
    const columnCount = table.column_count || table.columns?.length || 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div 
                className={`relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl ${
                    darkMode ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border border-neutral-200'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${
                    darkMode ? 'border-neutral-700' : 'border-neutral-200'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${
                            darkMode ? 'bg-primary-500/20' : 'bg-primary-100'
                        }`}>
                            <Table size={22} className={darkMode ? 'text-primary-400' : 'text-primary-600'} />
                        </div>
                        <div>
                            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                                {table.name || 'Table Details'}
                            </h3>
                            <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                Table details and structure
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${
                            darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100'
                        }`}
                    >
                        <X size={20} className={darkMode ? 'text-neutral-400' : 'text-neutral-500'} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {/* Table Info - ✅ عرض الأرقام بشكل صحيح */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className={`p-4 rounded-xl ${
                            darkMode ? 'bg-neutral-700/30' : 'bg-neutral-50'
                        }`}>
                            <div className="flex items-center gap-2 mb-1">
                                <Database size={14} className="text-primary-500" />
                                <span className={`text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                                    Rows
                                </span>
                            </div>
                            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                                {table.rows?.toLocaleString() || table.row_count?.toLocaleString() || 0}
                            </p>
                        </div>
                        <div className={`p-4 rounded-xl ${
                            darkMode ? 'bg-neutral-700/30' : 'bg-neutral-50'
                        }`}>
                            <div className="flex items-center gap-2 mb-1">
                                <Layers size={14} className="text-amber-500" />
                                <span className={`text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                                    Columns
                                </span>
                            </div>
                            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                                {columnCount}
                            </p>
                        </div>
                    </div>

                    {/* Columns Table - ✅ عرض الأعمدة */}
                    {table.columns && table.columns.length > 0 ? (
                        <>
                            <h4 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                                Columns Structure ({table.columns.length})
                            </h4>
                            <div className={`overflow-x-auto rounded-lg border ${
                                darkMode ? 'border-neutral-700' : 'border-neutral-200'
                            }`}>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className={darkMode ? 'bg-neutral-700/50' : 'bg-neutral-100'}>
                                            <th className="text-left py-2 px-3 font-semibold">Field</th>
                                            <th className="text-left py-2 px-3 font-semibold">Type</th>
                                            <th className="text-left py-2 px-3 font-semibold">Null</th>
                                            <th className="text-left py-2 px-3 font-semibold">Key</th>
                                            <th className="text-left py-2 px-3 font-semibold">Default</th>
                                            <th className="text-left py-2 px-3 font-semibold">Extra</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {table.columns.map((col, index) => (
                                            <tr key={index} className={`border-t ${
                                                darkMode ? 'border-neutral-700' : 'border-neutral-200'
                                            }`}>
                                                <td className={`py-2 px-3 font-mono text-xs ${
                                                    darkMode ? 'text-white' : 'text-neutral-900'
                                                }`}>
                                                    {col.Field || col.field || '-'}
                                                </td>
                                                <td className="py-2 px-3 font-mono text-xs text-amber-500">
                                                    {col.Type || col.type || '-'}
                                                </td>
                                                <td className="py-2 px-3 text-xs">
                                                    {col.Null || col.null || 'NO'}
                                                </td>
                                                <td className="py-2 px-3 text-xs">
                                                    {col.Key || col.key || '-'}
                                                </td>
                                                <td className="py-2 px-3 text-xs">
                                                    {col.Default !== undefined && col.Default !== null ? col.Default : '-'}
                                                </td>
                                                <td className="py-2 px-3 text-xs">
                                                    {col.Extra || col.extra || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className={`text-center py-8 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                            No columns data available
                        </div>
                    )}

                    {/* Additional Info */}
                    <div className={`mt-4 p-4 rounded-xl ${
                        darkMode ? 'bg-neutral-700/30' : 'bg-neutral-50'
                    }`}>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className={darkMode ? 'text-neutral-400' : 'text-neutral-500'}>Engine</span>
                                <p className={`font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                                    {table.engine || 'SQLite'}
                                </p>
                            </div>
                            <div>
                                <span className={darkMode ? 'text-neutral-400' : 'text-neutral-500'}>Collation</span>
                                <p className={`font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                                    {table.collation || 'UTF-8'}
                                </p>
                            </div>
                            <div>
                                <span className={darkMode ? 'text-neutral-400' : 'text-neutral-500'}>Size</span>
                                <p className={`font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                                    {table.size || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <span className={darkMode ? 'text-neutral-400' : 'text-neutral-500'}>Last Updated</span>
                                <p className={`font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                                    {table.last_updated ? new Date(table.last_updated).toLocaleString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-4 border-t ${
                    darkMode ? 'border-neutral-700' : 'border-neutral-200'
                }`}>
                    <button
                        onClick={onClose}
                        className={`w-full px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 ${
                            darkMode 
                                ? 'bg-neutral-700 hover:bg-neutral-600 text-white' 
                                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                        }`}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TableDetailsModal;