// frontend/src/pages/Database/components/DatabaseStats.jsx
import React from 'react';
import { HardDrive, Layers, Database as DatabaseIcon, Activity } from 'lucide-react';
import MetricCard from '../../Dashboard/components/MetricCard';

const DatabaseStats = ({ darkMode, dbStats }) => {
  const colors = { primary: '#8B7ABA', secondary: '#F08FAE', accent: '#EE9C6C', success: '#34D19C' };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Database Size" value={dbStats.size} icon={<HardDrive size={20} />}
        subtitle="Total storage used" variant="success" darkMode={darkMode} lightBgOpacity={0.6}
      />
      <MetricCard
        title="Tables" value={dbStats.tables} icon={<Layers size={20} />}
        subtitle="Total tables" variant="primary" darkMode={darkMode} lightBgOpacity={0.6}
      />
      <MetricCard
        title="Total Records" value={dbStats.records} icon={<DatabaseIcon size={20} />}
        subtitle="Across all tables" variant="secondary" darkMode={darkMode}
      />
      <MetricCard
        title="Queries/sec" value={dbStats.queries} icon={<Activity size={20} />}
        subtitle="Average load" variant="warning" darkMode={darkMode}
      />
    </div>
  );
};

export default DatabaseStats;