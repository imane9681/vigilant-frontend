// src/pages/Marketing/components/PaymentMethodsChart.jsx
import React from 'react';
import { 
  CreditCard, Wallet, Landmark, Smartphone,
  Star, TrendingUp, TrendingDown, Clock
} from 'lucide-react';
import IconWrapper from '../../../components/ui/IconWrapper';
import WidgetButtons from '../../../components/ui/WidgetButtons';

// ✅ أيقونات طرق الدفع (نفس الأيقونات السابقة)
const getPaymentIcon = (method) => {
  const methodLower = method.toLowerCase();
  if (methodLower.includes('credit') || methodLower.includes('card')) {
    return <CreditCard size={20} />;
  } else if (methodLower.includes('paypal')) {
    return <Smartphone size={20} />;
  } else if (methodLower.includes('bank') || methodLower.includes('transfer')) {
    return <Landmark size={20} />;
  } else if (methodLower.includes('cash')) {
    return <Wallet size={20} />;
  }
  return <CreditCard size={20} />;
};

// ✅ ألوان طرق الدفع (نفس الألوان السابقة)
const getPaymentColor = (method, index) => {
  const colors = ['#8B7ABA', '#F08FAE', '#EE9C6C', '#34D19C'];
  const methodColors = {
    'credit card': '#8B7ABA',
    'paypal': '#F08FAE',
    'bank transfer': '#EE9C6C',
    'cash on delivery': '#34D19C',
    'unknown': '#6B7280'
  };
  
  const methodLower = method.toLowerCase();
  for (const [key, color] of Object.entries(methodColors)) {
    if (methodLower.includes(key)) {
      return color;
    }
  }
  return colors[index % colors.length];
};

// ✅ معالج WidgetButtons
const handleMoreClick = (action) => {
  switch(action) {
    case 'refresh':
      break;
    case 'exportPDF':
      break;
    case 'exportCSV':
      break;
    case 'exportImage':
      break;
    case 'settings':
      break;
    default:
      break;
  }
};

const PaymentMethodsChart = ({ darkMode, paymentMethods }) => {
  // ✅ تنسيق العملة
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // ✅ حساب الإجمالي
  const totalAmount = paymentMethods?.reduce((sum, method) => sum + method.amount, 0) || 0;
  
  // ✅ العثور على الطريقة الأكثر استخداماً
  const mostPopularMethod = paymentMethods?.reduce((prev, current) => 
    (prev.amount > current.amount) ? prev : current
  , paymentMethods?.[0]);

  // ✅ إذا لم توجد بيانات
  if (!paymentMethods || paymentMethods.length === 0) {
    return (
      <div className={`rounded-2xl p-6 text-center ${darkMode 
        ? 'bg-neutral-900/50 border border-neutral-800' 
        : 'bg-white border border-neutral-200 shadow-lg'}`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'}`}>
            <CreditCard size={32} className={darkMode ? 'text-neutral-600' : 'text-neutral-400'} />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              No Payment Methods Data
            </h3>
            <p className={`text-sm mt-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Add orders with payment methods to see distribution
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-5 ${
      darkMode 
        ? 'bg-gradient-to-br from-neutral-900 to-neutral-800 border-neutral-800' 
        : 'bg-white border-neutral-100'
    } shadow-lg border hover:shadow-xl transition-shadow duration-300`}>
      
      {/* ✅ Header مع WidgetButtons */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${
            darkMode ? 'bg-[#8B7ABA]/20' : 'bg-primary-100'
          }`}>
            <CreditCard className="w-5 h-5 text-primary-300" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
              Payment Methods
            </h3>
            <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Revenue distribution by payment method
            </p>
          </div>
        </div>
        
        {/* ✅ WidgetButtons مع Refresh */}
        <WidgetButtons
          darkMode={darkMode}
          type="mixed"
          customButtons={['more']}
          onMoreClick={handleMoreClick}
        />
      </div>
      
      {/* ✅ Progress Bars - نفس التصميم الأصلي */}
      <div className="space-y-2 px-4">
        {paymentMethods?.map((method, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-2.5 h-2.5 rounded-full ring-2 ring-offset-2 ring-offset-transparent"
                  style={{ 
                    backgroundColor: getPaymentColor(method.method, index),
                    boxShadow: darkMode ? '0 0 10px rgba(139, 122, 186, 0.3)' : 'none'
                  }}
                ></div>
                <span className={`font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                  {method.method}
                </span>
              </div>
              <div className="text-right">
                <span className={`font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                  {method.percentage}%
                </span>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  {formatAmount(method.amount)}
                </p>
              </div>
            </div>
            
            {/* ✅ Progress bar - نفس التصميم الأصلي */}
            <div className={`w-full h-1.5 rounded-full ${
              darkMode ? 'bg-neutral-800' : 'bg-neutral-100'
            } overflow-hidden`}>
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out relative"
                style={{ 
                  width: `${method.percentage}%`,
                  background: `linear-gradient(90deg, ${getPaymentColor(method.method, index)}, ${
                    index === 0 ? '#8B7ABA' : 
                    index === 1 ? '#F08FAE' : 
                    index === 2 ? '#99E7CD' : '#F6CDB5'
                  })`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* ✅ Most popular method - نفس التصميم الأصلي */}
      <div className={`mt-5 py-3.5 px-5 rounded-xl ${
        darkMode 
          ? 'bg-neutral-800/50 border border-neutral-700/30' 
          : 'bg-gradient-to-r from-neutral-50 to-white border border-neutral-100'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#8B7ABA]/20">
              <Star className="w-5 h-5 text-[#8B7ABA]" />
            </div>
            <div>
              <p className={`text-base font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                {mostPopularMethod?.method}
              </p>
              <p className={`text-xs tracking-wider ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                Most Popular Method
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#8B7ABA]">
              {mostPopularMethod?.percentage}%
            </p>
            <p className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
              of total revenue
            </p>
          </div>
        </div>
        
        {/* ✅ Mini bar chart - نفس التصميم الأصلي */}
        <div className={`w-full h-1.5 rounded-full ${darkMode ? 'bg-neutral-700' : 'bg-neutral-200'} mb-4`}>
          <div 
            className="h-full rounded-full"
            style={{ 
              width: `${mostPopularMethod?.percentage}%`,
              backgroundColor: '#8B7ABA'
            }}
          ></div>
        </div>
        
        {/* ✅ Total revenue - نفس التصميم الأصلي */}
        <div className={`flex justify-between items-center pt-3 border-t ${
          darkMode ? 'border-neutral-700' : 'border-neutral-200'
        }`}>
          <div className="flex items-center gap-2">
            <Wallet className={`w-4 h-4 ${darkMode ? 'text-neutral-600' : 'text-neutral-400'}`} />
            <span className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
              Total Revenue
            </span>
          </div>
          <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
            {formatAmount(totalAmount)}
          </span>
        </div>
      </div>
      
     
    </div>
  );
};

export default PaymentMethodsChart;