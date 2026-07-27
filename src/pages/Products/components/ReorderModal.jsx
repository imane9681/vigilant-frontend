// src/pages/Products/components/ReorderModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, Package, DollarSign, Truck, Calendar, User, 
  AlertCircle, CheckCircle, Clock, Plus, Minus,
  TrendingUp, ShoppingCart, Send
} from 'lucide-react';

const ReorderModal = ({ darkMode, product, onClose, onConfirm, isOpen }) => {
  // ✅ ألوان المشروع
  const colors = {
    primary: '#8B7ABA',
    secondary: '#F08FAE',
    accent: '#EE9C6C',
    success: '#34D19C'
  };

  const [quantity, setQuantity] = useState(10);
  const [supplier, setSupplier] = useState('');
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      const suggestedQuantity = product.currentStock > 0 
        ? Math.max(10, Math.ceil(product.currentStock * 1.5))
        : 20;
      setQuantity(suggestedQuantity);
      setSupplier(product.supplier || '');
      setPriority(product.currentStock === 0 ? 'high' : 'medium');
      setNotes('');
      setSuccess(false);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const unitCost = product.price || 0;
  const totalCost = quantity * unitCost;
  const isLowStock = product.currentStock <= 10;
  const isOutOfStock = product.currentStock === 0;

  // ✅ تحديد لون الحالة
  const getStatusColor = () => {
    if (isOutOfStock) return colors.secondary;
    if (isLowStock) return colors.accent;
    return colors.primary;
  };

  const getStatusIcon = () => {
    if (isOutOfStock) return <AlertCircle size={18} />;
    if (isLowStock) return <AlertCircle size={18} />;
    return <CheckCircle size={18} />;
  };

  const getStatusText = () => {
    if (isOutOfStock) return 'Out of Stock - Urgent!';
    if (isLowStock) return 'Low Stock - Recommended';
    return 'In Stock - Preemptive';
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const orderData = {
        product: product,
        quantity: quantity,
        supplier: supplier,
        priority: priority,
        notes: notes,
        totalCost: totalCost,
        orderedAt: new Date().toISOString()
      };
      
      onConfirm(orderData);
      setSuccess(true);
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ دالة للحصول على ألوان الأولوية
  const getPriorityColors = (priorityLevel) => {
    switch(priorityLevel) {
      case 'high':
        return {
          bg: darkMode ? 'bg-rose-900/30' : 'bg-rose-100',
          text: darkMode ? 'text-rose-400' : 'text-rose-700',
          border: darkMode ? 'border-rose-800/30' : 'border-rose-200',
          activeBg: darkMode ? 'bg-rose-600' : 'bg-rose-500',
          activeText: 'text-white',
          shadow: 'shadow-rose-500/30'
        };
      case 'medium':
        return {
          bg: darkMode ? 'bg-amber-900/30' : 'bg-amber-100',
          text: darkMode ? 'text-amber-400' : 'text-amber-700',
          border: darkMode ? 'border-amber-800/30' : 'border-amber-200',
          activeBg: darkMode ? 'bg-amber-600' : 'bg-amber-500',
          activeText: 'text-white',
          shadow: 'shadow-amber-500/30'
        };
      case 'low':
        return {
          bg: darkMode ? 'bg-emerald-900/30' : 'bg-emerald-100',
          text: darkMode ? 'text-emerald-400' : 'text-emerald-700',
          border: darkMode ? 'border-emerald-800/30' : 'border-emerald-200',
          activeBg: darkMode ? 'bg-emerald-600' : 'bg-emerald-500',
          activeText: 'text-white',
          shadow: 'shadow-emerald-500/30'
        };
      default:
        return {
          bg: darkMode ? 'bg-neutral-800' : 'bg-neutral-100',
          text: darkMode ? 'text-neutral-400' : 'text-neutral-600',
          border: darkMode ? 'border-neutral-700' : 'border-neutral-200',
          activeBg: darkMode ? 'bg-neutral-600' : 'bg-neutral-500',
          activeText: 'text-white',
          shadow: 'shadow-neutral-500/30'
        };
    }
  };

  const currentPriorityColors = getPriorityColors(priority);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div 
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl transform transition-all duration-300 
          ${darkMode ? 'bg-neutral-800 border border-neutral-700' : 'bg-white'}
          ${success ? 'scale-95' : 'scale-100'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-xl"
              style={{ 
                backgroundColor: isOutOfStock ? `${colors.secondary}20` : 
                               isLowStock ? `${colors.accent}20` : 
                               `${colors.primary}20`
              }}
            >
              <Truck 
                size={22} 
                style={{ 
                  color: isOutOfStock ? colors.secondary : 
                         isLowStock ? colors.accent : 
                         colors.primary 
                }} 
              />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                Reorder Product
              </h2>
              <p className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                {product.name}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            disabled={loading}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100'}`}
          >
            <X size={20} className={darkMode ? 'text-neutral-400' : 'text-neutral-500'} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Status Badge */}
          <div 
            className="p-4 rounded-xl border"
            style={{ 
              backgroundColor: isOutOfStock ? `${colors.secondary}10` : 
                             isLowStock ? `${colors.accent}10` : 
                             `${colors.primary}10`,
              borderColor: isOutOfStock ? `${colors.secondary}30` : 
                          isLowStock ? `${colors.accent}30` : 
                          `${colors.primary}30`
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span style={{ color: getStatusColor() }}>
                  {getStatusIcon()}
                </span>
                <span 
                  className="text-sm font-medium"
                  style={{ color: getStatusColor() }}
                >
                  {getStatusText()}
                </span>
              </div>
              <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                {product.currentStock} units
              </span>
            </div>
          </div>
          
          {/* Quantity Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              <Package size={14} className="inline mr-2" />
              Reorder Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 5))}
                disabled={loading}
                className={`p-2 rounded-lg transition-all hover:scale-110
                  ${darkMode ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-neutral-100 hover:bg-neutral-200'}`}
              >
                <Minus size={18} className={darkMode ? 'text-neutral-300' : 'text-neutral-600'} />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                disabled={loading}
                className={`w-24 px-4 py-2 text-center rounded-lg border focus:outline-none focus:ring-2
                  ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200 text-neutral-900'}`}
                style={{ '--tw-ring-color': colors.primary }}
                min="1"
              />
              <button
                onClick={() => setQuantity(quantity + 5)}
                disabled={loading}
                className={`p-2 rounded-lg transition-all hover:scale-110
                  ${darkMode ? 'bg-neutral-700 hover:bg-neutral-600' : 'bg-neutral-100 hover:bg-neutral-200'}`}
              >
                <Plus size={18} className={darkMode ? 'text-neutral-300' : 'text-neutral-600'} />
              </button>
              <button
                onClick={() => setQuantity(product.currentStock > 0 ? Math.ceil(product.currentStock * 1.5) : 20)}
                disabled={loading}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105
                  ${darkMode ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                style={{ 
                  backgroundColor: darkMode ? `${colors.primary}20` : `${colors.primary}15`,
                  color: colors.primary
                }}
              >
                Suggested
              </button>
            </div>
          </div>
          
          {/* Supplier Selection */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              <User size={14} className="inline mr-2" />
              Supplier
            </label>
            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              disabled={loading}
              className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2
                ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200 text-neutral-900'}`}
              style={{ '--tw-ring-color': colors.primary }}
            >
              <option value="">Select Supplier</option>
              <option value="TechDistributors">Tech Distributors</option>
              <option value="GlobalSupply">Global Supply Co.</option>
              <option value="DirectSource">Direct Source Inc.</option>
              <option value="WholesalePro">Wholesale Pro</option>
            </select>
          </div>
          
          {/* Priority */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              <Calendar size={14} className="inline mr-2" />
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPriority('high')}
                disabled={loading}
                className={`py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-105
                  ${priority === 'high' 
                    ? `bg-rose-500 text-white shadow-lg shadow-rose-500/30` 
                    : darkMode ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
              >
                <AlertCircle size={14} className="inline mr-1.5" />
                High
              </button>
              <button
                onClick={() => setPriority('medium')}
                disabled={loading}
                className={`py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-105
                  ${priority === 'medium' 
                    ? `bg-amber-500 text-white shadow-lg shadow-amber-500/30` 
                    : darkMode ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
              >
                <Clock size={14} className="inline mr-1.5" />
                Medium
              </button>
              <button
                onClick={() => setPriority('low')}
                disabled={loading}
                className={`py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-105
                  ${priority === 'low' 
                    ? `bg-emerald-500 text-white shadow-lg shadow-emerald-500/30` 
                    : darkMode ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
              >
                <CheckCircle size={14} className="inline mr-1.5" />
                Low
              </button>
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              rows="2"
              className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 resize-none
                ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' : 'bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400'}`}
              style={{ '--tw-ring-color': colors.primary }}
              placeholder="Add any special instructions for the supplier..."
            />
          </div>
          
          {/* Cost Summary */}
          <div 
            className="p-4 rounded-xl"
            style={{ 
              backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
            }}
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Unit Cost</span>
              <span className={`font-bold ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                ${unitCost.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-600">
              <span className={`text-sm font-medium ${darkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>Total Cost</span>
              <span className="text-xl font-bold" style={{ color: colors.primary }}>
                ${totalCost.toFixed(2)}
              </span>
            </div>
            {quantity > 0 && (
              <div className="flex items-center justify-between mt-1">
                <span className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>Per unit savings</span>
                <span className="text-xs font-medium" style={{ color: colors.success }}>
                  ${(unitCost * 0.05).toFixed(2)} (5% bulk discount)
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className={`flex justify-end gap-3 p-6 border-t ${darkMode ? 'border-neutral-700' : 'border-neutral-200'}`}>
          <button
            onClick={onClose}
            disabled={loading}
            className={`px-4 py-2.5 rounded-lg font-medium transition-all hover:scale-105
              ${darkMode ? 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'}`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !supplier}
            className={`px-6 py-2.5 rounded-lg font-medium text-white transition-all hover:scale-105 
              flex items-center gap-2 shadow-lg hover:shadow-xl
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ 
              backgroundColor: isOutOfStock ? colors.secondary : 
                             isLowStock ? colors.accent : 
                             colors.primary,
              boxShadow: isOutOfStock ? `0 8px 25px -5px ${colors.secondary}60` :
                        isLowStock ? `0 8px 25px -5px ${colors.accent}60` :
                        `0 8px 25px -5px ${colors.primary}60`
            }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : success ? (
              <>
                <CheckCircle size={18} />
                Ordered!
              </>
            ) : (
              <>
                <ShoppingCart size={18} />
                Place Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReorderModal;