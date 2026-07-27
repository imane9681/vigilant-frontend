// src/pages/Dashboard/components/Calendar/utils/eventIcons.jsx
import React from 'react';
import { 
  Calendar, 
  Package, 
  AlertTriangle, 
  TrendingUp,
  CheckCircle
} from 'lucide-react';

// Get event icon based on type
export const getEventIcon = (type) => {
  switch(type) {
    case 'restock': return <Package size={16} />;
    case 'launch': return <TrendingUp size={16} />;
    case 'low-stock': return <AlertTriangle size={16} />;
    case 'order': return <CheckCircle size={16} />;
    default: return <Calendar size={16} />;
  }
};