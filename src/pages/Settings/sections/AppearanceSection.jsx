// src/pages/Settings/sections/AppearanceSection.jsx
import React from 'react';
import { Sun, Moon, Type, Monitor, Check, Palette, 
         Square, Circle, Star, Sparkles, Layout } from 'lucide-react';

const AppearanceSection = ({ 
  darkMode, 
  config, 
  handleInputChange, 
  handleThemeChange,
  setDarkMode,
  setSuccess,
  DropdownTrigger,
  Dropdown,
  DropdownItem,
  DropdownHeader
}) => {
  const colors = config.colors || {
    primary: '#8B7ABA',
    accent: '#EE9C6C',
    success: '#34D19C',
    secondary: '#F08FAE',
  };

  const sidebar = config.sidebar || {
    background: '#58419C',
    backgroundDark: '#171717',
    text: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.7)',
    icon: '#ffffff',
    iconActive: '#EE9C6C',
    textActive: '#EE9C6C',
    hoverBg: 'rgba(255,167,38,0.1)',
    border: 'rgba(255,255,255,0.1)',
    logo: '#EE9C6C',
    button: '#EE9C6C',
  };

  const fontSizeOptions = [
    { value: 'small', label: 'Small', icon: Type },
    { value: 'medium', label: 'Medium', icon: Type },
    { value: 'large', label: 'Large', icon: Type }
  ];

  const borderRadiusOptions = [
    { value: 'small', label: 'Small', icon: Monitor },
    { value: 'medium', label: 'Medium', icon: Monitor },
    { value: 'large', label: 'Large', icon: Monitor }
  ];

  // ✅ ألوان مقترحة للنظام
  const colorPalettes = {
    primary: ['#8B7ABA', '#6D28D9', '#7C3AED', '#8B5CF6', '#6366F1', '#4F46E5'],
    accent: ['#EE9C6C', '#F59E0B', '#F97316', '#FB923C', '#FCD34D', '#FBBF24'],
    success: ['#34D19C', '#10B981', '#22C55E', '#16A34A', '#059669', '#047857'],
    secondary: ['#F08FAE', '#EC4899', '#DB2777', '#BE185D', '#F472B6', '#F9A8D4'],
  };

  // ✅ ألوان السايدبار
  const sidebarPalettes = {
    background: ['#58419C', '#4C1D95', '#5B21B6', '#7C3AED', '#1f2937', '#111827'],
    text: ['#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280'],
    iconActive: ['#EE9C6C', '#F59E0B', '#F97316', '#FB923C', '#34D19C', '#8B5CF6'],
    textActive: ['#EE9C6C', '#F59E0B', '#F97316', '#FB923C', '#34D19C', '#8B5CF6'],
    logo: ['#EE9C6C', '#F59E0B', '#F97316', '#FB923C', '#34D19C', '#8B5CF6'],
    button: ['#EE9C6C', '#F59E0B', '#F97316', '#FB923C', '#34D19C', '#8B5CF6'],
  };

  const sidebarLabels = {
    background: 'Sidebar Background',
    text: 'Text Color (Normal)',
    //iconActive: 'Active Icon Color',
    textActive: 'Active Text Color',
    //logo: 'Logo Color',
    //button: 'Button Color',
  };

  const sidebarDescriptions = {
    background: 'Main sidebar background color',
    text: 'Color for normal (inactive) text items',
    //iconActive: 'Color for active/highlighted icons',
    textActive: 'Color for active/highlighted text',
    //logo: 'Color for the logo text',
    //button: 'Color for buttons in sidebar',
  };

  const sidebarIcons = {
    background: <Layout size={16} />,
    text: <Type size={16} />,
    //iconActive: <Star size={16} />,
    textActive: <Star size={16} />,
    //logo: <Star size={16} />,
    //button: <Square size={16} />,
  };

  const colorLabels = {
    primary: 'Primary Buttons',
    accent: 'Accent & Borders',
    success: 'Toggles & Success',
    secondary: 'Secondary Elements',
  };

  const colorIcons = {
    primary: <Square size={16} />,
    accent: <Circle size={16} />,
    success: <Check size={16} />,
    secondary: <Star size={16} />,
  };

  const colorDescriptions = {
    primary: 'Main action buttons',
    accent: 'Borders and highlights',
    success: 'Toggle switches and success states',
    secondary: 'Secondary elements',
  };

  const handleColorChange = (colorKey, value) => {
    handleInputChange('appearance', `color_${colorKey}`, value);
  };

  const handleSidebarColorChange = (colorKey, value) => {
    handleInputChange('appearance', `sidebar_${colorKey}`, value);
  };

  return (
    <div className="space-y-6">
      {/* Theme & Font Size */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
            Theme
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => handleThemeChange('light')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all
                        ${config.theme === 'light'
                          ? 'border-[#EE9C6C] bg-[#EE9C6C]/10'
                          : darkMode
                            ? 'border-neutral-700 hover:border-neutral-600'
                            : 'border-neutral-200 hover:border-neutral-300'}`}
            >
              <Sun size={18} className={config.theme === 'light' ? 'text-[#EE9C6C]' : ''} />
              <span className={`text-sm font-medium ${config.theme === 'light' ? 'text-[#EE9C6C]' : ''}`}>
                Light
              </span>
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all
                        ${config.theme === 'dark'
                          ? 'border-[#EE9C6C] bg-[#EE9C6C]/10'
                          : darkMode
                            ? 'border-neutral-700 hover:border-neutral-600'
                            : 'border-neutral-200 hover:border-neutral-300'}`}
            >
              <Moon size={18} className={config.theme === 'dark' ? 'text-[#EE9C6C]' : ''} />
              <span className={`text-sm font-medium ${config.theme === 'dark' ? 'text-[#EE9C6C]' : ''}`}>
                Dark
              </span>
            </button>
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
            Font Size
          </label>
          <Dropdown
            trigger={
              <DropdownTrigger
                label="Select Font Size"
                value={fontSizeOptions.find(f => f.value === config.fontSize)?.label || config.fontSize}
                icon={Type}
                darkMode={darkMode}
              />
            }
            align="left"
            width="full"
            darkMode={darkMode}
          >
            <DropdownHeader darkMode={darkMode}>Font Size</DropdownHeader>
            {fontSizeOptions.map((option) => (
              <DropdownItem
                key={option.value}
                onClick={() => handleInputChange('appearance', 'fontSize', option.value)}
                darkMode={darkMode}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option.label}</span>
                  {config.fontSize === option.value && (
                    <Check size={14} className="text-[#EE9C6C]" />
                  )}
                </div>
              </DropdownItem>
            ))}
          </Dropdown>
        </div>
      </div>

      {/* ✅ نظام الألوان */}
      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3 mb-2">
          <Palette size={20} className="text-[#EE9C6C]" />
          <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
            Color System
          </h4>
        </div>
        <p className={`text-sm mb-6 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
          Customize the main colors of your dashboard
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(colorPalettes).map((colorKey) => (
            <div key={colorKey} className={`p-4 rounded-lg border ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-neutral-400">{colorIcons[colorKey]}</span>
                <label className={`text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  {colorLabels[colorKey]}
                </label>
                <span className="ml-auto text-xs font-mono text-neutral-400">
                  {colors[colorKey]}
                </span>
              </div>
              <p className={`text-xs mb-3 ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                {colorDescriptions[colorKey]}
              </p>

              <div className="flex gap-1.5 flex-wrap mb-3">
                {colorPalettes[colorKey].map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(colorKey, color)}
                    className={`w-7 h-7 rounded-lg border-2 transition-all transform hover:scale-110 hover:shadow-lg
                              ${colors[colorKey] === color 
                                ? 'border-white ring-2 ring-[#8B7ABA] scale-110 shadow-md' 
                                : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={colors[colorKey] || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value) || value === '') {
                      handleColorChange(colorKey, value);
                    }
                  }}
                  className={`flex-1 px-3 py-1.5 rounded-lg border text-sm font-mono
                    focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]
                    ${darkMode 
                      ? 'bg-neutral-700/50 border-neutral-600 text-white' 
                      : 'bg-neutral-50 border-neutral-200 text-neutral-900'}`}
                  placeholder="#8B7ABA"
                  maxLength={7}
                />
                <input
                  type="color"
                  value={colors[colorKey] || '#8B7ABA'}
                  onChange={(e) => handleColorChange(colorKey, e.target.value)}
                  className="w-10 h-10 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 cursor-pointer p-1 bg-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ ألوان السايدبار */}
      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3 mb-2">
          <Layout size={20} className="text-[#58419C]" />
          <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
            Sidebar Colors
          </h4>
        </div>
        <p className={`text-sm mb-6 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
          Customize the sidebar appearance
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(sidebarLabels).map((colorKey) => (
            <div key={colorKey} className={`p-4 rounded-lg border ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-neutral-400">{sidebarIcons[colorKey]}</span>
                <label className={`text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  {sidebarLabels[colorKey]}
                </label>
                <span className="ml-auto text-xs font-mono text-neutral-400">
                  {sidebar[colorKey]}
                </span>
              </div>
              <p className={`text-xs mb-3 ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                {sidebarDescriptions[colorKey]}
              </p>

              <div className="flex gap-1.5 flex-wrap mb-3">
                {(sidebarPalettes[colorKey] || sidebarPalettes.background).map((color) => (
                  <button
                    key={color}
                    onClick={() => handleSidebarColorChange(colorKey, color)}
                    className={`w-7 h-7 rounded-lg border-2 transition-all transform hover:scale-110 hover:shadow-lg
                              ${sidebar[colorKey] === color 
                                ? 'border-white ring-2 ring-[#8B7ABA] scale-110 shadow-md' 
                                : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={sidebar[colorKey] || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value) || value === '' || value.includes('rgba')) {
                      handleSidebarColorChange(colorKey, value);
                    }
                  }}
                  className={`flex-1 px-3 py-1.5 rounded-lg border text-sm font-mono
                    focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]
                    ${darkMode 
                      ? 'bg-neutral-700/50 border-neutral-600 text-white' 
                      : 'bg-neutral-50 border-neutral-200 text-neutral-900'}`}
                  placeholder={sidebar[colorKey]}
                  maxLength={30}
                />
                <input
                  type="color"
                  value={sidebar[colorKey]?.startsWith('#') ? sidebar[colorKey] : '#58419C'}
                  onChange={(e) => handleSidebarColorChange(colorKey, e.target.value)}
                  className="w-10 h-10 rounded-lg border-2 border-neutral-200 dark:border-neutral-700 cursor-pointer p-1 bg-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* باقي الإعدادات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className={`flex items-center justify-between p-4 rounded-lg
                      ${darkMode ? 'bg-neutral-700/30' : 'bg-neutral-50'}`}>
          <div>
            <p className={`font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              Dense Mode
            </p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Reduce spacing for more content
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.denseMode}
              onChange={(e) => handleInputChange('appearance', 'denseMode', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-12 h-6 rounded-full transition-all duration-300
                          ${config.denseMode 
                            ? 'bg-[#34D19C]' 
                            : darkMode ? 'bg-neutral-600' : 'bg-neutral-300'}`}>
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full 
                            transition-all duration-300 shadow-md
                            ${config.denseMode ? 'translate-x-6' : ''}`} />
            </div>
          </label>
        </div>

        <div className={`flex items-center justify-between p-4 rounded-lg
                      ${darkMode ? 'bg-neutral-700/30' : 'bg-neutral-50'}`}>
          <div>
            <p className={`font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              Animations
            </p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Enable UI animations
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.animations}
              onChange={(e) => handleInputChange('appearance', 'animations', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-12 h-6 rounded-full transition-all duration-300
                          ${config.animations 
                            ? 'bg-[#34D19C]' 
                            : darkMode ? 'bg-neutral-600' : 'bg-neutral-300'}`}>
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full 
                            transition-all duration-300 shadow-md
                            ${config.animations ? 'translate-x-6' : ''}`} />
            </div>
          </label>
        </div>

        <div className={`flex items-center justify-between p-4 rounded-lg
                      ${darkMode ? 'bg-neutral-700/30' : 'bg-neutral-50'}`}>
          <div>
            <p className={`font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              Breadcrumbs
            </p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Show navigation breadcrumbs
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.showBreadcrumbs}
              onChange={(e) => handleInputChange('appearance', 'showBreadcrumbs', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-12 h-6 rounded-full transition-all duration-300
                          ${config.showBreadcrumbs 
                            ? 'bg-[#34D19C]' 
                            : darkMode ? 'bg-neutral-600' : 'bg-neutral-300'}`}>
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full 
                            transition-all duration-300 shadow-md
                            ${config.showBreadcrumbs ? 'translate-x-6' : ''}`} />
            </div>
          </label>
        </div>

        <div className={`flex items-center justify-between p-4 rounded-lg
                      ${darkMode ? 'bg-neutral-700/30' : 'bg-neutral-50'}`}>
          <div>
            <p className={`font-medium ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              Status Bar
            </p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Show system status bar
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.showStatusBar}
              onChange={(e) => handleInputChange('appearance', 'showStatusBar', e.target.checked)}
              className="sr-only"
            />
            <div className={`w-12 h-6 rounded-full transition-all duration-300
                          ${config.showStatusBar 
                            ? 'bg-[#34D19C]' 
                            : darkMode ? 'bg-neutral-600' : 'bg-neutral-300'}`}>
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full 
                            transition-all duration-300 shadow-md
                            ${config.showStatusBar ? 'translate-x-6' : ''}`} />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSection;