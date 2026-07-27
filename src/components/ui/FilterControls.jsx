// src/components/ui/FilterControls.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Filter, Search, Grid, Layers, Plus, ArrowUpDown, X,
  Truck, UserPlus, Calendar, SlidersHorizontal, Download,
  ChevronDown, Check, AlertCircle, Package, ShoppingBag,
  DollarSign, Users, FileText, BarChart3, Clock, Star
} from 'lucide-react';
import IconWrapper from './IconWrapper';

const FilterControls = ({
  darkMode,
  title = "Filter & Controls",
  description = "Search, filter and manage your items with advanced controls",
  searchTerm = "",
  setSearchTerm,
  searchPlaceholder = "Search...",
  filters = [],
  sortBy = null,
  setSortBy,
  sortOptions = [],
  viewMode = "grid",
  setViewMode,
  actionButton = {
    show: true,
    text: "Add Item",
    icon: <Plus size={18} />,
    onClick: () => {},
  },
  extraButtons = [],
  filteredCount = 0,
  totalCount = 0,
  onReset,
  className = ""
}) => {
  
  const colors = {
    primary: '#8B7ABA',
    secondary: '#F08FAE',
    accent: '#EE9C6C',
    success: '#34D19C'
  };

  const [openDropdown, setOpenDropdown] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown !== null) {
        const dropdownElement = document.getElementById(`dropdown-${openDropdown}`);
        const buttonElement = document.getElementById(`button-${openDropdown}`);
        
        if (dropdownElement && !dropdownElement.contains(event.target) &&
            buttonElement && !buttonElement.contains(event.target)) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const hasActiveFilters = () => {
    if (searchTerm) return true;
    if (filters.some(filter => filter.value !== filter.defaultValue)) return true;
    if (sortBy && sortBy !== sortOptions[0]?.value) return true;
    return false;
  };

  const getFilterIcon = (iconName) => {
    const icons = {
      filter: <Filter size={16} />,
      calendar: <Calendar size={16} />,
      users: <Users size={16} />,
      truck: <Truck size={16} />,
      sliders: <SlidersHorizontal size={16} />,
      status: <AlertCircle size={16} />,
      category: <Package size={16} />,
      type: <FileText size={16} />
    };
    return icons[iconName] || <Filter size={16} />;
  };

  const getSelectedLabel = (filter) => {
    const option = filter.options.find(opt => opt.value === filter.value);
    return option ? option.label : filter.defaultLabel || 'All';
  };

  const getSelectedSortLabel = () => {
    const option = sortOptions.find(opt => opt.value === sortBy);
    return option ? option.label : 'Sort by';
  };

  return (
    <div className={`rounded-2xl p-6 bg-white dark:bg-neutral-800 
                    shadow-lg border border-neutral-100 dark:border-neutral-700 
                    overflow-visible ${className}`}>
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-neutral-200 dark:border-neutral-800">
        <IconWrapper darkMode={darkMode} variant="primary" size={20}>
          <Filter />
        </IconWrapper>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-neutral-700 dark:text-neutral-300">
            {title}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {description}
          </p>
        </div>
        <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-auto whitespace-nowrap">
          {filteredCount} / {totalCount} items
        </span>
      </div>
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 rounded-full 
                       bg-neutral-50 dark:bg-neutral-900/50 
                       border border-neutral-200 dark:border-neutral-700
                       focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50
                       text-neutral-900 dark:text-white
                       placeholder:text-neutral-400 text-sm"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        
        {/* Controls Group - مع overflow-visible */}
        <div className="flex items-center gap-3 flex-wrap overflow-visible">
          
          {/* Dynamic Custom Dropdowns */}
          {filters.map((filter, index) => {
            const dropdownId = `filter-${index}`;
            const isOpen = openDropdown === dropdownId;
            
            return (
              <div key={index} className="relative overflow-visible">
                <button
                  id={`button-${dropdownId}`}
                  onClick={() => setOpenDropdown(isOpen ? null : dropdownId)}
                  className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg
                           min-w-[160px] transition-all duration-200
                           ${darkMode 
                             ? 'bg-neutral-900/50 border-neutral-700 text-neutral-200 hover:bg-neutral-800' 
                             : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                           }
                           border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50
                           ${isOpen ? `ring-2 ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'}` : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">
                      {getFilterIcon(filter.icon)}
                    </span>
                    <span className="text-sm font-medium truncate">
                      {getSelectedLabel(filter)}
                    </span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                
                {/* Dropdown Menu - absolute positioning */}
                {isOpen && (
                  <div 
                    id={`dropdown-${dropdownId}`}
                    className="absolute top-full left-0 mt-1 z-50 rounded-xl shadow-2xl overflow-hidden"
                    style={{ minWidth: '200px' }}
                  >
                    <div className={`${darkMode ? 'bg-neutral-800' : 'bg-white'} 
                                    border ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}
                                    rounded-xl overflow-hidden`}>
                      <div className="py-2">
                        {filter.options.map((option) => {
                          const isSelected = filter.value === option.value;
                          return (
                            <button
                              key={option.value}
                              onClick={() => {
                                filter.onChange(option.value);
                                setOpenDropdown(null);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm 
                                       flex items-center justify-between gap-3
                                       transition-all duration-150
                                       ${isSelected
                                         ? darkMode 
                                           ? 'bg-[#8B7ABA]/20 text-[#8B7ABA]' 
                                           : 'bg-[#8B7ABA]/10 text-[#8B7ABA]'
                                         : darkMode 
                                           ? 'text-neutral-300 hover:bg-neutral-700' 
                                           : 'text-neutral-700 hover:bg-neutral-50'
                                       }`}
                            >
                              <div className="flex items-center gap-3">
                                {option.icon && (
                                  <span className={isSelected ? 'text-[#8B7ABA]' : 'text-neutral-400'}>
                                    {option.icon}
                                  </span>
                                )}
                                <span>{option.label}</span>
                              </div>
                              {isSelected && (
                                <Check size={16} className="text-[#8B7ABA]" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Sort Custom Dropdown */}
          {sortOptions.length > 0 && sortBy !== null && setSortBy && (
            <div className="relative overflow-visible">
              <button
                id="button-sort"
                onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
                className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg
                         min-w-[160px] transition-all duration-200
                         ${darkMode 
                           ? 'bg-neutral-900/50 border-neutral-700 text-neutral-200 hover:bg-neutral-800' 
                           : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                         }
                         border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50
                         ${openDropdown === 'sort' ? `ring-2 ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'}` : ''}`}
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-neutral-400" />
                  <span className="text-sm font-medium truncate">
                    {getSelectedSortLabel()}
                  </span>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`text-neutral-400 transition-transform duration-200 ${openDropdown === 'sort' ? 'rotate-180' : ''}`}
                />
              </button>
              
              {/* Sort Dropdown Menu */}
              {openDropdown === 'sort' && (
                <div 
                  id="dropdown-sort"
                  className="absolute top-full left-0 mt-1 z-50 rounded-xl shadow-2xl overflow-hidden"
                  style={{ minWidth: '200px' }}
                >
                  <div className={`${darkMode ? 'bg-neutral-800' : 'bg-white'} 
                                  border ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}
                                  rounded-xl overflow-hidden`}>
                    <div className="py-2">
                      {sortOptions.map((option) => {
                        const isSelected = sortBy === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm 
                                     flex items-center justify-between gap-3
                                     transition-all duration-150
                                     ${isSelected
                                       ? darkMode 
                                         ? 'bg-[#8B7ABA]/20 text-[#8B7ABA]' 
                                         : 'bg-[#8B7ABA]/10 text-[#8B7ABA]'
                                       : darkMode 
                                         ? 'text-neutral-300 hover:bg-neutral-700' 
                                         : 'text-neutral-700 hover:bg-neutral-50'
                                     }`}
                          >
                            <div className="flex items-center gap-3">
                              {option.icon && (
                                <span className={isSelected ? 'text-[#8B7ABA]' : 'text-neutral-400'}>
                                  {option.icon}
                                </span>
                              )}
                              <span>{option.label}</span>
                            </div>
                            {isSelected && (
                              <Check size={16} className="text-[#8B7ABA]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* View Toggle */}
          {setViewMode && (
            <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all duration-200
                  ${viewMode === 'grid' 
                    ? 'bg-white dark:bg-neutral-700 shadow-md' 
                    : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                style={viewMode === 'grid' ? { color: colors.primary } : {}}
                title="Grid view"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all duration-200
                  ${viewMode === 'list' 
                    ? 'bg-white dark:bg-neutral-700 shadow-md' 
                    : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                style={viewMode === 'list' ? { color: colors.primary } : {}}
                title="List view"
              >
                <Layers size={18} />
              </button>
            </div>
          )}
          
          {/* Extra Buttons */}
          {extraButtons.map((button, index) => (
            <button
              key={index}
              onClick={button.onClick}
              className={`flex items-center  px-3 py-2.5 rounded-lg font-medium 
                       transition-all duration-200 text-sm whitespace-nowrap
                       ${darkMode 
                         ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700' 
                         : 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 shadow-sm'} 
                       hover:shadow-md active:scale-95`}
            >
              {button.icon}
            </button>
          ))}
          
          {/* Main Action Button */}
          {actionButton.show && (
            <button 
              onClick={actionButton.onClick}
              className="group relative overflow-hidden rounded-lg px-6 py-2.5 
                       text-white font-medium shadow-lg hover:shadow-xl 
                       transition-all duration-300 hover:-translate-y-0.5 active:scale-95 
                       text-sm whitespace-nowrap"
              style={{ background: colors.primary }}
            >
              <span className="relative z-10 flex items-center gap-2">
                {actionButton.icon}
                <span>{actionButton.text}</span>
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   style={{ background: `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})` }}
              />
            </button>
          )}
        </div>
      </div>
      
      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span 
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                         transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: darkMode ? `${colors.primary}20` : `${colors.primary}10`, color: colors.primary }}
              >
                <Search size={12} />
                "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="ml-1 hover:opacity-70">
                  <X size={10} />
                </button>
              </span>
            )}
            {filters.map((filter, index) => (
              filter.value !== filter.defaultValue && (
                <span 
                  key={index}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                           transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: darkMode ? `${colors.secondary}20` : `${colors.secondary}10`, color: colors.secondary }}
                >
                  {getFilterIcon(filter.icon)}
                  {getSelectedLabel(filter)}
                  <button 
                    onClick={() => filter.onChange(filter.defaultValue)} 
                    className="ml-1 hover:opacity-70"
                  >
                    <X size={10} />
                  </button>
                </span>
              )
            ))}
            {sortBy && sortBy !== sortOptions[0]?.value && (
              <span 
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                         transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: darkMode ? `${colors.accent}20` : `${colors.accent}10`, color: colors.accent }}
              >
                <ArrowUpDown size={10} />
                {getSelectedSortLabel()}
                <button 
                  onClick={() => setSortBy(sortOptions[0]?.value)} 
                  className="ml-1 hover:opacity-70"
                >
                  <X size={10} />
                </button>
              </span>
            )}
          </div>
          {onReset && (
            <button
              onClick={onReset}
              className="ml-auto text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 
                       transition-colors duration-200 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterControls;