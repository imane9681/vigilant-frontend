import React from 'react';
import { Layers, CheckCircle, Star, DollarSign, ArrowUpRight, TrendingUp } from 'lucide-react';

const ProductStats = ({ darkMode, stats }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price || 0);
  };

  const statCards = [
    {
      id: 1,
      title: "Total Products",
      value: stats.totalProducts,
      trend: "+12%",
      icon: <Layers size={22} />,
      color: darkMode ? "text-blue-400" : "text-blue-600",
      bgColor: darkMode 
        ? "bg-gradient-to-r from-blue-900/30 to-blue-800/20" 
        : "bg-gradient-to-r from-blue-100/80 to-blue-50/90",
      trendColor: darkMode ? "text-green-400" : "text-green-600",
      iconBg: darkMode ? "bg-blue-500/20" : "bg-blue-500/10"
    },
    {
      id: 2,
      title: "In Stock",
      value: stats.inStock,
      percentage: Math.round((stats.inStock / stats.totalProducts) * 100),
      icon: <CheckCircle size={22} />,
      color: darkMode ? "text-emerald-400" : "text-emerald-600",
      bgColor: darkMode 
        ? "bg-gradient-to-r from-emerald-900/30 to-emerald-800/20" 
        : "bg-gradient-to-r from-emerald-100/80 to-emerald-50/90",
      progressColor: "bg-emerald-500",
      iconBg: darkMode ? "bg-emerald-500/20" : "bg-emerald-500/10"
    },
    {
      id: 3,
      title: "Featured",
      value: stats.featured,
      icon: <Star size={22} />,
      color: darkMode ? "text-amber-400" : "text-amber-600",
      bgColor: darkMode 
        ? "bg-gradient-to-r from-amber-900/30 to-yellow-800/20" 
        : "bg-gradient-to-r from-amber-100/80 to-amber-50/90",
      label: "Popular items",
      iconBg: darkMode ? "bg-amber-500/20" : "bg-amber-500/10",
      starFilled: true
    },
    {
      id: 4,
      title: "Total Value",
      value: formatPrice(stats.totalValue),
      trend: "+18% growth",
      icon: <DollarSign size={22} />,
      color: darkMode ? "text-purple-400" : "text-purple-600",
      bgColor: darkMode 
        ? "bg-gradient-to-r from-purple-900/30 to-purple-800/20" 
        : "bg-gradient-to-r from-purple-100/80 to-purple-50/90",
      trendColor: darkMode ? "text-purple-400" : "text-purple-600",
      iconBg: darkMode ? "bg-purple-500/20" : "bg-purple-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {statCards.map((card) => (
        <div 
          key={card.id}
          className={`group rounded-2xl p-5 border transition-all duration-300 transform hover:-translate-y-1
                     ${darkMode 
                       ? 'bg-gradient-to-br from-neutral-900/80 to-neutral-800/80 border-neutral-700 hover:border-neutral-600 hover:shadow-lg hover:shadow-blue-500/5' 
                       : 'bg-gradient-to-br from-white to-neutral-50/90 border-neutral-200/70 hover:border-neutral-300 hover:shadow-lg hover:shadow-blue-500/10'}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-xs font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'} mb-1.5`}>
                {card.title}
              </p>
              
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'} mb-3`}>
                {card.value}
                {card.percentage !== undefined && (
                  <span className="text-sm font-normal ml-1.5 text-neutral-500">({card.percentage}%)</span>
                )}
              </p>
              
              {/* Progress bar or trend */}
              {card.percentage !== undefined ? (
                <div className="space-y-2">
                  <div className={`w-full rounded-full h-1.5 overflow-hidden ${darkMode ? 'bg-neutral-700/50' : 'bg-neutral-200/70'}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${card.progressColor}`}
                      style={{ width: `${card.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ) : card.trend ? (
                <div className="flex items-center gap-1.5">
                  {card.id === 4 ? (
                    <TrendingUp size={14} className={card.trendColor} />
                  ) : (
                    <ArrowUpRight size={14} className={card.trendColor} />
                  )}
                  <span className={`text-xs font-medium ${card.trendColor}`}>
                    {card.trend}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Star 
                    size={14} 
                    className={`${darkMode ? 'text-amber-400' : 'text-amber-500'} ${card.starFilled ? 'fill-amber-500' : ''}`} 
                  />
                  <span className={`text-xs font-medium ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                    {card.label}
                  </span>
                </div>
              )}
            </div>
            
            <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 ${card.bgColor}`}>
              <div className={card.color}>
                {card.icon}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductStats;