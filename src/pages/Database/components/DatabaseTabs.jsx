// frontend/src/pages/Database/components/DatabaseTabs.jsx
import React from 'react';
import { Gauge, Table2, Archive, Terminal } from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Overview', icon: Gauge },
  { id: 'tables', label: 'Tables', icon: Table2 },
  { id: 'backups', label: 'Backups', icon: Archive },
  { id: 'queries', label: 'Queries', icon: Terminal }
];

const DatabaseTabs = ({ darkMode, activeTab, setActiveTab }) => {
  return (
    <div className="relative mb-4">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-2xl blur-xl"></div>
      <div className={`relative p-1.5 rounded-2xl backdrop-blur-sm ${darkMode ? 'bg-neutral-800/50 border border-neutral-700/50' : 'bg-white/50 border border-neutral-200/50 shadow-sm'}`}>
        <div className="absolute inset-y-1.5 left-1.5 bg-primary-300 rounded-xl transition-all duration-500 ease-out"
          style={{ transform: `translateX(${tabs.findIndex(t => t.id === activeTab) * 100}%)`, width: `calc((100% - ${tabs.length * 2}px)/${tabs.length})` }}
        />
        <div className="relative flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 overflow-hidden group
                  ${isActive ? 'text-white' : darkMode ? 'text-neutral-400 hover:text-neutral-200' : 'text-neutral-600 hover:text-neutral-900'}`}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-neutral-900/5'}`} />
                <div className={`relative transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  <Icon size={18} className={`transition-all duration-300 ${isActive ? 'text-white drop-shadow-lg' : darkMode ? 'text-neutral-400 group-hover:text-neutral-200' : 'text-neutral-500 group-hover:text-neutral-700'}`} />
                </div>
                <span className={`relative hidden sm:inline-block transition-all duration-300 ${isActive ? 'tracking-wide font-semibold' : 'group-hover:tracking-wide'}`}>
                  {tab.label}
                </span>
                <span className={`sm:hidden absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full transition-all duration-300 ${isActive ? 'bg-white scale-100' : 'scale-0'}`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DatabaseTabs;