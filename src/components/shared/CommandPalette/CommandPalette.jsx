import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from "../../../contexts/SearchContext";
import {
  Search, Home, Package, PlusCircle,
  ShoppingCart, Users, BarChart3, Settings,
  FileText, CreditCard, Database, Shield,
  X, Command, ArrowUp, ArrowDown, CornerDownLeft,
  Globe, Bell, User, Moon, Sun,
  TrendingUp, Download, Upload, Filter,
  Eye, Edit2, Trash2, Copy,
  Layers, CheckCircle, Star, Zap
} from 'lucide-react';

const CommandPalette = ({ darkMode }) => {
  const navigate = useNavigate();
  const { 
    showCommandPalette, 
    closeCommandPalette,
    executeSearch,
    searchHistory,
    recentSearches
  } = useSearch();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  
  // الأوامر الرئيسية
  const commands = [
    {
      category: 'Navigation',
      items: [
        { 
          icon: <Home size={16} />, 
          label: 'Go to Dashboard', 
          action: () => navigate('/'), 
          shortcut: 'G D',
          color: darkMode ? 'text-blue-400' : 'text-blue-600'
        },
        { 
          icon: <Package size={16} />, 
          label: 'Go to Products', 
          action: () => navigate('/products'), 
          shortcut: 'G P',
          color: darkMode ? 'text-blue-400' : 'text-blue-600'
        },
        { 
          icon: <ShoppingCart size={16} />, 
          label: 'Go to Orders', 
          action: () => navigate('/orders'), 
          shortcut: 'G O',
          color: darkMode ? 'text-blue-400' : 'text-blue-600'
        },
        { 
          icon: <Users size={16} />, 
          label: 'Go to Customers', 
          action: () => navigate('/customers'), 
          shortcut: 'G C',
          color: darkMode ? 'text-blue-400' : 'text-blue-600'
        },
      ]
    },
    {
      category: 'Product Actions',
      items: [
        { 
          icon: <PlusCircle size={16} />, 
          label: 'Add New Product', 
          action: () => navigate('/add-product'), 
          shortcut: 'A P',
          color: darkMode ? 'text-green-400' : 'text-green-600'
        },
        { 
          icon: <Download size={16} />, 
          label: 'Export Products', 
          action: () => alert('Exporting products...'), 
          shortcut: 'E P',
          color: darkMode ? 'text-green-400' : 'text-green-600'
        },
        { 
          icon: <Filter size={16} />, 
          label: 'Filter Products', 
          action: () => navigate('/products#filter'), 
          shortcut: 'F P',
          color: darkMode ? 'text-green-400' : 'text-green-600'
        },
      ]
    },
    {
      category: 'System',
      items: [
        { 
          icon: <Settings size={16} />, 
          label: 'Open Settings', 
          action: () => navigate('/settings'), 
          shortcut: 'O S',
          color: darkMode ? 'text-purple-400' : 'text-purple-600'
        },
        { 
          icon: <Database size={16} />, 
          label: 'Backup Database', 
          action: () => alert('Database backup started'), 
          shortcut: 'B D',
          color: darkMode ? 'text-purple-400' : 'text-purple-600'
        },
        { 
          icon: <Shield size={16} />, 
          label: 'Security Settings', 
          action: () => navigate('/security'), 
          shortcut: 'S S',
          color: darkMode ? 'text-purple-400' : 'text-purple-600'
        },
      ]
    }
  ];

  // فلترة الأوامر بناءً على searchTerm
  const filteredCommands = commands
    .map(category => ({
      ...category,
      items: category.items.filter(item => 
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(category => category.items.length > 0);

  // البحث في التاريخ والاقتراحات
  const filteredHistory = searchHistory
    .filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 5);

  const filteredRecent = recentSearches
    .filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 5);

  // جميع النتائج المسطحة للتنقل
  const allResults = [
    ...filteredHistory.map(item => ({ 
      type: 'history', 
      label: item, 
      icon: <Search size={14} />,
      action: () => executeSearch(item)
    })),
    ...filteredRecent.map(item => ({ 
      type: 'recent', 
      label: item, 
      icon: <Clock size={14} />,
      action: () => executeSearch(item)
    })),
    ...filteredCommands.flatMap(category => 
      category.items.map(item => ({ 
        type: 'command', 
        ...item 
      }))
    )
  ];

  // التركيز على input عند الفتح
  useEffect(() => {
    if (showCommandPalette && inputRef.current) {
      inputRef.current.focus();
      setSearchTerm('');
      setSelectedIndex(0);
    }
  }, [showCommandPalette]);

  // إدارة keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showCommandPalette) return;
      
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          closeCommandPalette();
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < allResults.length - 1 ? prev + 1 : 0
          );
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : allResults.length - 1
          );
          break;
          
        case 'Enter':
          e.preventDefault();
          if (allResults[selectedIndex]) {
            allResults[selectedIndex].action();
            closeCommandPalette();
          }
          break;
      }
    };
    
    // Global shortcut Ctrl+K or Cmd+K
    const handleGlobalShortcut = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        closeCommandPalette();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleGlobalShortcut);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handleGlobalShortcut);
    };
  }, [showCommandPalette, allResults, selectedIndex, closeCommandPalette]);

  if (!showCommandPalette) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4 animate-fade-in"
      onClick={closeCommandPalette}
    >
      <div 
        className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${
          darkMode ? 'bg-neutral-900/95' : 'bg-white/95'
        } backdrop-blur-xl border ${
          darkMode ? 'border-neutral-800/50' : 'border-neutral-200/50'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 border-b ${
          darkMode ? 'border-neutral-800/50' : 'border-neutral-200/50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              darkMode ? 'bg-neutral-800/50' : 'bg-neutral-100/50'
            }`}>
              <Command size={20} className={
                darkMode ? "text-neutral-300" : "text-neutral-700"
              } />
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a command or search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`flex-1 bg-transparent outline-none text-lg ${
                darkMode 
                  ? 'text-neutral-200 placeholder-neutral-500' 
                  : 'text-neutral-900 placeholder-neutral-400'
              }`}
            />
            <button
              onClick={closeCommandPalette}
              className={`p-2 rounded-lg ${
                darkMode ? 'hover:bg-neutral-800/50' : 'hover:bg-neutral-100/50'
              }`}
            >
              <X size={20} className={
                darkMode ? "text-neutral-400" : "text-neutral-500"
              } />
            </button>
          </div>
        </div>
        
        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {allResults.length > 0 ? (
            <>
              {/* Search History */}
              {filteredHistory.length > 0 && (
                <div className="mb-4">
                  <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-neutral-500' : 'text-neutral-500'
                  }`}>
                    Search History
                  </div>
                  {filteredHistory.map((item, index) => {
                    const resultIndex = allResults.findIndex(r => 
                      r.type === 'history' && r.label === item
                    );
                    const isSelected = resultIndex === selectedIndex;
                    
                    return (
                      <button
                        key={`history-${index}`}
                        onClick={() => {
                          executeSearch(item);
                          closeCommandPalette();
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 transition-all ${
                          isSelected 
                            ? darkMode 
                              ? 'bg-neutral-800/50' 
                              : 'bg-neutral-100/50'
                            : darkMode 
                              ? 'hover:bg-neutral-800/30' 
                              : 'hover:bg-neutral-100/30'
                        }`}
                        onMouseEnter={() => setSelectedIndex(resultIndex)}
                      >
                        <div className="flex items-center gap-3">
                          <Search size={14} className={
                            darkMode ? "text-neutral-500" : "text-neutral-500"
                          } />
                          <span className={
                            darkMode ? "text-neutral-300" : "text-neutral-900"
                          }>
                            {item}
                          </span>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded ${
                          darkMode 
                            ? 'bg-neutral-800 text-neutral-400' 
                            : 'bg-neutral-200 text-neutral-600'
                        }`}>
                          History
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              
              {/* Commands */}
              {filteredCommands.map((category, catIndex) => (
                <div key={catIndex} className="mb-4">
                  <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? 'text-neutral-500' : 'text-neutral-500'
                  }`}>
                    {category.category}
                  </div>
                  {category.items.map((item, itemIndex) => {
                    const resultIndex = allResults.findIndex(r => 
                      r.type === 'command' && r.label === item.label
                    );
                    const isSelected = resultIndex === selectedIndex;
                    
                    return (
                      <button
                        key={`${catIndex}-${itemIndex}`}
                        onClick={() => {
                          item.action();
                          closeCommandPalette();
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 transition-all ${
                          isSelected 
                            ? darkMode 
                              ? 'bg-neutral-800/50' 
                              : 'bg-neutral-100/50'
                            : darkMode 
                              ? 'hover:bg-neutral-800/30' 
                              : 'hover:bg-neutral-100/30'
                        }`}
                        onMouseEnter={() => setSelectedIndex(resultIndex)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={item.color || (
                            darkMode ? "text-neutral-400" : "text-neutral-600"
                          )}>
                            {item.icon}
                          </div>
                          <span className={
                            darkMode ? "text-neutral-300" : "text-neutral-900"
                          }>
                            {item.label}
                          </span>
                        </div>
                        <div className={`text-xs font-medium px-2 py-1 rounded ${
                          darkMode 
                            ? 'bg-neutral-800 text-neutral-400' 
                            : 'bg-neutral-200 text-neutral-600'
                        }`}>
                          {item.shortcut}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </>
          ) : (
            <div className="py-8 text-center">
              <Search className={`mx-auto mb-3 ${
                darkMode ? "text-neutral-600" : "text-neutral-400"
              }`} size={32} />
              <p className={darkMode ? "text-neutral-400" : "text-neutral-600"}>
                No results found for "{searchTerm}"
              </p>
              <p className={`text-sm mt-2 ${
                darkMode ? "text-neutral-500" : "text-neutral-500"
              }`}>
                Try different keywords
              </p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className={`px-4 py-3 border-t text-sm flex items-center justify-between ${
          darkMode 
            ? 'border-neutral-800/50 text-neutral-400' 
            : 'border-neutral-200/50 text-neutral-600'
        }`}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <ArrowUp size={12} />
              <ArrowDown size={12} />
              <span className="ml-1">Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <CornerDownLeft size={12} />
              <span className="ml-1">Select</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold">Esc</span>
              <span className="ml-1">Close</span>
            </div>
          </div>
          <div>
            <span className="font-medium">
              {allResults.length} {allResults.length === 1 ? 'result' : 'results'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Clock icon component (نحتاجه للبحث)
const Clock = ({ size, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default CommandPalette;